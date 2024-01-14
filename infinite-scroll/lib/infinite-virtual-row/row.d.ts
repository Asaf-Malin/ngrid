import { PblNgridRowComponent } from '@pebula/ngrid';
import * as i0 from "@angular/core";
export declare const PBL_NGRID_ROW_TEMPLATE = "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-content></ng-content><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>";
export declare class PblNgridInfiniteRowComponent<T = any> extends PblNgridRowComponent<T> {
    canCreateCell(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridInfiniteRowComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridInfiniteRowComponent<any>, "pbl-ngrid-row[infiniteRow]", ["pblNgridInfiniteRow"], {}, {}, never, [".pbl-ngrid-row-prefix", "*", ".pbl-ngrid-row-suffix"], false>;
}
