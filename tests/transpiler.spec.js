const { expect } = require('chai')
const _ = require('lodash')
const Transpiler = require('../src/transpiler/lexer')

describe('Test Transpiler', () => {

    const t = str => {
        let ret = (new Transpiler(str)).run()
        return ret
    }

    const testVariable = (str, name, value) => {
        const [obj] = t(str)
        expect(obj).to.have.property('variable', name);
        expect(obj).to.have.property('value', value);
    }

    const testArray = (str, array) => {
        const [obj] = t(str)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.property('value').that.is.a('array')
        expect(obj.value).to.have.lengthOf(array.length)
        expect(obj.value).to.deep.equal(array)
        // array.forEach((item, i) => expect(obj.value[i]).to.equal(item))
    }

    const testObject = (str) => {
        const [obj] = t(str)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.property('value').that.is.a('object')
    }

    before(() => {
    })

    it('line', () => {
        const obj =
            t(`
     
        `)
        expect(obj).to.have.lengthOf(0)
    })

    it('single comment', () => {
        const obj =
            t(`// my comment`)
        expect(obj).to.have.lengthOf(0)
    })

    it('two comments', () => {
        const obj =
            t(`// my comment
        // other comment`)
        expect(obj).to.have.lengthOf(0)
    })

    it('instruction +comment', () => {
        const obj =
            t(`test =  1 // my comment`)
        testVariable(`test = 1`, 'test', 1)
    })

    it('comment in function', () => {
        const [obj] =
            t(`start() {
            // hello   
        }`)
        expect(obj).to.have.property('name', 'start')
        expect(obj).to.have.property('type', 'function')
        expect(obj.instructions).to.have.lengthOf(0)
    })

    it('multi comment', () => {
        const obj =
            t(`/*
         my comment
         other comment
         */`)
        expect(obj).to.have.lengthOf(0)
    })

    it('variable integer', () => {
        testVariable(`test = 1`, 'test', 1)
    })

    it('variable unary negation  integer', () => {
        testVariable(`test = -1`, 'test', -1)
    })

    it('variable float', () => {
        testVariable(`test = 1.8`, 'test', 1.8)
    })

    it('variable string', () => {
        testVariable(`test = ''`, 'test', '')
        testVariable(`test = 'foo'`, 'test', 'foo')
    })

    it('variable boolean', () => {
        testVariable(`test = true`, 'test', true)
        testVariable(`test = false`, 'test', false)
    })

    it('variable array', () => {
        testArray(`test = []`, [])
        testArray(`test = [1]`, [1])
        testArray(`test = ['foo']`, ['foo'])
        testArray(`test = [true]`, [true])
        testArray(`test = [true, 1, 'foo']`, [true, 1, 'foo'])
        testArray(`test = [ 1, 2, true    ]`, [1, 2, true])
        testArray(`test = [myvar]`, [{
            variable: 'myvar'
        }])
    })

    it('variable assign array', () => {
        const [obj] = t(`test[0] = 1`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.deep.property('deep', [0])
        expect(obj).to.have.property('value', 1)
    })

    it('variable assign array with variable index', () => {
        const [obj] = t(`test[id] = 1`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.deep.property('deep', [{ variable: 'id' }])
        expect(obj).to.have.property('value', 1)
    })

    it('variable assign array two dimension', () => {
        const [obj] = t(`test[0][1] = 2`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.deep.property('deep', [0, 1])
        expect(obj).to.have.property('value', 2)
    })

    it('variable assign object typeof array', () => {
        const [obj] = t(`object.test[0] = 2`)
        expect(obj).to.have.property('variable', 'object')
        expect(obj).to.have.deep.property('deep', ['test', 0])
        expect(obj).to.have.property('value', 2)
    })

    it('object deep assignation with dynamic key', () => {
        const [obj] = t(`test = other[foo].deep`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.deep.property('deep', [{ variable: 'foo' }, 'deep'])
    })

    it('hard deep', () => {
        const [obj] = t(`test = other['object'].deep[threeStr['str'][0]]`)
        const deep = [
            'object',
            'deep',
            {
                variable: 'threeStr',
                deep: [
                    'str',
                    0
                ],
                type: 'object'
            }
        ]
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.deep.property('deep', deep)
    })

    it('value array', () => {
        const [obj] = t(`test = array[0]`)
        expect(obj.value).to.have.property('variable', 'array')
        expect(obj.value).to.have.deep.property('deep', [0])
    })

    it('variable object', () => {
        testObject(`test = {foo: 1}`)
    })

    it('variable object with variable value', () => {
        const [obj] = t(`test = {foo: foo}`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value.foo).to.have.property('variable', 'foo')
    })

    it('assign variable', () => {
        const [obj] = t(`test = foo`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('variable', 'foo')
    })

    it('expression arithmetic (+)', () => {
        const [obj] = t(`test = 1+1`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+1')
    })

    it('expression arithmetic (+ and *)', () => {
        const [obj] = t(`test = 1 + 1 * 10`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+1*10')
    })

    it('expression arithmetic with variable', () => {
        const [obj] = t(`test = 1 + foo`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+{0}')
        expect(obj.value.variables[0]).to.have.property('variable', 'foo')
    })

    it('expression arithmetic with magic variable', () => {
        const [obj] = t(`test = 1 + $foo`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+{0}')
        expect(obj.value.variables[0]).to.have.property('variable', '$foo')
    })

    it('expression arithmetic with variable (begin)', () => {
        const [obj] = t(`test = foo + 1`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '{0}+1')
        expect(obj.value.variables[0]).to.have.property('variable', 'foo')
    })

    it('expression arithmetic with variable (*/)', () => {
        const [obj] = t(`test = 1 * foo`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1*{0}')
        expect(obj.value.variables[0]).to.have.property('variable', 'foo')
    })

    it('expression arithmetic with multi variable', () => {
        const [obj] = t(`test = 1 + foo + 2 - test + 3 + 1.2`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+{0}+2-{1}+3+1.2')
        const _var = ['foo', 'test']
        obj.value.variables.forEach((item, i) => {
            expect(item).to.have.property('variable', _var[i])
        })
    })

    it('expression arithmetic with object', () => {
        const [obj] = t(`test = 1 + foo.a.b`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+{0}')
        expect(obj.value.variables[0]).to.have.property('variable', 'foo')
        expect(obj.value.variables[0]).to.have.property('type', 'object')
    })

    it('expression arithmetic with array', () => {
        const [obj] = t(`test = 1 + foo[2]`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj.value).to.have.property('expression', '1+{0}')
        expect(obj.value.variables[0]).to.have.property('variable', 'foo')
        expect(obj.value.variables[0]).to.have.property('type', 'object')
    })

    const increment = (sign) => {
        it('increment ' + sign + sign, () => {
            const [obj] = t(`test${sign}${sign}`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}1`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
        })

        it('increment ' + sign + '=', () => {
            const [obj] = t(`test ${sign}= 3`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}3`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
        })

        it('increment ' + sign + '= just variable', () => {
            const [obj] = t(`test ${sign}= foo`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}{1}`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
            expect(obj.value.variables[1]).to.have.property('variable', 'foo')
        })

        it('increment ' + sign + '= plus number', () => {
            const [obj] = t(`test ${sign}= 3 + 5`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}3+5`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
        })

        it('increment ' + sign + '= variable', () => {
            const [obj] = t(`test ${sign}= foo + 3`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}{1}+3`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
            expect(obj.value.variables[1]).to.have.property('variable', 'foo')
        })

        it('increment ' + sign + '= magic variable', () => {
            const [obj] = t(`test ${sign}= $text`)
            expect(obj).to.have.property('variable', 'test')
            expect(obj.value).to.have.property('expression', `{0}${sign}{1}`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
            expect(obj.value.variables[1]).to.have.property('variable', '$text')
        })

        it('increment ' + sign + sign + ' object', () => {
            const [obj] = t(`test.foo${sign}${sign}`)
            const [obj2] = t(`test.foo = test.foo ${sign} 1`)
            delete obj2._file
            delete obj._file
            expect(obj).to.have.deep.equal(obj2)
            expect(obj).to.have.property('variable', 'test')
            expect(obj).to.have.deep.property('deep', ['foo'])
            expect(obj.value).to.have.property('expression', `{0}${sign}1`)
            expect(obj.value.variables[0]).to.have.property('variable', 'test')
        })

        it('increment ' + sign + '= object', () => {
            const [obj] = t(`test.foo ${sign}= 2`)
            const [obj2] = t(`test.foo = test.foo ${sign} 2`)
            delete obj2._file
            delete obj._file
            expect(obj).to.have.deep.equal(obj2)
        })

        it('increment ' + sign + '= object', () => {
            const [obj] = t(`value.more[threeStr.str[1]]${sign}${sign}`)
        })

    }

    increment('+')
    increment('-')

    it('variable assign object', () => {
        const [obj] = t(`test.foo = 2`)
        expect(obj).to.have.property('variable', 'test')
        expect(obj).to.have.deep.property('deep', ['foo'])
        expect(obj).to.have.property('value', 2)
    })

    it('variable assign object', () => {
        const [obj] = t(`test.foo.bar.yo = 2`)
        expect(obj).to.have.deep.property('deep', ['foo', 'bar', 'yo'])
    })

    it('simple function', () => {
        const str =
            `start() {
            
            }`
        const [obj] = t(str)
        expect(obj).to.have.property('name', 'start')
        expect(obj).to.have.property('type', 'function')

    })

    it('simple function with parameters', () => {
        const str =
            `start(foo, bar) {
            
            }`
        const [obj] = t(str)
        expect(obj).to.have.deep.property('params', ['foo', 'bar'])

    })

    it('function with instruction', () => {
        const str =
            `str = 'world'
            @Event('start')
            start() {
               > hello {'str'}
            }`
    })

    it('function return instruction', () => {
        const str =
            `start() {
               return 'foo'
            }`
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('return', 'foo')
    })


    it('simple function with decorator', () => {
        const str =
            `@Event('start')
            start() {
            
            }`
        const [obj] = t(str)
        expect(obj).to.have.property('decorators').that.is.a('array')
        expect(obj).to.have.property('name', 'start')
        expect(obj).to.have.property('type', 'function')
        expect(obj.decorators).to.have.lengthOf(1)
        expect(obj.decorators[0]).to.have.property('name', 'Event')
        expect(obj.decorators[0]).to.have.property('params').that.is.a('array')
        expect(obj.decorators[0].params[0]).to.equal('start')
    })

    it('output with number instruction before', () => {
        const str =
            `
            @Event('start')
            start() {
               nb = 3
               > hello
            }`
        const [obj] = t(str)
        expect(obj.instructions[1]).to.have.property('output', 'hello')
    })

    it('output', () => {
        const str =
            `
            @Event('start')
            start() {
               > hello
            }`
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('output', 'hello')

    })

    it('output translate', () => {
        const str =
            `
            @Event('start')
            start() {
               > you have (no | nb) message [true, 1]
            }`
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('output', 'you have (no | nb) message')
        expect(obj.instructions[0]).to.have.deep.property('params', [true, 1])
    })

    it('output translate with variable', () => {
        const str =
            `
            @Event('start')
            start() {
               > you have nb message [message]
            }`
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('output', 'you have nb message')
        expect(obj.instructions[0]).to.have.deep.property('params', [{
            variable: 'message'
        }])
    })

    it('multi output', () => {
        const str =
            `
            @Event('start')
            start() {
               > hello
               > world
            }`
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('output', 'hello')
        expect(obj.instructions[1]).to.have.property('output', 'world')
    })

    it('output with variable', () => {
        const str =
            `@Event('start')
            start() {
               > hello {'str'}
            }`
        const [obj] = t(str)
        expect(obj.instructions[0].output).to.have.property('text', 'hello {0}')
        expect(obj.instructions[0].output.variables[0]).to.have.property('value', 'str')
    })

    it('function with string variable', () => {
        const str =
            `start('hello {'yeye'}')`
        const [obj] = t(str)
        expect(obj.params[0].variables[0]).to.have.property('value', 'yeye')
    })

    it('object function execution', () => {
        const str =
            `Network.compare()`
        const [obj] = t(str)
        expect(obj).to.have.property('type', 'executeFn')
        expect(obj.name).to.have.property('variable', 'Network')
        expect(obj.name).to.have.deep.property('deep', ['compare'])
        expect(obj.name).to.have.property('type', 'object')
    })

    it('assignation of object function execution', () => {
        const str =
            `compare = Network.compare()`
        const [obj] = t(str)
        expect(obj).to.have.property('variable', 'compare')
        expect(obj.value).to.have.property('variable', '__return_Network-compare')
    })

    it('function execution with return in block ', () => {
        const str =
            `if (true) {
                nb = calc()
                > { nb }
            }`
        const [obj] = t(str)
        expect(obj.instructions).to.have.lengthOf(3)
        expect(obj.instructions[0]).to.have.property('type', 'executeFn')
        expect(obj.instructions[1]).to.have.property('variable', 'nb')
        expect(obj.instructions[1].value).to.have.property('variable', '__return_calc')
        
    })

    it('output with magic variable', () => {
        const str =
            `@Event('start')
            start() {
               > hello {$text}
            }`
        const [obj] = t(str)
        const value = obj.instructions[0].output.variables[0].value
        expect(obj.instructions[0].output).to.have.property('text', 'hello {0}')
        expect(value).to.have.property('variable', '$text')
    })

    it('output with magic object variable', () => {
        const str =
            `@Event('start')
            start() {
               > hello {$response.test}
            }`
        const [obj] = t(str)
        const value = obj.instructions[0].output.variables[0].value
        expect(obj.instructions[0].output).to.have.property('text', 'hello {0}')
        expect(value).to.have.property('variable', '$response')
        expect(value).to.have.deep.property('deep', ['test'])
        expect(value).to.have.property('type', 'object')
    })

    it('negation condition', () => {
        const str =
            `value = !true`
        const [obj] = t(str)
        expect(obj.value).to.have.property('expression', 'not true')
    })

    const conditionExpression = (expression, output) => {
        const str =
            `value = ${expression}`
        const [obj] = t(str)
        expect(obj.value).to.have.property('expression', output)
    }

    it('and condition', () => {
        conditionExpression('aa && bb', '{0} and {1}')
        conditionExpression('aa and bb', '{0} and {1}')
    })

    it('boolean and variable condition', () => {
        conditionExpression('true && bb', 'true and {0}')
        conditionExpression('true and bb', 'true and {0}')
    })

    it('2 and condition', () => {
        conditionExpression('aa && bb && cc', '{0} and {1} and {2}')
        conditionExpression('aa and bb and cc', '{0} and {1} and {2}')
    })

    it('or condition', () => {
        conditionExpression('aa || bb', '{0} or {1}')
        conditionExpression('aa or bb', '{0} or {1}')
    })

    it('> condition', () => {
        conditionExpression('1 > b', '1 > {0}')
    })

    /*it('group condition', () => {
       conditionExpression('aa and bb or cc && (aa or true)', '{0} or {1} or {2} and ({3} or true)')
       
    })*/

    const testCondition = str => {
        const [obj] = t(str)
        expect(obj.instructions[0]).to.have.property('condition', true)
        const [ins] = obj.instructions[0].instructions
        expect(ins).to.have.property('variable', 'test')
    }

    const compareTo = str => {
        const [obj] = t(str)
        expect(obj.instructions[0].condition).to.have.property('variables')
        return obj
    }

    it('condition', () => {
        testCondition(
            `start() {
            (true) {
                test = 1
            }   
        }`)
    })

    it('condition with if keyword', () => {
        testCondition(
            `start() {
            if (true) {
                test = 1
            }   
        }`)
    })

    it('condition without brackets', () => {
        testCondition(
            `start() {
            (true) test = 1
        }`)
    })

    it('condition new line and without brackets', () => {
        testCondition(
            `start() {
            (true) 
                test = 1
        }`)
    })

    it('condition new line and without brackets 2', () => {
        testCondition(
            `start() {
            (true) 
                test = 1
            test = 2
        }`)
    })

    it('Condition : compare variable with number', () => {
        compareTo(`
            start() {
                (text == 1) {
                    test = 1
                }
            }`)
    })

    it('Condition : compare variable with string', () => {
        const obj = compareTo(`
            start() {
                (text == 'ye') {
                    test = 1
                }
            }`)
        const { condition } = obj.instructions[0]
        expect(condition).to.have.property('expression', `{0} == "ye"`)
    })

    it('Condition : compare variable with boolean', () => {
        compareTo(`
            start() {
                (text == true) {
                    test = 1
                }
            }`)
    })

    it('Condition : compare variable with variable', () => {
        compareTo(`
            start() {
                (text == other) {
                    test = 1
                }
            }`)
    })

    it('Condition : compare variable with array', () => {
        compareTo(`
            start() {
                (text == other[9]) {
                    test = 1
                }
            }`)
    })

    it('Condition : compare variable with object', () => {
        compareTo(`
            start() {
                (text == other.foo) {
                    test = 1
                }
            }`)
    })

    it('Condition : compare variable with object bis', () => {
        compareTo(`
            start() {
                (text == other['foo']) {
                    test = 1
                }
            }`)
    })

    it('Condition : function result', () => {
        compareTo(`
            start() {
                (Array.length(array) > 1)  test = 1
            }`)
    })

    it('condition with function called', () => {
        const [obj] = t(`
            @Event('start')
            start() {
                val = 0
                (val < 3) {
                    > {val}
                    Input()
                    val++
                }
            }`)
        expect(obj.instructions[0]).to.have.property('variable', 'val')
    })

    it('condition with keyword before', () => {
        const [obj] = t(`
            @Event('start')
            start() {
                (unknown val) val = 1
            }`)
        expect(obj.instructions[0]).to.have.property('keyword', 'unknown')
    })

    it('while', () => {
        const [obj] = t(`
            start() {
                while (true) {
                    test = 1
                }
            }
        `)

        expect(obj.instructions[0]).to.have.property('loop', true)
    })

    it('while with instructions', () => {
        const [obj] = t(`
            start() {
                while (val < 5) {
                    > {val}
                    val++
                }
            }
        `)

        expect(obj.instructions[0]).to.have.property('loop', true)
    })

    it('for ... of', () => {
        const [{ instructions }] = t(`
            start() {
                name = ['sam', 'jim']
                for (name of names) {
                    > { name }
                }
            }
        `)
        const ins = instructions[1]
        expect(ins.varLocal).to.have.property('variable', 'name')
        expect(ins.array).to.have.property('variable', 'names')
    })

    // Intent

    it('Intent decorator with instructions', () => {
        const [obj] = t(`
            @Intent('departure') {
                (unknown :city) > What is your city?
            }
            search() {
                > ok
            }
        `)
        const ins = obj.decorators[0].instructions[0]
        expect(ins).to.have.property('keyword', 'unknown')
    })

    it('Intent decorator with instruction text', () => {
        const [obj] = t(`
            @Intent('departure') {
                > What is your city?
            }
            search() {
                > ok
            }
        `)
        const ins = obj.decorators[0].instructions[0]
        expect(ins).to.have.property('output', 'What is your city?')
    })

    // Format

    it('Format decorator', () => {
        const [obj] = t(`
            @Event('start')
            start() {
                @Format('button')
                > ok
            }
        `)
        expect(obj.instructions[0]).to.have.property('decorators')
        expect(obj.instructions[0]).to.have.property('output', 'ok')
    })

    it('Variable assignation and output', () => {
        const [obj] = t(`
            foo() {
                a = event.data
                > ok ok
            }
        `)
        expect(obj.instructions[1]).to.have.property('output', 'ok ok')
    })

    it('Group output', () => {
        const [obj] = t(`
            foo() {
                ---
                > hello
                > hey
                ---
            }
        `)
        expect(obj.instructions[0]).to.have.property('group')
        expect(obj.instructions[0].group).to.have.lengthOf(2)
    })

    it('value in string', () => {
        const [obj] = t(`
            foo() {
                Eval.json(\`
                    [
                        { "output": "Two" }
                    ]
                \`)
            }
        `)
        expect(obj.instructions[0]).to.have.property('params')
    })

})