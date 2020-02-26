import connectors from './connectors'
import _ from 'lodash'
import bodyParser from 'body-parser'
import fs from 'fs'
import { NewBot } from 'newbot'

export class NewBotExpressServer {

    config: any = {}
    platforms: any = {}

    constructor(private app: any, private settings: any = {}, private converse?: any) {
        let mainSkill

        if (!this.converse) {
            const botPath = settings.botPath + '/dist/node/bot.js'
            if (!fs.existsSync(botPath)) {
                console.log('Bot skill not exists. use "newbot build" before')
                process.exit()
            }
            mainSkill = require(botPath)
            const converseOptions: any = {}
            if (settings.modelPath) {
                converseOptions.model = settings.modelPath
            }
            this.converse = new NewBot(mainSkill, converseOptions)
        }

        if (settings.botConfigFile && !_.isString(settings.botConfigFile)) {
            this.config = settings.botConfigFile
        }
        else {
            const configFilePath = settings.botPath + '/' + (settings.botConfigFile || 'newbot.config.js')
            if (fs.existsSync(configFilePath)) {
                this.config = require(configFilePath)
            }
        }
    }

    registerRoutes() {
    
        const registerRoute = (connectorName) => {
            const connector = connectors[connectorName]
            const settings = this.getSettings(connectorName)
            if (settings) {
                this.platforms[connectorName] = new connector(this.app, this.converse, settings)
                this.platforms[connectorName].registerRoutes()
            }
        }

        registerRoute('alexa')

        this.app.use(
            bodyParser.json({
                verify: (req:any, res: any, buf: any) => {
                    req.rawBody = buf.toString();
                },
            })
        )

        for (let connectorName in connectors) {
            if (connectorName == 'alexa') continue
            registerRoute(connectorName)
        }
    }

    proactiveEvent(obj: any) {
        if (!obj.event) {
            throw 'You did not put the event property'
        }
        if (_.isString(obj.event))  {
            obj.event = {
                name: obj.event,
                data: {}
            }
        }
        if (!obj.platform) throw 'Please indicate the platform (messenger, telegram, viber, etc.)'
        if (!obj.userId) throw 'Please enter the user ID'
        if (!obj.event.name) throw 'Please indicate the name of the event to be triggered'

        const client = this.platforms[obj.platform]
        if (!client) throw `This ${obj.platform} platform does not exist`

        return client.proactive(obj)
    }

    private getSettings(platformName: string) {
        const production = _.get(this.config, 'production.platforms.' + platformName)
        const dev = _.get(this.config, 'platforms.' + platformName)
        const obj = _.merge(process.env.NODE_ENV == 'production' ? production : dev, this.settings[platformName])
        obj.output = this.settings.output || {}
        return obj
    }
}