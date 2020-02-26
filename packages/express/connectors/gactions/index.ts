import { Connector } from "../connector";
import * as gactions from 'actions-on-google'
import { GactionsSession } from 'newbot-sessions'
import _ from 'lodash'
import { PlatformConnector } from "../connector.interface";

export class GactionsConnector extends Connector implements PlatformConnector {

    action: any
    clientId: string
    propClientId: string = 'platforms.gactions.signin.clientId'

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)

        this.clientId = _.get(settings, this.propClientId)
        this.action = gactions.actionssdk({
            clientId: this.clientId
        })
    }
   
    handler(conv, input, {
        type = 'exec',
        signin = {},
        userData = {}
    } = {}) {
        const session = new GactionsSession(gactions, conv)

        if (type == 'exec') {
            return this.exec(input, session)
        }

        return this.event({
            name: input,
            data: {
                profile: userData,
                signin
            }
        }, session)
    }

    registerRoutes() {
        this.action.intent('actions.intent.MAIN', this.handler.bind(this))
        this.action.intent('actions.intent.TEXT', this.handler.bind(this))
        this.action.intent('actions.intent.OPTION', this.handleOption.bind(this))
        this.action.intent('actions.intent.SIGN_IN', this.handleSignin.bind(this))

        this.app.post(this.settings.path || '/gactions', this.action)
    }

    proactive(obj: any) {
        // TODO
    }

    private handleOption(conv, params, option) {
        return this.handler(conv, option)
    }

    private handleSignin(conv, params, signin) {
        const propName = 'platforms.gactions.signin.event'
        const eventName = _.get(this.settings, propName)
        if (!eventName) {
            throw '[Gactions] Please, add event name in "' + propName + '" property in "newbot.config.js"'
        }
        if (!this.clientId) {
            throw '[Gactions] Please, add client Id "' + this.propClientId + '" property in "newbot.config.js"'
        }
        return this.handler(conv, eventName, {
            type: 'event',
            signin,
            userData: conv.user.profile.payload
        })
    }

}