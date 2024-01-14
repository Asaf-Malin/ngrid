import { OnInit, OnChanges } from '@angular/core';
import { NumberInput } from '@angular/cdk/coercion';
import { PblNgridComponent } from '../../../../ngrid.component';
import { PblNgridBaseVirtualScrollDirective } from '../base-v-scroll.directive';
import * as i0 from "@angular/core";
/**
 * @deprecated Will be removed in v5
 * `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 * Note that the default virtual scroll strategy will also change from `vScrollAuto` to `vScrollDynamic`
 */
export declare class PblCdkAutoSizeVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective<'vScrollAuto'> implements OnInit, OnChanges {
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollAuto(): NumberInput;
    set vScrollAuto(value: NumberInput);
    private _vScrollAuto;
    constructor(grid: PblNgridComponent<any>);
    ngOnInit(): void;
    ngOnChanges(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblCdkAutoSizeVirtualScrollDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblCdkAutoSizeVirtualScrollDirective, "pbl-ngrid[vScrollAuto]", never, { "minBufferPx": "minBufferPx"; "maxBufferPx": "maxBufferPx"; "wheelMode": "wheelMode"; "vScrollAuto": "vScrollAuto"; }, {}, never, never, false>;
}
