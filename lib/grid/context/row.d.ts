import { _PblNgridComponent } from '../../tokens';
import { PblColumn } from '../column/model';
import { PblNgridExtensionApi } from '../../ext/grid-ext-api';
import { RowContextState, PblNgridRowContext, ExternalRowContextState } from './types';
import { PblCellContext } from './cell';
import { PblNgridRowComponent } from '../row/row.component';
export declare class PblRowContext<T> implements PblNgridRowContext<T> {
    private extApi;
    /** Data for the row that this cell is located within. */
    get $implicit(): T | undefined;
    set $implicit(value: T | undefined);
    /** Index of the data object in the provided data array. */
    index?: number;
    /** Index of the data object in the provided data array. */
    get dataIndex(): number;
    set dataIndex(value: number);
    /** Index location of the rendered row that this cell is located within. */
    renderIndex?: number;
    /** Length of the number of total rows. */
    count?: number;
    /** True if this cell is contained in the first row. */
    first?: boolean;
    /** True if this cell is contained in the last row. */
    last?: boolean;
    /** True if this cell is contained in a row with an even-numbered index. */
    even?: boolean;
    /** True if this cell is contained in a row with an odd-numbered index. */
    odd?: boolean;
    /** The index at the datasource */
    dsIndex: number;
    identity: any;
    firstRender: boolean;
    outOfView: boolean;
    readonly grid: _PblNgridComponent<T>;
    private _attachedRow;
    private external;
    /**
     * Returns the length of cells context stored in this row
     */
    get length(): number;
    private cells;
    private _$implicit?;
    private _updatePending;
    constructor(_data: T, dsIndex: number, extApi: PblNgridExtensionApi<T>);
    static defaultState<T = any>(identity: any, dsIndex: number, cellsCount: number): RowContextState<T>;
    getExternal<P extends keyof ExternalRowContextState>(key: P): ExternalRowContextState[P];
    setExternal<P extends keyof ExternalRowContextState>(key: P, value: ExternalRowContextState[P], saveState?: boolean): void;
    getState(): RowContextState<T>;
    fromState(state: RowContextState<T>): void;
    saveState(): void;
    /**
     * Returns the cell context for the column at the specified position.
     * > The position is relative to ALL columns (NOT RENDERED COLUMNS)
     */
    cell(index: number | PblColumn): PblCellContext<T> | undefined;
    getCells(): PblCellContext<T>[];
    updateCell(cell: PblCellContext<T>): void;
    attachRow(row: PblNgridRowComponent<T>): void;
    detachRow(row: PblNgridRowComponent<T>): void;
    _rebuildCells(columns: PblColumn[]): void;
    private updateRowData;
}
