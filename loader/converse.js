const Transpiler = require('../src/transpiler/lexer')

module.exports = function loader(code, map, meta) {
    const transpiler = new Transpiler(code)
    const obj = transpiler.run()
    const compiled = JSON.stringify(obj)
    code = code.replace(/`/g, '\\`')
    code = `
export default {
code: \`${code}\`,
compiled: ${compiled}
}`
    return code   
};