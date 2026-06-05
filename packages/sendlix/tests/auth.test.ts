import { Auth } from "../src/auth/auth";
import { sendlix } from "../src/proto/auth";
import { google } from "../src/proto/google/protobuf/timestamp";

const Timestamp = google.protobuf.Timestamp;

const { AuthResponse } = sendlix.api.v1;

// Mock gRPC client
jest.mock("@grpc/grpc-js", () => ({
  credentials: {
    createSsl: jest.fn(),
  },
}));

// Mock the gRPC client's GetJwtToken method
const mockGetJwtToken = jest.fn();
jest.mock("../src/proto/auth", () => ({
  sendlix: {
    api: {
      v1: {
        AuthRequest: jest.fn().mockImplementation(() => ({})),
        AuthResponse: jest.fn().mockImplementation(() => ({
          token: "",
          expires: { seconds: 0 },
        })),
        ApiKey: jest.fn().mockImplementation(() => ({})),
        AuthClient: jest.fn().mockImplementation(() => ({
          GetJwtToken: mockGetJwtToken,
        })),
      },
    },
  },
}));

describe("Auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test valid API key constructor
  test("should create instance with valid API key format", () => {
    const auth = new Auth("secret.123");
    expect(auth).toBeInstanceOf(Auth);
  });

  // Test API key with insufficient parts
  test("should throw error for API key with insufficient parts", () => {
    expect(() => new Auth("invalidkey")).toThrow(
      "Invalid API key format. Expected format: 'key.value'."
    );
  });

  // Test API key with too many parts
  test("should throw error for API key with too many parts", () => {
    expect(() => new Auth("secret.123.extra")).toThrow(
      "Invalid API key format. Expected format: 'key.value'."
    );
  });

  // Test token caching mechanism
  test("should reuse cached token when not expired", async () => {
    const auth = new Auth("secret.123");
    const mockResponse = new AuthResponse();
    mockResponse.token = "test-token";
    mockResponse.expires = new Timestamp();
    mockResponse.expires.seconds = 3600;

    mockGetJwtToken.mockImplementation((_, callback) => {
      callback(null, mockResponse);
      return { cancel: jest.fn() };
    });

    // First call should make gRPC request
    const header1 = await auth.getAuthHeader();
    expect(mockGetJwtToken).toHaveBeenCalledTimes(1);
    expect(header1).toEqual(["Authorization", "Bearer test-token"]);

    // Second call should use cached token
    const header2 = await auth.getAuthHeader();
    expect(mockGetJwtToken).toHaveBeenCalledTimes(1); // Still only one call
    expect(header2).toEqual(["Authorization", "Bearer test-token"]);
  });

  // Test token refresh when expired
  test("should refresh token when expired", async () => {
    const auth = new Auth("secret.123");
    const now = Date.now();
    let dateNowValue = now;

    // Mock Date.now to control time
    Date.now = jest.fn(() => dateNowValue);

    // First response
    const mockResponse1 = new AuthResponse();
    mockResponse1.token = "token-1";
    mockResponse1.expires = new Timestamp();
    mockResponse1.expires.seconds = 10; // Short expiry

    // Second response
    const mockResponse2 = new AuthResponse();
    mockResponse2.token = "token-2";
    mockResponse2.expires = new Timestamp();
    mockResponse2.expires.seconds = 3600;

    mockGetJwtToken
      .mockImplementationOnce((_, callback) => {
        callback(null, mockResponse1);
        return { cancel: jest.fn() };
      })
      .mockImplementationOnce((_, callback) => {
        callback(null, mockResponse2);
        return { cancel: jest.fn() };
      });

    // First call gets first token
    const header1 = await auth.getAuthHeader();
    expect(header1).toEqual(["Authorization", "Bearer token-1"]);

    // Advance time past expiration
    dateNowValue = now + 11000;

    // Second call should refresh token
    const header2 = await auth.getAuthHeader();
    expect(mockGetJwtToken).toHaveBeenCalledTimes(2);
    expect(header2).toEqual(["Authorization", "Bearer token-2"]);

    // Restore original Date.now
    jest.spyOn(Date, "now").mockRestore();
  });

  // Test gRPC error handling
  test("should reject when gRPC call returns error", async () => {
    const auth = new Auth("secret.123");
    const testError = new Error("gRPC error");

    mockGetJwtToken.mockImplementation((_, callback) => {
      callback(testError, null);
      return { cancel: jest.fn() };
    });

    await expect(auth.getAuthHeader()).rejects.toEqual(testError);
  });

  // Test proper header format
  test("should return properly formatted auth header", async () => {
    const auth = new Auth("secret.123");
    const mockResponse = new AuthResponse();
    mockResponse.token = "formatted-jwt-token";
    mockResponse.expires = new Timestamp();
    mockResponse.expires.seconds = 3600;

    mockGetJwtToken.mockImplementation((_, callback) => {
      callback(null, mockResponse);
      return { cancel: jest.fn() };
    });

    const header = await auth.getAuthHeader();
    expect(header).toEqual(["Authorization", "Bearer formatted-jwt-token"]);
  });
});
