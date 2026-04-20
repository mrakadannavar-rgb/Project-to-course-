# Module 1: Introduction and Project Setup

Welcome to Module 1 of the **Whisk API Course**. In this tutorial, we will explore how to reverse engineer and build an unofficial API wrapper for Google's Whisk (ImageFX) using TypeScript.

## 1. What is Whisk API?

The `whisk-api` project is an unofficial Node.js library and Command-Line Interface (CLI) that allows developers to programmatically generate images, refine them, and create videos using Google's generative models like **IMAGEN 3.5** and **VEO 3.1**. Since Google doesn't provide a public API for these tools, this project uses reverse-engineered network requests (via browser cookies) to communicate directly with Google's backend APIs.

## 2. Setting Up the Project

Let's look at how the project is structured. 

### Prerequisites
- **Node.js** or **Bun** installed on your system.
- Basic knowledge of TypeScript and making HTTP requests.

### The `package.json`
The project defines its dependencies and scripts in the `package.json` file. It uses `"type": "module"` to enable ES Modules (allowing `import` and `export` instead of `require`).

```json
{
    "name": "@rohitaryal/whisk-api",
    "version": "4.0.1",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "scripts": {
        "test": "bun test --concurrent",
        "build": "tsc && chmod +x ./dist/Cli.js"
    },
    "dependencies": {
        "bun-types": "^1.2.14",
        "undici-types": "^6.21.0",
        "yargs": "^18.0.0"
    }
}
```

- **yargs:** Used for building the interactive command-line interface.
- **bun test:** Used as the test runner.

### The `tsconfig.json`
TypeScript is configured to output compiled JavaScript into a `./dist` folder using `NodeNext` module resolution.

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "outDir": "./dist",
        "declaration": true,
        "esModuleInterop": true,
        "strict": true,
        "moduleResolution": "NodeNext"
    },
    "include": ["src"]
}
```

## 3. Project Architecture

The source code resides in the `src/` directory. Here is the file structure and the role of each file:

- `index.ts`: The main entry point that exports everything for library consumers.
- `Whisk.ts`: The core client that handles Authentication, Session Management, and direct `imageFX` API calls.
- `Project.ts`: Manages the state of an individual generation session (called a Workflow or Project).
- `Media.ts`: Handles the generated outputs (Images and Videos), providing methods to animate, refine, and save them.
- `Cli.ts`: The entry point for the command-line tool.
- `Constants.ts`: Contains API endpoints, headers, model types, and configuration.
- `Utils.ts`: Helper functions for network requests and base64 conversions.
- `Types.ts`: TypeScript interfaces to ensure strict typing of API requests and responses.

## Summary
In this module, we've reviewed the purpose of the project and its architecture. In **Module 2**, we will dive into `Constants.ts` and `Utils.ts` to understand how the foundational blocks of reverse engineering an API are laid out.
