const fs = require('fs')
const package = require('../package.json')
const newbot = require('../newbot.json')

package.version = newbot.version

fs.writeFileSync(__dirname+ '/../package.json', JSON.stringify(package, null, 2))