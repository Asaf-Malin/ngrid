import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
import { ColumnSizeInfo } from '../../column/model/column-size-info';
import { PblColumn } from '../../column/model/column';
/**
 * A wrapper around `ColumnSizeInfo` that listen to size changes from the element of a cell, using the `ResizeObserver` API.
 * When a resize event is triggered it will call `updateSize()` which in turn update the layout and notify the column about the resize event.
 *
 * In other words, all cell element of the grid, attached to a column, which are wrapped with this observer will trigger resize events.
 *
 * Because most of the size changes concern all columns of a row and because ResizeObserver will emit them all in the same event
 * an entire row should emit once, with all columns.
 *
 * > This class can be extended by a Directive class to be used by declarative markup in angular templates.
 */
export declare class PblColumnSizeObserver extends ColumnSizeInfo {
    private controller;
    constructor(element: HTMLElement, extApi: PblNgridInternalExtensionApi);
    protected attachColumn(column: PblColumn): void;
    destroy(): void;
}
