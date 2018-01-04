const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Translate Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('translation in string value', () => {
        code(`
            @Event('start')
            start() {
                str = '#discover'
                > { str }
                
                obj = {
                    foo: '#hello'
                }
                > { obj.foo }

                array = ['#view']
                > { array[0] }
            }
        `)

        converse.configure({
            languages: {
                path: __dirname + '/../languages',
                packages: ['fr_FR']
            }
        }).loadLanguage()

        user
            .start(testing => {
                assert.equal(testing.output(0), 'Découvrir')
                assert.equal(testing.output(1), 'Salut')
                assert.equal(testing.output(2), 'Voir')
            })
            .end()
    })

})