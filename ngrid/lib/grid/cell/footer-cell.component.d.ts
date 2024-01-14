import { _PblNgridComponent } from '../../tokens';
import { PblColumn } from '../column/model';
import { MetaCellContext } from '../context/index';
import { PblNgridColumnDef } from '../column/directives/column-def';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
export declare class PblNgridFooterCellComponent extends PblNgridBaseCell {
    column: PblColumn;
    cellCtx: MetaCellContext<any, PblColumn>;
    get columnDef(): PblNgridColumnDef;
    get grid(): _PblNgridComponent;
    setColumn(column: PblColumn): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridFooterCellComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridFooterCellComponent, "pbl-ngrid-footer-cell", never, {}, {}, never, never, false>;
}
