import Converse from '../src/converse'

let NewBot

if (typeof window !== 'undefined') {
    window.Converse = Converse
    window.NewBot = Converse
}

NewBot = Converse

export {
    Converse,
    NewBot
}
