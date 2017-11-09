const { Converse } = require('../../../../index')

const converse = new Converse()
converse.code(`
    @Intent('hello')
    hello() {
        > Child
        Prompt()
        > Test
    }
`)

converse.nlp('regexp', {
    hello(str) {
        return /hello/i.test(str) ? { hello: true } : false
    }
})

converse.useNlp('regexp')

module.exports = converse