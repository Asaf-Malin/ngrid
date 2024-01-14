import { ListRange } from '@angular/cdk/collections';
import { AutoSizeVirtualScrollStrategy, ItemSizeAverager } from './auto-size-cdk';
import { PblNgridExtensionApi } from '../../../../../ext/grid-ext-api';
import { NgeVirtualTableRowInfo } from '../../virtual-scroll-for-of';
import { PblCdkVirtualScrollViewportComponent } from '../../virtual-scroll-viewport.component';
import { PblNgridVirtualScrollStrategy } from '../types';
declare module '../types' {
    interface PblNgridVirtualScrollStrategyMap {
        vScrollAuto: PblNgridAutoSizeVirtualScrollStrategy;
    }
}
export declare class PblNgridAutoSizeVirtualScrollStrategy extends AutoSizeVirtualScrollStrategy implements PblNgridVirtualScrollStrategy<'vScrollAuto'> {
    readonly averager: PblNgridItemSizeAverager;
    get type(): "vScrollAuto";
    protected extApi: PblNgridExtensionApi;
    constructor(minBufferPx: number, maxBufferPx: number, averager?: PblNgridItemSizeAverager);
    attachExtApi(extApi: PblNgridExtensionApi): void;
    attach(viewport: PblCdkVirtualScrollViewportComponent): void;
}
export declare class PblNgridItemSizeAverager extends ItemSizeAverager {
    private rowInfo;
    addSample(range: ListRange, size: number): void;
    /**
     * A temp workaround to solve the actual vs wanted rendered row issue in `CdkVirtualScrollViewport`
     *
     * `CdkVirtualScrollViewport.getRenderedRange()` return the rows that the virtual container want's the grid to render
     * however, the actual rendered rows might be different. This is a problem especially in init, when the rendered rows are actually 0
     * but `CdkVirtualScrollViewport.getRenderedRange()` return the initial range of rows that should be rendered. This results in a wrong
     * calculation of the average item size in `ItemSizeAverager`
     *
     * SEE: https://github.com/angular/material2/blob/a9e550e5bf93cd68c342d1a50d8576d8f3812ebe/src/cdk/scrolling/virtual-scroll-viewport.ts#L212-L220
     */
    setRowInfo(rowInfo: NgeVirtualTableRowInfo): void;
}
