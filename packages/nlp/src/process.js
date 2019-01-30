export default function processNlp(manager) {
    return async (text, userId, converse) => {
        const result = await manager.process(text)
        return {
            [result.intent]() {
                return true
            }
        }
    }
}