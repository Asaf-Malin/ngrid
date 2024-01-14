import { EventEmitter, Injector, OnDestroy, NgZone, ViewContainerRef } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import { PblDetailsRowToggleEvent } from './tokens';
import { PblNgridDetailRowComponent } from './row';
import { DetailRowController } from './detail-row-controller';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        detailRow?: PblNgridDetailRowPluginDirective<any>;
    }
}
export declare const ROW_WHEN_TRUE: () => boolean;
export declare const ROW_WHEN_FALSE: () => boolean;
export declare function toggleDetailRow<T = any>(grid: PblNgridComponent<T>, row: T, forceState?: boolean): boolean | void;
export declare class PblNgridDetailRowPluginDirective<T> implements OnDestroy {
    private readonly pluginCtrl;
    private readonly ngZone;
    private readonly injector;
    /**
     * Detail row control (none / all rows / selective rows)
     *
     * A detail row is an additional row added below a row rendered with the context of the row above it.
     *
     * You can enable/disable detail row for the entire grid by setting `detailRow` to true/false respectively.
     * To control detail row per row, provide a predicate.
     */
    get detailRow(): ((index: number, rowData: T) => boolean) | boolean;
    set detailRow(value: ((index: number, rowData: T) => boolean) | boolean);
    set singleDetailRow(value: boolean);
    /**
     * A list of columns that will not trigger a detail row toggle when clicked.
     */
    excludeToggleFrom: string[];
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
    whenContextChange: 'ignore' | 'close' | 'render' | 'context';
    /**
     * Emits whenever a detail row instance is toggled on/off
     * Emits an event handler with the row, the toggle state and a toggle operation method.
     */
    toggleChange: EventEmitter<PblDetailsRowToggleEvent<T>>;
    /**
     * Emits whenever the row context has changed while the row is toggled open.
     * This scenario is unique and will occur only when a detail row is opened AND the parent row has changed.
     *
     * For example, when using pagination and the user navigates to the next/previous set or when the rows per page size is changed.
     * It might also occur when the data is updated due to custom refresh calls on the datasource or any other scenario that might invoke a datasource update.
     *
     * Emits an event handler with the row, the toggle state and a toggle operation method.
     */
    toggledRowContextChange: EventEmitter<PblDetailsRowToggleEvent<T>>;
    readonly detailRowCtrl: DetailRowController;
    private _openedRow?;
    private _forceSingle;
    private _isSimpleRow;
    private _isDetailRow;
    private _detailRowRows;
    private _detailRow;
    private _detailRowDef;
    private _defaultParentRef;
    private _removePlugin;
    private _cdPending;
    private readonly grid;
    constructor(vcRef: ViewContainerRef, pluginCtrl: PblNgridPluginController<T>, ngZone: NgZone, injector: Injector);
    addDetailRow(detailRow: PblNgridDetailRowComponent): void;
    removeDetailRow(detailRow: PblNgridDetailRowComponent): void;
    toggleDetailRow(row: any, forceState?: boolean): boolean | void;
    markForCheck(): void;
    ngOnDestroy(): void;
    /** @internal */
    detailRowToggled(event: PblDetailsRowToggleEvent<T>): void;
    private setupDetailRowParent;
    private resetTableRowDefs;
    /**
     * Update the grid with detail row info.
     * Instead of calling for a change detection cycle we can assign the new predicates directly to the pblNgridRowDef instances.
     */
    private updateTable;
    static ngAcceptInputType_detailRow: BooleanInput | ((index: number, rowData: any) => boolean);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDetailRowPluginDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridDetailRowPluginDirective<any>, "pbl-ngrid[detailRow]", ["pblNgridDetailRow"], { "detailRow": "detailRow"; "singleDetailRow": "singleDetailRow"; "excludeToggleFrom": "excludeToggleFrom"; "whenContextChange": "whenContextChange"; }, { "toggleChange": "toggleChange"; "toggledRowContextChange": "toggledRowContextChange"; }, never, never, false>;
}
/**
 * Use to set the a default `pblNgridDetailRowParentRef` if the user did not set one.
 * @internal
 */
export declare class PblNgridDefaultDetailRowParentComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDefaultDetailRowParentComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridDefaultDetailRowParentComponent, "pbl-ngrid-default-detail-row-parent", never, {}, {}, never, never, false>;
}
