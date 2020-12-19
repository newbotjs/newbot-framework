import { BottenderConnector } from ".";

export class TelegramBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        const bool = super.registerRoutes('Telegram', { requiredToken: true })
        if (bool) {
            this.setWebhook()
               .catch(console.log)
        }
    }
}