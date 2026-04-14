import { HttpStatus } from '@nestjs/common';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

// ═══════════════════════════════════════════
//    QUERY PARAMS
// ═══════════════════════════════════════════

export type TFTContractType =   
  'CDD' 
  |'CDI' 
  |'LIB' //Freelance

export type TFTExperience = 
    |'1' // < 1 year
    |'2' // 1 - 3 years
    |'3' // > 3 years


export interface IFranceTravailQueryParams {

  motsCles: string;
  commune ?: string;
  region ?: string;
  typeContrat ?: TFTContractType

  //Only use for alternance contract
  natureContrat?: string

  experience?: TFTExperience
  minCreationDate ?: string
  range ?: string // min-max 0-149

  //FT doesnt have remote policy field

}


export interface IFranceTravailSearchResponse {
  resultats: IFranceTravailRawOffer[];
  filtresPossibles: IFranceTravailFilter[];
}

export interface IFranceTravailFilter {
  filtre: string;
  agregation: Array<{
    valeurPossible: string;
    nbResultats: number;
  }>;
}

export interface IFranceTravailRawOffer {
  id: string;
  intitule: string;
  description?: string;
  dateCreation: string;
  dateActualisation?: string;

  entreprise?: {
    nom?: string;
    entrepriseAdaptee?: boolean;
  };

  lieuTravail?: {
    libelle?: string;
    latitude?: number;
    longitude?: number;
    codePostal?: string;
    commune?: string;
  };

  typeContrat?: string;
  typeContratLibelle?: string;
  natureContrat?: string;

  experienceExige?: string; // "D" | "S" | "E"
  experienceLibelle?: string;

  salaire?: {
    libelle?: string;
    commentaire?: string;
    complement1?: string;
  };

  dureeTravailLibelle?: string;
  dureeTravailLibelleConverti?: string;

  romeCode?: string;
  romeLibelle?: string;
  appellationlibelle?: string;

  alternance?: boolean;

  competences?: Array<{
    code?: string;
    libelle: string;
    exigence?: string;
  }>;

  qualitesProfessionnelles?: Array<{
    libelle: string;
    description?: string;
  }>;

  origineOffre?: {
    origine?: string;
    urlOrigine?: string;
  };

  contact?: {
    urlPostulation?: string;
    coordonnees1?: string;
  };

  nombrePostes?: number;
  secteurActiviteLibelle?: string;
}

// ═══════════════════════════════════════════
//    TOKEN RESPONSE
// ═══════════════════════════════════════════

export interface IFranceTravailTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

// ═══════════════════════════════════════════
//    ERROR HANDLING
// ═══════════════════════════════════════════

export interface IAxiosLikeError {
  response?: { status?: number };
  message?: string;
}

export interface IMappedApiError {
  errorCode: ErrorCodeEnum;
  httpStatus: HttpStatus;
}