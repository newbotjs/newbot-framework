const assert = require('assert')
const { ConverseTesting } = require('../../index')
const { train } = require('../../packages/train')
const { LangFr } = require('@nlpjs/lang-fr');

describe('Context Test', () => {
    let converse, user

    async function code(str) {
        converse = new ConverseTesting({
            code: str
        })
        const model = await train(converse, [LangFr])
        await converse.setModelNlp(model, [LangFr])
        user = converse.createUser()
    }

    it('Test native NLP', async () => {
       await code(`
            @Intent('hello', [
                'hello',
                'yo'
            ])
            hello() {
                > Hey
            }
        `)
        return user
            .prompt('hello', testing => {
                const output = testing.output()
                assert.equal(output.length, 1)
                assert.equal(output[0], 'Hey')
            })
            .end()
    })

    it('Test native NLP, other language', async () => {
        await code(`
             @Intent('hello', {
                 fr: [
                     'bonjour',
                     'nous allons manger'
                 ]
             })
             hello() {
                 > Hey
             }
         `)
         return user
             .prompt('je mange', testing => {
                 const output = testing.output()
                 assert.equal(output.length, 1)
                 assert.equal(output[0], 'Hey')
             })
             .end()
     })

})