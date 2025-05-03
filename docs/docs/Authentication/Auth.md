---
title: Auth
keywords: [node, sdk, methods, objects, api, email]
sidebar_position: 2
---

# Auth

```typescript
import { Auth } from "sendlix";
```

The `Auth` class is the default implementation of the [IAuth](IAuth) interface. It is the main entry point for authentication-related operations in the Sendlix SDK.

This Class retrieves the Access Token from the server. If the Access Token is expired, it will automatically refresh the token.

## Methods

### constructor(apiKey)

Creates a new instance of the `Auth` class.

**Parameters:**

| Name   | Type   |
| ------ | ------ |
| apiKey | string |

Example:

```typescript
import { Auth } from "sendlix";

const auth = new Auth("sk_xxxxxxxxx.xxx");
```

:::important
You can manage and create API keys in the [Sendlix dashboard](https://sendlix.com/en/dashboard/api-keys). Make sure to keep your API key secure and do not share it publicly.
:::
