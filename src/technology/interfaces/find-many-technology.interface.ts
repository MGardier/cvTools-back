import { Technology } from '@prisma/client';
import { OptionRepositoryInterface } from '../../interfaces/options-repository.interface';
export interface FindManyTechnologyInterface extends OptionRepositoryInterface<Technology> 
{
  technologiesName ?: string[]
  technologiesId ?: number[]
}