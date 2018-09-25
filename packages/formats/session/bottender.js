const _ = require('lodash')

class Session {
    constructor(context, platform) {
        this.context = context
        this.platform = platform
    }

    send(methods) {
        if (!_.isArray(methods)) {
            methods = [methods]
        }
        for (let obj of methods) {
            if (_.isString(obj)) {
                obj = {
                    method: 'sendText',
                    params: [obj]
                }
                switch (this.platform) {
                    case 'slack':
                        obj.method = 'postMessage'
                        break
                    case 'telegram':
                        obj.method = 'sendMessage'
                        break;
                    case 'line':
                        obj.method = 'replyText'
                        break;
                }
            }
            this.context[obj.method].apply(this.context, obj.params)
        } 
    }

    get message() {
        return {
            source: this.platform || this.context.platform,
            agent: 'bottender'
        }
    }

    get source() {
        return this.message.source
    }
}

module.exports = Session
