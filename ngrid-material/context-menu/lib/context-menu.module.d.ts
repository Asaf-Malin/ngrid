import { ComponentFactoryResolver } from '@angular/core';
import { PblNgridConfigService } from '@pebula/ngrid/core';
import { PblNgridRegistryService } from '@pebula/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "./header-context/header-context-menu-trigger";
import * as i2 from "./header-context/header-context-menu.directive";
import * as i3 from "./header-context/styles/excel-style-header-menu";
import * as i4 from "@angular/common";
import * as i5 from "@angular/material/icon";
import * as i6 from "@angular/material/button";
import * as i7 from "@angular/material/menu";
import * as i8 from "@angular/material/form-field";
import * as i9 from "@angular/material/input";
import * as i10 from "@pebula/ngrid";
import * as i11 from "@pebula/ngrid/overlay-panel";
export declare class PblNgridContextMenuModule {
    static readonly NGRID_PLUGIN: never;
    constructor(parentModule: PblNgridContextMenuModule, registry: PblNgridRegistryService, cfr: ComponentFactoryResolver, configService: PblNgridConfigService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridContextMenuModule, [{ optional: true; skipSelf: true; }, null, null, null]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridContextMenuModule, [typeof i1.MatHeaderContextMenuTrigger, typeof i2.PblNgridMatHeaderContextMenuPlugin, typeof i3.MatExcelStyleHeaderMenu], [typeof i4.CommonModule, typeof i5.MatIconModule, typeof i6.MatButtonModule, typeof i7.MatMenuModule, typeof i8.MatFormFieldModule, typeof i9.MatInputModule, typeof i10.PblNgridModule, typeof i11.PblNgridOverlayPanelModule], [typeof i2.PblNgridMatHeaderContextMenuPlugin]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridContextMenuModule>;
}
