module.exports = function (user, assert, converse) {

    converse.configure({
        'wit.ai': {
            token: 'RNDPYV3RMC3BZ3EANRP7MPCYBA6N3GZM'
        }
    })

    converse.nlp('wit.ai', {
        departure(string, structured) {
            const { location } = structured.entities
            return { city: location[0].value }
        }
    })

    converse.mockNlp('wit.ai', function () {
        return {
            entities: {
               location: [
                   {
                       value: 'Paris'
                   }
               ]
            }
        }
    })

    converse.useNlp('wit.ai')

    return user
        .start()
        .input('je pars a Paris')
        .spy('search', function () {
            const [output] = this.output()
            assert.equal(output, 'Your departure : Paris')
        })
        .end()
}