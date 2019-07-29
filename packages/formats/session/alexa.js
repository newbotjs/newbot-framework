const _ = require('lodash')

class AlexaSession {
    constructor(req, res) {
        this.req = req
        this.res = res
        this.platform = 'alexa'
    }

    send(params) {
        this.res.shouldEndSession(false)
        if (_.isString(params)) {
            params = {
                text: params
            }
        }
        if (params.text) {
            this.res.say(params.text)
        }
        else {
            this.res.card(params)
        }
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform
        }
    }

    get source() {
        return this.message.source
    }
}

module.exports = AlexaSession
