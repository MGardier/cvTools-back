import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsPositive,
  IsUrl,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  Jobboard,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';
import { AddressInputDto } from 'src/modules/address/dto/request/create-address.dto';
import { CreateContactRequestDto } from 'src/modules/contact/dto/request/create-contact.dto';

export class CreateApplicationRequestDto {
  // =============================================================================
  //                            INTEGER FIELDS
  // =============================================================================

  @IsOptional()
  @IsInt({ message: 'Le salaire minimum doit être un nombre entier.' })
  @IsPositive({ message: 'Le salaire minimum doit être positif.' })
  salaryMin?: number;

  @IsOptional()
  @IsInt({ message: 'Le salaire maximum doit être un nombre entier.' })
  @IsPositive({ message: 'Le salaire maximum doit être positif.' })
  salaryMax?: number;

  // =============================================================================
  //                            STRING FIELDS
  // =============================================================================

  @IsNotEmpty({ message: 'Le titre ne peut pas être vide.' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères.' })
  title: string;

  @IsNotEmpty({ message: "L'URL ne peut pas être vide." })
  @IsUrl({}, { message: "L'URL doit être une URL valide." })
  url: string;

  @IsOptional()
  @IsString({ message: "L'entreprise doit être une chaîne de caractères." })
  company?: string;

  @IsOptional()
  @IsString({
    message: "L'identifiant de l'offre API doit être une chaîne de caractères.",
  })
  apiOfferId?: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  description?: string;

  // =============================================================================
  //                             DATE FIELDS
  // =============================================================================

  @IsOptional()
  @IsDate({ message: 'La date de publication doit être une date valide.' })
  @Type(() => Date)
  publishedAt?: Date;


  // =============================================================================
  //                             ENUM FIELDS
  // =============================================================================

  @IsNotEmpty({ message: 'Le jobboard ne peut pas être vide.' })
  @IsEnum(Jobboard, {
    message: 'Le jobboard doit être une valeur valide.',
  })
  jobboard: Jobboard;

  @IsNotEmpty({ message: 'Le type de contrat ne peut pas être vide.' })
  @IsEnum(ContractType, {
    message: 'Le type de contrat doit être une valeur valide.',
  })
  contractType: ContractType;

  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: 'Le statut doit être une valeur valide.',
  })
  currentStatus?: ApplicationStatus;

  @IsOptional()
  @IsEnum(ApiProvider, {
    message: 'Le fournisseur API doit être une valeur valide.',
  })
  apiProvider?: ApiProvider;

  @IsOptional()
  @IsEnum(ExperienceLevel, {
    message: "Le niveau d'expérience doit être une valeur valide.",
  })
  experience?: ExperienceLevel;

  @IsOptional()
  @IsEnum(RemotePolicy, {
    message: 'La politique de télétravail doit être une valeur valide.',
  })
  remotePolicy?: RemotePolicy;

  @IsOptional()
  @IsEnum(CompatibilityJob, {
    message: 'La compatibilité doit être une valeur valide.',
  })
  compatibility?: CompatibilityJob;

  // =============================================================================
  //                        OPTIONAL NESTED OBJECT
  // =============================================================================

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  address?: AddressInputDto;

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
    message: 'Chaque compétence doit être une chaîne de caractères.',
  })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactRequestDto)
  contacts?: CreateContactRequestDto[];
}
