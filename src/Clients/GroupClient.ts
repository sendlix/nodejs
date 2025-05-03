import { IAuth } from "../IAuth";

import { sendlix } from "../proto/group";

const {
  CheckEmailInGroupRequest,
  InsertEmailToGroupRequest,
  RemoveEmailFromGroupRequest,
  GroupClient: gRpcGroupClient,
} = sendlix.api.v1;

import { EmailData as EmailDataProto } from "../proto/EmailData";

import { Client } from "./Client";

type EmailData =
  | {
      email: string;
      name?: string;
    }
  | string;
/**
 * GroupClient is a client for managing group operations via gRPC.
 * It provides methods for inserting and deleting emails from groups.
 */
export class GroupClient extends Client<typeof gRpcGroupClient> {
  /**
   * Constructs a new GroupClient instance.
   * @param auth - Authentication object or token string
   */
  constructor(auth: IAuth | string) {
    super(auth, gRpcGroupClient);
  }

  /**
   * Inserts one or multiple emails into a group.
   *
   * @param groupId - The unique identifier of the group (string).
   * @param email - An array of email addresses (string[]) to be added to the group.
   * @param substitutions - Optional key-value pairs (Record<string, string>) for custom substitutions.
   * @returns A Promise that resolves to a boolean indicating success or
   *          rejects with an Error containing the error message.
   *
   * @example
   * const groupClient = new GroupClient("your_api_key");
   * groupClient.insertEmailIntoGroup("groupId", "info@example.com", { "name": "John Doe" });
   */
  public async insertEmailIntoGroup(
    groupId: string,
    email: EmailData | EmailData[],
    substitutions?: Record<string, string>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = new InsertEmailToGroupRequest({
        groupId: groupId,
      });

      if (Array.isArray(email)) {
        email.forEach((e) => {
          if (typeof e === "string") {
            request.emails.push(new EmailDataProto({ email: e }));
          } else {
            request.emails.push(
              new EmailDataProto({
                email: e.email,
                name: e.name,
              })
            );
          }
        });
      } else {
        if (typeof email === "string") {
          request.emails.push(new EmailDataProto({ email }));
        } else {
          request.emails.push(
            new EmailDataProto({
              email: email.email,
              name: email.name,
            })
          );
        }
      }

      if (substitutions) {
        const substitutionsMap = request.substitutions;
        Object.keys(substitutions).forEach((key) => {
          substitutionsMap.set(key, substitutions[key]);
        });
      }

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
   * #### Important Notes:
   * EMAILS ARE ONLY ALLOWED TO BE REMOVED IF THEY ARE ADDED 30 MINUTES AGO OR MORE.
   *
   * @param groupId - The unique identifier of the group (string).
   * @param email - The email address (string) to be removed from the group.
   * @returns A Promise that resolves to a boolean indicating success or
   *          rejects with an Error containing the error message.
   * @example
   * const groupClient = new GroupClient("your_api_key");
   * groupClient.deleteEmailFromGroup("groupId", "info@example.com");
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
   * Checks if an email exists in a group.
   *
   * @param groupId - The unique identifier of the group (string).
   * @param email - The email address (string) to check for existence in the group.
   * @returns A Promise that resolves to a boolean indicating whether the email exists in the group.
   *          Resolves to true if the email exists, false otherwise.
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
