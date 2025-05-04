import * as grpc from "@grpc/grpc-js";
import { Auth } from "../auth/auth";
import { IAuth } from "../auth/IAuth";

export abstract class Client<T extends typeof grpc.Client> {
  protected client: InstanceType<T>;

  constructor(auth: IAuth | string, client: T) {
    if (typeof auth === "string") {
      auth = new Auth(auth);
    }
    if (!auth) {
      throw new Error("Auth is required to create a client.");
    }
    this.client = createClient(client, auth);
  }

  /**
   * Closes the client connection
   * Should be called when the client is no longer needed to free resources
   */
  public close() {
    this.client.close();
  }
}

function createClient<T extends typeof grpc.Client>(client: T, auth: IAuth) {
  if (!auth) {
    throw new Error("Auth is required to create a client.");
  }

  const extra_creds = grpc.credentials.createFromMetadataGenerator(
    async (_, cb) => {
      var meta = new grpc.Metadata();

      const token = await auth.getAuthHeader();
      meta.add(token[0], token[1]);
      cb(null, meta);
    }
  );

  return new client(
    "api.sendlix.com",
    grpc.credentials.combineChannelCredentials(
      grpc.credentials.createSsl(),
      extra_creds
    ),
    { "grpc.primary_user_agent": "sendlix-nodejs-sdk/1.0.0" }
  ) as InstanceType<T>;
}
