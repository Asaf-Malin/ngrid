import { OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkLazyDropList } from '../core/index';
import { PblNgridRowDragDirective } from './row-drag';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        rowReorder?: PblNgridRowReorderPluginDirective;
    }
}
export declare const ROW_REORDER_PLUGIN_KEY: 'rowReorder';
export declare class PblNgridRowReorderPluginDirective<T = any> extends CdkLazyDropList<T, PblNgridRowReorderPluginDirective<T>> implements OnDestroy {
    id: string;
    get rowReorder(): boolean;
    set rowReorder(value: boolean);
    private _rowReorder;
    private _removePlugin;
    ngOnDestroy(): void;
    getSortedItems(): PblNgridRowDragDirective<any>[];
    protected initDropListRef(): void;
    protected gridChanged(): void;
    static ngAcceptInputType_rowReorder: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRowReorderPluginDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridRowReorderPluginDirective<any>, "pbl-ngrid[rowReorder]", ["pblNgridRowReorder"], { "rowReorder": "rowReorder"; }, {}, never, never, false>;
}
