import { ApiResponse } from "nats/lib/jetstream/jsapi_types";

export interface FindAllResponse  extends ApiResponse {

  limit: number;
  count : number;
  page : number;
  maxPage : number

}