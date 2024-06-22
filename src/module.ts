import { Constructor, Container } from "./container.js";
import { DynamicModule } from "./dynamicModule.js";
import { Router } from "./router.js";

export interface ModuleOptions {
  providers?: Constructor<any>[];
  imports?: (Module | DynamicModule)[];
  routes?: Router[];
}

export class Module {
  private providers: Constructor<any>[];
  private imports: (Module | DynamicModule)[];
  private routes: Router[];

  constructor({ providers = [], imports = [], routes = [] }: ModuleOptions) {
    this.providers = providers;
    this.imports = imports;
    this.routes = routes;
  }

  async register(): Promise<Router[]> {
    // Register imported submodules recursively
    for (const submodule of this.imports) {
      const subRoutes = await submodule.register();
      this.routes.push(...subRoutes);
    }

    // Register providers
    for (const provider of this.providers) {
      await Container.auto_register(provider);
    }

    return this.routes;
  }

  resolve<T>(cls: Constructor<T> | string): T {
    return Container.resolve(cls);
  }
}
