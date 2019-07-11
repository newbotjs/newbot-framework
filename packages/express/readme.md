# Use

```js
const express = require('express')
const bot = require('newbot-express')

const app = express()

bot({
    botframework: {
        path: '/emulator'
    }
}, app)

app.listen(5500)
```