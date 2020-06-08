const _ = require('./utils/lodash')
const path = require('path')
const Languages = require('languages-js')
//const stack = require('callsite')

const User = require('./user')
const Transpiler = require('./transpiler/lexer')
const Interpreter = require('./interpreter')
const Functions = require('./api')
const Debug = require('./debug')
const Nlp = require('./nlp')

const fs = require('./utils/fs')
const isPromise = require('./utils/is-promise')
const Browser = require('./utils/browser')
const newbotPackage = require('../newbot.json')

class Converse {

    constructor(options = {}, {
        loadSkills,
        model,
        modelLangs
    } = {}) {
        this._nlp = {}
        this.config = {}
        this._format = {}
        this._constants = {}
        this._conditions = {}
        this._canActivated = []
        this._propagateNlp = null
        this._dbHook = {}
        this._hooks = {}
        this.model = model
        this.modelLangs = modelLangs
        this._originNlpObject = {}
        this.script = ''
        this._obj = []
        this._skills = new Map()
        this._users = new Map()
        this.namespace = 'default'
        this._functions = Functions
        this.lang = Languages.instance()
        const hasOptions = Object.keys(options)
        if (hasOptions.length > 0) {
            this.loadOptions(options, loadSkills)
        }

    }

    static get version() {
        return newbotPackage.version
    }

    /**
     * Newbot.loader({
     *      systemjs: 
     * })
     */ 
    static loader({
        systemjs
    }) {
        systemjs.config({
            meta: {
                "*.converse": {
                    loader: __dirname + '/../loader/converse-loader.js'
                }
            }
        })
        Converse.SystemJS = systemjs
    }

    async loadNativeNlp() {
        this.nlp('__native__', await Converse.nlpManager(this.model, this.modelLangs))
        return this
    }

    async setModelNlp(model, langs, _isAutoLoad) {
        this.model = model
        this.modelLangs = langs
        await this.loadNativeNlp(true)
        this.propagateNlp('__native__')
        if (!_isAutoLoad) {
            // reload skills for propagate NLP
            this._skills.clear()
            await this.setSkills(this.options.skills)
        }
    }

    async loadOptions(options, loadSkills = true) {
        this.options = options
        if (_.isString(options)) {
            options = {
                file: options
            }
        }
        if (options.file) {
            this.file(options.file)
        }
        if (options.code) {
            this.code(options.code)
        }
        if (options.languages) {
            this.configure({
                languages: options.languages
            })
        }
        if (options.mergeMultiFormats) {
            this.configure({
                mergeMultiFormats: options.mergeMultiFormats
            })
        }
        if (options.nlp) {
            for (let key in options.nlp) {
                this.nlp(key, options.nlp[key])
            }
        }
        if (!this.parent && this.model) {
           await this.setModelNlp(this.model, this.modelLangs, true)
        }
        if (options.conditions) {
            this.conditions(options.conditions)
        }
        if (options.functions) {
            this.functions(options.functions)
        }
        if (options.constants) {
            this.constants(options.constants)
        }
        if (options.formats) {
            for (let key in options.formats) {
                this.format(key, options.formats[key])
            }
        }
        if (options.canActivated) {
            this.canActivated(options.canActivated)
        }
        if (options.shareFormats) {
            this.shareFormats()
        }
        if (options.shareNlp) {
            this.shareNlp()
        }
        if (options.propagateNlp) {
            this.propagateNlp(options.propagateNlp)
        }
        if (options.propagateFormats) {
            this.propagateFormats()
        }
        if (loadSkills && options.skills) {
            await this.loadSkills()
        }
        this.load()
    }

    async loadSkills() {
        await this.setSkills(this.options.skills)
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
        if (str.code) {
            this.script = str.code
        } else {
            this.script = str
        }
        if (str.compiled || _.isArray(this.script)) {
            this._compiled = str.compiled || this.script
        }
        return this
    }

    async open() {
        if (this._file) {
            if (Converse.SystemJS) this.code(await Converse.SystemJS.import(this._file))
        }
        if (!this.script) {
            this._obj = []
        } else if (this._compiled) {
            this._obj = _.merge([], this._compiled)
        } else {
            this._transpiler = new Transpiler(this.script, this.namespace)
            this._obj = this._transpiler.run()
        }
        // TODO: 
        this._interpreter = new Interpreter(this._obj, this.users, this)
        return this
    }

    continue(data, user, output) {
        return this.exec({
            type: 'continue',
            data
        }, user, output)
    }

    exec(input, userId, output, propagate = {
        globalNoExec: true
    }) {
        let user
        let noExecChildren

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
        user.resetHistory()

        if (input.type == 'continue') {
            user.setMagicVariable('event', input.data)
        }

        let p = this.open()
            .then(() => {
                if (output.preUser) {
                    return output.preUser(user, this)
                }
            })
            .then(() => {
                if (!this.parent && output.debug) {
                    output.debug('begin', {
                        user,
                        data: output.data
                    })
                }
            })
            .then(() => this.propagateExec(input, userId, output, propagate))
            .then(noExec => {
                noExecChildren = !!noExec
                noExecChildren = noExecChildren || (!noExecChildren && user.getAddress(this.namespace))
            })
        if (input.type !== 'event' && input.type !== 'continue') {
            p = p.then(() => {
                if (noExecChildren) {
                    return this.execNlp(input, userId)
                }
                return input
            })
        } else {
            p = p.then(() => input)
        }
        
        p = p.then(async input => {
            let ret = {}
            if (noExecChildren) {
                ret = await this._interpreter.exec(user, input, output, propagate)
                if (ret) propagate.globalNoExec &= ret.nothing
            }
            return ret
        })
        .then((ret) => {
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
                /* if (this.debug) {
                     const debug = new Debug(this.script, user._history)
                     debug.display()
                 }*/
                if (output.debug) {
                    output.debug('finish', {
                        nothing: propagate.globalNoExec,
                        user,
                        data: output.data
                    })
                }
                user._nlpCache = {}
            }
            return ret
        })

        return p
    }

    propagateExec(input, userId, output, propagate) {
        const promises = []
        const user = this._users.get(userId)
        let options = _.clone(output)
        let noExec = true
        let p = Promise.resolve()

        this._skills.forEach((skills) => {
            if (!_.isArray(skills)) {
                skills = [skills]
            }
            for (let i=0 ; i < skills.length ; i++) {
                let skill = skills[i]
                p = p.then((ignore = false) => new Promise((resolve, reject) => {
                    if (ignore) {
                        return resolve(ignore)
                    }
                    let skillPromise = Promise.resolve()
                    if (this._canActivated.length > 0 && !this._canActivated.includes(skill.name)) {
                        skill._canActivated = [...this._canActivated, ...skill._canActivated]
                        for (let name of this._canActivated) {
                            if (this.name == name) continue
                            // TODO: Prohibition after execution to modify skills...
                            skill._skills.set(name, this._skills.get(name))
                        }
                    }
                    if (skill._shareFormat) {
                        this._format = _.merge(skill._format, this._format)
                    }
                    skill._users = this._users
                    if (skill._condition) {
                        skillPromise = skill._condition(options.data, user)
                        if (!isPromise(skillPromise)) {
                            skillPromise = Promise.resolve(skillPromise)
                        }
                    }
                    skillPromise.then((mustExecute) => {
                        user.setRealSkill(skill.name, i)
                        if (mustExecute !== false) {
                            return skill.exec(input, userId, options, propagate).then((ret = {}) => {
                                noExec &= ret.noExec
                                // If the skill condition explicitly returns true, then ignore the other skills (for a skill array)
                                resolve(mustExecute === true)
                            }).catch(reject)
                        } else {
                            resolve(false)
                        }
                    })
                }))
            }
        })
        return p.then(() => noExec)
    }

    skills() {
        return this._skills
    }

    execNlp(input, userId) {
        input.intents = {}
        const user = this.users.get(userId)
        let p = Promise.resolve()
        let nlpArray = Object.keys(this._nlp).map(name => this._nlp[name])
        nlpArray = nlpArray.sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0)
        })
        for (let nlp of nlpArray) {
            const originNlpName = nlp.uuid
            p = p.then((state) => {
                if (state == 'break') return
                const nlpCache = user._nlpCache[nlp.name]
                if (nlpCache && Object.is(nlpCache.object, this._originNlpObject[originNlpName])) {
                    return nlpCache.result
                }
                return nlp.exec(input.text, userId, this)
            }).then((intents) => {
                if (!intents) return
                user._nlpCache[nlp.name] = {
                    object: this._originNlpObject[originNlpName],
                    result: intents
                }
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

        const converseParams = {
            users: this.users,
            user,
            data,
            execution,
            level,
            ins
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
            this._functions[name].converse = converseParams
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
        const uuid = Symbol()
        this._originNlpObject[uuid] = intents
        if (!this._nlp[name]) {
            this._nlp[name] = new Nlp(name, this, {
                ...options,
                uuid
            })
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
        let {
            packages,
            default: _default
        } = this.config.languages
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
            let id = json.id || json._id
            let user = new User(id).fromJson(json)
            this.users.set(id, user)
        }
    }

    use(hooks) {
        this._hooks = hooks
    }

    // deprecated
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
            for (let skillObj of _path) {
                await this.skill(skillName, skillObj)
            }
            return this
        }

        if (_.isString(_path)) {
            skill = {
                code: _path
            }
        } else {
            skill = _path
        }

        if (skill.hasOwnProperty('default')) skill = skill.default

        if (_.isFunction(skill)) {
            const params = skillPath.params || []
            if (_.isPlainObject(params)) {
                skill = skill.call(skill, params)
            } else {
                skill = skill.apply(skill, params)
            }
            if (skill.then) {
                skill = await skill
            }
        }

        let childrenSkills = skill.skills

        if (_.isPlainObject(skill)) {
            //skill._parentPath = this.parentPath
            if (this._propagateNlp) {
                skill.propagateNlp = this._propagateNlp
            }
            if (this._propagateFormats) {
                skill.propagateFormats = true
            }
            skill = new Converse(skill, {
                loadSkills: false
            })
        }

        skill.namespace = (this.namespace ? this.namespace + '-' : '') + skillName
        skill.parent = this
        skill.name = skillName
        skill._condition = skillPath.condition
        if (skill._shareNlp) {
            this._nlp = _.merge(this._nlp, skill._nlp)
            skill._nlp = {}
        }
        if (this._propagateNlp) {
            if (!this.allPropagate) {
                let obj = {}
                for (let name of this._propagateNlp) {
                    obj[name] = this._nlp[name]
                }
                skill._nlp = _.merge(obj, skill._nlp)
            } else {
                skill._nlp = _.merge(this._nlp, skill._nlp)
            }
            skill._originNlpObject = _.merge(this._originNlpObject, skill._originNlpObject)
        }
        if (this._propagateFormats) {
            skill._format = _.merge(this._format, skill._format)
        }
        if (this._skills.has(skillName)) {
            const currentSkills = this._skills.get(skillName)
            if (_.isArray(currentSkills)) {
                skill = [...currentSkills, skill]
            } else {
                skill = [currentSkills, skill]
            }
        }
        this._skills.set(skillName, skill)
        if (childrenSkills) await skill.setSkills(childrenSkills)
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

    shareNlp() {
        this._shareNlp = true
    }

    propagateNlp(nlpName) {
        if (!this._propagateNlp) this._propagateNlp = []
        if (_.isArray(nlpName)) {
            this._propagateNlp = [...this._propagateNlp, ...nlpName]
            return this
        }
        if (_.isString(nlpName)) {
            this._propagateNlp.push(nlpName)
            return this
        }
        if (nlpName === true) {
            this._propagateNlp = [...this._propagateNlp, ...Object.keys(this._nlp)]
            return this
        }
        return this
    }

    get allPropagate() {
        return this._propagateNlp.length == 0
    }

    propagateFormats() {
        this._propagateFormats = true
    }

    conditions(obj) {
        this._conditions = _.merge(this._conditions, obj)
    }

    constants(obj) {
        this._constants = _.merge(this._constants, obj)
    }

    /**
     * @param {Array}
     */
    canActivated(array) {
        this._canActivated = array
    }

    getAllIntents() {
        let intents = []
        let p = this.open()
            .then(() => {
                intents = this._interpreter.decorators.get('Intent')
                intents = intents.map(intent => {
                    intent._skill = this
                    return intent
                })
            })
        this._skills.forEach((skills) => {
            if (!_.isArray(skills)) {
                skills = [skills]
            }
            for (let skill of skills) {
                p = p
                    .then(() => skill.getAllIntents())
                    .then(skillIntents => {
                        return intents = intents.concat(skillIntents)
                    })
            }
        })
        return p.then(() => intents)
    }
}

module.exports = Converse
