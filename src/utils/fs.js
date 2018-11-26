const fs = require('fs')
const browser = require('./browser')

class FileSystem {
    readFile(file, encode) {
        if (browser.is()) {
            return new Promise((resolve, reject) => {
                const xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                        if (xmlhttp.status == 200) {
                            resolve(xmlhttp.responseText)
                        }
                        else {
                            reject(xmlhttp)
                        }
                    }
                }
                xmlhttp.open("GET", file, true)
                xmlhttp.send()
            })
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