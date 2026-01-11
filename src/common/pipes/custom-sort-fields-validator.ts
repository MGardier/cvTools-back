import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Job } from '@prisma/client';
import { TSortItem } from "src/common/types/repository.types";


@ValidatorConstraint({ name: 'customSortFields', async: false })
export class CustomSortFieldsValidator<TData> implements ValidatorConstraintInterface {
  validate(sorting: TSortItem<TData>[], args: ValidationArguments) {
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