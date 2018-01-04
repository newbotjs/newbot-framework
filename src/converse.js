const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const Languages = require('languages-js')
const stack = require('callsite')

const User = require('./user')
const Transpiler = require('./transpiler/lexer')
const Interpreter = require('./interpreter')
const { MongoClient } = require('mongodb')
const Functions = require('./api')
const Nlp = require('./nlp')

class Converse {

    constructor(done) {
        this._nlp = {}
        this.config = {}
        this._format = {}
        this._dbHook = {}
        this._hooks = {}
        this.script = ''
        this._obj = []
        this._skills = new Map()
        this._users = new Map()
        this.namespace = 'default'
        this._functions = Functions
        this.lang = Languages.instance()
        this.parentPath = this._findParentPath()
        this.openSkills(done)
    }

    get users() {
        return this._users
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
            this.code(fs.readFileSync(this._file, 'utf-8'))
        }
        this._transpiler = new Transpiler(this.script)
        this._obj = this._transpiler.run()
        this._interpreter = new Interpreter(this._obj, this.users, this)
        return this
    }

    exec(input, userId, output, propagate = {}) {
        this.open()

        if (!_.isObjectLike(input)) {
            input = { text: input }
        }

        let user = this._users.get(userId)
        if (_.isFunction(output)) {
            output = { output }
        }
        if (!user) {
            user = new User(userId)
            this._users.set(userId, user)
            propagate.start = true
        }
        if (output.magicVariables) {
            for (let variable in output.magicVariables) {
                user.setMagicVariable(variable, output.magicVariables[variable])
            }
        }
        user.setMagicVariable('userId', userId)

        let p = Promise.resolve()
            .then(() => this.propagateExec(input, userId, output, propagate))
            .then(noExec => propagate.childrenNotExec = !!noExec)
        if (input.type !== 'event') {
            p = p.then(() => this.execNlp(input, userId))
        }
        else {
            p = p.then(() => input)
        }
        return p.then(input => {
            return this._interpreter.exec(user, input, output, propagate)
        }).catch((err) => {
            console.log(err)
        })
    }

    propagateExec(input, userId, output, propagate) {
        const promises = []
        let options = _.clone(output)
        let noExec = true
        delete options.finish
        delete options.finishFn
        this._skills.forEach((skill) => {
            if (skill._shareFormat) {
                this._format = _.merge(skill._format, this._format)
            }
            skill._users = this.users
            promises.push(skill.exec(input, userId, options, propagate).then((ret = {}) => {
                noExec &= ret.noExec
            }))
        })
        return Promise.all(promises).then(() => noExec)
    }

    skills() {
        return this._skills
    }

    execNlp(input, userId) {
        const promises = []
        input.intents = {}
        for (let name in this._nlp) {
            let nlp = this._nlp[name]
            promises.push(nlp.exec(input.text, userId).then((intents) => {
                input.intents = _.merge(input.intents, intents)
            }))
        }
        return Promise.all(promises).then(() => input)
    }

    event(name, ...more) {
        let output, users, data
        switch (more.length) {
            case 2:
                if (_.isArray(more[0])) {
                    users = more[0]
                }
                else {
                    data = more[0]
                }
                output = more[1]
                break
            case 3:
                data = more[0]
                users = more[1]
                output = more[2]
                break
            default:
                users = this.users
                break
        }
        if (users && !_.isArray(users)) {
            users = [users]
        }
        users.forEach((user) => {
            if (user.id) {
                user = user.id
            }
            this.exec({
                type: 'event',
                name,
                data
            }, user, output)
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

    execFunction(name, params, done, user, { deep, data }) {
        let mockName = name
        if (deep) {
            mockName += '.' + deep
        }

        if (!this._functions[name]) throw `${deep.join('.') + '.' + name}() not exists`

        let { $call, $mock, $params } = this._functions[name]
        let ret

        this._functions[name].namespace = this.namespace

        if (!$call) {
            $call = this._functions[name]
        }

        if (deep && deep.length > 0) {
            $call = _.get($call, deep)
        }

        if ($params) {
            $params = $params.map(p => {
                switch (p) {
                    case 'users':
                        return this.users
                    case 'user':
                        return user
                    case 'data':
                        return data
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
        if (ret && ret.then) {
            return ret
                .then(done)
                .catch(err => {
                    user.setMagicVariable('error', err)
                    done()
                })
        }
        done(ret)
    }

    nlp(name, intents) {
        if (!this._nlp[name]) {
            this._nlp[name] = new Nlp(name, this)
        }
        if (intents) this._nlp[name].add(intents)
        return this._nlp[name]
    }

    useNlp(name) {
        this.currentNlp = name
        return this
    }

    getCurrentNlp() {
        return this._nlp[this.currentNlp]
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

    _findParentPath() {
        const _stack = stack()
        const current = __dirname
        for (let site of _stack) {
            let filename = site.getFileName()
            let _path = path.dirname(filename)
            if (_path !== current && !/testing$/.test(_path)) {
                return _path
            }
        }
    }

    async openSkills(done) {
        const config = await new Promise((resolve, reject) => {
            fs.readFile(`${this.parentPath}/package.json`, { encoding: 'utf-8' }, (err, data) => {
                if (err) {
                    if (err.code == 'ENOENT') return resolve()
                    return reject(err)

                }
                resolve(JSON.parse(data))
            })
        })
        if (config && config.converse && config.converse.dependencies) {
            this.setSkills(config.converse.dependencies)
            if (done) done()
        }
    }

    async skill(skillName, skillPath = skillName) {
        let _path = skillPath.skill || skillPath
        let dir = _path
        if (!/\//.test(_path)) {
            dir = this.config.pathSkills || 'converse_skills'
            dir += `/${_path}`
        }
        let skill = require(`${this.parentPath}/${dir}`)
        if (skillPath.skill) {
            skill = skill(skillPath.params)
            if (skill.then) {
                skill = await skill
            }
        }
        skill.namespace = (this.namespace ? this.namespace + '-' : '') + skillName
        skill.parent = this
        this._skills.set(skillName, skill)
        return this
    }

    setSkills(obj) {
        for (let name in obj) {
            this.skill(name, obj[name])
        }
        return this
    }

    shareFormats() {
        this._shareFormat = true
    }

}

module.exports = Converse