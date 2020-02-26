import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class DiscordFormat extends PlatformFormat implements FormatInterface {

    static extraFormats: Array<string> = [
        'Discord.React'
    ]

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(url: string) {
        return this.embed({
            image: {
                url
            }
        })
    }

    /*return this.buttons([
        {
            type: 'webview',
            url,
            title: params.button,
            height: params.height
        } 
    ])*/

    'Discord.React'(emojis) {
        return {
            text: this.text,
            react: true,
            emojis
        }
    }

    private embed(content: any) {
        return {
            embed: content
        }
    }

}