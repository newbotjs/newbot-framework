class Assert {
    constructor(testing) {
        this.testing = testing
        this.interpreter = this.testing._interpreter
    }
    _getUser() {
        return this.testing.converse.users.get(this.testing.id)
    }
    output() {
        return this.testing._output
    }
    variable(name) {
        const user = this._getUser()
        return user.getVariableInFonction(this.testing.currentLevel, name)
    }
    userVariable(name) {
        const user = this._getUser()
        return user.variable['$' + name]
    }
    magicVariable(name) {
        const user = this._getUser()
        return user.getMagicVariable(name)
    }
}

module.exports = Assert