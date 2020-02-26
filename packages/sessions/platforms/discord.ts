export class DiscordSession {

    channel: any
    readonly platform: string = 'discord'

    constructor(private context: any) {
        this.context = context
        this.channel = context.channel
        if (!this.channel) {
            this.channel = context
        }
    }

    send(embed: any) {
        if (embed.react) {
            for (let emoji of embed.emojis) {
                this.context.react(emoji)
            }
        }
        this.channel.send(embed.text || embed)
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