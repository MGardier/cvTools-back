import { OptionRepository } from "./options-repository.interface";

export interface FindAllOptions<Tdata> extends OptionRepository<Tdata> {
  page?: number;
  limit?: number;
}