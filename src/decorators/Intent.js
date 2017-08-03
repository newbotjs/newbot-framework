const Decorator = require('./decorator')
const _ = require('lodash')

class IntentEvent extends Decorator {

    run(execution) {
        return new Promise((resolve, reject) => {
            const { intents } = execution
            if (this.instructions && this.instructions.length > 0) {
                execution.execBlock({
                    instructions: this.instructions
                }, 0, 'test', () => {
                    resolve(false)
                })
                return
            }
            if (!intents) {
                resolve(false)
            }
            const intentName = this.params[0]
            const intent = intents[intentName]
            if (intent) {
                execution.setMagicVar(`intent`, intent)
                resolve(true)
            }
            resolve(false)
        })
    }

}

module.exports = IntentEvent