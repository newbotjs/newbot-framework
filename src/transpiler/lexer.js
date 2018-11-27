const _ = require('../utils/lodash')
const browser = require('../utils/browser')
const ExecutionError = require('../error')
let parser

if (!browser.is()) {
    const peg = require('pegjs')
    const grammar = require('./grammar')
    parser = peg.generate(grammar)
}

if (typeof window != 'undefined') window._ = _

class Transpiler {
    
    constructor(script, namespace) {
        this.variables = {}
        this._script = script
        this.namespace = namespace
        this.parser = parser
    }

    run(reject) {
        try {
            return this.parser.parse(this._script)
        }
        catch (err) {
            const error = new ExecutionError(this._script, this.namespace, reject)
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