export interface IGeneratedJwt {
  token: string;
  expiresIn: number;
}

export interface IPayloadJwt {
  sub: number;
  email: string;
  uuid?: string;
}
