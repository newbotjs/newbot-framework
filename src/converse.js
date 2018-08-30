const _ = require('lodash')
const path = require('path')
const Languages = require('languages-js')
const stack = require('callsite')

const User = require('./user')
const Transpiler = require('./transpiler/lexer')
const Interpreter = require('./interpreter')
const Functions = require('./api')
const Nlp = require('./nlp')

const fs = require('./utils/fs')
const Browser = require('./utils/browser')

const SystemJS = require('systemjs')

SystemJS.config({
    meta: {
        "*.converse": {
            loader: __dirname + '/../loader/converse-loader.js'
        }
    }
})

class Converse {

    constructor(options = {}) {
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
        this.parentPath = options._parentPath || this._findParentPath()
        if (_.isString(options)) {
            options = {
                file: options
            }
        }

        const hasOptions = Object.keys(options)

        if (hasOptions.length > 0) {
            this.loadOptions(options)
        }
    }

    loadOptions(options) {
        if (options.file) {
            this.file(options.file)
        }
        if (options.code) {
            this.code(options.code)
        }
        if (options.skills) {
            this.setSkills(options.skills)
        }
        if (options.languages) {
            this.configure({
                languages: options.languages
            })
        }
        if (options.nlp) {
            for (let key in options.nlp) {
                this.nlp(key, options.nlp[key])
            }
        }
        if (options.functions) {
            this.functions(options.functions)
        }
        if (options.formats) {
            for (let key in options.formats) {
                this.format(key, options.formats[key])
            }
        }
        if (options.shareFormats) {
            this.shareFormats()
        }
        this.load()
    }

    get users() {
        return this._users
    }

    configure(config) {
        this.config = _.merge(this.config, config)
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

    async open() {
        if (this._file) {
            //this.code(await fs.readFile(this._file, 'utf-8'))
            //console.log(await System.import(`bot/${this._file}.`))
            this.code(await SystemJS.import(this._file))
        }
        this._transpiler = new Transpiler(this.script)
        this._obj = this._transpiler.run()
        //console.log(JSON.stringify(this._obj, null, 2))
        this._interpreter = new Interpreter(this._obj, this.users, this)
        return this
    }

    exec(input, userId, output, propagate = {
        globalNoExec: true
    }) {
        let user
        return new Promise(async (resolve, reject) => {

            let noExecChildren

            await this.open()

            if (!output) {
                if (Browser.is()) {
                    output = userId
                    userId = 'conversescript-user'
                } else {
                    throw 'On NodeJS, you must give an identifier to the user. `.exec(input, userId, output)`'
                }
            }

            if (!_.isObjectLike(input)) {
                input = {
                    text: input
                }
            }

            user = this._users.get(userId)

            if (_.isFunction(output)) {
                output = {
                    output
                }
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
                .then(() => {
                    if (output.preUser) {
                        return output.preUser(user, this)
                    }
                })
                .then(() => this.propagateExec(input, userId, output, propagate))
                .then(noExec => {
                    noExecChildren = !!noExec
                    noExecChildren = noExecChildren || (!noExecChildren && user.getAddress(this.namespace))
                })
            if (input.type !== 'event') {
                p = p.then(() => {
                    if (noExecChildren) {
                        return this.execNlp(input, userId)
                    }
                    return input
                })
            } else {
                p = p.then(() => input)
            }
            p.then(async input => {
                let ret = {}
                if (noExecChildren) {
                    ret = await this._interpreter.exec(user, input, output, propagate)
                    if (ret) propagate.globalNoExec &= ret.nothing
                }
                resolve(ret)
            }).catch((err) => {
                reject(err)
            })
        }).then((ret) => {
            if (!this.parent) {
                if (propagate.globalNoExec) {
                    if (this._hooks.nothing) this._hooks.nothing(input.text, {
                        user
                    }, output.data)
                }
                if (this._hooks.finished) this._hooks.finished(input.text, {
                    user,
                    data: output.data
                })
            }
            return ret
        })
    }

    propagateExec(input, userId, output, propagate) {
        const promises = []
        let options = _.clone(output)
        let noExec = true
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
        input.intents = {}
        let p = Promise.resolve()
        let nlpArray = Object.keys(this._nlp).map(name => this._nlp[name])
        nlpArray = nlpArray.sort((a, b) => {
            return b.priority - a.priority
        })
        for (let nlp of nlpArray) {
            p = p.then((state) => {
                if (state == 'break') return
                return nlp.exec(input.text, userId)
            }).then((intents) => {
                if (!intents) return
                const nbIntents = Object.keys(intents).length
                if (!_.isUndefined(nlp.priority) && nbIntents > 0) {
                    input.intents = intents
                    return 'break'
                } else {
                    input.intents = _.merge(input.intents, intents)
                }
            })
        }
        return p.then(() => input)
    }

    event(name, ...more) {
        let output, users, data
        let p = Promise.resolve()
        switch (more.length) {
            case 2:
                if (_.isArray(more[0])) {
                    users = more[0]
                } else {
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
            p = p.then(() => {
                if (user.id) {
                    user = user.id
                }
                return this.exec({
                    type: 'event',
                    name,
                    data
                }, user, output)
            })
        })
        return p
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

    execFunction(name, params, done, user, {
        deep,
        data,
        execution,
        level,
        ins
    }) {
        let mockName = name
        if (deep) {
            mockName += '.' + deep
        }

        if (!this._functions[name]) throw `${deep.join('.') + '.' + name}() not exists`

        let {
            $call,
            $mock,
            $params
        } = this._functions[name]
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
                    case 'execution':
                        return execution
                    case 'level':
                        return level
                    case 'ins':
                        return ins
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
        } else {
            ret = $call.call(this._functions[name], ...params)
        }

        if (!done) {
            return ret
        }
        if (ret && ret.then) {
            return ret
                .then(() => {
                    user.setMagicVariable('error', null)
                    done()
                })
                .catch(err => {
                    user.setMagicVariable('error', err)
                    done()
                })
        }
        done(ret)
    }

    nlp(name, intents, options) {
        if (!this._nlp[name]) {
            this._nlp[name] = new Nlp(name, this, options)
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

    async loadLanguage() {
        if (!this.config.languages) {
            return
        }
        const path = this.config.languages.path || './languages'
        let { packages, default: _default } = this.config.languages
        if (_.isArray(packages)) {
            this.lang.init(packages, path + '/')
            return
        }
        if (!_default) {
            _default = Object.keys(packages)[0]
        }
        this.lang.packages(packages).default(_default)
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

    // deprecated
    async openSkills(done) {
        let config
        if (!Browser.is()) {
            config = await new Promise(async (resolve, reject) => {
                try {
                    const data = await fs.readFile(`${this.parentPath}/package.json`, {
                        encoding: 'utf-8'
                    })
                    resolve(JSON.parse(data))
                } catch (err) {
                    if (err) {
                        if (err.code == 'ENOENT') return resolve()
                        return reject(err)
                    }
                }
            })
        }
        if (config && config.converse && config.converse.dependencies) {
            this.setSkills(config.converse.dependencies)
            if (done) done()
        }
    }

    async skill(skillName, skillPath = skillName) {
        let _path = skillPath.skill || skillPath
        
        if (_path.hasOwnProperty('default')) _path = _path.default
   
        let dir = _path
        let skill

        if (_.isArray(_path)) {
            for (let skillPath of _path) {
                await this.skill(skillName, skillPath)
            }
            return
        }

        if (_.isString(_path)) {

            let prefix = _path.split(':')
            if (prefix.length > 1) {
                dir = _path = prefix[1]
                prefix = prefix[0]
            }
            else {
                prefix = null
            }

            if (Browser.is() && prefix == 'node') {
                return this
            }
            if (!Browser.is() && prefix == 'browser') {
                return this
            }

            if (!/\//.test(_path)) {
                dir = this.config.pathSkills || 'skills'
                dir += `/${_path}`
            }

            if (Browser.is()) {
                SystemJS.set('conversescript', SystemJS.newModule({
                    Converse
                }))
                if (!dir.endsWith('.js')) dir += '.js'
                skill = await SystemJS.import(dir)
            } else {
                if (dir[0] == '.') {
                    dir = this.parentPath + '/' + dir
                }
                else {
                    dir = '@node/' + dir
                }
                skill = await SystemJS.import(dir)
            }

        } else {
            skill = _path
        }

        if (skill.hasOwnProperty('default')) skill = skill.default

        if (_.isFunction(skill)) {
            const params = skillPath.params || []
            skill = skill.apply(skill, params)
            if (skill.then) {
                skill = await skill
            }
        }

        if (_.isPlainObject(skill)) {
            skill._parentPath = this.parentPath
            skill = new Converse(skill)
        }

        skill.namespace = (this.namespace ? this.namespace + '-' : '') + skillName
        skill.parent = this
        this._skills.set(skillName, skill)
        return this
    }

    async setSkills(obj) {
        for (let name in obj) {
            await this.skill(name, obj[name])
        }
        return this
    }

    getSkill(name) {
        return this._skills.get(name)
    }

    shareFormats() {
        this._shareFormat = true
    }

}

module.exports = Converse
