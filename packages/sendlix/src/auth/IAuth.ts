/**
 * IAuth interface defines the contract for authentication mechanisms.
 * It requires implementing a method to retrieve the authorization header.
 */
export interface IAuth {
  getAuthHeader(): Promise<[string, string]>;
}
