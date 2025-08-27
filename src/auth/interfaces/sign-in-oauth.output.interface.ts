import { SignInOutputInterface } from "./sign-in.output.interface";

export interface SignInOauthOutputInterface extends Omit<SignInOutputInterface,"user">{
  
}