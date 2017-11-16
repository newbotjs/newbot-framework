# ConverseScript

# Version

Alpha

# Description

Powerful Scripting for Automated Conversations (Chatbot)

# Features

* Creating quickly a Conversation Stream, Context and Prompt
* True script with variables, conditions, loops and functions. Syntax very close to Javascript
* Trigger a conversation according to an event (first conversation, no conversation found, etc.)
* Trigger a conversation according to a user's intention. The intention can be captured either with regular expression or with natural language (api.ai, wit.ai or custom api
* Address (or pointer) of the user in the conversation stream is stored in memory and can be saved in a database
* Keep a user's values in memory with global variables.
* Compare the values of a user with other users (a score for example)
* Chatbot response with custom formats
* Proactive message and broacast message
* Internationalization (with plurialize). It use https://languages.js.org
* Unit testing and function mock
* Possible to call Javascript functions
* Possible to put ConverScript on any framework (BotFramework, Botkit, etc)
* Put the @Action decorator on a function. Triggers a function if an action is performed
* Import / Export modules
* BotFramework integration
* Syntax color on Visual Studio Code (partial)

# Todo 

* Restriction input
* Trigger events or intention but according to conditions
* Function Returns a value
* API to manage the conversation flow (cancel, go back, go forward, etc.)
* Run an offline ConverseScript file

# ConverseScript scenario example 

```converse
@Event('start')
start() {
    > Hello !
}
```