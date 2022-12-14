/**
 * Build config for electron 'Main Process' file
 */

import webpack from "webpack";
import merge from "webpack-merge";
// import BabiliPlugin from 'babili-webpack-plugin';
import baseConfig from "./webpack.config.base";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

var cfg = merge([baseConfig, {
	devtool: "source-map",

	entry: ["babel-polyfill", "./app/main.development"],

	// 'main.js' in root
	output: {
		path: __dirname,
		filename: "../app/main.js"
	},

	module: {
		rules: [
			{
				test: /\.node$/,
				use: [

					{
						loader: "native-addon-loader",
						options: {
							name: "../addon/[name].[ext]",
						}
					}
				]
			}
		]
	},

	plugins: [
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, "./../app/easemob/LIBCURL.LIB"),
			force: true,
			to: "../addon/LIBCURL.LIB"
		}, {
			from: path.resolve(__dirname, "./../app/easemob/LIBCURL.DLL"),
			force: true,
			to: "../addon/LIBCURL.DLL"
		}, {
			from: path.resolve(__dirname, "./../app/easemob/libcrypto.1.0.0.dylib"),
			force: true,
			to: "../addon/libcrypto.1.0.0.dylib"
		}]),
		// new BabiliPlugin(),
		// Add source map support for stack traces in node
		// https://github.com/evanw/node-source-map-support
		// new webpack.BannerPlugin(
		//   'require("source-map-support").install();',
		//   { raw: true, entryOnly: false }
		// ),
		new webpack.DefinePlugin({
			DEBUG: process.env.NODE_ENV === "debug" ? JSON.stringify("production") : process.env.NODE_ENV === "development",
			"process.env": {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV)
			}
		})
	],

	/**
     * Set target to Electron specific node.js env.
     * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
     */
	target: "electron-main",

	/**
     * Disables webpack processing of __dirname and __filename.
     * If you run the bundle in node.js it falls back to these values of node.js.
     * https://github.com/webpack/webpack/issues/2010
     */
	node: {
		__dirname: false,
		__filename: false
	},
}]);

module.exports = cfg;
