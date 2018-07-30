const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = (text, [contentUrl, contentType, name], {
    session
}) => {
    if (!name) {
        name = _.last(contentUrl.split('/'))
    }
    if (!contentType) {
        let ext = _.last(name.split('.'))
        ext = ext.toLowerCase()
        if (['gif', 'png', 'jpeg', 'jpg'].indexOf(ext)) {
            contentType = 'image/' + ext
        }
    }
    if (Utils.isWebSite(session)) {
        return {
            text,
            image: contentUrl
        }
    } else if (Utils.isFacebook(session) && !Utils.isBotBuilderFacebook(session)) {
        return {
            text,
            attachment: {
                type: 'image',
                payload: {
                    url: contentUrl
                }
            }
        }
    }

    return new builder.Message(session)
        .text(text)
        .addAttachment({
            contentUrl,
            contentType,
            name
        })
}
