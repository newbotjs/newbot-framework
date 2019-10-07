module.exports = `
{
    var _

    if (typeof window == 'undefined') {
        _ = require('lodash')
    }
    else {
        _ = window._
    }
    
    const DEEP_NAME = '__deepIndex'

    var pushIns = []

    function increment(variable, sign, expression, variables=[]) {
        let _var
       
        if (variable.variable){
            _var = variable
        }
        else {
            _var = { variable }
        }

        const value = {
            variables: [_var, ...variables],
            expression: \`{0}\${sign.charAt(0)}\${expression}\`
        }

        if (variable.variable) {
            _var = {}
            for (let key in variable) {
                if (key == 'type') {
                    _var[key] = 'assignObject'
                    continue
                }
                _var[key] = variable[key]
            }
        }

        return _.merge(_var, { value })
    }

    function stringParser(text) {
        let variables = []
        let index = -1
        text = text
            .map(letter => {
                if (_.isString(letter)) return letter
                variables.push(letter)
                index++
                return '{' + index + '}'
            })
            .join('')
        if (variables.length == 0) {
            return text
        }
        return {
            text,
            variables
        }
    }

    function normalizeIns(instructions) {
        return instructions
            .reduce((acc, val) => acc.concat(val), [])
            .filter(it => it)
    }

}

    
Start
    = InstructionList

InstructionList
    = _ list:Instruction* _ {
        return list.filter(it => it)
    }

Instruction
    = _ decorators:DecoratorList? _ ins:(Comment / Condition / ForOfLoop / Increment / Assign / AssignObject / Function / ExecuteFunction) Nl* _ {
        const _location = location()
        if (ins) {
            ins._file = _location
            if (decorators) {
                ins.decorators = decorators
            }
        }
        return ins
    }

// Assign Variable

DeepArray
    = index:(_ '[' _ Value _ ']')+ {
        let deep = []
        for (let val of index) {
            deep.push(val[3])
        }
        return deep
    }

GetObject
    = variable:Variable _ deep:(DeepObject / DeepArray)+ {
         deep = _.flatten(deep)
         return { variable, deep, type: 'object' }
    }

DeepObject
    = deep:('.' _ Variable S DeepArray?)+ {
        let array = []
        for (let d of deep) {
            array.push(d[2])
            if (d[4]) {
                array = array.concat(d[4])
            }
        }
        return array
    }

IncrementVariable
    = variable:(GetObject / Variable) {
        return variable
    }

Increment
    = variable:IncrementVariable _ sign:('++' / '--') {
         return increment(variable, sign, 1)
    }
    / IncrementExpression

IncrementExpression
    = variable:IncrementVariable _ sign:('+=' / '-=') _ expr:Expression {
        let { variables, expression } = expr
        if (!variables) variables = []
        if (expression) {
            expression = expression.replace(/\\{([0-9]+)\\}/g, (match, index) => {
                return \`{\${+index+1}}\`
            })
        }
        else if (expr.variable) {
            expression = '{1}'
            variables.push(expr)
        }
        else {
            expression = expr
        }
        return increment(variable, sign, expression, variables)
    }

Assign
    = variable:Variable _ value:RightAssign {
        return { variable, value }
    }

AssignObject
    = object:GetObject _ value:RightAssign {
        object.type = 'assignObject'
        object.value = value
        return object
    }


RightAssign 
    = '=' _ value:(Value) {
        return value
    }

Value =  
    RegExp / StringBackQuote / String / Null / Array / obj:Object { 
        // Clean __deepIndex
        const index = obj[DEEP_NAME]
        if (!index) return obj
        for (let address of index) {
            let subobj = _.get(obj, address.replace(/\\.[^.]+$/, ''))
            delete subobj[DEEP_NAME]
        }
        return obj
    } / Expression

// For Loop

ForLoop
    = 'for' _ '(' _ assign:Assign _ ';' _ condition:Expression _ ';' _ increment:Increment _ ')' _ instructions:ConditionInstruction {
   
    } 

ForOfLoop
    = 'for' _ '(' _  varLocal:VariableName _ 'of' _ array:Value _ ')' _ instructions:ConditionInstruction {
        let obj = { varLocal, array, instructions }
        obj.loop = true
        return obj
    }

// Condition

Condition 
    = keyword:('while' / 'if'?) _ '(' _ special:SpecialKeyword? _ condition:Expression _ ')' _ instructions:ConditionInstruction  _ conditionsElse:ConditionElse? {
        let obj = { condition, instructions, conditionsElse }
        if (keyword == 'while') {
            obj.loop = true
        }
        if (special) {
            obj.keyword = special
        }
        return obj
    }

ConditionInstruction
    = '{' _  instructions:InstructionFunction* _ '}' {
        return normalizeIns(instructions)
    }
     / instruction:InstructionFunction {
        return [instruction]
    }

ConditionSign 
    = keyword:('and' / '&&' / 'or' / '||' / 'xor' / ([><=!] '=') / '<' / '>') {
        if (keyword == '&&') keyword = 'and'
        if (keyword == '||') keyword = 'or'
        if (_.isArray(keyword)) keyword = keyword.join('')
        return ' ' + keyword + ' '
    }

ConditionElse =
    'else' _ ins:(instructions:ConditionInstruction / instructions:Condition*)  {
        return {
            instructions: ins
        }
    }

SpecialKeyword
    = 'unknown' / 'defined'

Not
    = keyword:('!' / 'not') {
        if (keyword == '!') keyword = 'not'
        return keyword + ' '
    }

// Expression

Expression "expression"
  =  head:(Not? _ Factor) tail:( [ ]* (ConditionSign / '+' / '-' / '**' / '*' / '/' / '%' ) _ Factor)* {

        const not = head[0]
        const isExpr = tail.length > 0 || not

        head = head[2]

        let result = head
        let variables = []
        let ret = {}
        let j=0

        const isVariable = obj => obj.variable || obj.type === 'executeFn'

        if (isExpr && isVariable(head)) {
            variables.push(head)
            result = '{' + j + '}'
            j++
        }

        for (let i = 0; i < tail.length; i++) {
            let val = tail[i][3]
            if (isVariable(val)) {
                variables.push(val)
                result += tail[i][1] +  '{' + j + '}'
                j++
                continue
            }
            result += tail[i][1] + val
        }

        if (not) {
            result = not + result
        }

        if (!isExpr) {
            if (!_.isNaN(+head) && !_.isBoolean(head)) {
                head = +head
            }
            return head
        }

        if (variables.length > 0) {
            ret.variables = variables
        }
        ret.expression = result

        return ret
    }

Factor
  = "(" _ expr:Expression _ ")" { 
       if (expr.expression) {
           expr = expr.expression
       }
       return '(' + expr + ')'
    }
  / Integer / fn:ExecuteFunction {
      let name = fn.name
      pushIns.push(fn)
      if (name.type == 'object') {
        name = name.variable + '-' + name.deep.join('-')
      }
      return {
          variable: '__return_' + name
      }
  } / StringInExpression / Boolean
  / GetObject / VariableName

// Group

Group
    = '---' _ group:Text+ _ '---' {
        return { group }
    }

// Text

Text 
    = '>' _ text:(CharText)* _ params:Array? {
        text = stringParser(text)
        if (_.isString(text)) {
            text = text.trim()
        }
        return { output: text, params }
    }

Variable "variable" = name:([\\$:]? [a-zA-Z_0-9]+) { 
        return text() 
    }

VariableName
    = Variable {
        return { variable : text() }
    } 

// Execute Fonction

ExecuteFunction
    = name:(GetObject / Variable) "\\n"* '(' _ params:Params* _ ')' {
        return { type: 'executeFn', name, params }
    }

Params
    = val:Value _ ','? _ {
        return val
    }

// Decorator

DecoratorList
    = decorators:Decorator* {
        return decorators
    }
    

Decorator 'decorator' 
    = '@' name:DecoratorName _ '(' _ params:Params* _ ')' _ instructions:('{' _ DecoratorInstruction* _ '}')? Nl* {
        let obj = { name, params }
        if (instructions) obj.instructions = instructions[2]
        return obj
    }

DecoratorName = [A-Z][a-z]+ {
    return text()
}


DecoratorInstruction
    = _ ins:(InstructionFunction) _ Nl* {
        return ins
    }

// Types

Function 'function'
    = name:Variable _ '(' _ params:FunctionParameters? _ ')' _ '{' _  instructions:InstructionFunction* _ '}' {
        instructions = normalizeIns(instructions)
        return { name, params, type: 'function', instructions }
    }

FunctionParameters 'function parameters'
    = params:(_ Variable _ ','?)+ {
        return params.map(p => p[1])
    }

FunctionReturn 'function return'
    = 'return' _ functionReturn:Value? {
        return { 'return': functionReturn }
    }

InstructionFunction
    = _ ins:(Instruction / InstructionText / FunctionReturn) Nl* _ {
        if (pushIns.length > 0) {
            let multiIns = [...pushIns, ins]
            pushIns = []
            return multiIns
        }
        return ins
    }

InstructionText
    = _ decorators:DecoratorList? _ output:(Text / Group) {
        if (decorators) {
            output.decorators = decorators
        }
        return output
    }

Object 'object'
    = '{' _ keys:( _ Variable _ ':' _ Value _ ','?)* _ '}' { 
        const realObject = {}
        for (let object of keys) {
            let key = object[1]
            let val = object[5]
            realObject[key] = val
            if (!realObject[DEEP_NAME]) realObject[DEEP_NAME] = []
            if (val[DEEP_NAME] && val[DEEP_NAME].length !== 0) {
                realObject[DEEP_NAME] = [...realObject[DEEP_NAME], ...val[DEEP_NAME].map(d => key + '.' + d)]
            }
            else {
                realObject[DEEP_NAME].push(key)
            }
        }
        return realObject
    }

Array 'array'
    = '[' _ array:(_ Value _ ','?)* _ ']' { 
        const realArray = []
        for (let val of array) {
            realArray.push(val[1])
        }
        return realArray
    }

Integer 'integer'
    = [-+]? _ [0-9]+ S ( Dot [0-9]+)? { 
        return +text() 
    }

VariableString
    = '{' _ value:Value _ '}' {
        return { value }
    }

StringInExpression 'string in expression'
    = str: String {
        const withQuote = text => \`"\${text}"\`
        if (str.variables) {
            return withQuote(str.text)
        }
        return withQuote(str)
    }

String 'string'
  = Quote text: NotQuote* Quote { 
      return stringParser(text)
  }

StringBackQuote 'string not parsed'
  = BackQuote t: NotBackQuote* BackQuote { 
      return t.join('')
  }

RegExp 'Regular Expression'
    = Slash _  regexp: NotSlash* _ Slash flags:[gimuy]* {
        return { regexp: regexp.join(''), flags }
    }

Boolean = bool:('true' / 'false') { 
    return bool == 'true' ? true : false
}

Null = 'null' {
    return null
}

// Comment

Comment
    = MultiComment / SingleComment

MultiComment
    = '/*' (!'*/' .)* '*/'  {
        return 
    }

SingleComment = '//' [^\\n]* {
        return 
    }

// Characters

CharText
  = char:(VariableString / [^\\n\\[]) { return char }
NotQuote
  = !Quote char:(VariableString / .) { return char }

Quote = [']

Slash = [/]
NotSlash = !Slash char:(.) { return char }

BackQuote = '\`'

NotBackQuote = !BackQuote char:. { return char }

Dot = '.'

Nl = "\\n"

S = [ \\t]*

_ 'whitespace' = [ \\t\\n\\r]*
`