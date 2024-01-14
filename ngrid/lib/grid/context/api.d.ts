import { Observable } from 'rxjs';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { PblColumn } from '../column/model';
import { RowContextState, CellContextState, PblNgridCellContext, PblNgridRowContext, CellReference, GridDataPoint, PblNgridFocusChangedEvent, PblNgridSelectionChangedEvent } from './types';
import { PblRowContext } from './row';
import { PblCellContext } from './cell';
export declare class ContextApi<T = any> {
    private extApi;
    private viewCache;
    private viewCacheGhost;
    private cache;
    private vcRef;
    private columnApi;
    private activeFocused;
    private activeSelected;
    private focusChanged$;
    private selectionChanged$;
    /**
     * Notify when the focus has changed.
     *
     * > Note that the notification is not immediate, it will occur on the closest micro-task after the change.
     */
    readonly focusChanged: Observable<PblNgridFocusChangedEvent>;
    /**
     * Notify when the selected cells has changed.
     */
    readonly selectionChanged: Observable<PblNgridSelectionChangedEvent>;
    /**
     * The reference to currently focused cell context.
     * You can retrieve the actual context or context cell using `findRowInView` and / or `findRowInCache`.
     *
     * > Note that when virtual scroll is enabled the currently focused cell does not have to exist in the view.
     * If this is the case `findRowInView` will return undefined, use `findRowInCache` instead.
     */
    get focusedCell(): GridDataPoint | undefined;
    /**
     * The reference to currently selected range of cell's context.
     * You can retrieve the actual context or context cell using `findRowInView` and / or `findRowInCache`.
     *
     * > Note that when virtual scroll is enabled the currently selected cells does not have to exist in the view.
     * If this is the case `findRowInView` will return undefined, use `findRowInCache` instead.
     */
    get selectedCells(): GridDataPoint[];
    constructor(extApi: PblNgridInternalExtensionApi<T>);
    /**
     * Focus the provided cell.
     * If a cell is not provided will un-focus (blur) the currently focused cell (if there is one).
     * @param cellRef A Reference to the cell
     */
    focusCell(cellRef?: CellReference): void;
    /**
     * Select all provided cells.
     * @param cellRef A Reference to the cell
     * @param clearCurrent Clear the current selection before applying the new selection.
     * Default to false (add to current).
     */
    selectCells(cellRefs: CellReference[], clearCurrent?: boolean): void;
    /**
     * Unselect all provided cells.
     * If cells are not provided will un-select all currently selected cells.
     * @param cellRef A Reference to the cell
     */
    unselectCells(cellRefs?: CellReference[]): void;
    /**
     * Clears the entire context, including view cache and memory cache (rows out of view)
     * @param syncView If true will sync the view and the context right after clearing which will ensure the view cache is hot and synced with the actual rendered rows
     * Some plugins will expect a row to have a context so this might be required.
     * The view and context are synced every time rows are rendered so make sure you set this to true only when you know there is no rendering call coming down the pipe.
     */
    clear(syncView?: boolean): void;
    saveState(context: PblNgridRowContext<T>): void;
    getRow(row: number | HTMLElement): PblNgridRowContext<T> | undefined;
    getCell(cell: HTMLElement | GridDataPoint): PblNgridCellContext | undefined;
    /**
     * Return the cell context for the cell at the point specified
     * @param row
     * @param col
     */
    getCell(row: number, col: number): PblNgridCellContext | undefined;
    getDataItem(cell: CellReference): any;
    createCellContext(renderRowIndex: number, column: PblColumn): PblCellContext<T>;
    rowContext(renderRowIndex: number): PblRowContext<T> | undefined;
    updateState(rowIdentity: any, columnIndex: number, cellState: Partial<CellContextState<T>>): void;
    updateState(rowIdentity: any, rowState: Partial<RowContextState<T>>): void;
    /**
     * Try to find a specific row, using the row identity, in the current view.
     * If the row is not in the view (or even not in the cache) it will return undefined, otherwise returns the row's context instance (`PblRowContext`)
     * @param rowIdentity The row's identity. If a specific identity is used, please provide it otherwise provide the index of the row in the datasource.
     */
    findRowInView(rowIdentity: any): PblRowContext<T> | undefined;
    /**
     * Try to find a specific row context, using the row identity, in the context cache.
     * Note that the cache does not hold the context itself but only the state that can later be used to retrieve a context instance. The context instance
     * is only used as context for rows in view.
     * @param rowIdentity The row's identity. If a specific identity is used, please provide it otherwise provide the index of the row in the datasource.
     */
    findRowInCache(rowIdentity: any): RowContextState<T> | undefined;
    /**
     * Try to find a specific row context, using the row identity, in the context cache.
     * Note that the cache does not hold the context itself but only the state that can later be used to retrieve a context instance. The context instance
     * is only used as context for rows in view.
     * @param rowIdentity The row's identity. If a specific identity is used, please provide it otherwise provide the index of the row in the datasource.
     * @param offset When set, returns the row at the offset from the row with the provided row identity. Can be any numeric value (e.g 5, -6, 4).
     * @param create Whether to create a new state if the current state does not exist.
     */
    findRowInCache(rowIdentity: any, offset: number, create: boolean): RowContextState<T> | undefined;
    getRowIdentity(dsIndex: number, rowData?: T): string | number | null;
    /** @internal */
    _createRowContext(data: T, renderRowIndex: number): PblRowContext<T>;
    _updateRowContext(rowContext: PblRowContext<T>, renderRowIndex: number): void;
    private addToViewCache;
    private getCreateState;
    private emitFocusChanged;
    private destroy;
    private syncViewAndContext;
}
