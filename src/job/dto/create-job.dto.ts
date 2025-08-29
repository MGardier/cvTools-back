import { Address, ApplicationMethod, JobStatus, PriorityJob, Technology, TypeEnterprise } from "@prisma/client";

export class CreateJobDto {

  enterprise : string;
  type: TypeEnterprise;
  link: string;
  jobTitle : string;
  managerName ?: string;
  managerEmail ?: string;
  detailsToRemember ?: string;
  salaryMin ?: number;
  salaryMax ?: number;
  salaryCurrency ?: number;
  status:JobStatus ;
  priority: PriorityJob;
  applicationMethod : ApplicationMethod;
  appliedAt: Date; 
  technologies : Omit<Technology,"id">[];
  address : Omit<Address,"id">
  userId : number;
  
}
