const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
    entry: {
        newbot: './converse.js',
        'newbot.with-parser': './converse-with-parser.js'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist')
    },
    node: {
        fs: 'empty'
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new CompressionPlugin()
    ]
}
