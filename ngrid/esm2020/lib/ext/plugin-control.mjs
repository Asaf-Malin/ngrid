import { of, Subject } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { InjectFlags } from '@angular/core';
import { ON_INIT } from '@asafmalin/ngrid/core';
import { PLUGIN_STORE } from './grid-plugin';
const NGRID_PLUGIN_CONTEXT = new WeakMap();
const CREATED$ = new Subject();
const REGISTERED_TO_CREATE = new WeakSet();
/** @internal */
export class PblNgridPluginContext {
    constructor() {
        this._events = new Subject();
        this.events = this._events.asObservable();
    }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static create(injector, extApi) {
        if (NGRID_PLUGIN_CONTEXT.has(extApi.grid)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Grid instance is already registered for extensions.`);
            }
            return;
        }
        const instance = new PblNgridPluginContext();
        NGRID_PLUGIN_CONTEXT.set(extApi.grid, instance);
        instance.grid = extApi.grid;
        instance.injector = injector;
        instance.extApi = extApi;
        instance.controller = new PblNgridPluginController(instance);
        return {
            plugin: instance,
            init: () => CREATED$.next({ table: instance.grid, controller: instance.controller }),
        };
    }
    emitEvent(event) {
        this._events.next(event);
    }
    destroy() {
        if (!NGRID_PLUGIN_CONTEXT.has(this.grid)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Grid is not registered.`);
            }
            return;
        }
        this._events.complete();
        NGRID_PLUGIN_CONTEXT.delete(this.grid);
    }
}
export class PblNgridPluginController {
    constructor(context) {
        this.context = context;
        this.plugins = new Map();
        this.grid = context.grid;
        this.extApi = context.extApi;
        this.events = context.events;
    }
    static onCreatedSafe(token, fn) {
        if (!REGISTERED_TO_CREATE.has(token)) {
            REGISTERED_TO_CREATE.add(token);
            PblNgridPluginController.created.subscribe(event => fn(event.table, event.controller));
        }
    }
    static find(grid) {
        const context = NGRID_PLUGIN_CONTEXT.get(grid);
        if (context) {
            return context.controller;
        }
    }
    static findPlugin(grid, name) {
        return PblNgridPluginController.find(grid)?.getPlugin(name);
    }
    get injector() { return this.context.injector; }
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
    onInit() {
        return this.grid.isInit ? of(false) : this.events.pipe(ON_INIT, mapTo(true));
    }
    hasPlugin(name) {
        return this.plugins.has(name);
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    ensurePlugin(name) {
        return this.getPlugin(name) || this.createPlugin(name);
    }
    /**
     * Registers the `plugin` with the `name` with the `table`
     */
    setPlugin(name, plugin) {
        if (!PLUGIN_STORE.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Unknown plugin ${name}.`);
            }
            return;
        }
        if (this.plugins.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Plugin ${name} is already registered for this grid.`);
            }
            return;
        }
        this.plugins.set(name, plugin);
        return (tbl) => this.grid === tbl && this.plugins.delete(name);
    }
    /**
     * Checks if the grid is declared in a location within the DI that has access to an ancestor token.
     * For example, if we want to use `createPlugin()` only if the grid is defined in a module that has a specific parent module imported into it
     * we will use `hasAncestor(MyParentModule)`
     */
    hasAncestor(token) {
        return !!this.injector.get(token, null, InjectFlags.Optional);
    }
    createPlugin(name) {
        if (!PLUGIN_STORE.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Unknown plugin ${name}.`);
            }
            return;
        }
        const metadata = PLUGIN_STORE.get(name);
        const methodName = metadata.factory;
        if (!methodName) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid plugin configuration for ${name}, no factory metadata.`);
            }
            return;
        }
        else if (typeof metadata.target[methodName] !== 'function') {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid plugin configuration for ${name}, factory metadata does not point to a function.`);
            }
            return;
        }
        return metadata.target[methodName](this.grid, this.context.injector);
    }
}
PblNgridPluginController.created = CREATED$.asObservable();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLWNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZXh0L3BsdWdpbi1jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUsV0FBVyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBRXRELE9BQU8sRUFBa0IsT0FBTyxFQUF3QixNQUFNLG9CQUFvQixDQUFDO0FBUW5GLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFN0MsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBNkMsQ0FBQztBQUV0RixNQUFNLFFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBNEUsQ0FBQztBQUV6RyxNQUFNLG9CQUFvQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7QUFFaEQsZ0JBQWdCO0FBQ2hCLE1BQU0sT0FBTyxxQkFBcUI7SUFvQ2hDO1FBRlEsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFrQixDQUFDO1FBRzlDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBcENELGdGQUFnRjtJQUNoRix3SUFBd0k7SUFDeEksMEZBQTBGO0lBQzFGLHlHQUF5RztJQUN6RyxNQUFNLENBQUMsTUFBTSxDQUFVLFFBQWtCLEVBQUUsTUFBNEI7UUFDckUsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRTtnQkFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO2FBQ3hF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RSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7O0FBaEhlLGdDQUFPLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcFRvIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgSW5qZWN0RmxhZ3MsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFBibE5ncmlkRXZlbnRzLCBPTl9JTklULCBQYmxOZ3JpZEV2ZW50RW1pdHRlciB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBfUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi90b2tlbnMnO1xuaW1wb3J0IHtcbiAgUGJsTmdyaWRQbHVnaW4sXG4gIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uLFxuICBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbkZhY3Rvcmllcyxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEV4dGVuc2lvbkFwaSB9IGZyb20gJy4vZ3JpZC1leHQtYXBpJztcbmltcG9ydCB7IFBMVUdJTl9TVE9SRSB9IGZyb20gJy4vZ3JpZC1wbHVnaW4nO1xuXG5jb25zdCBOR1JJRF9QTFVHSU5fQ09OVEVYVCA9IG5ldyBXZWFrTWFwPF9QYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250ZXh0PigpO1xuXG5jb25zdCBDUkVBVEVEJCA9IG5ldyBTdWJqZWN0PHsgdGFibGU6IF9QYmxOZ3JpZENvbXBvbmVudCwgY29udHJvbGxlcjogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyPGFueT4gfT4oKTtcblxuY29uc3QgUkVHSVNURVJFRF9UT19DUkVBVEUgPSBuZXcgV2Vha1NldDxhbnk+KCk7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFBsdWdpbkNvbnRleHQ8VCA9IGFueT4gaW1wbGVtZW50cyBQYmxOZ3JpZEV2ZW50RW1pdHRlciB7XG5cbiAgLy8gd29ya2Fyb3VuZCwgd2UgbmVlZCBhIHBhcmFtZXRlci1sZXNzIGNvbnN0cnVjdG9yIHNpbmNlIEBuZ3Rvb2xzL3dlYnBhY2tAOC4wLjRcbiAgLy8gTm9uIEBJbmplY3RhYmxlIGNsYXNzZXMgYXJlIG5vdyBnZXR0aW5nIGFkZGRlZCB3aXRoIGhhcmQgcmVmZXJlbmNlIHRvIHRoZSBjdG9yIHBhcmFtcyB3aGljaCBhdCB0aGUgY2xhc3MgY3JlYXRpb24gcG9pbnQgYXJlIHVuZGVmaW5lZFxuICAvLyBmb3J3YXJkUmVmKCkgd2lsbCBub3QgaGVscCBzaW5jZSBpdCdzIG5vdCBpbmplY3QgYnkgYW5ndWxhciwgd2UgaW5zdGFudGlhdGUgdGhlIGNsYXNzLi5cbiAgLy8gcHJvYmFibHkgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2NvbW1pdC82MzkxOTg0OTk5NzNlMGY0MzdmMDU5YjNjOTMzYzcyYzczM2Q5M2Q4XG4gIHN0YXRpYyBjcmVhdGU8VCA9IGFueT4oaW5qZWN0b3I6IEluamVjdG9yLCBleHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpKSB7XG4gICAgaWYgKE5HUklEX1BMVUdJTl9DT05URVhULmhhcyhleHRBcGkuZ3JpZCkpIHtcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHcmlkIGluc3RhbmNlIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCBmb3IgZXh0ZW5zaW9ucy5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBQYmxOZ3JpZFBsdWdpbkNvbnRleHQ8VD4oKTtcbiAgICBOR1JJRF9QTFVHSU5fQ09OVEVYVC5zZXQoZXh0QXBpLmdyaWQsIGluc3RhbmNlKTtcblxuICAgIGluc3RhbmNlLmdyaWQgPSBleHRBcGkuZ3JpZDtcbiAgICBpbnN0YW5jZS5pbmplY3RvciA9IGluamVjdG9yO1xuICAgIGluc3RhbmNlLmV4dEFwaSA9IGV4dEFwaTtcblxuICAgIGluc3RhbmNlLmNvbnRyb2xsZXIgPSBuZXcgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyPFQ+KGluc3RhbmNlKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwbHVnaW46IGluc3RhbmNlLFxuICAgICAgaW5pdDogKCkgPT4gQ1JFQVRFRCQubmV4dCh7IHRhYmxlOiBpbnN0YW5jZS5ncmlkLCBjb250cm9sbGVyOiBpbnN0YW5jZS5jb250cm9sbGVyIH0pLFxuICAgIH07XG4gIH1cblxuICBncmlkOiBfUGJsTmdyaWRDb21wb25lbnQ7XG4gIGluamVjdG9yOiBJbmplY3RvcjtcbiAgZXh0QXBpOiBQYmxOZ3JpZEV4dGVuc2lvbkFwaTtcbiAgY29udHJvbGxlcjogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyPFQ+O1xuICByZWFkb25seSBldmVudHM6IE9ic2VydmFibGU8UGJsTmdyaWRFdmVudHM+O1xuICBwcml2YXRlIF9ldmVudHMgPSBuZXcgU3ViamVjdDxQYmxOZ3JpZEV2ZW50cz4oKTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5fZXZlbnRzLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZW1pdEV2ZW50KGV2ZW50OiBQYmxOZ3JpZEV2ZW50cyk6IHZvaWQge1xuICAgIHRoaXMuX2V2ZW50cy5uZXh0KGV2ZW50KTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCAge1xuICAgIGlmICghTkdSSURfUExVR0lOX0NPTlRFWFQuaGFzKHRoaXMuZ3JpZCkpIHtcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHcmlkIGlzIG5vdCByZWdpc3RlcmVkLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudHMuY29tcGxldGUoKTtcbiAgICBOR1JJRF9QTFVHSU5fQ09OVEVYVC5kZWxldGUodGhpcy5ncmlkKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyPFQgPSBhbnk+IHtcblxuICBzdGF0aWMgcmVhZG9ubHkgY3JlYXRlZCA9IENSRUFURUQkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIHN0YXRpYyBvbkNyZWF0ZWRTYWZlKHRva2VuOiBhbnksIGZuOiAoZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50LCBjb250cm9sbGVyOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXI8YW55PikgPT4gdm9pZCkge1xuICAgIGlmICghUkVHSVNURVJFRF9UT19DUkVBVEUuaGFzKHRva2VuKSkge1xuICAgICAgUkVHSVNURVJFRF9UT19DUkVBVEUuYWRkKHRva2VuKTtcbiAgICAgIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5jcmVhdGVkLnN1YnNjcmliZSggZXZlbnQgPT4gZm4oZXZlbnQudGFibGUsIGV2ZW50LmNvbnRyb2xsZXIpKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZmluZDxUID0gYW55PihncmlkOiBfUGJsTmdyaWRDb21wb25lbnQ8VD4pOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXI8VD4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSBOR1JJRF9QTFVHSU5fQ09OVEVYVC5nZXQoZ3JpZCk7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBjb250ZXh0LmNvbnRyb2xsZXI7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGZpbmRQbHVnaW48UCBleHRlbmRzIGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uLCBUID0gYW55PihncmlkOiBfUGJsTmdyaWRDb21wb25lbnQ8VD4sIG5hbWU6IFApOiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbltQXSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKGdyaWQpPy5nZXRQbHVnaW4obmFtZSk7XG4gIH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5jb250ZXh0LmluamVjdG9yOyB9XG5cbiAgcmVhZG9ubHkgZXh0QXBpOiBQYmxOZ3JpZEV4dGVuc2lvbkFwaVxuICByZWFkb25seSBldmVudHM6IE9ic2VydmFibGU8UGJsTmdyaWRFdmVudHM+O1xuICBwcml2YXRlIHJlYWRvbmx5IGdyaWQ6IF9QYmxOZ3JpZENvbXBvbmVudDxUPlxuICBwcml2YXRlIHJlYWRvbmx5IHBsdWdpbnMgPSBuZXcgTWFwPGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uLCBQYmxOZ3JpZFBsdWdpbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbnRleHQ6IFBibE5ncmlkUGx1Z2luQ29udGV4dCkge1xuICAgIHRoaXMuZ3JpZCA9IGNvbnRleHQuZ3JpZDtcbiAgICB0aGlzLmV4dEFwaSA9IGNvbnRleHQuZXh0QXBpO1xuICAgIHRoaXMuZXZlbnRzID0gY29udGV4dC5ldmVudHM7XG4gIH1cblxuICAvKipcbiAgICogQSBTaW1wbGUgc2hvcnRjdXQgdG8gdGhlIGBvbkluaXRgIGV2ZW50IHdoaWNoIGlzIGZpcmVkIG9uY2UuXG4gICAqIElmIHRoZSBncmlkIGhhcyBhbHJlYWR5IGJlZW4gaW5pdCB0aGUgZXZlbnQgd2lsbCBmaXJlIGltbWVkaWF0ZWx5LCBvdGhlcndpc2UgaXQgd2lsbCBlbWl0IG9uY2Ugd2hlbiBgb25Jbml0YFxuICAgKiBvY2N1cnMgYW5kIGNsZWFudXAgdGhlIHN1YnNjcmlwdGlvbi5cbiAgICpcbiAgICogVGhlIGJvb2xlYW4gdmFsdWUgZW1pdHRlZCByZWZsZWN0cyB0aGUgc3RhdGUgaXQgd2FzIGVtaXR0ZWQgb24uXG4gICAqIGZhbHNlIC0gZ3JpZCB3YXMgYWxyZWFkeSBpbml0aWFsaXplZFxuICAgKiB0cnVlIC0gZ3JpZCB3YXMganVzdCBpbml0aWFsaXplZFxuICAgKlxuICAgKiBJbiBvdGhlciB3b3JkcywgaWYgeW91IGdldCBmYWxzZSwgaXQgbWVhbnMgeW91IGNhbGxlZCB0aGlzIG1ldGhvZCB3aGVuIHRoZSBncmlkIHdhcyBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKi9cbiAgb25Jbml0KCkge1xuICAgIHJldHVybiB0aGlzLmdyaWQuaXNJbml0ID8gb2YoZmFsc2UpIDogdGhpcy5ldmVudHMucGlwZShPTl9JTklULCBtYXBUbyh0cnVlKSk7XG4gIH1cblxuICBoYXNQbHVnaW48UCBleHRlbmRzIGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uPihuYW1lOiBQKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGx1Z2lucy5oYXMobmFtZSk7XG4gIH1cblxuICBnZXRQbHVnaW48UCBleHRlbmRzIGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uPihuYW1lOiBQKTogUGJsTmdyaWRQbHVnaW5FeHRlbnNpb25bUF0gfCB1bmRlZmluZWQgIHtcbiAgICByZXR1cm4gdGhpcy5wbHVnaW5zLmdldChuYW1lKSBhcyBhbnk7XG4gIH1cblxuICBlbnN1cmVQbHVnaW48UCBleHRlbmRzIGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uPihuYW1lOiBQKTogUGJsTmdyaWRQbHVnaW5FeHRlbnNpb25bUF0gIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQbHVnaW4obmFtZSkgfHwgdGhpcy5jcmVhdGVQbHVnaW4obmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBgcGx1Z2luYCB3aXRoIHRoZSBgbmFtZWAgd2l0aCB0aGUgYHRhYmxlYFxuICAgKi9cbiAgc2V0UGx1Z2luPFAgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbj4obmFtZTogUCwgcGx1Z2luOiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbltQXSk6ICh0YWJsZTogX1BibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHZvaWQge1xuICAgIGlmICghUExVR0lOX1NUT1JFLmhhcyhuYW1lKSkge1xuICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGx1Z2luICR7bmFtZX0uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnBsdWdpbnMuaGFzKG5hbWUpKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUGx1Z2luICR7bmFtZX0gaXMgYWxyZWFkeSByZWdpc3RlcmVkIGZvciB0aGlzIGdyaWQuYCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucGx1Z2lucy5zZXQobmFtZSwgcGx1Z2luKTtcbiAgICByZXR1cm4gKHRibDogX1BibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHRoaXMuZ3JpZCA9PT0gdGJsICYmIHRoaXMucGx1Z2lucy5kZWxldGUobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBncmlkIGlzIGRlY2xhcmVkIGluIGEgbG9jYXRpb24gd2l0aGluIHRoZSBESSB0aGF0IGhhcyBhY2Nlc3MgdG8gYW4gYW5jZXN0b3IgdG9rZW4uXG4gICAqIEZvciBleGFtcGxlLCBpZiB3ZSB3YW50IHRvIHVzZSBgY3JlYXRlUGx1Z2luKClgIG9ubHkgaWYgdGhlIGdyaWQgaXMgZGVmaW5lZCBpbiBhIG1vZHVsZSB0aGF0IGhhcyBhIHNwZWNpZmljIHBhcmVudCBtb2R1bGUgaW1wb3J0ZWQgaW50byBpdFxuICAgKiB3ZSB3aWxsIHVzZSBgaGFzQW5jZXN0b3IoTXlQYXJlbnRNb2R1bGUpYFxuICAgKi9cbiAgaGFzQW5jZXN0b3IodG9rZW46IGFueSkge1xuICAgIHJldHVybiAhIXRoaXMuaW5qZWN0b3IuZ2V0KHRva2VuLCBudWxsLCBJbmplY3RGbGFncy5PcHRpb25hbCk7XG4gIH1cblxuICBjcmVhdGVQbHVnaW48UCBleHRlbmRzIGtleW9mIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uRmFjdG9yaWVzPihuYW1lOiBQKTogUGJsTmdyaWRQbHVnaW5FeHRlbnNpb25bUF07XG4gIGNyZWF0ZVBsdWdpbjxQIGV4dGVuZHMga2V5b2YgUGJsTmdyaWRQbHVnaW5FeHRlbnNpb24+KG5hbWU6IFApOiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbltQXTtcbiAgY3JlYXRlUGx1Z2luPFAgZXh0ZW5kcyAoa2V5b2YgUGJsTmdyaWRQbHVnaW5FeHRlbnNpb25GYWN0b3JpZXMgJiBrZXlvZiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbik+KG5hbWU6IFApOiBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbltQXSB7XG4gICAgaWYgKCFQTFVHSU5fU1RPUkUuaGFzKG5hbWUpKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwbHVnaW4gJHtuYW1lfS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWV0YWRhdGEgPSBQTFVHSU5fU1RPUkUuZ2V0KG5hbWUpO1xuICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRhZGF0YS5mYWN0b3J5O1xuICAgIGlmICghbWV0aG9kTmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGx1Z2luIGNvbmZpZ3VyYXRpb24gZm9yICR7bmFtZX0sIG5vIGZhY3RvcnkgbWV0YWRhdGEuYCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0YWRhdGEudGFyZ2V0W21ldGhvZE5hbWVdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwbHVnaW4gY29uZmlndXJhdGlvbiBmb3IgJHtuYW1lfSwgZmFjdG9yeSBtZXRhZGF0YSBkb2VzIG5vdCBwb2ludCB0byBhIGZ1bmN0aW9uLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YWRhdGEudGFyZ2V0W21ldGhvZE5hbWVdKHRoaXMuZ3JpZCwgdGhpcy5jb250ZXh0LmluamVjdG9yKTtcbiAgfVxufVxuIl19