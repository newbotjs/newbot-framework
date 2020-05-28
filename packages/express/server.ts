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

        if (settings.io) {
            this.app.set('_io', settings.io)
        }
    }

    registerRoutes() {

        let server
    
        const registerRoute = (connectorName) => {
            const connector = connectors[connectorName]
            const settings = this.getSettings(connectorName)
            if (settings) {
                this.platforms[connectorName] = new connector(this.app, this.converse, settings)
                this.app.post(this.platforms[connectorName].routePath() + connectorName + '/proactive', (req, res, next) => {
                    try {
                        if (this.settings.proactiveAuth) {
                            const token = req.headers['authorization']
                            if (token != this.settings.proactiveAuth) {
                                const error: any = new Error('Proactive endpoints must have authorization')
                                error.status = 403
                                throw error
                            }
                        }
                        this.platforms[connectorName].proactive({
                            ...req.body,
                            agent: 'agent'
                        })
                        res.status(204).send()
                    }
                    catch (err) {
                        next(err)
                    }  
                })
                return this.platforms[connectorName].registerRoutes()
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
            const ret = registerRoute(connectorName)
            if (connectorName == 'website') {
                server = ret
            }
        }

        return {
            server
        }
    }

    proactive(obj) {
        return this.proactiveEvent(obj, false)
    }

    proactiveEvent(obj: any, isEvent: boolean = true) {
        if (!obj.event && isEvent) {
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
        if (isEvent && !obj.event.name) throw 'Please indicate the name of the event to be triggered'

        const client = this.platforms[obj.platform]
        if (!client) throw `This ${obj.platform} platform does not exist`

        return client.proactive(obj)
    }

    private getSettings(platformName: string) {
        const production = _.get(this.config, 'production.platforms.' + platformName)
        const dev = _.get(this.config, 'platforms.' + platformName)
        const obj = _.merge(process.env.NODE_ENV == 'production' ? production : dev, this.settings[platformName])
        obj.output = this.settings.output || {}
        obj.baseUrl = this.settings.baseUrl || ''
        return obj
    }
}