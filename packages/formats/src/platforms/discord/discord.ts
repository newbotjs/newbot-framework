import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class DiscordFormat extends PlatformFormat implements FormatInterface {

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

    private embed(content: any) {
        return {
            embed: content
        }
    }

}