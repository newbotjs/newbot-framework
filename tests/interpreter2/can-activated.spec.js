const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Can Activated Spec', () => {
    let converse, userConverse

    function code(str, subSkill) {
        const notAuthorizedSkill = {
            code: subSkill
        }

        converse = new ConverseTesting({
            code: str,
            canActivated: ['notAuthorizedSkill'],
            skills: {
                notAuthorizedSkill
            }
        })
        userConverse = converse.createUser()
    }


   it('Not Guard', () => {
        code(`
            @Event('start')
            start() {
                > Ok !
            }
            `, `
            @Event('canActivate')
            auth() {
                > Pass
                return true
            }
        `)
        return userConverse
            .conversation(
                bot `Pass`,
                bot `Ok !`
            )
    })

    it('Guard', () => {
        code(`
            @Event('start')
            start() {
                > Ok !
            }
            `, `
            @Event('canActivate')
            auth() {
                > Forbidden
                return false
            }
        `)
        return userConverse
            .conversation(
                bot `Forbidden`
            )
    })

    it('Not Guard with Prompt, continue main skill', () => {
        code(`
            @Event('start')
            start() {
                > Ok !
            }
            `, `
            @Event('canActivate')
            auth() {
                > Your password ?
                Prompt()
                > { :text }
                return true
            }
        `)
        return userConverse
            .conversation(
                bot `Your password ?`,
                user `azerty`,
                bot `azerty`,
                bot `Ok !`
            )
    })

    it('Guard with Prompt,  no continue main skill', () => {
        code(`
            @Event('start')
            start() {
                > Ok !
            }
            `, `
            @Event('canActivate')
            auth() {
                > Your password ?
                Prompt()
                > { :text }
                return false
            }
        `)
        return userConverse
            .conversation(
                bot `Your password ?`,
                user `azerty`,
                bot `azerty`
            )
    })

    it('Multiple function with Guard, only the first is triggered', () => {
        code(`
            @Event('start')
            start() {
                > Ok !
            }
            `, `
            @Event('canActivate')
            auth1() {
                > Forbidden1
                return false
            }

            @Event('canActivate')
            auth2() {
                > Forbidden2
                return false
            }
        `)
        return userConverse
            .conversation(
                bot `Forbidden1`
            )
    })

    describe('test multiple guard', () => {

        function code2(str, subSkill, subSkill2) {
       
            const notAuthorizedSkill = {
                code: subSkill
            }
    
            const middlewareSkill = {
                code: subSkill2
            }
    
            converse = new ConverseTesting({
                code: str,
                canActivated: ['notAuthorizedSkill', 'middlewareSkill'],
                skills: {
                    notAuthorizedSkill,
                    middlewareSkill
                }
            })
            userConverse = converse.createUser()
        }

        it('First is forbidden', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    return false
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    return false
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`
                )
        })

        it('Second is forbidden', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    return true
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    return false
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`,
                    bot `Forbidden2`
                )
        })

        it('All are accepted', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    return true
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    return true
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`,
                    bot `Forbidden2`,
                    bot `Ok !`
                )
        })

        it('Second is forbidden + Prompt()', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    Prompt()
                    > { :text }
                    return true
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    return false
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`,
                    user `azerty`,
                    bot `azerty`,
                    bot `Forbidden2`
                )
        })

        it('Second is forbidden + Prompt() x 2', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    Prompt()
                    > { :text }
                    return true
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    Prompt()
                    > { :text }
                    return false
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`,
                    user `azerty`,
                    bot `azerty`,
                    bot `Forbidden2`,
                    user `yo`,
                    bot `yo`
                )
        })

        it('all accepted + Prompt() x 2', () => {
            code2(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                @Event('canActivate')
                auth1() {
                    > Forbidden1
                    Prompt()
                    > { :text }
                    return true
                }
            `, `
                @Event('canActivate')
                auth2() {
                    > Forbidden2
                    Prompt()
                    > { :text }
                    return true
                }
            `)
            return userConverse
                .conversation(
                    bot `Forbidden1`,
                    user `azerty`,
                    bot `azerty`,
                    bot `Forbidden2`,
                    user `yo`,
                    bot `yo`,
                    bot `Ok !`
                )
        })

    })

    describe('child', () => {
        function code(str, subSkill) {

            const childSkill = {
                code: str
            }
            
            const notAuthorizedSkill = {
                code: subSkill
            }
    
            converse = new ConverseTesting({
                canActivated: ['notAuthorizedSkill'],
                skills: {
                    notAuthorizedSkill,
                    childSkill
                }
            })
            userConverse = converse.createUser()
        }

        it('Block child skills', () => {
            code(`
                @Intent(/test/)
                start() {
                    > Ok
                }
                `, `
                @Event('canActivate')
                auth() {
                    > Forbidden
                    return false
                }`)
            return userConverse
                .conversation(
                    user `test`,
                    bot `Forbidden`
                )
        })
    })

    describe('others situations', () => {
        function code(str, subSkill) {
            const notAuthorizedSkill = {
                code: subSkill
            }
    
            converse = new ConverseTesting({
                code: str,
                canActivated: ['notAuthorizedSkill'],
                skills: {
                    notAuthorizedSkill
                }
            })
            userConverse = converse.createUser()
        }
    
    
       it('canActivated, but not @Event decorator', () => {
            code(`
                @Event('start')
                start() {
                    > Ok !
                }
                `, `
                auth() {
                    > Nop
                    return falsse
                }
            `)
            return userConverse
                .conversation(
                    bot `Ok !`
                )
        })
    })

})