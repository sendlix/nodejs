import { IAuth } from "../IAuth";

import { sendlix } from "../proto/email";
import { EmailData } from "../proto/EmailData";
import { readFile } from "fs/promises";
import { google } from "../proto/google/protobuf/timestamp";
import { Client } from "./Client";

const {
  MailData,
  MailContent,
  MailContentType,
  AdditionalInfos,
  AttachmentData,
  EmlMail,
  EmailClient: gRPCEmailClient,
  GroupMailData,
} = sendlix.api.v1;

/**
 * Response type for the email sending operation
 * @typedef {Object} SendEmailResponse
 * @property {string[]} messageList - List of the email messages ids sent
 * @property {number} emailsLeft - Number of email credits left in the account
 */
type Response = {
  messageList: string[];
  emailsLeft: number;
};

/**
 * Configuration object for sending an email
 * @typedef {Object} mailOption
 * @property {EmailAddress} from - Sender email address and optional name
 * @property {EmailAddress[]} to - List of recipient email addresses
 * @property {EmailAddress[]} [cc] - Optional list of CC recipients
 * @property {EmailAddress[]} [bcc] - Optional list of BCC recipients
 * @property {string} subject - Email subject line
 * @property {EmailContent} content - Email content (HTML or text)
 * @property {EmailAddress} [replyTo] - Optional reply-to address
 * @property {Record<string, string>} [substitutions] - Optional key-value pairs for template substitutions
 *
 */
type mailOption = {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  content: EmailContent;
  replyTo?: EmailAddress;
  substitutions?: Record<string, string>;
};

/**
 * Email content configuration
 * @typedef {Object} EmailContent
 * @property {string} value - The content of the email
 * @property {'html'|'text'} type - Content type (HTML or plain text)
 * @property {boolean} [tracking] - Optional flag for tracking links in the email
 */
type EmailContent = {
  value: string;
  type: "html" | "text";
  tracking?: boolean;
};

/**
 * Email address with optional display name
 * @typedef {Object} EmailAddress
 * @property {string} email - The email address
 * @property {string} [name] - Optional display name
 */
type EmailAddress =
  | {
      email: string;
      name?: string;
    }
  | string;

/**
 * Additional options for sending emails
 * @typedef {Object} AdditionalEmailOptions
 * @property {Attachment[]} [attachments] - Optional list of email attachments
 * @property {string} [category] - Optional category for the email
 * @property {Date} [send_at] - Optional scheduled send time
 */
type AdditionalEmailOptions = {
  attachments?: Attachment[];
  category?: string;
  send_at?: Date;
};

/**
 * Email attachment configuration
 * @typedef {Object} Attachment
 * @property {string} contentURL - URL or path to the attachment content
 * @property {string} filename - Name of the file shown to recipients
 * @property {string} [contentType] - Optional MIME type
 * @property {string} [contentDisposition] - Optional content disposition (inline/attachment)
 */
type Attachment = {
  contentURL: string;
  filename: string;
  contentType?: string;
};

/**
 * Client for interacting with Sendlix Email Service API
 * Provides methods for sending various types of emails
 */
export class EmailClient extends Client<typeof gRPCEmailClient> {
  /**
   * Creates a new EmailClient instance
   * @param {IAuth|string} auth - Authentication credentials or API key
   */
  constructor(auth: IAuth | string) {
    super(auth, gRPCEmailClient);
  }

  /**
   * Sends an email with the specified configuration
   * @param {mailOption} mailOption - Email configuration
   * @param {AdditionalEmailOptions} [additionalOptions] - Optional additional settings
   * @returns {Promise<Response>} Promise resolving to the email send response
   * @example
   * const client = new EmailClient('your-api-key');
   * const response = await client.sendEmail({
   *    from: { email: 'sender@example.com', name: 'Sender Name' },
   *    to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
   *    subject: 'Test Email',
   *    content: {
   *        value: '<h1>Hello World!</h1><p>This is a test email.</p>',
   *        type: 'html'
   *    },
   * });
   *
   */
  public sendEmail(
    mailOption: mailOption,
    additionalOptions?: AdditionalEmailOptions
  ): Promise<Response> {
    if (
      !mailOption.from ||
      !mailOption.from ||
      !mailOption.subject ||
      !mailOption.to ||
      !mailOption.content
    ) {
      throw new Error(
        "Missing required fields: from, to, subject, and content are required."
      );
    }
    if (
      mailOption.content.type !== "html" &&
      mailOption.content.tracking === true
    ) {
      throw new Error("Tracking is only available for HTML content.");
    }

    const mailData = new MailData({
      from: createEmailAddress(mailOption.from),
      to: mailOption.to.map(createEmailAddress),
      subject: mailOption.subject,
      content: createMailContent(mailOption.content),
    });
    if (mailOption.cc) {
      mailData.cc = mailOption.cc.map(createEmailAddress);
    }
    if (mailOption.bcc) {
      mailData.bcc = mailOption.bcc.map(createEmailAddress);
    }
    if (mailOption.replyTo) {
      mailData.reply_to = createEmailAddress(mailOption.replyTo);
    }

    if (mailOption.substitutions) {
      const sub = mailData.substitutions;
      for (const key in mailOption.substitutions) {
        if (mailOption.substitutions.hasOwnProperty(key)) {
          sub.set(key, mailOption.substitutions[key]);
        }
      }
    }

    if (additionalOptions) {
      const additionalInfos = createAdditionalEmailOptions(additionalOptions);
      mailData.additionalInfos = additionalInfos;
    }

    return new Promise<Response>((resolve, reject) => {
      this.client.SendEmail(mailData, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            messageList: response?.message || [],
            emailsLeft: response?.emailsLeft!,
          });
        }
      });
    });
  }

  /**
   * Sends a pre-formatted email in raw EML format
   *
   * For more information on how to we handle raw emails, please refer to the documentation:
   *
   * https://docs.sendlix.com/docs/eml
   *
   * @param {string|Buffer|Uint8Array} eml - Raw email in EML format, can be a filepath string
   * @param {AdditionalEmailOptions} [additionalOptions] - Optional additional settings
   * @returns {Promise<Response>} Promise resolving to the email send response
   */
  public async sendEmlEmail(
    eml: string | Buffer | Uint8Array,
    additionalOptions?: AdditionalEmailOptions
  ): Promise<Response> {
    if (typeof eml === "string") {
      eml = await readFile(eml, "utf8");
    }

    if (eml instanceof Buffer) {
      eml = new Uint8Array(eml.buffer, eml.byteOffset, eml.byteLength);
    }

    const rawMail = new EmlMail();
    rawMail.mail = eml as Uint8Array;

    if (additionalOptions) {
      const additionalInfos = createAdditionalEmailOptions(additionalOptions);
      rawMail.additionalInfos = additionalInfos;
    }

    return new Promise<Response>((resolve, reject) => {
      this.client.SendEmlEmail(rawMail, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            messageList: response?.message || [],
            emailsLeft: response?.emailsLeft!,
          });
        }
      });
    });
  }

  /**
   * Sends an email to a group of recipients identified by a group ID
   * @param {EmailContent} content - Email content (HTML or text)
   * @param {EmailAddress} from - Sender email address
   * @param {string} groupId - ID of the recipient group
   * @param {string} subject - Email subject line
   * @param {string} [category] - Optional category for the emails
   * @returns {Promise<number>} Promise resolving to the number of emails left in the account
   */
  public async sendGroupEmail(
    content: EmailContent,
    from: EmailAddress,
    groupId: string,
    subject: string,
    category?: string
  ): Promise<number> {
    const mailData = new GroupMailData();
    mailData.from = createEmailAddress(from);
    mailData.groupId = groupId;
    mailData.subject = subject;
    mailData.content = createMailContent(content);
    if (category) {
      mailData.category = category;
    }

    return new Promise<number>((resolve, reject) => {
      this.client.SendGroupEmail(mailData, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.emailsLeft!);
        }
      });
    });
  }
}

/**
 * Creates an EmailData object from an EmailAddress
 * @param {EmailAddress} email - The email address object to convert
 * @returns {EmailData} The converted gRPC EmailData object
 * @private
 */
function createEmailAddress(email: EmailAddress): EmailData {
  const emailData = new EmailData();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof email === "string") {
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address format");
    }

    emailData.email = email;

    return emailData;
  }

  emailData.email = email.email;

  if (!emailRegex.test(email.email)) {
    throw new Error("Invalid email address format");
  }

  if (email.name) {
    emailData.name = email.name;
  }
  return emailData;
}

/**
 * Creates an AdditionalInfos object from AdditionalEmailOptions
 * @param {AdditionalEmailOptions} additionalOptions - The options to convert
 * @returns {AdditionalInfos} The converted gRPC AdditionalInfos object
 * @private
 */
function createAdditionalEmailOptions(
  additionalOptions: AdditionalEmailOptions
): InstanceType<typeof AdditionalInfos> {
  const additionalInfos = new AdditionalInfos();
  if (additionalOptions.attachments) {
    const attachments = additionalOptions.attachments.map((attachment) => {
      const attachmentData = new AttachmentData();
      attachmentData.contentUrl = attachment.contentURL;
      attachmentData.filename = attachment.filename;
      if (attachment.contentType) {
        attachmentData.type = attachment.contentType;
      }
      return attachmentData;
    });
    additionalInfos.attachments = attachments;
  }
  if (additionalOptions.category) {
    additionalInfos.category = additionalOptions.category;
  }
  if (additionalOptions.send_at) {
    const timestamp = new google.protobuf.Timestamp();
    timestamp.seconds = Math.floor(additionalOptions.send_at.getTime() / 1000);
    additionalInfos.send_at = timestamp;
  }
  return additionalInfos;
}

/**
 * Creates a MailContent object from EmailContent
 * @param {EmailContent} content - The content to convert
 * @returns {MailContent} The converted gRPC MailContent object
 * @private
 */
function createMailContent(
  content: EmailContent
): InstanceType<typeof MailContent> {
  const mailContent = new MailContent();
  mailContent.value = content.value;
  mailContent.tracking = content.tracking || false;

  switch (content.type) {
    case "html":
      mailContent.type = MailContentType.HTML;
      break;
    case "text":
      mailContent.type = MailContentType.TEXT;
      break;
    default:
      throw new Error("Invalid content type");
  }
  return mailContent;
}
