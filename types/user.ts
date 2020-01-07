export type User = {
  getMagicVariable(name: string): any;
  setMagicVariable(name: string, value: any): void;
  getVariable(name: string): any;
  setVariable(name: string, value: any): void;
  setLang(lang: string): void;
  getLang(): string;
  toJson(): any;
  fromJson(): JSON;
};
