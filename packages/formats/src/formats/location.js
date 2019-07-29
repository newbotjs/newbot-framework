const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')

module.exports = (text, [latitude, longitude, {
    title,
    address
} = {}], {
    session
}) => {

    if (Utils.isWebSite(session)) {
        return {
            text,
            location: {
                latitude,
                longitude
            }
        }
    }

    if (Utils.isBottenderViber(session)) {
        return [
            text,
            {
                method: 'sendLocation',
                params: [{
                    lat: latitude,
                    lon: longitude
                }]
            }
        ]
    }

    if (Utils.isBottenderTelegram(session)) {
        return [
            text,
            {
                method: 'sendLocation',
                params: [{
                    latitude,
                    longitude
                }]
            }
        ]
    }

    if (Utils.isBottenderLine(session)) {
        return [
            text,
            {
                method: 'replyLocation',
                params: [{
                    title,
                    address,
                    latitude,
                    longitude
                }]
            }
        ]
    }

    if (Utils.isAlexa(session)) {
        return {
            type: 'AskForPermissionsConsent',
            permissions: [ 'read::alexa:device:all:address' ]
        }
    }

    if (Utils.isBottenderFacebook(session)) {
        // todo
        return
    }

    if (Utils.isBotBuilder(session)) {
        // todo
        return
    }

    return text
}
