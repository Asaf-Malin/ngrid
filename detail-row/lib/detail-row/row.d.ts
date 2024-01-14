import { OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { PblNgridRowComponent } from '@pebula/ngrid';
import { PblDetailsRowToggleEvent } from './tokens';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/grid/context/types' {
    interface ExternalRowContextState {
        detailRow: boolean;
    }
}
export declare const PBL_NGRID_ROW_TEMPLATE = "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>";
export declare class PblNgridDetailRowComponent extends PblNgridRowComponent implements OnInit, OnDestroy, PblDetailsRowToggleEvent {
    get expended(): boolean;
    get height(): number;
    get row(): any;
    _viewRef: ViewContainerRef;
    private opened;
    private plugin;
    private controller;
    ngOnInit(): void;
    ngOnDestroy(): void;
    updateRow(): boolean;
    toggle(forceState?: boolean, fromRender?: boolean): void;
    /**
     * @internal
     */
    handleKeydown(event: KeyboardEvent): void;
    protected onCtor(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDetailRowComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridDetailRowComponent, "pbl-ngrid-row[detailRow]", ["pblNgridDetailRow"], {}, {}, never, [".pbl-ngrid-row-prefix", ".pbl-ngrid-row-suffix"], false>;
}
