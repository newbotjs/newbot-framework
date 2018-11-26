const Decorator = require('./decorator')
const _ = require('../utils/lodash')

class IntentEvent extends Decorator {

    run(execution) {
        return new Promise((resolve, reject) => {
            const { intents } = execution
            if (this.instructions && this.instructions.length > 0) {
                execution.execBlock({
                    instructions: this.instructions
                }, 0, 'test', () => {
                    resolve(true)
                })
                return
            }
            if (!intents) {
                return resolve(false)
            }

            const intentName = this.params[0]
            let intent = intents[intentName]
            if (intentName.regexp) {
                const regexp = new RegExp(intentName.regexp, intentName.flags.join(''))
                if (regexp.test(execution.input)) {
                    return resolve(true)
                }
            }
            if (_.isFunction(intent)) {
                intent = intent()
            }
            if (intent) {
                execution.setMagicVar(`intent`, intent)
                return resolve(true)
            }
            resolve(false)
        })
    }

}

module.exports = IntentEvent