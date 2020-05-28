import { Connector } from "../connector";
import { BottenderSession } from 'newbot-sessions'
import { registerRoutes } from 'bottender/express'
import * as bottender from 'bottender'
import { PlatformConnector } from "../connector.interface";

export class BottenderConnector extends Connector implements PlatformConnector {

    client: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }
   
    async handler(context: any) {
        const {
            text,
            isText
        } = context.event
        if (!isText) return
        const session = new BottenderSession(context)
        await this.exec(text, session)
    }

    registerRoutes(platform: string, option: any = {}): any {
        if (option.requiredToken && !this.settings.accessToken) {
            return false
        }
        const bot = new bottender[platform + 'Bot'](this.settings).onEvent(this.handler.bind(this))
        this.platform = platform
        this.client = bot.connector._client
        registerRoutes(this.app, bot, {
            path: this.routePath(),
            verifyToken: this.settings.verifyToken
        })
        return true
    }

    proactive(obj: any) {
        const session = new BottenderSession(this.client, {
            userId: obj.userId,
            platform: this.platform.toLowerCase()
        })

        session['proactive'] = true

        if (obj.event) {
            return this.event(obj.event, session) 
        }
        else {
            return this.exec(obj.text || obj.data.text, session) 
        }
    }

}