import { credentials } from "@grpc/grpc-js";
import { sendlix } from "../proto/auth";
import { IAuth } from "./IAuth";

const { AuthRequest, ApiKey, AuthClient: gRPCAuthClient } = sendlix.api.v1;

export class Auth implements IAuth {
  private apiKey: InstanceType<typeof ApiKey>;
  private client: InstanceType<typeof gRPCAuthClient>;

  private token: {
    token: string;
    expiresAt: number;
  } | null = null;

  constructor(apiKey: string) {
    const g = apiKey.split(".");
    if (g.length !== 2) {
      throw new Error("Invalid API key format. Expected format: 'key.value'.");
    }
    this.apiKey = new ApiKey({
      secret: g[0],
      keyID: parseInt(g[1]),
    });
    this.client = new gRPCAuthClient(
      "api.sendlix.com",
      credentials.createSsl(),
      { "grpc.primary_user_agent": "sendlix-nodejs-sdk/1.0.0" }
    );
  }

  /**
   * Returns the authorization header for the client
   * @returns {Promise<[string, string]>} A promise that resolves to a tuple of the header name and value
   */
  getAuthHeader(): Promise<[string, string]> {
    if (this.token && this.token.expiresAt > Date.now()) {
      return Promise.resolve(["Authorization", `Bearer ${this.token.token}`]);
    }

    return new Promise((resolve, reject) => {
      const request = new AuthRequest();
      request.apiKey = this.apiKey;
      this.client.GetJwtToken(request, (err, response) => {
        if (err) {
          return reject(err);
        }
        if (!response) {
          return reject(new Error("No response from server"));
        }

        this.token = {
          token: response.token,
          expiresAt: Date.now() + response.expires.seconds * 1000,
        };

        resolve(["Authorization", `Bearer ${this.token.token}`]);
      });
    });
  }
}
