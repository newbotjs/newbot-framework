const _ = require('./utils/lodash')
const md5 = require('md5')
const jsep = require('jsep')
const async = require('./utils/async')
const isPromise = require('./utils/is-promise')
const asyncReplace = require('async-replace')

const Decorators = require('./decorators/decorators')
const ExecutionError = require('./error')

class Execution {

    constructor(user, input, options, propagate, interpreter) {
        this._nothing = false
        this.user = user
        this._input = input
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
        this.propagate = propagate
        this.start = propagate.start
        this.options = options
        this.interpreter = interpreter
        this.converse = this.interpreter.converse
        this.parent = this.converse.parent
        this.decorators = interpreter.decorators
        this.hooks = interpreter.converse._hooks
        this.obj = interpreter._obj
        this.namespace = interpreter.namespace
        this._finishScript = this.options._finishScript
        this._errorScript = this.options._errorScript
        this.error = new ExecutionError(interpreter.converse.script, this.namespace, this._errorScript)
        this.user.setMagicVariable('text', this.input)
        this.instructionsRoot(() => {
            if (this.event) {
                this.triggerEvent()
            } else {
                this.go()
            }
        })
    }

    deepBlock(insParent, deep, pointer = 0) {
        const address = deep[pointer]
        const {
            index,
            level
        } = this.interpreter.index[address]
        const ins = insParent.instructions[index]
        const ret = _.merge(ins, {
            indexBlock: index
        })
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
        } else {
            this._noExec = true
            this.end()
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

    async go(deepFn = 0) {
        const self = this
        const address = this.interpreter.index[this.user.getAddress(this.namespace)]
        let exec = false
        let execIntent = false

        // Get decorators
        const decorator = {
            start: this.decorators.get('Event', 'start'),
            startAndIntent: this.decorators.get('Event', 'startAndIntent'),
            nothing: this.decorators.get('Event', 'nothing')
        }

        if (this.user.addressStackIslocked(this.namespace)) {
            return this.stopScript()
        }

        if (this.triggerAction()) {
            return this.stopScript()
        }

        if (this.decorators.get('Intent').length) {
            execIntent = await this.decorators.execMethod('Intent', 'run', this)
            if (execIntent) exec = true
        }

        if (!execIntent && address) {
            let {
                index,
                level,
                deep
            } = address
            let fn = this.interpreter.fn[level]

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
            } else {
                fnBlock(index)
            }
            exec = true
        } else if (!execIntent && this.start && decorator.start.length) {
            this.decorators.exec(decorator.start, this)
            exec = true
        } else if (execIntent && this.start && decorator.startAndIntent.length) {
            this.decorators.exec(decorator.startAndIntent, this)
            exec = true
        }

        async function execFinish() {
            if (deepFn === 0) {
                self._noExec = true
                self._nothing = true
                if (decorator.nothing.length) {
                    if (!self.user.nothingSkill) self.user.nothingSkill = self
                }
                if (!self.parent && self.user.nothingSkill) {
                    await self.user.nothingSkill.execNothing()
                }
            }
            self.end()
        }

        if (!exec) execFinish()

    }

    execNothing() {
        const decorator = this.decorators.get('Event', 'nothing')
        this._noExec = false
        return this.decorators.exec(decorator, this)
    }


    stopScript() {
        if (!this.parent) {
            this.user.nothingSkill = null
        }
        this._finishScript({
            noExec: this._noExec,
            nothing: this._nothing
        })
    }

    end() {
        if (this.options.finish) this.options.finish.call(this)
        this.user.clearAddress(this.namespace)
        this.stopScript()
    }

    unlockParent(level) {
        if (!this.parent) return
        this.user.unlockAddressStack(this.parent.namespace, level)
    }

    instructionsRoot(finish) {
        this.instructions(this.obj, 0, 'root', finish)
    }

    async instructions(instructions, pointer, level = 'root', finish, options = {}) {
        let ins = instructions[pointer]
        try {
            const {
                isBlock
            } = options
            const next = ({
                stop,
                value
            } = {}) => {
                if (stop) {
                    pointer = instructions.length
                    options.value = value
                    options.stop = stop
                }
                return this.instructions(instructions, pointer + 1, level, finish, options)
            }

            if (!ins) {
                if (!isBlock) {
                    this.unlockParent(level)
                    if (this.options.finishFn) this.options.finishFn.call(this, level)
                }
                if (finish) {
                    finish({
                        stop: options.stop,
                        value: options.value,
                        level
                    })
                }
                if (!isBlock) {
                    this.user.garbage(level, this.namespace)
                }
                return
            }
            if (!_.isUndefined(ins.return)) {
                const value = await this.getValue(ins.return, level)
                if (!isBlock) {
                    next({
                        stop: true,
                        value
                    })
                } else {
                    finish({
                        stop: true,
                        value
                    })
                }
                return
            }

            ins._pointer = pointer
            ins._instructions = instructions

            this.user.addHistory(ins)

            if (ins.group) {
                let groupIns = ins.group[_.random(0, ins.group.length - 1)]
                groupIns.decorators = ins.decorators
                ins = groupIns
            }

            if (ins.condition) {
                await this.execCondition(ins, level, next)
            } else if (ins.variable) {
                await this.execVariable(ins, level, next)
            } else if (ins.loop) {
                await this.execLoop(ins, level, next)
            } else if (ins.output && level != 'root') {
                this.execOutput(ins, level, next)
            } else if (ins.type && !options.refresh) {
                switch (ins.type) {
                    case 'function':
                        next()
                        break
                    case 'executeFn':
                        this.findFunctionAndExec(ins, level, next).then(next)
                        break
                }
            }
        } catch (err) {
            this.error.throw(ins, err.id, err)
        }
    }

    findFunctionAndExec(ins, level, next) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!_.isString(ins.name)) {
                    const {
                        variable,
                        type,
                        deep
                    } = ins.name
                    if (variable) {
                        ins.name = variable
                    }
                    ins.deep = deep
                }
                const execFn = (context, ins, isChild) => {
                    if (context.interpreter.fn[ins.name]) {
                        const params = ins.params
                        const insFn = context.interpreter.fn[ins.name]
                        const paramsFn = insFn.params
    
                        if (isChild) {
                            this.user.lockAddressStack(this.namespace, ins.name)
                        }
    
                        this.user.addAddress(ins.id, this.namespace)
    
                        let paramsPromises = []
                        if (paramsFn) {
                            for (let i = 0; i < paramsFn.length; i++) {
                                paramsPromises.push(new Promise(async (resolve) => {
                                    await context.execVariable({
                                        variable: paramsFn[i],
                                        value: _.isUndefined(params[i]) ? null : await this.getValue(params[i], level)
                                    }, ins.name, resolve)
                                }))
                            }
                        }
                        Promise.all(paramsPromises).then(() => {
                            context.execFn(insFn, 0, (args) => {
                                this.user.popAddress(this.namespace)
                                resolve(args.value)
                            })
                        })
                        return true
                    } else if (context.hasApiFn(ins.name)) {
                        let ret = this.execApiFn(ins, level, next, {
                            deep: ins.deep,
                            data: this.options.data,
                            context
                        })
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
                        ins.name = ins.deep[0]
                        ins.deep.splice(0, 1)
                        const hasExecChildFn = execFn(skill._interpreter.execution, ins, true)
                        if (!hasExecChildFn) {
                            this.error.throw(ins, 'function.not.defined')
                        }
                    } else {
                        if (ins.deep) {
                            const deep = ins.deep.slice(0, -1)
                            const params = {
                                variable: ins.name,
                                deep
                            }
                            if (ins.deep.length > 1) {
                                params.type = 'object'
                            }
                            const val = await this.getValue(params, level)
                            const fnName = _.last(ins.deep)
                            const jsFn = val[fnName]
                            if (jsFn) {
                                resolve(jsFn.apply(val, ins.params))
                            } else {
                                this.error.throw(ins, 'function.not.defined')
                            }
                        } else {
                            this.error.throw(ins, 'function.not.defined')
                        }
                    }
                }    
            }
            catch (err) {
                reject(err)
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
            try {
                let scope = this.getScope(level)
                let value = obj
                if (value === null) {
                    return resolve(value)
                }
                if (obj.regexp) {
                    value = new RegExp(obj.regexp, obj.flags.join(''))
                } else if (_.isArray(obj)) {
                    value = await async.map(obj, val => this.getValue(val, level))
                } else if (obj.expression) {
                    value = await this.execExpression(obj.expression, obj.variables, level)
                } else if (obj.variable) {
                    if (/^:/.test(obj.variable)) {
                        let name = value.variable
                        value = this.getMagicVar(name, value, level)
                    } else {
                        /*new ExecutionError('variable.not.exists', {
                            user: this.user,
                            name: obj.variable
                        })
                        */
                        value = await this.getVariable(obj, level)

                        /*if (_.isUndefined(value)) {
                            this.error.throw(obj, 'variable.not.defined')
                        }*/
                    }
                } else if (obj.text && !obj.__deepIndex) {
                    value = await new Promise((resolve, reject) => {
                        asyncReplace(obj.text, /\{([^\}]+)\}/g, async (match, sub, offset, string, done) => {
                            done(null, await this.getValue(obj.variables[sub].value, level))
                        }, (err, result) => {
                            resolve(result)
                        })
                    })
                } else if (obj.type == 'executeFn') {
                    value = await this.findFunctionAndExec(obj, level)
                } else if (value.__deepIndex) {
                    for (let address of value.__deepIndex) {
                        let valueObj = await this.getValue(_.get(value, address), level, next)
                        _.set(value, address, valueObj)
                    }
                }

                if (_.isString(value) && value[0] === '#') {
                    value = await this.translate(value.substr(1), level)
                }

                resolve(value)
            } catch (err) {
                reject(err)
            }
        })
    }

    async execBlock(ins, pointer = 0, level, finish) {
        let i
        if (ins.varLocal) {
            let array = await this.getValue(ins.array, level)
            if (_.isNumber(array)) {
                array = new Array(array+1).fill(0).map((_, i) => i)
            }
            else if (_.isPlainObject(array)) {
                delete array.__deepIndex
                array = Object.values(array)
            }
            else if (!_.isString(array) && !_.isArray(array)) {
                const err = new Error('Number, Object, String and Array are only accepted for this loop')
                err.id = 'type.error'
                throw err
            }
            ins.array = array
            i = this.getVariable({ variable: '__' + ins.varLocal.variable }, level)
            this.setVariable(ins.varLocal, ins.array[i], level)
        }
        await this.instructions(ins.instructions, pointer, level, async (options) => {
            if (ins.loop) {
                if (ins.varLocal) {
                    if (i < ins.array.length - 1) {
                        this.setVariable({ variable: '__' + ins.varLocal.variable }, i + 1, level)
                        await this.execBlock(ins, 0, level, finish)
                    }
                    else {
                        finish(options)
                    }
                }
                else {
                    this.execCondition(ins, level, finish)
                }
            } else {
                finish(options)
            }
        }, {
            isBlock: true
        })
    }

    async execLoop(ins, level, finish) {
        this.setVariable({ variable: '__' + ins.varLocal.variable }, 0, level)
        await this.execBlock(ins, 0, level, finish)
    }

    execCondition(ins, level, next) {
        return new Promise((resolve, reject) => {
            this.getValue(ins.condition, level)
                .then(resolve)
                .catch(reject)
        }).then((bool) => {
            switch (ins.keyword) {
                case 'unknown':
                    bool = _.isUndefined(bool) || _.isNull(bool)
                    break
            }
            if (bool) {
                this.execBlock(ins, 0, level, next)
            } else if (ins.conditionsElse) {
                this.execBlock(ins.conditionsElse, 0, level, next)
            } else {
                next()
            }
        })
    }

    execExpression(expr, variables, level) {
        return new Promise(async (resolve, reject) => {
            expr = await new Promise((resolve, reject) => {
                asyncReplace(expr, /\{([0-9]+)\}/g, async (match, index, offset, string, done) => {
                    let val = await this.getValue(variables[index], level)
                    if (!/^[0-9]+(\.[0-9]+)?$/.test(val) && !_.isBoolean(val) && val !== null) {
                        val = `"${val}"`
                    }
                    done(null, val)
                }, (err, result) => {
                    resolve(result)
                })
            })
            expr = expr.replace(/'/g, '"')
            expr = expr.replace(/not/g, '!')
            expr = expr.replace(/and/g, '&&')
            expr = expr.replace(/or/g, '||')
            try {
                const tree = jsep(expr)
                const result = this.arithmetic(tree)
                resolve(result)
            } catch (err) {
                err.id = 'arithmetic.error'
                reject(err)
            }
        })
    }

    arithmetic(tree) {
        let left, right
        if (tree.left) {
            left = this.arithmetic(tree.left)
        }
        if (tree.right) {
            right = this.arithmetic(tree.right)
        }
        switch (tree.type) {
            case 'BinaryExpression':
                switch (tree.operator) {
                    case '+':
                        return left + right
                        break;
                    case '-':
                        return left - right
                        break;
                    case '*':
                        return left * right
                        break;
                    case '/':
                        return left / right
                        break;
                    case '==':
                        return left == right
                        break;
                    case '>=':
                        return left >= right
                        break;
                    case '<=':
                        return left <= right
                        break;
                    case '>':
                        return left > right
                        break;
                    case '<':
                        return left < right
                        break;
                }
                break
            case 'LogicalExpression':
                switch (tree.operator) {
                    case '&&':
                        return left && right
                        break;
                    case '||':
                        return left || right
                        break;
                }
                break
            case 'UnaryExpression':
                switch (tree.operator) {
                    case '!':
                        return !this.arithmetic(tree.argument)
                        break;
                    case '-':
                        return -this.arithmetic(tree.argument)
                        break;
                }
                break
            default:
                return tree.value
        }
    }

    execVariable(ins, level, next) {
        return new Promise((resolve, reject) => {
            this.getValue(ins.value, level)
                .then(resolve)
                .catch(reject)
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

    async translate(str, level, params = []) {
        const {
            converse
        } = this.interpreter
        const lang = this.user.getLang() || converse.lang.current
        const hasTranslate =
            converse.lang.data[lang] &&
            converse.lang.get(str, null, lang)
        if (hasTranslate) {
            params = await this.execParams(params, level)
            str = converse.lang.translate(str, ...[lang, ...params])
        }
        return str
    }

    execOutput(ins, level, done) {
        return new Promise(async (resolve, reject) => {
            const {
                converse
            } = this.interpreter
            let outputValue = ins.output

            if (!this.output) {
                return
            }

            if (ins.output.variables) {
                outputValue = await this.getValue(ins.output, level)
            }

            outputValue = outputValue.replace(/\r$/, '')

            outputValue = await this.translate(outputValue, level, ins.params)

            if (ins.decorators) {
                for (let d of ins.decorators) {
                    if (d.name == 'Format') {
                        let params = [...d.params]
                        params = await this.execParams(params, level)
                        let name = params[0]
                        if (converse._format[name]) {
                            params.splice(0, 1)
                            outputValue = converse._format[name].call(this.converse, outputValue, params, this.options.data, this.user)
                            if (isPromise(outputValue)) {
                                outputValue = await outputValue
                            }
                        }
                    }
                }
            }
            const send = (outputChanged) => {
                const output = outputChanged || outputValue
                const ret = this.output(output, done, {
                    user: this.user
                })
                if (!_.isUndefined(ret)) {
                    done()
                }
            }
            const triggerFound = this._triggerHook('sending', outputValue, {
                user: this.user,
                data: this.options.data
            }, (err, outputChanged) => {
                if (err) throw err
                send(outputChanged)
            })
            if (!triggerFound) send()
        })
    }

    execFn(ins, pointer, done) {
        if (_.isUndefined(this.interpreter.fn[ins.name])) {
            this.error.throw(ins, 'function.not.defined')
        }
        this.instructions(ins.instructions, pointer, ins.name, done)
    }

    execParams(params, level, done) {
        if (!params) {
            return Promise.resolve([])
        }
        return async.map(params, val => this.getValue(val, level, done))
    }

    async execApiFn(ins, level, done, more) {
        switch (ins.name) {
            case 'Prompt':
            case 'Input':
                this.user.addAddress(ins.id, this.namespace)
                this._triggerHook('prompt', ins.params, {
                    user: this.user,
                    data: this.options.data,
                    level
                })
                if (this.options.waintingInput) {
                    this.options.waintingInput.call(this, ins.params, level)
                }
                this.stopScript()
                return
        }
        more.execution = this
        more.level = level
        more.ins = ins
        return (more.context || this)
            .interpreter
            .converse
            .execFunction(ins.name, await this.execParams(ins.params, level, done), done, this.user, more)
    }

    hasApiFn(name) {
        return this
            .converse
            ._functions[name] || ['Prompt', 'Input'].indexOf(name) != -1
    }

    _triggerHook(name, params, data, cb, callParent = true) {
        let triggerFound = false
        if (this.hooks[name]) {
            triggerFound = true
            this.hooks[name](this.input, params, data, cb)
        }
        if (callParent && this.parent && this.parent._hooks[name]) {
            triggerFound = true
            this.parent._hooks[name](this.input, params, data, cb)
        }
        return triggerFound
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
            } else if (o.condition || o.loop) {
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
        return new Promise((resolve, reject) => {
            this.execution = new Execution(user, input, _.merge({
                _finishScript: resolve,
                _errorScript: reject
            }, options), propagate, this)
        })
    }

}

module.exports = Interpreter
