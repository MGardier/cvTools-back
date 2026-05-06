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

export enum EOfferApiProvider {
  FRANCE_TRAVAIL = 'FRANCE_TRAVAIL',
  APIFY = 'APIFY',
}

export enum EProviderStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

export enum EPublishedSince {
  LAST_24H = '24h',
  LAST_7D = '7d',
  LAST_14D = '14d',
}

export enum EProviderHealthStatus {
  OK = 'OK',
  DOWN = 'DOWN',
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
  apiProvider: EOfferApiProvider;
  experience?: IExperienceInfo;
  skills: string[];
}

// ═══════════════════════════════════════════
//        OFFERS - FILTERS
// ═══════════════════════════════════════════

export interface IOfferSearchFilters {
  keyword: string;
  cityCode?: string; // INSEE commune code (e.g. "75056")
  departmentCode?: string; // INSEE department code (e.g. "75", "2A", "971")
  regionCode?: string; // INSEE region code (e.g. "11" for Île-de-France)
  postalCode?: string;
  contractType?: EContractType;
  remote?: ERemotePolicy;
  experience?: EExperienceLevel;
  publishedSince?: EPublishedSince;
  jobboard?: EOfferJobboardOrigin[];
  page: number; // default 1
  limit: number; // default 20
}

// ═══════════════════════════════════════════
//      AGREGATE RESPONSE
// ═══════════════════════════════════════════

export interface IProviderSourceStatus {
  apiProvider: EOfferApiProvider;
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
  readonly name: EOfferApiProvider;
  readonly jobboards: EOfferJobboardOrigin[];
  readonly cacheTtl: number; // in sec
  search(filters: TProviderSearchFilters, maxResults: number): Promise<IOfferListItem[]>;
  isAvailable(): boolean;
}

export interface IHealthCheckEntry {
  status: EProviderHealthStatus;
  latencyMs?: number;
  message?: string;
}

export interface IProviderHealthCheck {
  provider: EOfferApiProvider;
  status: EProviderHealthStatus;
  message?: string;
  checks?: {
    auth: IHealthCheckEntry;
    search: IHealthCheckEntry;
  };
}
