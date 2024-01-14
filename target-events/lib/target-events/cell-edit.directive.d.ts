import { Injector, OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
export declare class PblNgridCellEditDirective<T> implements OnDestroy {
    set cellEditClick(value: boolean);
    set cellEditDblClick(value: boolean);
    private _click;
    private _dblClick;
    private targetEventsPlugin;
    constructor(grid: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    ngOnDestroy(): void;
    private update;
    static ngAcceptInputType_cellEditClick: BooleanInput;
    static ngAcceptInputType_cellEditDblClick: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellEditDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellEditDirective<any>, "pbl-ngrid[cellEditClick], pbl-ngrid[cellEditDblClick]", never, { "cellEditClick": "cellEditClick"; "cellEditDblClick": "cellEditDblClick"; }, {}, never, never, false>;
}
