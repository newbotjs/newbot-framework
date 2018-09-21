const peg = require('pegjs')
const fs = require('fs')
const _ = require('lodash')
const ExecutionError = require('../error')

if (typeof window != 'undefined') window._ = _

const grammar = fs.readFileSync(`${__dirname}/grammar.pegjs`,'utf-8')
const parser = peg.generate(grammar)

class Transpiler {
    constructor(script) {
        this.variables = {}
        this._script = script
    }

    run() {
        try {
            return parser.parse(this._script)
        }
        catch (err) {
            const error = new ExecutionError(this._script)
            error.syntax(err)
        }
    }

    line(str) {
        str = str.trim()
        return parser.parse(str)
    }

    isVariable() {
        //
    }
}

module.exports = Transpiler