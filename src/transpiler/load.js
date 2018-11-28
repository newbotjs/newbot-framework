const peg = require('pegjs')
const grammar = require('./grammar')
const browser = require('../utils/browser')
const parser = peg.generate(grammar)

if (browser.is()) {
    window.newbotParser = parser
}
else {
    global.newbotParser = parser
}
