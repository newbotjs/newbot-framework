import { BottenderConnector } from ".";

export class MessengerBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        super.registerRoutes('Messenger')
    }
}