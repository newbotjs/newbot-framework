import { User } from './user'

type Output = {
    output: OutputFunction,
    data?: any,
    preUser?: (user: User, newbot?: INewBot) => any
}

type OutputFunction = (output: any, done: Function) => any

export interface INewBot {
    exec?(message: string, userId: string|number, options?: OutputFunction|Output)
    exec?(message: string, options?: OutputFunction|Output)
    event?(name: string)
    event?(name: string, data: any)
}