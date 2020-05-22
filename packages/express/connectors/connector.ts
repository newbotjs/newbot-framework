import sessionMemory from '../memory/sessions'

export class Connector {

    converse: any

    constructor(protected app: any, converse: any, protected settings: any) {
        this.converse = global['converse'] || converse
    }

    exec(text: string, session: any) {
        return this.converse.exec(text, session.user.id, this.output(session))
    }

    event(event: { name: string, data: any }, session: any) {
        return this.converse.event(event.name, event.data, session.user.id, this.output(session))
    }

    output(session: any) {
        return Object.assign({}, {
            output(str, next) {
                const ret = session.send(str)
                if (ret && ret.then) {
                    ret.then(next)
                    return
                }
                next()
            },
            data: {
                session,
                webview: (url, data = {}) => {
                    const btoa = str => Buffer.from(str).toString('base64')
                    const params = encodeURIComponent(btoa(JSON.stringify(data)))
                    url += `?data=${params}&webview=true`
                    if (!url.startsWith('http')) {
                        url = process.env.SERVER_URL + url
                    }
                    return url
                }
            }
        }, this.settings.output)
    }

    proactive(obj) {
        const { id } = obj

        if (!id) {
            throw 'The id parameter (session id) is missing'
        }

        if (!sessionMemory.has(id)) {
            throw 'Unable to find the session in memory'
        }

        return sessionMemory.get(id)
    }

}