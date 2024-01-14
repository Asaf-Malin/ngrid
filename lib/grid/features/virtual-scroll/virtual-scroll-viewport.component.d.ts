import { Observable } from 'rxjs';
import { AfterViewInit, ElementRef, EventEmitter, InjectionToken, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollDispatcher, CdkVirtualForOf, ViewportRuler, CdkVirtualScrollable } from '@angular/cdk/scrolling';
import { PblNgridConfigService } from '@pebula/ngrid/core';
import { PblNgridBaseVirtualScrollDirective } from './strategies/base-v-scroll.directive';
import { PblNgridVirtualScrollStrategy } from './strategies/types';
import { NgeVirtualTableRowInfo } from './virtual-scroll-for-of';
import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
import { RowIntersectionTracker } from './row-intersection';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        virtualScroll?: {
            wheelMode?: PblNgridBaseVirtualScrollDirective['wheelMode'];
            defaultStrategy?(): PblNgridVirtualScrollStrategy;
        };
    }
}
export declare const DISABLE_INTERSECTION_OBSERVABLE: InjectionToken<boolean>;
export declare class PblCdkVirtualScrollViewportComponent extends CdkVirtualScrollViewport implements OnInit, AfterViewInit, OnDestroy {
    private cdr;
    pblScrollStrategy: PblNgridVirtualScrollStrategy;
    private extApi;
    get isScrolling(): boolean;
    readonly enabled: boolean;
    /** @internal */
    _innerBoxHelper: ElementRef<HTMLElement>;
    /**
     * Emits the offset (in pixels) of the rendered content every time it changes.
     * The emission is done OUTSIDE of angular (i.e. no change detection cycle is triggered).
     *
     * Note that when not enabled (i.e `NoVirtualScrollStrategy` is used) there are no emissions.
     */
    readonly offsetChange: Observable<number>;
    stickyRowHeaderContainer: HTMLElement;
    stickyRowFooterContainer: HTMLElement;
    /**
     * Event emitted when the scrolling state of rows in the grid changes.
     * When scrolling starts `true` is emitted and when the scrolling ends `false` is emitted.
     *
     * The grid is in "scrolling" state from the first scroll event and until 2 animation frames
     * have passed without a scroll event.
     *
     * When scrolling, the emitted value is the direction: -1 or 1
     * When not scrolling, the emitted value is 0.
     *
     * NOTE: This event runs outside the angular zone.
     */
    scrolling: EventEmitter<0 | 1 | -1>;
    /**
     * Emits an estimation of the current frame rate while scrolling, in a 500ms interval.
     *
     * The frame rate value is the average frame rate from all measurements since the scrolling began.
     * To estimate the frame rate, a significant number of measurements is required so value is emitted every 500 ms.
     * This means that a single scroll or short scroll bursts will not result in a `scrollFrameRate` emissions.
     *
     * Valid on when virtual scrolling is enabled.
     *
     * NOTE: This event runs outside the angular zone.
     *
     * In the future the measurement logic might be replaced with the Frame Timing API
     * See:
     * - https://developers.google.com/web/updates/2014/11/frame-timing-api
     * - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
     * - https://github.com/googlearchive/frame-timing-polyfill/wiki/Explainer
     */
    scrollFrameRate: EventEmitter<number>;
    /**
     * The `scrollHeight` of the virtual scroll viewport.
     * The `scrollHeight` is updated by the virtual scroll (update logic and frequency depends on the strategy implementation) through
     * the `setTotalContentSize(size)` method. The input size is used to position a dummy spacer element at a position that mimics the `scrollHeight`.
     *
     * In theory, the size sent to `setTotalContentSize` should equal the `scrollHeight` value, once the browser update's the layout.
     * In reality it does not happen, sometimes they are not equal. Setting a size will result in a different `scrollHeight`.
     * This might be due to changes in measurements when handling sticky meta rows (moving back and forth)
     *
     * Because the position of the dummy spacer element is set through DI the layout will run in the next micro-task after the call to `setTotalContentSize`.
     */
    scrollHeight: number;
    ngeRenderedContentSize: number;
    pblFillerHeight: string;
    get wheelMode(): PblNgridBaseVirtualScrollDirective['wheelMode'];
    /**
     * Get the current bounding client rectangle boxes for the virtual scroll container
     * Since performing these measurements impact performance the values are are cached between request animation frames.
     * I.E 2 subsequent measurements will always return the same value, the next measurement will only take place after
     * the next animation frame (using `requestAnimationFrame` API)
     */
    get getBoundingClientRects(): {
        clientRect: DOMRect;
        innerWidth: number;
        innerHeight: number;
        scrollBarWidth: number;
        scrollBarHeight: number;
    };
    get innerWidth(): number;
    get outerWidth(): number;
    get innerHeight(): number;
    get outerHeight(): number;
    get scrollWidth(): number;
    /**
     * When true, the virtual paging feature is enabled because the virtual content size exceed the supported height of the browser so paging is enable.
     */
    get virtualPagingActive(): boolean;
    readonly intersection: RowIntersectionTracker;
    readonly element: HTMLElement;
    readonly _minWidth$: Observable<number>;
    private offsetChange$;
    private offset;
    private isCDPending;
    private _isScrolling;
    private wheelModeDefault;
    private grid;
    private forOf?;
    private _boundingClientRects;
    private heightPaging;
    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, ngZone: NgZone, config: PblNgridConfigService, pblScrollStrategy: PblNgridVirtualScrollStrategy, dir: Directionality, scrollDispatcher: ScrollDispatcher, viewportRuler: ViewportRuler, extApi: PblNgridInternalExtensionApi, disableIntersectionObserver?: boolean, scrollable?: CdkVirtualScrollable);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    reMeasureCurrentRenderedContent(): void;
    measureScrollOffset(from?: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number;
    getOffsetToRenderedContentStart(): number | null;
    setRenderedContentOffset(offset: number, to?: 'to-start' | 'to-end'): void;
    setTotalContentSize(size: number): void;
    /** Measure the combined size of all of the rendered items. */
    measureRenderedContentSize(): number;
    checkViewportSize(): void;
    detachViewPort(): void;
    /**
     * TODO(REFACTOR_REF 1): Move to use rowApi so we can accept rows/cells and not html elements.
     * It will allow us to bring into view rows as well.
     * This will change the methods signature!
     * @internal
     */
    _scrollIntoView(cellElement: HTMLElement): void;
    onSourceLengthChange(prev: number, curr: number): void;
    attach(forOf: CdkVirtualForOf<any> & NgeVirtualTableRowInfo): void;
    setRenderedRange(range: ListRange): void;
    getScrollBarThickness(location: 'horizontal' | 'vertical'): number;
    private updateFiller;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblCdkVirtualScrollViewportComponent, [null, null, null, null, { optional: true; }, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblCdkVirtualScrollViewportComponent, "pbl-cdk-virtual-scroll-viewport", never, { "stickyRowHeaderContainer": "stickyRowHeaderContainer"; "stickyRowFooterContainer": "stickyRowFooterContainer"; }, { "scrolling": "scrolling"; "scrollFrameRate": "scrollFrameRate"; }, never, [".cdk-virtual-scroll-before-content-wrapper", "*"], false>;
}
declare global {
    interface CSSStyleDeclaration {
        contain: string;
    }
}
