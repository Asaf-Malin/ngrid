import { DoCheck, TemplateRef } from '@angular/core';
import { PblRowContext, PblCellContext } from '../context/index';
import { PblColumn } from '../column/model';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
/** Cell template container that adds the right classes and role. */
export declare class PblNgridCellComponent extends PblNgridBaseCell implements DoCheck {
    column: PblColumn;
    cellCtx: PblCellContext | undefined;
    template: TemplateRef<any>;
    private _rowCtx;
    /**
     * The position of the column def among all columns regardless of visibility.
     */
    private colIndex;
    private focused;
    private selected;
    syncColumn(): void;
    setContext(context: PblRowContext<any>): void;
    setColumn(column: PblColumn): void;
    ngDoCheck(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridCellComponent, "pbl-ngrid-cell", ["pblNgridCell"], {}, {}, never, never, false>;
}
