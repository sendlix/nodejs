---
title: Group Client
description: The Group Client is a part of the Sendlix SDK that allows you to manage groups in the system. This includes creating, updating, and deleting groups, as well as managing group members and their permissions.
keywords: [node, sdk, methods, objects, api, email]
---

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

### insertEmailIntoGroup(groupId, email, substitutions)

This method allows you to add a email address to a group, along with any substitutions that may be needed for personalization.

:::warning
You can add an email address multiple times to the same group. When sending a group email, the user will receive multiple copies of the same email.
:::
**Parameters:**

| Name          | Type                                        | Description                                                                                                                                                    |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| groupId       | string                                      | The ID of the group                                                                                                                                            |
| email         | string                                      | The email address to add                                                                                                                                       |
| substitutions | <nobr>Record&#60;string, string&#62;</nobr> | Substitutions for personalization. The keys should be the placeholders in the email template, and the values should be the actual values to replace them with. |

**Returns:**

- Promise&#60;bool&#62;: Promise that resolves if the email was added successfully

**Example:**

```javascript
const client = new GroupClient("your-api-key");

const groupId = "group-id";
const email = "your@email.com";
const substitutions = {
  "{{name}}": "John Doe",
  "{{age}}": "30",
};

const response = await client.insertEmailIntoGroup(
  groupId,
  email,
  substitutions
);

if (response) {
  console.log("Email added to group successfully.");
} else {
  console.log("Failed to add email to group.");
}
```

### deleteEmailFromGroup(groupId, email)

This method allows you to remove a email address from a group.

:::info
Only emails that are added 30 minutes can be removed from the group.
:::

**Parameters:**

| Name    | Type   | Description                 |
| ------- | ------ | --------------------------- |
| groupId | string | The ID of the group         |
| email   | string | The email address to remove |

**Returns:**

- Promise&#60;bool&#62;: Promise that resolves if the email was removed successfully

**Example:**

```javascript
const client = new GroupClient("your-api-key");

const groupId = "group-id";
const email = "your@email.com";

const response = await client.deleteEmailFromGroup(groupId, email);

if (response) {
  console.log("Email removed from group successfully.");
} else {
  console.log("Failed to remove email from group.");
}
```

### containsEmailInGroup(groupId, email)

This method checks if a email address is already in a group.

**Parameters:**

| Name    | Type   | Description                |
| ------- | ------ | -------------------------- |
| groupId | string | The ID of the group        |
| email   | string | The email address to check |

**Returns:**

- Promise&#60;bool&#62;: Promise that resolves with true if the email is in the group, false otherwise

**Example:**

```javascript
const client = new GroupClient("your-api-key");

const groupId = "group-id";
const email = "your@email.com";

const response = await client.containsEmailInGroup(groupId, email);

if (response) {
  console.log("Email is in the group.");
} else {
  console.log("Email is not in the group.");
}
```
