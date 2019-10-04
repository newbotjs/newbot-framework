const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = async (text, [content], {
    session
}) => {
   
    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .text(text)
            .addAttachment({
                content
            })
    }

    return text
}