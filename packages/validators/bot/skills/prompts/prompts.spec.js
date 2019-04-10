import {
    ConverseTesting,
    user,
    bot
} from 'newbot/testing'
import prompts from './prompts'

describe('Prompts Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting(prompts)
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
            .conversation(
                user `test`,
                bot `Prompts skill works !`
            )
    })
})