import { BottenderConnector } from ".";

export class LineBottenderConnector extends BottenderConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    registerRoutes() {
        super.registerRoutes('Line', { requiredToken: true })
    }
}