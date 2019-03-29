const Decorator = require('./decorator')

class DecoratorCondition extends Decorator {

    run(execution) {
        return new Promise(async (resolve, reject) => {
           const { converse, user, options } = execution
           for (let param of this.params) {
                let fn = converse._conditions[param]
                if (!fn) {
                    reject(new Error(`${param} condition function not exists`))
                    return
                }
                let ret = fn(options.data, user)
                if (ret instanceof Promise) {
                    ret = await ret
                }
                if (!ret) {
                    resolve(false)
                    return
                }
           }
           resolve(true)
        })
    }

}

module.exports = DecoratorCondition