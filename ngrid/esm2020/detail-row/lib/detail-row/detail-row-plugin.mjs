import { Directive, EventEmitter, Injector, Input, Output, ComponentFactoryResolver, NgZone, ViewContainerRef, Component } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { PblNgridPluginController } from '@asafmalin/ngrid';
import { PLUGIN_KEY } from './tokens';
import { DetailRowController } from './detail-row-controller';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
import * as i2 from "./row";
import * as i3 from "./directives";
export const ROW_WHEN_TRUE = () => true;
export const ROW_WHEN_FALSE = () => false;
export function toggleDetailRow(grid, row, forceState) {
    const controller = PblNgridPluginController.find(grid);
    if (controller) {
        const plugin = controller.getPlugin(PLUGIN_KEY);
        if (plugin) {
            return plugin.toggleDetailRow(row, forceState);
        }
    }
}
export class PblNgridDetailRowPluginDirective {
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
                    this._cdPending = false;
                    this._defaultParentRef?.changeDetectorRef.markForCheck();
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
export class PblNgridDefaultDetailRowParentComponent {
}
/** @nocollapse */ PblNgridDefaultDetailRowParentComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultDetailRowParentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDefaultDetailRowParentComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDefaultDetailRowParentComponent, selector: "pbl-ngrid-default-detail-row-parent", ngImport: i0, template: `<pbl-ngrid-row *pblNgridDetailRowParentRef="let row;" detailRow></pbl-ngrid-row>`, isInline: true, dependencies: [{ kind: "component", type: i2.PblNgridDetailRowComponent, selector: "pbl-ngrid-row[detailRow]", exportAs: ["pblNgridDetailRow"] }, { kind: "directive", type: i3.PblNgridDetailRowParentRefDirective, selector: "[pblNgridDetailRowParentRef]", inputs: ["pblNgridDetailRowParentRef", "pblNgridDetailRowParentRefWhen"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultDetailRowParentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-default-detail-row-parent',
                    template: `<pbl-ngrid-row *pblNgridDetailRowParentRef="let row;" detailRow></pbl-ngrid-row>`,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsLXJvdy1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RldGFpbC1yb3cvc3JjL2xpYi9kZXRhaWwtcm93L2RldGFpbC1yb3ctcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQWEsTUFBTSxFQUFFLHdCQUF3QixFQUFnQixNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pLLE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQXFCLHdCQUF3QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVFLE9BQU8sRUFBNEIsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2hFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7OztBQVE5RCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ3hDLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFFMUMsTUFBTSxVQUFVLGVBQWUsQ0FBVSxJQUEwQixFQUFFLEdBQU0sRUFBRSxVQUFvQjtJQUMvRixNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsSUFBSSxVQUFVLEVBQUU7UUFDZCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELElBQUksTUFBTSxFQUFFO1lBQ1YsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUNoRDtLQUNGO0FBQ0gsQ0FBQztBQUdELE1BQU0sT0FBTyxnQ0FB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Z0NBQWdDO2tCQUQ1QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTswTEFVL0QsU0FBUztzQkFBckIsS0FBSztnQkFxQk8sZUFBZTtzQkFBM0IsS0FBSztnQkFpQkcsaUJBQWlCO3NCQUF6QixLQUFLO2dCQTBCRyxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBTUksWUFBWTtzQkFBckIsTUFBTTtnQkFVRyx1QkFBdUI7c0JBQWhDLE1BQU07O0FBbUtUOzs7R0FHRztBQUtILE1BQU0sT0FBTyx1Q0FBdUM7O3VKQUF2Qyx1Q0FBdUM7MklBQXZDLHVDQUF1QywyRUFGeEMsa0ZBQWtGOzJGQUVqRix1Q0FBdUM7a0JBSmxELFNBQVM7bUJBQUM7b0JBQ1YsUUFBUSxFQUFFLHFDQUFxQztvQkFDL0MsUUFBUSxFQUFFLGtGQUFrRjtpQkFDN0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIElucHV0LCBPbkRlc3Ryb3ksIE91dHB1dCwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIE5nWm9uZSwgVmlld0NvbnRhaW5lclJlZiwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmltcG9ydCB7IFBibERldGFpbHNSb3dUb2dnbGVFdmVudCwgUExVR0lOX0tFWSB9IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7IFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50IH0gZnJvbSAnLi9yb3cnO1xuaW1wb3J0IHsgUGJsTmdyaWREZXRhaWxSb3dQYXJlbnRSZWZEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHsgRGV0YWlsUm93Q29udHJvbGxlciB9IGZyb20gJy4vZGV0YWlsLXJvdy1jb250cm9sbGVyJztcblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvbGliL2V4dC90eXBlcycge1xuICBpbnRlcmZhY2UgUGJsTmdyaWRQbHVnaW5FeHRlbnNpb24ge1xuICAgIGRldGFpbFJvdz86IFBibE5ncmlkRGV0YWlsUm93UGx1Z2luRGlyZWN0aXZlPGFueT47XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFJPV19XSEVOX1RSVUUgPSAoKSA9PiB0cnVlO1xuZXhwb3J0IGNvbnN0IFJPV19XSEVOX0ZBTFNFID0gKCkgPT4gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVEZXRhaWxSb3c8VCA9IGFueT4oZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8VD4sIHJvdzogVCwgZm9yY2VTdGF0ZT86IGJvb2xlYW4pOiBib29sZWFuIHwgdm9pZCB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZChncmlkKTtcbiAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICBjb25zdCBwbHVnaW4gPSBjb250cm9sbGVyLmdldFBsdWdpbihQTFVHSU5fS0VZKTtcbiAgICBpZiAocGx1Z2luKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLnRvZ2dsZURldGFpbFJvdyhyb3csIGZvcmNlU3RhdGUpO1xuICAgIH1cbiAgfVxufVxuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdwYmwtbmdyaWRbZGV0YWlsUm93XScsIGV4cG9ydEFzOiAncGJsTmdyaWREZXRhaWxSb3cnIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWREZXRhaWxSb3dQbHVnaW5EaXJlY3RpdmU8VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogRGV0YWlsIHJvdyBjb250cm9sIChub25lIC8gYWxsIHJvd3MgLyBzZWxlY3RpdmUgcm93cylcbiAgICpcbiAgICogQSBkZXRhaWwgcm93IGlzIGFuIGFkZGl0aW9uYWwgcm93IGFkZGVkIGJlbG93IGEgcm93IHJlbmRlcmVkIHdpdGggdGhlIGNvbnRleHQgb2YgdGhlIHJvdyBhYm92ZSBpdC5cbiAgICpcbiAgICogWW91IGNhbiBlbmFibGUvZGlzYWJsZSBkZXRhaWwgcm93IGZvciB0aGUgZW50aXJlIGdyaWQgYnkgc2V0dGluZyBgZGV0YWlsUm93YCB0byB0cnVlL2ZhbHNlIHJlc3BlY3RpdmVseS5cbiAgICogVG8gY29udHJvbCBkZXRhaWwgcm93IHBlciByb3csIHByb3ZpZGUgYSBwcmVkaWNhdGUuXG4gICAqL1xuICBASW5wdXQoKSBnZXQgZGV0YWlsUm93KCk6ICggKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IFQpID0+IGJvb2xlYW4gKSB8IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGV0YWlsUm93OyB9XG4gIHNldCBkZXRhaWxSb3codmFsdWU6ICggKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IFQpID0+IGJvb2xlYW4gKSB8IGJvb2xlYW4gKSB7XG4gICAgaWYgKHRoaXMuX2RldGFpbFJvdyAhPT0gdmFsdWUpIHtcbiAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWQ7XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5faXNTaW1wbGVSb3cgPSAoaW5kZXg6IG51bWJlciwgcm93RGF0YTogVCkgPT4gISh2YWx1ZSBhcyBhbnkpKGluZGV4LCByb3dEYXRhKTtcbiAgICAgICAgdGhpcy5faXNEZXRhaWxSb3cgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICAgICAgdGhpcy5faXNEZXRhaWxSb3cgPSB2YWx1ZSA/IFJPV19XSEVOX1RSVUUgOiBST1dfV0hFTl9GQUxTRTtcbiAgICAgICAgdGhpcy5faXNTaW1wbGVSb3cgPSB2YWx1ZSA/IFJPV19XSEVOX0ZBTFNFIDogUk9XX1dIRU5fVFJVRTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RldGFpbFJvdyA9IHZhbHVlO1xuXG4gICAgICBpZiAoZ3JpZC5pc0luaXQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVUYWJsZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgpIHNldCBzaW5nbGVEZXRhaWxSb3codmFsdWU6IGJvb2xlYW4pIHtcbiAgICB2YWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgaWYgKHRoaXMuX2ZvcmNlU2luZ2xlICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fZm9yY2VTaW5nbGUgPSB2YWx1ZTtcbiAgICAgIGlmICh2YWx1ZSAmJiB0aGlzLl9vcGVuZWRSb3cgJiYgdGhpcy5fb3BlbmVkUm93LmV4cGVuZGVkKSB7XG4gICAgICAgIGZvciAoY29uc3QgZGV0YWlsUm93IG9mIHRoaXMuX2RldGFpbFJvd1Jvd3MpIHtcbiAgICAgICAgICBpZiAoZGV0YWlsUm93LmNvbnRleHQuJGltcGxpY2l0ICE9PSB0aGlzLl9vcGVuZWRSb3cucm93KSB7XG4gICAgICAgICAgICBkZXRhaWxSb3cudG9nZ2xlKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBsaXN0IG9mIGNvbHVtbnMgdGhhdCB3aWxsIG5vdCB0cmlnZ2VyIGEgZGV0YWlsIHJvdyB0b2dnbGUgd2hlbiBjbGlja2VkLlxuICAgKi9cbiAgQElucHV0KCkgZXhjbHVkZVRvZ2dsZUZyb206IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGJlaGF2aW9yIHdoZW4gdGhlIHJvdydzIGNvbnRleHQgaXMgY2hhbmdlZCB3aGlsZSB0aGUgZGV0YWlsIHJvdyBpcyBvcGVuZWQgIChhbm90aGVyIHJvdyBpcyBkaXNwbGF5ZWQgaW4gcGxhY2Ugb2YgdGhlIGN1cnJlbnQgcm93KSBvciBjbG9zZWQuXG4gICAqXG4gICAqIC0gY29udGV4dDogdXNlIHRoZSBjb250ZXh0IHRvIGRldGVybWluZSBpZiB0byBvcGVuIG9yIGNsb3NlIHRoZSBkZXRhaWwgcm93XG4gICAqIC0gaWdub3JlOiBkb24ndCBkbyBhbnl0aGluZywgbGVhdmUgYXMgaXMgKGZvciBtYW51YWwgaW50ZXJ2ZW50aW9uKVxuICAgKiAtIGNsb3NlOiBjbG9zZSB0aGUgZGV0YWlsIHJvd1xuICAgKiAtIHJlbmRlcjogcmUtcmVuZGVyIHRoZSByb3cgd2l0aCB0aGUgbmV3IGNvbnRleHRcbiAgICpcbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgYGNvbnRleHRgXG4gICAqXG4gICAqIFRoaXMgc2NlbmFyaW8gd2lsbCBwb3AtdXAgd2hlbiB1c2luZyBwYWdpbmF0aW9uIGFuZCB0aGUgdXNlciBtb3ZlIGJldHdlZW4gcGFnZXMgb3IgY2hhbmdlIHRoZSBwYWdlIHNpemUuXG4gICAqIEl0IG1pZ2h0IGFsc28gaGFwcGVuIHdoZW4gdGhlIGRhdGEgaXMgdXBkYXRlZCBkdWUgdG8gY3VzdG9tIHJlZnJlc2ggY2FsbHMgb24gdGhlIGRhdGFzb3VyY2Ugb3IgYW55IG90aGVyIHNjZW5hcmlvIHRoYXQgbWlnaHQgaW52b2tlIGEgZGF0YXNvdXJjZSB1cGRhdGUuXG4gICAqXG4gICAqIFRoZSBgaWdub3JlYCBwaGFzZSwgd2hlbiB1c2VkLCB3aWxsIG5vdCB0cmlnZ2VyIGFuIHVwZGF0ZSwgbGVhdmluZyB0aGUgZGV0YWlsIHJvdyBvcGVuZWQgYW5kIHNob3dpbmcgZGF0YSBmcm9tIHRoZSBwcmV2aW91cyByb3cuXG4gICAqIFRoZSBgaWdub3JlYCBpcyBpbnRlbmRlZCBmb3IgdXNlIHdpdGggYHRvZ2dsZWRSb3dDb250ZXh0Q2hhbmdlYCwgd2hpY2ggd2lsbCBlbWl0IHdoZW4gdGhlIHJvdyBjb250ZXh0IGhhcyBjaGFuZ2VkLCB0aGlzIHdpbGwgYWxsb3cgdGhlIGRldmVsb3BlciB0b1xuICAgKiB0b2dnbGUgdGhlIHJvdyAobWltaWMgYGNsb3NlYCkgb3IgdXBkYXRlIHRoZSBjb250ZXh0IG1hbnVhbGx5LiBGb3IgZXhhbXBsZSwgaWYgdG9nZ2xpbmcgb3BlbiB0aGUgZGV0YWlsIHJvdyBpbnZva2VzIGEgXCJmZXRjaFwiIG9wZXJhdGlvbiB0aGF0IHJldHJpZXZlcyBkYXRhIGZvciB0aGUgZGV0YWlsIHJvd1xuICAgKiB0aGlzIHdpbGwgYWxsb3cgdXBkYXRlcyBvbiBjb250ZXh0IGNoYW5nZS5cbiAgICpcbiAgICogVXN1YWxseSwgd2hhdCB5b3Ugd2lsbCB3YW50IGlzIFwiY29udGV4dFwiICh0aGUgZGVmYXVsdCkgd2hpY2ggd2lsbCByZW1lbWJlciB0aGUgbGFzdCBzdGF0ZSBvZiB0aGUgcm93IGFuZCBvcGVuIGl0IGJhc2VkIG9uIGl0LlxuICAgKlxuICAgKiA+IE5vdGUgdGhhdCBmb3IgXCJjb250ZXh0XCIgdG8gd29yayB5b3UgbmVlZCB0byB1c2UgYSBkYXRhc291cmNlIGluIGNsaWVudCBzaWRlIG1vZGUgYW5kIGl0IG11c3QgaGF2ZSBhIHByaW1hcnkvaWRlbnRpdHkgY29sdW1uIChwSW5kZXgpIG9yIGl0IHdpbGwgbm90IGJlIGFibGUgdG8gaWRlbnRpZnkgdGhlIHJvd3MuXG4gICAqXG4gICAqID4gTm90ZSB0aGF0IGB0b2dnbGVkUm93Q29udGV4dENoYW5nZWAgZmlyZXMgcmVnYXJkbGVzcyBvZiB0aGUgdmFsdWUgc2V0IGluIGB3aGVuQ29udGV4dENoYW5nZWBcbiAgICovXG4gIEBJbnB1dCgpIHdoZW5Db250ZXh0Q2hhbmdlOiAnaWdub3JlJyB8ICdjbG9zZScgfCAncmVuZGVyJyB8ICdjb250ZXh0JyA9ICdjb250ZXh0JztcblxuICAvKipcbiAgICogRW1pdHMgd2hlbmV2ZXIgYSBkZXRhaWwgcm93IGluc3RhbmNlIGlzIHRvZ2dsZWQgb24vb2ZmXG4gICAqIEVtaXRzIGFuIGV2ZW50IGhhbmRsZXIgd2l0aCB0aGUgcm93LCB0aGUgdG9nZ2xlIHN0YXRlIGFuZCBhIHRvZ2dsZSBvcGVyYXRpb24gbWV0aG9kLlxuICAgKi9cbiAgQE91dHB1dCgpIHRvZ2dsZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8UGJsRGV0YWlsc1Jvd1RvZ2dsZUV2ZW50PFQ+PigpO1xuICAvKipcbiAgICogRW1pdHMgd2hlbmV2ZXIgdGhlIHJvdyBjb250ZXh0IGhhcyBjaGFuZ2VkIHdoaWxlIHRoZSByb3cgaXMgdG9nZ2xlZCBvcGVuLlxuICAgKiBUaGlzIHNjZW5hcmlvIGlzIHVuaXF1ZSBhbmQgd2lsbCBvY2N1ciBvbmx5IHdoZW4gYSBkZXRhaWwgcm93IGlzIG9wZW5lZCBBTkQgdGhlIHBhcmVudCByb3cgaGFzIGNoYW5nZWQuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3aGVuIHVzaW5nIHBhZ2luYXRpb24gYW5kIHRoZSB1c2VyIG5hdmlnYXRlcyB0byB0aGUgbmV4dC9wcmV2aW91cyBzZXQgb3Igd2hlbiB0aGUgcm93cyBwZXIgcGFnZSBzaXplIGlzIGNoYW5nZWQuXG4gICAqIEl0IG1pZ2h0IGFsc28gb2NjdXIgd2hlbiB0aGUgZGF0YSBpcyB1cGRhdGVkIGR1ZSB0byBjdXN0b20gcmVmcmVzaCBjYWxscyBvbiB0aGUgZGF0YXNvdXJjZSBvciBhbnkgb3RoZXIgc2NlbmFyaW8gdGhhdCBtaWdodCBpbnZva2UgYSBkYXRhc291cmNlIHVwZGF0ZS5cbiAgICpcbiAgICogRW1pdHMgYW4gZXZlbnQgaGFuZGxlciB3aXRoIHRoZSByb3csIHRoZSB0b2dnbGUgc3RhdGUgYW5kIGEgdG9nZ2xlIG9wZXJhdGlvbiBtZXRob2QuXG4gICAqL1xuICBAT3V0cHV0KCkgdG9nZ2xlZFJvd0NvbnRleHRDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFBibERldGFpbHNSb3dUb2dnbGVFdmVudDxUPj4oKTtcblxuICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlsUm93Q3RybDogRGV0YWlsUm93Q29udHJvbGxlcjtcblxuICBwcml2YXRlIF9vcGVuZWRSb3c/OiBQYmxEZXRhaWxzUm93VG9nZ2xlRXZlbnQ8VD47XG4gIHByaXZhdGUgX2ZvcmNlU2luZ2xlOiBib29sZWFuO1xuICBwcml2YXRlIF9pc1NpbXBsZVJvdzogKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IFQpID0+IGJvb2xlYW4gPSBST1dfV0hFTl9UUlVFO1xuICBwcml2YXRlIF9pc0RldGFpbFJvdzogKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IFQpID0+IGJvb2xlYW4gPSBST1dfV0hFTl9GQUxTRTtcbiAgcHJpdmF0ZSBfZGV0YWlsUm93Um93cyA9IG5ldyBTZXQ8UGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQ+KCk7XG4gIHByaXZhdGUgX2RldGFpbFJvdzogKCAoaW5kZXg6IG51bWJlciwgcm93RGF0YTogVCkgPT4gYm9vbGVhbiApIHwgYm9vbGVhbjtcbiAgcHJpdmF0ZSBfZGV0YWlsUm93RGVmOiBQYmxOZ3JpZERldGFpbFJvd1BhcmVudFJlZkRpcmVjdGl2ZTxUPjtcbiAgcHJpdmF0ZSBfZGVmYXVsdFBhcmVudFJlZjogQ29tcG9uZW50UmVmPFBibE5ncmlkRGVmYXVsdERldGFpbFJvd1BhcmVudENvbXBvbmVudD47XG4gIHByaXZhdGUgX3JlbW92ZVBsdWdpbjogKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHZvaWQ7XG4gIHByaXZhdGUgX2NkUGVuZGluZzogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHBsdWdpbkN0cmw6IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlcjxUPixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4gPSBwbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcbiAgICB0aGlzLmdyaWQgPSBwbHVnaW5DdHJsLmV4dEFwaS5ncmlkO1xuICAgIHRoaXMuZGV0YWlsUm93Q3RybCA9IG5ldyBEZXRhaWxSb3dDb250cm9sbGVyKHZjUmVmLCBwbHVnaW5DdHJsLmV4dEFwaSk7XG5cbiAgICBwbHVnaW5DdHJsLm9uSW5pdCgpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgcGx1Z2luQ3RybC5lbnN1cmVQbHVnaW4oJ3RhcmdldEV2ZW50cycpOyAvLyBEZXBlbmRzIG9uIHRhcmdldC1ldmVudHMgcGx1Z2luXG5cbiAgICAgICAgdGhpcy5ncmlkLnJlZ2lzdHJ5LmNoYW5nZXNcbiAgICAgICAgICAuc3Vic2NyaWJlKCBjaGFuZ2VzID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaGFuZ2VzKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoYy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGV0YWlsUm93UGFyZW50JzpcbiAgICAgICAgICAgICAgICAgIGlmIChjLm9wID09PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbkN0cmwuZXh0QXBpLmNka1RhYmxlLnJlbW92ZVJvd0RlZihjLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGV0YWlsUm93RGVmID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgdGhpcy5zZXR1cERldGFpbFJvd1BhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBpZiB3ZSBzdGFydCB3aXRoIGFuIGluaXRpYWwgdmFsdWUsIHRoZW4gdXBkYXRlIHRoZSBncmlkIGNhdXNlIHdlIGRpZG4ndCBkbyB0aGF0XG4gICAgICAgIC8vIHdoZW4gaXQgd2FzIHNldCAod2UgY2FudCBjYXVzZSB3ZSdyZSBub3QgaW5pdClcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGp1c3Qgc2V0dXAgdGhlIHBhcmVudC5cbiAgICAgICAgaWYgKHRoaXMuX2RldGFpbFJvdykge1xuICAgICAgICAgIHRoaXMudXBkYXRlVGFibGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldHVwRGV0YWlsUm93UGFyZW50KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgYWRkRGV0YWlsUm93KGRldGFpbFJvdzogUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXRhaWxSb3dSb3dzLmFkZChkZXRhaWxSb3cpO1xuICB9XG5cbiAgcmVtb3ZlRGV0YWlsUm93KGRldGFpbFJvdzogUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXRhaWxSb3dSb3dzLmRlbGV0ZShkZXRhaWxSb3cpO1xuICB9XG5cbiAgdG9nZ2xlRGV0YWlsUm93KHJvdzogYW55LCBmb3JjZVN0YXRlPzogYm9vbGVhbik6IGJvb2xlYW4gfCB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRldGFpbFJvdyBvZiB0aGlzLl9kZXRhaWxSb3dSb3dzKSB7XG4gICAgICBpZiAoZGV0YWlsUm93LmNvbnRleHQuJGltcGxpY2l0ID09PSByb3cpIHtcbiAgICAgICAgZGV0YWlsUm93LnRvZ2dsZShmb3JjZVN0YXRlKTtcbiAgICAgICAgcmV0dXJuIGRldGFpbFJvdy5leHBlbmRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtYXJrRm9yQ2hlY2soKSB7XG4gICAgaWYgKCF0aGlzLl9jZFBlbmRpbmcpIHtcbiAgICAgIHRoaXMuX2NkUGVuZGluZyA9IHRydWU7XG4gICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2NkUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZGVmYXVsdFBhcmVudFJlZj8uY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFBhcmVudFJlZikge1xuICAgICAgdGhpcy5fZGVmYXVsdFBhcmVudFJlZi5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX3JlbW92ZVBsdWdpbih0aGlzLmdyaWQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBkZXRhaWxSb3dUb2dnbGVkKGV2ZW50OiBQYmxEZXRhaWxzUm93VG9nZ2xlRXZlbnQ8VD4pOiB2b2lkIHtcbiAgICAvLyBsb2dpYyBmb3IgY2xvc2luZyBwcmV2aW91cyByb3dcbiAgICBjb25zdCBpc1NlbGYgPSB0aGlzLl9vcGVuZWRSb3cgJiYgdGhpcy5fb3BlbmVkUm93LnJvdyA9PT0gZXZlbnQucm93O1xuICAgIGlmIChldmVudC5leHBlbmRlZCkge1xuICAgICAgaWYgKHRoaXMuX2ZvcmNlU2luZ2xlICYmIHRoaXMuX29wZW5lZFJvdyAmJiB0aGlzLl9vcGVuZWRSb3cuZXhwZW5kZWQgJiYgIWlzU2VsZikge1xuICAgICAgICB0aGlzLl9vcGVuZWRSb3cudG9nZ2xlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9vcGVuZWRSb3cgPSBldmVudDtcbiAgICB9IGVsc2UgaWYgKGlzU2VsZikge1xuICAgICAgdGhpcy5fb3BlbmVkUm93ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLnRvZ2dsZUNoYW5nZS5lbWl0KGV2ZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBEZXRhaWxSb3dQYXJlbnQoKTogdm9pZCB7XG4gICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZDtcbiAgICBjb25zdCBjZGtUYWJsZSA9IHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGU7XG4gICAgaWYgKHRoaXMuX2RldGFpbFJvd0RlZikge1xuICAgICAgY2RrVGFibGUucmVtb3ZlUm93RGVmKHRoaXMuX2RldGFpbFJvd0RlZik7XG4gICAgICB0aGlzLl9kZXRhaWxSb3dEZWYgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh0aGlzLmRldGFpbFJvdykge1xuICAgICAgbGV0IGRldGFpbFJvdyA9IHRoaXMucGx1Z2luQ3RybC5leHRBcGkucmVnaXN0cnkuZ2V0U2luZ2xlKCdkZXRhaWxSb3dQYXJlbnQnKTtcbiAgICAgIGlmIChkZXRhaWxSb3cpIHtcbiAgICAgICAgdGhpcy5fZGV0YWlsUm93RGVmID0gZGV0YWlsUm93ID0gZGV0YWlsUm93LmNsb25lKCk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZXRhaWxSb3csICd3aGVuJywgeyBlbnVtZXJhYmxlOiB0cnVlLCAgZ2V0OiAoKSA9PiB0aGlzLl9pc0RldGFpbFJvdyB9KTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2RlZmF1bHRQYXJlbnRSZWYpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBhIHRlbXBsYXRlIGluIHRoZSByZWdpc3RyeSwgc28gd2UgcmVnaXN0ZXIgdGhlIGRlZmF1bHQgY29tcG9uZW50IHdoaWNoIHdpbGwgcHVzaCBhIG5ldyB0ZW1wbGF0ZSB0byB0aGUgcmVnaXN0cnlcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0byBtb2R1bGU/IHNldCBpbiByb290IHJlZ2lzdHJ5PyBwdXQgZWxzZXdoZXJlIHRvIGF2b2lkIGdyaWQgc3luYyAoc2VlIGV2ZW50IG9mIHJlZ2lzdHJ5IGNoYW5nZSkuLi5cbiAgICAgICAgdGhpcy5fZGVmYXVsdFBhcmVudFJlZiA9IHRoaXMuaW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcilcbiAgICAgICAgICAucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoUGJsTmdyaWREZWZhdWx0RGV0YWlsUm93UGFyZW50Q29tcG9uZW50KVxuICAgICAgICAgIC5jcmVhdGUodGhpcy5pbmplY3Rvcik7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRQYXJlbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpOyAvLyBraWNrIGl0IGZvciBpbW1lZGlhdGUgZW1pc3Npb24gb2YgdGhlIHJlZ2lzdHJ5IHZhbHVlXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZXNldFRhYmxlUm93RGVmcygpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldFRhYmxlUm93RGVmcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGV0YWlsUm93RGVmKSB7XG4gICAgICB0aGlzLl9kZXRhaWxSb3cgPT09IGZhbHNlXG4gICAgICAgID8gdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jZGtUYWJsZS5yZW1vdmVSb3dEZWYodGhpcy5fZGV0YWlsUm93RGVmKVxuICAgICAgICA6IHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGUuYWRkUm93RGVmKHRoaXMuX2RldGFpbFJvd0RlZilcbiAgICAgIDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBncmlkIHdpdGggZGV0YWlsIHJvdyBpbmZvLlxuICAgKiBJbnN0ZWFkIG9mIGNhbGxpbmcgZm9yIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSB3ZSBjYW4gYXNzaWduIHRoZSBuZXcgcHJlZGljYXRlcyBkaXJlY3RseSB0byB0aGUgcGJsTmdyaWRSb3dEZWYgaW5zdGFuY2VzLlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVUYWJsZSgpOiB2b2lkIHtcbiAgICB0aGlzLmdyaWQuX3RhYmxlUm93RGVmLndoZW4gPSB0aGlzLl9pc1NpbXBsZVJvdztcbiAgICB0aGlzLnNldHVwRGV0YWlsUm93UGFyZW50KCk7XG4gICAgLy8gT25jZSB3ZSBjaGFuZ2VkIHRoZSBgd2hlbmAgcHJlZGljYXRlIG9uIHRoZSBgQ2RrUm93RGVmYCB3ZSBtdXN0OlxuICAgIC8vICAgMS4gVXBkYXRlIHRoZSByb3cgY2FjaGUgKHByb3BlcnR5IGByb3dEZWZzYCkgdG8gcmVmbGVjdCB0aGUgbmV3IGNoYW5nZVxuICAgIHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGUudXBkYXRlUm93RGVmQ2FjaGUoKTtcblxuICAgIC8vICAgMi4gcmUtcmVuZGVyIGFsbCByb3dzLlxuICAgIC8vIFRoZSBsb2dpYyBmb3IgcmUtcmVuZGVyaW5nIGFsbCByb3dzIGlzIGhhbmRsZWQgaW4gYENka1RhYmxlLl9mb3JjZVJlbmRlckRhdGFSb3dzKClgIHdoaWNoIGlzIGEgcHJpdmF0ZSBtZXRob2QuXG4gICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQsIGFzc2lnbmluZyB0byBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCB3aWxsIGludm9rZSB0aGUgc2V0dGVyIHdoaWNoXG4gICAgLy8gYWxzbyBjYWxscyBgQ2RrVGFibGUuX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKWBcbiAgICAvLyBUT0RPOiBUaGlzIGlzIHJpc2t5LCB0aGUgc2V0dGVyIGxvZ2ljIG1pZ2h0IGNoYW5nZS5cbiAgICAvLyBmb3IgZXhhbXBsZSwgaWYgbWF0ZXJpYWwgd2lsbCBjaGFjayBmb3IgY2hhbmdlIGluIGBtdWx0aVRlbXBsYXRlRGF0YVJvd3NgIHNldHRlciBmcm9tIHByZXZpb3VzIHZhbHVlLi4uXG4gICAgdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jZGtUYWJsZS5tdWx0aVRlbXBsYXRlRGF0YVJvd3MgPSAhIXRoaXMuX2RldGFpbFJvdztcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXRhaWxSb3c6IEJvb2xlYW5JbnB1dCB8ICggKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IGFueSkgPT4gYm9vbGVhbiApO1xufVxuXG4vKipcbiAqIFVzZSB0byBzZXQgdGhlIGEgZGVmYXVsdCBgcGJsTmdyaWREZXRhaWxSb3dQYXJlbnRSZWZgIGlmIHRoZSB1c2VyIGRpZCBub3Qgc2V0IG9uZS5cbiAqIEBpbnRlcm5hbFxuICovXG4gQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLWRlZmF1bHQtZGV0YWlsLXJvdy1wYXJlbnQnLFxuICB0ZW1wbGF0ZTogYDxwYmwtbmdyaWQtcm93ICpwYmxOZ3JpZERldGFpbFJvd1BhcmVudFJlZj1cImxldCByb3c7XCIgZGV0YWlsUm93PjwvcGJsLW5ncmlkLXJvdz5gLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZERlZmF1bHREZXRhaWxSb3dQYXJlbnRDb21wb25lbnQgeyB9XG4iXX0=