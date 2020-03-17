export class WebSession {
    constructor(private socket: any) { }

    send(input: any) {
        return this.socket.emit('message', input)
    }

    get message() {
        return {
            source: 'website',
            user: this.user
        }
    }

    get user() {
        return {
            id: this.socket.id
        }
    }

    get source() {
        return this.message.source
    }
}