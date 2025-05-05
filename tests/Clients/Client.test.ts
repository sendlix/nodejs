import * as grpc from "@grpc/grpc-js";
import { Auth } from "../../src/auth/auth";
import { Client } from "../../src/Clients/Client";
import { IAuth } from "../../src/auth/IAuth";

// Mock gRPC
jest.mock("@grpc/grpc-js", () => {
  const mockMetadata = {
    add: jest.fn(),
  };

  return {
    credentials: {
      createSsl: jest.fn(),
      createFromMetadataGenerator: jest.fn((fn) => {
        // Store the generator function to call it in tests
        (mockMetadata as any).generator = fn;
        return "mock-metadata-credentials";
      }),
      combineChannelCredentials: jest.fn(() => "mock-combined-credentials"),
    },
    Metadata: jest.fn(() => mockMetadata),
    Client: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
    })),
  };
});

// Mock Auth
jest.mock("../../src/auth/auth", () => {
  return {
    Auth: jest.fn().mockImplementation(() => ({
      getAuthHeader: jest
        .fn()
        .mockResolvedValue(["Authorization", "Bearer mock-token"]),
    })),
    IAuth: jest.fn(),
  };
});

// Create a concrete implementation of the abstract Client class for testing
class TestClient extends Client<typeof grpc.Client> {
  constructor(auth: IAuth | string) {
    super(auth, grpc.Client);
  }
}

describe("Client", () => {
  let mockAuth: IAuth;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock IAuth
    mockAuth = {
      getAuthHeader: jest
        .fn()
        .mockResolvedValue(["Authorization", "Bearer mock-token"]),
    };
  });

  describe("constructor", () => {
    test("should initialize with IAuth instance", () => {
      const client = new TestClient(mockAuth);

      expect(Auth).not.toHaveBeenCalled();
      expect(grpc.Client).toHaveBeenCalledWith(
        "api.sendlix.com",
        "mock-combined-credentials",
        { "grpc.primary_user_agent": "sendlix-nodejs-sdk/1.0.0" }
      );
    });

    test("should initialize with API key string", () => {
      const client = new TestClient("secret.123");

      expect(Auth).toHaveBeenCalledWith("secret.123");
      expect(grpc.Client).toHaveBeenCalled();
    });

    test("should throw error if auth is null", () => {
      expect(() => new TestClient(null as unknown as string)).toThrow(
        "Auth is required to create a client."
      );
    });

    test("should throw error if auth is undefined", () => {
      expect(() => new TestClient(undefined as unknown as string)).toThrow(
        "Auth is required to create a client."
      );
    });
  });

  describe("close", () => {
    test("should call close on the client instance", () => {
      const client = new TestClient(mockAuth);
      client.close();

      const mockGrpcClient = (grpc.Client as jest.Mock).mock.results[0].value;
      expect(mockGrpcClient.close).toHaveBeenCalled();
    });
  });

  describe("metadata generation", () => {
    test("should add auth header to metadata", async () => {
      const client = new TestClient(mockAuth);

      // Get the metadata generator function
      const mockMetadata = new (grpc.Metadata as any as jest.Mock)();
      const generator = (mockMetadata as any).generator;

      // Mock callback
      const mockCallback = jest.fn();

      // Call the generator function
      await generator(null, mockCallback);

      // Check if auth header was added to metadata
      expect(mockAuth.getAuthHeader).toHaveBeenCalled();
      expect(mockMetadata.add).toHaveBeenCalledWith(
        "Authorization",
        "Bearer mock-token"
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockMetadata);
    });
  });
});
