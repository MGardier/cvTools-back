import { Address, ApplicationMethod, JobStatus, PriorityJob, TypeEnterprise } from "@prisma/client";

export interface CreateJobInterface {
  
  enterprise: string;
  type: TypeEnterprise;
  link: string;
  jobTitle: string;
  managerName?: string;
  managerEmail?: string;
  detailsToRemember?: string;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  priority: PriorityJob;
  applicationMethod: ApplicationMethod;
  appliedAt?: Date;
  technologiesId: number[];
  address: Omit<Address, 'id' |"createdAt" | "updatedAt">;
  userId: number;


}