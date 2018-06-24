const { Converse } = require('conversescript')

const converse = new Converse()
converse.file(__dirname + '/hey.converse')

converse.functions({
    hello() {
        return 'Hey'
    }
})

module.exports = converse