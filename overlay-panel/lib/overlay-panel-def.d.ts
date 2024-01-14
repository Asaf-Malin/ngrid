import { TemplateRef } from '@angular/core';
import { PblNgridComponent, PblNgridRegistryService, PblNgridMultiTemplateRegistry } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelRef } from './overlay-panel-ref';
import * as i0 from "@angular/core";
export interface PblNgridOverlayPanelContext<T = any> {
    grid: PblNgridComponent<T>;
    ref: PblNgridOverlayPanelRef;
}
export declare class PblNgridOverlayPanelDef extends PblNgridMultiTemplateRegistry<PblNgridComponent, 'overlayPanels'> {
    readonly kind: 'overlayPanels';
    name: string;
    constructor(tRef: TemplateRef<PblNgridComponent>, registry: PblNgridRegistryService);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridOverlayPanelDef, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridOverlayPanelDef, "[pblNgridOverlayPanelDef]", never, { "name": "pblNgridOverlayPanelDef"; }, {}, never, never, false>;
}
