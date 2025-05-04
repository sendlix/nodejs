import { GroupClient } from "../../src/Clients/GroupClient";
import { IAuth } from "../../src/auth/IAuth";
import { sendlix } from "../../src/proto/group";

const { InsertEmailToGroupRequest, RemoveEmailFromGroupRequest } =
  sendlix.api.v1;

interface IGroupResponse {
  message?: string;
  success: boolean;
}

interface FakeGroupClient {
  InsertEmailToGroup(
    request: InstanceType<typeof InsertEmailToGroupRequest>,
    callback: (error: Error | null, response: IGroupResponse) => void
  ): void;
  RemoveEmailFromGroup(
    request: InstanceType<typeof RemoveEmailFromGroupRequest>,
    callback: (error: Error | null, response: IGroupResponse) => void
  ): void;
  CheckEmailInGroup?(
    request: any,
    callback: (error: Error | null, response: { exists?: boolean }) => void
  ): void;
}

describe("GroupClient", () => {
  let dummyAuth: IAuth;
  let groupClient: GroupClient;

  beforeEach(() => {
    dummyAuth = {
      getAuthHeader: (): Promise<[string, string]> =>
        Promise.resolve(["Authorization", "Bearer dummy-token"]),
    };
    groupClient = new GroupClient(dummyAuth);
  });

  describe("insertEmailIntoGroup", () => {
    test("should resolve to true on successful insertion", async () => {
      const fakeClient: FakeGroupClient = {
        InsertEmailToGroup: (
          request: InstanceType<typeof InsertEmailToGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(null, {
            success: true,
            message: "",
          });
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      // Override the client with our fake client
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      const substitutions = { key: "value" };
      await expect(
        groupClient.insertEmailIntoGroup(
          "group1",
          "test@example.com",
          substitutions
        )
      ).resolves.toBe(true);
    });

    test("should reject if the gRPC response indicates failure", async () => {
      const errorMsg = "Insertion failed";
      const fakeClient: FakeGroupClient = {
        InsertEmailToGroup: (
          request: InstanceType<typeof InsertEmailToGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(null, {
            success: false,
            message: errorMsg,
          });
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      await expect(
        groupClient.insertEmailIntoGroup("group1", ["test@example.com"])
      ).rejects.toThrow(errorMsg);
    });

    test("should reject when a gRPC error is returned", async () => {
      const fakeError = new Error("gRPC error");
      const fakeClient: FakeGroupClient = {
        InsertEmailToGroup: (
          request: InstanceType<typeof InsertEmailToGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(fakeError, {
            success: false,
            message: "",
          });
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      await expect(
        groupClient.insertEmailIntoGroup("group1", "test@example.com")
      ).rejects.toThrow("gRPC error");
    });
  });

  describe("deleteEmailFromGroup", () => {
    test("should resolve to true on successful deletion", async () => {
      const fakeClient: FakeGroupClient = {
        RemoveEmailFromGroup: (
          request: InstanceType<typeof RemoveEmailFromGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(null, {
            success: true,
            message: "",
          });
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      await expect(
        groupClient.deleteEmailFromGroup("group1", "test@example.com")
      ).resolves.toBe(true);
    });

    test("should reject if the gRPC response indicates failure", async () => {
      const errorMsg = "Deletion failed";
      const fakeClient: FakeGroupClient = {
        RemoveEmailFromGroup: (
          request: InstanceType<typeof RemoveEmailFromGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(null, {
            success: false,
            message: errorMsg,
          });
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      await expect(
        groupClient.deleteEmailFromGroup("group1", "test@example.com")
      ).rejects.toThrow(errorMsg);
    });

    test("should reject when a gRPC error is returned", async () => {
      const fakeError = new Error("gRPC delete error");
      const fakeClient: FakeGroupClient = {
        RemoveEmailFromGroup: (
          request: InstanceType<typeof RemoveEmailFromGroupRequest>,
          callback: (error: Error | null, response: IGroupResponse) => void
        ): void => {
          callback(fakeError, {
            success: false,
            message: "",
          });
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClient }).client =
        fakeClient;

      await expect(
        groupClient.deleteEmailFromGroup("group1", "test@example.com")
      ).rejects.toThrow("gRPC delete error");
    });
  });
  describe("containsEmailInGroup", () => {
    // Update the FakeGroupClient interface first
    interface FakeGroupClientWithCheck extends FakeGroupClient {
      CheckEmailInGroup?(
        request: any,
        callback: (error: Error | null, response: { exists?: boolean }) => void
      ): void;
    }

    test("should resolve to true when email exists in group", async () => {
      const fakeClient: FakeGroupClientWithCheck = {
        CheckEmailInGroup: (
          request: any,
          callback: (
            error: Error | null,
            response: { exists?: boolean }
          ) => void
        ): void => {
          callback(null, {
            exists: true,
          });
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClientWithCheck }).client =
        fakeClient;

      await expect(
        groupClient.containsEmailInGroup("group1", "test@example.com")
      ).resolves.toBe(true);
    });

    test("should resolve to false when email does not exist in group", async () => {
      const fakeClient: FakeGroupClientWithCheck = {
        CheckEmailInGroup: (
          request: any,
          callback: (
            error: Error | null,
            response: { exists?: boolean }
          ) => void
        ): void => {
          callback(null, {
            exists: false,
          });
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClientWithCheck }).client =
        fakeClient;

      await expect(
        groupClient.containsEmailInGroup("group1", "test@example.com")
      ).resolves.toBe(false);
    });

    test("should reject when a gRPC error is returned", async () => {
      const fakeError = new Error("gRPC check error");
      const fakeClient: FakeGroupClientWithCheck = {
        CheckEmailInGroup: (
          request: any,
          callback: (
            error: Error | null,
            response: { exists?: boolean }
          ) => void
        ): void => {
          callback(fakeError, {});
        },
        InsertEmailToGroup: () => {
          throw new Error("Not implemented");
        },
        RemoveEmailFromGroup: () => {
          throw new Error("Not implemented");
        },
      };
      (groupClient as unknown as { client: FakeGroupClientWithCheck }).client =
        fakeClient;

      await expect(
        groupClient.containsEmailInGroup("group1", "test@example.com")
      ).rejects.toThrow("gRPC check error");
    });
  });
});
