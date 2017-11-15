const { Converse } = require('../../../index')
const entry = require('./src/entry')

const converse = new Converse()
converse.shareFormats()

entry(converse)

module.exports = converse