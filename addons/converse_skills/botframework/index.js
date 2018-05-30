const { Converse } = require('../../../index')
const Utils = require('./src/utils')
const entry = require('./src/entry')

module.exports = (langDefault) => {
    const converse = new Converse()
    converse.shareFormats()

    Utils.defaultLanguage = langDefault
    
    entry(converse, langDefault)
    return converse
}