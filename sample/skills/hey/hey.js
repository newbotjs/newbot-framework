const { Converse } = require('conversescript')

const converse = new Converse()
converse.file(__dirname + '/hey.converse')

module.exports = converse