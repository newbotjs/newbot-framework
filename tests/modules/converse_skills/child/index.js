const { Converse } = require('../../../../index')

const converse = new Converse()
converse.code(`
    @Intent('hello')
    hello() {
        > Child
        Prompt()
        > Test
    }

    foo() {
        > Lazy 3
    }

    lazy(b) {
        > Lazy {b}
        Prompt()
        > Lazy 2
        foo()
        Prompt()
        > Lazy 4
    }
`)

converse.nlp('regexp', {
    hello(str) {
        return /hello/i.test(str) ? { hello: true } : false
    }
})

converse.functions({
    jsFunction() {
        return 'js'
    }
})

module.exports = converse