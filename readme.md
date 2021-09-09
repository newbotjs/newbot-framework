<!-- <HEADER> // IGNORE IT -->
<p align="center">
  <img src="https://newbot.io/images/logo-medium.png" alt="NewBot" height="300px"/>
</p>

<div align="center">
  <h1>NewBot Javascript Framework</h1>
</div>

<br />

**NewBot Framework is an open source Javascript framework for building chatbots

Creating a conversational system can take a long time. The goal of NewBot Framework: to give all the means to realize chatbots / voicebots as quickly and as easily as possible

## Docs

[Last version](https://docs.newbot.io)

## Why not use Microsoft BotFramework or BotKit?

The approach is completely different from these frameworks. NewBot Framework is designed to create conversational systems without worrying about the final platform.

We offer a framework, a skill structure and the means to test your bot.

[5 good reasons to use NewBot Framework](https://medium.com/@NewBot/5-good-reasons-to-use-newbot-framework-5fee63839a8e)

# Why NewBot Framework

- **Modules**. A skill is an independent module. This helps structure the project and share skills
- **NLP**. Native NLP, external services (DialogFlow, NewBot Cloud, etc.) or your own NLP system
- **Easy PWA integration**. Create an offline chatbot with PWA
- **Unit tests**. Create powerful unit tests
- **Internationalization**. Easily integrate chatbot responses into multiple languages

## Installation

```bash
npx degit newbotjs/template my-chatbot
cd my-chatbot
npm install
npm run dev
```

## Usage

- `main.converse`

```ts
@Event('start')
start() {
    > Hello
}
```

- `main.js`

```js
import code from './main.converse'

export default {
    code
}
```

## License

MIT

## Changed

### 2021-09-08

Set the version of NewBot. Works in WebWorkers

### 2020-02-19

- Fix several bugs

### 2020-02-06

- It is possible to train the chatbot on the fly
- The training now uses version 4 of the NLPJS module. The generated model is therefore different
- 1 additional browser-side file is generated (dist/newbot.with-nlp.[min].js). NLPJS content is integrated into the final file