import { OptionRepository } from "./options-repository.interface";

export interface FilterOptions<Tdata> extends OptionRepository<Tdata> {
  limit: number;
  skip: number;
}