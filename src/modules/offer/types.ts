// ═══════════════════════════════════════════
//                  ENUMS
// ═══════════════════════════════════════════

export enum EContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  FREELANCE = 'FREELANCE',
  ALTERNANCE = 'ALTERNANCE',
}

export enum ERemotePolicy {
  FULL = 'FULL',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum EExperienceLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
}

export enum EOfferJobboardOrigin {
  FRANCE_TRAVAIL = 'FRANCE_TRAVAIL',
  WTTJ = 'WTTJ',
  HELLOWORK = 'HELLOWORK',
  UNKNOWN = 'UNKNOWN',
}

export enum EOfferAPiProvider {
  FRANCE_TRAVAIL = 'FRANCE_TRAVAIL',
  APIFY = 'APIFY',
}

export enum EProviderStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

// ═══════════════════════════════════════════
//                  INTERFACE
// ═══════════════════════════════════════════

export interface ILocation {
  city?: string;
  postalCode?: string;
  department?: string;
  region?: string;
  raw?: string;
}

// If mapping to salary failed it set the raw in fallback
export interface ISalary {
  min?: number;
  max?: number;
  raw?: string;
}

// If mapping to exp failed it set the raw in fallback
export interface IExperienceInfo {
  level?: EExperienceLevel;
  raw?: string;
}

// ═══════════════════════════════════════════
//          OFFER - LIST
// ═══════════════════════════════════════════

export interface IOfferListItem {
  id: string; // hash(provider + externalId)
  externalId?: string;
  title: string;
  company?: string;
  location?: ILocation;
  contractType?: EContractType;
  salary?: ISalary;
  remote?: ERemotePolicy;
  publishedAt: string; // ISO-8601
  url: string;
  jobboard: EOfferJobboardOrigin;
  apiProvider: EOfferAPiProvider;
  experience?: IExperienceInfo;
  skills: string[];
}

// ═══════════════════════════════════════════
//        OFFERS - FILTERS
// ═══════════════════════════════════════════

export interface IOfferSearchFilters {
  keyword: string;
  city?: string;
  region?: string;
  postalCode?: string;
  contractType?: EContractType;
  remote?: ERemotePolicy;
  experience?: EExperienceLevel;
  publishedSince?: '24h' | '7d' | '14d';
  jobboard?: EOfferJobboardOrigin[];
  page: number; // default 1
  limit: number; // default 20
}

// ═══════════════════════════════════════════
//      AGREGATE RESPONSE
// ═══════════════════════════════════════════

export interface IProviderSourceStatus {
  apiProvider: EOfferAPiProvider;
  status: EProviderStatus;
  count: number;
  message?: string;
}

export interface IAggregatedSearchResult {
  offers: IOfferListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    sources: IProviderSourceStatus[];
  };
}

export interface IAggregatedProviderResult {
  offers: IOfferListItem[];
  sources: IProviderSourceStatus[];
}

// ═══════════════════════════════════════════
//                PROVIDER
// ═══════════════════════════════════════════

// Filtres passés aux providers (sans pagination ni sélection de jobboard — géré par l'orchestrateur)
export type TProviderSearchFilters = Omit<
  IOfferSearchFilters,
  'page' | 'limit' | 'jobboard'
>;

export interface IOfferProvider {
  readonly name: EOfferAPiProvider;
  readonly jobboards: EOfferJobboardOrigin[];
  readonly cacheTtl: number; // in sec
  search(filters: TProviderSearchFilters, maxResults: number): Promise<IOfferListItem[]>;
  isAvailable(): boolean;
}
