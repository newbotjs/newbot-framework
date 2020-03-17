import { Connector } from "../connector";
import socketIo from 'socket.io'
import http from 'http'
import { WebSession } from 'newbot-sessions'
import { PlatformConnector } from "../connector.interface";

export class WebConnector extends Connector implements PlatformConnector {

    client: any
    server: any
    io: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
        this.server = new http.Server(app)
        this.io = socketIo(this.server, { origins: '*:*'})

        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            res.header('Access-Control-Allow-Credentials', 'true')
            next()
        })
    }

    handler(socket: any, input: any) {
        const { event } = input
        const session = new WebSession(socket)
        if (event) {
            return this.event(event, session)
        }
        return this.exec(input, session)
    }

    registerRoutes() {
        this.io.on('connection', (socket: any) => {
            socket.on('message', (data) => {
                this.handler(socket, data)
            })
        })
    }

    proactive(obj: any) {
        // TODO
    }

}