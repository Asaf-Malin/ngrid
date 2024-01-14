import { ComponentRef, ViewContainerRef, OnDestroy, OnInit } from '@angular/core';
import { PblRowContext } from '../context/index';
import { PblNgridCellComponent } from '../cell/cell.component';
import { PblColumn } from '../column/model';
import { PblNgridBaseRowComponent } from './base-row.component';
import * as i0 from "@angular/core";
export declare const PBL_NGRID_ROW_TEMPLATE = "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>";
export declare class PblNgridRowComponent<T = any> extends PblNgridBaseRowComponent<'data', T> implements OnInit, OnDestroy {
    _viewRef: ViewContainerRef;
    readonly rowType: "data";
    get rowIndex(): number;
    /** Indicates if intersection observer is on, detecting outOfView state for us */
    private observerMode;
    context: PblRowContext<T>;
    protected prevRow: T | undefined;
    protected currRow: T | undefined;
    private _classDiffer;
    private _lastClass;
    private _rowIndex;
    private outOfView;
    ngOnInit(): void;
    ngOnDestroy(): void;
    updateRow(): boolean;
    getCell(index: number): PblNgridCellComponent | undefined;
    getCellById(id: string): PblNgridCellComponent | undefined;
    /**
     * Rebuild the cells rendered.
     * This should be called when the columns have changed and new columns created in the column store.
     *
     * The new columns are new instances, clones of the previous columns and they DONT have a column definition!
     * This method will iterate over existing cells, updating each cell with the new column now in it's location and creating a column def for it.
     * If there are more cells rendered then in the store, it will remove those extra cells
     * If there are less cells rendered then in the store, it will create new ones.
     * This will ensure we don't create or remove cells unless we need to, saving on DOM operations.
     */
    _rebuildCells(): void;
    /**
     * Updates the outOfView state of this row and sync it with the context
     * If the context's state is different from the new outOfView state, will invoke a change detection cycle.
     * @internal
     */
    _setOutOfViewState(outOfView: boolean): void;
    /**
     * Updates the `outOfView` flag of the context attached to this row
     *
     * This method is backward compatible to support browser without the IntersectionObservable API.
     *
     * If the browser DOES NOT support IntersectionObserver it will calculate the state using bounding rect APIs (force param has no effect, always true).
     * If the browser support IntersectionObserver it will do nothing when force is not set to true but when * set to true it will use
     * the IntersectionObserver `takeRecords` method to update the outOfView state.
     *
     * > NOTE that this method has a direct impact on performance as it uses DOM apis that trigger layout reflows.
     * Use with caution.
     */
    updateOutOfView(force?: boolean): void;
    protected onCtor(): void;
    protected detectChanges(): void;
    protected updateHostClass(): void;
    protected cellCreated(column: PblColumn, cell: ComponentRef<PblNgridCellComponent>): void;
    protected cellDestroyed(cell: ComponentRef<PblNgridCellComponent>, previousIndex: number): void;
    protected cellMoved(previousItem: ComponentRef<PblNgridCellComponent>, currentItem: ComponentRef<PblNgridCellComponent>, previousIndex: number, currentIndex: number): void;
    protected identityUpdated(): void;
    protected attachColumn(column: PblColumn, cell: ComponentRef<PblNgridCellComponent>): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRowComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridRowComponent<any>, "pbl-ngrid-row[row]", ["pblNgridRow"], {}, {}, never, [".pbl-ngrid-row-prefix", ".pbl-ngrid-row-suffix"], false>;
}
