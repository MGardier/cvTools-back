
export interface ApiResponseInterface <T = any> {
  
  success: boolean;
  status : number;
  message?: string;
  data? : T
  timestamp: string;
  path: string;
  
}