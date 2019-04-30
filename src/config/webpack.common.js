const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const helpers = require('./helpers');
const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
module.exports = {
    entry: {
        'app': [
            helpers.root('src/client/app/index.tsx')
        ]
    },
    output: {
        path: helpers.root('dist/client'),
        publicPath: '/'
    },
    resolve: {
        modules: ["../../node_modules"],
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    module: {
        rules: [
            // JS files
            {
                test: /\.ts(x?)$/,
                include: helpers.root('src/client'),
                loader: 'babel-loader'
            }, {
                test: /\.js(x?)$/,
                include: helpers.root('src/client'),
                loader: 'babel-loader'
            },
            // SCSS files
            {
                test: /\.(png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=100000"
            }, {
                test: /\.(eot|com|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=application/octet-stream"
            }, {
                test: /\.(csv)(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=text/csv"
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=image/svg+xml"
            }, {
                test: /\.(sa|sc|c)ss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                        options: {
                            'sourceMap': true,
                            'importLoaders': 1
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                autoprefixer
                            ]
                        }
                    }, 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV)
            }
        }),
        new HtmlWebpackPlugin({
            template: helpers.root('src/client/public/index.html'),
            inject: 'body'
        }),
        new ExtractTextPlugin({
            filename: 'css/[name].[hash].css',
            disable: !isProd
        }),
        new CopyWebpackPlugin([{
            from: helpers.root('src/client/public')
        }])
    ]
};
