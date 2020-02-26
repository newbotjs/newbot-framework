import { Connector } from "../connector";
import { TwitterSession, TwitterCRCToken } from 'newbot-sessions'
import { PlatformConnector } from "../connector.interface";

export class TwitterConnector extends Connector implements PlatformConnector {

    client: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    async handler(req: any) {
        const session = new TwitterSession(this.settings, req.body)
        if (session.userId) {
            await this.exec(session.text, session)
        }
    }

    registerRoutes() {
        this.app.get(this.settings.path || '/twitter', (req, res) => {
            try {
                res.status(200).send(TwitterCRCToken(this.settings, req.query))
            } catch (err) {
                res.status(400).send(err.message)
            }
        })

        this.app.post(this.settings.path || '/twitter', async (req, res) => {
            await this.handler(req)
            res.status(204).end()
        })
    }

    proactive(obj: any) {
        // TODO
    }

}