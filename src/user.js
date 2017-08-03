const _ = require('lodash')

class User {
    constructor(id) {
        this.address = []
        this.varFn = {}
        this.magicVar = {}
        this.variables = {}
        this.id = id
    }

    addAddress(address) {
        this.address.push(address)
    }

    getAddress() {
        return _.last(this.address)
    }

    hasAddress() {
        return this.address.length > 0
    }

    clearAddress() {
        this.address = []
    }

    popAddress() {
        this.address.pop()
    }

    garbage(level) {
        delete this.varFn[level]
    }

    get variable() {
        return this.variables
    }

    getVariableInFonction(fnName, varName) {
        if (!this.varFn[fnName]) {
            return
        }
        return this.varFn[fnName][varName]
    }

    getMagicVariable(name) {
        return this.magicVar[name]
    }

    setMagicVariable(name, value) {
        this.magicVar[name] = value
    }

    getVariable(name) {
        name = name.replace(/^\$/, '')
        return this.variables[name]
    }

    setVariable(name, value) {
        name = name.replace(/^\$/, '')
        this.variables[name] = value
    }

    saveSession(session) {
        this.session = session
    }

    retrieveSession() {
        return this.session
    }

    toJson() {
        return {
            _current: {
                _address: this.address,
                _var: this.varFn,
                _magicVar: this.magicVar
            },
            _session: this.session,
            data
        }
    }

    fromJson(json) {
        this.address = json._current._address
        this.varFn = json._current._var
        this.magicVar = json._current._magicVar
        this.session = json._session
        this.variables = json.data
        return this
    }

}

module.exports = User