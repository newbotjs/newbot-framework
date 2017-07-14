module.exports = function (user, assert, converse) {

    converse.configure({
        'api.ai': {
            token: process.env.APITOKEN
        }
    })

    converse.nlp('api.ai', {
        departure(string, structured) {
            const { action, parameters } = structured.result
            if (action != 'input.departure') return false
            return parameters
        }
    })

    converse.mockNlp('api.ai', function () {
        return {
            result: {
                action: 'input.departure',
                parameters: {
                    city: 'Paris'
                },
                fulfillment: {
                    speech: 'Très belle ville Paris'
                }
            }
        }
    })

    converse.useNlp('api.ai')

    return user
        .start()
        .input('je pars a Paris')
        .spy('search', function () {
            assert.deepEqual(this.output(), [
                'Your departure : Paris',
                'Très belle ville Paris'
            ])
        })
        .end()
}