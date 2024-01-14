import { Subject } from 'rxjs';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { unrx, } from '@asafmalin/ngrid/core';
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
export class PblNgridRegistryService {
    constructor(_parent) {
        this._parent = _parent;
        this._multi = {};
        this._multiDefaults = {};
        this._singles = {};
        this.changes$ = new Subject();
        this.changes = this.changes$.asObservable();
        if (this._parent) {
            this._parent.changes.pipe(unrx(this)).subscribe(this.changes$);
            this.root = this._parent.root;
        }
        else {
            this.root = this;
        }
    }
    get parent() { return this._parent; }
    getRoot() { return this.root; }
    /**
     * Returns the registered value for the single `kind`.
     * If not found will try to search the parent.
     */
    getSingle(kind) {
        return this._singles[kind] || (this._parent && this._parent.getSingle(kind));
    }
    setSingle(kind, value) {
        const previous = this.getSingle(kind);
        if (value !== previous) {
            this._singles[kind] = value;
            this.emitChanges({ op: value ? 'add' : 'remove', type: kind, value });
        }
    }
    /**
     * Returns the registered default value for the multi `kind`.
     * If not found will try to search the parent.
     */
    getMultiDefault(kind) {
        return this._multiDefaults[kind] || (this._parent && this._parent.getMultiDefault(kind));
    }
    setMultiDefault(kind, value) {
        const previous = this.getMultiDefault(kind);
        if (value !== previous) {
            this._multiDefaults[kind] = value;
            this.emitChanges({ op: value ? 'add' : 'remove', type: kind, value });
        }
    }
    /**
     * Returns the registered values for the multi `kind`.
     * If not found WILL NOT search the parent.
     */
    getMulti(kind) {
        return this._multi[kind];
    }
    addMulti(kind, cellDef) {
        const multi = this.getMulti(kind) || (this._multi[kind] = []);
        multi.push(cellDef);
        if (cellDef.name === '*') {
            this.setMultiDefault(kind, cellDef);
        }
        this.emitChanges({ op: 'add', type: kind, value: cellDef });
    }
    removeMulti(kind, cellDef) {
        const multi = this.getMulti(kind);
        if (multi) {
            const idx = multi.indexOf(cellDef);
            if (idx > -1) {
                multi.splice(idx, 1);
            }
            this.emitChanges({ op: 'remove', type: kind, value: cellDef });
        }
    }
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
    forMulti(kind, handler) {
        let registry = this;
        let hasSome = 0;
        while (registry) {
            const values = registry.getMulti(kind);
            if (values) {
                hasSome++;
                if (handler(values) === true) {
                    return;
                }
            }
            registry = registry.parent;
        }
        return hasSome;
    }
    ngOnDestroy() {
        this.changes$.complete();
        unrx.kill(this);
    }
    /**
     * Delay all notifications sent through `changes` and buffer then until next call to `bufferEnd()`.
     * When `bufferEnd()` is called it will flush all changes.
     *
     * > It's important to note that buffering does not freeze the registry, adding and removing templates will change the
     * registry and will effect queries. Buffering block the `changes` event stream and nothing more.
     */
    bufferStart() {
        if (!this.root.bufferedData) {
            this.root.bufferedData = [];
        }
    }
    bufferEnd() {
        if (this.root.bufferedData) {
            const data = this.root.bufferedData;
            this.root.bufferedData = undefined;
            this.emitChanges(data);
        }
    }
    emitChanges(events) {
        const e = Array.isArray(events) ? events : [events];
        if (this.root.bufferedData) {
            this.root.bufferedData.push(...e);
        }
        else {
            this.changes$.next(e);
        }
    }
}
/** @nocollapse */ PblNgridRegistryService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, deps: [{ token: PblNgridRegistryService, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridRegistryService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: PblNgridRegistryService, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFMUUsT0FBTyxFQUNMLElBQUksR0FJTCxNQUFPLG9CQUFvQixDQUFDOztBQUU3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFFSCxNQUFNLE9BQU8sdUJBQXVCO0lBYWxDLFlBQTRDLE9BQWlDO1FBQWpDLFlBQU8sR0FBUCxPQUFPLENBQTBCO1FBTm5FLFdBQU0sR0FBa0YsRUFBVSxDQUFDO1FBQ25HLG1CQUFjLEdBQTZCLEVBQVUsQ0FBQztRQUN0RCxhQUFRLEdBQThCLEVBQVUsQ0FBQztRQUt6RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzVDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQy9CO2FBQU07WUFDTCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNsQjtJQUNILENBQUM7SUFuQkQsSUFBSSxNQUFNLEtBQTBDLE9BQU8sSUFBSSxDQUFD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SCxDQUFDO0lBRU8sV0FBVyxDQUFDLE1BQXFEO1FBQ3ZFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ2xDO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUM7O3VJQW5KVSx1QkFBdUI7MklBQXZCLHVCQUF1QixjQURWLE1BQU07MkZBQ25CLHVCQUF1QjtrQkFEbkMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7OzBCQWNuQixRQUFROzswQkFBSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIFNraXBTZWxmLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcbiAgdW5yeCxcbiAgUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwLFxuICBQYmxOZ3JpZFNpbmdsZVJlZ2lzdHJ5TWFwLFxuICBSZWdpc3RyeUNoYW5nZWRFdmVudCxcbn0gIGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbi8qKlxuICogQSBSZWdpc3RyeSBmb3IgdGVtcGxhdGVzIG9mIHRhYmxlIHBhcnRzLlxuICpcbiAqIFRoZSByZWdpc3RyeSBpcyBoaWVyYXJjaGljYWwsIHdoZXJlIGVhY2ggaW5zdGFuY2Ugb2YgYSByZWdpc3RyeSBoYXMgYSBwYXJlbnQgd2hpY2ggYWxsb3dzIGNhc2NhZGluZyB0ZW1wbGF0ZXMuXG4gKiBUaGUgaGllcmFyY2h5IGlzIG1hbmdlZCBieSBhbmd1bGFyIERJLlxuICpcbiAqID4gVGhlIHJvb3QgcmVnaXN0cnkgZG9lcyBub3QgaGF2ZSBhIHBhcmVudC5cbiAqXG4gKiBFYWNoIGluc3RhbmNlIG9mIGEgcmVnaXN0cnkgKGluY2x1ZGluZyByb290KSBpcyBhIGhpZXJhcmNoeSBieSBpdHNlbGYsIGNvbXBvc2VkIG9mIDIgaW50ZXJuYWwgbGV2ZWxzLlxuICogVGhlIGZpcnN0IGxldmVsIChMMSBiZWxvdykgaXMgdXNlZCBmb3IgZml4ZWQgdGVtcGxhdGVzLCB0aGUgc2Vjb25kIGxldmVsIChMMiBiZWxvdykgaXMgdXNlZCBmb3IgZHluYW1pYyB0ZW1wbGF0ZXMuXG4gKlxuICogLSBSb290IFJlZ2lzdHJ5XG4gKiAgIC0gQ2hpbGQgUmVnaXN0cnlcbiAqICAgICAtIENoaWxkT2ZDaGlsZCBSZWdpc3RyeVxuICpcbiAqIEluIHRoZSBleGFtcGxlIGFib3ZlIHRoZXJlIGFyZSAzIHJlZ2lzdHJpZXM6IFJvb3QsIENoaWxkIGFuZCBDaGlsZE9mQ2hpbGQuXG4gKlxuICogV2hlbiBzZWFyY2hpbmcgZm9yIGEgdGVtcGxhdGUgaW4gYENoaWxkT2ZDaGlsZGAgaXQgd2lsbCBzZWFyY2ggaW4gdGhlIGZvbGxvd2luZyBvcmRlciAodG9wIHRvIGJvdHRvbSk6XG4gKiAgIC0gQ2hpbGRPZkNoaWxkXG4gKiAgIC0gQ2hpbGRcbiAqICAgLSBSb290XG4gKlxuICogSWYgYSByZWdpc3RyeSBkb2VzIG5vdCBjb250YWluIHRoZSB0ZW1wbGF0ZSB0aGUgc2VhcmNoIHdpbGwgbW92ZSB0byB0aGUgbmV4dCBvbmUuXG4gKi9cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIHJlYWRvbmx5IGNoYW5nZXM6IE9ic2VydmFibGU8UmVnaXN0cnlDaGFuZ2VkRXZlbnRbXT47XG4gIGdldCBwYXJlbnQoKTogUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG5cbiAgcHJvdGVjdGVkIHJvb3Q6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlICYgeyBidWZmZXJlZERhdGE/OiBSZWdpc3RyeUNoYW5nZWRFdmVudFtdIH07XG5cbiAgcHJvdGVjdGVkIF9tdWx0aTogeyBbSyBpbiBrZXlvZiBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXBdOiBBcnJheTxQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXBbS10+IH0gPSB7IH0gYXMgYW55O1xuICBwcm90ZWN0ZWQgX211bHRpRGVmYXVsdHM6IFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCA9IHt9ICBhcyBhbnk7XG4gIHByb3RlY3RlZCBfc2luZ2xlczogUGJsTmdyaWRTaW5nbGVSZWdpc3RyeU1hcCA9IHt9ICBhcyBhbnk7XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGNoYW5nZXMkOiBTdWJqZWN0PFJlZ2lzdHJ5Q2hhbmdlZEV2ZW50W10+O1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudD86IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7XG4gICAgdGhpcy5jaGFuZ2VzJCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5jaGFuZ2VzID0gdGhpcy5jaGFuZ2VzJC5hc09ic2VydmFibGUoKTtcbiAgICBpZiAodGhpcy5fcGFyZW50KSB7XG4gICAgICB0aGlzLl9wYXJlbnQuY2hhbmdlcy5waXBlKHVucngodGhpcykpLnN1YnNjcmliZSh0aGlzLmNoYW5nZXMkKTtcbiAgICAgIHRoaXMucm9vdCA9IHRoaXMuX3BhcmVudC5yb290O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIGdldFJvb3QoKTogUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgeyByZXR1cm4gdGhpcy5yb290OyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlZ2lzdGVyZWQgdmFsdWUgZm9yIHRoZSBzaW5nbGUgYGtpbmRgLlxuICAgKiBJZiBub3QgZm91bmQgd2lsbCB0cnkgdG8gc2VhcmNoIHRoZSBwYXJlbnQuXG4gICAqL1xuICBnZXRTaW5nbGU8UCBleHRlbmRzIGtleW9mIFBibE5ncmlkU2luZ2xlUmVnaXN0cnlNYXA+KGtpbmQ6IFApOiBQYmxOZ3JpZFNpbmdsZVJlZ2lzdHJ5TWFwW1BdIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fc2luZ2xlc1traW5kXSB8fCAodGhpcy5fcGFyZW50ICYmIHRoaXMuX3BhcmVudC5nZXRTaW5nbGUoa2luZCkpO1xuICB9XG5cbiAgc2V0U2luZ2xlPFAgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZFNpbmdsZVJlZ2lzdHJ5TWFwPihraW5kOiBQLCB2YWx1ZTogUGJsTmdyaWRTaW5nbGVSZWdpc3RyeU1hcFtQXSB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5nZXRTaW5nbGUoa2luZCk7XG4gICAgaWYgKHZhbHVlICE9PSBwcmV2aW91cykge1xuICAgICAgdGhpcy5fc2luZ2xlc1traW5kXSA9IHZhbHVlO1xuICAgICAgdGhpcy5lbWl0Q2hhbmdlcyh7IG9wOiB2YWx1ZSA/ICdhZGQnIDogJ3JlbW92ZScsIHR5cGU6IGtpbmQsIHZhbHVlIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWdpc3RlcmVkIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBtdWx0aSBga2luZGAuXG4gICAqIElmIG5vdCBmb3VuZCB3aWxsIHRyeSB0byBzZWFyY2ggdGhlIHBhcmVudC5cbiAgICovXG4gIGdldE11bHRpRGVmYXVsdDxQIGV4dGVuZHMga2V5b2YgUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwPihraW5kOiBQKTogUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwW1BdIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlEZWZhdWx0c1traW5kXSB8fCAodGhpcy5fcGFyZW50ICYmIHRoaXMuX3BhcmVudC5nZXRNdWx0aURlZmF1bHQoa2luZCkpO1xuICB9XG5cbiAgc2V0TXVsdGlEZWZhdWx0PFAgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXA+KGtpbmQ6IFAsIHZhbHVlOiBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXBbUF0gfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0TXVsdGlEZWZhdWx0KGtpbmQpO1xuICAgIGlmICh2YWx1ZSAhPT0gcHJldmlvdXMpIHtcbiAgICAgIHRoaXMuX211bHRpRGVmYXVsdHNba2luZF0gPSB2YWx1ZTtcbiAgICAgIHRoaXMuZW1pdENoYW5nZXMoeyBvcDogdmFsdWUgPyAnYWRkJyA6ICdyZW1vdmUnLCB0eXBlOiBraW5kLCB2YWx1ZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVnaXN0ZXJlZCB2YWx1ZXMgZm9yIHRoZSBtdWx0aSBga2luZGAuXG4gICAqIElmIG5vdCBmb3VuZCBXSUxMIE5PVCBzZWFyY2ggdGhlIHBhcmVudC5cbiAgICovXG4gIGdldE11bHRpPFQgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXA+KGtpbmQ6IFQpOiBBcnJheTxQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXBbVF0+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlba2luZF0gYXMgQXJyYXk8UGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwW1RdPjtcbiAgfVxuXG4gIGFkZE11bHRpPFQgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXA+KGtpbmQ6IFQsIGNlbGxEZWY6IFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcFtUXSk6IHZvaWQge1xuICAgIGNvbnN0IG11bHRpID0gdGhpcy5nZXRNdWx0aShraW5kKSB8fCAodGhpcy5fbXVsdGlba2luZF0gPSBbXSk7XG4gICAgbXVsdGkucHVzaChjZWxsRGVmKTtcbiAgICBpZiAoY2VsbERlZi5uYW1lID09PSAnKicpIHtcbiAgICAgIHRoaXMuc2V0TXVsdGlEZWZhdWx0KGtpbmQsIGNlbGxEZWYpO1xuICAgIH1cbiAgICB0aGlzLmVtaXRDaGFuZ2VzKHsgb3A6ICdhZGQnLCB0eXBlOiBraW5kLCB2YWx1ZTogY2VsbERlZiB9KVxuICB9XG5cbiAgcmVtb3ZlTXVsdGk8VCBleHRlbmRzIGtleW9mIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcD4oa2luZDogVCwgY2VsbERlZjogUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwW1RdKTogdm9pZCB7XG4gICAgY29uc3QgbXVsdGkgPSB0aGlzLmdldE11bHRpKGtpbmQpO1xuICAgIGlmIChtdWx0aSkge1xuICAgICAgY29uc3QgaWR4ID0gbXVsdGkuaW5kZXhPZihjZWxsRGVmKTtcbiAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICBtdWx0aS5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdENoYW5nZXMoeyBvcDogJ3JlbW92ZScsIHR5cGU6IGtpbmQsIHZhbHVlOiBjZWxsRGVmIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhbGwgbXVsdGktcmVnaXN0cnkgdmFsdWUgb2YgdGhlIHByb3ZpZGVkIGBraW5kYCBhc2NlbmRpbmcgb3JkZXIsIHN0YXJ0aW5nIGZyb20gdGhlIGxhc3QgYW5jZXN0b3IgKHRoaXMgcmVnaXN0cnkpIHVwIHRvXG4gICAqIHRoZSByb290IHBhcmVudC5cbiAgICpcbiAgICogRWFjaCB0aW1lIGEgY29sbGVjdGlvbiBmb3IgdGhlIGBraW5kYCBpcyBmb3VuZCB0aGUgaGFuZGxlciBpcyBpbnZva2VkIGFuZCB0aGVuIHJlcGVhdGluZyB0aGUgcHJvY2VzcyBvbiB0aGUgcGFyZW50LlxuICAgKiBJZiB0aGUgYGtpbmRgIGRvZXMgbm90IGV4aXN0IHRoZSBoYW5kbGVyIGlzIG5vdCBjYWxsZWQgbW92aW5nIG9uIHRvIHRoZSBuZXh0IHBhcmVudC5cbiAgICpcbiAgICogVG8gYmFpbCBvdXQgKHN0b3AgdGhlIHByb2Nlc3MgYW5kIGRvbid0IGl0ZXJhdGUgdG8gdGhlIG5leHQgcGFyZW50KSwgcmV0dXJuIHRydWUgZnJvbSB0aGUgaGFuZGxlci5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG51bWJlciBvZiB0aW1lcyB0aGF0IGhhbmRsZXIgd2FzIGludm9rZWQsIGkuZSAwIG1lYW5zIG5vIG1hdGNoZXMuXG4gICAqL1xuICBmb3JNdWx0aTxUIGV4dGVuZHMga2V5b2YgUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwPihraW5kOiBULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAoICh2YWx1ZXM6IEFycmF5PFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcFtUXT4pID0+IGJvb2xlYW4gfCB2b2lkKSk6IG51bWJlciB7XG4gICAgbGV0IHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSA9IHRoaXM7XG4gICAgbGV0IGhhc1NvbWUgPSAwO1xuICAgIHdoaWxlIChyZWdpc3RyeSkge1xuICAgICAgY29uc3QgdmFsdWVzID0gcmVnaXN0cnkuZ2V0TXVsdGkoa2luZCk7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIGhhc1NvbWUrKztcbiAgICAgICAgaWYgKGhhbmRsZXIodmFsdWVzKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVnaXN0cnkgPSByZWdpc3RyeS5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBoYXNTb21lO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5jaGFuZ2VzJC5jb21wbGV0ZSgpO1xuICAgIHVucngua2lsbCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxheSBhbGwgbm90aWZpY2F0aW9ucyBzZW50IHRocm91Z2ggYGNoYW5nZXNgIGFuZCBidWZmZXIgdGhlbiB1bnRpbCBuZXh0IGNhbGwgdG8gYGJ1ZmZlckVuZCgpYC5cbiAgICogV2hlbiBgYnVmZmVyRW5kKClgIGlzIGNhbGxlZCBpdCB3aWxsIGZsdXNoIGFsbCBjaGFuZ2VzLlxuICAgKlxuICAgKiA+IEl0J3MgaW1wb3J0YW50IHRvIG5vdGUgdGhhdCBidWZmZXJpbmcgZG9lcyBub3QgZnJlZXplIHRoZSByZWdpc3RyeSwgYWRkaW5nIGFuZCByZW1vdmluZyB0ZW1wbGF0ZXMgd2lsbCBjaGFuZ2UgdGhlXG4gICAqIHJlZ2lzdHJ5IGFuZCB3aWxsIGVmZmVjdCBxdWVyaWVzLiBCdWZmZXJpbmcgYmxvY2sgdGhlIGBjaGFuZ2VzYCBldmVudCBzdHJlYW0gYW5kIG5vdGhpbmcgbW9yZS5cbiAgICovXG4gIGJ1ZmZlclN0YXJ0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5yb290LmJ1ZmZlcmVkRGF0YSkge1xuICAgICAgdGhpcy5yb290LmJ1ZmZlcmVkRGF0YSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIGJ1ZmZlckVuZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5yb290LmJ1ZmZlcmVkRGF0YSkge1xuICAgICAgY29uc3QgZGF0YSA9IHRoaXMucm9vdC5idWZmZXJlZERhdGE7XG4gICAgICB0aGlzLnJvb3QuYnVmZmVyZWREYXRhID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5lbWl0Q2hhbmdlcyhkYXRhKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGVtaXRDaGFuZ2VzKGV2ZW50czogUmVnaXN0cnlDaGFuZ2VkRXZlbnQgfCBSZWdpc3RyeUNoYW5nZWRFdmVudFtdKTogdm9pZCB7XG4gICAgY29uc3QgZSA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IFtldmVudHNdO1xuICAgIGlmICh0aGlzLnJvb3QuYnVmZmVyZWREYXRhKSB7XG4gICAgICB0aGlzLnJvb3QuYnVmZmVyZWREYXRhLnB1c2goLi4uZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGFuZ2VzJC5uZXh0KGUpO1xuICAgIH1cbiAgfVxufVxuIl19