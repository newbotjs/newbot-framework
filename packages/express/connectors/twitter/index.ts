import { Connector } from "../connector";
import { TwitterSession, TwitterCRCToken } from 'newbot-sessions'
import { PlatformConnector } from "../connector.interface";
import rp from 'request-promise'

export class TwitterConnector extends Connector implements PlatformConnector {

    client: any
    api: string = 'https://api.twitter.com/1.1/account_activity/all/dev'
    platform: string = 'twitter'

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    async handler(req: any) {
        const session = new TwitterSession(this.settings, req.body)
        if (session.userId) {
            await this.exec(session.text, session)
        }
    }

    async setWebhook() {
        const {
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret
        } = this.settings

        const oauth = {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            token: accessToken,
            token_secret: accessTokenSecret
        }

        const url = `${this.api}/webhooks.json`
        
        const res = await rp.get({
            url,
            oauth,
            json: true
        })

        const webHook = res.find(el => /emulator/.test(el.url))

        if (webHook) {
            await rp.delete({
                url: `${this.api}/webhooks/${webHook.id}.json`,
                oauth
            })
        }

        await rp.post({
            url,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            oauth,
            form: {
                url: this.routePath(this.settings.baseUrl)
            }
        })

        await rp.post({
            url: `${this.api}/subscriptions.json`,
            oauth
        })
    }

    registerRoutes() {    
        this.app.get(this.routePath(), (req, res) => {
            try {
                res.status(200).send(TwitterCRCToken(this.settings, req.query))
            } catch (err) {
                res.status(400).send(err.message)
            }
        })

        this.app.post(this.routePath(), async (req, res) => {
            await this.handler(req)
            res.status(204).end()
        })

        if (this.settings.accessToken) {
            this.setWebhook()
                .catch(console.log)
        }
    }

    proactive(obj: any) {
        // TODO
    }

}