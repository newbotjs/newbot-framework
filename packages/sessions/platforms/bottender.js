const _ = require('lodash')

class Session {
    constructor(context, {
        platform,
        userId
    } = {}) {
        this.context = context
        this.platform = platform
        this.userId = userId
    }

    send(methods) {
        if (!_.isArray(methods)) {
            methods = [methods]
        }
        for (let obj of methods) {
            if (_.isString(obj) || !obj.method) {
                if (obj.text) {
                    obj = obj.text
                }
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
            let params = obj.params
            if (this.userId) {
                params = [this.userId, ...params]
            }

            this.context[obj.method].apply(this.context, params)
        }
    }

    get message() {
        return {
            source: this.platform || this.context.platform,
            agent: 'bottender',
            user: this.user
        }
    }

    get user() {
        if (this.userId) {
            return {
                id: this.userId
            }
        }
        return this.context.session.user
    }

    get source() {
        return this.message.source
    }
}

module.exports = Session
