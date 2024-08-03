export type Constructor<T> = new (...args: any[]) => T;

export type Token<T = any> = Constructor<T> | string;

export type Provider<T = any> = {
  token: Token<T>;
  useValue?: any | (() => any | Promise<any>);
}

export type ModuleProvider<T = any> = Provider | Constructor<T>