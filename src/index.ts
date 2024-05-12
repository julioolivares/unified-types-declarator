/**
 * @module GlobalTypesGenerator
 * @description Provides a utility for generating global TypeScript type declarations from project files.
 * @author Your Name
 * @exports GlobalTypesGenerator
 * @exports defaultPathConfig
 */

import ts, {
	type CompilerOptions,
	type SourceFile,
	type EnumDeclaration,
	type InterfaceDeclaration,
	type ClassDeclaration,
	type TypeAliasDeclaration,
	type MethodSignature,
	type FunctionTypeNode,
	type PropertyDeclaration,
	type PropertySignature,
	type MethodDeclaration,
	type ConstructorDeclaration,
	type FunctionDeclaration,
	type ParameterDeclaration,
} from 'typescript'
import fs from 'node:fs'
import path from 'node:path'
import { styleText } from 'node:util'

const defaultPathConfig = 'tsconfig.declaration.json'

/**
 * @class GlobalTypesGenerator
 * @classdesc A class to generate global TypeScript type declarations based on the provided tsconfig settings.
 */
class UnifiedTypesGenerator {
	/**
	 * @private
	 * @type {string}
	 */
	private tsConfigPath: string

	/**
	 * @private
	 * @type {string}
	 */
	private cwd: string

	/**
	 * @private
	 * @type {Object}
	 */
	private tsConfigOptions: {
		compilerOptions: CompilerOptions
		include: Array<string>
		exclude: Array<string>
	}

	/**
	 * @constructor
	 * @param {string} [tsConfigPath=defaultPathConfig] - Path to the TypeScript configuration file.
	 */
	constructor(tsConfigPath?: string) {
		this.cwd = process.cwd()
		this.tsConfigPath = path.resolve(this.cwd, tsConfigPath || defaultPathConfig)
	}

	/**
	 * @private
	 * @method getParametersSignature
	 * @description Constructs a parameter signature string for method declarations.
	 * @param {ts.MethodSignature} node - The TypeScript method signature.
	 * @param {ts.SourceFile} sourceFile - The source file containing the method.
	 * @returns {string}
	 */
	private getParametersSignature(
		node:
			| MethodSignature
			| MethodDeclaration
			| ConstructorDeclaration
			| FunctionDeclaration
			| FunctionTypeNode,
		sourceFile: SourceFile
	): string {
		return node.parameters
			.map((parameter) => {
				let name = parameter.name.getText(sourceFile)
				const type = parameter.type ? parameter.type.getText(sourceFile) : 'unknown'
				const optional = parameter.questionToken || parameter.initializer ? '?' : ''
				let comment = this.getJsDocComment(parameter)
				//@ts-ignore
				if (parameter.name.elements && parameter.name.elements.length > 1) {
					name = 'param'
				}

				return `${comment}${name}${optional}: ${type}`
			})
			.join(', ')
	}

	private getPropertySignature(
		member: PropertySignature | PropertyDeclaration,
		sourceFile: SourceFile
	): string {
		const propertyName = member.name.getText(sourceFile)
		const propertyType = member.type ? member.type.getText(sourceFile) : 'unknown'
		const comment = this.getJsDocComment(member)

		return `  ${comment}${propertyName}: ${propertyType};\n`
	}

	/**
	 * @async
	 * @method generateNamespaceFromFile
	 * @description Generates TypeScript namespace declarations from a source file.
	 * @param {string} filePath - The file path to generate declarations from.
	 * @returns {Promise<string|null>}
	 */
	private async generateTypeDeclarationFromFile(filePath: string): Promise<string | null> {
		const program = ts.createProgram([filePath], this.tsConfigOptions.compilerOptions)
		const sourceFile = program.getSourceFile(filePath)

		if (!sourceFile) {
			console.error(`Unable to retrieve source file for ${filePath}`)
			return null
		}

		let declarations = ''

		ts.forEachChild(sourceFile, (node) => {
			// Enums
			if (ts.isEnumDeclaration(node) && node.name) {
				declarations += this.generateTypeEnumeration(node, sourceFile)
			}
			// Classes
			else if (ts.isClassDeclaration(node) && node.name) {
				declarations += this.generateClassType(node, sourceFile)
			}
			// Interfaces
			else if (ts.isInterfaceDeclaration(node) && node.name) {
				declarations += this.generateTypeInterface(node, sourceFile)
			}
			// Types
			else if (ts.isTypeAliasDeclaration(node) && node.name) {
				declarations += this.generateTypeType(node, sourceFile)
			}
			// Functions
			else if (ts.isFunctionDeclaration(node) && node.name) {
				declarations += this.generateFunctionType(node, sourceFile)
			}
			// Methods
			else if (ts.isMethodDeclaration(node) && node.name) {
				declarations += this.generateMethodType(node, sourceFile)
			}
		})

		return declarations ? declarations : null
	}

	/**
	 * @private
	 * @method getFiles
	 * @description Retrieves file paths from the tsconfig settings.
	 * @returns {string[]}
	 * @throws {Error} If the root directory is not specified in tsconfig.
	 */
	private getFiles(): string[] {
		if (!this.tsConfigOptions.compilerOptions.rootDir)
			throw new Error(`Expected rootDir option in ${this.tsConfigPath} session compilerOptions`)

		let fileNames = fs.readdirSync(path.resolve(this.tsConfigOptions.compilerOptions.rootDir), {
			recursive: true,
		}) as string[]

		const patterns = this.tsConfigOptions.include.map((includePath) => {
			return includePath.split('*.').at(-1)
		})

		return fileNames.filter((fileName) => {
			return patterns.find((pattern) => fileName.includes(pattern as string))
		})
	}

	/**
	 * @async
	 * @private
	 * @method setTsConfig
	 * @description Reads and parses the TypeScript configuration file.
	 */
	private async setTsConfig(): Promise<void> {
		this.tsConfigOptions = JSON.parse(
			fs.readFileSync(this.tsConfigPath, { encoding: 'utf-8' }).toString()
		)
	}

	/**
	 * @async
	 * @public
	 * @method run
	 * @description Main method to execute the types generation process.
	 * @example
	 * const generator = new GlobalTypesGenerator();
	 * await generator.run();
	 */
	public async run() {
		console.log(styleText('white', styleText('bgGreen', 'Reading tsconfig file ....')))
		await this.setTsConfig()

		if (!this.tsConfigOptions.compilerOptions || !this.tsConfigOptions.compilerOptions.outFile)
			throw new Error(`Expected outFile option in ${this.tsConfigPath} session compilerOptions`)

		const files = this.getFiles()

		let outputContent = ''

		for (const file of files) {
			const filePath = path.join(this.tsConfigOptions.compilerOptions.rootDir as string, file)
			console.log(styleText('greenBright', `Generating types for: \n ${filePath} `))

			const data = await this.generateTypeDeclarationFromFile(filePath)

			if (data) outputContent += data + '\n'
		}

		const globalDeclaration = `${outputContent}`
		const outputFile = path.resolve(
			this.cwd,
			this.tsConfigOptions.compilerOptions.outFile as string
		)
		fs.writeFileSync(outputFile, globalDeclaration, { encoding: 'utf-8' })

		console.log(styleText('bold', styleText('greenBright', `....: \n\n\n Done!!! \n\n\n\n `)))

		console.log(
			styleText('bold', styleText('greenBright', `The type file was generated in:  \n`)),
			styleText('whiteBright', outputFile)
		)
	}

	/**
	 * @private
	 * @method generateTypeEnumeration
	 * @description Generates TypeScript enumeration type declarations from an enum node.
	 * @param {EnumDeclaration} node - The TypeScript enumeration declaration.
	 * @param {SourceFile} sourceFile - The source file containing the enum declaration.
	 * @returns {string} The generated TypeScript enumeration declaration.
	 */
	private generateTypeEnumeration(node: EnumDeclaration, sourceFile: SourceFile): string {
		let declarations = ''
		let membersInfo = ''
		node.members.forEach((member) => {
			const memberName = member.name.getText(sourceFile)
			const memberValue = member.initializer ? member.initializer.getText(sourceFile) : ''
			membersInfo += `  ${memberName}=${memberValue},\n`
		})

		declarations += `declare enum ${node.name.text} {\n${membersInfo}}\n`
		return declarations
	}

	/**
	 * @private
	 * @method generateTypeInterface
	 * @description Generates TypeScript interface declarations from an interface node.
	 * @param {InterfaceDeclaration} node - The TypeScript interface declaration.
	 * @param {SourceFile} sourceFile - The source file containing the interface declaration.
	 * @returns {string} The generated TypeScript interface declaration.
	 */
	private generateTypeInterface(node: InterfaceDeclaration, sourceFile: SourceFile): string {
		let declarations = ''
		let membersInfo = ''
		let genericTypes = this.getGenerics(node)

		node.members.forEach((member) => {
			if (ts.isPropertySignature(member) && member.name) {
				membersInfo += this.getPropertySignature(member, sourceFile)
			} else if (ts.isMethodSignature(member) && member.name) {
				const methodName = member.name.getText(sourceFile)
				const parameters = this.getParametersSignature(member, sourceFile)
				const returnType = member.type ? member.type.getText(sourceFile) : 'unknown'
				membersInfo += `  ${methodName}(${parameters}): ${returnType};\n`
			}
		})

		if (genericTypes) genericTypes = `<${genericTypes}>`

		declarations += `declare interface ${node.name.text} ${genericTypes} {\n${membersInfo}}\n`
		return declarations
	}

	/**
	 * @private
	 * @method generateTypeInterface
	 * @description Generates TypeScript type declarations from an type definition.
	 * @param {TypeAliasDeclaration} node - The TypeScript type declaration.
	 * @param {SourceFile} sourceFile - The source file containing the type declaration.
	 * @returns {string} The generated TypeScript type declaration.
	 */
	private generateTypeType(node: TypeAliasDeclaration, sourceFile: SourceFile): string {
		let parametersDeclaration = ''
		let membersInfo = ''
		let generic = this.getGenerics(node)

		generic = generic ? `<${generic}>` : ''
		let declaration = `declare type ${node.name.text}${generic} = `

		// Function type
		if (node.type && ts.isFunctionTypeNode(node.type)) {
			const returnTypeDeclaration = node.type.type

			parametersDeclaration = this.getParametersSignature(node.type, sourceFile)

			if (parametersDeclaration) declaration += `(${parametersDeclaration})`

			if (ts.isTypeLiteralNode(returnTypeDeclaration)) {
				returnTypeDeclaration.members.forEach((member) => {
					// Method
					if (ts.isMethodSignature(member)) {
						const methodName = member.name.getText(sourceFile)
						const parameters = this.getParametersSignature(member, sourceFile)
						const returnType = member.type ? member.type.getText(sourceFile) : 'unknown'
						membersInfo += this.generateMethodType(member, sourceFile)
					}
					//Property
					else if (ts.isPropertySignature(member)) {
						membersInfo += this.getPropertySignature(member, sourceFile)
					}
				})

				membersInfo = ` => {\n${membersInfo}}`
			}
		}
		// Type Literal
		else if (node.type && ts.isTypeLiteralNode(node.type)) {
			node.type.members.forEach((member) => {
				// Method
				if (ts.isMethodSignature(member)) {
					const methodName = member.name.getText(sourceFile)
					const parameters = this.getParametersSignature(member, sourceFile)
					const returnType = member.type ? member.type.getText(sourceFile) : 'unknown'
					membersInfo += `${methodName}: (${parameters}) => ${returnType}`
				}
				//Property
				else if (ts.isPropertySignature(member)) {
					membersInfo += this.getPropertySignature(member, sourceFile)
				}
			})

			membersInfo = `{\n${membersInfo}}`
		} else {
			membersInfo = `${node.type.getText(sourceFile)}`
		}

		declaration = `${declaration}${membersInfo}\n\n`
		return declaration
	}

	private generateFunctionType(node: FunctionDeclaration, sourceFile: SourceFile): string {
		let declaration = ''
		let functionName = ''
		let parameters = ''
		let returnType = ''

		if (!node.name?.text) return ''

		functionName = node.name?.text
		parameters = this.getParametersSignature(node, sourceFile)
		returnType = node.type ? node.type?.getText(sourceFile) : 'unknown'

		declaration = `declare function ${functionName}(${parameters}):${returnType}`

		return declaration
	}

	private generateMethodType(
		node: MethodDeclaration | MethodSignature,
		sourceFile: SourceFile
	): string {
		let declaration = ''
		let genericTypes = this.getGenerics(node)
		const methodSignature = node.type ? node.type.getText(sourceFile) : 'unknown'
		const parameters = this.getParametersSignature(node, sourceFile)
		const comment = this.getJsDocComment(node)

		if (!node.name) return ''

		const methodName = node.name.getText(sourceFile)

		genericTypes = genericTypes ? `<${genericTypes}>` : ''

		declaration = `${comment}${methodName}${genericTypes}(${parameters}): ${methodSignature};\n`

		return declaration
	}

	/**
	 * @private
	 * @method generateClassType
	 * @description Generates TypeScript class type declarations from a class node.
	 * @param {ClassDeclaration} node - The TypeScript class declaration.
	 * @param {SourceFile} sourceFile - The source file containing the class declaration.
	 * @returns {string} The generated TypeScript class declaration.
	 */
	private generateClassType(node: ClassDeclaration, sourceFile: SourceFile): string {
		let declarations = ''
		let membersInfo = ''
		let genericClass = this.getGenerics(node)

		if (!node.name) return ''

		node.members.forEach((member) => {
			if (ts.isPropertyDeclaration(member) && member.name) {
				membersInfo += this.getPropertySignature(member, sourceFile)
			} else if (ts.isMethodDeclaration(member) && member.name) {
				membersInfo += this.generateMethodType(member, sourceFile)
				/* 
				let genericTypes = this.getGenerics(member)

				const methodName = member.name.getText(sourceFile)
				const methodSignature = member.type ? member.type.getText(sourceFile) : 'unknown'
				const comment = this.getJsDocComment(member)
				let parameters = this.getParametersSignature(member, sourceFile)

				genericTypes = genericTypes ? `<${genericTypes}>` : ''

				membersInfo += `  ${comment}${methodName}${genericTypes}(${parameters}): ${methodSignature};\n` */
			} else if (ts.isConstructorDeclaration(member)) {
				let parameters = this.getParametersSignature(member, sourceFile)
				let genericTypes = ''
				const comment = this.getJsDocComment(member)

				if (member.typeParameters) {
					member.typeParameters.forEach((param) => {
						genericTypes += genericTypes ? `, ${param.name.text}` : param.name.text
					})
				}

				genericTypes = genericTypes ? `<${genericTypes}>` : ''

				membersInfo += `  ${comment}constructor${genericTypes}(${parameters});\n`
			}
		})

		genericClass = genericClass ? `<${genericClass}>` : ''

		declarations += `declare class ${node.name.text}${genericClass} {\n${membersInfo}}\n`
		return declarations
	}

	private getGenerics(
		node:
			| ClassDeclaration
			| InterfaceDeclaration
			| MethodDeclaration
			| TypeAliasDeclaration
			| MethodSignature
	): string {
		let genericTypes = ''

		if (node.typeParameters) {
			node.typeParameters.forEach((param) => {
				genericTypes += !genericTypes ? param.name.text : `, ${param.name.text}`
			})
		}

		return genericTypes
	}

	private getJsDocComment(
		member:
			| MethodDeclaration
			| ConstructorDeclaration
			| PropertyDeclaration
			| PropertySignature
			| ParameterDeclaration
			| MethodSignature
	): string {
		const jsDocTags = ts.getJSDocTags(member)
		const listComment = jsDocTags.filter((tag) => tag.comment).map((tag) => tag.comment)
		let comment = ''
		if (listComment.length > 0) {
			comment = listComment.join(' ')
		}

		return comment
	}
}

export { UnifiedTypesGenerator, defaultPathConfig }
