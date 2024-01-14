import { AfterViewInit, OnDestroy, ElementRef, ViewContainerRef, NgZone, EmbeddedViewRef } from '@angular/core';
import { _PblNgridComponent } from '../../tokens';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { COLUMN, PblMetaColumn, PblColumn } from '../column/model';
import { MetaCellContext, PblNgridMetaCellContext } from '../context/index';
import { PblNgridDataHeaderExtensionContext, PblNgridMultiComponentRegistry } from '../registry';
import { PblNgridColumnDef } from '../column/directives/column-def';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
/**
 * Header cell component.
 * The header cell component will render the header cell template and add the proper classes and role.
 *
 * It is also responsible for creating and managing the any `dataHeaderExtensions` registered in the registry.
 * These extensions add features to the cells either as a template instance or as a component instance.
 * Examples: Sorting behavior, drag&drop/resize handlers, menus etc...
 */
export declare class PblNgridHeaderCellComponent<T extends COLUMN = COLUMN> extends PblNgridBaseCell implements AfterViewInit, OnDestroy {
    private zone;
    vcRef: ViewContainerRef;
    column: PblColumn;
    cellCtx: PblNgridDataHeaderExtensionContext | MetaCellContext;
    get columnDef(): PblNgridColumnDef<PblColumn>;
    get grid(): _PblNgridComponent;
    private resizeObserver;
    constructor(extApi: PblNgridInternalExtensionApi, elementRef: ElementRef, zone: NgZone);
    setColumn(column: PblColumn, gridWidthRow: boolean): void;
    updateSize(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected initMainHeaderColumnView(col: PblColumn): EmbeddedViewRef<PblNgridMetaCellContext<any, PblMetaColumn | PblColumn>>;
    protected runHeaderExtensions(context: PblNgridDataHeaderExtensionContext, view: EmbeddedViewRef<PblNgridMetaCellContext<any, PblColumn>>): void;
    protected createComponent(ext: PblNgridMultiComponentRegistry<any, "dataHeaderExtensions">, context: PblNgridDataHeaderExtensionContext, rootNodes: any[]): any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridHeaderCellComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridHeaderCellComponent<any>, "pbl-ngrid-header-cell", ["ngridHeaderCell"], {}, {}, never, never, false>;
}
