import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/main.ts",
  external: [],
  plugins: [
    esbuild({
      tsconfig: "tsconfig.app.json",
      target: "es6",
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
  ],
  output: {
    dir: "dist",
    format: "cjs",
  },
});
