import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { DtoErrorCodeEnum } from '../enums/dto-error-codes.enum';

@ValidatorConstraint({ name: 'atLeastOneOf', async: false })
class AtLeastOneOfConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const [properties] = args.constraints as [string[]];
    const object = args.object as Record<string, unknown>;

    return properties.some((property) => {
      const value = object[property];
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== null;
    });
  }

  defaultMessage(): string {
    return DtoErrorCodeEnum.AT_LEAST_ONE_OF_REQUIRED;
  }
}

/**
 * Class-level validator: at least one of the given properties must be set
 * (whitespace-only strings count as empty). The error is reported under a
 * virtual property named after the decorator.
 */
export function AtLeastOneOf(
  properties: string[],
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return (target) => {
    registerDecorator({
      name: 'atLeastOneOf',
      target: target as unknown as new (...args: unknown[]) => unknown,
      propertyName: 'atLeastOneOf',
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOneOfConstraint,
    });
  };
}
