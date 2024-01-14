import { OnInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { COLUMN } from '@pebula/ngrid';
import { PblNgridColumnDragContainerDirective } from './column-drag-container';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        columnReorder?: PblNgridColumnReorderPluginDirective;
    }
}
export declare const COL_REORDER_PLUGIN_KEY: 'columnReorder';
export declare class PblNgridColumnReorderPluginDirective<T = any> extends PblNgridColumnDragContainerDirective<T> implements OnInit {
    get columnReorder(): boolean;
    set columnReorder(value: boolean);
    /**
     * When true, will not move the column on drop.
     * Instead you need to handle the dropped event.
     */
    get manualOverride(): boolean;
    set manualOverride(value: boolean);
    private _columnReorder;
    private _manualOverride;
    canDrag(column: COLUMN): boolean;
    ngOnInit(): void;
    protected gridChanged(): void;
    private _pblReset;
    static ngAcceptInputType_columnReorder: BooleanInput;
    static ngAcceptInputType_manualOverride: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridColumnReorderPluginDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridColumnReorderPluginDirective<any>, "pbl-ngrid[columnReorder]", ["pblNgridColumnReorder"], { "columnReorder": "columnReorder"; "manualOverride": "manualOverride"; }, {}, never, never, false>;
}
