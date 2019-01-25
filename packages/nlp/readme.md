# NewBot NLP

## Use

```js
const newbotNlp = require('newbot-nlp')

newbotNlp.loadModel(converse, './nlp/model.nlp')
```

```js
NewBot.loadModel(converse, './nlp/model.nlp')
```

## 

```ts
@Intent('greetings.hello', [
    'Bonjour',
    'ça va',
    'qui est tu ?'
])
hello() {
    > Je vais bien, et toi ?
    Prompt()
}
```