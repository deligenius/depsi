import { Container } from "./container.js";
import { Module, ModuleOptions } from "./module.js";

export interface DynamicModuleOptions {
  token: string;
  getProvider: () => any | (() => Promise<any>);
  imports?: (Module | DynamicModule)[];
}

export class DynamicModule {
  private token: string;
  private imports: (Module | DynamicModule)[];
  private getProvider: () => any | (() => Promise<any>);

  constructor({ token, imports = [], getProvider }: DynamicModuleOptions) {
    this.token = token;
    this.imports = imports;
    this.getProvider = getProvider;
  }

  async register(): Promise<[]> {
    // Register imported submodules recursively
    for (const submodule of this.imports) {
      await submodule.register();
    }

    // Register provider
    await Container.register(this.token, this.getProvider);

    return [];
  }
}
