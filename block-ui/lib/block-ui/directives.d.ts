import { TemplateRef } from '@angular/core';
import { PblNgridComponent, PblNgridRegistryService, PblNgridSingleTemplateRegistry } from '@pebula/ngrid';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/core/lib/registry/types' {
    interface PblNgridSingleRegistryMap {
        blocker?: PblNgridBlockUiDefDirective;
    }
}
/**
 * Marks the element as the display element when the form is busy.
 */
export declare class PblNgridBlockUiDefDirective extends PblNgridSingleTemplateRegistry<{
    $implicit: PblNgridComponent<any>;
}, 'blocker'> {
    readonly kind = "blocker";
    constructor(tRef: TemplateRef<{
        $implicit: PblNgridComponent<any>;
    }>, registry: PblNgridRegistryService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBlockUiDefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridBlockUiDefDirective, "[pblNgridBlockUiDef]", never, {}, {}, never, never, false>;
}
