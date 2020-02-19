const _ = require('lodash')
const assert = require('assert')
const User = require('../user')
const Assert = require('./assert')

class UserTesting {

    constructor(converse, data) {
        this.converse = converse
        this.id = _.uniqueId()
        this._output = []
        this.testing = []
        this.spyFn = {}
        this._data = data
        this.assert = new Assert(this)
    }

    start(callback) {
        return this.event('start', callback)
    }

    event(name, value, callback) {
        if (!callback) {
            callback = value
            value = null
        }
        this.testing.push({ type: 'event', name, value, callback })
        return this
    }

    prompt(str, callback) { return this.input(str, callback) }
    input(str, callback) {
        this.testing.push({ type: 'input', str, callback })
        return this
    }

    continue(value, callback) {
        if (!callback) {
            callback = value
            value = undefined
        }
        this.testing.push({ type: 'continue', value, callback })
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
            this._callbackAssert(this.spyFn[fnName].callback)
        }
    }

    throwSpy() {
        for (let fn in this.spyFn) {
            if (!this.spyFn[fn].isCalled) {
                throw `Warning : ${fn}(...) function is never finished`
            }
        }
    }

    setVariable(name, value) {
        let user = this.converse.users.get(this.id)
        if (!user) {
            user = new User(this.id)
            this.converse.users.set(this.id, user)
        }
        user.setVariable('default', name, value)
        return this
    }

    conversation(...array) {
        let testArray = []

        for (let dialog of array) {
            if (dialog.type == 'user') { 
                testArray.push({
                    str: dialog.str,
                    responses: []
                })
            }
            else {
                let last = _.last(testArray)
                if (!last) {
                    testArray.push({
                        start: true,
                        responses: []
                    })
                    last = _.last(testArray)
                } 
                last.responses.push({
                    str: dialog.str
                })
            }
        }

        const _assert = (testing, dialog) => {
            assert.deepEqual(testing.output(), dialog.responses.map(res => res.str))
        }

        if (testArray[0].start) {
            this.start(testing => _assert(testing, testArray[0]))
        }

        for (let dialog of testArray) {
            if (dialog.start) continue
            this.prompt(dialog.str, testing => _assert(testing, dialog))
        }

        return this.end()
    }

    end() {
        return new Promise((resolve, reject) => {
            this._run(0, resolve, reject)
        }).then((error) => {
            this.throwSpy()
        })
    }

    _callbackAssert(callback) {
        const assert = this.assert
        if (callback) callback.call(assert, assert)
    }

    _run(p, done, reject) {
        let test = this.testing[p]

        if (!test) {
            return done()
        }

        const converse = input => {
            return this._converse(input, () => {
                this._callbackAssert(test.callback)
                this._run(p + 1, done, reject)
            }).catch(reject)
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
            case 'continue':
                converse({
                    type: 'continue',
                    data: test.value
                })
                break
        }

    }

    _converse(input, done) {
        this._output = []
       // this.currentLevel = ''
        const self = this

        const commonFinish = function(cb, name) {
            const hasAddress = this.parent && !!this.user.getAddress(this.parent.namespace)
            if (!this._noExec && !hasAddress) cb.call(self, name)
        }

        const exec = (input, options = {}) => {
            options = _.merge({
                output: (str, outputDone) => {
                    this._output.push(str)
                    outputDone()
                },
                waintingInput: (params, level) => {
                    this.currentLevel = level
                    done()
                },
                finish() {
                    commonFinish.call(this, done)
                },
                finishFn(name) {
                    commonFinish.call(this, self.execSpy, name)
                },
                data: this._data
            }, options)
            return this.converse.exec(input, this.id, options)
        }

        if (this.converse._testingWrapper) {
            return this.converse._testingWrapper(input, exec)
        }
        else {
            return exec(input)
        } 
    }

}

module.exports = UserTesting