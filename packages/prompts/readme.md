# Description

Ask the user to enter text in a specific format. the chatbot can ask for :

- An email
- A phone number
- A date
- A confirmation
- A number

# Installation

Install with

`npm install newbot-prompts`

# Use

1. In your skill, import the package
2. Add the skill in the `skills` 

```js
import prompts from 'newbot-prompts'
import code from './main.converse'

export default {
    code,
    skills: {
        prompts
    }
} 
```

# Use in ConverseScript

In `main.converse` : 

## Ask email

```ts
myFunction() {
    email = prompts.email() 
    > { email }
} 
```

## Ask Phone

```ts
myFunction() {
    phone = prompts.phone() 
    > { phone }
} 
```

## Ask Date

```ts
myFunction() {
    date = prompts.time('Give a date') 
    > { date }
} 
```

## Ask Number

```ts
myFunction() {
    number = prompts.number('Give a number') 
    > { number }
} 
```

You can put a minimum and/or maximum :

```ts
myFunction() {
    number = prompts.number('Give a number', {
        min: 0,
        max: 100
    }) 
    > { number }
} 
```

## Ask Confirmation
```ts
myFunction() {
    bool = prompts.confirm('Do you want to buy?') 
    > { bool }
} 
```
