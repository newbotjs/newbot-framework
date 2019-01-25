NewBot.loadModel = async function(converse, path) {
    const manager = new window.NLPJS.NlpManager()
    const model = await fetch(path).then(res => res.json())
    manager.import(model)
    converse._manager = manager
}