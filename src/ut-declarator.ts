import { UnifiedTypesGenerator, defaultPathConfig } from '.'

const main = async () => {
	try {
		const args = process.argv.slice(2)

		const path = args && args[0] ? args[0] : defaultPathConfig

		await new UnifiedTypesGenerator(path).run()
	} catch (err) {
		console.log(err)
	}
}

main()
