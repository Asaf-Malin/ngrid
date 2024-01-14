import { PblNgridColumnDef } from '../column/directives/column-def';
import { COLUMN } from '../column/model';
export declare function initCellElement(el: HTMLElement, column: COLUMN, prev?: COLUMN): void;
export declare function initCellHeaderFooter(element: HTMLElement, isFooter: boolean): void;
export declare function applyWidth(this: {
    columnDef: PblNgridColumnDef;
    el: HTMLElement;
}): void;
export declare function applySourceWidth(this: {
    columnDef: PblNgridColumnDef;
    el: HTMLElement;
}): void;
