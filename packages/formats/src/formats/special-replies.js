const builder = require('botbuilder')
const browser = require('../../browser').default
const Utils = require('../utils')

module.exports = function (type) {
    return (text, params, {
        session
    }) => {

        if (Utils.isWebSite(session)) {
            return browser.formats[type](text)
        }

        let contentType
        switch (type) {
            case 'phone':
                contentType = 'user_phone_number'
                break
            case 'email':
                contentType = 'user_email'
                break
        }

        const facebook = {
            text,
            quick_replies: [{
                content_type: contentType
            }]
        }

        if (Utils.isBotBuilderFacebook(session)) {
            return new builder.Message(session)
                .sourceEvent({
                    facebook
                })
        }

        if (Utils.isBottenderFacebook(session)) {
            return {
                method: 'sendText',
                params: [
                    text,
                    {
                        quick_replies: facebook.quick_replies
                    }
                ]
            }
        }

        if (Utils.isFacebook(session)) {
            return facebook
        }

        return text
    }
}
