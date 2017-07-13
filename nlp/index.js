const _ = require('lodash')
const Wit = require('./wit.ai')
const ApiAi = require('./api.ai')

class Nlp {

    constructor(name, converse) {
        this.name = name
        this.converse = converse
        this.intents = {}
    }

    add(intents) {
        this.intents = _.merge(this.intents, intents)
    }

    exec(input, userId) {
        return new Promise((resolve, reject) => {
            if (this.converse._mockNlp && this.converse._mockNlp[this.name]) {
                const ret = this.converse._mockNlp[this.name](input, userId)
                resolve(ret)
                return
            }
            switch (this.name) {
                case 'wit.ai':
                    Wit(this.converse.config, input, this).then(resolve)
                    break;
                case 'api.ai':
                    ApiAi(this.converse.config, input, userId, this).then(resolve)
                    break;
                default:
                    resolve()
                    break;
            }
        }).then((structured) => {
            let filterIntents = {}
            for (let key in this.intents) {
                let intent = this.intents[key]
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