import { TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridMetaCellContext } from '../../context/index';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
export declare class PblNgridFooterCellDefDirective<T> extends PblNgridBaseCellDef<PblNgridMetaCellContext<T>> {
    constructor(tRef: TemplateRef<PblNgridMetaCellContext<T>>, registry: PblNgridRegistryService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridFooterCellDefDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridFooterCellDefDirective<any>, "[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]", never, { "name": "pblNgridFooterCellDef"; "type": "pblNgridFooterCellTypeDef"; }, {}, never, never, false>;
}
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridMultiRegistryMap {
        footerCell?: PblNgridFooterCellDefDirective<any>;
    }
}
