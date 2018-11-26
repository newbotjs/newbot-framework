const peg = require('pegjs')
const fs = require('../utils/fs')
const _ = require('lodash')
const ExecutionError = require('../error')

const grammar = require('./grammar')

const parser = peg.generate(grammar)

if (typeof window != 'undefined') window._ = _

class Transpiler {
    
    constructor(script) {
        this.variables = {}
        this._script = script
        this.parser = parser
    }

    run() {
        try {
            return this.parser.parse(this._script)
        }
        catch (err) {
            const error = new ExecutionError(this._script)
            error.syntax(err)
        }
    }

    line(str) {
        str = str.trim()
        return this.parser.parse(str)
    }

    isVariable() {
        //
    }
}

module.exports = Transpiler