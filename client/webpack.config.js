import 'dotenv/config';
import path from 'path';
import url from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.mjs'],
	},
	plugins: [
		new webpack.DefinePlugin({
			'process': {
				'env': {
					// [SECURITY WARNING]: Exposing sensitive information directly in
					// client-side code is a significant security risk. Do NOT include
					// API keys, secrets, passwords, or other credentials here. These
					// values will be visible in the browser's source code.

					// non-sensitive config:
					'WS_URL': JSON.stringify(process.env.WS_URL),

					// INSECURE EXAMPLE (DO NOT DO THIS):
					// 'API_KEY': JSON.stringify(process.env.API_KEY), // VERY BAD - Never expose API keys!
				}
			},
		}),
		new HtmlWebpackPlugin({
			title: 'NodeJS Game Server',
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			// {
			// 	test: /\.(png|jpg|jpeg|gif|svg|ttf)$/,
			// 	use: [{
			// 		loader: 'url-loader',
			// 		options: { limit: 10000 } // Convert images < 10k to base64 strings
			// 	}]
			// },
			{
				test: /\.(png|jpg|jpeg|gif|svg|ttf)$/,
				loader: 'file-loader'
			},
			{
				test: /\.(wav|mp3)$/,
				loader: 'file-loader'
			},
		],
	},
}
