import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsPositive,
  IsUrl,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  JobOrigin,
  JobStatus,
  ApiProvider,
  ContractType,
  ExperienceLevel,
  RemotePolicy,
  CompatibilityJob,
} from '@prisma/client';
import { AddressInputDto } from 'src/modules/address/dto/request/create-address.dto';


export class CreateJobRequestDto {


  /********* INTEGER FIELDS *********/

  @IsOptional()
  @IsInt({ message: 'Le salaire minimum doit être un nombre entier.' })
  @IsPositive({ message: 'Le salaire minimum doit être positif.' })
  salaryMin?: number;

  @IsOptional()
  @IsInt({ message: 'Le salaire maximum doit être un nombre entier.' })
  @IsPositive({ message: 'Le salaire maximum doit être positif.' })
  salaryMax?: number;


  /********* STRING FIELDS *********/

  @IsNotEmpty({ message: 'Le titre ne peut pas être vide.' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères.' })
  title: string;

  @IsNotEmpty({ message: "L'URL ne peut pas être vide." })
  @IsUrl({}, { message: "L'URL doit être une URL valide." })
  url: string;

  @IsNotEmpty({ message: 'La date de publication ne peut pas être vide.' })
  @IsDateString({}, { message: 'La date de publication doit être une date valide.' })
  publishedAt: string;

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


  /********* ENUM FIELDS *********/

  @IsNotEmpty({ message: "L'origine ne peut pas être vide." })
  @IsEnum(JobOrigin, { message: "L'origine doit être une valeur valide." })
  origin: JobOrigin;

  @IsOptional()
  @IsEnum(JobStatus, { message: 'Le statut doit être une valeur valide.' })
  status?: JobStatus;

  @IsOptional()
  @IsEnum(ApiProvider, {
    message: 'Le fournisseur API doit être une valeur valide.',
  })
  apiProvider?: ApiProvider;

  @IsOptional()
  @IsEnum(ContractType, {
    message: 'Le type de contrat doit être une valeur valide.',
  })
  contractType?: ContractType;

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


  /********* OPTIONAL NESTED ADDRESS *********/

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  address?: AddressInputDto;
}
