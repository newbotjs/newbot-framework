import { BottenderConnector } from ".";

export class ViberBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    setWebhook() {
        return this.client.setWebhook(this.routePath(this.settings.baseUrl))
    }

    registerRoutes() {
        const bool = super.registerRoutes('Viber', { requiredToken: true })
        if (bool) {
            this.setWebhook()
               .catch(console.log)
        }
    }
}