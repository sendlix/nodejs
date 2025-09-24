---
title: Email Client
description: Die EmailClient-Klasse ermöglicht die Interaktion mit der Sendlix Email Service API und bietet Methoden zum Versenden verschiedener Arten von E-Mails.
keywords: [node, sdk, methods, objects, api, email]
---

The `EmailClient` class enables interaction with the Sendlix Email Service API and provides methods for sending various types of emails.

```typescript
import { EmailClient } from "sendlix";

const client = new EmailClient("your-api-key");
```

## Types

### SendEmailResponse

The `SendEmailResponse` type represents the response after sending an email with the Sendlix API.
It contains the following properties:

| Property    | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| messageList | string[] | List of IDs of the sent email messages           |
| emailsLeft  | number   | Number of remaining email credits in the account |

Example:

```json
{
  "messageList": ["msg_1234567890"],
  "emailsLeft": 10000
}
```

### Images

The `Images` type represents the configuration for image attachments in an email.
It contains the following properties:
| Property | Type | Description |
| ----------- | ------------------------ | ------------------------------------------------ |
| placeholder | string | Placeholder string in the email content to be replaced by the image |
| data | ArrayBuffer \| Uint8Array | Binary data of the image |
| type | "PNG" \| "JPG" \| "GIF" | Type of the image |

Example:

```javascript
const imageAttachment = {
  placeholder: "{{image1}}",
  data: fs.readFileSync("path/to/image.png"),
  type: "PNG",
};
```

### EmailAddress

The `EmailAddress` type can be either a string or an object with the following properties:

| Property | Type   | Description           |
| -------- | ------ | --------------------- |
| email    | string | The email address     |
| name     | string | Optional display name |

Examples:

```javascript
// As a string
const address1 = "user@example.com";

// As an object
const address2 = {
  email: "user@example.com",
  name: "John Doe",
};
```

### mailOption

The `mailOption` object configures an email to be sent:

| Property | Type                            | Description                               |
| -------- | ------------------------------- | ----------------------------------------- |
| from     | [EmailAddress](#emailaddress)   | Sender email address and optional name    |
| to       | [EmailAddress](#emailaddress)[] | List of recipient email addresses         |
| cc       | [EmailAddress](#emailaddress)[] | Optional list of CC recipients            |
| bcc      | [EmailAddress](#emailaddress)[] | Optional list of BCC recipients           |
| subject  | string                          | Subject line of the email                 |
| replyTo  | [EmailAddress](#emailaddress)   | Optional reply-to address                 |
| html     | string                          | Optional HTML content of the email        |
| text     | string                          | Optional plain text content of the email  |
| tracking | boolean                         | Optional flag for tracking links in email |

> **Note:** At least one of `html` or `text` must be provided. If both are provided, the email will be sent as a multipart message.

Example:

```javascript
const emailConfig = {
  from: { email: "sender@example.com", name: "Sender Name" },
  to: [{ email: "recipient@example.com", name: "Recipient Name" }],
  subject: "Test Email",
  html: "<h1>Hello World!</h1><p>This is a test email.</p>",
  text: "Hello World! This is a test email.",
  tracking: true,
};
```

### Attachment

The `Attachment` object configures an email attachment:

| Property    | Type   | Description                                  |
| ----------- | ------ | -------------------------------------------- |
| contentURL  | string | URL or path to the content of the attachment |
| filename    | string | Name of the file displayed to recipients     |
| contentType | string | Optional MIME type                           |

Example:

```javascript
const attachment = {
  contentURL: "https://example.com/document.pdf",
  filename: "document.pdf",
  contentType: "application/pdf",
};
```

### AdditionalEmailOptions

The `AdditionalEmailOptions` object provides additional options for sending emails:

| Property    | Type                        | Description                                                                                   |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| attachments | [Attachment](#attachment)[] | Optional list of email attachments                                                            |
| category    | string                      | Optional category for the email                                                               |
| send_at     | Date                        | Optional scheduled send time. The sending time needs to be at least 15 minutes in the future. |

Example:

```javascript
const additionalOptions = {
  attachments: [
    {
      contentURL: "https://example.com/document.pdf",
      filename: "document.pdf",
      contentType: "application/pdf",
    },
  ],
  category: "marketing",
  send_at: new Date("2025-04-01T10:00:00Z"),
};
```

### GroupMailData

The `GroupMailData` object configures an email to be sent to a group:

| Property | Type                          | Description                               |
| -------- | ----------------------------- | ----------------------------------------- |
| from     | [EmailAddress](#emailaddress) | Sender email address and optional name    |
| groupId  | string                        | ID of the group to send the email to      |
| subject  | string                        | Subject line of the email                 |
| category | string                        | Optional category for the email           |
| html     | string                        | Optional HTML content of the email        |
| text     | string                        | Optional plain text content of the email  |
| tracking | boolean                       | Optional flag for tracking links in email |

> **Note:** At least one of `html` or `text` must be provided. If both are provided, the email will be sent as a multipart message.

Example:

```javascript
const groupMailData = {
  from: { email: "sender@example.com", name: "Sender Name" },
  groupId: "group-123",
  subject: "Group Announcement",
  html: "<h1>Hello Group!</h1><p>This is a group email.</p>",
  text: "Hello Group! This is a group email.",
  tracking: true,
};
```

## Methods

### constructor(auth)

Creates a new EmailClient instance.

**Parameters:**

| Name | Type                                       | Description                       |
| ---- | ------------------------------------------ | --------------------------------- |
| auth | string \| [IAuth](../Authentication/IAuth) | API key or authentication handler |

**Example:**

```javascript
const client = new EmailClient("your-api-key");
```

### sendEmail(mailOption, additionalOptions)

Sends an email with the specified configuration.

**Parameters:**

| Name              | Type                                              | Description                  |
| ----------------- | ------------------------------------------------- | ---------------------------- |
| mailOption        | [mailOption](#mailoption)                         | Email configuration          |
| additionalOptions | [AdditionalEmailOptions](#additionalemailoptions) | Optional additional settings |

**Returns:**

- Promise&#60;[Response](#response)&#62;: Promise that resolves with the email sending response

**Example:**

```javascript
const client = new EmailClient("your-api-key");
const response = await client.sendEmail({
  from: { email: "sender@example.com", name: "Sender Name" },
  to: [{ email: "recipient@example.com", name: "Recipient Name" }],
  subject: "Test Email",
  html: "<h1>Hello World!</h1><p>This is a test email.</p>",
  text: "Hello World! This is a test email.",
});
```

### sendEmlEmail(eml, additionalOptions)

Sends a pre-formatted email in EML format.

**Parameters:**

| Name              | Type                                              | Description                  |
| ----------------- | ------------------------------------------------- | ---------------------------- |
| eml               | string \| Buffer \| Uint8Array                    | EML content or file path     |
| additionalOptions | [AdditionalEmailOptions](#additionalemailoptions) | Optional additional settings |

**Returns:**

- Promise&#60;[Response](#response)&#62;: Promise that resolves with the email sending response

**Example:**

```javascript
const client = new EmailClient("your-api-key");
// Sending an EML file
const response = await client.sendEmlEmail("path/to/email.eml");

// Or with a Buffer
const emlBuffer = fs.readFileSync("path/to/email.eml");
const response = await client.sendEmlEmail(emlBuffer);
```

For more information on processing Eml emails, see the documentation: [https://docs.sendlix.com/emlemail](https://docs.sendlix.com/emlemail)

### sendGroupEmail(groupData)

Sends an email to a group of recipients identified by a group ID.

**Parameters:**

| Name      | Type                            | Description               |
| --------- | ------------------------------- | ------------------------- |
| groupData | [GroupMailData](#groupmaildata) | Group email configuration |

**Returns:**

- Promise&#60;number&#62;: Number of remaining email credits in the account

**Example:**

```javascript
const client = new EmailClient("your-api-key");
const emailsLeft = await client.sendGroupEmail({
  from: { email: "sender@example.com", name: "Sender Name" },
  groupId: "group-123",
  subject: "Group Announcement",
  html: "<h1>Hello Group!</h1><p>This is a group email.</p>",
});
```

```

```
