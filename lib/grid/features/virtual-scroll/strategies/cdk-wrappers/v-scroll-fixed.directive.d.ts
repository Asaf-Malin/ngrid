import { OnInit, OnChanges } from '@angular/core';
import { NumberInput } from '@angular/cdk/coercion';
import { PblNgridComponent } from '../../../../ngrid.component';
import { PblNgridBaseVirtualScrollDirective } from '../base-v-scroll.directive';
import * as i0 from "@angular/core";
/**
 * @deprecated Will be removed in v5
 * `vScrollFixed` will move to an independent package in v5.
 * Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 */
export declare class PblCdkFixedSizedVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective<'vScrollFixed'> implements OnInit, OnChanges {
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollFixed` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollFixed(): NumberInput;
    set vScrollFixed(value: NumberInput);
    private _vScrollFixed;
    constructor(grid: PblNgridComponent);
    ngOnInit(): void;
    ngOnChanges(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblCdkFixedSizedVirtualScrollDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblCdkFixedSizedVirtualScrollDirective, "pbl-ngrid[vScrollFixed]", never, { "minBufferPx": "minBufferPx"; "maxBufferPx": "maxBufferPx"; "wheelMode": "wheelMode"; "vScrollFixed": "vScrollFixed"; }, {}, never, never, false>;
}
