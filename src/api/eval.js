const Interpreter = require('../interpreter')

const Eval = {
    
     $params: ['users', 'execution'],
 
     json(json, users, execution) {
        try {
            const { converse, user, _input, options, propagate } = execution
            const obj = JSON.parse(json)
            const interpreter = new Interpreter(obj, users, execution.converse)
            return interpreter.exec(user, _input, options, propagate)
        }
        catch (err) {
            console.log(err)
        }
     }
 }
 
 
 module.exports = Eval