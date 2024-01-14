import { Observable } from 'rxjs';
import { IterableDiffers } from '@angular/core';
import { PblNgridColumnDefinitionSet, PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
import { PblColumnGroup, PblColumnGroupStore, PblColumn, PblNgridColumnSet } from '../model';
import { GridRowType } from '../../row/types';
import { PblNgridBaseRowComponent } from '../../row/base-row.component';
import { StaticColumnWidthLogic } from '../width-logic/static-column-width';
import { PblMetaColumnStore, PblRowColumnsChangeEvent, PblRowTypeToColumnTypeMap } from './types';
export declare class PblColumnStore {
    private readonly extApi;
    private readonly differs;
    metaColumns: PblMetaColumnStore[];
    get metaHeaderRows(): (import("./types").PblColumnStoreMetaRow & {
        allKeys?: string[];
    })[];
    get metaFooterRows(): (import("./types").PblColumnStoreMetaRow & {
        allKeys?: string[];
    })[];
    columnIds: string[];
    visibleColumnIds: string[];
    hiddenColumnIds: string[];
    visibleColumns: PblColumn[];
    allColumns: PblColumn[];
    headerColumnDef: PblMetaRowDefinitions;
    footerColumnDef: PblMetaRowDefinitions;
    get primary(): PblColumn | undefined;
    get groupStore(): PblColumnGroupStore;
    private _primary;
    private byId;
    private _groupStore;
    private lastSet;
    private hiddenColumns;
    private differ;
    private _visibleChanged$;
    private metaRowsStore;
    private grid;
    constructor(extApi: PblNgridInternalExtensionApi, differs: IterableDiffers);
    getColumnsOf<TRowType extends GridRowType>(row: PblNgridBaseRowComponent<TRowType>): PblRowTypeToColumnTypeMap<TRowType>[];
    columnRowChange(): Observable<PblRowColumnsChangeEvent<PblRowTypeToColumnTypeMap<'data'>>>;
    metaRowChange(): Observable<import("./meta-rows-store").PblMetaRowColumnsChangeEvent>;
    isColumnHidden(column: PblColumn): boolean;
    clearColumnVisibility(): void;
    updateColumnVisibility(hide?: PblColumn[] | string[], show?: PblColumn[] | string[]): void;
    addGroupBy(...columns: PblColumn[] | string[]): void;
    removeGroupBy(...columns: PblColumn[] | string[]): void;
    /**
     * Move the provided `column` to the position of the `anchor` column.
     * The new location of the anchor column will be it's original location plus or minus 1, depending on the delta between
     * the columns. If the origin of the `column` is before the `anchor` then the anchor's new position is minus one, otherwise plus 1.
     */
    moveColumn(column: PblColumn, anchor: PblColumn): boolean;
    swapColumns(col1: PblColumn, col2: PblColumn): boolean;
    find(id: string): PblMetaColumnStore & {
        data?: PblColumn;
    } | undefined;
    getAllHeaderGroup(): PblColumnGroup[];
    getStaticWidth(): StaticColumnWidthLogic;
    invalidate(columnOrDefinitionSet: PblNgridColumnDefinitionSet | PblNgridColumnSet): void;
    updateGroups(...rowIndex: number[]): void;
    attachCustomCellTemplates(columns?: PblColumn[]): void;
    attachCustomHeaderCellTemplates(columns?: Array<PblColumn | PblMetaColumnStore>): void;
    dispose(): void;
    private _updateGroup;
    private getColumnRecord;
    private setHidden;
    private resetColumns;
    private resetIds;
    private columnUpdateInProgress;
    private checkVisibleChanges;
    private afterColumnPositionChange;
}
/**
 * Moves an item one index in an array to another.
 * @param array Array in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which the item should be moved.
 */
export declare function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void;
export declare function moveItemInArrayExt<T = any>(array: T[], fromIndex: number, toIndex: number, fn: (previousItem: T, currentItem: T, previousIndex: number, currentIndex: number) => void): void;
