import './infinite-scroll-plugin';
import * as i0 from "@angular/core";
import * as i1 from "./infinite-virtual-row/directives";
import * as i2 from "./infinite-virtual-row/row";
import * as i3 from "./default-infinite-virtual-row/default-infinite-virtual-row.component";
import * as i4 from "@angular/common";
import * as i5 from "@angular/cdk/table";
import * as i6 from "@pebula/ngrid";
import * as i7 from "@pebula/ngrid/target-events";
export declare class PblNgridInfiniteScrollModule {
    static readonly NGRID_PLUGIN: never;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridInfiniteScrollModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridInfiniteScrollModule, [typeof i1.PblNgridInfiniteVirtualRowRefDirective, typeof i2.PblNgridInfiniteRowComponent, typeof i3.PblNgridDefaultInfiniteVirtualRowComponent], [typeof i4.CommonModule, typeof i5.CdkTableModule, typeof i6.PblNgridModule, typeof i7.PblNgridTargetEventsModule], [typeof i1.PblNgridInfiniteVirtualRowRefDirective, typeof i2.PblNgridInfiniteRowComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridInfiniteScrollModule>;
}
