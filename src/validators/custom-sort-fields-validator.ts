import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Job } from '@prisma/client';
import { SortItem } from "src/interfaces/filter-options.interface";


@ValidatorConstraint({ name: 'customSortFields', async: false })
export class CustomSortFieldsValidator<TData> implements ValidatorConstraintInterface {
  validate(sorting: SortItem<TData>[], args: ValidationArguments) {
  console.log("sorting : ", sorting)
  const validFields = args.constraints ;

   return sorting.every(sortItem => 
      sortItem.field && validFields.includes(sortItem.field) &&
      ['asc', 'desc'].includes(sortItem.direction)
    );
  }

  defaultMessage(args: ValidationArguments) {
    
    return 'Sorting Fields  are not valid !';
  }
}