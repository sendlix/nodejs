# NodeJS SDK for Sendlix

This SDK enables the integration of the Sendlix API into NodeJS applications. It provides clients for email sending, group management, and other functionalities.

## Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Available Clients](#available-clients)
  - [EmailClient](#emailclient)
  - [GroupClient](#groupclient)
- [Examples](#examples)
- [Contributing and Support](#contributing-and-support)

## Installation

Install the SDK via npm:

```bash
npm install sendlix
```

## Getting Started

Import the SDK into your project:

```typescript
import { EmailClient, GroupClient, IAuth } from "sendlix";
```

## Authentication

The SDK uses an API key for authentication. The API key must be in the format `secret.keyId` (When you copy it from the [dashboard](https://sendlix.com/en/dashbord/api-key), it's already in the correct format). There are two options:

1. Passing an API key string:

   ```typescript
   const emailClient = new EmailClient("sk_xxxxxxxxx.xxx");
   ```

2. Using an IAuth instance:
   ```typescript
   import { Auth } from "sendlix-nodejs-sdk";
   const auth: IAuth = new Auth("sk_xxxxxxxxx.xxx");
   const emailClient = new EmailClient(auth);
   const groupClient = new GroupClient(auth);
   ```

We recommend using the second option when you want to use both clients. This way, the auth token is only requested once and passed to both clients.

## Available Clients

### EmailClient

The EmailClient allows you to send emails, both standardized emails and pre-formatted EML messages.

#### Methods

- `sendEmail(sendMail, additionalOptions?)`  
  Sends a configured email.

- `sendRawEmail(eml, additionalOptions?)`  
  Sends an EML file or EML string.

- `sendGroupEmail(content, from, groupId, subject)`  
  Sends an email to a defined group.

- `sendEmailWithTracking(sendMail, additionalOptions?)`  
  Sends an email with tracking for clicks and opens.

### GroupClient

The GroupClient allows you to add email addresses to groups or remove them from groups.

#### Methods

- `insertEmailIntoGroup(groupId, email, substitutions?)`  
  Adds one or more email addresses to a group.

- `deleteEmailFromGroup(groupId, email)`  
  Removes an email address from a group. Note: The email must be in the group for at least 30 minutes.
- `containsEmailInGroup(groupId, email)`  
  Checks if an email address is in a group.

## Examples

### Sending an Email

```typescript
import { EmailClient } from "sendlix-nodejs-sdk";

// Initialize client
const client = new EmailClient("sk_xxxxxxxxx.xxx");

// Email configuration
const sendMail = {
  from: { email: "sender@example.com", name: "Sender Name" },
  to: [{ email: "recipient@example.com", name: "Recipient Name" }],
  subject: "Hello World!",
  html: "<h1>Welcome!</h1><p>This is a test email.</p>",
};

// Send email
client
  .sendEmail(sendMail)
  .then((response) => {
    console.log("Email sent:", response);
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

### Adding an Email to a Group

```typescript
import { GroupClient } from "sendlix-nodejs-sdk";

// Initialize client
const groupClient = new GroupClient("sk_xxxxxxxxx.xxx");

groupClient
  .insertEmailIntoGroup("groupId123", "recipient@example.com")
  .then((success) => {
    console.log("Email added to group:", success);
  })
  .catch((error) => {
    console.error("Error adding email to group:", error);
  });
```

## Contributing and Support

Contributions to the SDK are welcome. Please use Issues and Pull Requests to report bugs or suggest new features.

For questions or problems, please contact Sendlix support or refer to the appropriate community forums.

---

This SDK was developed to facilitate the use of the Sendlix API in NodeJS applications. Follow the [Sendlix Documentation](https://docs.sendlix.com) for more details about the API endpoints and advanced configuration options.
