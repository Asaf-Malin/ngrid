import { NgZone } from '@angular/core';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { PblNgridMetaRowService } from '../meta-rows/meta-row.service';
import { PblCdkTableComponent } from '../pbl-cdk-table/pbl-cdk-table.component';
import { PblNgridBaseRowComponent } from './base-row.component';
import { PblNgridCellFactoryResolver } from './cell-factory.service';
import { PblNgridColumnRowComponent } from './columns-row.component';
import { PblNgridRowComponent } from './row.component';
import { GridRowType } from './types';
export interface RowsApi<T = any> {
    readonly metaRowService: PblNgridMetaRowService<T>;
    syncRows(rowType?: 'all' | boolean, detectChanges?: boolean): void;
    syncRows(rowType: 'header' | 'data' | 'footer', detectChanges: boolean, ...rows: number[]): void;
    syncRows(rowType: 'header' | 'data' | 'footer', ...rows: number[]): void;
    findDataRowByIndex(index: number): PblNgridRowComponent<T> | undefined;
    findDataRowByDsIndex(index: number): PblNgridRowComponent<T> | undefined;
    findDataRowByIdentity(identity: string | number): PblNgridRowComponent<T> | undefined;
    findRowByElement(element: Element): PblNgridBaseRowComponent<GridRowType, T> | undefined;
}
export declare class PblRowsApi<T = any> implements RowsApi<T> {
    private readonly extApi;
    private readonly zone;
    readonly cellFactory: PblNgridCellFactoryResolver;
    cdkTable: PblCdkTableComponent<T>;
    readonly metaRowService: PblNgridMetaRowService<T>;
    private allByElement;
    private allRows;
    private rows;
    private columnRows;
    private metaHeaderRows;
    private metaFooterRows;
    private gridWidthRow;
    private intersection?;
    private firstLast;
    constructor(extApi: PblNgridInternalExtensionApi<T>, zone: NgZone, cellFactory: PblNgridCellFactoryResolver);
    forceUpdateOutOfView(...rows: PblNgridRowComponent<T>[]): void;
    addRow(row: PblNgridBaseRowComponent<GridRowType, T>): void;
    removeRow(row: PblNgridBaseRowComponent<any, T>): void;
    dataRows(): PblNgridRowComponent<T>[];
    findRowByElement(element: Element): PblNgridBaseRowComponent<GridRowType, T> | undefined;
    findDataRowByDsIndex(index: number): PblNgridRowComponent<T> | undefined;
    findDataRowByIndex(index: number): PblNgridRowComponent<T> | undefined;
    findDataRowByIdentity(identity: string | number): PblNgridRowComponent<T> | undefined;
    findColumnRow(type: 'header' | 'footer'): PblNgridColumnRowComponent;
    /**
     * Force run change detection for rows.
     * You can run it for specific groups or for all rows.
     */
    syncRows(rowType?: 'all' | boolean, detectChanges?: boolean): void;
    syncRows(rowType: GridRowType, detectChanges: boolean, ...rowsIndex: number[]): void;
    syncRows(rowType: GridRowType, ...rowsIndex: number[]): void;
}
