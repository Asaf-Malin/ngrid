import { Observable } from 'rxjs';
import { Injector } from '@angular/core';
import { PblNgridEvents, PblNgridEventEmitter } from '@pebula/ngrid/core';
import { _PblNgridComponent } from '../tokens';
import { PblNgridPluginExtension, PblNgridPluginExtensionFactories } from './types';
import { PblNgridExtensionApi } from './grid-ext-api';
/** @internal */
export declare class PblNgridPluginContext<T = any> implements PblNgridEventEmitter {
    static create<T = any>(injector: Injector, extApi: PblNgridExtensionApi): {
        plugin: PblNgridPluginContext<T>;
        init: () => void;
    };
    grid: _PblNgridComponent;
    injector: Injector;
    extApi: PblNgridExtensionApi;
    controller: PblNgridPluginController<T>;
    readonly events: Observable<PblNgridEvents>;
    private _events;
    private constructor();
    emitEvent(event: PblNgridEvents): void;
    destroy(): void;
}
export declare class PblNgridPluginController<T = any> {
    private context;
    static readonly created: Observable<{
        table: import("@pebula/ngrid").PblNgridComponent<any>;
        controller: PblNgridPluginController<any>;
    }>;
    static onCreatedSafe(token: any, fn: (grid: _PblNgridComponent, controller: PblNgridPluginController<any>) => void): void;
    static find<T = any>(grid: _PblNgridComponent<T>): PblNgridPluginController<T> | undefined;
    static findPlugin<P extends keyof PblNgridPluginExtension, T = any>(grid: _PblNgridComponent<T>, name: P): PblNgridPluginExtension[P] | undefined;
    get injector(): Injector;
    readonly extApi: PblNgridExtensionApi;
    readonly events: Observable<PblNgridEvents>;
    private readonly grid;
    private readonly plugins;
    constructor(context: PblNgridPluginContext);
    /**
     * A Simple shortcut to the `onInit` event which is fired once.
     * If the grid has already been init the event will fire immediately, otherwise it will emit once when `onInit`
     * occurs and cleanup the subscription.
     *
     * The boolean value emitted reflects the state it was emitted on.
     * false - grid was already initialized
     * true - grid was just initialized
     *
     * In other words, if you get false, it means you called this method when the grid was already initialized.
     */
    onInit(): Observable<boolean>;
    hasPlugin<P extends keyof PblNgridPluginExtension>(name: P): boolean;
    getPlugin<P extends keyof PblNgridPluginExtension>(name: P): PblNgridPluginExtension[P] | undefined;
    ensurePlugin<P extends keyof PblNgridPluginExtension>(name: P): PblNgridPluginExtension[P];
    /**
     * Registers the `plugin` with the `name` with the `table`
     */
    setPlugin<P extends keyof PblNgridPluginExtension>(name: P, plugin: PblNgridPluginExtension[P]): (table: _PblNgridComponent<any>) => void;
    /**
     * Checks if the grid is declared in a location within the DI that has access to an ancestor token.
     * For example, if we want to use `createPlugin()` only if the grid is defined in a module that has a specific parent module imported into it
     * we will use `hasAncestor(MyParentModule)`
     */
    hasAncestor(token: any): boolean;
    createPlugin<P extends keyof PblNgridPluginExtensionFactories>(name: P): PblNgridPluginExtension[P];
    createPlugin<P extends keyof PblNgridPluginExtension>(name: P): PblNgridPluginExtension[P];
}
