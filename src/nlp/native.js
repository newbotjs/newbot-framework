module.exports = function processNlp(manager) {
    return async (text, userId, converse) => {
        const result = await manager.process(text)
        const taln = {}
        for (let entity of result.entities) {
            taln[entity.entity] = entity.resolution
        }
        if (taln.date) {
            taln.date.value = taln.date.date
            delete taln.date.date
        }
        if (taln.dimension) {
            taln.distance = Object.assign({}, taln.dimension)
            delete taln.dimension
        }
        taln.sentiment = result.sentiment.vote
        return {
            [result.intent]() {
                return taln
            }
        }
    }
}