class Debug {

    constructor(script, history) {
        this.script = script
        this.history = history
    }

    organize() {
        let code = this.script.split('\n')
        console.log(this.history[0]._file)
    }

    display() {
       const code = this.organize()
       console.log('--- %s ---', DEBUG)
       for (let line of code) {
           console.log(line)
       }
       console.log('------')
    }

}

module.exports = Debug