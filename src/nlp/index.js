const _ = require('lodash')
const Wit = require('./wit.ai')
const ApiAi = require('./api.ai')

class Nlp {

    constructor(name, converse, options = {}) {
        this.name = name
        this.converse = converse
        this.options = options
        this.priority = this.options.priority
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
            switch (this.name) {
                case 'wit.ai':
                    Wit(this.converse.config, input, this).then((ret) => {
                        resolve({ structured: ret })
                    })
                    break;
                case 'api.ai':
                    ApiAi(this.converse.config, input, userId, this).then((ret) => {
                        resolve({ structured: ret })
                    })
                    break;
                default:
                    resolve()
                    break;
            }
        })
        .then(({ structured, intents } = {}) => {
            intents = intents || this.intents
            let filterIntents = {}
            for (let key in intents) {
                let intent = intents[key]
                let ret = intent(input, structured)
                if (ret) {
                    filterIntents[key] = ret
                    if (this.name == 'api.ai') {
                        filterIntents[key].speech = structured.result.fulfillment.speech
                    }
                }
            }
            return filterIntents
        })
    }

}

module.exports = Nlp