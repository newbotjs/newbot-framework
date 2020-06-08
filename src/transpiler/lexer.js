const _ = require('../utils/lodash')
const browser = require('../utils/browser')
const ExecutionError = require('../error')
let parser

if (browser.is()) {
    parser = window.newbotParser
}
else {
    parser = global.newbotParser
}

if (typeof window != 'undefined') window._ = _

class Transpiler {
    
    constructor(script, namespace) {
        this.variables = {}
        this._script = script
        this.namespace = namespace
        this.parser = parser
    }

    run() {
        if (browser.is() && !this.parser) {
            throw 'You can not use the parser. Integrate rather the "newbot.with-parser.min.js" file'
        }
        try {
            return this.parser.parse(this._script)
        }
        catch (err) {
            const error = new ExecutionError(this._script, this.namespace)
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