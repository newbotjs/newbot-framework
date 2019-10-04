const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = async (text, [contentUrl, contentType, name, thumbnail], {
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

    if (Utils.isTwitter(session)) {
        return {
            text,
            attachment: {
                type: 'media'
            },
            _data: {
                url: contentUrl,
                size: await Utils.sizeFile(contentUrl),
                type: contentType,
                category: 'dm_image'
            }
        }
    }

    if (Utils.isGactions(session)) {
        return [
            text,
            {
                method: 'Image',
                params: [{
                    url: contentUrl,
                    alt: text
                }]
            }
        ]
    }

    if (Utils.isAlexa(session)) {
        return {
            type: 'image',
            text,
            image: {
                smallImageUrl: contentUrl,
                largeImageUrl: contentUrl
            }
        }
    }

    if (Utils.isBottenderViber(session)) {
        return {
            method: 'sendPicture',
            params: [{
                text,
                media: contentUrl,
                thumbnail
            }]
        }
    }

    if (Utils.isBottenderTelegram(session)) {
        return [
            text,
            {
                method: 'sendPhoto',
                params: [
                    contentUrl, 
                {
                    caption: name
                }]
            }
        ]
    }

    if (Utils.isBottenderFacebook(session)) {
        return [
            text,
            {
                method: 'sendImage',
                params: [
                    contentUrl
                ]
            }
        ]
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
