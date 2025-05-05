import { EmailClient } from "../../src/Clients/EmailClient";
import { IAuth } from "../../src/auth/IAuth";
import { readFile } from "fs/promises";
import { sendlix } from "../../src/proto/email";

const { EmlMailRequest, GroupMailData, SendMailRequest } = sendlix.api.v1;

// filepath: z:\Programs\Webseite\Sendlix\api\sdks\nodejs\src\Clients\EmailClient.test.ts

jest.mock("fs/promises", () => {
  return {
    readFile: jest.fn(),
  };
});

interface GRPCResponse {
  message?: string[];
  emailsLeft?: number;
}

describe("EmailClient", () => {
  let dummyAuth: IAuth;
  let emailClient: EmailClient;

  beforeEach(() => {
    dummyAuth = {
      getAuthHeader: jest
        .fn()
        .mockResolvedValue(["Authorization", "Bearer dummy-token"]),
    };
    emailClient = new EmailClient(dummyAuth);
  });

  describe("sendEmail", () => {
    let sendEmailMock: (
      mailData: InstanceType<typeof SendMailRequest>,
      callback: (error: Error | null, response: GRPCResponse) => void
    ) => void;

    beforeEach(() => {
      sendEmailMock = jest.fn(
        (
          mailData: InstanceType<typeof SendMailRequest>,
          callback: (error: Error | null, response: GRPCResponse) => void
        ) => {
          const response: GRPCResponse = {
            emailsLeft: 42,
            message: ["msg-1", "msg-2"],
          };
          callback(null, response);
        }
      );
      // Override client with our stub:
      (
        emailClient as unknown as {
          client: { SendEmail: typeof sendEmailMock };
        }
      ).client = {
        SendEmail: sendEmailMock,
      };
    });

    test("should send email and return response", async () => {
      const sendMailConfig = {
        from: { email: "sender@example.com", name: "Sender" },
        to: [{ email: "recipient@example.com", name: "Recipient" }],
        subject: "Test subject",
        html: "<p>Hello</p>",
      };

      const result = await emailClient.sendEmail(sendMailConfig);
      expect(result).toEqual({
        messageList: ["msg-1", "msg-2"],
        emailsLeft: 42,
      });
      expect(sendEmailMock).toHaveBeenCalledTimes(1);
    });

    test("should reject when gRPC returns error", async () => {
      sendEmailMock = jest.fn(
        (
          mailData: InstanceType<typeof SendMailRequest>,
          callback: (error: Error | null, response: GRPCResponse) => void
        ) => {
          callback(new Error("gRPC error"), {
            emailsLeft: 0,
            message: [],
          });
        }
      );
      (
        emailClient as unknown as {
          client: { SendEmail: typeof sendEmailMock };
        }
      ).client = {
        SendEmail: sendEmailMock,
      };

      const sendMailConfig = {
        from: { email: "sender@example.com" },
        to: [{ email: "recipient@example.com" }],
        subject: "Test subject",
        text: "Hello",
      };

      await expect(emailClient.sendEmail(sendMailConfig)).rejects.toThrow(
        "gRPC error"
      );
    });
  });

  describe("sendRawEmail", () => {
    let sendEmlEmailMock: (
      emlMail: InstanceType<typeof EmlMailRequest>,
      callback: (error: Error | null, response: GRPCResponse) => void
    ) => void;
    const mockedReadFile = readFile as jest.Mock;

    beforeEach(() => {
      sendEmlEmailMock = jest.fn(
        (
          emlMail: InstanceType<typeof EmlMailRequest>,
          callback: (error: Error | null, response: GRPCResponse) => void
        ) => {
          const response: GRPCResponse = {
            emailsLeft: 99,
            message: ["eml-msg"],
          };
          callback(null, response);
        }
      );
      (
        emailClient as unknown as {
          client: { SendEmlEmail: typeof sendEmlEmailMock };
        }
      ).client = {
        SendEmlEmail: sendEmlEmailMock,
      };
    });

    test("should send eml email from file path", async () => {
      mockedReadFile.mockResolvedValue("eml email content");
      const result = await emailClient.sendEmlEmail("path/to/eml");
      expect(mockedReadFile).toHaveBeenCalledWith("path/to/eml", "utf8");
      expect(result).toEqual({ messageList: ["eml-msg"], emailsLeft: 99 });
      expect(sendEmlEmailMock).toHaveBeenCalledTimes(1);
    });

    test("should send eml email when input is Buffer", async () => {
      mockedReadFile.mockReset();

      const bufferInput = Buffer.from("eml email buffer");
      const result = await emailClient.sendEmlEmail(bufferInput);
      expect(mockedReadFile).not.toHaveBeenCalled();
      expect(result).toEqual({ messageList: ["eml-msg"], emailsLeft: 99 });
      expect(sendEmlEmailMock).toHaveBeenCalledTimes(1);
    });

    test("should reject when gRPC sendRawEmail returns error", async () => {
      sendEmlEmailMock = jest.fn(
        (
          emlMail: InstanceType<typeof EmlMailRequest>,
          callback: (error: Error | null, response: GRPCResponse) => void
        ) => {
          callback(new Error("sendRawEmail error"), {
            emailsLeft: 0,
            message: [],
          });
        }
      );
      (
        emailClient as unknown as {
          client: { SendEmlEmail: typeof sendEmlEmailMock };
        }
      ).client = {
        SendEmlEmail: sendEmlEmailMock,
      };
      await expect(
        emailClient.sendEmlEmail(Buffer.from("data"))
      ).rejects.toThrow("sendRawEmail error");
    });
  });

  describe("sendGroupEmail", () => {
    let sendGroupEmailMock: (
      groupSendMailRequest: InstanceType<typeof GroupMailData>,
      callback: (error: Error | null, response: GRPCResponse) => void
    ) => void;

    beforeEach(() => {
      sendGroupEmailMock = jest.fn(
        (
          groupSendMailRequest: InstanceType<typeof GroupMailData>,
          callback: (error: Error | null, response: GRPCResponse) => void
        ) => {
          const response: GRPCResponse = {
            emailsLeft: 5,
            message: ["group-msg"],
          };
          callback(null, response);
        }
      );
      (
        emailClient as unknown as {
          client: { SendGroupEmail: typeof sendGroupEmailMock };
        }
      ).client = {
        SendGroupEmail: sendGroupEmailMock,
      };
    });

    test("should send group email and return response", async () => {
      const from = { email: "group@sender.com" };
      const groupId = "group-123";
      const subject = "Group Subject";

      const result = await emailClient.sendGroupEmail({
        from: from,
        subject: subject,
        html: "<p>Group Email</p>",
        groupId: groupId,
      });
      expect(result).toEqual(5);
      expect(sendGroupEmailMock).toHaveBeenCalledTimes(1);
    });
  });
});
