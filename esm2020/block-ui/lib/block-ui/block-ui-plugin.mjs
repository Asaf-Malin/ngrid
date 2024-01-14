import { isObservable } from 'rxjs';
import { Directive, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { unrx } from '@pebula/ngrid/core';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
export const PLUGIN_KEY = 'blockUi';
export class PblNgridBlockUiPluginDirective {
    constructor(grid, pluginCtrl) {
        this.grid = grid;
        this._blockInProgress = false;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        grid.registry.changes.subscribe(changes => {
            for (const c of changes) {
                switch (c.type) {
                    case 'blocker':
                        this.setupBlocker();
                        break;
                }
            }
        });
        pluginCtrl.onInit()
            .subscribe(isInitNow => {
            if (isInitNow && this._blockUi && typeof this._blockUi === 'boolean') {
                this.setupBlocker();
            }
        });
        pluginCtrl.events
            .subscribe(event => {
            if (event.kind === 'onDataSource') {
                const { prev, curr } = event;
                if (prev) {
                    unrx.kill(this, prev);
                }
                curr.onSourceChanging
                    .pipe(unrx(this, curr))
                    .subscribe(() => {
                    if (this._blockUi === 'auto') {
                        this._blockInProgress = true;
                        this.setupBlocker();
                    }
                });
                curr.onSourceChanged
                    .pipe(unrx(this, curr))
                    .subscribe(() => {
                    if (this._blockUi === 'auto') {
                        this._blockInProgress = false;
                        this.setupBlocker();
                    }
                });
            }
        });
    }
    /**
     * Blocks the UI with the template defined via `PblNgridBlockUiDefDirective`.
     * If a template does not exist blocking is ignored.
     *
     * There are 3 operation modes, the modes are set based on the input value:
     *   - Auto mode (INPUT: 'auto')
     *     The UI will be blocked automatically based on datasource changes.
     *
     *    - Manual mode (INPUT: boolean)
     *     The UI will be block is toggled based on the value, i.e. `true` will block and false will unblock.
     *
     *   - Notification mode (INPUT: Observable<boolean>)
     *     Similar to Manual mode but controlled by a stream boolean value.
     *
     * **Note about Notification mode**
     * Notification mode accepts an observable, at the point where the value is set the block state does not change (if it was "on" it will stay "on" and vice versa)
     * It will only change on the first emission, this is important to understand.
     *
     * For example, if the current block state is off and we pass a `Subject`, the state remains off until the next emission
     * of the `Subject` is `true`. If it already emitted `true` before the assignment it will not be taken into account. This is why
     * using `BehaviouralSubject` is preferred.
     *
     * Also note that when sending an observable it is treated as "notifier", do not send cold observable as they get subscribed to.
     * For example, sending the returned value from `HttpClient` will probably result in 2 HTTP calls, if you already subscribed to it
     * > The default value is `auto` which means that `<pbl-ngrid blockUi>` is similar to `<pbl-ngrid blockUi="auto">`
     */
    get blockUi() { return this._blockUi; }
    set blockUi(value) {
        let coerced = coerceBooleanProperty(value);
        if (coerced && (value === 'auto' || value === '')) {
            coerced = 'auto';
        }
        if (isObservable(value) && this._blockUi !== value) {
            if (isObservable(this._blockUi)) {
                unrx.kill(this, this._blockUi);
            }
            this._blockUi = value;
            value
                .pipe(unrx(this, this._blockUi))
                .subscribe(state => {
                this._blockInProgress = state;
                this.setupBlocker();
            });
        }
        else if (this._blockUi !== coerced) {
            this._blockUi = coerced;
            if (coerced !== 'auto') {
                this._blockInProgress = coerced;
                this.setupBlocker();
            }
        }
    }
    ngOnDestroy() {
        unrx.kill(this);
        this._removePlugin(this.grid);
    }
    setupBlocker() {
        if (this.grid.isInit) {
            const state = this._blockInProgress;
            if (state) {
                if (!this._blockerEmbeddedVRef) {
                    const blockerTemplate = this.grid.registry.getSingle('blocker');
                    if (blockerTemplate) {
                        this._blockerEmbeddedVRef = this.grid.createView('afterContent', blockerTemplate.tRef, { $implicit: this.grid });
                        this._blockerEmbeddedVRef.detectChanges();
                    }
                }
            }
            else if (this._blockerEmbeddedVRef) {
                this.grid.removeView(this._blockerEmbeddedVRef, 'afterContent');
                this._blockerEmbeddedVRef = undefined;
            }
        }
    }
}
/** @nocollapse */ PblNgridBlockUiPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiPluginDirective, deps: [{ token: i1.PblNgridComponent }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBlockUiPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBlockUiPluginDirective, selector: "pbl-ngrid[blockUi]", inputs: { blockUi: "blockUi" }, exportAs: ["blockUi"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiPluginDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[blockUi]', exportAs: 'blockUi' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i1.PblNgridPluginController }]; }, propDecorators: { blockUi: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2stdWktcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9ibG9jay11aS9zcmMvbGliL2Jsb2NrLXVpL2Jsb2NrLXVpLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQW1CLEtBQUssRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQWdCLE1BQU0sdUJBQXVCLENBQUM7QUFFNUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBUTVFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBYyxTQUFTLENBQUM7QUFHL0MsTUFBTSxPQUFPLDhCQUE4QjtJQTREekMsWUFBb0IsSUFBNEIsRUFBRSxVQUF1QztRQUFyRSxTQUFJLEdBQUosSUFBSSxDQUF3QjtRQUx4QyxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFNL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUUsT0FBTyxDQUFDLEVBQUU7WUFDekMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZCLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDZCxLQUFLLFNBQVM7d0JBQ1osSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQixNQUFNO2lCQUNUO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILFVBQVUsQ0FBQyxNQUFNLEVBQUU7YUFDaEIsU0FBUyxDQUFFLFNBQVMsQ0FBQyxF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QUFJLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUNwQyxJQUFJLEtBQUssRUFBRTtnQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO29CQUM5QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hFLElBQUksZUFBZSxFQUFFO3dCQUNuQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQ2pILElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztxQkFDM0M7aUJBQ0Y7YUFDRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO2FBQ3ZDO1NBQ0Y7SUFDSCxDQUFDOzs4SUFoSVUsOEJBQThCO2tJQUE5Qiw4QkFBOEI7MkZBQTlCLDhCQUE4QjtrQkFEMUMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFOytJQTZCbkQsT0FBTztzQkFBbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIGlzT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgQm9vbGVhbklucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBibG9ja1VpPzogeyBibG9ja1VpOiBCb29sZWFuSW5wdXQgfCAnYXV0bycgfCBPYnNlcnZhYmxlPGJvb2xlYW4+IH07XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFBMVUdJTl9LRVk6ICdibG9ja1VpJyA9ICdibG9ja1VpJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAncGJsLW5ncmlkW2Jsb2NrVWldJywgZXhwb3J0QXM6ICdibG9ja1VpJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQmxvY2tVaVBsdWdpbkRpcmVjdGl2ZTxUPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG5cbiAgLyoqXG4gICAqIEJsb2NrcyB0aGUgVUkgd2l0aCB0aGUgdGVtcGxhdGUgZGVmaW5lZCB2aWEgYFBibE5ncmlkQmxvY2tVaURlZkRpcmVjdGl2ZWAuXG4gICAqIElmIGEgdGVtcGxhdGUgZG9lcyBub3QgZXhpc3QgYmxvY2tpbmcgaXMgaWdub3JlZC5cbiAgICpcbiAgICogVGhlcmUgYXJlIDMgb3BlcmF0aW9uIG1vZGVzLCB0aGUgbW9kZXMgYXJlIHNldCBiYXNlZCBvbiB0aGUgaW5wdXQgdmFsdWU6XG4gICAqICAgLSBBdXRvIG1vZGUgKElOUFVUOiAnYXV0bycpXG4gICAqICAgICBUaGUgVUkgd2lsbCBiZSBibG9ja2VkIGF1dG9tYXRpY2FsbHkgYmFzZWQgb24gZGF0YXNvdXJjZSBjaGFuZ2VzLlxuICAgKlxuICAgKiAgICAtIE1hbnVhbCBtb2RlIChJTlBVVDogYm9vbGVhbilcbiAgICogICAgIFRoZSBVSSB3aWxsIGJlIGJsb2NrIGlzIHRvZ2dsZWQgYmFzZWQgb24gdGhlIHZhbHVlLCBpLmUuIGB0cnVlYCB3aWxsIGJsb2NrIGFuZCBmYWxzZSB3aWxsIHVuYmxvY2suXG4gICAqXG4gICAqICAgLSBOb3RpZmljYXRpb24gbW9kZSAoSU5QVVQ6IE9ic2VydmFibGU8Ym9vbGVhbj4pXG4gICAqICAgICBTaW1pbGFyIHRvIE1hbnVhbCBtb2RlIGJ1dCBjb250cm9sbGVkIGJ5IGEgc3RyZWFtIGJvb2xlYW4gdmFsdWUuXG4gICAqXG4gICAqICoqTm90ZSBhYm91dCBOb3RpZmljYXRpb24gbW9kZSoqXG4gICAqIE5vdGlmaWNhdGlvbiBtb2RlIGFjY2VwdHMgYW4gb2JzZXJ2YWJsZSwgYXQgdGhlIHBvaW50IHdoZXJlIHRoZSB2YWx1ZSBpcyBzZXQgdGhlIGJsb2NrIHN0YXRlIGRvZXMgbm90IGNoYW5nZSAoaWYgaXQgd2FzIFwib25cIiBpdCB3aWxsIHN0YXkgXCJvblwiIGFuZCB2aWNlIHZlcnNhKVxuICAgKiBJdCB3aWxsIG9ubHkgY2hhbmdlIG9uIHRoZSBmaXJzdCBlbWlzc2lvbiwgdGhpcyBpcyBpbXBvcnRhbnQgdG8gdW5kZXJzdGFuZC5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIGlmIHRoZSBjdXJyZW50IGJsb2NrIHN0YXRlIGlzIG9mZiBhbmQgd2UgcGFzcyBhIGBTdWJqZWN0YCwgdGhlIHN0YXRlIHJlbWFpbnMgb2ZmIHVudGlsIHRoZSBuZXh0IGVtaXNzaW9uXG4gICAqIG9mIHRoZSBgU3ViamVjdGAgaXMgYHRydWVgLiBJZiBpdCBhbHJlYWR5IGVtaXR0ZWQgYHRydWVgIGJlZm9yZSB0aGUgYXNzaWdubWVudCBpdCB3aWxsIG5vdCBiZSB0YWtlbiBpbnRvIGFjY291bnQuIFRoaXMgaXMgd2h5XG4gICAqIHVzaW5nIGBCZWhhdmlvdXJhbFN1YmplY3RgIGlzIHByZWZlcnJlZC5cbiAgICpcbiAgICogQWxzbyBub3RlIHRoYXQgd2hlbiBzZW5kaW5nIGFuIG9ic2VydmFibGUgaXQgaXMgdHJlYXRlZCBhcyBcIm5vdGlmaWVyXCIsIGRvIG5vdCBzZW5kIGNvbGQgb2JzZXJ2YWJsZSBhcyB0aGV5IGdldCBzdWJzY3JpYmVkIHRvLlxuICAgKiBGb3IgZXhhbXBsZSwgc2VuZGluZyB0aGUgcmV0dXJuZWQgdmFsdWUgZnJvbSBgSHR0cENsaWVudGAgd2lsbCBwcm9iYWJseSByZXN1bHQgaW4gMiBIVFRQIGNhbGxzLCBpZiB5b3UgYWxyZWFkeSBzdWJzY3JpYmVkIHRvIGl0XG4gICAqID4gVGhlIGRlZmF1bHQgdmFsdWUgaXMgYGF1dG9gIHdoaWNoIG1lYW5zIHRoYXQgYDxwYmwtbmdyaWQgYmxvY2tVaT5gIGlzIHNpbWlsYXIgdG8gYDxwYmwtbmdyaWQgYmxvY2tVaT1cImF1dG9cIj5gXG4gICAqL1xuICBASW5wdXQoKSBnZXQgYmxvY2tVaSgpOiBCb29sZWFuSW5wdXQgfCAnYXV0bycgfCBPYnNlcnZhYmxlPGJvb2xlYW4+IHsgcmV0dXJuIHRoaXMuX2Jsb2NrVWk7IH1cbiAgc2V0IGJsb2NrVWkodmFsdWU6IEJvb2xlYW5JbnB1dCB8ICdhdXRvJyB8IE9ic2VydmFibGU8Ym9vbGVhbj4pIHtcbiAgICBsZXQgY29lcmNlZDogYm9vbGVhbiB8ICdhdXRvJyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgaWYgKGNvZXJjZWQgJiYgKHZhbHVlID09PSAnYXV0bycgfHwgKHZhbHVlIGFzIGFueSkgPT09ICcnKSkge1xuICAgICAgY29lcmNlZCA9ICdhdXRvJztcbiAgICB9XG5cbiAgICBpZiAoaXNPYnNlcnZhYmxlKHZhbHVlKSAmJiB0aGlzLl9ibG9ja1VpICE9PSB2YWx1ZSkge1xuICAgICAgaWYgKGlzT2JzZXJ2YWJsZSh0aGlzLl9ibG9ja1VpKSkge1xuICAgICAgICB1bnJ4LmtpbGwodGhpcywgdGhpcy5fYmxvY2tVaSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9ibG9ja1VpID0gdmFsdWU7XG4gICAgICB2YWx1ZVxuICAgICAgICAucGlwZSh1bnJ4KHRoaXMsIHRoaXMuX2Jsb2NrVWkpKVxuICAgICAgICAuc3Vic2NyaWJlKCBzdGF0ZSA9PiB7XG4gICAgICAgICAgdGhpcy5fYmxvY2tJblByb2dyZXNzID0gc3RhdGU7XG4gICAgICAgICAgdGhpcy5zZXR1cEJsb2NrZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ibG9ja1VpICE9PSBjb2VyY2VkKSB7XG4gICAgICB0aGlzLl9ibG9ja1VpID0gY29lcmNlZDtcbiAgICAgIGlmIChjb2VyY2VkICE9PSAnYXV0bycpIHtcbiAgICAgICAgdGhpcy5fYmxvY2tJblByb2dyZXNzID0gY29lcmNlZDtcbiAgICAgICAgdGhpcy5zZXR1cEJsb2NrZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9ibG9ja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfYmxvY2tVaTogYm9vbGVhbiB8ICdhdXRvJyB8IE9ic2VydmFibGU8Ym9vbGVhbj47XG4gIHByaXZhdGUgX2Jsb2NrZXJFbWJlZGRlZFZSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+O1xuICBwcml2YXRlIF9yZW1vdmVQbHVnaW46IChncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgcGx1Z2luQ3RybDogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyPFQ+KSB7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luID0gcGx1Z2luQ3RybC5zZXRQbHVnaW4oUExVR0lOX0tFWSwgdGhpcyk7XG5cbiAgICBncmlkLnJlZ2lzdHJ5LmNoYW5nZXMuc3Vic2NyaWJlKCBjaGFuZ2VzID0+IHtcbiAgICAgIGZvciAoY29uc3QgYyBvZiBjaGFuZ2VzKSB7XG4gICAgICAgIHN3aXRjaCAoYy50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnYmxvY2tlcic6XG4gICAgICAgICAgICB0aGlzLnNldHVwQmxvY2tlcigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHBsdWdpbkN0cmwub25Jbml0KClcbiAgICAgIC5zdWJzY3JpYmUoIGlzSW5pdE5vdyA9PiB7XG4gICAgICAgIGlmIChpc0luaXROb3cgJiYgdGhpcy5fYmxvY2tVaSAmJiB0eXBlb2YgdGhpcy5fYmxvY2tVaSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdGhpcy5zZXR1cEJsb2NrZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBwbHVnaW5DdHJsLmV2ZW50c1xuICAgICAgLnN1YnNjcmliZSggZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2luZCA9PT0gJ29uRGF0YVNvdXJjZScpIHtcbiAgICAgICAgICBjb25zdCB7IHByZXYsIGN1cnIgfSA9IGV2ZW50O1xuICAgICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICB1bnJ4LmtpbGwodGhpcywgcHJldik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnIub25Tb3VyY2VDaGFuZ2luZ1xuICAgICAgICAgICAgLnBpcGUodW5yeCh0aGlzLCBjdXJyKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX2Jsb2NrVWkgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jsb2NrSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cEJsb2NrZXIoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgY3Vyci5vblNvdXJjZUNoYW5nZWRcbiAgICAgICAgICAgIC5waXBlKHVucngodGhpcywgY3VycikpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLl9ibG9ja1VpID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9ja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwQmxvY2tlcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB1bnJ4LmtpbGwodGhpcyk7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luKHRoaXMuZ3JpZCk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwQmxvY2tlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5ncmlkLmlzSW5pdCkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9ibG9ja0luUHJvZ3Jlc3M7XG4gICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9ibG9ja2VyRW1iZWRkZWRWUmVmKSB7XG4gICAgICAgICAgY29uc3QgYmxvY2tlclRlbXBsYXRlID0gdGhpcy5ncmlkLnJlZ2lzdHJ5LmdldFNpbmdsZSgnYmxvY2tlcicpO1xuICAgICAgICAgIGlmIChibG9ja2VyVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Jsb2NrZXJFbWJlZGRlZFZSZWYgPSB0aGlzLmdyaWQuY3JlYXRlVmlldygnYWZ0ZXJDb250ZW50JywgYmxvY2tlclRlbXBsYXRlLnRSZWYsIHsgJGltcGxpY2l0OiB0aGlzLmdyaWQgfSk7XG4gICAgICAgICAgICB0aGlzLl9ibG9ja2VyRW1iZWRkZWRWUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmxvY2tlckVtYmVkZGVkVlJlZikge1xuICAgICAgICB0aGlzLmdyaWQucmVtb3ZlVmlldyh0aGlzLl9ibG9ja2VyRW1iZWRkZWRWUmVmLCAnYWZ0ZXJDb250ZW50Jyk7XG4gICAgICAgIHRoaXMuX2Jsb2NrZXJFbWJlZGRlZFZSZWYgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Jsb2NrVWk6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==