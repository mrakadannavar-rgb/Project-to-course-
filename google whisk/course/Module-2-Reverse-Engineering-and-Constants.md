# Module 2: Reverse Engineering & Core Constants

In this module, we will explore the foundational blocks of the `whisk-api`. Building an unofficial API requires reverse engineering the web client to understand how it communicates with the server.

## 1. The Challenge of Unofficial APIs

Google's ImageFX tool (from labs.google) is a web application. When a user clicks "Generate", their browser sends a network request containing the prompt, their session cookie, and a specific model ID.

Because there is no official public API, the `whisk-api` acts like a "headless browser", sending those exact same requests programmatically. To do this, we need:
1. **The Endpoint URL:** E.g., `https://aisandbox-pa.googleapis.com/v1:runImageFx`.
2. **Authentication:** The `Cookie` header from a real logged-in session.
3. **Payload Structure:** What JSON the server expects.

## 2. Defining the Constants (`Constants.ts`)

In `src/Constants.ts`, the project stores all the "magic strings" discovered during the reverse engineering process. By centralizing these, the code remains clean and easy to update if Google changes its API.

```typescript
export const ImageGenerationModel = Object.freeze({
    IMAGEN_3_5: "IMAGEN_3_5",
} as const);

export const VideoGenerationModel = Object.freeze({
    VEO_3_1: "VEO_3_1_I2V_12STEP",
} as const);

export const ImageAspectRatio = Object.freeze({
    SQUARE: "IMAGE_ASPECT_RATIO_SQUARE",
    PORTRAIT: "IMAGE_ASPECT_RATIO_PORTRAIT",
    LANDSCAPE: "IMAGE_ASPECT_RATIO_LANDSCAPE",
    UNSPECIFIED: "IMAGE_ASPECT_RATIO_UNSPECIFIED",
} as const);
```

Using `Object.freeze` ensures that these constants cannot be accidentally mutated during runtime.

## 3. Network Utilities (`Utils.ts`)

To communicate with the backend, we need a robust HTTP client. In `src/Utils.ts`, there is a custom `request` function that wraps the native `fetch` API to handle common tasks like throwing errors when the status is not `ok`, and extracting the specific JSON path `json.result.data.json.result` used by Google's tRPC backend.

```typescript
export async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    if (init) {
        init.method = init.method ?? (init.body ? "POST" : "GET");
    }
    const request = await fetch(input, init);

    if (!request.ok) {
        const errorText = await request.text();
        throw new Error(`API Error (${request.status}): ${errorText}`);
    }

    const json = await request.json();

    // Handling Google's specific tRPC response envelope
    return (json.result?.data?.json?.result || json) as T;
}
```

This utility makes it much easier to write API calls throughout the rest of the application.

## 4. Image Handling Utilities

Also in `Utils.ts` are functions to handle converting local images or URLs into Base64 encoded strings, which is the format Google's backend expects for image uploads and reference images.

```typescript
export async function imageToBase64(imagePath: string): Promise<string> {
    // Reads file from disk, detects extension, and creates a data URI string
    // e.g. "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."
}
```

## Summary
By analyzing the browser's network tab, the creator of `whisk-api` mapped out the constants and built a unified HTTP `request` utility to handle the quirks of the Google backend. In **Module 3**, we will see how these are used to build the core `Whisk` client and manage authentication.
