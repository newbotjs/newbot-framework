import { BottenderConnector } from ".";

export class TelegramBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        super.registerRoutes('Telegram', { requiredToken: true })
    }
}