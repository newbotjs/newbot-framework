module.exports = class DiscordSession {
    constructor(context) {
        this.context = context
        this.channel = context.channel
        this.platform = 'discord'
    }

    send(embed) {
        this.channel.send(embed)
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform,
            user: this.user
        }
    }

    get user() {
        return {
            id: this.context.author.id
        }
    }

    get source() {
        return this.message.source
    }
}