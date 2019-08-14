const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')
const { buttons } = require('./buttons')

module.exports = (text, params = {}, {
    session
}, user) => {

    if (Utils.isGactions(session)) {
        return [
            {
                method: 'SignIn',
                params: [text]
            }
        ]
    }

    if (Utils.isAlexa(session)) {
        return {
            type: 'LinkAccount',
            text
        }
    }

    return buttons(session, text, [
        {
            type: 'account_link',
            url: params.url
        } 
    ], user)
}