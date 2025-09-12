import { ApplicationMethod, JobStatus, CompatibilityJob, TypeEnterprise } from "@prisma/client";
import { CreateAddressDto } from "src/address/dto/create-address.dto";


export interface UpdateJobInterface {

  id: number;
  enterprise?: string;
  type?: TypeEnterprise;
  link?: string;
  jobTitle?: string;
  managerName?: string;
  managerEmail?: string;
  status?: JobStatus;
  compatibility?: CompatibilityJob;
  applicationMethod?: ApplicationMethod;
  appliedAt?: Date;
  technologiesId?: number[];
  address?: CreateAddressDto
  userId: number

 
}