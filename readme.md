<!-- <HEADER> // IGNORE IT -->
<p align="center">
  <img src="https://newbot.io/images/logo-medium.png" alt="NewBot" height="300px"/>
</p>

<div align="center">
  <h1>NewBot Javascript Framework</h1>
</div>

<br />

**NewBot Framework is an open source Javascript framework for building chatbots, for 15 messaging platforms, with a modular and original dialogue system**

Creating a conversational system can take a long time. The goal of NewBot Framework: to give all the means to realize chatbots / voicebots as quickly and as easily as possible

## Many Demo

https://newbot.io/examples.html

## Docs

[Last version](https://newbot.io/en/docs)

## Why not use Microsoft BotFramework or BotKit?

The approach is completely different from these frameworks. NewBot Framework is designed to create conversational systems without worrying about the final platform.

We offer a framework, a skill structure and the means to test your bot.

[5 good reasons to use NewBot Framework](https://medium.com/@NewBot/5-good-reasons-to-use-newbot-framework-5fee63839a8e)

# Why NewBot Framework

- **CLI**. Tools with NewBot CLI | Create, Generate, Test, Deploy, etc.
- **Modules**. A skill is an independent module. This helps structure the project and share skills
- **NLP**. Native NLP, external services (DialogFlow, NewBot Cloud, etc.) or your own NLP system
- **Easy PWA integration**. Create an offline chatbot with PWA
- **Integrate on other platforms**. Facebook Messenger, Amazon Alexa, Google Assistant, Slack, Viber, Telegram, Line, twitter, BotFramework
- **Unit tests**. Create powerful unit tests
- **Internationalization**. Easily integrate chatbot responses into multiple languages

## Installation

1. Use `newbot-cli` to create a project:

`npm install -g newbot-cli`

2. Create a new project called `my-chatbot`

`newbot new my-chatbot`

3. Start a local server

`cd my-chatbot`
`newbot serve`

4. Go to `localhost:3000` and test

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

### 2020-02-19

- Fix several bugs

### 2020-02-06

- It is possible to train the chatbot on the fly
- The training now uses version 4 of the NLPJS module. The generated model is therefore different
- 1 additional browser-side file is generated (dist/newbot.with-nlp.[min].js). NLPJS content is integrated into the final file