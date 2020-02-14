const assert = require('assert')
const {
    ConverseTesting
} = require('../../index')

describe('Multi Skill', () => {
    let converse, user

    async function code(str, platform = 'website') {
        converse = new ConverseTesting({
            code: str,
            skills: {
                helloSkill: [
                    {
                        skill: `
                            displayProfile() {
                                > Call profile API in Google Actions
                            }
                        `,
                        condition(data, user) {
                            return data.session.platform == "gactions";
                        }
                    },
                    {
                        skill: `
                            displayProfile() {
                                > Call profile API in Amazon Alexa
                            }
                        `,
                        condition(data, user) {
                            return data.session.platform == "alexa";
                        }
                    },
                    {
                        skill: `
                            displayProfile() {
                                > Default response
                            }
                        `
                    }
                ]
            }
        }, {
            loadSkills: false
        })
        await converse.loadSkills()
        user = converse.createUser({
            session: {
                platform
            }
        })
    }

    it('Test condition() in multi skills, default response', async () => {
        await code(`
             @Event('start')
             start() {
                helloSkill.displayProfile()
             }
         `)

        return user
            .start(testing => {
                assert.equal(testing.output(0), 'Default response')
            })
            .end()
    })

    it('Test condition() in multi skills, Gactions response', async () => {
        await code(`
             @Event('start')
             start() {
                helloSkill.displayProfile()
             }
         `, 'gactions')

        return user
            .start(testing => {
                assert.equal(testing.output(0), 'Call profile API in Google Actions')
            })
            .end()
    })
})
