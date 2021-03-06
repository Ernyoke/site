const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    cache: true,
    context: __dirname,
    performance: {
        hints: false
    },
    entry: ['./src/js/shell-view.js', 'font-awesome/scss/font-awesome.scss'],
    output: {
        filename: '[name].bundle-[hash]-[id].js',
        path: path.join(__dirname, 'build')
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
                ie8: false,
                mangle: true,
                toplevel: false,
                compress: {
                    booleans: true,
                    conditionals: true,
                    dead_code: true,
                    drop_debugger: true,
                    drop_console: true,
                    evaluate: true,
                    sequences: true,
                    unused: true
                },
                output: {
                    comments: false,
                    beautify: false,
                }
            }
        })]
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            minimize: true,
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [
                                ["@babel/transform-runtime"]
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader?limit=10000',
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                use: 'file-loader',
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/'
                        }
                    }
                ]
            },
            {
                test: /font-awesome\.config\.js/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'font-awesome-loader'
                    }
                ]
            },
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html'),
            minify: false,
            inject: 'body',
            hash: false
        }),
        new CleanWebpackPlugin(['dist']),
        new MiniCssExtractPlugin(),
        new CopyWebpackPlugin([
            {from: './data', to: 'data'}
        ]),
        new CopyWebpackPlugin([
            {from: './src/img/fav_icon.png', to: 'img/fav_icon.png'}
        ])
    ]
};
