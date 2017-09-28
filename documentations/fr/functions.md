# Les fonctions

Une fonction représente très souvent un dialogue. L'écriture est la suivante :

```converse
nameFunction() {

}
```

Une fonction peut contenir des paramètres :

```converse
nameFunction(args1, args2) {

}
```

## Déclencher une fonction

Une fonction est délenchée de la manière suivante :

```converse
nameFunction()
```

Un décorateur peut indiquer le rôle d'une fonction et la déclencher selon une situation

## Créer un fonction Javascript et la déclencher dans ConverseScript

Utilisez la méthode `functions` sur l'instance ConverseScript :

```js
const converse = new Converse()
// ...
converse.functions({
    nameFunctionJs() {

    }
})
```

Le script ConverseScript utilse la fonction :

```converse
nameFunctionJs()
```

Si la fonction comporte des valeurs asynchrones, retournez une promesse :

```js
const converse = new Converse()
// ...
converse.functions({
    nameFunctionJs() {
        return new Promise((resolve, reject) => {
            // any code
            resolve()
        })
    }
})
```

### Utiliser des paramètres de ConverseScript

Bien souvent, des informations sont indispensables pour le bon fonctionnement de la fonction. Par exemple,
récupérer les informations de l'utilisateurs ou récupérer la collection d'utilisateurs

```js
const converse = new Converse()
// ...
converse.functions({
    nameFunctionJs: {
        $params: ['user'],
        $call(user) {
            // any code
            user.setMagicVariable('foo', 'hello')
        }
    }
})
```

Le script est le suivant :

```converse
start() {
    nameFunctionJs()
    > { :foo }
}
```

Le paramètre `user` est ajouté à la fin des paramètres de la fonction `$call`.La fonction créée ensuite une variable magique, utilisable dans le script

#### Utiliser un objet

Il est possible d'utiliser un objet comportant plusieurs fonctions :

```js
const converse = new Converse()
// ...
converse.functions({
    myObj: {
        nameFunction() {

        }
    }
})
```

Dans ConverseScript

```converse
start() {
    myObj.nameFunction()
}
```

Avec des paramètres spécifiques :

```js
const converse = new Converse()
// ...
converse.functions({
    myObj: {
        $params: ['user'],
        nameFunction(user) {

        }
    }
})
```

### Créer un mock de la fonction

Il peut être très utile de mocker une fonction. Même si chaque fonction peut être mockée dans les test unitaires, nous souhaitons peut être changer le comportement globalement durant les tests unitaires

```js
const converse = new Converse()
// ...
converse.functions({
    nameFunctionJs: {
        $params: ['user'],
        $call(user) {
            return 'hello'
        },
        $mock(user) {
            return 'fake'
        }
    }
})
```