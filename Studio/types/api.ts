export interface IApiResponse<D = {}> {
  success: boolean;
  message: Record<string, string>;
  data: D;
  error: string;
}
