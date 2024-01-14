import { TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridMetaCellContext } from '../../context/index';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
/**
 * Header Cell definition for the pbl-ngrid.
 * Captures the template of a column's data row header cell as well as header cell-specific properties.
 *
 * `pblNgridHeaderCellDef` does the same thing that `matHeaderCellDef` and `cdkHeaderCellDef` do with one difference,
 * `pblNgridHeaderCellDef` is independent and does not require a column definition parent, instead it accept the ID of
 * the header cell.
 *
 * NOTE: Defining '*' as id will declare the header cell template as default, replacing the table's default header cell template.
 *
 * Make sure you set the proper id of the property you want to override.
 * When the `id` is set explicitly in the table column definition, this is not a problem but when if it's not set
 * the table generates a unique id based on a logic. If `name` is set the name is used, if no name is set
 * the `prop` is used (full with dot notation).
 */
export declare class PblNgridHeaderCellDefDirective<T> extends PblNgridBaseCellDef<PblNgridMetaCellContext<T>> {
    constructor(tRef: TemplateRef<PblNgridMetaCellContext<T>>, registry: PblNgridRegistryService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridHeaderCellDefDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridHeaderCellDefDirective<any>, "[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]", never, { "name": "pblNgridHeaderCellDef"; "type": "pblNgridHeaderCellTypeDef"; }, {}, never, never, false>;
}
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridMultiRegistryMap {
        headerCell?: PblNgridHeaderCellDefDirective<any>;
    }
}
