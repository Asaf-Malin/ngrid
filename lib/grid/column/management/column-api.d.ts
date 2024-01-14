import { Observable } from 'rxjs';
import { PblNgridExtensionApi } from '../../../ext/grid-ext-api';
import { PblColumn } from '../model/column';
import { AutoSizeToFitOptions } from './types';
export declare class ColumnApi<T> {
    static create<T>(extApi: PblNgridExtensionApi): ColumnApi<T>;
    get visibleColumnIds(): string[];
    get hiddenColumnIds(): string[];
    get visibleColumns(): PblColumn[];
    get columns(): PblColumn[];
    get columnIds(): string[];
    get totalColumnWidthChange(): Observable<number>;
    private grid;
    private store;
    private extApi;
    private _totalColumnWidthChange;
    private constructor();
    /**
     * Returns the `PblColumn` at the specified index from the list of rendered columns (i.e. not hidden).
     */
    findColumnAt(renderColumnIndex: number): PblColumn | undefined;
    /**
     * Returns the column matching provided `id`.
     *
     * The search is performed on all known columns.
     */
    findColumn(id: string): PblColumn | undefined;
    /**
    * Returns the render index of column or -1 if not found.
    *
    * The render index represents the current location of the column in the group of visible columns.
    */
    renderIndexOf(column: string | PblColumn): number;
    /**
     * Returns the index of a column or -1 if not found.
     */
    indexOf(column: string | PblColumn): number;
    isColumnHidden(column: PblColumn): boolean;
    /**
     * Hide columns in the table
     */
    hideColumns(column: PblColumn | string, ...columns: PblColumn[] | string[]): void;
    /**
     * Change the visibility state of the provided columns to visible.
     * If no columns are provided all columns
     */
    showColumns(showAll: true): void;
    showColumns(column: PblColumn | string, ...columns: PblColumn[] | string[]): void;
    /**
     * Update the width of the column with the provided width.
     *
     * The width is set in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     *
     * Resizing the column will trigger a table width resizing event, updating column group if necessary.
     */
    resizeColumn(column: PblColumn, width: string): void;
    /**
     * Resize the column to best fit it's content.
     *
     * - Content: All of the cells rendered for this column (header, data and footer cells).
     * - Best fit: The width of the cell with the height width measured.
     *
     * The best fit found (width) is then used to call `resizeColumn()`.
     */
    autoSizeColumn(column: PblColumn): void;
    /**
     * For each visible column in the table, resize to best fit it's content.
     *
     * This method will simply run `autoSizeColumn()` on the visible columns in the table.
     */
    autoSizeColumns(): void;
    /**
     * For each column in the list of column provided, resize to best fit it's content.
     *
     * Make sure you are not resizing an hidden column.
     * This method will simply run `autoSizeColumn()` on the columns provided.
     */
    autoSizeColumns(...columns: PblColumn[]): void;
    /**
     * For each visible column in the table, resize the width to a proportional width relative to the total width provided.
     */
    autoSizeToFit(totalWidth: number, options?: AutoSizeToFitOptions): void;
    /**
     * Move the provided `column` to the position of the `anchor` column.
     * The new location of the anchor column will be it's original location plus or minus 1, depending on the delta between
     * the columns. If the origin of the `column` is before the `anchor` then the anchor's new position is minus one, otherwise plus 1.
     */
    moveColumn(column: PblColumn, anchor: PblColumn): boolean;
    /**
   * Move the provided `column` to the position of the column at `renderColumnIndex`.
   * `renderColumnIndex` must be a visible column (i.e. not hidden)
   */
    moveColumn(column: PblColumn, renderColumnIndex: number): boolean;
    /**
     * Swap positions between 2 existing columns.
     */
    swapColumns(col1: PblColumn, col2: PblColumn): boolean;
    addGroupBy(...column: PblColumn[]): void;
    removeGroupBy(...column: PblColumn[]): void;
    private findColumnAutoSize;
}
