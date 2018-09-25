const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = (text, [phone, name], {
    session
}) => {

    if (Utils.isWebSite(session)) {
        return {
            text,
            contact: {
                phone,
                name
            }
        }
    }

    if (Utils.isBottenderViber(session)) {
        return [
            text,
            {
                method: 'sendContact',
                params: [{
                    name,
                    phone_number: phone
                }]
            }
        ]
    }

    if (Utils.isBottenderTelegram(session)) {
        return [
            text,
            {
                method: 'sendContact',
                params: [{
                    name: first_name,
                    phone_number
                }]
            }
        ]
    }

    if (Utils.isBottenderFacebook(session)) {
        return {
            method: 'sendTemplate',
            params: {
                template_type: 'button',
                text: name,
                buttons: [{
                    type: 'phone_number',
                    title: 'Call',
                    payload: phone
                }]
            }
        }
    }

    if (Utils.isBottenderLine(session)) {
        // todo
        return
    }

    if (Utils.isBotBuilder(session)) {
        // todo
        return
    }

    return text
}
