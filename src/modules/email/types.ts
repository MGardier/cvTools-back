export interface IEmailPayload {
  receivers: string[];
  subject: string;
  templatePath: string;
  templateVariables: Record<string, string>;
}
