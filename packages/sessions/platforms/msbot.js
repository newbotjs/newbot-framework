module.exports = class MsBotSession {
    constructor(context) {
        this.context = context
    }

    send(input) {
        return this.context.sendActivity(input)
    }

    get message() {
        return {
            source: this.context.activity.channelId,
            agent: 'botbuilder',
            user: this.user
        }
    }

    get user() {
        return {
            id: this.context.activity.recipient.id
        }
    }

    get source() {
        return this.message.source
    }
}