import processNlp from '../src/process'

export default async function(path) {
    const manager = new window.NLPJS.NlpManager()
    const model = await fetch(path).then(res => res.json())
    manager.import(model)
    return processNlp(manager)
}