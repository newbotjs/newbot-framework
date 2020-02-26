import { BottenderConnector } from ".";

export class ViberBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        super.registerRoutes('Viber', { requiredToken: true })
    }
}