import { OnInit, OnChanges } from '@angular/core';
import { NumberInput } from '@angular/cdk/coercion';
import { PblNgridComponent } from '../../../ngrid.component';
import { PblNgridBaseVirtualScrollDirective } from './base-v-scroll.directive';
import * as i0 from "@angular/core";
/** A virtual scroll strategy that supports unknown or dynamic size items. */
export declare class PblCdkVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective<'vScrollDynamic' | 'vScrollNone'> implements OnInit, OnChanges {
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     */
    get vScrollDynamic(): NumberInput;
    set vScrollDynamic(value: NumberInput);
    private _vScrollDynamic;
    constructor(vScrollDynamic: any, vScrollNone: any, grid: PblNgridComponent<any>);
    ngOnInit(): void;
    ngOnChanges(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblCdkVirtualScrollDirective, [{ attribute: "vScrollDynamic"; }, { attribute: "vScrollNone"; }, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblCdkVirtualScrollDirective, "pbl-ngrid[vScrollDynamic], pbl-ngrid[vScrollNone]", never, { "minBufferPx": "minBufferPx"; "maxBufferPx": "maxBufferPx"; "wheelMode": "wheelMode"; "vScrollDynamic": "vScrollDynamic"; }, {}, never, never, false>;
}
