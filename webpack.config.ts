import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const env = process.env.NODE_ENV;
const plugins = [
    new ForkTsCheckerWebpackPlugin(),
];

if (env === 'production') {
    plugins.push(...[
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //   minimize: true,
        //   compress: {
        //     screw_ie8: true,
        //   },
        // }),
    ]);
}

// interface Configuration extends webpack.Configuration {
//     devServer?: webpackDevServer.Configuration;
// }

const config: webpack.Configuration = {
    entry: './src/app',
    mode: env === 'production' ? 'production' : 'development',
    output: {
        filename: `bundle${env === 'production' ? '.min' : ''}.js`,
        path: path.resolve(path.join(__dirname, 'web'))
    },
    devtool: env !== 'production' && 'source-map',
    devServer: {
        host: '0.0.0.0',
        port: 3115,
        historyApiFallback: true,
        disableHostCheck: true,
        contentBase: path.join(__dirname, 'web')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        // modules: [path.join(__dirname, 'node_modules')],
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                }
            }
        ],
    },
    plugins,
};

export default config;