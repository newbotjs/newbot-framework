import { Connector } from "../connector";
import { PlatformConnector } from "../connector.interface";
import { DiscordSession } from 'newbot-sessions'
import Discord from 'discord.js'

export class DiscordConnector extends Connector implements PlatformConnector {

    client: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
        this.client = new Discord.Client()
    }

    handler(msg: any) {
        if (msg.channel.type !== 'text') return
        if (msg.author.id == this.settings.appId) return
        const session = new DiscordSession(msg)
        return this.exec(msg.content, session)
    }

    registerRoutes() {
        if (!this.settings.accessToken) {
            return
        }
        this.client.login(this.settings.accessToken)
        this.client.on('message', this.handler.bind(this))
    }

    proactive(obj: any) {
        // TODO
    }

}
