import { Job } from "@prisma/client";
import { SortItem } from "./filter-options.interface";
import { OptionRepository } from "./options-repository.interface";

export interface FindAllOptions<Tdata> extends OptionRepository<Tdata> {
  page?: number;
  limit?: number;
  sort : SortItem<Job>[]
}