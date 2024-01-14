import { ElementRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Bind to the class / style attributes of the container of a cell template.
 * For class bindings use [ngridCellClass] and for style bindings use [ngridCellStyle].
 *
 * This is like [ngClass] or [ngStyle] but not for the host of the directive but to it's parent.
 *
 * - [ngridCellClass] accepts the same type of values that [ngClass] does.
 * - [ngridCellStyle] accepts the same type of values that [ngStyle] does.
 *
 * ## Example
 *
 * We want to create a new cell type called "balance" that represents the balance of a bank account.
 * We also want to have different background color, green if the account balance if positive and red if it's negative.
 *
 * ```html
 * <div *pblNgridCellTypeDef="'balance'; value as value"
 *      [ngClass]="value < 0 ? 'balance-negative' : 'balance-positive'">{{ value  }}
 * </div>
 * ```
 *
 * The example above will work but the background will not fill the entire cell, only the `div` it is applied on.
 * This is because the container of the `div` has internal styling that apply padding (among other styles) to the cell.
 *
 * The container is controlled internally by ngrid, but you can access it's style / class attributes using this directive.
 *
 * ```html
 * <div *pblNgridCellTypeDef="'balance'; value as value"
 *      [ngridCellClass]="value < 0 ? 'balance-negative' : 'balance-positive'">{{ value  }}
 * </div>
 * ```
 *
 * > Because style / class is applied on the parent and the parent can have multiple children it is possible to apply this directive
 * on multiple children, do not do this as it will have unexpected results.
 */
export declare class PblNgridCellStyling {
    private elRef;
    set style(value: {
        [key: string]: string;
    });
    set klass(value: string | string[] | Set<string> | {
        [klass: string]: any;
    });
    private _styleDiffer;
    private _classDiffer;
    private _parent;
    private _lastStyle;
    private _lastClass;
    constructor(elRef: ElementRef<HTMLElement>);
    ngAfterViewInit(): void;
    ngDoCheck(): void;
    private updateParent;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellStyling, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellStyling, "[ngridCellStyle], [ngridCellClass]", never, { "style": "ngridCellStyle"; "klass": "ngridCellClass"; }, {}, never, never, false>;
}
