# Les décorateurs

 Les décorateurs donnent des informations supplémentaires sur une instruction.

 Ecriture d'un décorateur :

```converse
@DecoratorName(...params)
```

 ## Les événements

 Un événement sur une fonction permet de déclencher cette fonction selon une situation

 ### start

 L'événement `start` déclenche la fonction lorsque l'utilisateur lance le chatbot la première fois. Attention, seulement la première fois !

```converse
@Event('start')
nameFunction() {
    > Je suis ChatBot
}
```

### nothing

L'événement `nothing` déclenche la fonction si aucune autre fonction n'est lancée

```converse
@Event('nothing')
nameFunction() {
    > Je ne comprends pas ...
}
```

### on

L'événement `on` déclenche la fonction selon un appel extérieur :

index.converse
```converse
@Event('on', 'my-event')
nameFunction() {
    > Ton nom est { :event.name }
}
```

La méthode Javascript est 

* `.event(event_name:string, callback(output:string, done:function))` : déclenche la fonction pour tous les utilisateurs
* `.event(event_name:string, user_id:string|users_id:Array<string>, callback(output:string, done:function))` : déclenche la fonction pour un ou des utilisateurs
* `.event(event_name:string, data:object, user_id:string|users_id:Array<string>, callback(output:string, done:function))` : déclenche la fonction pour un ou des utilisateurs avec des données

index.js
```js
const converse = new Converse()
converse.file('index.converse')
converse.event('my-event', { name: 'Sam' }, 'user-1', (output, done) => {
    console.log(output)
    done()
})
```

Si vous mettez

```js
const converse = new Converse()
converse.file('index.converse')
converse.event('my-event', (output, done) => {
    console.log(output)
    done()
})
```

Alors l'événement est déclenché pour **tous** les utilisateurs !
