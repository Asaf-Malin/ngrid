import { ComponentFactoryResolver } from '@angular/core';
import { PblNgridRegistryService } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "./mat-sort.directive";
import * as i2 from "@angular/common";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/sort";
import * as i5 from "@asafmalin/ngrid";
export declare class PblNgridMatSortModule {
    private registry;
    static readonly NGRID_PLUGIN: never;
    constructor(registry: PblNgridRegistryService, cfr: ComponentFactoryResolver);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMatSortModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridMatSortModule, [typeof i1.PblNgridMatSortDirective], [typeof i2.CommonModule, typeof i3.MatButtonModule, typeof i4.MatSortModule, typeof i5.PblNgridModule], [typeof i1.PblNgridMatSortDirective, typeof i4.MatSortModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridMatSortModule>;
}
