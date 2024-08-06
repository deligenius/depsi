import { Container } from "./container.js";
import { Router } from "./router.js";
import { ModuleProvider, Provider, Token } from "./type.js";
import type { Express } from "express";

export interface ModuleOptions {
  providers?: ModuleProvider[];
  imports?: Module[];
  routes?: Router[];
}

export class Module {
  private providers: ModuleProvider<any>[];
  private imports: Module[];
  private routes: Router[];
  private container: Container;

  constructor({ providers = [], imports = [], routes = [] }: ModuleOptions) {
    this.providers = providers;
    this.imports = imports;
    this.routes = routes;
    this.container = new Container();
  }

  private _splitProviders(providers: ModuleProvider<any>[]) {
    const globalProviders: Provider<any>[] = [];
    const normalProviders: ModuleProvider<any>[] = [];
    providers.forEach((provider) => {
      const isProviderObj = typeof provider === "object";
      if (isProviderObj && provider.isGlobal) {
        globalProviders.push(provider);
      }
      normalProviders.push(provider);
    });
    return { globalProviders, normalProviders };
  }

  public async register(): Promise<{
    routes: Router[];
    container: Container;
  }> {
    // region global provider
    const { globalProviders, normalProviders } = this._splitProviders(
      this.providers
    );
    // should register global providers first
    if (globalProviders.length > 0) {
      for (const provider of globalProviders) {
        await this.container.registerProvider(provider);
      }
    }

    // region imports modules
    // Register imported submodules recursively
    for (const submodule of this.imports) {
      // need to get subRoutes and also register providers
      const { routes: subRoutes, container: subContainer } =
        await submodule.register();

      this.routes.push(...subRoutes);

      // bring instance from subContainer to this container
      this.container.mergeContainer(subContainer);
    }

    // region normal providers
    for (const provider of normalProviders) {
      await this.container.auto_register(provider);
    }

    return {
      routes: this.routes,
      container: this.container,
    };
  }

  public resolve<T>(token: Token<T>): Token<T> extends string ? any : T {
    return this.container.resolveToken(token);
  }
}

export async function initializeModule(app: Express, rootModule: Module) {
  const { routes } = await rootModule.register();

  routes.forEach((route) => {
    app.use(route.prefix, route);
  });

  return app;
}
