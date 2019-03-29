const DecoratorsList = require('./index')
const ExecutionError = require('../error')
const _ = require('../utils/lodash')

class Decorators {
    constructor(interpreter) {
        this.decorators = {}
        this.interpreter = interpreter
        this.error = new ExecutionError(this.interpreter.converse.script, this.interpreter.namespace)
        for (let name in DecoratorsList) {
            this.decorators[name] = []
        }
    }
    add(obj) {
        if (!obj.decorators) return
        const {
            decorators,
            name
        } = obj
        let decoratorsOfFunction = []
        for (let decorator of decorators) {
            if (!this.decorators[decorator.name]) {
                this.error.throw(obj, 'decorator.error', new Error(`Decorator "${decorator.name}" not exists`))
            }
            decoratorsOfFunction.push(new DecoratorsList[decorator.name](decorator, name))
            
        }
        for (let decorator of decoratorsOfFunction) {
            for (let decorator2 of decoratorsOfFunction) {
                if (decorator.name == decorator2.name) continue
                if (!decorator.otherDecorators[decorator2.name]) decorator.otherDecorators[decorator2.name] = []
                decorator.otherDecorators[decorator2.name].push(decorator2)
            }
            this.decorators[decorator.name].push(decorator)
        }       
    }

    get(decoratorName, params) {
        let decorators = this.decorators[decoratorName]
        let decoratorsFound = []

        if (decorators.length === 0) return []
        if (!_.isArray(params)) {
            params = [params]
        }
        for (let d of decorators) {
            if (!_.isUndefined(params[0]) && !d.findParam(params)) {
                continue
            }
            decoratorsFound.push(d)
        }
        return decoratorsFound
    }

    async _exec(decorators, execution, method) {
        let hasExec = false
        let promises = []
        const execFn = async (item) => {
            if (item.otherDecorators.Condition) {
                for (let condition of item.otherDecorators.Condition) {
                    const ret = await condition.run(execution)
                    if (!ret) return false
                }
            }
            hasExec = true
            let fn = this.interpreter.fn[item.fnName]
            execution.execFn(fn, 0, () => execution.end())
            return true
        }
        for (let item of decorators) {
            let ret = null
            if (method && item[method]) {
                ret = item[method](execution)
            }
            if (ret instanceof Promise) {
                let bool = await ret
                if (bool && !hasExec) {
                    let isExec = await execFn(item)
                    if (isExec) break
                }
            } else {
                let isExec = await execFn(item)
                if (isExec) break
            }
        }
        return hasExec
    }

    async execMethod(decoratorName, method, execution) {
        const decorators = this.decorators[decoratorName]
        return await this._exec(decorators, execution, method)
    }

    async exec(decorators, execution, params) {
        if (!_.isArray(decorators)) {
            decorators = this.get(decorators, params)
        }
        if (!decorators) {
            return false
        }
        return await this._exec(decorators, execution)
    }

}

module.exports = Decorators
