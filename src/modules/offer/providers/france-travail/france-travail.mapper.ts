import {
  EContractType,
  EExperienceLevel,
  EOfferApiProvider,
  EOfferJobboardOrigin,
  EPublishedSince,
  IExperienceInfo,
  ILocation,
  IOfferListItem,
  ISalary,
  TProviderSearchFilters,
} from '../../types';
import {
  IFranceTravailRawOffer,
  IFranceTravailQueryParams,
  TFTContractType,
  TFTExperience,
} from './types';
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
  static toProviderParams(
    filters: TProviderSearchFilters,
  ): IFranceTravailQueryParams {
    const {
      keyword,
      cityCode,
      departmentCode,
      regionCode,
      contractType,
      experience,
      publishedSince,
    } = filters;

    const params: IFranceTravailQueryParams = {
      motsCles: keyword,
      // FT expects INSEE codes. Only the most specific scope is sent —
      // commune already implies its department/region; sending all three
      // is redundant and FT may reject the payload.
      ...this.toLocationParams(cityCode, departmentCode, regionCode),

      /* Contract fields */
      ...this.toContractParams(contractType),

      ...(experience && { experience: this.toExperience(experience) }),

      ...(publishedSince && {
        minCreationDate: this.toMinCreationDate(publishedSince),
      }),
    };

    return params;
  }

  // INSEE consolidated codes for Paris/Lyon/Marseille that FT's commune
  // referential rejects (FT only accepts the per-arrondissement codes).
  // Per FT doc, searching by département returns all offers of these cities.
  private static readonly FT_COMMUNE_TO_DEPARTMENT_FALLBACK: Record<
    string,
    string
  > = {
    '75056': '75', // Paris
    '69123': '69', // Lyon
    '13055': '13', // Marseille
  };

  private static toLocationParams(
    cityCode?: string,
    departmentCode?: string,
    regionCode?: string,
  ): Pick<IFranceTravailQueryParams, 'commune' | 'departement' | 'region'> {
    if (cityCode) {
      const fallbackDept = this.FT_COMMUNE_TO_DEPARTMENT_FALLBACK[cityCode];
      if (fallbackDept) return { departement: departmentCode ?? fallbackDept };
      return { commune: cityCode };
    }
    if (departmentCode) return { departement: departmentCode };
    if (regionCode) return { region: regionCode };
    return {};
  }

  // ═══════════════════════════════════════════
  //         RESPONSE MAPPING
  //
  // ═══════════════════════════════════════════

  /**
   *  FT offer  → generic offer
   */
  static toOfferListItem(
    offer: IFranceTravailRawOffer,
    baseDetailUrl: string,
  ): IOfferListItem {
    return {
      id: this.generateId(offer.id),
      externalId: offer.id,
      title: offer.intitule,
      company: offer.entreprise?.nom,
      location: this.mapLocation(offer),
      contractType: this.mapContractType(offer),
      salary: this.mapSalary(offer),
      publishedAt: offer.dateCreation,
      url:
        offer.origineOffre?.urlOrigine ??
        this.buildFallbackUrl(offer.id, baseDetailUrl),
      jobboard: EOfferJobboardOrigin.FRANCE_TRAVAIL,
      apiProvider: EOfferApiProvider.FRANCE_TRAVAIL,
      experience: this.mapExperience(offer),
      skills: this.mapSkills(offer),
    };
  }

  /**
   * array of FT offer →  array of generic offer
   */
  static toOfferListItems(
    rawOffers: IFranceTravailRawOffer[],
    baseDetailUrl: string,
  ): IOfferListItem[] {
    return rawOffers.map((raw) => this.toOfferListItem(raw, baseDetailUrl));
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — ID
  // ═══════════════════════════════════════════

  private static generateId(externalId: string): string {
    return uuidv5(
      `${EOfferApiProvider.FRANCE_TRAVAIL}:${externalId}`,
      OFFER_ID_NAMESPACE,
    );
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — CONTRACT TYPE
  // ═══════════════════════════════════════════

  private static readonly CONTRACT_TYPE_MAP: Record<string, EContractType> = {
    CDI: EContractType.CDI,
    CDD: EContractType.CDD,
    LIB: EContractType.FREELANCE,
  };

  private static mapContractType(
    offer: IFranceTravailRawOffer,
  ): EContractType | undefined {
    if (offer.alternance) return EContractType.ALTERNANCE;

    if (!offer.typeContrat) return undefined;

    return this.CONTRACT_TYPE_MAP[offer.typeContrat];
  }

  // Mapping  : Generic filter → FT query params
  private static toContractParams(
    type?: EContractType,
  ): Partial<Pick<IFranceTravailQueryParams, 'typeContrat' | 'natureContrat'>> {
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
  private static mapLocation(
    offer: IFranceTravailRawOffer,
  ): ILocation | undefined {
    const lieu = offer.lieuTravail;
    if (!lieu?.libelle && !lieu?.codePostal) return undefined;

    const city = this.parseCityFromLibelle(lieu.libelle);
    const department = lieu.codePostal?.slice(0, 2);

    return {
      ...(city && { city }),
      ...(lieu.codePostal && { postalCode: lieu.codePostal }),
      ...(department && { department }),
      raw: lieu.libelle,
    };
  }

  /**
   * Parse city name from FT libelle format: "75 - Paris 11e Arrondissement" → "Paris 11e Arrondissement"
   */
  private static parseCityFromLibelle(libelle?: string): string | undefined {
    if (!libelle) return undefined;
    // FT format: "XX - Ville" where XX is department code
    const match = libelle.match(/^\d+\s*-\s*(.+)$/);
    return match?.[1]?.trim();
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — EXPERIENCE
  // ═══════════════════════════════════════════

  private static mapExperience(
    offer: IFranceTravailRawOffer,
  ): IExperienceInfo | undefined {
    const libelle = offer.experienceLibelle;
    const exige = offer.experienceExige;

    if (!libelle && !exige) return undefined;

    const years = this.parseExperienceYears(libelle);
    const level = this.resolveExperienceLevel(years, exige);
    const raw = this.formatExperienceRaw(years, libelle, exige);

    return { ...(level && { level }), raw };
  }

  /**
   * Extract years from FT experienceLibelle: "5 An(s)" → 5, "Débutant accepté" → null
   */
  private static parseExperienceYears(libelle?: string): number | null {
    if (!libelle) return null;
    const match = libelle.match(/(\d+)\s*an/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Map to EExperienceLevel using years (primary) or experienceExige (fallback)
   *   years: 0-1 → JUNIOR, 2-3 → MID, 4+ → SENIOR
   *   exige: D (Débutant) → JUNIOR, S (Souhaitée) → MID, E (Exigée) → SENIOR
   */
  private static resolveExperienceLevel(
    years: number | null,
    exige?: string,
  ): EExperienceLevel | undefined {
    if (years !== null) {
      if (years <= 1) return EExperienceLevel.JUNIOR;
      if (years <= 3) return EExperienceLevel.MID;
      return EExperienceLevel.SENIOR;
    }

    const exigeMap: Record<string, EExperienceLevel> = {
      D: EExperienceLevel.JUNIOR,
      S: EExperienceLevel.MID,
      E: EExperienceLevel.SENIOR,
    };
    return exige ? exigeMap[exige] : undefined;
  }

  /**
   * Build a readable label from FT
   *   "0 An(s)" → "Débutant accepté"
   *   "3 An(s)" → "3 ans d'expérience"
   *   exige="D" (no libelle) → "Débutant accepté"
   */
  private static formatExperienceRaw(
    years: number | null,
    libelle?: string,
    exige?: string,
  ): string {
    if (libelle?.toLowerCase().includes('débutant')) return 'Débutant accepté';

    if (years !== null) {
      if (years === 0) return 'Débutant accepté';
      return `${years} ${years === 1 ? 'an' : 'ans'} d'expérience`;
    }

    if (libelle) return libelle;

    const exigeLabels: Record<string, string> = {
      D: 'Débutant accepté',
      S: 'Expérience souhaitée',
      E: 'Expérience exigée',
    };
    return exigeLabels[exige ?? ''] ?? 'Non précisé';
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

    const amounts = [...libelle.matchAll(/(\d+(?:\.\d+)?)\s*euros/gi)].map(
      (m) => parseFloat(m[1]),
    );

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

    return offer.competences.map((c) => c.libelle);
  }

  // ═══════════════════════════════════════════
  //         PRIVATE — PUBLISHED SINCE
  // ═══════════════════════════════════════════

  // Mapping  : Generic filter → FT query params
  private static toMinCreationDate(since: EPublishedSince): string {
    const now = new Date();

    const offsets: Record<EPublishedSince, number> = {
      [EPublishedSince.LAST_24H]: 24 * 60 * 60 * 1000,
      [EPublishedSince.LAST_7D]: 7 * 24 * 60 * 60 * 1000,
      [EPublishedSince.LAST_14D]: 14 * 24 * 60 * 60 * 1000,
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
