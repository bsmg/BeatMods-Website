const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const commonConfig = require('./webpack.common');
module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        filename: 'js/[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },
    stats: {
        colors: true,
        hash: true,
        timings: true,
        assets: false,
        chunks: false,
        chunkModules: false,
        modules: false,
        children: false
    },
    optimization: {
        minimizer: [new UglifyJsPlugin()],
    },
});
