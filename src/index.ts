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
	 * @param {ts.MethodSignature} method - The TypeScript method signature.
	 * @param {ts.SourceFile} sourceFile - The source file containing the method.
	 * @returns {string}
	 */
	private getParametersSignature(method: ts.MethodSignature, sourceFile: ts.SourceFile): string {
		return method.parameters
			.map((parameter) => {
				const name = parameter.name.getText(sourceFile)
				const type = parameter.type ? parameter.type.getText(sourceFile) : 'unknown'
				const optional = parameter.questionToken ? '?' : ''
				return `${name}${optional}: ${type}`
			})
			.join(', ')
	}

	/**
	 * @async
	 * @method generateNamespaceFromFile
	 * @description Generates TypeScript namespace declarations from a source file.
	 * @param {string} filePath - The file path to generate declarations from.
	 * @returns {Promise<string|null>}
	 */
	private async generateNamespaceFromFile(filePath: string): Promise<string | null> {
		const program = ts.createProgram([filePath], this.tsConfigOptions.compilerOptions)
		const sourceFile = program.getSourceFile(filePath)

		if (!sourceFile) {
			console.error(`Unable to retrieve source file for ${filePath}`)
			return null
		}

		let declarations = ''

		ts.forEachChild(sourceFile, (node) => {
			if (ts.isEnumDeclaration(node) && node.name) {
				declarations += this.generateTypeEnumeration(node, sourceFile)
			} else if (ts.isClassDeclaration(node) && node.name) {
				declarations += this.generateTypeClase(node, sourceFile)
			} else if (ts.isInterfaceDeclaration(node) && node.name) {
				declarations += this.generateTypeInterface(node, sourceFile)
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

			const data = await this.generateNamespaceFromFile(filePath)

			if (data) outputContent += data + '\n'
		}

		const globalDeclaration = `${outputContent} \n`
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
		let genericTypes = ''

		if (node.typeParameters) {
			node.typeParameters.forEach((param) => {
				genericTypes += !genericTypes ? param.name.text : `, ${param.name.text}`
			})
		}

		node.members.forEach((member) => {
			if (ts.isPropertySignature(member) && member.name) {
				const propertyName = member.name.getText(sourceFile)
				const propertyType = member.type ? member.type.getText(sourceFile) : 'unknown'
				membersInfo += `  ${propertyName}: ${propertyType};\n`
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
	 * @method generateTypeClase
	 * @description Generates TypeScript class type declarations from a class node.
	 * @param {ClassDeclaration} node - The TypeScript class declaration.
	 * @param {SourceFile} sourceFile - The source file containing the class declaration.
	 * @returns {string} The generated TypeScript class declaration.
	 */
	private generateTypeClase(node: ClassDeclaration, sourceFile: SourceFile): string {
		let declarations = ''
		let membersInfo = ''
		let genericClass = ''

		if (!node.name) return ''

		if (node.typeParameters) {
			node.typeParameters.forEach((param) => {
				genericClass += genericClass ? `, ${param.name.text}` : param.name.text
			})
		}

		node.members.forEach((member) => {
			if (ts.isPropertyDeclaration(member) && member.name) {
				const propertyName = member.name.getText(sourceFile)
				const propertyType = member.type ? member.type.getText(sourceFile) : 'unknown'
				membersInfo += `    ${propertyName}: ${propertyType};\n`
			} else if (ts.isMethodDeclaration(member) && member.name) {
				let genericTypes = ''

				if (member.typeParameters) {
					member.typeParameters.forEach((param) => {
						genericTypes += genericTypes ? `, ${param.name.text}` : param.name.text
					})
				}

				const methodName = member.name.getText(sourceFile)
				const methodSignature = member.type ? member.type.getText(sourceFile) : 'unknown'

				let parameters = ''

				member.parameters.forEach((param) => {
					const paramName = param.name.getText(sourceFile)
					const paramType = param.type ? param.type.getText(sourceFile) : 'unknown'
					parameters += `${paramName}: ${paramType}`
				})

				genericTypes = genericTypes ? `<${genericTypes}>` : ''

				membersInfo += `  ${methodName}${genericTypes}(${parameters}): ${methodSignature};\n`
			} else if (ts.isConstructorDeclaration(member)) {
				let parameters = ''
				let genericTypes = ''

				if (member.typeParameters) {
					member.typeParameters.forEach((param) => {
						genericTypes += genericTypes ? `, ${param.name.text}` : param.name.text
					})
				}

				member.parameters.forEach((param) => {
					const paramName = param.name.getText(sourceFile)
					const paramType = param.type ? param.type.getText(sourceFile) : 'unknown'
					parameters += `${paramName}: ${paramType}`
				})

				genericTypes = genericTypes ? `<${genericTypes}>` : ''

				membersInfo += `  constructor${genericTypes}(${parameters});\n`
			}
		})

		genericClass = genericClass ? `${genericClass}` : ''

		declarations += `declare class ${node.name.text} {\n${membersInfo}}\n`
		return declarations
	}
}

export { UnifiedTypesGenerator, defaultPathConfig }
