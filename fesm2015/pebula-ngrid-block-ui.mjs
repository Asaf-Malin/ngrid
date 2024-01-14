import * as i0 from '@angular/core';
import { Directive, Input, NgModule } from '@angular/core';
import * as i1 from '@pebula/ngrid';
import { PblNgridSingleTemplateRegistry, ngridPlugin, PblNgridModule } from '@pebula/ngrid';
import { isObservable } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { unrx } from '@pebula/ngrid/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

// tslint:disable:use-host-property-decorator
/**
 * Marks the element as the display element when the form is busy.
 */
class PblNgridBlockUiDefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'blocker';
    }
}
/** @nocollapse */ PblNgridBlockUiDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBlockUiDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBlockUiDefDirective, selector: "[pblNgridBlockUiDef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiDefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridBlockUiDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });

const PLUGIN_KEY = 'blockUi';
class PblNgridBlockUiPluginDirective {
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

class PblNgridBlockUiModule {
}
PblNgridBlockUiModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridBlockUiPluginDirective);
/** @nocollapse */ PblNgridBlockUiModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridBlockUiModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, declarations: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective] });
/** @nocollapse */ PblNgridBlockUiModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective],
                    exports: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridBlockUiDefDirective, PblNgridBlockUiModule, PblNgridBlockUiPluginDirective };
//# sourceMappingURL=pebula-ngrid-block-ui.mjs.map
