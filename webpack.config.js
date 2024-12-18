const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // Process CSS files
      },
    ],
  },
  devServer: {
    static: path.join(__dirname, "public"),
    compress: true,
    port: 9000,
  },
};
