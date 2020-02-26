import { BottenderConnector } from ".";

export class SlackBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        super.registerRoutes('Slack', { requiredToken: true })
    }
}