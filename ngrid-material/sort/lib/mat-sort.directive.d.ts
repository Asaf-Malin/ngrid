import { OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        matSort?: PblNgridMatSortDirective;
    }
}
export declare const PLUGIN_KEY: 'matSort';
export declare class PblNgridMatSortDirective implements OnDestroy {
    table: PblNgridComponent<any>;
    private pluginCtrl;
    sort: MatSort;
    private _removePlugin;
    constructor(table: PblNgridComponent<any>, pluginCtrl: PblNgridPluginController, sort: MatSort);
    ngOnDestroy(): void;
    private onSort;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMatSortDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridMatSortDirective, "pbl-ngrid[matSort]", ["pblMatSort"], {}, {}, never, never, false>;
}
