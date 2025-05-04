export interface IAuth {
  getAuthHeader(): Promise<[string, string]>;
}
