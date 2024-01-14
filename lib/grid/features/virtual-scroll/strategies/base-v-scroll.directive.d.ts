import { Observable } from 'rxjs';
import { NumberInput } from '@angular/cdk/coercion';
import { _PblNgridComponent } from '../../../../tokens';
import { PblNgridExtensionApi } from '../../../../ext/grid-ext-api';
import { PblCdkVirtualScrollViewportComponent } from '../virtual-scroll-viewport.component';
import { PblNgridVirtualScrollStrategy, PblNgridVirtualScrollStrategyMap } from './types';
export declare abstract class PblNgridBaseVirtualScrollDirective<T extends keyof PblNgridVirtualScrollStrategyMap = keyof PblNgridVirtualScrollStrategyMap> implements PblNgridVirtualScrollStrategy<T> {
    protected grid: _PblNgridComponent;
    readonly type: T;
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     *
     * Default: 100
     */
    get minBufferPx(): NumberInput;
    set minBufferPx(value: NumberInput);
    /**
     * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
     *
     * Default: 200
     */
    get maxBufferPx(): NumberInput;
    set maxBufferPx(value: NumberInput);
    get wheelMode(): 'passive' | 'blocking' | number;
    set wheelMode(value: 'passive' | 'blocking' | number);
    protected _wheelMode: 'passive' | 'blocking' | number;
    protected _maxBufferPx: number;
    protected _minBufferPx: number;
    constructor(grid: _PblNgridComponent, type: T);
    /** The scroll strategy used by this directive. */
    _scrollStrategy: PblNgridVirtualScrollStrategyMap[T];
    get scrolledIndexChange(): Observable<number>;
    set scrolledIndexChange(value: Observable<number>);
    attachExtApi(extApi: PblNgridExtensionApi): void;
    attach(viewport: PblCdkVirtualScrollViewportComponent): void;
    detach(): void;
    onContentScrolled(): void;
    onDataLengthChanged(): void;
    onContentRendered(): void;
    onRenderedOffsetChanged(): void;
    scrollToIndex(index: number, behavior: ScrollBehavior): void;
}
