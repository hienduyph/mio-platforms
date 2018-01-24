import { Configuration } from "webpack";

const externalModules = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const config: Configuration = {
  entry: "./examples/express-server/main.ts",
  externals: [externalModules()],
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: "awesome-typescipt-loader"
    }]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"])
  ]
};

export default config;
