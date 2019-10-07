const Alexa = require('ask-sdk-core')
const { ExpressAdapter } = require('ask-sdk-express-adapter')
const _ = require('lodash')

const handlers = function(exec) {
    
    const LaunchRequestHandler = {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
        },
        handle(handlerInput) {
            return exec(handlerInput, 'start')
        }
    }
    
    const NewBotHandler = {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'NewBotIntent';
        },
        handle(handlerInput) {
           return exec(handlerInput)
        }
    }
    
    const NewBotEventHandler = {
        canHandle(handlerInput) {
            const { type, reason } = handlerInput.requestEnvelope.request
            const intentName = _.get(handlerInput.requestEnvelope, 'request.intent.name')
            if ((type == 'IntentRequest' || type == 'SessionEndedRequest') && intentName && /^AMAZON/.test(intentName)) {
                handlerInput.eventName = intentName
                return true
            }
            else if (type == 'Connections.Response') {
                const { name, payload } = handlerInput.requestEnvelope.request
                handlerInput.eventName = `AMAZON.${name}`
                handlerInput.eventData = payload
                return true
            }
            else if (type == 'SessionEndedRequest' && reason == 'ERROR') {
                const { error } = handlerInput.requestEnvelope.request
                handlerInput.eventName = 'AMAZON.Error'
                handlerInput.eventData = error
                if (error.type == 'INVALID_RESPONSE') {
                    console.log(`Warning! No answer is sent.`)
                }
                return true
            }
            return false
        },
        handle(handlerInput) {
           return exec(handlerInput, handlerInput.eventName, handlerInput.eventData)
        }
    }
    
    const ErrorHandler = {
        canHandle() {
            return true;
        },
        handle(handlerInput, error) {
            console.log(`~~~~ Error handled: ${error.stack}`);
            const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse()
        }
    }
    
    const skillBuilder = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            LaunchRequestHandler,
            NewBotHandler,
            NewBotEventHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .withApiClient(new Alexa.DefaultApiClient())
    
    const skill = skillBuilder.create()
    const adapter = new ExpressAdapter(skill, true, true)
    return adapter
}

module.exports = handlers