import { Connector } from "../connector";
import { PlatformConnector } from "../connector.interface";
import { MsBotSession } from 'newbot-sessions'
import { BotFrameworkAdapter, ActivityHandler } from 'botbuilder'

export class MsBotConnector extends Connector implements PlatformConnector {

    client: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    handler(context: any) {
        const session = new MsBotSession(context)
        return this.exec(context.activity.text, session)
    }

    registerRoutes() {
        const bot = new ActivityHandler()
        bot.onMessage(this.handler.bind(this))
        const adapter = new BotFrameworkAdapter(this.settings)
        this.app.post(this.settings.path || '/msbot', (req, res) => {
            adapter.processActivity(req, res, async (context) => {
                await bot.run(context);
            });
        });
    }

    proactive(obj: any) {
        // TODO
    }

}