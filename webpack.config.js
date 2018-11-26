const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
    entry: './converse.js',
    output: {
        filename: 'newbot.min.js',
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
