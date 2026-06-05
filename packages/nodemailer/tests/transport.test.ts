import nodemailer from "nodemailer";
import { SendlixTransport, sendlixTransport } from "../src/index";
import { EmailClient } from "sendlix";

jest.mock("sendlix", () => {
  return {
    EmailClient: jest.fn().mockImplementation(() => {
      return {
        sendEmlEmail: jest.fn().mockResolvedValue({ messageList: ["test-message-id"] })
      };
    })
  };
});

describe("SendlixTransport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a SendlixTransport instance", () => {
    const transport = new SendlixTransport({ apiKey: "test-key" });
    expect(transport.name).toBe("SendlixTransport");
    expect(transport.version).toBe("1.0.0");
    expect(EmailClient).toHaveBeenCalledWith("test-key");
  });

  it("should create transport via factory", () => {
    const transport = sendlixTransport({ apiKey: "test-key" });
    expect(transport).toBeInstanceOf(SendlixTransport);
  });

  it("should send email using nodemailer", async () => {
    const transport = sendlixTransport({ apiKey: "test-key" });
    const mailer = nodemailer.createTransport(transport);

    const info = await mailer.sendMail({
      from: "sender@test.com",
      to: "recipient@test.com",
      subject: "Test Subject",
      text: "Test body"
    });

    expect(info.messageId).toBe("test-message-id");

    // Get the mock instance
    const clientMock = (EmailClient as jest.Mock).mock.results[0].value;
    expect(clientMock.sendEmlEmail).toHaveBeenCalled();
    const emlBuffer = clientMock.sendEmlEmail.mock.calls[0][0];
    expect(Buffer.isBuffer(emlBuffer)).toBe(true);

    const emlString = emlBuffer.toString("utf-8");
    expect(emlString).toContain("Subject: Test Subject");
    expect(emlString).toContain("Test body");
  });
});
