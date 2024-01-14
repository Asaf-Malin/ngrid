import { ViewContainerRef } from '@angular/core';
import { PblNgridContextApi, GridDataPoint } from '@pebula/ngrid';
import { PblNgridMatrixRow, PblNgridRowEvent, PblNgridCellEvent, PblNgridDataCellEvent } from './events';
export declare function isCellEvent<T, TEvent extends Event = MouseEvent | KeyboardEvent>(event: PblNgridRowEvent<T> | PblNgridCellEvent<T, TEvent>): event is PblNgridCellEvent<T, TEvent>;
export declare function isDataCellEvent<T, TEvent extends Event = MouseEvent | KeyboardEvent>(event: PblNgridRowEvent<T> | PblNgridCellEvent<T, TEvent>): event is PblNgridDataCellEvent<T, TEvent>;
/**
 * Returns true if the element is a row element (`pbl-ngrid-row`, `cdk-row`).
 *
 * This function works under the following assumptions:
 *
 *   - A row element MUST contain a "role" attribute with the value "row"
 */
export declare function isRowContainer(element: HTMLElement): boolean;
/**
 * Find the cell element that is or wraps the provided element.
 * The element can be a table cell element (any type of) OR a nested element (any level) of a table cell element.
 *
 * This function works under the following assumptions:
 *
 *   - The parent of a cell element is a row element.
 *   - Each row element MUST contain a "role" attribute with the value "row"
 */
export declare function findParentCell(element: HTMLElement): HTMLElement | undefined;
/**
 * Returns the position (index) of the cell (element) among it's siblings.
 */
export declare function findCellRenderIndex(cell: Element): number;
/**
 * Returns table metadata for a given ROW element.
 * This function works under the following assumptions:
 *
 *   - Each row element MUST contain a "role" attribute with the value "row"
 *   - Each row element MUST contains the type identifier attribute "data-rowtype" (except "data" rows)
 *   - Allowed values for "data-rowtype" are: 'header' | 'meta-header' | 'footer' | 'meta-footer' | 'data'
 *   - Row's representing data items (data-rowtype="data") can omit the type attribute and the function will infer it.
 *
 * NOTE that this function DOES NOT identify subType of `meta-group` (`PblNgridMatrixRow<'header' | 'footer', 'meta-group'>`), it will return it as
 * 'meta`, you need to handle this case specifically.
 *
 * Because detection is based on DOM element position finding the original row index when multiple row containers are set (fixed/style/row) will not work.
 * The rowIndex will be relative to the container, and not the entire table.
 */
export declare function matrixRowFromRow(row: Element, vcRef: ViewContainerRef): PblNgridMatrixRow<'data'> | PblNgridMatrixRow<'header' | 'footer'> | PblNgridMatrixRow<'header' | 'footer', 'meta'> | undefined;
/**
 * Given a list of cells stacked vertically (yAxis) and a list of cells stacked horizontally (xAxis) return all the cells inside (without the provided axis cells).
 *
 * In the following example, all [Yn] cells are provided in the yAxis param and all [Xn] cell in the xAxis params, the returned value will be an array
 * with all cells marked with Z.
 *    Y5  Z  Z  Z
 *    Y4  Z  Z  Z
 *    Y3  Z  Z  Z
 *    Y2  Z  Z  Z
 *    XY1 X2 X3 X4
 * @param contextApi
 * @param xAxis
 * @param yAxis
 */
export declare function getInnerCellsInRect(contextApi: PblNgridContextApi<any>, xAxis: GridDataPoint[], yAxis: GridDataPoint[]): GridDataPoint[];
export declare function rangeBetween(n1: number, n2: number): number[];
