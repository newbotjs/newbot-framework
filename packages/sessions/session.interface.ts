export interface SessionInterface {
    send(context: any): any
    message: { user: any, agent: string, source: string }
    user: { id: string }
    source: string
}