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

                @Format('carousel', [
                    {
                       buttons: [
                           { title: '#go' } 
                       ] 
                   }
               ])
               > Ok
            }
        `)

        converse.configure({
            languages: {
                path: __dirname + '/../languages',
                packages: ['fr_FR', 'en_EN']
            }
        }).loadLanguage()
    
        converse.format('carousel', (str, [cards]) => {
            return cards[0].buttons[0].title
        })

        user
            .start(testing => {
                assert.equal(testing.output(0), 'Découvrir')
                assert.equal(testing.output(1), 'Salut')
                assert.equal(testing.output(2), 'Voir')
                assert.equal(testing.output(3), 'Aller')
            })
            .end()
    })

})