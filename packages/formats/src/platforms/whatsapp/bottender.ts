import { FormatInterface } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class WhatsappBottenderFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    private _media(contentUrl: string): any {
        return {
            method: 'sendText',
            params: [this.text, {
                mediaUrl: [contentUrl]
            }]
        }
    }

    image(contentUrl: string): any {
        return this._media(contentUrl)
    }

    video(contentUrl: string): any {
        return this._media(contentUrl)
    }

    contact(contentUrl: string): any {
        return this._media(contentUrl)
    }

    audio(contentUrl: string): any {
        return this._media(contentUrl)
    }

    file(contentUrl: string): any {
        return this._media(contentUrl)
    }
}