export class OAuthRedirectException extends Error {
  constructor() {
    super('OAuth redirect already sent');
    this.name = 'OAuthRedirectException';
  }
}
