import { Subject } from 'rxjs';
import { PblCdkVirtualScrollViewportComponent } from './virtual-scroll-viewport.component';
export declare class VirtualScrollHightPaging {
    private viewport;
    totalHeight: number;
    pageHeight: number;
    pageCount: number;
    coff: number;
    prevScrollOffset: number;
    offset: number;
    page: number;
    afterToEnd: boolean;
    active: boolean;
    activeChanged: Subject<void>;
    constructor(viewport: PblCdkVirtualScrollViewportComponent);
    transformScrollOffset(originalOffset: number): number;
    transformOffsetToRenderedContentStart(originalRenderContentStart: number | null): number | null;
    transformRenderedContentOffset(offset: number, to?: 'to-start' | 'to-end'): number;
    transformTotalContentSize(totalHeight: number, scrollOffset: number): number;
    shouldTransformTotalContentSize(totalHeight: number): boolean;
    dispose(): void;
}
