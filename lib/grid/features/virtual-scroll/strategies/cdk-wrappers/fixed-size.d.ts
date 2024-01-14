import { PblNgridExtensionApi } from '../../../../../ext/grid-ext-api';
import { PblCdkVirtualScrollViewportComponent } from '../../virtual-scroll-viewport.component';
import { PblNgridVirtualScrollStrategy } from '../types';
import { FixedSizeVirtualScrollStrategy } from './fixed-size-cdk';
declare module '../types' {
    interface PblNgridVirtualScrollStrategyMap {
        vScrollFixed: PblNgridFixedSizeVirtualScrollStrategy;
    }
}
export declare class PblNgridFixedSizeVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy implements PblNgridVirtualScrollStrategy<'vScrollFixed'> {
    private itemSize;
    get type(): "vScrollFixed";
    private viewport;
    protected extApi: PblNgridExtensionApi;
    constructor(itemSize: number, minBufferPx: number, maxBufferPx: number);
    attachExtApi(extApi: PblNgridExtensionApi): void;
    attach(viewport: PblCdkVirtualScrollViewportComponent): void;
    onContentScrolled(): void;
}
