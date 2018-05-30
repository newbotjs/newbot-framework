const peg = require('pegjs')
const fs = require('fs')
const _ = require('lodash')

if (typeof window != 'undefined') window._ = _

const grammar = fs.readFileSync(`${__dirname}/grammar.pegjs`,'utf-8')
const parser = peg.generate(grammar)

class Transpiler {
    constructor(script) {
        this.variables = {}
        this._script = script
    }

    run() {
        return parser.parse(this._script)
        /*
        const instructions = []
        const str = this._script.split('\n')
        for (let line of str) {
            instructions.push(this.line(line))
        }
        console.log(instructions)
        return instructions
        */
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