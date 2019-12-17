import localforage from 'localforage'

export default function ({
    keyName = 'newbot-progress'
} = {}) {
    return {
        finished(input, {
            user
        }) {
            const json = JSON.stringify(user.toJson())
            localforage.setItem(keyName, json)
        }
    }
}
