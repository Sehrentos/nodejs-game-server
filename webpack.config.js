import path from 'path';
import url from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
	mode: 'development',
	entry: './client/index.js',
	plugins: [
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
		],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
}