import { TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { PblNgridMultiRegistryMap } from '@asafmalin/ngrid/core';
import { PblNgridRegistryService } from '../registry.service';
import * as i0 from "@angular/core";
export declare abstract class PblNgridMultiTemplateRegistry<T, TKind extends keyof PblNgridMultiRegistryMap> implements OnInit, OnDestroy {
    tRef: TemplateRef<T>;
    protected registry: PblNgridRegistryService;
    abstract readonly name: string;
    abstract readonly kind: TKind;
    constructor(tRef: TemplateRef<T>, registry: PblNgridRegistryService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMultiTemplateRegistry<any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridMultiTemplateRegistry<any, any>, never, never, {}, {}, never, never, false>;
}
