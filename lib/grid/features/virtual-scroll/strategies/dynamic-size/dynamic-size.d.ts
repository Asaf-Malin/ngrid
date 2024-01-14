import { Observable, Subject } from 'rxjs';
import { PblDataSource } from '@pebula/ngrid/core';
import { PblNgridExtensionApi } from '../../../../../ext/grid-ext-api';
import { PblCdkVirtualScrollViewportComponent } from '../../virtual-scroll-viewport.component';
import { PblNgridVirtualScrollStrategy } from '../types';
import { Sizer } from './sizer';
declare module '../types' {
    interface PblNgridVirtualScrollStrategyMap {
        vScrollDynamic: PblNgridDynamicVirtualScrollStrategy;
    }
}
export declare class PblNgridDynamicVirtualScrollStrategy implements PblNgridVirtualScrollStrategy<'vScrollDynamic'> {
    readonly type: 'vScrollDynamic';
    protected _scrolledIndexChange: Subject<number>;
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    scrolledIndexChange: Observable<number>;
    /** The attached viewport. */
    protected _viewport: PblCdkVirtualScrollViewportComponent | null;
    /** The minimum amount of buffer rendered beyond the viewport (in pixels). */
    protected _minBufferPx: number;
    /** The number of buffer items to render beyond the edge of the viewport (in pixels). */
    protected _maxBufferPx: number;
    protected _lastRenderedContentOffset: number;
    protected _lastExcessHeight: number;
    protected sizer: Sizer;
    private extApi;
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize: number, minBufferPx: number, maxBufferPx: number);
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize: number, minBufferPx: number, maxBufferPx: number): void;
    attachExtApi(extApi: PblNgridExtensionApi): void;
    attach(viewport: PblCdkVirtualScrollViewportComponent): void;
    detach(): void;
    onContentScrolled(): void;
    onDataLengthChanged(): void;
    onContentRendered(): void;
    onRenderedOffsetChanged(): void;
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index: number, behavior: ScrollBehavior): void;
    protected onDatasource(curr: PblDataSource, prev?: PblDataSource): void;
    protected _updateSizeAndRange(): void;
    /** Update the viewport's total content size. */
    protected _updateTotalContentSize(): void;
    protected _checkRenderedContentSize(): void;
    /** Update the viewport's rendered range. */
    protected _updateRenderedRange(skipSizeSync?: boolean): void;
}
