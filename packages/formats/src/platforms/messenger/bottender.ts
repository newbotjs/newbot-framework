import { FormatInterface, Button } from '../format.interface'
import { MessengerFormat } from '.'
import { User } from '../../../../../types/user'

export class MessengerBottenderFormat extends MessengerFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string): any {
        return [
            this.text,
            {
                method: 'sendImage',
                params: [
                    contentUrl
                ]
            }
        ]
    }

    video(contentUrl: string): any {
        return [this.text, {
            method: 'sendVideo',
            params: [
                contentUrl
            ]
        }]
    }

    private formatQuickReplies(quickReplies: Array<any>) {
        return {
            method: 'sendText',
            params: [
                this.text,
                {
                    quick_replies: quickReplies
                }
            ]
        }
    }

    email(): any {
        const { quick_replies } = super.email()
        return this.formatQuickReplies(quick_replies)
    }

    quickReplies(actions: Array<any>): any {
        const { quick_replies } = super.quickReplies(actions)
        return this.formatQuickReplies(quick_replies)

    }

    buttons(buttons: Array<Button>): any {
        buttons = super.buttons(buttons)
        return {
            method: 'sendButtonTemplate',
            params: [
                this.text,
                buttons
            ]
        }
    }
} 
