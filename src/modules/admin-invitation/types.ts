export interface ICreateAdminInvitation {
  email: string;
  uuid: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IAdminRegisterCredentials {
  password?: string;
  oauthId?: string;
}
