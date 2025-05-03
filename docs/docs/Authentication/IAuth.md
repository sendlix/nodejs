---
title: IAuth
keywords: [node, sdk, methods, objects, api, email]
sidebar_position: 3
---

```typescript
import { IAuth } from "sendlix";
```

The `IAuth` interface defines the structure for authentication-related methods in the Sendlix SDK. It includes methods for user login, logout, and password reset.

| Method        | Description                                           | Parameters | Returns                     |
| ------------- | ----------------------------------------------------- | ---------- | --------------------------- |
| getAuthHeader | Retrieves the authentication header for API requests. | None       | `Promise<[string, string]>` |

<br />

:::info
The default implementation of the `IAuth` interface is the [`Auth`](Auth) class. This class handles the authentication process, including token management and API key validation.
:::
