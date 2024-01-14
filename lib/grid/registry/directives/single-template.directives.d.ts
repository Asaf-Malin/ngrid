import { TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { PblNgridSingleRegistryMap } from '@asafmalin/ngrid/core';
import { PblNgridRegistryService } from '../registry.service';
import * as i0 from "@angular/core";
export declare abstract class PblNgridSingleTemplateRegistry<T, TKind extends keyof PblNgridSingleRegistryMap> implements OnInit, OnDestroy {
    tRef: TemplateRef<T>;
    protected registry: PblNgridRegistryService;
    abstract readonly kind: TKind;
    constructor(tRef: TemplateRef<T>, registry: PblNgridRegistryService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridSingleTemplateRegistry<any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridSingleTemplateRegistry<any, any>, never, never, {}, {}, never, never, false>;
}
