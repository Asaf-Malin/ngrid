import { PblNgridConfigService } from '@asafmalin/ngrid/core';
import * as i0 from "@angular/core";
import * as i1 from "./sticky/sticky-plugin";
import * as i2 from "@angular/common";
import * as i3 from "@angular/cdk/table";
import * as i4 from "@asafmalin/ngrid";
declare module '@asafmalin/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        stickyPlugin?: {
            headers?: Array<'table' | number>;
            footers?: Array<'table' | number>;
            columnStart?: Array<string | number>;
            columnEnd?: Array<string | number>;
        };
    }
}
export declare class PblNgridStickyModule {
    static readonly NGRID_PLUGIN: never;
    constructor(configService: PblNgridConfigService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridStickyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridStickyModule, [typeof i1.PblNgridStickyPluginDirective], [typeof i2.CommonModule, typeof i3.CdkTableModule, typeof i4.PblNgridModule], [typeof i1.PblNgridStickyPluginDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridStickyModule>;
}
