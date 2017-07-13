const _ = require('lodash')

class Decorator {

    constructor(decorator, fnName) {
        this.decorator = decorator
        this.instructions = decorator.instructions
        this.params = decorator.params
        this.fnName = fnName
    }

    findParam(params) {
        return _.find(this.params, p => params.indexOf(p) != -1)
    }

}

module.exports = Decorator