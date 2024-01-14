import { TemplateRef } from '@angular/core';
import { PblColumnTypeDefinitionDataMap } from '@pebula/ngrid/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridCellContext } from '../../context/index';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
export declare class PblNgridEditorCellDefDirective<T, P extends keyof PblColumnTypeDefinitionDataMap = any> extends PblNgridBaseCellDef<PblNgridCellContext<T, P>> {
    type: P;
    constructor(tRef: TemplateRef<PblNgridCellContext<any, P>>, registry: PblNgridRegistryService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridEditorCellDefDirective<any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridEditorCellDefDirective<any, any>, "[pblNgridCellEditorDef], [pblNgridCellEditorTypeDef]", never, { "name": "pblNgridCellEditorDef"; "type": "pblNgridCellEditorTypeDef"; }, {}, never, never, false>;
}
declare module '@pebula/ngrid/core/lib/registry/types' {
    interface PblNgridMultiRegistryMap {
        editorCell?: PblNgridEditorCellDefDirective<any>;
    }
}
