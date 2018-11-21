const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Module Test', () => {
    let converse, u

    beforeEach((done) => {
        const child = {
            code: `
                @Intent(/hello/i)
                hello() {
                    > Child
                    Prompt()
                    > Test
                }
        
                foo() {
                    > Lazy 3
                }
        
                lazy(b) {
                    > Lazy {b}
                    Prompt()
                    > Lazy 2
                    foo()
                    Prompt()
                    > Lazy 4
                }
        `,
            functions: {
                jsFunction() {
                    return 'js'
                }
            }
        }
        converse = new ConverseTesting()
        converse.code(`
            @Event('start')
            start() {
                a = 1
                child.lazy(a)
                > Ok
                > { child.jsFunction() }
            }

            @Event('on', 'parent')
            event() {
                > event works
            }
        `)
        converse.setSkills({
            child
        })
        u = converse.createUser()
        done()
    })

    it('module test', () => {
        return u
            .conversation(
                bot `Lazy 1`,
                user `test`,
                bot `Lazy 2`,
                bot `Lazy 3`,
                user `test2`,
                bot `Lazy 4`,
                bot `Ok`,
                bot `js`
            )
    })

    it('module event', () => {
        return u
            .event('parent', testing => {
                assert.equal(testing.output(0), ['event works'])
            })
            .end()
    })

    describe('Module relation', () => {
        it('only hello() child is executed', () => {
            const hey = {
                code: `
                    @Intent(/hello/i)
                    hello() {
                        > Hey Child
                    }
                `
            }

            converse = new ConverseTesting()
            converse.code(`
                @Event('start')
                start() {
                   > Go !
                }
    
                @Intent(/hello/i)
                hello() {
                    > Hey Parent
                }
            `)
            converse.setSkills({
                hey
            })
            u = converse.createUser()
            return u
                .conversation(
                    bot `Go !`,
                    user `hello`,
                    bot `Hey Child`
                )
        })
        it('nothing function is executed after totality execution', () => {
            const hey = {
                code: `
                    @Event('start')
                    start() {
                        > Welcome
                    }

                    @Event('nothing')
                    nothing() {
                        > Noop
                    }
                `
            }

            converse = new ConverseTesting()
            converse.code(`
                @Event('start')
                start() {
                   > Go !
                }
    
                @Intent(/hello/i)
                hello() {
                    > Hey
                }

                @Event('nothing')
                nothing() {
                    > ?
                }
            `)
            converse.setSkills({
                hey
            })
            return converse.createUser()
                .conversation(
                    bot `Welcome`,
                    user `helloa`,
                    bot `Hey`,
                    user `Yo`,
                    bot `Noop`
                )
        })
    })
    
})
