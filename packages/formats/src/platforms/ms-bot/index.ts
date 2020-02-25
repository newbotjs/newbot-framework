import { MessageFactory, CardFactory, ActionTypes } from 'botbuilder'
import { FormatInterface, Button } from '../format.interface'
import { PlatformFormat } from '../platform'
import { User } from '../../../../../types/user'
import last from 'lodash.last'

export class BotBuilderFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string, contentType?: string, name?: string) {
        if (!name) {
            name =  last(contentUrl.split('/'))
        }
        if (!contentType) {
            let ext = last(name?.split('.'))
            ext = ext.toLowerCase()
            if (['gif', 'png', 'jpeg', 'jpg'].indexOf(ext)) {
                contentType = 'image/' + ext
            }
        }
        return this.attachment({
            name,
            contentType,
            contentUrl
        })
    }

    video(contentUrl: string, contentType: string, name: string) {
        if (!name) {
            name = last(contentUrl.split('/'))
        }
        return this.attachment(
            CardFactory.videoCard(
                name,
                [{ url: contentUrl }]
            )
        )
    }

    buttons(buttons: Array<Button>) {
        const buttonsClone = buttons.map(b => {
            const button: any = this.toByLang(b)
            if (!button.url) {
                button.type = ActionTypes.ImBack
                button.value = b.msg || b.title
            }
            else {
                button.type = ActionTypes.OpenUrl
                button.value = b.url
            }
            return button
        })
        return this.attachment(
            CardFactory.heroCard('', undefined, buttonsClone)
        )
    }

    quickReplies(actions: Array<any>): any {
        actions = actions.map(action => {
            action = this.toByLang(action)
        })
        return MessageFactory.suggestedActions(actions, this.text);
    }

    adaptiveCard(content: any) {
        return this.attachment(CardFactory.adaptiveCard(content))
    }

    private attachment(attachment: any) {
        return {
            text: this.text,
            attachments: [attachment]
        }
    }
}