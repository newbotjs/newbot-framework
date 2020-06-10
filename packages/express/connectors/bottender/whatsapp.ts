import { BottenderConnector } from ".";

export class WhatsappBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        if (this.settings.accessToken && !this.settings.authToken) this.settings.authToken = this.settings.accessToken
        super.registerRoutes('Whatsapp', { requiredToken: true })
    }
}