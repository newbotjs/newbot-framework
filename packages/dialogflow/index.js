const dialogflow = require('dialogflow')

module.exports = function ({
    projectId,
    sessionId,
    languageDefault,
    credentials
}) {
    if (credentials) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials
    }

    const sessionClient = new dialogflow.SessionsClient()
    const sessionPath = sessionClient.sessionPath(projectId, sessionId)

    return {
        nlp: {
            async dialogflow(text, userId, converse) {
                try {
                    const user = converse.users.get(userId)
                    const languageCode = user.getLang() || languageDefault || 'en-EN'

                    const request = {
                        session: sessionPath,
                        queryInput: {
                            text: {
                                text,
                                languageCode: languageCode.replace('_', '-')
                            }
                        }
                    }
                    const responses = await sessionClient.detectIntent(request)
                    const intents = {}
                    for (res of responses) {
                        if (!res) continue
                        const result = res.queryResult
                        const { parameters, outputContexts } = result
                        const retIntents = {
                            response: result.fulfillmentText
                        }
                        const assignParams = (parameters) => {
                            for (let key in parameters.fields) {
                                retIntents[key] = {
                                    found: true,
                                    value: parameters.fields[key].stringValue
                                }
                            }
                        }
    
                        for (let context of outputContexts) {
                            assignParams(context.parameters)
                        }
                        assignParams(parameters)
    
                        intents[result.action] = () => {
                            return retIntents
                        }
                    }
                    return intents
                }
                catch (err) {
                    console.error(err)
                    return {
                        'dialogflow.error'() {
                            return {
                                error: err.message
                            }
                        }
                    }
                }
            }
        },
        shareNlp: true
    }
}
