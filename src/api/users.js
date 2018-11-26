const Users = {

    $params: ['users'],

    nbUsers(users) {
        return users.size
    },

    sum(name, users) {
        let sum = 0
        for (let [,user] of users) {
            sum += +user.getVariable(this.namespace, name)
        }
        return sum
    },
    
    avg(name, users) {
        return this.sum(name, users) / this.nbUsers(users)
    }

}


module.exports = Users