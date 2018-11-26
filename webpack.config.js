const path = require('path')

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
        minimize: false
      }
}