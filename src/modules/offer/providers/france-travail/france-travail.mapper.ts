import {
  EContractType,
  EExperienceLevel,
  EOfferAPiProvider,
  EOfferJobboardOrigin,
  IExperienceInfo,
  ILocation,
  IOfferListItem,
  ISalary,
  TProviderSearchFilters,
} from '../../types';
import { IFranceTravailRawOffer, IFranceTravailQueryParams, TFTContractType, TFTExperience }
  from './types';
import { v5 as uuidv5 } from 'uuid';
import { OFFER_ID_NAMESPACE } from '../../constant';

// ═══════════════════════════════════════════
//         QUERY PARAMS MAPPING
//         IOfferSearchFilters → FT params
// ═══════════════════════════════════════════

export abstract class FranceTravailMapper {
  /**
   *  Mapping  : Generic filter → FT query params
   */
  static toProviderParams(filters: TProviderSearchFilters): IFranceTravailQueryParams {

    const { keyword, region, city, postalCode, contractType, experience, publishedSince } = filters;
    const regionCode = region ?? (postalCode ? postalCode.slice(0, 2) : undefined);

    const params: IFranceTravailQueryParams = {

      motsCles: keyword,
      /* Address  fields */
      ...(city && { commune: city }),
      ...(regionCode && { region: regionCode }),

      /* Contract fields */
      ...this.toContractParams(contractType),

      ...(experience && { experience: this.toExperience(experience) }),

      ...(publishedSince && { minCreationDate: this.toMinCreationDate(publishedSince) }),

    };


    return params;
  }

  // ═══════════════════════════════════════════
  //         RESPONSE MAPPING
  //        
  // ═══════════════════════════════════════════

  /**
   *  FT offer  → generic offer
   */
  static toOfferListItem(offer: IFranceTravailRawOffer, baseDetailUrl: string): IOfferListItem {
    return {
      id: this.generateId(offer.id),
      externalId: offer.id,
      title: offer.intitule,
      company: offer.entreprise?.nom,
      location: this.mapLocation(offer),
      contractType: this.mapContractType(offer),
      salary: this.mapSalary(offer),
      publishedAt: offer.dateCreation,
      url: offer.origineOffre?.urlOrigine ?? this.buildFallbackUrl(offer.id, baseDetailUrl),
      jobboard: EOfferJobboardOrigin.FRANCE_TRAVAIL,
      apiProvider: EOfferAPiProvider.FRANCE_TRAVAIL,
      experience: this.mapExperience(offer),
      skills: this.mapSkills(offer),
    };
  }

  /**
   * array of FT offer →  array of generic offer
   */
  static toOfferListItems(rawOffers: IFranceTravailRawOffer[], baseDetailUrl: string): IOfferListItem[] {
    return rawOffers.map((raw) => this.toOfferListItem(raw, baseDetailUrl));
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — ID
  // ═══════════════════════════════════════════

  private static generateId(externalId: string): string {
    return uuidv5(`${EOfferAPiProvider.FRANCE_TRAVAIL}:${externalId}`, OFFER_ID_NAMESPACE)

  }

  // ═══════════════════════════════════════════
  //         PRIVATE — CONTRACT TYPE
  // ═══════════════════════════════════════════

  private static readonly CONTRACT_TYPE_MAP: Record<string, EContractType> = {
    CDI: EContractType.CDI,
    CDD: EContractType.CDD,
    LIB: EContractType.FREELANCE,
  };

  private static mapContractType(offer: IFranceTravailRawOffer): EContractType | undefined {

    if (offer.alternance) return EContractType.ALTERNANCE;

    if (!offer.typeContrat) return undefined;

    return this.CONTRACT_TYPE_MAP[offer.typeContrat];
  }

  // Mapping  : Generic filter → FT query params
  private static toContractParams(type?: EContractType): Partial<Pick<IFranceTravailQueryParams, 'typeContrat' | 'natureContrat'>> {
    if (!type) return {};

    if (type === EContractType.ALTERNANCE) {
      return { natureContrat: 'E2,FS' };
      // E2 : apprenticeship contract
      // FS : professional contract
    }

    const map: Record<string, TFTContractType> = {
      [EContractType.CDI]: 'CDI',
      [EContractType.CDD]: 'CDD',
      [EContractType.FREELANCE]: 'LIB',
    };

    return map[type] ? { typeContrat: map[type] } : {};
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — LOCATION
  // ═══════════════════════════════════════════
  private static mapLocation(offer: IFranceTravailRawOffer): ILocation | undefined {
    if (!offer.lieuTravail?.libelle) return undefined;
    return { raw: offer.lieuTravail?.libelle };
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — EXPERIENCE
  // ═══════════════════════════════════════════

  private static mapExperience(offer: IFranceTravailRawOffer): IExperienceInfo | undefined {
    if (!offer.experienceLibelle) return undefined;
    return { raw: offer.experienceLibelle };
  }

  // Mapping  : Generic filter → FT query params
  private static toExperience(level: EExperienceLevel): TFTExperience {
    const map: Record<EExperienceLevel, string> = {
      [EExperienceLevel.JUNIOR]: '1', // < 1 year
      [EExperienceLevel.MID]: '2', // 1 - 3 years
      [EExperienceLevel.SENIOR]: '3', // > 3 years
    };
    return map[level] as TFTExperience;
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — SALARY
  // ═══════════════════════════════════════════

  /**
   * Map salary by hour : month : year : salary by year
   */
  private static mapSalary(offer: IFranceTravailRawOffer): ISalary | undefined {
    const libelle = offer.salaire?.libelle;
    const commentaire = offer.salaire?.commentaire;

    if (!libelle && !commentaire) return undefined;

    const rawText = libelle ?? commentaire ?? '';

    const parsed = this.parseSalaryLibelle(rawText);

    if (parsed) return parsed;

    // Fallback : on retourne le texte brut
    return { raw: rawText };
  }

  private static parseSalaryLibelle(libelle: string): ISalary | null {
    const lower = libelle.toLowerCase();

    const amounts = [...libelle.matchAll(/(\d+(?:\.\d+)?)\s*euros/gi)]
      .map((m) => parseFloat(m[1]));

    if (amounts.length === 0) return null;

    let min = amounts[0];
    let max = amounts.length > 1 ? amounts[1] : undefined;

    // Normalisation vers annuel brut (base 35h pour l'horaire)
    if (lower.includes('horaire')) {
      min = Math.round((min * 35 * 52) / 1000) * 1000;
      if (max) max = Math.round((max * 35 * 52) / 1000) * 1000;
    } else if (lower.includes('mensuel')) {
      min = Math.round(min * 12);
      if (max) max = Math.round(max * 12);
    }

    return { min, max, raw: libelle };
  }
  // ═══════════════════════════════════════════
  //         PRIVATE — SKILLS
  // ═══════════════════════════════════════════

  private static mapSkills(offer: IFranceTravailRawOffer): string[] {
    if (!offer.competences?.length) return [];

    return offer.competences
      .map((c) => c.libelle);
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — PUBLISHED SINCE
  // ═══════════════════════════════════════════

  // Mapping  : Generic filter → FT query params
  private static toMinCreationDate(since: '24h' | '7d' | '14d'): string {
    const now = new Date();

    const offsets: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '14d': 14 * 24 * 60 * 60 * 1000,
    };

    const date = new Date(now.getTime() - offsets[since]);
    return date.toISOString();
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — UTILS
  // ═══════════════════════════════════════════

  private static buildFallbackUrl(id: string, baseUrl: string): string {
    return `${baseUrl}/${id}`;
  }
}