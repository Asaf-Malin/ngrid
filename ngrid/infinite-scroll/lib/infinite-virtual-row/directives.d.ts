import { OnInit, OnDestroy } from '@angular/core';
import { PblNgridRowDef } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridSingleRegistryMap {
        infiniteVirtualRow?: PblNgridInfiniteVirtualRowRefDirective;
    }
}
export declare class PblNgridInfiniteVirtualRowRefDirective<T = any> extends PblNgridRowDef<T> implements OnInit, OnDestroy {
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridInfiniteVirtualRowRefDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridInfiniteVirtualRowRefDirective<any>, "[pblNgridInfiniteVirtualRowDef]", never, { "columns": "pblNgridInfiniteVirtualRowDefColumns"; "when": "pblNgridInfiniteVirtualRowDefWhen"; }, {}, never, never, false>;
}
