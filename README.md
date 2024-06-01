# Unified Type Declarator

## Description

The Unified Type Declarator is a utility designed for generating global TypeScript type declarations from project files. This tool automates the creation of detailed type definitions, ensuring consistency and accuracy across large TypeScript projects. It's particularly useful for applications with complex or frequently changing data models, as it helps maintain type safety and improve developer productivity by reducing manual type declaration overhead.

## Motivation

The Unified Type Declarator was developed to address the complexities associated with managing TypeScript type declarations, especially in large-scale projects or those organized as monorepos. In environments where multiple packages coexist within a single repository, maintaining a single source of truth for type definitions is crucial. This tool facilitates the integration and reuse of types across different parts of a project, streamlining development and enhancing maintainability.

## Features

- **Automatic Generation:** Creates global TypeScript type declarations automatically.
- **Configuration:** Fully configurable through standard `tsconfig.json` files.
- **Support:** Handles Enums, Interfaces, Types, Functions, Variable Declarations and Classes seamlessly.
- **Integration:** Easily integrates into existing TypeScript projects.

## Installation

To install the Unified Type Declarator, run the following command:

```bash
npm install unified-types-generator
# or globally
npm install -g unified-types-generator
```

## Usage

Here's how you can use the Unified Type Declarator in your project:

### Setup Configuration:

Ensure your **`tsconfig.declaration.json`** or a **custom configuration file** specifies the root directory, include paths, exclude paths, and the output file name.

### Generating Types:

By default, the Unified Type Declarator uses tsconfig.declaration.json to generate type declarations. To run the Declarator with the default configuration file, use:

```bash
npx ut-declarator
```

If you need to specify an alternative configuration file, you can pass the path to the executable as follows:

### Integrate Generated Types:

Include the generated type declaration file in your project to enhance type checking and IntelliSense across your IDE.

```bash
npx ut-declarator tsconfig.otherFile.json
```

This flexibility allows you to customize the generation process based on different configurations within the same project or across projects.

#### Integration

After generating the type declarations, include the generated type declaration file in your project to enhance type safety and IntelliSense support across your IDE.

##### Example Workflow

1.  **Set up your configuration:** Adjust your tsconfig.declaration.json or another config file to include all necessary model files.

2.  **Generate types:** Use the default or a specified configuration file to run the declarator.

3.  **Integrate the types:** Include the output file in your project for improved type checking.
    Here is a simple tsconfig example that the declarator could use:

```json
{
	"compilerOptions": {
		"outFile": "types/index.d.ts",
		"rootDir": "./src"
	},
	"include": ["./src/**/*.entity.ts", "./src/**/*.fixtures.ts"],
	"exclude": ["./src/**/*.service.ts"]
}
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. The MIT License is a permissive license that is short and to the point. It lets people do almost anything they want with your project, like making and distributing closed source versions.
