import { Injector, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        matCheckboxSelection?: PblNgridMatCheckboxSelectionDirective;
    }
}
export declare const PLUGIN_KEY: 'matCheckboxSelection';
export declare class PblNgridMatCheckboxSelectionDirective implements OnDestroy {
    private table;
    private cfr;
    private injector;
    get isCheckboxDisabled(): (row: any) => boolean;
    set isCheckboxDisabled(value: (row: any) => boolean);
    /**
     * Add's a selection column using material's `mat-checkbox` in the column specified.
     */
    get matCheckboxSelection(): string;
    set matCheckboxSelection(value: string);
    /**
     * Defines the behavior when clicking on the bulk select checkbox (header).
     * There are 2 options:
     *
     * - all: Will select all items in the current collection
     * - view: Will select only the rendered items in the view
     *
     * The default value is `all`
     */
    get bulkSelectMode(): 'all' | 'view' | 'none';
    set bulkSelectMode(value: 'all' | 'view' | 'none');
    get matCheckboxSelectionColor(): ThemePalette;
    set matCheckboxSelectionColor(value: ThemePalette);
    private _name;
    private _bulkSelectMode;
    private _color;
    private cmpRef;
    private _removePlugin;
    private _isCheckboxDisabled;
    constructor(table: PblNgridComponent<any>, cfr: ComponentFactoryResolver, injector: Injector, pluginCtrl: PblNgridPluginController);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMatCheckboxSelectionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridMatCheckboxSelectionDirective, "pbl-ngrid[matCheckboxSelection]", never, { "isCheckboxDisabled": "isCheckboxDisabled"; "matCheckboxSelection": "matCheckboxSelection"; "bulkSelectMode": "bulkSelectMode"; "matCheckboxSelectionColor": "matCheckboxSelectionColor"; }, {}, never, never, false>;
}
