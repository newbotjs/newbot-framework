const _ = require('lodash')

class Nlp {

    constructor(name, converse, options = {}) {
        this.name = name
        this.converse = converse
        this.options = options
        this.priority = this.options.priority ? this.options.priority : 0
        this.intents = {}
    }

    add(intents) {
        if (_.isFunction(intents)) {
            this.intents = intents
            return
        }
        this.intents = _.merge(this.intents, intents)
    }

    exec(input, userId) {
        return new Promise((resolve, reject) => {
            if (this.converse._mockNlp && this.converse._mockNlp[this.name]) {
                const ret = this.converse._mockNlp[this.name](input, userId)
                resolve({ structured: ret })
                return
            }
            if (_.isFunction(this.intents)) {
                this.intents(input, userId, this.converse).then((intents) => {
                    resolve({ intents })
                })
                return
            }
            resolve()
        })
        .then(({ structured, intents } = {}) => {
            intents = intents || this.intents
            let filterIntents = {}
            for (let key in intents) {
                let intent = intents[key]
                let user = this.converse._users.get(userId)
                let ret = intent(input, structured, user)
                if (ret) {
                    filterIntents[key] = ret
                }
            }
            return filterIntents
        })
    }

}

module.exports = Nlp