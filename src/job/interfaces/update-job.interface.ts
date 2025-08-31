import { ApplicationMethod, JobStatus, PriorityJob, TypeEnterprise } from "@prisma/client";
import { CreateAddressDto } from "src/address/dto/create-address.dto";
import { UpsertTechnologyDto } from "src/technology/dto/upsert-technology.dto";

export interface UpdateJobInterface {

  enterprise?: string;
  type?: TypeEnterprise;
  link?: string;
  jobTitle?: string;
  managerName?: string;
  managerEmail?: string;
  detailsToRemember?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: JobStatus;
  priority?: PriorityJob;
  applicationMethod?: ApplicationMethod;
  appliedAt?: Date;
  technologiesId?: number[];
  address?: CreateAddressDto

 
}