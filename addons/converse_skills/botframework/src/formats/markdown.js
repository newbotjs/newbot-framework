const builder = require('botbuilder')

module.exports = (converse) => {
    converse.format('markdown', (text, params, { session }) => {
        return new builder.Message(session)
            .text(text)
            .textFormat('markdown')
    }) 
}