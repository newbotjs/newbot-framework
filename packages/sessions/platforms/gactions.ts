import _ from 'lodash'
import uuid from 'uuid/v1'

export class GactionsSession {

    readonly platform: string = 'gactions'

    constructor(private gactions: any, private conv: any) {
        this.conv = conv
        this.gactions = gactions
    }

    userId(id = uuid()) {
        let { userId } = this.conv.user.storage
        if (!userId) {
            userId = this.conv.user.storage.userId = id
        }
        return userId
    }

    send(params: any) {
        if (!_.isArray(params)) {
            params = [params]
        }
        params = params.map(obj => {
            if (obj.method) {
                obj.params = obj.params.map(param => {
                    if (param.buttons) {
                        param.buttons = new this.gactions.Button(param.buttons)
                    }
                    if (param.image) {
                        param.image = new this.gactions.Image(param.image)
                    }
                    return param
                })
                return new this.gactions[obj.method](...obj.params)
            }
            if (obj.text) {
                return obj.text
            }
            return obj
        })
        this.conv.ask(...params)
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform,
            user: this.user
        }
    }

    get user() {
        return {
            id: this.conv.user.storage.userId
        }
    }

    get source() {
        return this.message.source
    }
}