import {
  IsNotEmpty,
  IsUrl,
  IsString,
  MaxLength,
  ValidateIf,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
  Validate,
  Allow,
} from 'class-validator';

@ValidatorConstraint({ name: 'ExactlyOneField', async: false })
class ExactlyOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as Record<string, unknown>;
    const hasUrl = !!obj.url;
    const hasRawContent = !!obj.rawContent;
    return hasUrl !== hasRawContent;
  }

  defaultMessage() {
    return 'Vous devez fournir soit une URL, soit un contenu texte, pas les deux.';
  }
}

export class ExtractOfferDto {
  /** Hidden field that always validates to enforce the XOR constraint. */
  @Validate(ExactlyOneFieldConstraint)
  @Allow()


  @ValidateIf((o) => !o.rawContent)
  @IsNotEmpty({ message: "L'URL ne peut pas être vide." })
  @IsUrl({}, { message: "L'URL doit être une URL valide." })
  url?: string;

  @ValidateIf((o) => !o.url)
  @IsNotEmpty({ message: 'Le contenu ne peut pas être vide.' })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères.' })
  @MaxLength(50_000, {
    message: 'Le contenu ne peut pas dépasser 50 000 caractères.',
  })
  rawContent?: string;
}
