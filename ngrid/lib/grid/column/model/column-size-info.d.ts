import { PblColumnSizeInfo } from './types';
import { PblColumn } from './column';
/**
 * A class that represents the dimensions and style of a column cell.
 * The class is bound to an element and a column.
 *
 * Calling `updateSize()` will sync the layout from the DOM element to the class properties
 * and trigger a resize event on the column's column definition object.
 *
 * > Note that `updateSize()` only works when a column is attached
 *
 * This class shouldn't be used directly. In NGrid, it is wrapped by `PblColumnSizeObserver` which automatically triggers
 * update size events using the `ResizeObserver` API.
 */
export declare class ColumnSizeInfo implements PblColumnSizeInfo {
    readonly target: HTMLElement;
    get column(): PblColumn;
    set column(value: PblColumn);
    /**
     * The height of the column (subpixel resolution)
     */
    height: number;
    /**
     * The width of the column (subpixel resolution)
     * Note that this is the not the content width.
     */
    width: number;
    /**
     * The computed style for this cell.
     */
    style: CSSStyleDeclaration;
    protected _column: PblColumn;
    constructor(target: HTMLElement);
    protected attachColumn(column: PblColumn): void;
    protected detachColumn(): void;
    updateSize(): void;
}
