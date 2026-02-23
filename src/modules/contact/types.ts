export interface ICreateContact {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  profession: string;
  createdBy: number;
  applicationId: number;
}

export interface IUpdateContact {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string | null;
  profession?: string;
}
