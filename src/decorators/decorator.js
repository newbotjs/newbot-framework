const _ = require('../utils/lodash')

class Decorator {

    constructor(decorator, fnName) {
        this.decorator = decorator
        this.otherDecorators = {}
        this.name = this.decorator.name
        this.instructions = decorator.instructions
        this.params = decorator.params
        this.fnName = fnName
    }

    findParam(params) {
        const diff = _.difference(this.params, params)
        return diff.length === 0
    }

}

module.exports = Decorator