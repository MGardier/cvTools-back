// RPC envelope returned by ms-applications handlers.
export interface IRpcSuccessResponse<TData> {
  success: true;
  data: TData;
}

export interface IRpcErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
  };
}

export type TRpcResponse<TData> =
  | IRpcSuccessResponse<TData>
  | IRpcErrorResponse;

// Mirrors of the ms-applications enums (the domain source of truth lives there).
export type TApplicationType = 'CLASSIC_OFFER' | 'SPONTANEOUS' | 'NETWORKING';

export type TApplicationStatus =
  | 'TO_REVIEW'
  | 'TO_APPLY'
  | 'APPLIED'
  | 'IN_PROGRESS'
  | 'OFFER_RECEIVED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ABANDONED';

export type TApplicationCompleteness =
  | 'DRAFT'
  | 'MINIMAL'
  | 'USABLE'
  | 'COMPLETE';

export type TCreationMode = 'MANUAL';

export type TRemoteType =
  | 'NOT_SPECIFIED'
  | 'ON_SITE'
  | 'HYBRID'
  | 'FULLY_REMOTE';

export type TStackCategory =
  | 'LANGUAGES'
  | 'FRAMEWORKS'
  | 'DATABASES'
  | 'DEVOPS'
  | 'LIBRARIES'
  | 'METHODS_PRACTICES'
  | 'OTHER';

// Mirror of the ms-applications IApplicationResponse contract.
export interface IApplicationResponse {
  publicId: string;
  companyName: string | null;
  jobTitle: string | null;
  subject: string | null;
  url: string | null;
  source: string | null;
  type: TApplicationType | null;
  status: TApplicationStatus;
  completeness: TApplicationCompleteness;
  creationMode: TCreationMode;
  isArchived: boolean;
  isStackToComplete: boolean;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  conditions: {
    contractType: string | null;
    city: string | null;
    postalCode: string | null;
    remoteType: TRemoteType;
    salary: string | null;
    requiredExperience: string | null;
  };
  description: {
    quickOverview: string | null;
    role: string | null;
    missions: string | null;
    desiredProfile: string | null;
    techEnvironment: string | null;
    additionalInfo: string | null;
  };
  stack: {
    primary: { name: string; position: number }[];
    detailed: { name: string; category: TStackCategory }[];
  };
}
