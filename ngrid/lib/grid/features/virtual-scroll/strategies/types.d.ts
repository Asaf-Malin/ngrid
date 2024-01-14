import { VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { PblNgridExtensionApi } from '../../../../ext/grid-ext-api';
export interface PblNgridVirtualScrollStrategyMap {
}
export interface PblNgridVirtualScrollStrategy<T extends keyof PblNgridVirtualScrollStrategyMap = keyof PblNgridVirtualScrollStrategyMap> extends VirtualScrollStrategy {
    readonly type: T;
    attachExtApi(extApi: PblNgridExtensionApi): void;
}
