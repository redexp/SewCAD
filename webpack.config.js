const {resolve} = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');

module.exports = {
	entry: {
		app: './src/app.tsx',
	},
	output: {
		filename: '[name].js',
		path: resolve(__dirname, 'dist'),
	},

	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"],
		plugins: [new TsconfigPathsPlugin()]
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader"
					}
				]
			},{
				enforce: "pre",
				test: /\.jsx?$/,
				loader: "source-map-loader"
			},{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
				],
			},{
				test: /\.(woff2?|ttf|eot|svg)(\?\w+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts/'
						}
					}
				]
			},{
				test: /\.(png|jpe?g)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'img/'
						}
					}
				],
			},
		]
	},

	plugins: [
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			filename: "app.html",
			title: "SewCAD",
			chunks: ['app'],
		}),
		new HtmlWebpackRootPlugin(),
	],

	devtool: "source-map",
	mode: process.env.NODE_ENV || 'development',
	devServer: {
		contentBase: resolve(__dirname, 'dist'),
		compress: true,
		port: 9009,
	}
};