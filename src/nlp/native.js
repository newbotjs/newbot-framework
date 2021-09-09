module.exports = function processNlp(manager) {
    return async (text, userId, converse) => {

        const result = await manager.process(text)
        const taln = {}
        for (let entity of result.entities) {
            let value
            if (entity.resolution) {
                value = entity.resolution
            }
            else if (entity.utteranceText) {
                value  = { value: entity.utteranceText }
            }
            taln[entity.entity] = value
        }
        taln.sentiment = result.sentiment.vote
        return {
            [result.intent](text, _, user) {
                user.setMagicVariable('entity', taln)
                return result
            }
        }
    }
}