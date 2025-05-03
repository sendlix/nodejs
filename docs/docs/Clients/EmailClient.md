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

### EmailContent

The `EmailContent` object defines the content of an email:

| Property | Type             | Description                       |
| -------- | ---------------- | --------------------------------- |
| value    | string           | The content of the email          |
| type     | 'html' \| 'text' | Content type (HTML or plain text) |
| tracking | boolean          | Optional tracking flag            |

For more information on email tracking, see the documentation: [https://docs.sendlix.com/tracking](https://docs.sendlix.com/tracking)

**note**: Only in html mode, the tracking option is available.

Example:

```javascript
const content = {
  value: "<h1>Hello World!</h1><p>This is a test email.</p>",
  type: "html",
  tracking: true,
};
```

### MailOption

The `MailOption` object configures an email to be sent:

| Property      | Type                                        | Description                                                                                                                                                    |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| from          | [EmailAddress](#emailaddress)               | Sender email address and optional name                                                                                                                         |
| to            | [EmailAddress](#emailaddress)[]             | List of recipient email addresses                                                                                                                              |
| cc            | [EmailAddress](#emailaddress)[]             | Optional list of CC recipients                                                                                                                                 |
| bcc           | [EmailAddress](#emailaddress)[]             | Optional list of BCC recipients                                                                                                                                |
| subject       | string                                      | Subject line of the email                                                                                                                                      |
| content       | [EmailContent](#emailcontent)               | Email content (HTML or text)                                                                                                                                   |
| replyTo       | [EmailAddress](#emailaddress)               | Optional reply-to address                                                                                                                                      |
| substitutions | <nobr>Record&#60;string, string&#62;</nobr> | Substitutions for personalization. The keys should be the placeholders in the email template, and the values should be the actual values to replace them with. |

Example:

```javascript
const emailConfig = {
  from: { email: "sender@example.com", name: "Sender Name" },
  to: [{ email: "recipient@example.com", name: "Recipient Name" }],
  subject: "Test Email",
  content: {
    value: "<h1>Hello World!</h1><p>This is a test email.</p>",
    type: "html",
  },
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
  contentDisposition: "attachment",
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

### sendEmail([MailOption](#mailoption), [additionalOptions](#additionalemailoptions))

Sends an email with the specified configuration.

**Parameters:**

| Name              | Type                                              | Description                  |
| ----------------- | ------------------------------------------------- | ---------------------------- |
| MailOption        | [MailOption](#mailoption)                         | Email configuration          |
| additionalOptions | [AdditionalEmailOptions](#additionalemailoptions) | Optional additional settings |

**Returns:**

- Promise&#60;[Response](#sendemailresponse)&#62;: Promise that resolves with the email sending response

**Example:**

```javascript
const client = new EmailClient("your-api-key");
const response = await client.sendEmail({
  from: { email: "sender@example.com", name: "Sender Name" },
  to: [{ email: "recipient@example.com", name: "Recipient Name" }],
  subject: "Test Email",
  content: {
    value: "<h1>Hello World!</h1><p>This is a test email.</p>",
    type: "html",
  },
});
```

### sendEmlEmail(eml, [additionalOptions](#additionalemailoptions))

Sends a pre-formatted email in EML format. More information on processing EML files can be found in the documentation linked [here](https://docs.sendlix.com/emlemail).

**Parameters:**

| Name              | Type                                              | Description                  |
| ----------------- | ------------------------------------------------- | ---------------------------- |
| eml               | string \| Buffer \| Uint8Array                    | EML content or file path     |
| additionalOptions | [AdditionalEmailOptions](#additionalemailoptions) | Optional additional settings |

**Returns:**

- Promise&#60;[Response](#sendemailresponse)&#62;: Promise that resolves with the email sending response

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

### sendGroupEmail([content](#emailcontent), [from](#emailaddress), groupId, subject)

Sends an email to a group of recipients identified by a group ID.

**Parameters:**

| Name    | Type                          | Description                          |
| ------- | ----------------------------- | ------------------------------------ |
| content | [EmailContent](#emailcontent) | Email content (HTML or text)         |
| from    | [EmailAddress](#emailaddress) | Sender email address and name        |
| groupId | string                        | ID of the group to send the email to |
| subject | string                        | Subject line of the email            |

**Returns:**

- Promise&#60;number&#62;: Number of remaining email credits in the account

**Example:**

```javascript
const client = new EmailClient("your-api-key");
const response = await client.sendGroupEmail(
  {
    value: "<h1>Hello Group!</h1><p>This is a group email.</p>",
    type: "html",
  },
  { email: "sender@example.com", name: "Sender Name" },
  "{groupId}",
  "Group Announcement"
);
```
