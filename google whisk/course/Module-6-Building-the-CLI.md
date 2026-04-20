# Module 6: Building the CLI (`Cli.ts`)

Now that we have a robust, object-oriented API client, we want to make it usable directly from the terminal. The project uses the popular `yargs` library to parse command-line arguments and route them to the correct functions.

## 1. Setting Up `yargs`

In `src/Cli.ts`, `yargs` is initialized with `process.argv` (the raw arguments passed to the Node script).

```typescript
#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from 'yargs/helpers';

const y = yargs(hideBin(process.argv));

await y
    .scriptName("whisk")
    .usage('$0 <cmd> [args]')
    // ...
```
The `#!/usr/bin/env node` shebang at the very top tells the operating system to execute this file using Node.js when invoked directly from the terminal.

## 2. Global Options

The CLI requires a `--cookie` (or `-c`) parameter for every command to authenticate. This is set up as a global option:

```typescript
.option("cookie", {
    alias: "c",
    describe: "Google account cookie",
    type: "string",
    demandOption: true,
})
```

## 3. Defining Commands

Each feature of the library is mapped to a `.command()`. A command definition requires a name, a description, an options builder, and a handler function.

Let's look at the `generate` command:

```typescript
.command(
    "generate",
    "Generate new images using a temporary project",
    (yargs) => {
        return yargs
            .option("prompt", { alias: "p", demandOption: true, type: "string" })
            .option("model", { alias: "m", default: "IMAGEN_3_5" })
            .option("dir", { alias: "d", default: "./output" })
            // ...
    },
    async (argv) => {
        // 1. Initialize API
        const whisk = new Whisk(argv.cookie);
        await whisk.account.refresh();

        // 2. Create a temporary project
        const project = await whisk.newProject(`CLI-Gen-${Date.now()}`);

        try {
            // 3. Generate the media
            const media = await project.generateImage({
                prompt: argv.prompt,
                model: argv.model,
                // ...
            });

            // 4. Save to disk
            const savedPath = media.save(argv.dir);
            console.log(`[+] Image generated successfully!`);
            console.log(`[+] Saved to: ${savedPath}`);
        } catch (error) {
            console.error("[!] Generation failed:", error);
        }
    }
)
```

## 4. Polishing the CLI

To make the CLI robust, the developer added strict parsing and a fallback help screen:

```typescript
    .demandCommand(1, "You need to provide a command")
    .strict()
    .help()
    .alias("help", "h")
    .parse();
```

When built, this code is transpiled to `./dist/Cli.js` and defined as the `bin` executable in `package.json`, allowing the user to run `whisk generate --prompt "A cool cat"` globally.

## Course Conclusion

Congratulations! You have completed the Whisk API course. You've learned how to:
- Structure a TypeScript library.
- Reverse engineer API requests and handle Google authentication headers.
- Build class-based architecture to manage state (`Whisk`, `Project`, `Media`).
- Implement polling for long-running generation tasks.
- Expose all this functionality via a polished CLI using `yargs`.

You can now use these same principles to build unofficial wrappers for other web tools, or contribute to `whisk-api` itself!
