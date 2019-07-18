const { ViberClient } = require('messaging-api-viber')
const { MessengerClient } = require('messaging-api-messenger')
const { LineClient } = require('messaging-api-line')
const { SlackWebhookClient } = require('messaging-api-slack')
const { TelegramClient } = require('messaging-api-telegram')
const Session = require('newbot-formats/session/bottender')
const { bot } = require('./connectors/botbuilder-dialog')
const _ = require('lodash')

module.exports = function(settings, getSettings, converse) {
    const clients = {}

    const connect = (platformName, client) => {
        if (settings[platformName]) {
            const platformSetting = getSettings(platformName)
            if (!platformSetting.accessToken) {
                return false
            }
            clients[platformName] = client.connect(platformSetting.accessToken)
        }
    }

    connect('viber', ViberClient)
    connect('messenger', MessengerClient)
    connect('line', LineClient)
    connect('slack', SlackWebhookClient)
    connect('telegram', TelegramClient)

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

        if (obj.address) {
            bot.beginDialog(obj.address, '/', {
                event: obj.event
            })
            return 
        }

        const client = clients[obj.platform]
        if (!client) throw `This ${obj.platform} platform does not exist`

        const _converse = global.converse || converse
       
        const session = new Session(client, {
            userId: obj.userId
        })

        _converse.event(obj.event.name, obj.event.data, obj.userId, _.merge({
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