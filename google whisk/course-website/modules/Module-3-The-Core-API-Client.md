# Module 3: The Core API Client (`Whisk.ts`)

In this module, we examine `Whisk.ts`, the heart of the library. This file is responsible for managing authentication and providing the static methods to interact with the broader Whisk API.

## 1. Managing Authentication (`Account` Class)

To interact with Google APIs, you need more than just a cookie; you often need an ephemeral `Bearer Token` that is generated using that cookie.

The `Account` class encapsulates the user's session:
```typescript
export class Account {
    private cookie: string;
    private authToken?: string;
    private expiryDate?: Date;

    constructor(cookie: string, authToken?: string) {
        this.cookie = cookie;
        // ...
    }

    async refresh() {
        const session = await request<any>(
            "https://labs.google/fx/api/auth/session",
            { headers: { cookie: this.cookie } }
        );
        this.authToken = session.access_token;
        this.expiryDate = new Date(session.expires);
    }
    
    async getToken(): Promise<string> {
        if (this.isExpired()) await this.refresh();
        return this.authToken!;
    }
}
```
Whenever a request requires authentication, the system calls `await account.getToken()`. If the token has expired, it automatically hits the `/session` endpoint with the cookie to fetch a fresh token.

## 2. The `Whisk` Class

The `Whisk` class acts as the central interface. It holds the `Account` instance and exposes various static and instance methods.

### Instantiation
```typescript
export class Whisk {
    readonly account: Account;

    constructor(cookie: string, authToken?: string) {
        this.account = new Account(cookie, authToken);
    }
    // ...
}
```

### Static Methods for General Tasks
Some actions in Whisk don't require an active "Project" (Workflow). For these, `Whisk.ts` provides static methods.

For example, fetching an existing media item:
```typescript
static async getMedia(mediaId: string, account: Account): Promise<Media> {
    const mediaInfo = await request<any>(
        `https://aisandbox-pa.googleapis.com/v1/media/${mediaId}?key=AIzaSy...`,
        {
            headers: {
                "Referer": "https://labs.google/",
                "Authorization": `Bearer ${await account.getToken()}`,
            },
        }
    );
    // Maps the raw JSON into a strongly typed `Media` object
    return new Media({...});
}
```

### Creating Projects
The most important instance method is `newProject`. In Google's backend, generations are grouped into "Workflows".

```typescript
async newProject(projectName?: string): Promise<Project> {
    const projectInfo = await request<{ workflowId: string }>(
        "https://labs.google/fx/api/trpc/media.createOrUpdateWorkflow",
        {
            headers: { cookie: this.account.getCookie() },
            body: JSON.stringify({
                "json": { "workflowMetadata": { "workflowName": projectName } }
            })
        }
    );
    return new Project(projectInfo.workflowId, this.account);
}
```

## Summary
The `Whisk` class effectively hides the complexity of token expiration and session management from the user. It also provides the entry point for retrieving existing media or spawning new Projects. In **Module 4**, we will look at how `Project.ts` orchestrates the image generation process.
