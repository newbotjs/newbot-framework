const _debugger = {

    $params: ['user', 'execution', 'level'],

    $call(user, execution, level) {
        const { namespace } = execution
        const render = (variables, title) => {
            console.log(`--- ${title} ---`)
            for (let name in variables) {
                console.log(`\n * ${name} = `, JSON.stringify(variables[name], null, 2))
            }
            console.log('\n')
        }
        console.log('* Skill : ' + namespace)
        console.log('* User Id : ' + user.id)
        console.log('* Current Lang : ' + user.lang)
        render(user.variables[namespace], 'global variables')
        render(user.magicVar, 'magic variables')
        render(user.varFn[namespace][level], `${level}(...) function`)
    }
}


module.exports = _debugger