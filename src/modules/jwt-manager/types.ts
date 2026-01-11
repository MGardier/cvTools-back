export interface IGenerateJwtOutput {
  token: string;
  expiresIn: number;
}

export interface IPayloadJwt {
  sub: number;
  email: string;
  uuid?: string;
}
