import { IAuth } from "../auth/IAuth";
import { sendlix } from "../proto/group";

const {
  CheckEmailInGroupRequest,
  InsertEmailToGroupRequest,
  RemoveEmailFromGroupRequest,
  GroupClient: gRpcGroupClient,
  GroupEntry,
  FailureHandler,
} = sendlix.api.v1;

import { EmailData as EmailDataProto } from "../proto/EmailData";

import { Client } from "./Client";

/**
 * Failure handling strategy for group insert operations
 *
 * @typedef {("ABORT"|string)} FailHandling
 * Keys of FailureHandler enum, e.g. "ABORT".
 */
type FailHandling = keyof typeof FailureHandler;

/**
 * Recipient email value
 *
 * @typedef {Object|string} EmailData
 * @property {string} email - The email address (when using object form)
 * @property {string} [name] - Optional display name (object form only)
 */
type EmailData =
  | {
      email: string;
      name?: string;
    }
  | string;

/**
 * Group entry record to insert
 *
 * @typedef {Object} EmailRecord
 * @property {EmailData} email - Recipient email as string or object with optional name
 * @property {Object.<string,string>} [substitutions] - Optional key-value substitutions available in templates
 */
type EmailRecord = {
  email: EmailData;
  substitutions?: Record<string, string>;
};

/**
 * GroupClient is a client for managing group operations via gRPC.
 * It provides methods for inserting and deleting emails from groups.
 */
export class GroupClient extends Client<typeof gRpcGroupClient> {
  /**
   * Constructs a new GroupClient instance.
   * @param auth - Authentication object implementing IAuth or a raw token string.
   */
  constructor(auth: IAuth | string) {
    super(auth, gRpcGroupClient);
  }

  /**
   * Inserts one or multiple email records into a group.
   *
   * @param groupId - The unique identifier of the group.
   * @param email - A single EmailRecord or an array of EmailRecord objects.
   * @param failHandling - Strategy on individual insert failure. One of the keys of FailureHandler (e.g. "ABORT").
   * @returns Promise that resolves to true on success, otherwise rejects with an Error.
   *
   * @example
   * const client = new GroupClient("your_api_key");
   * // Single email as simple string
   * await client.insertEmailIntoGroup("groupId", { email: "info@example.com" });
   *
   * // With display name and substitutions
   * await client.insertEmailIntoGroup("groupId", {
   *   email: { email: "john@example.com", name: "John Doe" },
   *   substitutions: { firstName: "John" }
   * });
   *
   * // Multiple records
   * await client.insertEmailIntoGroup("groupId", [
   *   { email: "a@example.com" },
   *   { email: { email: "b@example.com", name: "User B" }, substitutions: { plan: "pro" } },
   * ]);
   */
  public async insertEmailIntoGroup(
    groupId: string,
    email: EmailRecord | EmailRecord[],
    failHandling: FailHandling = "ABORT"
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Build the request with group id and failure handling strategy
      const request = new InsertEmailToGroupRequest({
        groupId: groupId,
        onFailure: FailureHandler[failHandling],
      });

      // Normalize to array to simplify processing logic
      if (!Array.isArray(email)) {
        email = [email];
      }

      for (const item of email) {
        // Convert substitutions object into a map as required by the gRPC schema
        const substitutionsMap = new Map<string, string>();
        if (item.substitutions) {
          for (const [key, value] of Object.entries(item.substitutions)) {
            substitutionsMap.set(key, value);
          }
        }

        // Build the EmailData protobuf message from either string or object input
        const email =
          typeof item.email === "string"
            ? new EmailDataProto({ email: item.email })
            : new EmailDataProto({
                email: item.email.email,
                name: item.email.name,
              });

        // Add the entry to the request payload
        request.entries.push(
          new GroupEntry({
            substitutions: substitutionsMap,
            email,
          })
        );
      }

      // Execute the RPC and map response to boolean result
      this.client.InsertEmailToGroup(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (!response?.success) {
            reject(new Error(response?.message));
          } else resolve(response.success);
        }
      });
    });
  }

  /**
   * Deletes an email from a group.
   *
   * Important: Emails can only be removed if they were added at least 30 minutes ago.
   *
   * @param groupId - The unique identifier of the group.
   * @param email - The email address to remove from the group.
   * @returns Promise that resolves to true on success, otherwise rejects with an Error.
   * @example
   * const client = new GroupClient("your_api_key");
   * await client.deleteEmailFromGroup("groupId", "info@example.com");
   */
  public async deleteEmailFromGroup(
    groupId: string,
    email: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = new RemoveEmailFromGroupRequest({
        email,
        groupId,
      });

      this.client.RemoveEmailFromGroup(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (!response?.success) {
            reject(new Error(response?.message));
          } else resolve(response.success);
        }
      });
    });
  }

  /**
   * Checks whether an email exists in a group.
   *
   * @param groupId - The unique identifier of the group.
   * @param email - The email address to check.
   * @returns Promise that resolves to true if the email exists in the group; false otherwise.
   */
  public async containsEmailInGroup(
    groupId: string,
    email: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const request = new CheckEmailInGroupRequest({
        groupId,
        email,
      });

      this.client.CheckEmailInGroup(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response?.exists == true);
        }
      });
    });
  }
}
