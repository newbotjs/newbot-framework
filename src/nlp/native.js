module.exports = function processNlp(manager) {
    return async (text, userId, converse) => {
        const result = await manager.process(text)
        const taln = {}
        for (let entity of result.entities) {
            taln[entity.entity] = entity.resolution
        }
        taln.sentiment = result.sentiment.vote
        return {
            [result.intent]() {
                return taln
            }
        }
    }
}