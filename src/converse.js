const fs = require('fs')
const _ = require('lodash')
const Languages = require('languages-js')

const User = require('./user')
const Transpiler = require('./transpiler/lexer')
const Interpreter = require('./interpreter')
const { MongoClient } = require('mongodb')
const Functions = require('./api')
const Nlp = require('./nlp')

class Converse {

    constructor() {
        this.users = new Map()
        this._nlp = {}
        this.config = {}
        this._format = {}
        this._dbHook = {}
        this._mongoDbHook = {}
        this._hooks = {}
        this._functions = Functions
        this.lang = Languages.instance()
    }

    configure(config) {
        this.config = config
        return this
    }

    file(file) {
        this._file = file
        return this
    }

    code(str) {
        this.script = str
        return this
    }

    open() {
        if (this._file) {
            this.script = fs.readFileSync(this._file, 'utf-8')
        }
        this._transpiler = new Transpiler(this.script)
        this._obj = this._transpiler.run()
        // console.log(JSON.stringify(this._obj, null, 2))
        this._interpreter = new Interpreter(this._obj, this.users, this)
        return this
    }

    exec(input, userId, output) {
        this.open()
        let p = Promise.resolve()
        const nlp = this.getCurrentNlp()
        if (nlp && input.type !== 'event') {
            p = p.then(() => nlp.exec(input, userId))
        }
        return p.then(intents => {
            if (!_.isObjectLike(input)) {
                input = { text: input }
            }
            if (intents) {
                input.intents = intents
            }
            this._interpreter.exec(input, userId, output)
        }).catch((err) => {
            console.log(err)
        })
    }

    event(name, users, output) {
        if (!output) {
            output = users
            users = null
        }
        if (!users) {
            users = this.users
        }
        else if (!_.isArray(users)) {
            users = [users]
        }
        users.forEach((user, id) => {
            this.exec({
                type: 'event',
                name
            }, id, output)
        })
    }

    saveSession(session, userId) {
        const user = this.users.get(userId)
        if (!user) {
            throw `Unable to save the user ${userId} session because there is no exists`
        }
        user.saveSession(session)
        return this
    }

    format(name, callback) {
        this._format[name] = callback
        return this
    }

    functions(object) {
        this._functions = _.merge(this._functions, object)
        return this
    }

    execFunction(name, params, done, user, { deep }) {
        let mockName = name
        if (deep) {
            mockName += '.' + deep
        }

        if (!this._functions[name]) throw "function not exists"

        let { $call, $mock, $params } = this._functions[name]
        let ret

        if (!$call) {
            $call = this._functions[name]
        }

        if (deep) {
            $call = _.get($call, deep)
        }

        if ($params) {
            $params = $params.map(p => {
                switch (p) {
                    case 'users':
                        return this.users
                    case 'user':
                        return user
                }
                return p
            })
            params = params.concat($params)
        }

        if (this.testing && this._mock[mockName]) {
            ret = this._mock[mockName].call(user, ...params)
            if ($mock) {
                if (deep) {
                    $mock = _.get($mock, deep)
                }
                ret = $mock.call(this._mock[mockName], ...[ret, ...$params])
            }
        }
        else {
            ret = $call.call(this._functions[name], ...params)
        }

        if (!done) {
            return ret
        }
        if (ret.then) {
            return ret.then(done)
        }
        done(ret)
    }

    nlp(name, intents) {
        if (!this._nlp[name]) {
            this.nlp[name] = new Nlp(name, this)
        }
        if (intents) this.nlp[name].add(intents)
        return this.nlp[name]
    }

    useNlp(name) {
        this.currentNlp = name
        return this
    }

    getCurrentNlp() {
        return this.nlp[this.currentNlp]
    }

    loadLanguage() {
        if (!this.config.languages) {
            return
        }
        const path = this.config.languages.path || './languages'
        this.lang.init(this.config.languages.packages, path + '/')
    }

    load() {
        this.loadLanguage()
        return this
    }

    /*
        [
            _id: ...
            
        ]
    */
    loadUsers(jsonCollections) {
        for (let json of jsonCollections) {
            let id = json._id
            let user = new User(id).fromJson(json)
            this.users.set(id, user)
        }
    }

    use(hooks) {
        this._hooks = hooks
    }

}

module.exports = Converse