# Module 5: Media Generation & Handling (`Media.ts`)

Once an image or video is generated, it is returned as a `Media` object. This class provides the methods to interact with the media, such as downloading it, captioning it, refining (editing) it, or animating it into a video.

## 1. The `Media` Object

The `Media` class stores the raw `encodedMedia` (usually a Base64 string), metadata (prompt, seed, model), and the `account` used to generate it.

```typescript
export class Media {
    readonly seed: number;
    readonly prompt: string;
    readonly workflowId: string;
    readonly encodedMedia: string;
    readonly mediaGenerationId: string;
    readonly mediaType: "VIDEO" | "IMAGE";
    // ...
}
```

## 2. Refining (Editing) an Image

Refining uses the `GEM_PIX` model to alter an existing image based on a new prompt instruction (e.g., "Make it snowy").

```typescript
async refine(edit: string): Promise<Media> {
    const refinementResult = await request<any>(
        "https://labs.google/fx/api/trpc/backbone.editImage",
        {
            headers: { cookie: this.account.getCookie() },
            body: JSON.stringify({
                "json": {
                    "clientContext": { "workflowId": this.workflowId },
                    "imageModelSettings": {
                        "aspectRatio": this.aspectRatio,
                        "imageModel": "GEM_PIX",
                    },
                    "editInput": {
                        "caption": this.prompt,
                        "userInstruction": edit,
                        "originalMediaGenerationId": this.mediaGenerationId,
                        "mediaInput": {
                            "mediaCategory": "MEDIA_CATEGORY_BOARD",
                            "rawBytes": this.encodedMedia
                        }
                    }
                }
                // ...
            })
        }
    );
    // Returns a new Media object representing the refined image
}
```

## 3. Animating: Handling Long-Polling

Unlike image generation, video animation (VEO 3.1) takes a long time. The initial request to `generateVideo` returns an `operation.name` (an ID) rather than the video itself.

The `animate` function implements **polling**: it repeatedly checks the status endpoint every 2 seconds until the status is `MEDIA_GENERATION_STATUS_SUCCESSFUL`.

```typescript
async animate(videoScript: string, model: VideoGenerationModelType): Promise<Media> {
    // 1. Start generation
    const videoStatusResults = await request<any>(
        "https://aisandbox-pa.googleapis.com/v1/whisk:generateVideo", 
        /* payload */
    );
    const id = videoStatusResults.operation.operation.name;

    // 2. Poll for completion
    let i = 0;
    while (true) {
        i++;
        const videoResults = await request<any>(
            "https://aisandbox-pa.googleapis.com/v1:runVideoFxSingleClipsStatusCheck",
            /* payload checking `id` */
        );

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        if (videoResults.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
            // Return the final video media!
            return new Media({...});
        }

        if (i >= 60) { // Timeout after 2 minutes
            throw new Error("failed to generate video");
        }
    }
}
```

## 4. Saving to Disk

Because the media is stored in memory as a Base64 string, saving it simply involves stripping the `data:image/png;base64,` header and writing the raw buffer to a file.

```typescript
save(directory: string = "."): string {
    let extension = this.mediaType == "VIDEO" ? "mp4" : "png";
    const base64Data = this.encodedMedia.replace(/^data:\w+\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    // ... write using fs.writeFileSync
}
```

## Summary
The `Media` class encapsulates the operations you can perform on a generated asset. Polling is a critical concept introduced here for handling asynchronous video generation. In our final module, **Module 6**, we will wrap all this functionality into a user-friendly Command Line Interface.
