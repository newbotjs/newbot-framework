const Transpiler = require('../../src/transpiler/lexer')
require('../../src/transpiler/load')

module.exports.process = function (code, filepath) {
    const transpiler = new Transpiler(code)
    const obj = transpiler.run()
    const compiled = JSON.stringify(obj)
    code = code.replace(/`/g, '\\`')
    code = `
module.exports = {
code: \`${code}\`,
compiled: ${compiled}
}`
    return code   
}