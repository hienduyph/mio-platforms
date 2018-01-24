import { resolve } from "path";
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const sourceMaps = require("rollup-plugin-sourcemaps");
const camelCase = require("lodash.camelcase");
import typescript from "rollup-plugin-typescript2";

const root = resolve.bind(resolve, __dirname);

const pkg = require(root("./package.json"));
const libraryName = pkg.name;

export default {
  input: root(`./src/mioexpress.ts`),
  output: [
    { file: root(pkg.main), name: camelCase(libraryName), format: "cjs" }
  ],
  sourcemap: true,
  // Indicate here external modules you don"t wanna include in your bundle (i.e.: "lodash")
  external: [ "inversify", "express", "miocore" ],
  watch: {
    include: "src/**",
  },
  plugins: [
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn"t understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use "external" to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
