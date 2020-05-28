import { Connector } from "../connector";
import socketIo from 'socket.io'
import http from 'http'
import { WebSession } from 'newbot-sessions'
import { PlatformConnector } from "../connector.interface";
import sessionMemory from '../../memory/sessions'

export class WebConnector extends Connector implements PlatformConnector {

    client: any
    server: any
    io: any

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
        const io = this.app.get('_io')
        if (io) {
            this.io = io
        }
    }

    handler(socket: any, input: any) {
        const { event } = input
        const session = new WebSession(socket)
        sessionMemory.set(session.user.id, session)
        if (event) {
            return this.event(event, session)
        }
        return this.exec(input, session)
    }

    registerRoutes() {
        let server
        if (!this.io) {
            server = new http.Server(this.app)
            this.io = socketIo(server)
        }
        this.io.on('connection', (socket: any) => {
            socket.on('join-room', (room) => {
                socket.join(room)
            })
            socket.on('message', (data) => {
                this.handler(socket, data)
            })
            socket.on('disconnect', () => {
                sessionMemory.delete(socket.id)
            })
        })
        return server
    }

    proactive(obj: any) {
        if (obj.room) {
            this.io.to(obj.room).emit('message', obj.data)
        }
        else {
            const session = super.proactive(obj)
            session.send(obj.data)
        }
    }

}