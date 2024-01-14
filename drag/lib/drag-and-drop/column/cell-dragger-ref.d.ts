import { TemplateRef } from '@angular/core';
import { PblNgridRegistryService, PblNgridMultiTemplateRegistry, PblNgridDataHeaderExtensionRef, PblNgridDataHeaderExtensionContext } from '@pebula/ngrid';
import * as i0 from "@angular/core";
/**
 * Marks the element as the resizer template for cells.
 */
export declare class PblNgridCellDraggerRefDirective extends PblNgridMultiTemplateRegistry<PblNgridDataHeaderExtensionContext, 'dataHeaderExtensions'> implements PblNgridDataHeaderExtensionRef {
    readonly name: 'cellDragger';
    readonly kind: 'dataHeaderExtensions';
    constructor(tRef: TemplateRef<PblNgridDataHeaderExtensionContext>, registry: PblNgridRegistryService);
    shouldRender(context: PblNgridDataHeaderExtensionContext): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellDraggerRefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellDraggerRefDirective, "[pblNgridCellDraggerRef]", never, {}, {}, never, never, false>;
}
