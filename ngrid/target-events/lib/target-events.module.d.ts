import { PblNgridConfigService } from '@asafmalin/ngrid/core';
import * as i0 from "@angular/core";
import * as i1 from "./target-events/target-events-plugin";
import * as i2 from "./target-events/cell-edit.directive";
import * as i3 from "@angular/common";
import * as i4 from "@angular/cdk/table";
import * as i5 from "@asafmalin/ngrid";
export declare class PblNgridTargetEventsModule {
    static readonly NGRID_PLUGIN: never;
    constructor(configService: PblNgridConfigService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridTargetEventsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridTargetEventsModule, [typeof i1.PblNgridTargetEventsPluginDirective, typeof i2.PblNgridCellEditDirective], [typeof i3.CommonModule, typeof i4.CdkTableModule, typeof i5.PblNgridModule], [typeof i1.PblNgridTargetEventsPluginDirective, typeof i2.PblNgridCellEditDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridTargetEventsModule>;
}
