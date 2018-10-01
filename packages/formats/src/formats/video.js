const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = (text, [contentUrl, contentType, name, thumbnail, duration, size], {
    session
}) => {
    if (!name) {
        name = _.last(contentUrl.split('/'))
    }
    if (!contentType) {
        let ext = _.last(name.split('.'))
        ext = ext.toLowerCase()
        if (['mp4'].indexOf(ext)) {
            contentType = 'image/' + ext
        }
    }

    if (Utils.isWebSite(session)) {
        return {
            text,
            video: contentUrl
        }
    }

    if (Utils.isGactions(session)) {
        return [
            text,
            {
                method: 'MediaObject',
                params: [{
                    name,
                    url: contentUrl,
                    icon: thumbnail
                }]
            }
        ]
    }

    if (Utils.isBottenderViber(session)) {
        return {
            method: 'sendVideo',
            params: [{
                media: contentUrl,
                thumbnail,
                duration,
                size
            }]
        }
    }

    if (Utils.isBottenderLine(session)) {
        return {
            method: 'replyVideo',
            params: [contentUrl, thumbnail]
        }
    }

    if (Utils.isBottenderTelegram(session)) {
        return {
            method: 'sendVideo',
            params: [{
                contentUrl
            }, {
                thumb: thumbnail,
                duration,
                caption: text
            }]
        }
    }

    if (Utils.isBottenderFacebook(session)) {
        return [{
            method: 'sendText',
            params: [
                text
            ]
        }, {
            method: 'sendVideo',
            params: [
                contentUrl
            ]
        }]
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
