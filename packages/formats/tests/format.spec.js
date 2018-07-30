const assert = require('assert')
const BotFrameworkTesting = require('./index')

describe('Module Test', () => {
    let converse, user

    beforeEach(() => {
        converse = BotFrameworkTesting()
        user = converse.createUser()
    })

    it('quick replies test', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('quickReplies', ['test'])
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.equal(data.text, 'hello')
                assert.deepEqual(data.suggestedActions.actions, [{
                    type: 'imBack',
                    value: 'test',
                    title: 'test'
                }])
            })
            .end()
    })

    it('image test', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('image', 'test.png')
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.deepEqual(data.attachments, [{
                    contentUrl: 'test.png',
                    contentType: 'image/png',
                    name: 'test.png'
                }])
            })
            .end()
    })

    it('carousel test', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('carousel', [
                    {
                        title: 'Title',
                        subtitle: 'Subtitle'
                    }
                ])
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.equal(data.attachmentLayout, 'carousel')
                assert.deepEqual(data.attachments, [
                    {
                        "contentType": "application/vnd.microsoft.card.hero",
                        "content": {
                            "title": "Title",
                            "subtitle": "Subtitle"
                        }
                    }
                ])
            })
            .end()
    })

    it('carousel test with qui replies', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('carousel', [
                    {
                        title: 'Title',
                        subtitle: 'Subtitle'
                    }
                ], ['go'])
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.equal(data.attachmentLayout, 'carousel')
                assert.deepEqual(data.attachments, [
                    {
                        "contentType": "application/vnd.microsoft.card.hero",
                        "content": {
                            "title": "Title",
                            "subtitle": "Subtitle"
                        }
                    }
                ])
                assert.deepEqual(data.suggestedActions.actions, [{
                    type: 'imBack',
                    value: 'go',
                    title: 'go'
                }])
            })
            .end()
    })

    it('gif test', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('gif', 'test.gif')
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.deepEqual(data.attachments, [{
                    "contentType": "application/vnd.microsoft.card.animation",
                    "content": {
                        "text": "hello",
                        "media": [
                            {
                                "url": "test.gif"
                            }
                        ]
                    }
                }])
            })
            .end()
    })

    it('buttons test', () => {
        converse.code(`
            @Event('start')
            start() {
                @Format('buttons', [{
                    url: 'Url',
                    title: 'Title'
                }])
                > hello
            }
        `)
        return user
            .start(testing => {
                const { data } = testing.output(0)
                assert.deepEqual(data.attachments, [
                    {
                        "contentType": "application/vnd.microsoft.card.hero",
                        "content": {
                            "buttons": [
                                {
                                    "type": "openUrl",
                                    "value": "Url",
                                    "title": "Title"
                                }
                            ]
                        }
                    }
                ])
            })
            .end()
    })

})
