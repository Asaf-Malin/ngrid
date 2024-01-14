import { TemplateRef } from '@angular/core';
import { PblNgridRegistryService, PblNgridMultiTemplateRegistry, PblNgridDataHeaderExtensionRef, PblNgridDataHeaderExtensionContext } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
/**
 * Marks the element as the resizer template for cells.
 */
export declare class PblNgridCellResizerRefDirective extends PblNgridMultiTemplateRegistry<PblNgridDataHeaderExtensionContext, 'dataHeaderExtensions'> implements PblNgridDataHeaderExtensionRef {
    readonly name: 'cellResizer';
    readonly kind: 'dataHeaderExtensions';
    constructor(tRef: TemplateRef<PblNgridDataHeaderExtensionContext>, registry: PblNgridRegistryService);
    shouldRender(context: PblNgridDataHeaderExtensionContext): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellResizerRefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellResizerRefDirective, "[pblNgridCellResizerRef]", never, {}, {}, never, never, false>;
}
