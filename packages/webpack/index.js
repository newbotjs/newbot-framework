const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const NodemonPlugin = require('nodemon-webpack-plugin')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'

module.exports = function(dirname, extend = {}) {

   const plugins = []

   return {
        target: 'node',
        node: {
            __dirname: false
        },
        externals: [nodeExternals()],
        mode,
        entry: `./src/server.js`,
        output: {
            path: path.join(dirname, 'dist/server'),
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            rules: [{
                test: /\.converse$/i,
                use: [{
                    loader: path.resolve(__dirname, '../../loader', 'converse.js')
                }]
            }]
        },
        optimization: {
            minimize: false
        },
        plugins: [
            new CleanWebpackPlugin(),
            new NodemonPlugin({
                script: './dist/server/index.js',
                watch: path.resolve('./dist/server')
            })
        ]
    }
}