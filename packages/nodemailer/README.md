# @sendlix/nodemailer

Nodemailer transport for the Sendlix API.

## Installation

```bash
npm install @sendlix/nodemailer nodemailer
```

## Usage

```typescript
import nodemailer from "nodemailer";
import { sendlixTransport } from "@sendlix/nodemailer";

const transport = nodemailer.createTransport(sendlixTransport());

async function sendEmail() {
  const info = await transport.sendMail({
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "Hello from Sendlix",
    text: "This email is sent via Sendlix API through Nodemailer!",
    html: "<b>This email is sent via Sendlix API through Nodemailer!</b>"
  });

  console.log("Message sent:", info.messageId);
}

sendEmail();
```

## Configuration

### Environment Variables

If the `SENDLIX_API_KEY` environment variable is set, the `sendlixTransport` parameter object is optional:

```typescript
// With environment variable SENDLIX_API_KEY set
const transport = nodemailer.createTransport(sendlixTransport());
```

Without the environment variable, you must pass the `apiKey` option:

```typescript
// Without environment variable
const transport = nodemailer.createTransport(
  sendlixTransport({
    apiKey: "your-sendlix-api-key",
  })
);
```
