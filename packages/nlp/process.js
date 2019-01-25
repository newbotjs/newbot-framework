export default async function processNlp(text, userId, converse) {
    const result = await converse._manager.process(text)
    return {
        [result.intent]() {
            return true
        }
    }
}