const _ = require('lodash')

class Assert {
    constructor(testing) {
        this.testing = testing
        this.interpreter = this.testing._interpreter
    }
    _getUser() {
        return this.testing.converse.users.get(this.testing.id)
    }
    output(index) {
        if (_.isUndefined(index)) {
            return this.testing._output
        }
        return this.testing._output[index]
    }
    variable(name) {
        const user = this._getUser()
        return user.getVariableInFonction(this.testing.currentLevel, name)
    }
    userVariable(name) {
        const user = this._getUser()
        return user.getVariable(name)
    }
    magicVariable(name) {
        const user = this._getUser()
        return user.getMagicVariable(name)
    }
}

module.exports = Assert