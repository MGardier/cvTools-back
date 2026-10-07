export interface ICreateAdminInvitation {
  email: string;
  uuid: string;
  tokenHash: string;
  expiresAt: Date;
}
