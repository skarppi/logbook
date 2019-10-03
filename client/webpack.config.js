const path = require("path");
const webpack = require("webpack");
const version = require("../package.json").version;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OpenBrowserPlugin = require("open-browser-webpack-plugin");

const config = require("../server/src/config");
const outputPath = path.join(__dirname, "..", "server", "dist", "public");

const plugins = [
  new HtmlWebpackPlugin({
    title: "OpenTX Logbook",
    favicon: "favicon.ico",
    filename: "index.html",
    template: "index.ejs",
    publicUrl: config.PUBLIC_URL
  }),
  new webpack.DefinePlugin({
    'process.env.PUBLIC_URL': JSON.stringify(config.PUBLIC_URL)
  }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
];

// if (!config.IS_PRODUCTION) {
//   plugins.push(new OpenBrowserPlugin({ url: `http://localhost:${config.SERVER_PORT}` }));
// }

module.exports = {
  mode: config.IS_PRODUCTION ? "production" : "development",
  devtool: config.IS_PRODUCTION ? "" : "inline-source-map",
  entry: ["babel-polyfill", "./client"],
  output: {
    path: outputPath,
    filename: `[name]-${version}-bundle.js`,
    publicPath: config.PUBLIC_URL + "/public/",
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".tsx"]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        options: {
          "silent": true
        }
      },
      {
        test: /\.css$/,
        include: /(node_modules)/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              camelCase: true,
              sourceMap: !config.IS_PRODUCTION,
              minimize: config.IS_PRODUCTION
            }
          }
        ]
      },
      {
        test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
        use: "url-loader?limit=10000"
      }
    ]
  },
  plugins
};
