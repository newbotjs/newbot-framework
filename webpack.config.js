const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
    entry: {
        newbot: './bootstrap/browser.js',
        'newbot.with-parser': './bootstrap/browser-with-parser.js',
        'newbot.with-nlp': './bootstrap/browser-with-nlp.js'
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
