import { Address, ApplicationMethod, JobStatus, PriorityJob, TypeEnterprise } from "@prisma/client";

export interface CreateJobInterface {
  
  enterprise: string;
  type: TypeEnterprise;
  link: string;
  jobTitle: string;
  managerName?: string;
  managerEmail?: string;
  status: JobStatus;
  priority: PriorityJob;
  applicationMethod: ApplicationMethod;
  interviewCount: number;
  rejectedReason?: string;
  rating: number;
  archived : boolean;
  appliedAt?: Date;
  lastContactAt ? :Date;
  technologiesId: number[];
  address: Omit<Address, 'id' |"createdAt" | "updatedAt">;
  userId: number;


}