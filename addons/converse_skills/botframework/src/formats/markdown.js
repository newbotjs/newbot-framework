const builder = require('botbuilder')
const Utils = require('../utils')

module.exports = (converse) => {
    converse.format('markdown', (text, params, { session }) => {
        if (Utils.isWebSite(session)) {
            return {
                text, 
                markdown: true
            }
        }
        return new builder.Message(session)
            .text(text)
            .textFormat('markdown')
    }) 
}