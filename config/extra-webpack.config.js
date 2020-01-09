/**
 * Configuration used for third-party frameworks to read .converse files and newbot.config.js
 */

const path = require('path')
require('../src/transpiler/load')

module.exports = function(newbotConfig = {}) {
    let alias = {}

    if (newbotConfig.map) {
        for (let pkg in newbotConfig.map) {
            let platform = newbotConfig.map[pkg]
            if (typeof platform != 'string') platform = platform.browser
            alias[pkg] = platform
        }
    }

    return {
        module: {
            rules: [{
                test: /\.converse$/,
                use: [{
                    loader: path.resolve(__dirname, '../loader/converse.js')
                }]
            }]
        },
        resolve: {
            alias
        }
    }
}