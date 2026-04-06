import { Injectable, Logger } from '@nestjs/common';
import { CacheManagerService } from 'src/modules/cache/cache-manager.service';
import { FranceTravailProvider } from './providers/france-travail/france-travail.provider';
import {
  IAggregatedProviderResult,
  IAggregatedSearchResult,
  EOfferJobboardOrigin,
  EProviderStatus,
  IOfferListItem,
  IOfferProvider,
  IOfferSearchFilters,
  IProviderSourceStatus,
  TProviderSearchFilters,
} from './types';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);
  private readonly providers: IOfferProvider[];
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly cacheManagerService: CacheManagerService,
    private readonly franceTravailProvider: FranceTravailProvider,
  ) {
    this.providers = [franceTravailProvider];
  }

  // ═══════════════════════════════════════════
  //                  PUBLIC API
  // ═══════════════════════════════════════════

  async search(filters: IOfferSearchFilters): Promise<IAggregatedSearchResult> {
    const { page, limit, jobboard, ...searchFilters } = filters;

    // Get all Providers available and filter by jobboard if needed
    const activeProviders = this.__getAvailableProviders(jobboard);

    //Get offers from active providers with searchFilters
    const results = await this.__fetchAllProviders(activeProviders, searchFilters);

    //Format & regroup results adn create sources with result for each Providers  
    const { offers, sources } = this.__aggregateResults(activeProviders, results);

    //Sort offers by the most recent publications
    const sortedOffers = this.__sortByDate(offers);

    //Return slice offers & meta data for pagination & providers
    return this.__paginate(sortedOffers, sources, page, limit);
  }

  // ═══════════════════════════════════════════
  //              PROVIDER SELECTION
  // ═══════════════════════════════════════════

  private __getAvailableProviders(
    jobboardFilter?: EOfferJobboardOrigin[],
  ): IOfferProvider[] {
    const available = this.providers.filter((p) => p.isAvailable());
    if (!jobboardFilter?.length) return available;

    return available.filter((provider) =>
      provider.jobboards.some((jb) => jobboardFilter.includes(jb)),
    );
  }

  // ═══════════════════════════════════════════
  //              FETCH ALL PROVIDERS
  // ═══════════════════════════════════════════

  private __fetchAllProviders(
    providers: IOfferProvider[],
    filters: TProviderSearchFilters,
  ): Promise<PromiseSettledResult<IOfferListItem[]>[]> {

    return Promise.allSettled(
      providers.map((provider) =>
        this.__fetchFromProviderWithCache(provider, filters),
      ),
    );
  }

  // ═══════════════════════════════════════════
  //              FETCH + CACHE
  // ═══════════════════════════════════════════

  private async __fetchFromProviderWithCache(
    provider: IOfferProvider,
    filters: TProviderSearchFilters,
  ): Promise<IOfferListItem[]> {

    const cacheKey = this.cacheManagerService.buildCacheKey(
      'offer',
      provider.name,
      JSON.stringify(filters, Object.keys(filters).sort()),
      true,
    );

    const cached = await this.cacheManagerService.get<IOfferListItem[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for provider ${provider.name}`);
      return cached;
    }

    // Provider call 
    const offers = await provider.search(filters,this.BATCH_SIZE);

    await this.cacheManagerService.set(cacheKey, offers, provider.cacheTtl * 1000);

    this.logger.debug(
      `Fetched ${offers.length} offers from ${provider.name}, cached for ${provider.cacheTtl}s`,
    );

    return offers;
  }

  // ═══════════════════════════════════════════
  //              AGGREGATION
  // ═══════════════════════════════════════════

  private __aggregateResults(
    providers: IOfferProvider[],
    results: PromiseSettledResult<IOfferListItem[]>[],
  ): IAggregatedProviderResult {
    const offers: IOfferListItem[] = [];
    const sources: IProviderSourceStatus[] = [];

    results.forEach((result, i) => {
      const provider = providers[i];

      if (result.status === 'fulfilled') {
        offers.push(...result.value);
        sources.push({
          apiProvider: provider.name,
          status: EProviderStatus.SUCCESS,
          count: result.value.length,
        });
      } else {
        this.logger.error(`Provider ${provider.name} failed: ${result.reason}`);
        sources.push({
          apiProvider: provider.name,
          status: EProviderStatus.ERROR,
          count: 0,
          message: result.reason?.message ?? 'Unknown error',
        });
      }
    });

    return { offers, sources };
  }

  // ═══════════════════════════════════════════
  //              SORT + PAGINATE
  // ═══════════════════════════════════════════

  private __sortByDate(offers: IOfferListItem[]): IOfferListItem[] {
    return [...offers].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  private __paginate(
    offers: IOfferListItem[],
    sources: IProviderSourceStatus[],
    page: number,
    limit: number,
  ): IAggregatedSearchResult {

    const start = (page - 1) * limit;

    return {
      offers: offers.slice(start, start + limit),
      meta: {
        total: offers.length,
        page,
        limit,
        sources,
      },
    };
  }
}