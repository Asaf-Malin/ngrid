import { ViewContainerRef } from '@angular/core';
import { _PblNgridComponent } from '../../tokens';
import { PblMetaColumn, PblColumnGroup } from '../column/model';
import { MetaCellContext } from '../context/index';
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
export declare class PblNgridMetaCellComponent<T extends PblMetaColumn | PblColumnGroup = PblMetaColumn | PblColumnGroup> extends PblNgridBaseCell {
    vcRef: ViewContainerRef;
    column: T;
    cellCtx: MetaCellContext<any, PblMetaColumn>;
    get columnDef(): PblNgridColumnDef<PblMetaColumn>;
    get grid(): _PblNgridComponent;
    setColumn(column: T, isFooter: boolean): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMetaCellComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridMetaCellComponent<any>, "pbl-ngrid-meta-cell", ["ngridMetaCell"], {}, {}, never, never, false>;
}
