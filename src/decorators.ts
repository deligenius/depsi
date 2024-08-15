import "reflect-metadata";
import type { Constructor, Token } from "./type.js";

export const Metadata = {
	INJECT_TOKEN_METADATA_KEY: Symbol.for("custom:inject_token"),
	INJECTABLE_METADATA_KEY: Symbol.for("custom:injectable"),
};

export type InjectableMetadata = {
	injectable: boolean;
};

// region @Injectable
export function Injectable(jsClass?: Constructor) {
	if (jsClass) {
		jsClass.prototype[Metadata.INJECTABLE_METADATA_KEY] = {
			injectable: true,
		};
	}
	return (target: object) => {
		Reflect.defineMetadata(
			Metadata.INJECTABLE_METADATA_KEY,
			{
				injectable: true,
			} satisfies InjectableMetadata,
			target,
		);
	};
}

//region @Inject, for Javascript
export type InjectTokenMetadata<T = unknown> = {
	token: Token<T>;
	parameterIndex: number;
};

export function Inject(token: Token<unknown>) {
	return (target: object, propertyKey: undefined, parameterIndex: number) => {
		const existingMetadata: InjectTokenMetadata[] =
			Reflect.getMetadata(Metadata.INJECT_TOKEN_METADATA_KEY, target) || [];
		// we will have to replace the token with an instance
		existingMetadata.push({ token, parameterIndex });
		Reflect.defineMetadata(
			Metadata.INJECT_TOKEN_METADATA_KEY,
			existingMetadata,
			target,
		);
	};
}
