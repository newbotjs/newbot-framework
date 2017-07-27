const _ = require('lodash')
const Assert = require('./assert')

class UserTesting {

    constructor(converse) {
        this.converse = converse
        this.id = _.uniqueId()
        this._output = []
        this.testing = []
        this.spyFn = {}
        this.assert = new Assert(this)
    }

    start(callback) {
        return this.event('start', null, callback)
    }

    event(name, value, callback) {
        this.testing.push({ type: 'event', name, value, callback })
        return this
    }

    input(str, callback) {
        this.testing.push({ type: 'input', str, callback })
        return this
    }

    action(name, value, callback) {
        this.testing.push({ type: 'action', name, value, callback })
        return this
    }

    spy(fnName, callback) {
        this.spyFn[fnName] = { callback }
        return this
    }

    execSpy(fnName) {
        if (this.spyFn[fnName]) {
            this.currentLevel = fnName
            this.spyFn[fnName].isCalled = true
            this.spyFn[fnName].callback.call(this.assert)
        }
    }

    throwSpy() {
        for (let fn in this.spyFn) {
            if (!this.spyFn[fn].isCalled) {
                throw `Warning : ${fn}(...) function is never finished`
            }
        }
    }

    end() {
        return new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => {
                    this._run(0, resolve)
                })
                .catch((error) => reject(error))
        }).then(() => {
            this.throwSpy()
        })
    }

    _run(p, done) {
        let test = this.testing[p]

        if (!test) {
            return done()
        }

        const converse = input => {
            this._converse(input, () => {
                if (test.callback) test.callback.call(this.assert)
                this._run(p + 1, done)
            })
        }
        switch (test.type) {
            case 'event':
                if (test.name === 'start') {
                    converse('/start')
                }
                else {
                    converse({
                        type: 'event',
                        name: test.name,
                        data: test.value
                    })
                }
                break
            case 'action':
                converse(`action?${test.name}=${test.value}`)
                break
            case 'input':
                converse(test.str)
                break
        }

    }

    _converse(input, done) {
        this._output = []
        this.currentLevel = ''
        this.converse.exec(input, this.id, {
            output: (str, done) => {
                this._output.push(str)
                done()
            },
            waintingInput: (params, level) => {
                this.currentLevel = level
                done()
            },
            finish() {
                done()
            },
            finishFn: (name) => {
                this.execSpy(name)
            }
        })
    }

}

module.exports = UserTesting