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
        this.parentPath = this._findParentPath()
        this.openSkills(options.done)
        if (_.isString(options)) {
            options = {
                file: options
            }
        }
        if (options.file) {
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
            this.code(await fs.readFile(this._file, 'utf-8'))
        }
        this._transpiler = new Transpiler(this.script)
        this._obj = this._transpiler.run()
        //console.log(JSON.stringify(this._obj, null, 2))
        this._interpreter = new Interpreter(this._obj, this.users, this)
        return this
    }

    exec(input, userId, output, propagate = {}) {
        return new Promise(async (resolve, reject) => {
            
            await this.open()

            if (!output) {
                if (Browser.is()) {
                    output = userId
                    userId = 'conversescript-user'
                }
                else {
                    throw 'On NodeJS, you must give an identifier to the user. `.exec(input, userId, output)`'
                }
            }

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
                .then(() => {
                    if (output.preUser) {
                        return output.preUser(user, this)
                    }
                })
                .then(() => this.propagateExec(input, userId, output, propagate))
                .then(noExec => propagate.childrenNotExec = !!noExec)
            if (input.type !== 'event') {
                p = p.then(() => this.execNlp(input, userId))
            }
            else {
                p = p.then(() => input)
            }
            p.then(input => {
                resolve(this._interpreter.exec(user, input, output, propagate))
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
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
        let p = Promise.resolve()
        let nlpArray = Object.keys(this._nlp).map(name => {
            return this._nlp[name]
        })
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
                if (nlp.priority && nbIntents > 0) {
                    input.intents = intents 
                    return 'break'
                }
                else {
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

    execFunction(name, params, done, user, { deep, data, execution, level, ins }) {
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
        }
        else {
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
        let config
        if (!Browser.is()) {
            config = await new Promise(async (resolve, reject) => {
                try {
                    const data = await fs.readFile(`${this.parentPath}/package.json`, { encoding: 'utf-8' })
                    resolve(JSON.parse(data))
                }
                catch (err) {
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
        let dir = _path
        let skill

        if (_.isString(_path)) {
            if (!/\//.test(_path)) {
                dir = this.config.pathSkills || 'converse_skills'
                dir += `/${_path}`
            }

            if (Browser.is()) {
                SystemJS.set('conversescript', SystemJS.newModule({ Converse }))
                if (!dir.endsWith('.js')) dir += '.js'
                skill = await SystemJS.import(dir)
            }
            else {
                skill = require(`${this.parentPath}/${dir}`)
            }
        }
        else {
           skill = _path
        }
        
        if (_.isFunction(skill)) {
            skill = skill(skillPath.params)
            if (skill.then) {
                skill = await skill
            }
        }

        if (_.isPlainObject(skill)) {
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

    shareFormats() {
        this._shareFormat = true
    }

}

module.exports = Converse