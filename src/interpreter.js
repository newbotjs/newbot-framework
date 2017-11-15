const _ = require('lodash')
const colors = require('colors')
const User = require('./user')
const md5 = require('md5')
const math = require('mathjs')
const async = require('async')
const asyncReplace = require('async-replace')

const Decorators = require('./decorators/decorators')
const ExecutionError = require('./error')

class Execution {

    constructor(user, input, options, propagate, interpreter) {
        this.user = user
        this.input = '' + input.text
        this.intents = input.intents
        if (input.type === 'event') {
            this.event = {
                type: input.type,
                name: input.name,
                data: input.data
            }
        }
        this.output = options.output
        this.session = options.session
        this.start = propagate.start
        this.parent = propagate.parent
        this.options = options
        this.interpreter = interpreter
        this.converse = this.interpreter.converse
        this.decorators = interpreter.decorators
        this.hooks = interpreter.converse._hooks
        this.obj = interpreter._obj
        this.error = new ExecutionError(interpreter.converse.script)
        this.namespace = interpreter.namespace
        this.instructionsRoot(() => {
            if (this.event) {
                this.triggerEvent()
            }
            else {
                this.go()
            }
        })
    }

    deepBlock(insParent, deep, pointer = 0) {
        const address = deep[pointer]
        const { index, level } = this.interpreter.index[address]
        const ins = insParent.instructions[index]
        const ret = _.merge(ins, { indexBlock: index })
        if (deep[pointer + 1]) {
            return [ret, ...this.deepBlock(ins, deep, pointer + 1)]
        }
        return [ret]
    }

    triggerEvent() {
        const decorators = this.decorators.get('Event', ['on', this.event.name])
        if (decorators.length > 0) {
            if (this.event.data) {
                this.user.setMagicVariable('event', this.event.data)
            }
            this.decorators.exec(decorators, this)
        }
    }

    triggerAction() {
        const action = this.action(this.input)
        if (action) {
            this.user.setMagicVariable('action', action.value)
            const actions = this.decorators.get('Action', action.name)
            if (actions.length > 0) {
                this.decorators.exec(actions, this)
                return true
            }
        }
    }

    action(text) {
        const match = text.match(/^action\?([a-zA-Z0-9_-]+)(=?)(.*)$/)
        if (!match) return false
        const ret = {
            name: match[1]
        }
        if (match[3]) {
            ret.value = match[3]
        }
        return ret
    }

    go(deepFn = 0) {
        const self = this
        const address = this.interpreter.index[this.user.getAddress(this.namespace)]
        let exec = false

        // Get decorators
        const decorator = {
            start: this.decorators.get('Event', 'start'),
            nothing: this.decorators.get('Event', 'nothing')
        }

        if (this.user.addressStackIslocked(this.namespace)) {
            return
        }

        if (this.triggerAction()) return

        if (address) {
            let { index, level, deep } = address
            let fn = this.interpreter.fn[level]

            this.user.setMagicVariable('text', this.input)
            this.user.popAddress(this.namespace)

            const fnBlock = (index) => {
                this.execFn(fn, index + 1, () => {
                    this.go(deepFn + 1)
                })
            }

            const recursiveExecBloc = (blocks, index, pointer, finish) => {
                let b = blocks[pointer]
                if (pointer < 0) {
                    finish(blocks[0])
                    return
                }
                this.execBlock(b, index + 1, level, () => {
                    return recursiveExecBloc(blocks, b.indexBlock, pointer - 1, finish)
                })
            }

            if (deep.length > 0) {
                const blocks = this.deepBlock(fn, deep)
                recursiveExecBloc(blocks, index, blocks.length - 1, (block) => {
                    fnBlock(block.indexBlock)
                })
            }
            else {
                fnBlock(index)
            }
            exec = true
        }
        else if (this.start && decorator.start.length) {
            this.decorators.exec(decorator.start, this)
            exec = true
        }
        else if (this.decorators.get('Intent').length) {
            this.decorators.execMethod('Intent', 'run', this).then(bool => {
                if (!bool) {
                    execFinish()
                }
            })
            exec = true
        }

        function execFinish() {
            if (deepFn == 0 && decorator.nothing.length) {
                self.decorators.exec(decorator.nothing, self)
            }
            else {
                self.end()
            }
        }

        if (!exec) execFinish()

    }

    end() {
        this.user.clearAddress(this.namespace)
        if (this.hooks.finished) {
            this.hooks.finished(this.input, {
                user: this.user,
                data: this.options.data
            })
        }
        if (this.options.finish) this.options.finish.call(this)
    }

    unlockParent(level) {
        if (!this.parent) return
        this.user.unlockAddressStack(this.parent.namespace, level)
    }

    instructionsRoot(finish) {
        this.instructions(this.obj, 0, 'root', finish)
    }

    instructions(instructions, pointer, level = 'root', finish, options = {}) {
        let ins = instructions[pointer]
        const { isBlock } = options
        const next = () => this.instructions(instructions, pointer + 1, level, finish, options)
        if ((!ins) || (ins && ins.return)) {
            if (!isBlock) {
                this.unlockParent(level)
                if (this.options.finishFn) this.options.finishFn(level)
            }
            if (finish) {
                finish(level)
            }
            if (!isBlock) {
                this.user.garbage(level, this.namespace)
            }
            return
        }

        if (ins.group) {
            let groupIns = ins.group[_.random(0, ins.group.length - 1)]
            groupIns.decorators = ins.decorators
            ins = groupIns
        }

        if (ins.condition) {
            this.execCondition(ins, level, next)
        }
        else if (ins.variable) {
            this.execVariable(ins, level, next)
        }
        else if (ins.output && level != 'root') {
            this.execOutput(ins, level, next)
        }
        else if (ins.type && !options.refresh) {
            switch (ins.type) {
                case 'function':
                    next()
                    break
                case 'executeFn':
                    this.findFunctionAndExec(ins, level, next)
                    break
            }
        }
    }

    findFunctionAndExec(ins, level, next) {
        return new Promise(async (resolve, reject) => {
            const { variable, type, deep } = ins.name
            if (variable) {
                ins.name = variable
            }
            const execFn = (context, ins) => {
                if (context.interpreter.fn[ins.name]) {
                    const params = ins.params
                    const insFn = context.interpreter.fn[ins.name]
                    const paramsFn = insFn.params

                    this.user.addAddress(ins.id, this.namespace)

                    let paramsPromises = []
                    if (params) {
                        for (let i = 0; i < params.length; i++) {
                            paramsPromises.push(new Promise(async (resolve) => {
                                await context.execVariable({
                                    variable: paramsFn[i],
                                    value: _.isUndefined(params[i]) ? null : await this.getValue(params[i], level)
                                }, ins.name, resolve)
                            }))
                        }
                    }
                    Promise.all(paramsPromises).then(() => {
                        context.execFn(insFn, 0, () => {
                            this.user.popAddress(this.namespace)
                            next()
                        })
                    })
                    return true
                }
                else if (context.hasApiFn(ins.name)) {
                    let ret = context.execApiFn(ins, level, next, { deep, data: this.options.data })
                    if (!next) {
                        resolve(ret)
                    }
                    return true
                }
                return false
            }

            if (!execFn(this, ins)) {
                const skill = this.converse.skills().get(ins.name)
                if (skill) {
                    ins.name = deep[0]
                    this.user.lockAddressStack(this.namespace, ins.name)
                    execFn(skill._interpreter.execution, ins)
                }
                else {
                    this.error.throw(ins, 'funtion.not.defined')
                }
            }

        })
    }

    getScope(level) {
        return level == 'root' ?
            this.user.getVariables(this.namespace) :
            this.user.getVariableInFonction(this.namespace, level)
    }

    getVariable(ins, level, value) {
        const set = !_.isUndefined(value)

        let name = ins.variable

        const varFn = this.user.getVariableInFonction(this.namespace, level, name)

        if (/^\$/.test(name)) {
            const variable = this.user.getVariable(this.namespace, name)
            if (set) {
                this.setDeepObject(ins, variable, value, level) ? null :
                    this.user.setVariable(this.namespace, name, value)
            }
            return this.getDeepObject(ins, variable, level)
        }

        if (set) {
            this.setDeepObject(ins, varFn, value, level) ? null :
                this.user.setVariableInFonction(this.namespace, level, name, value)
        }

        if (!_.isUndefined(varFn)) {
            return this.getDeepObject(ins, varFn, level)
        }
    }

    setVariable(object, value, level) {
        this.getVariable(object, level, value)
    }

    setMagicVar(name, value) {
        this.user.magicVar[name] = value
    }

    getMagicVar(name, ins, level) {
        const object = this.user.magicVar[name.replace(':', '')]
        return this.getDeepObject(ins, object, level)
    }

    async _deepObject(ins, object, level, value) {
        const set = !_.isUndefined(value)
        let deep = await this.execParams(ins.deep, level)
        return _[set ? 'set' : 'get'](object, deep, value)
    }

    getDeepObject(ins, object, level) {
        if (ins.type != 'object') return object
        return this._deepObject(ins, object, level)
    }

    setDeepObject(ins, object, value, level) {
        if (ins.type != 'assignObject') return false
        return this._deepObject(ins, object, level, value)
    }

    getValue(obj, level, next) {
        return new Promise(async (resolve, reject) => {
            let scope = this.getScope(level)
            let value = obj
            if (value === null) {
                return resolve(value)
            }
            if (obj.expression) {
                value = await this.execExpression(obj.expression, obj.variables, level)
            }
            else if (obj.variable) {
                if (/^:/.test(obj.variable)) {
                    let name = value.variable
                    value = this.getMagicVar(name, value, level)
                }
                else {
                    /*new ExecutionError('variable.not.exists', {
                        user: this.user,
                        name: obj.variable
                    })
                    */
                    value = this.getVariable(obj, level)
                    if (_.isUndefined(value)) {
                        this.error.throw(obj, 'variable.not.defined')
                    }
                }
            }
            else if (obj.text && !obj.__deepIndex) {
                value = await new Promise((resolve, reject) => {
                    asyncReplace(obj.text, /\{([^\}]+)\}/g, async (match, sub, offset, string, done) => {
                        done(null, await this.getValue(obj.variables[sub].value, level))
                    }, (err, result) => {
                        resolve(result)
                    })
                })
            }
            else if (obj.type == 'executeFn') {
                value = await this.findFunctionAndExec(obj, level)
            }
            else if (value.__deepIndex) {
                for (let address of value.__deepIndex) {
                    let valueObj = await this.getValue(_.get(value, address), level, next)
                    _.set(value, address, valueObj)
                }
            }
            resolve(value)
        })
    }

    execBlock(ins, pointer = 0, level, finish) {
        this.instructions(ins.instructions, pointer, level, () => {
            if (ins.loop) {
                this.execCondition(ins, level, finish)
            }
            else {
                finish()
            }
        }, {
                isBlock: true
            })
    }

    execCondition(ins, level, next) {
        return new Promise((resolve, reject) => {
            this.getValue(ins.condition, level).then(resolve)
        }).then((bool) => {
            switch (ins.keyword) {
                case 'unknown':
                    bool = _.isUndefined(bool) || _.isNull(bool)
                    break
            }
            if (bool) {
                this.execBlock(ins, 0, level, next)
            }
            else {
                next()
            }
        })
    }

    execExpression(expr, variables, level) {
        return new Promise(async (resolve, reject) => {
            expr = await new Promise((resolve, reject) => {
                asyncReplace(expr, /\{([0-9]+)\}/g, async (match, index, offset, string, done) => {
                    let val = await this.getValue(variables[index], level)
                    if (!/[0-9]+(\.[0-9]+)?/.test(val) && !_.isBoolean(val) && val !== null) {
                        val = `"${val}"`
                    }
                    done(null, val)
                }, (err, result) => {
                    resolve(result)
                })
            })
            expr = expr.replace(/'/g, '"')
            resolve(math.eval(expr))
        })
    }

    execVariable(ins, level, next) {
        return new Promise((resolve, reject) => {
            this.getValue(ins.value, level).then(resolve)
        }).then((value) => {
            let scope = this.getScope(level)
            if (!_.isUndefined(scope[ins.variable.replace('$', '')]) && level == 'root' && !this.start) {
                next()
                return
            }
            this.setVariable(ins, value, level)
            next()
        })
    }

    execOutput(ins, level, done) {
        return new Promise(async (resolve, reject) => {
            const { converse } = this.interpreter
            let outputValue = ins.output
            if (!this.output) {
                return
            }

            if (ins.output.variables) {
                outputValue = await this.getValue(ins.output, level)
            }

            const lang = this.user.getLang() || converse.lang.current
            const hasTranslate =
                converse.lang.data[lang] &&
                converse.lang.get(outputValue, null, lang)

            if (hasTranslate) {
                let params = ins.params || []
                params = await this.execParams(params, level)
                outputValue = outputValue.t(lang, ...params)
            }

            if (ins.decorators) {
                for (let d of ins.decorators) {
                    if (d.name == 'Format') {
                        let params = [...d.params]
                        params = await this.execParams(params, level)
                        let name = params[0]
                        if (converse._format[name]) {
                            params.splice(0, 1)
                            outputValue = converse._format[name](outputValue, params, this.options.data)
                        }
                    }
                }
            }
            const send = () => {
                const ret = this.output(outputValue, done, {
                    user: this.user
                })
                if (!_.isUndefined(ret)) {
                    done()
                }
            }
            if (this.hooks.sending) {
                this.hooks.sending(this.input, outputValue, {
                    user: this.user,
                    data: this.options.data
                }, (err) => {
                    if (err) throw err
                    send()
                })
            }
            else {
                send()
            }
        })
    }

    execFn(ins, pointer, done) {
        if (_.isUndefined(this.interpreter.fn[ins.name])) {
            this.error.throw(ins, 'function.not.defined')
        }
        this.instructions(ins.instructions, pointer, ins.name, done)
    }

    execParams(params, level, done) {
        return new Promise((resolve, reject) => {
            async.map(params, async val => {
                return await this.getValue(val, level, done)
            }, (err, result) => {
                if (err) return reject(err)
                resolve(result)
            })
        })
    }

    async execApiFn(ins, level, done, more) {
        switch (ins.name) {
            case 'Prompt':
            case 'Input':
                this.user.addAddress(ins.id, this.namespace)
                if (this.hooks.prompt) {
                    this.hooks.prompt(this.input, ins.params, {
                        user: this.user,
                        data: this.options.data,
                        level
                    })
                }
                if (this.options.waintingInput)
                    this.options.waintingInput.call(this, ins.params, level)
                return
        }
        return this
            .interpreter
            .converse
            .execFunction(ins.name, await this.execParams(ins.params, level, done), done, this.user, more)
    }

    hasApiFn(name) {
        return this
            .converse
            ._functions[name] || ['Prompt', 'Input'].indexOf(name) != -1
    }

}

class Interpreter {
    constructor(obj, users, converse) {
        this._obj = obj
        this.index = {}
        this._users = users
        this.var = []
        this.fn = {}
        this.decorators = new Decorators(this)
        this.converse = converse
        this.namespace = this.converse.namespace
        this.organize(this._obj)
    }
    organize(ins, level = 'root', deepBlock = []) {
        for (let i = 0; i < ins.length; i++) {
            let o = ins[i]

            o.id = this.setId(o, level)

            if (o.type && o.type == 'function') {
                this.fn[o.name] = o
                this.decorators.add(o)
                this.organize(o.instructions, o.name)
                continue
            }
            else if (o.condition) {
                this.organize(o.instructions, level, deepBlock.concat(o.id))
            }

            this.index[o.id] = {
                level,
                index: i,
                namespace: this.namespace,
                deep: deepBlock
            }
        }
    }
    setId(o, level) {
        let id = level + '-' + md5(JSON.stringify(o))
        if (this.namespace) {
            id += '-' + this.namespace
        }
        let i = 1
        while (this.index[id + '-' + i]) {
            i++
        }
        return id + '-' + i
    }
    exec(user, input, options, propagate) {
       this.execution = new Execution(user, input, options, propagate, this)
    }

}

module.exports = Interpreter