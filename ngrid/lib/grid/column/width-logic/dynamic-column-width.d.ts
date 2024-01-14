import { Direction } from '@angular/cdk/bidi';
import { PblColumnSizeInfo } from '../../column/model/types';
export interface BoxModelSpaceStrategy {
    cell(col: PblColumnSizeInfo): number;
    groupCell(col: PblColumnSizeInfo): number;
    group(cols: PblColumnSizeInfo[], dir?: Direction): number;
}
/**
 * A column width calculator that calculates column width for a specific column or a group of columns.
 * It also provide the minimum required row width for the total columns added up to that point.
 *
 * The `DynamicColumnWidthLogic` takes into account real-time DOM measurements (especially box-model metadata), hence "dynamic".
 * It performs the calculation based on `PblColumn` and actual DOM size metadata.
 *
 * The `DynamicColumnWidthLogic` has 3 responsibilities:
 *
 * - It is responsible for enforcing the `maxWidth` boundary constraint for every column it processes by calculating the actual width
 * of a column and calling `PblColumn.checkMaxWidthLock` to verify if max width lock has changed due to the new actual width.
 *
 * - It calculates the absolute width for a group of columns, so `PblCdkVirtualScrollViewportComponentGroupColumn` can have an exact size that wraps it's children.
 *
 * - It calculates the `minimumRowWidth`, which represents the minimum width required width of the row, i.e. table.
 *
 * > Note that an instance of `DynamicColumnWidthLogic` represents a one-time pass for all columns, for every run a new instance is required.
 */
export declare class DynamicColumnWidthLogic {
    readonly strategy: BoxModelSpaceStrategy;
    dir?: Direction;
    /**
     * When true, it indicates that one (or more) columns has changed the max width lock state.
     * @readonly
     */
    maxWidthLockChanged: boolean;
    get minimumRowWidth(): number;
    private readonly cols;
    private _minimumRowWidth;
    constructor(strategy: BoxModelSpaceStrategy, dir?: Direction);
    reset(): void;
    /**
     * Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
     */
    widthBreakout(columnInfo: PblColumnSizeInfo): {
        content: number;
        nonContent: number;
    };
    /**
     * Add a column to the calculation.
     *
     * The operation will update the minimum required width and trigger a `checkMaxWidthLock` on the column.
     * If the max width lock has changed the `maxWidthLockChanged` is set to true.
     *
     * A column that was previously added is ignored.
     *
     * Note that once `maxWidthLockChanged` is set to true it will never change.
     */
    addColumn(columnInfo: PblColumnSizeInfo): void;
    /**
     * Run each of the columns through `addColumn` and returns the sum of the width all columns using
     * the box model space strategy.
     *
     * The result represents the absolute width to be used in a `PblColumnGroup`.
     *
     * > Note that when a table has multiple column-group rows each column is the child of multiple group column, hence calling `addColumn` with the
     * same group more then once. However, since `addColumn()` ignores columns it already processed it is safe.
     */
    addGroup(columnInfos: PblColumnSizeInfo[]): number;
}
/**
* Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
*/
export declare function widthBreakout(strategy: BoxModelSpaceStrategy, columnInfo: PblColumnSizeInfo): {
    content: number;
    nonContent: number;
};
export declare const DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY: BoxModelSpaceStrategy;
