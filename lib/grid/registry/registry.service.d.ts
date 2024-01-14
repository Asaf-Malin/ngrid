import { Subject, Observable } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { PblNgridMultiRegistryMap, PblNgridSingleRegistryMap, RegistryChangedEvent } from '@pebula/ngrid/core';
import * as i0 from "@angular/core";
/**
 * A Registry for templates of table parts.
 *
 * The registry is hierarchical, where each instance of a registry has a parent which allows cascading templates.
 * The hierarchy is manged by angular DI.
 *
 * > The root registry does not have a parent.
 *
 * Each instance of a registry (including root) is a hierarchy by itself, composed of 2 internal levels.
 * The first level (L1 below) is used for fixed templates, the second level (L2 below) is used for dynamic templates.
 *
 * - Root Registry
 *   - Child Registry
 *     - ChildOfChild Registry
 *
 * In the example above there are 3 registries: Root, Child and ChildOfChild.
 *
 * When searching for a template in `ChildOfChild` it will search in the following order (top to bottom):
 *   - ChildOfChild
 *   - Child
 *   - Root
 *
 * If a registry does not contain the template the search will move to the next one.
 */
export declare class PblNgridRegistryService implements OnDestroy {
    private _parent?;
    readonly changes: Observable<RegistryChangedEvent[]>;
    get parent(): PblNgridRegistryService | undefined;
    protected root: PblNgridRegistryService & {
        bufferedData?: RegistryChangedEvent[];
    };
    protected _multi: {
        [K in keyof PblNgridMultiRegistryMap]: Array<PblNgridMultiRegistryMap[K]>;
    };
    protected _multiDefaults: PblNgridMultiRegistryMap;
    protected _singles: PblNgridSingleRegistryMap;
    protected readonly changes$: Subject<RegistryChangedEvent[]>;
    constructor(_parent?: PblNgridRegistryService);
    getRoot(): PblNgridRegistryService;
    /**
     * Returns the registered value for the single `kind`.
     * If not found will try to search the parent.
     */
    getSingle<P extends keyof PblNgridSingleRegistryMap>(kind: P): PblNgridSingleRegistryMap[P] | undefined;
    setSingle<P extends keyof PblNgridSingleRegistryMap>(kind: P, value: PblNgridSingleRegistryMap[P] | undefined): void;
    /**
     * Returns the registered default value for the multi `kind`.
     * If not found will try to search the parent.
     */
    getMultiDefault<P extends keyof PblNgridMultiRegistryMap>(kind: P): PblNgridMultiRegistryMap[P] | undefined;
    setMultiDefault<P extends keyof PblNgridMultiRegistryMap>(kind: P, value: PblNgridMultiRegistryMap[P] | undefined): void;
    /**
     * Returns the registered values for the multi `kind`.
     * If not found WILL NOT search the parent.
     */
    getMulti<T extends keyof PblNgridMultiRegistryMap>(kind: T): Array<PblNgridMultiRegistryMap[T]> | undefined;
    addMulti<T extends keyof PblNgridMultiRegistryMap>(kind: T, cellDef: PblNgridMultiRegistryMap[T]): void;
    removeMulti<T extends keyof PblNgridMultiRegistryMap>(kind: T, cellDef: PblNgridMultiRegistryMap[T]): void;
    /**
     * Iterate over all multi-registry value of the provided `kind` ascending order, starting from the last ancestor (this registry) up to
     * the root parent.
     *
     * Each time a collection for the `kind` is found the handler is invoked and then repeating the process on the parent.
     * If the `kind` does not exist the handler is not called moving on to the next parent.
     *
     * To bail out (stop the process and don't iterate to the next parent), return true from the handler.
     *
     * @returns The number of times that handler was invoked, i.e 0 means no matches.
     */
    forMulti<T extends keyof PblNgridMultiRegistryMap>(kind: T, handler: ((values: Array<PblNgridMultiRegistryMap[T]>) => boolean | void)): number;
    ngOnDestroy(): void;
    /**
     * Delay all notifications sent through `changes` and buffer then until next call to `bufferEnd()`.
     * When `bufferEnd()` is called it will flush all changes.
     *
     * > It's important to note that buffering does not freeze the registry, adding and removing templates will change the
     * registry and will effect queries. Buffering block the `changes` event stream and nothing more.
     */
    bufferStart(): void;
    bufferEnd(): void;
    private emitChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRegistryService, [{ optional: true; skipSelf: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridRegistryService>;
}
