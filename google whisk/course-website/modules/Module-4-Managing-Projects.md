# Module 4: Managing Projects (`Project.ts`)

A "Project" (internally referred to as a "Workflow" by Google's backend) acts as a container for related generations. It groups together the main prompt, generated images, and reference images (Subjects, Scenes, Styles).

## 1. The `Project` Class Structure

The `Project` class is initialized with a `projectId` and the `account` to make authorized requests. It also maintains arrays of `MediaReference` objects representing uploaded context images.

```typescript
export class Project {
    readonly account: Account;
    readonly projectId: string;
    readonly subjects: MediaReference[];
    readonly scenes: MediaReference[];
    readonly styles: MediaReference[];

    constructor(projectId: string, account: Account) {
        this.projectId = projectId;
        this.account = account;
        this.subjects = [];
        this.scenes = [];
        this.styles = [];
    }
}
```

## 2. Generating Images

The core function of a Project is `generateImage`. It takes a prompt configuration, normalizes it, and sends the payload to the API.

Notice how the payload requires the `workflowId` (our Project ID), the selected model (`IMAGEN_3_5`), the seed, and the prompt.

```typescript
async generateImage(input: string | PromptConfig): Promise<Media> {
    // ... normalize input ...

    const generationResponse = await request<any>(
        "https://aisandbox-pa.googleapis.com/v1/whisk:generateImage", {
        headers: { authorization: `Bearer ${await this.account.getToken()}` },
        body: JSON.stringify({
            "clientContext": {
                "workflowId": this.projectId
            },
            "imageModelSettings": {
                "imageModel": input.model,
                "aspectRatio": input.aspectRatio
            },
            "seed": input.seed,
            "prompt": input.prompt,
            "mediaCategory": "MEDIA_CATEGORY_BOARD"
        })
    });

    const img = generationResponse.imagePanels[0].generatedImages[0];

    return new Media({
        // Map raw response to the Media object
        seed: img.seed,
        prompt: img.prompt,
        workflowId: img.workflowId ?? generationResponse.workflowId,
        encodedMedia: img.encodedImage,
        mediaGenerationId: img.mediaGenerationId,
        aspectRatio: img.aspectRatio,
        mediaType: "IMAGE",
        model: img.imageModel,
        account: this.account
    });
}
```

## 3. Image References (Recipes)

ImageFX allows users to upload images as "Subjects", "Scenes", or "Styles" to influence generation. In `Project.ts`, `generateImageWithReferences` implements this by utilizing an endpoint called `runImageRecipe`. 

Before calling this, users use `project.addSubject()`, which:
1. Base64 encodes the local image.
2. Calls `Whisk.generateCaption()` to get a text description.
3. Calls `Whisk.uploadImage()` to get a `mediaGenerationId`.
4. Saves this reference in `this.subjects`.

Then, `generateImageWithReferences` injects these references into the payload:

```typescript
// Inside runImageRecipe payload:
"recipeMediaInputs": [
    ...this.subjects.map(item => {
        return {
            "caption": item.prompt,
            "mediaInput": {
                "mediaCategory": "MEDIA_CATEGORY_SUBJECT",
                "mediaGenerationId": item.mediaGenerationId
            }
        }
    }),
    // ... scenes and styles
]
```

## Summary
The `Project` class manages the state required for complex generations, hiding the orchestration of uploading references, generating captions, and passing IDs into the final generation request. In **Module 5**, we will explore what happens once a `Media` object is returned.
