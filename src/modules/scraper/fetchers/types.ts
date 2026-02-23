export interface IFetchResult {
  data: string | null;
  success: boolean;
  error?: string;
}

export interface IFetcher {
  fetch(url: string): Promise<IFetchResult>;
}
