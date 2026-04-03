export interface ITestCredentials {
  email: string;
  password: string;
}

export interface IAuthCookies {
  accessToken: string;
  refreshToken: string;
  raw: string[];
}