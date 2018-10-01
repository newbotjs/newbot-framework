const _ = require('lodash')

class Session {
    constructor(gactions, conv) {
        this.conv = conv
        this.gactions = gactions
        this.platform = 'gactions'
    }

    send(params) {
        let preText
        if (!_.isArray(params)) {
            params = [params]
        }
        params = params.map(obj => {
            if (obj.text) preText = obj.text
            if (obj.method) {
                return new this.gactions[obj.method](...obj.params)
            }
            return obj
        })
        if (preText) {
            this.conv.ask(preText)
        }
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
