import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  outDir: "dist",
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  external: ["**/*.md"],
});
