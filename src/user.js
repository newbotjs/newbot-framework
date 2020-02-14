const _ = require('./utils/lodash')

class User {
    
    constructor(id) {
        this.address = {}
        this._infoAddress = {
            lock: {},
            actived: {}
        }
        this._realSkill = {}
        this.varFn = {}
        this.magicVar = {}
        this.variables = {}
        this.id = id
        this.lang = null
        this._history = []
        this._nlpCache = {}
    }

    _createNamespace(namespace) {
        if (!this.address[namespace]) {
            this.address[namespace] = []
        }
        if (!this.variables[namespace]) {
            this.variables[namespace] = {}
        }
        if (!this.varFn[namespace]) {
            this.varFn[namespace] = {}
        }
    }

    addAddress(address, namespace) {   
        this._createNamespace(namespace)
        this.address[namespace].push(address)
    }

    getAddress(namespace) {
        this._createNamespace(namespace)
        return _.last(this.address[namespace])
    }

    hasAddress(namespace) {
        this._createNamespace(namespace)
        return this.address[namespace].length > 0
    }

    clearAddress(namespace) {
        this._createNamespace(namespace)
        this.address[namespace] = []
    }

    popAddress(namespace) {
        this._createNamespace(namespace)
        this.address[namespace].pop()
    }

    garbage(level, namespace) {
        this._createNamespace(namespace)
        delete this.varFn[namespace][level]
    }

    hasLockAddressStack(namespace) {
        return !!this._infoAddress.lock[namespace]
    }

    lockAddressStack(namespace, fnName, {
        activated
    } = {}) {
        this._infoAddress.lock[namespace] = fnName
        if (activated) {
            this._infoAddress.actived[namespace] = fnName
        }
    }

    unlockAddressStack(namespace, fnName, {
        activated
    } = {}) {
        if (this._infoAddress.lock[namespace] === fnName) {
            delete this._infoAddress.lock[namespace]
            if (activated) {
                delete this._infoAddress.actived[namespace]
            }
        }
    }

    addressStackIslocked(namespace) {
        return this._infoAddress.lock[namespace]
    }

    getVariables(namespace) {
        this._createNamespace(namespace)
        return this.variables[namespace]
    }

    getVariable(namespace, name) {
        name = name.replace(/^\$/, '')
        this._createNamespace(namespace)
        return this.variables[namespace][name]
    }

    setVariable(namespace, name, value) {
        name = name.replace(/^\$/, '')
        this._createNamespace(namespace)
        this.variables[namespace][name] = value
    }

    getVariableInFonction(namespace, fnName, varName) {
        this._createNamespace(namespace)
        if (!this.varFn[namespace][fnName]) {
            this.varFn[namespace][fnName] = {}
        }
        if (!varName) {
            return this.varFn[namespace][fnName]
        }
        return this.varFn[namespace][fnName][varName]
    }

    setVariableInFonction(namespace, fnName, varName, value) {
        this._createNamespace(namespace)
        if (!this.varFn[namespace][fnName]) {
            this.varFn[namespace][fnName] = {}
        }
        return this.varFn[namespace][fnName][varName] = value
    }

    getMagicVariable(name) {
        return this.magicVar[name]
    }

    setMagicVariable(name, value) {
        this.magicVar[name] = value
    }
    
    saveSession(session) {
        this.session = session
    }

    retrieveSession() {
        return this.session
    }

    setRealSkill(skillName, index) {
        this._realSkill[skillName] = index
    }

    getRealSkill(skillName) {
        return this._realSkill[skillName] || 0
    }

    setLang(lang) {
        this.lang = lang
    }

    getLang() {
        return this.lang
    }

    addHistory(ins) {
        this._history.push(ins)
    }

    resetHistory(ins) {
        this._history = []
    }

    toJson() {
        return {
            _current: {
                _address: this.address,
                _var: this.varFn,
                _magicVar: this.magicVar,
                _infoAddress: this._infoAddress
            },
            _session: this.session,
            data: this.variables,
            lang: this.lang,
            id: this.id
        }
    }

    fromJson(json) {
        this.address = json._current._address || {}
        this._infoAddress = json._current._infoAddress || { lock: {} }
        this.varFn = json._current._var || {}
        this.magicVar = json._current._magicVar || {}
        this.session = json._session || {}
        this.variables = json.data || {}
        this.lang = json.lang
        this.id = json.id
        return this
    }

}

module.exports = User