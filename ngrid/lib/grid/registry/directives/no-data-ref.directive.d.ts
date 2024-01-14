import { TemplateRef } from '@angular/core';
import { _PblNgridComponent } from '../../../tokens';
import { PblNgridRegistryService } from '../registry.service';
import { PblNgridSingleTemplateRegistry } from './single-template.directives';
import * as i0 from "@angular/core";
/**
 * Marks the element as the display element when grid has no data.
 *
 * @example
 * ```html
 *   <pbl-ngrid>
 *     <div *pblNgridNoDataRef style="height: 100%; display: flex; align-items: center; justify-content: center">
 *       <span>No Data</span>
 *     </div>
 *   </pbl-ngrid>
 * ```
 */
export declare class PblNgridNoDataRefDirective extends PblNgridSingleTemplateRegistry<{
    $implicit: _PblNgridComponent<any>;
}, 'noData'> {
    readonly kind: 'noData';
    constructor(tRef: TemplateRef<{
        $implicit: _PblNgridComponent<any>;
    }>, registry: PblNgridRegistryService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridNoDataRefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridNoDataRefDirective, "[pblNgridNoDataRef]", never, {}, {}, never, never, false>;
}
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridSingleRegistryMap {
        noData?: PblNgridNoDataRefDirective;
    }
}
