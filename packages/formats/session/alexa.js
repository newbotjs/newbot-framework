const _ = require('lodash')

class AlexaSession {
    constructor(handlerInput) {
        this.handlerInput = handlerInput
        this.dialogs = []
        this.response = null
        this.platform = 'alexa'
    }

    supportsAPL() {
        const supportedInterfaces = this.handlerInput.requestEnvelope.context
            .System.device.supportedInterfaces
        const aplInterface = supportedInterfaces['Alexa.Presentation.APL']
        return aplInterface != null && aplInterface !== undefined
    }

    async send(params) {
        try {
            let responseBuilder = this.handlerInput.responseBuilder

            if (_.isString(params)) {
                params = {
                    text: params
                }
            }

            if (params.type == 'Alexa.Presentation.APL.RenderDocument' && this.supportsAPL()) {
                this.response.addDirective(params)
            }

            else if (params.type == 'Connections.SendRequest') {
                const productId = params.payload.InSkillProduct.productId
                if (!/\.product\./.test(productId)) {
                    const locale = this.handlerInput.requestEnvelope.request.locale
                    const monetizationClient = this.handlerInput.serviceClientFactory.getMonetizationServiceClient()
                    const res = await monetizationClient.getInSkillProducts(locale)
                    const product = _.find(res.inSkillProducts, p => p.referenceName == productId)
                    if (!product) {
                        throw 'Alexa Product not exists'
                    }
                    params.payload.InSkillProduct.productId = product.productId
                }
                
                this.response = responseBuilder
                    .addDirective(params)
            }

            else {
                this.response = responseBuilder
                .speak(params.text)
                .reprompt(params.text)

                if (params.type == 'image') {
                    const {
                        smallImageUrl,
                        largeImageUrl
                    } = params.image

                    this.response = this.response
                        .withStandardCard(params.text, '', smallImageUrl, largeImageUrl)
                }
            }
            
            this.response = this.response.getResponse()

        } catch (err) {
            console.log(err)
        }
    }

    get user() {
        return {
            id: this.handlerInput.requestEnvelope.session.user.userId
        }
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform
        }
    }

    get source() {
        return this.message.source
    }
}

module.exports = AlexaSession
