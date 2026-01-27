import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TSortItem } from 'src/common/types/repository.types';

@ValidatorConstraint({ name: 'customSortFields', async: false })
export class CustomSortFieldsValidator<
  TData,
> implements ValidatorConstraintInterface {
  validate(sorting: TSortItem<TData>[], args: ValidationArguments) {
    const validFields = args.constraints;

    return sorting.every(
      (sortItem) =>
        sortItem.field &&
        validFields.includes(sortItem.field) &&
        ['asc', 'desc'].includes(sortItem.direction),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Sorting Fields  are not valid !';
  }
}
