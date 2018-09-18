const {
    Wit
} = require('node-wit')

module.exports = function ({
    accessToken
}) {

    const client = new Wit({
        accessToken
    })

    return {
        nlp: {
            async wit(text) {
                try {
                    const responses = await client.message(text, {})
                    const intents = {}
                    const entities = {}
                    for (let intentKey in responses.entities) {
                        if (intentKey == 'intent') continue
                        const val = responses.entities[intentKey]
                        entities[intentKey] = Object.assign({}, val[0])
                        entities[intentKey].values = val
                    }
                    for (let intent of responses.entities.intent) {
                        intents[intent.value] = () => {
                            return entities
                        }
                    }
                    return intents
                } catch (err) {
                    console.error(err)
                    return {
                        'wit.error'() {
                            return {
                                error: err.message
                            }
                        }
                    }
                }
            }
        },
        shareNlp: true
    }
}
