/**
 * @module GlobalTypesGenerator
 * @description Provides a utility for generating global TypeScript type declarations from project files.
 * @author Your Name
 * @exports GlobalTypesGenerator
 * @exports defaultPathConfig
 */
declare const defaultPathConfig = "tsconfig.declaration.json";
/**
 * @class GlobalTypesGenerator
 * @classdesc A class to generate global TypeScript type declarations based on the provided tsconfig settings.
 */
declare class UnifiedTypesGenerator {
    /**
     * @private
     * @type {string}
     */
    private tsConfigPath;
    /**
     * @private
     * @type {string}
     */
    private cwd;
    /**
     * @private
     * @type {Object}
     */
    private tsConfigOptions;
    /**
     * @constructor
     * @param {string} [tsConfigPath=defaultPathConfig] - Path to the TypeScript configuration file.
     */
    constructor(tsConfigPath?: string);
    /**
     * @private
     * @method getParametersSignature
     * @description Constructs a parameter signature string for method declarations.
     * @param {ts.MethodSignature} method - The TypeScript method signature.
     * @param {ts.SourceFile} sourceFile - The source file containing the method.
     * @returns {string}
     */
    private getParametersSignature;
    /**
     * @async
     * @method generateNamespaceFromFile
     * @description Generates TypeScript namespace declarations from a source file.
     * @param {string} filePath - The file path to generate declarations from.
     * @returns {Promise<string|null>}
     */
    private generateNamespaceFromFile;
    /**
     * @private
     * @method getFiles
     * @description Retrieves file paths from the tsconfig settings.
     * @returns {string[]}
     * @throws {Error} If the root directory is not specified in tsconfig.
     */
    private getFiles;
    /**
     * @async
     * @private
     * @method setTsConfig
     * @description Reads and parses the TypeScript configuration file.
     */
    private setTsConfig;
    /**
     * @async
     * @public
     * @method run
     * @description Main method to execute the types generation process.
     * @example
     * const generator = new GlobalTypesGenerator();
     * await generator.run();
     */
    run(): Promise<void>;
    /**
     * @private
     * @method generateTypeEnumeration
     * @description Generates TypeScript enumeration type declarations from an enum node.
     * @param {EnumDeclaration} node - The TypeScript enumeration declaration.
     * @param {SourceFile} sourceFile - The source file containing the enum declaration.
     * @returns {string} The generated TypeScript enumeration declaration.
     */
    private generateTypeEnumeration;
    /**
     * @private
     * @method generateTypeInterface
     * @description Generates TypeScript interface declarations from an interface node.
     * @param {InterfaceDeclaration} node - The TypeScript interface declaration.
     * @param {SourceFile} sourceFile - The source file containing the interface declaration.
     * @returns {string} The generated TypeScript interface declaration.
     */
    private generateTypeInterface;
    /**
     * @private
     * @method generateTypeClase
     * @description Generates TypeScript class type declarations from a class node.
     * @param {ClassDeclaration} node - The TypeScript class declaration.
     * @param {SourceFile} sourceFile - The source file containing the class declaration.
     * @returns {string} The generated TypeScript class declaration.
     */
    private generateTypeClase;
}
export { UnifiedTypesGenerator, defaultPathConfig };
