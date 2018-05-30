const fs = require('fs')
const isBrowser = typeof window != 'undefined'

class FileSystem {
    readFile(file, encode) {
        if (isBrowser) {
            return require(file)
        }
        return new Promise((resolve, reject) => {
            fs.readFile(file, encode, (err, data) => {
                if (err) return reject(err)
                resolve(data)
            })
        })
    }
}

module.exports = new FileSystem()