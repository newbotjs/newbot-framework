const Decorator = require('./decorator')

class DecoratorEvent extends Decorator {

    start() {
        return this.params[0] == 'start'
    }

    nothing() {
        return this.params[0] == 'nothing'
    }

}

module.exports = DecoratorEvent