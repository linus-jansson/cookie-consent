import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "iife", "cjs"],
	globalName: "C15TConsent", // window.C15TConsent for IIFE/UMD
	dts: true,
	sourcemap: true,
	clean: true,
	minify: true,
	target: "es2018",
	splitting: false,
	treeshake: true,
	// external: [
	// 	"c15t",
	// 	"@uppsala-designsystem/theme",
	// 	"@uppsala-designsystem/css",
	// ],
});
