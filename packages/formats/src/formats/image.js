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

    const facebook = {
        text,
        attachment: {
            type: 'image',
            payload: {
                url: contentUrl
            }
        }
    }

    if (Utils.isWebSite(session)) {
        return {
            text,
            image: contentUrl
        }
    }

    if (Utils.isBottenderViber(session)) {
        return {
            method: 'sendPicture',
            params: [{
                text,
                media: contentUrl
            }]
        }
    }

    if (Utils.isBottenderFacebook(session)) {
        return {
            method: 'sendMessage',
            params: [
                facebook
            ]
        }
    }

    if (Utils.isBottenderLine(session)) {
        return {
            method: 'replyImage',
            params: [contentUrl]
        }
    }

    if (Utils.isFacebook(session) && !Utils.isBotBuilderFacebook(session)) {
        return facebook
    }

    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .text(text)
            .addAttachment({
                contentUrl,
                contentType,
                name
            })
    }

    return text
}
