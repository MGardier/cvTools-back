export interface IEmailPayload {
  recipients: string[];
  subject: string;
  cc?: string[]
  bcc?: string[]
  html?: string
  templateVersionId?: number;
  variables?:  Record<string, unknown>;
  userId: number;
  origin: string
  isApproved?: boolean;
  metadata?: Record<string, unknown>;

}




