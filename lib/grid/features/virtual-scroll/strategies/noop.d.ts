import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { PblNgridExtensionApi } from '../../../../ext/grid-ext-api';
import { PblNgridVirtualScrollStrategy } from './types';
declare module './types' {
    interface PblNgridVirtualScrollStrategyMap {
        vScrollNone: NoVirtualScrollStrategy;
    }
}
export declare class NoVirtualScrollStrategy implements PblNgridVirtualScrollStrategy<'vScrollNone'> {
    get type(): "vScrollNone";
    scrolledIndexChange: any;
    attachExtApi: (extApi: PblNgridExtensionApi) => void;
    attach: (viewport: CdkVirtualScrollViewport) => void;
    detach: () => void;
    onContentScrolled: () => void;
    onDataLengthChanged: () => void;
    onContentRendered: () => void;
    onRenderedOffsetChanged: () => void;
    scrollToIndex: (index: number, behavior: ScrollBehavior) => void;
}
