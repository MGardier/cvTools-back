export interface IGoogleProfile {
  id: string;
  emails: Array<{ value: string; verified?: boolean }>;
  displayName?: string;
  photos?: Array<{ value: string }>;
  // Raw OIDC userinfo payload — reliable source for email_verified
  // (passport-google-oauth20 does not consistently map it onto `emails[].verified`).
  _json?: { email_verified?: boolean };
}

export interface IGithubProfile {
  id: string;
  username?: string;
  displayName?: string;
  emails?: Array<{ value: string; primary?: boolean; verified?: boolean }>;
}
