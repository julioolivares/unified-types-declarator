# Unified Type Generator

## Description

The Unified Type Generator is a utility designed for generating global TypeScript type declarations from project files. This tool automates the creation of detailed type definitions, ensuring consistency and accuracy across large TypeScript projects. It's particularly useful for applications with complex or frequently changing data models, as it helps maintain type safety and improve developer productivity by reducing manual type declaration overhead.

## Why Unified Type Generator?

This tool was created to address the need for a streamlined process of managing and generating type declarations in TypeScript projects. It supports maintaining a single source of truth for type definitions, which is crucial for large-scale projects where consistency in type usage is critical.

## Features

- Generate global TypeScript type declarations automatically.
- Configurable through standard tsconfig.json files.
- Supports Enums, Interfaces, and Classes.
- Easy integration into existing TypeScript projects.

## Installation

To install the Unified Type Generator, you can use npm:

```bash
npm install unified-types-generator
```

## Usage

Here's how you can use the Unified Type Generator in your project:

### Setup Configuration:

Ensure that your tsconfig.json or a custom configuration file specifies the root directory, include paths, and output file name.

### Generate Types:

Run the generator to create the type declarations:

```bash
npx ut-generator

```

### Integrate Generated Types:

Include the generated type declaration file in your project to enhance type checking and IntelliSense across your IDE.

#### Example

Suppose you have a TypeScript project with several models defined across different files. You can configure the Unified Type Generator to scan these files and generate a unified type declaration file:

#### Step 1: Set up your tsconfig.declaration.json to include all relevant model files.

#### Step 2: Run the Unified Type Generator.

#### Step 3: Use the generated type declarations in your project.

Here is a simple tsconfig example that the generator could use:

```json
{
	"compilerOptions": {
		"outFile": "./types/global.d.ts",
		"rootDir": "./src"
	},
	"include": ["./src/**/*.ts"]
}
```

## License

This project is licensed under the MIT License - see the LICENSE.md file for details. The MIT License is a permissive license that is short and to the point. It lets people do almost anything they want with your project, like making and distributing closed source versions.
