const Converse = require('../converse')
const UserTesting = require('./user-testing')

class ConverseTesting extends Converse {

    constructor(...args) {
        super(...args)
        this.testing = true
        this._mock = {}
        this._mockNlp = {}
    }

    createUser(data) {
        return new UserTesting(this, data)
    }

    mock(fnName, callback) {
        this._mock[fnName] = callback
    }

    mockNlp(name, callback) {
        this._mockNlp[name] = callback
    }

    testingWrapper(callback)  {
        this._testingWrapper = callback
    }

}

module.exports = ConverseTesting