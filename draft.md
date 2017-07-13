# Converse Script

## Variables 

Javascript Like. Chaque variable est propre à l'utilisateur et sauvegardé dans MongoDB. Pour empêcher la sauvegarde (varibale temporaire) :

unmemorized variable

### String

variable = ''

### Number

variable = 1

### Boolean

variable = true

### Array

variable = []

### Object

variable = {}
variable.id = 1337
variable['id'] = 1337

## Function

myfunction() {

}

### Exécuter une fonction :

myfunction()

## Decorator

### @Event

@Event(name, [value])

Execute la fonction selon l'événement 

#### start

@Event('start')

#### time

@Event('time', 'each day at 8am')

#### webhook

@Event('webhook', '/api/plop')

Token obligatoire dans la configuration

#### value changed

@Event('value changed', 'score')

### @Condition

La fonction est exécuté seulement si la condition est remplise

@Condition() {
    myvariable == 10
}

### @Intent

La fonction est executée quand une intention est voulu

@Intent(query)

Exemple : Je pars

@Intent('leave')

Exemple : Je pars à Paris

@Intent('leave') {
    (unknown $city) Je ne connais pas la ville
}

### @Input()

Valeur attendue 

@Input('city') {
    (unknown $city) je ne connais pas cette ville
    ($city.length > 5) Ville trop longue
}

## Scénario

On écrit un scénario dans la fonction :

@Event('start')
start() {
    > Quel est votre nom ?
    Input()
    name = $text
    > Merci {name}, où habitez vous ?
    Input('city')
    city = $text
    > Très belle ville {$city}
}

