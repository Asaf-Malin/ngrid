import * as i0 from '@angular/core';
import { ViewContainerRef, Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Directive, Input, EventEmitter, ComponentFactoryResolver, Output, NgModule } from '@angular/core';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { CdkRow, CdkTableModule } from '@angular/cdk/table';
import { unrx } from '@asafmalin/ngrid/core';
import * as i1 from '@asafmalin/ngrid';
import { PblNgridRowComponent, PblNgridSingleTemplateRegistry, PblNgridRowDef, PblNgridPluginController, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';

const PLUGIN_KEY = 'detailRow';

const PBL_NGRID_ROW_TEMPLATE = '<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-container #viewRef></ng-container><ng-content select=".pbl-ngrid-row-suffix"></ng-content>';
class PblNgridDetailRowComponent extends PblNgridRowComponent {
    constructor() {
        super(...arguments);
        this.opened = false;
    }
    get expended() {
        return this.opened;
    }
    get height() {
        return super.height + this.controller.getDetailRowHeight(this);
    }
    get row() { return this.context.$implicit; }
    ngOnInit() {
        super.ngOnInit();
        this.plugin.addDetailRow(this);
        const tradeEvents = this._extApi.pluginCtrl.getPlugin('targetEvents');
        tradeEvents.cellClick
            .pipe(unrx(this))
            .subscribe(event => {
            if (event.type === 'data' && event.row === this.context.$implicit) {
                const { excludeToggleFrom } = this.plugin;
                if (!excludeToggleFrom || !excludeToggleFrom.some(c => event.column.id === c)) {
                    this.toggle();
                }
            }
        });
        tradeEvents.rowClick
            .pipe(unrx(this))
            .subscribe(event => {
            if (!event.root && event.type === 'data' && event.row === this.context.$implicit) {
                this.toggle();
            }
        });
    }
    ngOnDestroy() {
        unrx.kill(this);
        this.plugin.removeDetailRow(this);
        this.controller.clearDetailRow(this, true);
        super.ngOnDestroy();
    }
    updateRow() {
        if (super.updateRow()) { // only if row has changed (TODO: use identity based change detection?)
            switch (this.plugin.whenContextChange) {
                case 'context':
                    const isContextOpened = !!this.context.getExternal('detailRow');
                    isContextOpened && this.opened
                        ? this.controller.updateDetailRow(this) // if already opened, just update the context
                        : this.toggle(isContextOpened, true) // if not opened, force to the context state
                    ;
                    break;
                case 'render':
                    if (this.opened) {
                        this.controller.updateDetailRow(this);
                    }
                    break;
                case 'close':
                    this.toggle(false, true);
                    break;
            }
            this.plugin.markForCheck();
            this.controller.detectChanges(this);
            this.plugin.toggledRowContextChange.next(this);
            return true;
        }
        return false;
    }
    toggle(forceState, fromRender = false) {
        if (this.opened !== forceState) {
            let opened = false;
            if (this.opened) {
                this.controller.clearDetailRow(this, fromRender);
                this.element.classList.remove('pbl-row-detail-opened');
            }
            else if (this.controller.render(this, fromRender)) {
                opened = true;
                this.element.classList.add('pbl-row-detail-opened');
            }
            if (this.opened !== opened) {
                this.opened = opened;
                this.context.setExternal('detailRow', opened, true);
                this.plugin.detailRowToggled(this);
            }
        }
    }
    /**
     * @internal
     */
    handleKeydown(event) {
        if (event.target === this.element) {
            const keyCode = event.keyCode;
            const isToggleKey = keyCode === ENTER || keyCode === SPACE;
            if (isToggleKey) {
                event.preventDefault(); // prevents the page from scrolling down when pressing space
                this.toggle();
            }
        }
    }
    onCtor() {
        super.onCtor();
        this.plugin = this._extApi.pluginCtrl.getPlugin(PLUGIN_KEY); // TODO: THROW IF NO PLUGIN...
        this.controller = this.plugin.detailRowCtrl;
    }
}
/** @nocollapse */ PblNgridDetailRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDetailRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDetailRowComponent, selector: "pbl-ngrid-row[detailRow]", host: { attributes: { "role": "row" }, listeners: { "keydown": "handleKeydown($event)" }, properties: { "attr.tabindex": "grid.rowFocus" }, classAttribute: "pbl-ngrid-row pbl-row-detail-parent" }, providers: [
        { provide: CdkRow, useExisting: PblNgridDetailRowComponent }
    ], viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["pblNgridDetailRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, styles: [".pbl-row-detail-parent{position:relative;cursor:pointer}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-row[detailRow]', exportAs: 'pblNgridDetailRow', host: {
                        class: 'pbl-ngrid-row pbl-row-detail-parent',
                        role: 'row',
                        '[attr.tabindex]': 'grid.rowFocus',
                        '(keydown)': 'handleKeydown($event)'
                    }, template: PBL_NGRID_ROW_TEMPLATE, providers: [
                        { provide: CdkRow, useExisting: PblNgridDetailRowComponent }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".pbl-row-detail-parent{position:relative;cursor:pointer}\n"] }]
        }], propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });

// tslint:disable:use-host-property-decorator
/**
 * Marks the element as the display element for the detail row itself.
 */
class PblNgridDetailRowDefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'detailRow';
    }
}
/** @nocollapse */ PblNgridDetailRowDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridDetailRowDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDetailRowDefDirective, selector: "[pblNgridDetailRowDef]", inputs: { hasAnimation: ["pblNgridDetailRowDefHasAnimation", "hasAnimation"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowDefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridDetailRowDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; }, propDecorators: { hasAnimation: [{
                type: Input,
                args: ['pblNgridDetailRowDefHasAnimation']
            }] } });
class PblNgridDetailRowParentRefDirective extends PblNgridRowDef {
    ngOnInit() {
        this.registry.setSingle('detailRowParent', this);
    }
    ngOnDestroy() {
        if (this.registry.getSingle('detailRowParent') === this) {
            this.registry.setSingle('detailRowParent', undefined);
        }
    }
}
/** @nocollapse */ PblNgridDetailRowParentRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowParentRefDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridDetailRowParentRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDetailRowParentRefDirective, selector: "[pblNgridDetailRowParentRef]", inputs: { columns: ["pblNgridDetailRowParentRef", "columns"], when: ["pblNgridDetailRowParentRefWhen", "when"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowParentRefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridDetailRowParentRef]',
                    inputs: ['columns: pblNgridDetailRowParentRef', 'when: pblNgridDetailRowParentRefWhen'],
                }]
        }] });

const NOOP = () => { };
/**
 * In charge of handling the lifecycle of detail row instances.
 * The whole lifecycle: Create, update, move, destroy, etc...
 *
 * This controller also sync's the rendering process to make sure we reuse detail rom elements within
 * a single rendering cycle (i.e. not long term caching but a short term one).
 * This is done for performance and to prevent flickering when a row is moved into a different element due to virtual scroll.
 * When this happen we just want to move all dom elements properly, swap the context and trigger change detection.
 * If we have left over rows to render we create new elements or if we have left over rows to clear, we remove them.
 * The logic for this relay on the fact that the row's context.$implicit is updated in a sync iteration by the cdk table
 * and afterwards we will have the onRenderRows event fired, allowing us to sync changes.
 * We also relay on the fact that the event run immediately after the iterations and everything is sync.
 *
 * > In the future, this is where we can support detail row caching
 */
class DetailRowController {
    constructor(vcRef, extApi) {
        this.vcRef = vcRef;
        this.extApi = extApi;
        this.viewMap = new Map();
        this.pendingOps = new Map();
        this.deferOps = false;
        this.runMeasure = () => this.extApi.grid.viewport.reMeasureCurrentRenderedContent();
        extApi.onInit(() => {
            this.detailRowDef = extApi.grid.registry.getSingle('detailRow');
            extApi.cdkTable.beforeRenderRows.subscribe(() => this.deferOps = true);
            extApi.cdkTable.onRenderRows.subscribe(() => this.flushPendingOps());
        });
        extApi.grid.registry.changes
            .subscribe(changes => {
            for (const c of changes) {
                switch (c.type) {
                    case 'detailRow':
                        if (c.op === 'remove') {
                            this.detailRowDef = undefined;
                        }
                        else {
                            this.detailRowDef = c.value;
                        }
                        break;
                }
            }
        });
    }
    render(parent, fromRender) {
        if (this.viewMap.has(parent)) {
            this.pendingOps.delete(parent); // if clear, then render we don't want to clear it later
            this.updateDetailRow(parent);
            return true;
        }
        else if (!this.deferOps) {
            return this._render(parent, fromRender);
        }
        else if (parent.context.$implicit && this.detailRowDef) {
            this.pendingOps.set(parent, { type: 'render', fromRender });
            return true;
        }
        return false;
    }
    clearDetailRow(parent, fromRender) {
        const state = this.viewMap.get(parent);
        if (state) {
            if (this.deferOps) {
                this.pendingOps.set(parent, { type: 'clear', fromRender });
            }
            else {
                this._clearDetailRow(parent, fromRender);
            }
        }
    }
    updateDetailRow(parent) {
        const state = this.viewMap.get(parent);
        if (state) {
            Object.assign(state.viewRef.context, this.createDetailRowContext(parent, true));
            state.viewRef.detectChanges();
        }
    }
    getDetailRowHeight(parent) {
        let total = 0;
        const state = this.viewMap.get(parent);
        if (state) {
            for (const e of state.viewRef.rootNodes) {
                total += e.getBoundingClientRect().height;
            }
        }
        return total;
    }
    detectChanges(parent) {
        const state = this.viewMap.get(parent);
        if (state) {
            state.viewRef.detectChanges();
        }
    }
    createDetailRowContext(parent, fromRender) {
        return {
            $implicit: parent.context.$implicit,
            rowContext: parent.context,
            animation: { fromRender, end: () => this.checkHasAnimation(fromRender) ? this.runMeasure() : undefined, },
        };
    }
    flushPendingOps() {
        if (this.deferOps) {
            this.deferOps = false;
            const toRender = [];
            const toClear = [];
            for (const entry of this.pendingOps.entries()) {
                const col = entry[1].type === 'clear' ? toClear : toRender;
                col.push(entry);
            }
            this.pendingOps.clear();
            for (const [parent, op] of toRender) {
                if (this.viewMap.has(parent)) {
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error('Invalid detail row state.');
                    }
                    return;
                }
                if (toClear.length) {
                    const [clearParent] = toClear.pop();
                    this.viewMap.set(parent, this.viewMap.get(clearParent));
                    this.viewMap.delete(clearParent);
                    this.insertElementsToRow(parent); // don't detect changes, we'll do it in updateDetailRow
                    this.updateDetailRow(parent);
                    // notify about size changes
                    if (!this.checkHasAnimation(op.fromRender)) {
                        this.runMeasure();
                    }
                }
                else {
                    // when no more cleared left for reuse
                    this._render(parent, op.fromRender);
                }
            }
            // remove cleared we can't reuse
            for (const [parent, op] of toClear) {
                this._clearDetailRow(parent, op.fromRender);
            }
        }
    }
    _render(parent, fromRender) {
        if (parent.context.$implicit && this.detailRowDef) {
            const context = this.createDetailRowContext(parent, fromRender);
            this.viewMap.set(parent, { viewRef: this.vcRef.createEmbeddedView(this.detailRowDef.tRef, context) });
            this.insertElementsToRow(parent, true);
            // notify about size changes
            if (!this.checkHasAnimation(fromRender)) {
                this.runMeasure();
            }
            return true;
        }
        return false;
    }
    _clearDetailRow(parent, fromRender) {
        const state = this.viewMap.get(parent);
        if (state) {
            const { viewRef } = state;
            if (viewRef.context.animation.fromRender !== fromRender) {
                viewRef.context.animation.fromRender = fromRender;
                viewRef.detectChanges();
            }
            viewRef.destroy();
            if (!this.checkHasAnimation(fromRender)) {
                this.runMeasure();
            }
            this.viewMap.delete(parent);
        }
    }
    insertElementsToRow(parent, detectChanges) {
        const { viewRef } = this.viewMap.get(parent);
        const beforeNode = parent.element.nextSibling;
        for (const e of viewRef.rootNodes) {
            parent.element.parentElement.insertBefore(e, beforeNode);
        }
        if (detectChanges) {
            viewRef.detectChanges();
        }
    }
    checkHasAnimation(fromRender) {
        return this.detailRowDef.hasAnimation === 'always' || (this.detailRowDef.hasAnimation === 'interaction' && !fromRender);
    }
}

const ROW_WHEN_TRUE = () => true;
const ROW_WHEN_FALSE = () => false;
function toggleDetailRow(grid, row, forceState) {
    const controller = PblNgridPluginController.find(grid);
    if (controller) {
        const plugin = controller.getPlugin(PLUGIN_KEY);
        if (plugin) {
            return plugin.toggleDetailRow(row, forceState);
        }
    }
}
class PblNgridDetailRowPluginDirective {
    constructor(vcRef, pluginCtrl, ngZone, injector) {
        this.pluginCtrl = pluginCtrl;
        this.ngZone = ngZone;
        this.injector = injector;
        /**
         * Set the behavior when the row's context is changed while the detail row is opened  (another row is displayed in place of the current row) or closed.
         *
         * - context: use the context to determine if to open or close the detail row
         * - ignore: don't do anything, leave as is (for manual intervention)
         * - close: close the detail row
         * - render: re-render the row with the new context
         *
         * The default behavior is `context`
         *
         * This scenario will pop-up when using pagination and the user move between pages or change the page size.
         * It might also happen when the data is updated due to custom refresh calls on the datasource or any other scenario that might invoke a datasource update.
         *
         * The `ignore` phase, when used, will not trigger an update, leaving the detail row opened and showing data from the previous row.
         * The `ignore` is intended for use with `toggledRowContextChange`, which will emit when the row context has changed, this will allow the developer to
         * toggle the row (mimic `close`) or update the context manually. For example, if toggling open the detail row invokes a "fetch" operation that retrieves data for the detail row
         * this will allow updates on context change.
         *
         * Usually, what you will want is "context" (the default) which will remember the last state of the row and open it based on it.
         *
         * > Note that for "context" to work you need to use a datasource in client side mode and it must have a primary/identity column (pIndex) or it will not be able to identify the rows.
         *
         * > Note that `toggledRowContextChange` fires regardless of the value set in `whenContextChange`
         */
        this.whenContextChange = 'context';
        /**
         * Emits whenever a detail row instance is toggled on/off
         * Emits an event handler with the row, the toggle state and a toggle operation method.
         */
        this.toggleChange = new EventEmitter();
        /**
         * Emits whenever the row context has changed while the row is toggled open.
         * This scenario is unique and will occur only when a detail row is opened AND the parent row has changed.
         *
         * For example, when using pagination and the user navigates to the next/previous set or when the rows per page size is changed.
         * It might also occur when the data is updated due to custom refresh calls on the datasource or any other scenario that might invoke a datasource update.
         *
         * Emits an event handler with the row, the toggle state and a toggle operation method.
         */
        this.toggledRowContextChange = new EventEmitter();
        this._isSimpleRow = ROW_WHEN_TRUE;
        this._isDetailRow = ROW_WHEN_FALSE;
        this._detailRowRows = new Set();
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        this.grid = pluginCtrl.extApi.grid;
        this.detailRowCtrl = new DetailRowController(vcRef, pluginCtrl.extApi);
        pluginCtrl.onInit()
            .subscribe(() => {
            pluginCtrl.ensurePlugin('targetEvents'); // Depends on target-events plugin
            this.grid.registry.changes
                .subscribe(changes => {
                for (const c of changes) {
                    switch (c.type) {
                        case 'detailRowParent':
                            if (c.op === 'remove') {
                                this.pluginCtrl.extApi.cdkTable.removeRowDef(c.value);
                                this._detailRowDef = undefined;
                            }
                            this.setupDetailRowParent();
                            break;
                    }
                }
            });
            // if we start with an initial value, then update the grid cause we didn't do that
            // when it was set (we cant cause we're not init)
            // otherwise just setup the parent.
            if (this._detailRow) {
                this.updateTable();
            }
            else {
                this.setupDetailRowParent();
            }
        });
    }
    /**
     * Detail row control (none / all rows / selective rows)
     *
     * A detail row is an additional row added below a row rendered with the context of the row above it.
     *
     * You can enable/disable detail row for the entire grid by setting `detailRow` to true/false respectively.
     * To control detail row per row, provide a predicate.
     */
    get detailRow() { return this._detailRow; }
    set detailRow(value) {
        if (this._detailRow !== value) {
            const grid = this.grid;
            if (typeof value === 'function') {
                this._isSimpleRow = (index, rowData) => !value(index, rowData);
                this._isDetailRow = value;
            }
            else {
                value = coerceBooleanProperty(value);
                this._isDetailRow = value ? ROW_WHEN_TRUE : ROW_WHEN_FALSE;
                this._isSimpleRow = value ? ROW_WHEN_FALSE : ROW_WHEN_TRUE;
            }
            this._detailRow = value;
            if (grid.isInit) {
                this.updateTable();
            }
        }
    }
    set singleDetailRow(value) {
        value = coerceBooleanProperty(value);
        if (this._forceSingle !== value) {
            this._forceSingle = value;
            if (value && this._openedRow && this._openedRow.expended) {
                for (const detailRow of this._detailRowRows) {
                    if (detailRow.context.$implicit !== this._openedRow.row) {
                        detailRow.toggle(false);
                    }
                }
            }
        }
    }
    addDetailRow(detailRow) {
        this._detailRowRows.add(detailRow);
    }
    removeDetailRow(detailRow) {
        this._detailRowRows.delete(detailRow);
    }
    toggleDetailRow(row, forceState) {
        for (const detailRow of this._detailRowRows) {
            if (detailRow.context.$implicit === row) {
                detailRow.toggle(forceState);
                return detailRow.expended;
            }
        }
    }
    markForCheck() {
        if (!this._cdPending) {
            this._cdPending = true;
            this.ngZone.runOutsideAngular(() => Promise.resolve()
                .then(() => {
                this.ngZone.run(() => {
                    var _a;
                    this._cdPending = false;
                    (_a = this._defaultParentRef) === null || _a === void 0 ? void 0 : _a.changeDetectorRef.markForCheck();
                });
            }));
        }
    }
    ngOnDestroy() {
        if (this._defaultParentRef) {
            this._defaultParentRef.destroy();
        }
        this._removePlugin(this.grid);
    }
    /** @internal */
    detailRowToggled(event) {
        // logic for closing previous row
        const isSelf = this._openedRow && this._openedRow.row === event.row;
        if (event.expended) {
            if (this._forceSingle && this._openedRow && this._openedRow.expended && !isSelf) {
                this._openedRow.toggle();
            }
            this._openedRow = event;
        }
        else if (isSelf) {
            this._openedRow = undefined;
        }
        this.toggleChange.emit(event);
    }
    setupDetailRowParent() {
        const grid = this.grid;
        const cdkTable = this.pluginCtrl.extApi.cdkTable;
        if (this._detailRowDef) {
            cdkTable.removeRowDef(this._detailRowDef);
            this._detailRowDef = undefined;
        }
        if (this.detailRow) {
            let detailRow = this.pluginCtrl.extApi.registry.getSingle('detailRowParent');
            if (detailRow) {
                this._detailRowDef = detailRow = detailRow.clone();
                Object.defineProperty(detailRow, 'when', { enumerable: true, get: () => this._isDetailRow });
            }
            else if (!this._defaultParentRef) {
                // We don't have a template in the registry, so we register the default component which will push a new template to the registry
                // TODO: move to module? set in root registry? put elsewhere to avoid grid sync (see event of registry change)...
                this._defaultParentRef = this.injector.get(ComponentFactoryResolver)
                    .resolveComponentFactory(PblNgridDefaultDetailRowParentComponent)
                    .create(this.injector);
                this._defaultParentRef.changeDetectorRef.detectChanges(); // kick it for immediate emission of the registry value
                return;
            }
        }
        this.resetTableRowDefs();
    }
    resetTableRowDefs() {
        if (this._detailRowDef) {
            this._detailRow === false
                ? this.pluginCtrl.extApi.cdkTable.removeRowDef(this._detailRowDef)
                : this.pluginCtrl.extApi.cdkTable.addRowDef(this._detailRowDef);
        }
    }
    /**
     * Update the grid with detail row info.
     * Instead of calling for a change detection cycle we can assign the new predicates directly to the pblNgridRowDef instances.
     */
    updateTable() {
        this.grid._tableRowDef.when = this._isSimpleRow;
        this.setupDetailRowParent();
        // Once we changed the `when` predicate on the `CdkRowDef` we must:
        //   1. Update the row cache (property `rowDefs`) to reflect the new change
        this.pluginCtrl.extApi.cdkTable.updateRowDefCache();
        //   2. re-render all rows.
        // The logic for re-rendering all rows is handled in `CdkTable._forceRenderDataRows()` which is a private method.
        // This is a workaround, assigning to `multiTemplateDataRows` will invoke the setter which
        // also calls `CdkTable._forceRenderDataRows()`
        // TODO: This is risky, the setter logic might change.
        // for example, if material will chack for change in `multiTemplateDataRows` setter from previous value...
        this.pluginCtrl.extApi.cdkTable.multiTemplateDataRows = !!this._detailRow;
    }
}
/** @nocollapse */ PblNgridDetailRowPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowPluginDirective, deps: [{ token: i0.ViewContainerRef }, { token: i1.PblNgridPluginController }, { token: i0.NgZone }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridDetailRowPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDetailRowPluginDirective, selector: "pbl-ngrid[detailRow]", inputs: { detailRow: "detailRow", singleDetailRow: "singleDetailRow", excludeToggleFrom: "excludeToggleFrom", whenContextChange: "whenContextChange" }, outputs: { toggleChange: "toggleChange", toggledRowContextChange: "toggledRowContextChange" }, exportAs: ["pblNgridDetailRow"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowPluginDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[detailRow]', exportAs: 'pblNgridDetailRow' }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i1.PblNgridPluginController }, { type: i0.NgZone }, { type: i0.Injector }]; }, propDecorators: { detailRow: [{
                type: Input
            }], singleDetailRow: [{
                type: Input
            }], excludeToggleFrom: [{
                type: Input
            }], whenContextChange: [{
                type: Input
            }], toggleChange: [{
                type: Output
            }], toggledRowContextChange: [{
                type: Output
            }] } });
/**
 * Use to set the a default `pblNgridDetailRowParentRef` if the user did not set one.
 * @internal
 */
class PblNgridDefaultDetailRowParentComponent {
}
/** @nocollapse */ PblNgridDefaultDetailRowParentComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultDetailRowParentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDefaultDetailRowParentComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDefaultDetailRowParentComponent, selector: "pbl-ngrid-default-detail-row-parent", ngImport: i0, template: `<pbl-ngrid-row *pblNgridDetailRowParentRef="let row;" detailRow></pbl-ngrid-row>`, isInline: true, dependencies: [{ kind: "component", type: PblNgridDetailRowComponent, selector: "pbl-ngrid-row[detailRow]", exportAs: ["pblNgridDetailRow"] }, { kind: "directive", type: PblNgridDetailRowParentRefDirective, selector: "[pblNgridDetailRowParentRef]", inputs: ["pblNgridDetailRowParentRef", "pblNgridDetailRowParentRefWhen"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultDetailRowParentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-default-detail-row-parent',
                    template: `<pbl-ngrid-row *pblNgridDetailRowParentRef="let row;" detailRow></pbl-ngrid-row>`,
                }]
        }] });

const DETAIL_ROW = [
    PblNgridDetailRowPluginDirective,
    PblNgridDetailRowComponent,
    PblNgridDetailRowParentRefDirective,
    PblNgridDetailRowDefDirective,
];
class PblNgridDetailRowModule {
}
PblNgridDetailRowModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridDetailRowPluginDirective);
/** @nocollapse */ PblNgridDetailRowModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridDetailRowModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, declarations: [PblNgridDetailRowPluginDirective,
        PblNgridDetailRowComponent,
        PblNgridDetailRowParentRefDirective,
        PblNgridDetailRowDefDirective, PblNgridDefaultDetailRowParentComponent], imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridDetailRowPluginDirective,
        PblNgridDetailRowComponent,
        PblNgridDetailRowParentRefDirective,
        PblNgridDetailRowDefDirective] });
/** @nocollapse */ PblNgridDetailRowModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [DETAIL_ROW, PblNgridDefaultDetailRowParentComponent],
                    exports: [DETAIL_ROW]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridDetailRowComponent, PblNgridDetailRowDefDirective, PblNgridDetailRowModule, PblNgridDetailRowParentRefDirective, PblNgridDetailRowPluginDirective, toggleDetailRow };
//# sourceMappingURL=pebula-ngrid-detail-row.mjs.map
