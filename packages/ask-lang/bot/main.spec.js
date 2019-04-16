import {
    ConverseTesting,
    user,
    bot
} from '../../../testing'
import assert from 'assert'
import askLang from './main'

describe('Ask Lang Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting(askLang)
        userConverse = converse.createUser({
            session: {
                message: {
                    source: 'website'
                }
            }
        })
    })

    it('Sample Test', () => {
        return userConverse
            .prompt('start', testing => {
                assert.deepStrictEqual(testing.output(0), {
                    text: 'what is your language ?',
                    actions: ['French', 'English']
                })
            })
            .prompt('french', testing => {
                assert.equal(testing.output(0), 'Français')
            })
            .end()
    })
})