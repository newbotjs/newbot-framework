import { User } from './user'

type Converse = {};

type Data = any;

type NlpFunction = {
  [key: string]: (
    text?: string,
    userId?: string | number,
    converse?: Converse
  ) => boolean | { [key: string]: any };
};

export interface Skill {
  /** code is */
  code?: string;
  file?: string;
  /** 
   * List of functions that can be used in the conversational script
   * 
   * ```js
   * {
   *    functions: {
   *        foo() {
   *           
   *        }
   *    }
   * }
   * 
   * ```
   * 
   * The function can return any value or even a promise
   * 
   * The conversational script is composed as follows
   * 
   * ```ts
   * @Event('start')
   * start() {
   *    ret = foo()
   * }
   * ```
   * 
   * https://newbot.io/en/docs/avanced/function.html
   * */
  functions?: { [key: string]: (...args: any[]) => any | Promise<any> };
  skills?: {
    [key: string]:
      | Skill
      | Promise<Skill>
      | {
          skill: Skill | Promise<Skill>;
          params?: any[];
        }
      | Array<{
          skill: Skill | Promise<Skill>;
          params?: any[];
          condition: (data?: Data, user?: User) => boolean;
        }>;
  };
  constants?: { [key: string]: any };
  formats?: {
    [key: string]: (text?: string, params?: any, data?: Data) => any;
  };
  shareFormats?: boolean;
  shareNlp?: boolean;
  propagateNlp?: boolean | string | string[];
  propagateFormats?: boolean,
  languages?: {
    packages: { [key: string]: JSON };
  };
  nlp?: NlpFunction | { [key: string]: NlpFunction };
  canActivated?: string[]
}
