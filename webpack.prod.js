const merge = require('webpack-merge');
const common = require('./webpack.common.js')

module.exports = merge(common, {
    devtool: 'cheap-eval-source-map',
    mode: 'production'
});