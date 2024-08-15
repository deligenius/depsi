export type Constructor<T = unknown> = new (...args: unknown[]) => T;

export type Token<T = unknown> = Constructor<T> | string;

export type Provider<T> = {
	token: Token<T>;
	useValue?: unknown | (() => unknown | Promise<unknown>);
};

export type ModuleProvider<T> = Provider<T> | Constructor<T>;
