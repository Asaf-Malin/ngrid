import { PblNgridConfigService } from '@pebula/ngrid/core';
import * as i0 from "@angular/core";
import * as i1 from "./cell-tooltip.directive";
import * as i2 from "@angular/common";
import * as i3 from "@angular/material/tooltip";
import * as i4 from "@angular/cdk/overlay";
import * as i5 from "@pebula/ngrid";
import * as i6 from "@pebula/ngrid/target-events";
export declare class PblNgridCellTooltipModule {
    static readonly NGRID_PLUGIN: never;
    constructor(parentModule: PblNgridCellTooltipModule, configService: PblNgridConfigService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellTooltipModule, [{ optional: true; skipSelf: true; }, null]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridCellTooltipModule, [typeof i1.PblNgridCellTooltipDirective], [typeof i2.CommonModule, typeof i3.MatTooltipModule, typeof i4.OverlayModule, typeof i5.PblNgridModule, typeof i6.PblNgridTargetEventsModule], [typeof i1.PblNgridCellTooltipDirective, typeof i3.MatTooltipModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridCellTooltipModule>;
}
