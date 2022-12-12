const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require("webpack");
const dotenv = require("dotenv").config();
const { ImportMapWebpackPlugin } = require("@hackney/webpack-import-map-plugin");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "mtfh",
    projectName: "worktray",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    entry: {
      worktray: defaultConfig.entry,
    },
    output: {
      filename: "[name].[contenthash].js",
    },
    module: {
      rules: [
        {
          test: /\.scss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    externals: ["react-router-dom", "formik", "yup", "date-fns", /^@mtfh\/.+/],
    plugins: [
      new webpack.EnvironmentPlugin({
        SEARCH_API_URL: dotenv.SEARCH_API_URL || "",
        PATCHES_AND_AREAS_API_URL: dotenv.PATCHES_AND_AREAS_API_URL || "",
      }),
      new ImportMapWebpackPlugin({
        namespace: "@mtfh",
        basePath: process.env.APP_CDN || "http://localhost:8100",
      }),
    ],
  });
};
