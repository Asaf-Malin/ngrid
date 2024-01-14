import { TemplateRef } from '@angular/core';
import { _PblNgridComponent } from '../../../tokens';
import { PblNgridRegistryService } from '../registry.service';
import { PblNgridSingleTemplateRegistry } from './single-template.directives';
import * as i0 from "@angular/core";
/**
 * Marks the element as the display element for pagination
 */
export declare class PblNgridPaginatorRefDirective extends PblNgridSingleTemplateRegistry<{
    $implicit: _PblNgridComponent<any>;
}, 'paginator'> {
    readonly kind: 'paginator';
    constructor(tRef: TemplateRef<{
        $implicit: _PblNgridComponent<any>;
    }>, registry: PblNgridRegistryService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridPaginatorRefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridPaginatorRefDirective, "[pblNgridPaginatorRef]", never, {}, {}, never, never, false>;
}
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridSingleRegistryMap {
        paginator?: PblNgridPaginatorRefDirective;
    }
}
