/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { spawn } = require("child_process");
const port = process.env.PORT || 3000;
var env = process.env.NODE_ENV;
var nodePath = "app/__build__";
var theme = {
	"font-size-base": "14px",
	"primary-color": "#24BDB9",
	"text-color": "#405E7A",
	"item-active-bg": "#e0e4e7", // menu active bg
	"component-background":  "#f8fafc",
	"input-height-lg": "40px"
};
var cfg;
var videoCfg;

if(env === "production"){
	nodePath = "app/__build__";
}


cfg = merge([
	baseConfig, {

		devtool: "source-map",

		entry: {
			bundle: [
				// `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
				// `webpack-hot-middleware/client?name=bundle`,
				"babel-polyfill",
				"./app/index"
			],
			rtc: "./app/rtc"
		},

		output: {
			publicPath: "/static/",			// 给 server 用的（后期看看，拆开，会影响 webpack）
			filename: "./[name].js",
		},

		module: {
			rules: [
				{
					test: /\.node$/,
					use: [
						// {
						// 	loader: "native-ext-loader",
						// 	options: {
						// 		// rewritePath: path.resolve(__dirname, "dist")
						// 	}
						// },
						{
							loader: 'native-addon-loader',
							options: {
								name: "../addon/[name].[ext]",
							}
						}
						// {
						// 	loader: "node-addon-loader",
						// 	options: {
						// 		// 加上 basePath 后，最终路径 = output.path join basePath join name
						// 		// basePath: "./",
						// 		rewritePath: nodePath,
						// 		// rewritePath: "../Resources/app.asar.unpacked/__build__/",
						// 		// relativePath: false,
						// 		name: "addon/[name].[hash:8].[ext]",
						// 	}
						// },
						// {
						// 	loader: "file-loader",
						// 	options: {
						// 		outputPath: "addon/",
						// 		name: "[name].[hash:8].[ext]",
						// 	// publicPath: "../../app.asar.unpacked/addons"
						// 	}
						// }
					]
				},
				// Fonts
				// {
				// 	test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				// 	use: "url-loader?limit=10000&mimetype=application/font-woff"
				// },
				// {
				// 	test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				// 	use: "url-loader?limit=10000&mimetype=application/font-woff"
				// },
				{
					test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
					use: "url-loader?limit=10000"
				},
				{
					test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
					use: "url-loader?limit=10000"
				},
				{
					test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
					use: "url-loader?limit=10000"
				},
				// {
				// 	test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				// 	use: "file-loader"
				// },
				// {
				// 	test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				// 	use: "url-loader?limit=10000&mimetype=image/svg+xml"
				// },
				// {
				// 	test: /\.css$/,
				// 	use: [
				// 		"style-loader",
				// 		"css-loader?importLoaders=1&sourceMap"
				// 	]
				// },
				{
					test: /\.less$/,
					use: [
						{
							loader: "style-loader" // creates style nodes from JS strings
						}, {
							loader: "css-loader" // translates CSS into CommonJS
						},
						{
							loader: "less-loader",
							options: {
								modifyVars: theme
							}
						}
					]

					// use: [{
					// loader: "style-loader" // creates style nodes from JS strings
					// }, {
					// loader: "css-loader" // translates CSS into CommonJS
					// }, {
					// loader: "less-loader" // compiles Less to CSS
					// }]
				},
				{
					test: /\.scss$/,
					use: [
						"style-loader",
						"css-loader?importLoaders=2&sourceMap",
						"postcss-loader?sourceMap=true",
						"sass-loader?sourceMap=true",
					]
				},
				{
					test: /\.(png|jpg)$/,
					use: "url-loader?limit=8192"
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
			// for bindings package, see https://github.com/rwaldron/johnny-five/issues/1101#issuecomment-213581938
			new webpack.ContextReplacementPlugin(/bindings$/, /^$/),

			// https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
			new webpack.HotModuleReplacementPlugin(),

			// “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
			// https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
			// new webpack.NoErrorsPlugin(),

			// NODE_ENV should be production so that modules do not perform certain development checks
			new webpack.DefinePlugin({
				DEBUG: true,
				"process.env.NODE_ENV": JSON.stringify("development")
			})
		],

		externals: ["bindings"],

		// https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
		target: "electron-renderer",
		devServer: {
			contentBase: path.resolve(__dirname, "../app"),
			historyApiFallback: true,
			inline: true,
			publicPath: "/__build__/",
			hot: true,
			port,
			clientLogLevel: "error",
			after: (arg) => {
				console.log(arg)
				spawn("npm", ["run", "start:hot"], { shell: true, env: process.env, stdio: "inherit" })
				.on("close", code => process.exit(code))
				.on("error", spawnError => console.error(spawnError));
			}
		}
	}
]);
module.exports = [cfg];
