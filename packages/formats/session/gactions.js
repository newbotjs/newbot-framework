const _ = require('lodash')

class Session {
    constructor(gactions, conv) {
        this.conv = conv
        this.gactions = gactions
        this.platform = 'gactions'
    }

    send(params) {
        if (!_.isArray(params)) {
            params = [params]
        }
        params = params.map(obj => {
            if (obj.method) {
                obj.params = obj.params.map(param => {
                    if (param.buttons) {
                        param.buttons = new this.gactions.Button(param.buttons)
                    }
                    if (param.image) {
                        param.image = new this.gactions.Image(param.image)
                    }
                    return param
                })
                return new this.gactions[obj.method](...obj.params)
            }
            if (obj.text) {
                return obj.text
            }
            return obj
        })
        this.conv.ask(...params)
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

module.exports = Session
