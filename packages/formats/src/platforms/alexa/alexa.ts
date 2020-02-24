import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class AlexaSdkFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string) {
        return {
            type: 'image',
            text: this.text,
            image: {
                smallImageUrl: contentUrl,
                largeImageUrl: contentUrl
            }
        }
    }

    location() {
        return {
            type: 'AskForPermissionsConsent',
            permissions: [ 'read::alexa:device:all:address' ]
        }
    }

    signin() {
        return {
            type: 'LinkAccount',
            text: this.text
        }
    }

    apl(document: any, datasources: any) {
        return {
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            datasources,
            document
        }
    }

    private schema(name:string, productId: string) {
        return {
            type: "Connections.SendRequest",
            name,
            payload: {
                InSkillProduct: {
                    productId
                }
            },
            token: "correlationToken"
        }
    }

    'Amazon.Purchase.Buy'(productId: string){
        return this.schema('Buy', productId)
    }

    'Amazon.Purchase.Cancel'(productId: string) {
        return this.schema('Cancel', productId)
    }
}