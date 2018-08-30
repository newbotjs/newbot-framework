const DecoratorsList = require('./index')
const _ = require('lodash')

class Decorators {
    constructor(interpreter) {
        this.decorators = {}
        this.interpreter = interpreter
        for (let name in DecoratorsList) {
            this.decorators[name] = []
        }
    }
    add(obj) {
        if (!obj.decorators) return

        const { decorators, name } = obj
        for (let decorator of decorators) {
            this.decorators[decorator.name]
                .push(new DecoratorsList[decorator.name](decorator, name))
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
        const execFn = (item) => {
            hasExec = true
            let fn = this.interpreter.fn[item.fnName]
            /* let done = null
             if (decoratorName == 'Event') {
                 done = () => execution.end()
             }
             */
            execution.execFn(fn, 0, () => execution.end())
        }
        for (let item of decorators) {
            let ret = null
            if (method && item[method]) {
                ret = item[method](execution)
            }
            if (ret instanceof Promise) {
                let bool = await ret
                if (bool && !hasExec) {
                    execFn(item)
                    break
                }
               /* promises.push(ret.then(bool => {
                    if (bool && !hasExec) execFn(item)
                }))*/
            }
            else {
                execFn(item)
                break
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