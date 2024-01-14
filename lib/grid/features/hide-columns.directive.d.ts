import { DoCheck, IterableDiffers } from '@angular/core';
import { PblNgridPluginController } from '../../ext/plugin-control';
import * as i0 from "@angular/core";
export declare class PblNgridHideColumns implements DoCheck {
    private readonly pluginCtrl;
    private readonly differs;
    set hideColumns(value: string[]);
    private dirty;
    private hidden;
    private differ;
    private readonly columnStore;
    constructor(pluginCtrl: PblNgridPluginController, differs: IterableDiffers);
    ngDoCheck(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridHideColumns, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridHideColumns, "pbl-ngrid[hideColumns]", never, { "hideColumns": "hideColumns"; }, {}, never, never, false>;
}
