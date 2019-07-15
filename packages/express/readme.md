# Use

```js
const express = require('express')
const bot = require('newbot-express')

const app = express()

bot({
    botframework: {
        path: '/emulator'
    },
    output: {
       debug(type, val) {
            console.log(type, val)
        }  
    }
}, app)

app.listen(5500)
```