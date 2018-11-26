const fs = require('fs')
const { assert } = require('chai')
const SystemJs = require('systemjs')
const { ConverseTesting } = require('../testing')

ConverseTesting.loader({
    systemjs: SystemJs
})

describe('Test Converse Testing', () => {

    let tests = []
    let dir = `${__dirname}/interpreter`

    let files = fs.readdirSync(dir)

    for (let file of files) {
        let match = /(^[^\.]+)/.exec(file)
        let [, pattern] = match
        if (tests.indexOf(pattern) >= 0) {
            continue
        }
        tests.push(pattern)
        it(`${file}`, () => {
            let converse = new ConverseTesting()
            converse.file(`${dir}/${pattern}.converse`)
            let user = converse.createUser()
            let p = require(`./interpreter/${pattern}.spec`)(user, assert, converse)
            return p
        })
    }

})



