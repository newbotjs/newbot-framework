const { ViberClient } = require('messaging-api-viber')
const Session = require('newbot-formats/session/bottender')
const _ = require('lodash')

module.exports = function(settings, getSettings) {
    const clients = {}
    if (settings.viber) {
        const platformSetting = getSettings('viber')
        if (!platformSetting.accessToken) {
            return function() {
                throw `The token does not exist for the ${'viber'} platform`
            }
        }
        clients.viber = ViberClient.connect(platformSetting.accessToken)
    }
    return function(obj) {
        if (!obj.event) {
            throw 'You did not put the event property'
        }
        if (_.isString(obj.event))  {
            obj.event = {
                name: obj.event,
                data: {}
            }
        }
        if (!obj.platform) throw 'Please indicate the platform (messenger, telegram, viber, etc.)'
        if (!obj.userId) throw 'Please enter the user ID'
        if (!obj.event.name) throw 'Please indicate the name of the event to be triggered'

        const client = clients[obj.platform]

        if (!client) throw `This ${obj.platform} platform does not exist`

        const _converse = global.converse || converse
        const session = new Session(client, {
            userId: obj.userId
        })
        return _converse.event(obj.event.name, obj.userId, obj.event.data, _.merge({
            output(str, next) {
                session.send(str)
                next()
            },
            data: {
                session
            }
        }, settings.output))
    }
}