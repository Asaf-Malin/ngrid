import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy, ElementRef, EventEmitter, Inject, InjectionToken, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, NgZone, Output, Optional, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY, VIRTUAL_SCROLLABLE, ScrollDispatcher, ViewportRuler, CdkVirtualScrollable, } from '@angular/cdk/scrolling';
import { PblNgridConfigService, unrx } from '@asafmalin/ngrid/core';
import { PblNgridBaseVirtualScrollDirective } from './strategies/base-v-scroll.directive';
import { PblVirtualScrollForOf } from './virtual-scroll-for-of';
import { EXT_API_TOKEN } from '../../../ext/grid-ext-api';
import { createScrollWatcherFn } from './scroll-logic/virtual-scroll-watcher';
import { PblNgridAutoSizeVirtualScrollStrategy } from './strategies/cdk-wrappers/auto-size';
import { RowIntersectionTracker } from './row-intersection';
import { resolveScrollStrategy } from './utils';
import { VirtualScrollHightPaging } from './virtual-scroll-height-paging';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid/core";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "@angular/cdk/scrolling";
import * as i4 from "@angular/common";
export const DISABLE_INTERSECTION_OBSERVABLE = new InjectionToken('When found in the DI tree and resolves to true, disable the use of IntersectionObserver');
const APP_DEFAULT_VIRTUAL_SCROLL_STRATEGY = () => new PblNgridAutoSizeVirtualScrollStrategy(100, 200);
export class PblCdkVirtualScrollViewportComponent extends CdkVirtualScrollViewport {
    constructor(elRef, cdr, ngZone, config, pblScrollStrategy, dir, scrollDispatcher, viewportRuler, extApi, disableIntersectionObserver, scrollable) {
        super(elRef, cdr, ngZone, 
        // TODO: Replace with `PblNgridDynamicVirtualScrollStrategy` in v4
        pblScrollStrategy = resolveScrollStrategy(config, pblScrollStrategy, APP_DEFAULT_VIRTUAL_SCROLL_STRATEGY), dir, scrollDispatcher, viewportRuler, scrollable);
        this.cdr = cdr;
        this.pblScrollStrategy = pblScrollStrategy;
        this.extApi = extApi;
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
        this.scrolling = new EventEmitter();
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
        this.scrollFrameRate = new EventEmitter();
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
        this.scrollHeight = 0;
        this.ngeRenderedContentSize = 0;
        this.offsetChange$ = new Subject();
        this.offset = 0;
        this._isScrolling = false;
        this.element = elRef.nativeElement;
        this.grid = extApi.grid;
        if (config.has('virtualScroll')) {
            this.wheelModeDefault = config.get('virtualScroll').wheelMode;
        }
        config.onUpdate('virtualScroll').pipe(unrx(this)).subscribe(change => this.wheelModeDefault = change.curr.wheelMode);
        this.enabled = pblScrollStrategy.type && pblScrollStrategy.type !== 'vScrollNone';
        extApi.setViewport(this);
        this.offsetChange = this.offsetChange$.asObservable();
        this._minWidth$ = this.grid.columnApi.totalColumnWidthChange;
        this.intersection = new RowIntersectionTracker(this.element, !!disableIntersectionObserver);
    }
    get isScrolling() { return this._isScrolling; }
    get wheelMode() {
        return this.pblScrollStrategy.wheelMode || this.wheelModeDefault || 'passive';
    }
    /**
     * Get the current bounding client rectangle boxes for the virtual scroll container
     * Since performing these measurements impact performance the values are are cached between request animation frames.
     * I.E 2 subsequent measurements will always return the same value, the next measurement will only take place after
     * the next animation frame (using `requestAnimationFrame` API)
     */
    get getBoundingClientRects() {
        if (!this._boundingClientRects) {
            const innerBox = this._innerBoxHelper.nativeElement.getBoundingClientRect();
            const clientRect = this.element.getBoundingClientRect();
            this._boundingClientRects = {
                clientRect,
                innerWidth: innerBox.width,
                innerHeight: innerBox.height,
                scrollBarWidth: clientRect.width - innerBox.width,
                scrollBarHeight: clientRect.height - innerBox.height,
            };
            const resetCurrentBox = () => this._boundingClientRects = undefined;
            if (this._isScrolling) {
                this.scrolling.pipe(filter(scrolling => scrolling === 0), take(1)).subscribe(resetCurrentBox);
            }
            else {
                requestAnimationFrame(resetCurrentBox);
            }
        }
        return this._boundingClientRects;
    }
    get innerWidth() {
        return this.getBoundingClientRects.innerWidth;
    }
    get outerWidth() {
        return this.getBoundingClientRects.clientRect.width;
    }
    get innerHeight() {
        return this.getBoundingClientRects.innerWidth;
    }
    get outerHeight() {
        return this.getBoundingClientRects.clientRect.height;
    }
    get scrollWidth() {
        return this.element.scrollWidth;
    }
    /**
     * When true, the virtual paging feature is enabled because the virtual content size exceed the supported height of the browser so paging is enable.
     */
    get virtualPagingActive() { return this.heightPaging?.active ?? false; }
    ngOnInit() {
        this.pblScrollStrategy.attachExtApi(this.extApi);
        if (this.enabled) {
            // Enabling virtual scroll event with browser height limit
            // Based on: http://jsfiddle.net/SDa2B/263/
            this.heightPaging = new VirtualScrollHightPaging(this);
        }
        super.ngOnInit();
        // Init the scrolling watcher which track scroll events an emits `scrolling` and `scrollFrameRate` events.
        this.ngZone.runOutsideAngular(() => this.elementScrolled().subscribe(createScrollWatcherFn(this)));
    }
    ngAfterViewInit() {
        // If virtual scroll is disabled (`NoVirtualScrollStrategy`) we need to disable any effect applied
        // by the viewport, wrapping the content injected to it.
        // The main effect is the grid having height 0 at all times, unless the height is explicitly set.
        // This happens because the content taking out of the layout, wrapped in absolute positioning.
        // Additionally, the host itself (viewport) is set to contain: strict.
        const { grid } = this;
        if (this.enabled) {
            this.forOf = new PblVirtualScrollForOf(this.extApi, this.ngZone);
            if (!this.heightPaging.active) {
                this.forOf.wheelControl.wheelListen();
            }
            // `wheel` mode does not work well with the workaround to fix height limit, so we disable it when it's on
            this.heightPaging.activeChanged
                .subscribe(() => {
                if (this.heightPaging.active) {
                    this.forOf.wheelControl.wheelUnListen();
                }
                else {
                    this.forOf.wheelControl.wheelListen();
                }
            });
        }
        this.scrolling
            .pipe(unrx(this))
            .subscribe(isScrolling => {
            this._isScrolling = !!isScrolling;
            if (isScrolling) {
                grid.addClass('pbl-ngrid-scrolling');
            }
            else {
                grid.removeClass('pbl-ngrid-scrolling');
            }
        });
    }
    ngOnDestroy() {
        this.intersection.destroy();
        this.heightPaging?.dispose();
        super.ngOnDestroy();
        this.detachViewPort();
        this.offsetChange$.complete();
        unrx.kill(this);
    }
    reMeasureCurrentRenderedContent() {
        this.pblScrollStrategy.onContentRendered();
    }
    measureScrollOffset(from) {
        const scrollOffset = super.measureScrollOffset(from);
        return (!from || from === 'top') && this.heightPaging ? this.heightPaging.transformScrollOffset(scrollOffset) : scrollOffset;
    }
    getOffsetToRenderedContentStart() {
        const renderedContentStart = super.getOffsetToRenderedContentStart();
        return this.heightPaging?.transformOffsetToRenderedContentStart(renderedContentStart) ?? renderedContentStart;
    }
    setRenderedContentOffset(offset, to = 'to-start') {
        if (this.heightPaging?.active) {
            offset = this.heightPaging.transformRenderedContentOffset(offset, to);
        }
        super.setRenderedContentOffset(offset, to);
        if (this.enabled) {
            if (this.offset !== offset) {
                this.offset = offset;
                if (!this.isCDPending) {
                    this.isCDPending = true;
                    this.ngZone.runOutsideAngular(() => Promise.resolve()
                        .then(() => {
                        this.isCDPending = false;
                        this.offsetChange$.next(this.offset);
                    }));
                }
            }
        }
    }
    setTotalContentSize(size) {
        if (this.heightPaging?.shouldTransformTotalContentSize(size)) {
            size = this.heightPaging.transformTotalContentSize(size, super.measureScrollOffset());
        }
        super.setTotalContentSize(size);
        // TODO(shlomiassaf)[perf, 3]: run this once... (aggregate all calls within the same animation frame)
        requestAnimationFrame(() => {
            this.scrollHeight = this.element.scrollHeight; //size;
            this.updateFiller();
            // We must trigger a change detection cycle because the filler div element is updated through bindings
            this.cdr.markForCheck();
        });
    }
    /** Measure the combined size of all of the rendered items. */
    measureRenderedContentSize() {
        let size = super.measureRenderedContentSize();
        if (this.orientation === 'vertical') {
            size -= this.stickyRowHeaderContainer.offsetHeight + this.stickyRowFooterContainer.offsetHeight;
            // Compensate for hz scroll bar, if exists, only in non virtual scroll mode.
            if (!this.enabled) {
                size += this.outerHeight - this.innerHeight;
            }
        }
        return this.ngeRenderedContentSize = size;
    }
    checkViewportSize() {
        // TODO: Check for changes in `CdkVirtualScrollViewport` source code, when resizing is handled!
        // see https://github.com/angular/material2/blob/28fb3abe77c5336e4739c820584ec99c23f1ae38/src/cdk/scrolling/virtual-scroll-viewport.ts#L341
        const prev = this.getViewportSize();
        super.checkViewportSize();
        if (prev !== this.getViewportSize()) {
            this.updateFiller();
        }
    }
    detachViewPort() {
        if (this.forOf) {
            this.forOf.destroy();
            this.forOf = undefined;
        }
    }
    /**
     * TODO(REFACTOR_REF 1): Move to use rowApi so we can accept rows/cells and not html elements.
     * It will allow us to bring into view rows as well.
     * This will change the methods signature!
     * @internal
     */
    _scrollIntoView(cellElement) {
        const container = this.element;
        const elBox = cellElement.getBoundingClientRect();
        const containerBox = this.getBoundingClientRects.clientRect;
        // Vertical handling.
        // We have vertical virtual scroll, so here we use the virtual scroll API to scroll into the target
        if (elBox.top < containerBox.top) { // out from top
            const offset = elBox.top - containerBox.top;
            this.scrollToOffset(this.measureScrollOffset() + offset);
        }
        else if (elBox.bottom > containerBox.bottom) { // out from bottom
            const offset = elBox.bottom - (containerBox.bottom - this.getScrollBarThickness('horizontal'));
            this.scrollToOffset(this.measureScrollOffset() + offset);
        }
        // Horizontal handling.
        // We DON'T have horizontal virtual scroll, so here we use the DOM API to scroll into the target
        // TODO: When implementing horizontal virtual scroll, refactor this as well.
        if (elBox.left < containerBox.left) { // out from left
            const offset = elBox.left - containerBox.left;
            container.scroll(container.scrollLeft + offset, container.scrollTop);
        }
        else if (elBox.right > containerBox.right) { // out from right
            const offset = elBox.right - (containerBox.right - this.getScrollBarThickness('vertical'));
            container.scroll(container.scrollLeft + offset, container.scrollTop);
        }
    }
    onSourceLengthChange(prev, curr) {
        this.checkViewportSize();
        this.updateFiller();
    }
    attach(forOf) {
        super.attach(forOf);
        const scrollStrategy = this.pblScrollStrategy instanceof PblNgridBaseVirtualScrollDirective
            ? this.pblScrollStrategy._scrollStrategy
            : this.pblScrollStrategy;
        if (scrollStrategy instanceof PblNgridAutoSizeVirtualScrollStrategy) {
            scrollStrategy.averager.setRowInfo(forOf);
        }
    }
    setRenderedRange(range) {
        super.setRenderedRange(range);
    }
    getScrollBarThickness(location) {
        switch (location) {
            case 'horizontal':
                return this.outerHeight - this.innerHeight;
            case 'vertical':
                return this.outerWidth - this.innerWidth;
        }
    }
    updateFiller() {
        this.measureRenderedContentSize();
        if (this.grid.noFiller) {
            this.pblFillerHeight = undefined;
        }
        else {
            this.pblFillerHeight = this.getViewportSize() >= this.ngeRenderedContentSize ?
                `calc(100% - ${this.ngeRenderedContentSize}px)`
                : undefined;
        }
    }
}
/** @nocollapse */ PblCdkVirtualScrollViewportComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollViewportComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i1.PblNgridConfigService }, { token: VIRTUAL_SCROLL_STRATEGY, optional: true }, { token: i2.Directionality, optional: true }, { token: i3.ScrollDispatcher }, { token: i3.ViewportRuler }, { token: EXT_API_TOKEN }, { token: DISABLE_INTERSECTION_OBSERVABLE, optional: true }, { token: VIRTUAL_SCROLLABLE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblCdkVirtualScrollViewportComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkVirtualScrollViewportComponent, selector: "pbl-cdk-virtual-scroll-viewport", inputs: { stickyRowHeaderContainer: "stickyRowHeaderContainer", stickyRowFooterContainer: "stickyRowFooterContainer" }, outputs: { scrolling: "scrolling", scrollFrameRate: "scrollFrameRate" }, host: { properties: { "class.cdk-virtual-scroll-disabled": "!enabled", "class.cdk-virtual-scroll-orientation-horizontal": "orientation === \"horizontal\"", "class.cdk-virtual-scroll-orientation-vertical": "orientation === \"vertical\"" }, classAttribute: "cdk-virtual-scroll-viewport" }, viewQueries: [{ propertyName: "_innerBoxHelper", first: true, predicate: ["innerBoxHelper"], descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<p #innerBoxHelper class=\"cdk-virtual-scroll-inner-width\"></p>\n<ng-content select=\".cdk-virtual-scroll-before-content-wrapper\"></ng-content>\n<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper [class.cdk-virtual-scroll-content-wrapper]=\"enabled\" style=\"width: 100%\" [style.minWidth.px]=\"_minWidth$ | async\">\n  <ng-content></ng-content>\n</div>\n\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div *ngIf=\"enabled\" class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n<div *ngIf=\"pblFillerHeight && enabled\"\n    class=\"pbl-ngrid-space-fill\"\n    [style.minWidth.px]=\"_minWidth$ | async\"\n    [style.top.px]=\"ngeRenderedContentSize\"\n    [style.height]=\"pblFillerHeight\"></div>\n", styles: ["pbl-cdk-virtual-scroll-viewport{display:block;position:relative;overflow:auto;contain:strict;transform:translateZ(0);will-change:scroll-position;-webkit-overflow-scrolling:touch}pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-inner-width{width:100%;height:100%;position:absolute;margin:0!important;padding:0!important}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{position:absolute;top:0;left:0;height:1px;width:1px;transform-origin:0 0}[dir=rtl] .cdk-virtual-scroll-spacer{right:0;left:auto;transform-origin:100% 0}.pbl-ngrid-space-fill{position:absolute;left:0;width:100%}\n"], dependencies: [{ kind: "directive", type: i4.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "pipe", type: i4.AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollViewportComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-cdk-virtual-scroll-viewport', host: {
                        class: 'cdk-virtual-scroll-viewport',
                        '[class.cdk-virtual-scroll-disabled]': '!enabled',
                        '[class.cdk-virtual-scroll-orientation-horizontal]': 'orientation === "horizontal"',
                        '[class.cdk-virtual-scroll-orientation-vertical]': 'orientation === "vertical"'
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, template: "<p #innerBoxHelper class=\"cdk-virtual-scroll-inner-width\"></p>\n<ng-content select=\".cdk-virtual-scroll-before-content-wrapper\"></ng-content>\n<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper [class.cdk-virtual-scroll-content-wrapper]=\"enabled\" style=\"width: 100%\" [style.minWidth.px]=\"_minWidth$ | async\">\n  <ng-content></ng-content>\n</div>\n\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div *ngIf=\"enabled\" class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n<div *ngIf=\"pblFillerHeight && enabled\"\n    class=\"pbl-ngrid-space-fill\"\n    [style.minWidth.px]=\"_minWidth$ | async\"\n    [style.top.px]=\"ngeRenderedContentSize\"\n    [style.height]=\"pblFillerHeight\"></div>\n", styles: ["pbl-cdk-virtual-scroll-viewport{display:block;position:relative;overflow:auto;contain:strict;transform:translateZ(0);will-change:scroll-position;-webkit-overflow-scrolling:touch}pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-inner-width{width:100%;height:100%;position:absolute;margin:0!important;padding:0!important}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{position:absolute;top:0;left:0;height:1px;width:1px;transform-origin:0 0}[dir=rtl] .cdk-virtual-scroll-spacer{right:0;left:auto;transform-origin:100% 0}.pbl-ngrid-space-fill{position:absolute;left:0;width:100%}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i1.PblNgridConfigService }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLL_STRATEGY]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i3.ScrollDispatcher }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DISABLE_INTERSECTION_OBSERVABLE]
                }] }, { type: i3.CdkVirtualScrollable, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLLABLE]
                }] }]; }, propDecorators: { _innerBoxHelper: [{
                type: ViewChild,
                args: ['innerBoxHelper', { static: true }]
            }], stickyRowHeaderContainer: [{
                type: Input
            }], stickyRowFooterContainer: [{
                type: Input
            }], scrolling: [{
                type: Output
            }], scrollFrameRate: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBQ0wsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsTUFBTSxFQUNOLE1BQU0sRUFDTixRQUFRLEdBR1QsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFDTCx3QkFBd0IsRUFDeEIsdUJBQXVCLEVBQ3ZCLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFFaEIsYUFBYSxFQUNiLG9CQUFvQixHQUNyQixNQUFNLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUdqRSxPQUFPLEVBQUUsa0NBQWtDLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUV6RixPQUFPLEVBQTBCLHFCQUFxQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDeEYsT0FBTyxFQUFFLGFBQWEsRUFBZ0MsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUM5RSxPQUFPLEVBQUUscUNBQXFDLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7Ozs7OztBQVcxRSxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLGNBQWMsQ0FBVSx5RkFBeUYsQ0FBQyxDQUFDO0FBQ3RLLE1BQU0sbUNBQW1DLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxxQ0FBcUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFldEcsTUFBTSxPQUFPLG9DQUFxQyxTQUFRLHdCQUF3QjtJQTZJaEYsWUFBWSxLQUE4QixFQUN0QixHQUFzQixFQUM5QixNQUFjLEVBQ2QsTUFBNkIsRUFDdUIsaUJBQWdELEVBQ3hGLEdBQW1CLEVBQy9CLGdCQUFrQyxFQUNsQyxhQUE0QixFQUNHLE1BQW9DLEVBQ2QsMkJBQXFDLEVBQ2xELFVBQWlDO1FBQ25GLEtBQUssQ0FBQyxLQUFLLEVBQ0wsR0FBRyxFQUNILE1BQU07UUFDSixrRUFBa0U7UUFDcEUsaUJBQWlCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLG1DQUFtQyxDQUFDLEVBQ3pHLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFVBQVUsQ0FBQyxDQUFDO1FBbEJBLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBR3NCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBK0I7UUFJckUsV0FBTSxHQUFOLE1BQU0sQ0FBOEI7UUFsSS9FOzs7Ozs7Ozs7OztXQVdHO1FBQ08sY0FBUyxHQUFHLElBQUksWUFBWSxFQUFnQixDQUFDO1FBRXZEOzs7Ozs7Ozs7Ozs7Ozs7O1dBZ0JHO1FBQ08sb0JBQWUsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBRXZEOzs7Ozs7Ozs7O1dBVUc7UUFDSCxpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUVqQiwyQkFBc0IsR0FBRyxDQUFDLENBQUM7UUFpRW5CLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN0QyxXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRVgsaUJBQVksR0FBRyxLQUFLLENBQUM7UUE0QjNCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFeEIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUMvRDtRQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXRILElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxJQUFJLGlCQUFpQixDQUFDLElBQUksS0FBSyxhQUFhLENBQUM7UUFFbEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQztRQUU3RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBL0tELElBQUksV0FBVyxLQUFjLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFrRXhELElBQUksU0FBUztRQUNYLE9BQVEsSUFBSSxDQUFDLGlCQUF3RCxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksU0FBUyxDQUFDO0lBQ3hILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQUksc0JBQXNCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM1RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHO2dCQUMxQixVQUFVO2dCQUNWLFVBQVUsRUFBRSxRQUFRLENBQUMsS0FBSztnQkFDMUIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNO2dCQUM1QixjQUFjLEVBQUUsVUFBVSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSztnQkFDakQsZUFBZSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU07YUFDckQsQ0FBQTtZQUVELE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7WUFDcEUsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQy9GO2lCQUFNO2dCQUNMLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDO0lBQ2hELENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQ3RELENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7SUFDaEQsQ0FBQztJQUVELElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDdkQsQ0FBQztJQUVELElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDbEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxtQkFBbUIsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7SUF1RHhFLFFBQVE7UUFDTixJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsMERBQTBEO1lBQzFELDJDQUEyQztZQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEQ7UUFDRCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFakIsMEdBQTBHO1FBQzFHLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFFLENBQUM7SUFDdkcsQ0FBQztJQUVELGVBQWU7UUFDYixrR0FBa0c7UUFDbEcsd0RBQXdEO1FBQ3hELGlHQUFpRztRQUNqRyw4RkFBOEY7UUFDOUYsc0VBQXNFO1FBQ3RFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxxQkFBcUIsQ0FBTSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3ZDO1lBRUQseUdBQXlHO1lBQ3pHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYTtpQkFDNUIsU0FBUyxDQUFFLEdBQUcsRUFBRTtnQkFDZixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztpQkFDekM7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3ZDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUVELElBQUksQ0FBQyxTQUFTO2FBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoQixTQUFTLENBQUUsV0FBVyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQ2xDLElBQUksV0FBVyxFQUFFO2dCQUNmLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN0QztpQkFBTTtnQkFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDekM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCwrQkFBK0I7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQTREO1FBQzlFLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztJQUMvSCxDQUFDO0lBRUQsK0JBQStCO1FBQzdCLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLHFDQUFxQyxDQUFDLG9CQUFvQixDQUFDLElBQUksb0JBQW9CLENBQUM7SUFDaEgsQ0FBQztJQUVELHdCQUF3QixDQUFDLE1BQWMsRUFBRSxLQUE0QixVQUFVO1FBQzdFLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUU7WUFDN0IsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsOEJBQThCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsS0FBSyxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFFeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO3lCQUNsRCxJQUFJLENBQUUsR0FBRyxFQUFFO3dCQUNWLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO3dCQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQyxDQUNILENBQUM7aUJBQ0g7YUFDRjtTQUNGO0lBQ0gsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQVk7UUFDOUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLCtCQUErQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVELElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGO1FBQ0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLHFHQUFxRztRQUNyRyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU87WUFDdEQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLHNHQUFzRztZQUN0RyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELDhEQUE4RDtJQUM5RCwwQkFBMEI7UUFDeEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRTtZQUNuQyxJQUFJLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDO1lBRWhHLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUM3QztTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0lBQzVDLENBQUM7SUFFRCxpQkFBaUI7UUFDZiwrRkFBK0Y7UUFDL0YsMklBQTJJO1FBQzNJLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsZUFBZSxDQUFDLFdBQXdCO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUU1RCxxQkFBcUI7UUFDckIsbUdBQW1HO1FBQ25HLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsZUFBZTtZQUNqRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7WUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUMxRDthQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsa0JBQWtCO1lBQ2pFLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQy9GLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDMUQ7UUFFRCx1QkFBdUI7UUFDdkIsZ0dBQWdHO1FBQ2hHLDRFQUE0RTtRQUM1RSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLGdCQUFnQjtZQUNwRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDOUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLE1BQU0sRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEU7YUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxFQUFFLGlCQUFpQjtZQUM5RCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMzRixTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsTUFBTSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0RTtJQUNILENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUM3QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFvRDtRQUN6RCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsWUFBWSxrQ0FBa0M7WUFDekYsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlO1lBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQ3pCO1FBQ0QsSUFBSSxjQUFjLFlBQVkscUNBQXFDLEVBQUU7WUFDbkUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0M7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBZ0I7UUFDL0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxRQUFtQztRQUN2RCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDN0MsS0FBSyxVQUFVO2dCQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVPLFlBQVk7UUFDbEIsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDbEMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztTQUNsQzthQUFNO1lBQ0wsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQzVFLGVBQWUsSUFBSSxDQUFDLHNCQUFzQixLQUFLO2dCQUMvQyxDQUFDLENBQUMsU0FBUyxDQUNaO1NBQ0Y7SUFDSCxDQUFDOztvSkF2WVUsb0NBQW9DLHdJQWlKZix1QkFBdUIsd0lBSW5DLGFBQWEsYUFDRCwrQkFBK0IsNkJBQy9CLGtCQUFrQjt3SUF2SnZDLG9DQUFvQyxnc0JDdEVqRCxxK0JBcUJBOzJGRGlEYSxvQ0FBb0M7a0JBYmhELFNBQVM7K0JBQ0UsaUNBQWlDLFFBR3JDO3dCQUNKLEtBQUssRUFBRSw2QkFBNkI7d0JBQ3BDLHFDQUFxQyxFQUFFLFVBQVU7d0JBQ2pELG1EQUFtRCxFQUFFLDhCQUE4Qjt3QkFDbkYsaURBQWlELEVBQUUsNEJBQTRCO3FCQUNoRixpQkFDYyxpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNOzswQkFtSmxDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsdUJBQXVCOzswQkFDMUMsUUFBUTs7MEJBR1IsTUFBTTsyQkFBQyxhQUFhOzswQkFDcEIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQywrQkFBK0I7OzBCQUNsRCxRQUFROzswQkFBSSxNQUFNOzJCQUFDLGtCQUFrQjs0Q0FqSkgsZUFBZTtzQkFBN0QsU0FBUzt1QkFBQyxnQkFBZ0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBVXBDLHdCQUF3QjtzQkFBaEMsS0FBSztnQkFDRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBY0ksU0FBUztzQkFBbEIsTUFBTTtnQkFtQkcsZUFBZTtzQkFBeEIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciwgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENvbXBvbmVudCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIE91dHB1dCxcbiAgT3B0aW9uYWwsXG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGlyZWN0aW9uYWxpdHkgfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQgeyBMaXN0UmFuZ2UgfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxuICBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgVklSVFVBTF9TQ1JPTExBQkxFLFxuICBTY3JvbGxEaXNwYXRjaGVyLFxuICBDZGtWaXJ0dWFsRm9yT2YsXG4gIFZpZXdwb3J0UnVsZXIsXG4gIENka1ZpcnR1YWxTY3JvbGxhYmxlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7IFBibE5ncmlkQ29uZmlnU2VydmljZSwgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlIH0gZnJvbSAnLi9zdHJhdGVnaWVzL2Jhc2Utdi1zY3JvbGwuZGlyZWN0aXZlJ1xuaW1wb3J0IHsgUGJsTmdyaWRWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuL3N0cmF0ZWdpZXMvdHlwZXMnO1xuaW1wb3J0IHsgTmdlVmlydHVhbFRhYmxlUm93SW5mbywgUGJsVmlydHVhbFNjcm9sbEZvck9mIH0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbC1mb3Itb2YnO1xuaW1wb3J0IHsgRVhUX0FQSV9UT0tFTiwgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgY3JlYXRlU2Nyb2xsV2F0Y2hlckZuIH0gZnJvbSAnLi9zY3JvbGwtbG9naWMvdmlydHVhbC1zY3JvbGwtd2F0Y2hlcic7XG5pbXBvcnQgeyBQYmxOZ3JpZEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IH0gZnJvbSAnLi9zdHJhdGVnaWVzL2Nkay13cmFwcGVycy9hdXRvLXNpemUnO1xuaW1wb3J0IHsgUm93SW50ZXJzZWN0aW9uVHJhY2tlciB9IGZyb20gJy4vcm93LWludGVyc2VjdGlvbic7XG5pbXBvcnQgeyByZXNvbHZlU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFZpcnR1YWxTY3JvbGxIaWdodFBhZ2luZyB9IGZyb20gJy4vdmlydHVhbC1zY3JvbGwtaGVpZ2h0LXBhZ2luZyc7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2NvcmUvbGliL2NvbmZpZ3VyYXRpb24vdHlwZScge1xuICBpbnRlcmZhY2UgUGJsTmdyaWRDb25maWcge1xuICAgIHZpcnR1YWxTY3JvbGw/OiB7XG4gICAgICB3aGVlbE1vZGU/OiBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlWyd3aGVlbE1vZGUnXTtcbiAgICAgIGRlZmF1bHRTdHJhdGVneT8oKTogUGJsTmdyaWRWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3k7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBESVNBQkxFX0lOVEVSU0VDVElPTl9PQlNFUlZBQkxFID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdXaGVuIGZvdW5kIGluIHRoZSBESSB0cmVlIGFuZCByZXNvbHZlcyB0byB0cnVlLCBkaXNhYmxlIHRoZSB1c2Ugb2YgSW50ZXJzZWN0aW9uT2JzZXJ2ZXInKTtcbmNvbnN0IEFQUF9ERUZBVUxUX1ZJUlRVQUxfU0NST0xMX1NUUkFURUdZID0gKCkgPT4gbmV3IFBibE5ncmlkQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3koMTAwLCAyMDApO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwYmwtY2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JyxcbiAgdGVtcGxhdGVVcmw6ICd2aXJ0dWFsLXNjcm9sbC12aWV3cG9ydC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAndmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50LnNjc3MnIF0sXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2Nkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydCcsXG4gICAgJ1tjbGFzcy5jZGstdmlydHVhbC1zY3JvbGwtZGlzYWJsZWRdJzogJyFlbmFibGVkJyxcbiAgICAnW2NsYXNzLmNkay12aXJ0dWFsLXNjcm9sbC1vcmllbnRhdGlvbi1ob3Jpem9udGFsXSc6ICdvcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCInLFxuICAgICdbY2xhc3MuY2RrLXZpcnR1YWwtc2Nyb2xsLW9yaWVudGF0aW9uLXZlcnRpY2FsXSc6ICdvcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiJ1xuICB9LFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQgZXh0ZW5kcyBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgZ2V0IGlzU2Nyb2xsaW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faXNTY3JvbGxpbmc7IH1cbiAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbjtcblxuICAvKiogQGludGVybmFsICovXG4gIEBWaWV3Q2hpbGQoJ2lubmVyQm94SGVscGVyJywgeyBzdGF0aWM6IHRydWUgfSkgX2lubmVyQm94SGVscGVyOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIG9mZnNldCAoaW4gcGl4ZWxzKSBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBldmVyeSB0aW1lIGl0IGNoYW5nZXMuXG4gICAqIFRoZSBlbWlzc2lvbiBpcyBkb25lIE9VVFNJREUgb2YgYW5ndWxhciAoaS5lLiBubyBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGlzIHRyaWdnZXJlZCkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB3aGVuIG5vdCBlbmFibGVkIChpLmUgYE5vVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBpcyB1c2VkKSB0aGVyZSBhcmUgbm8gZW1pc3Npb25zLlxuICAgKi9cbiAgcmVhZG9ubHkgb2Zmc2V0Q2hhbmdlOiBPYnNlcnZhYmxlPG51bWJlcj47XG5cbiAgQElucHV0KCkgc3RpY2t5Um93SGVhZGVyQ29udGFpbmVyOiBIVE1MRWxlbWVudDtcbiAgQElucHV0KCkgc3RpY2t5Um93Rm9vdGVyQ29udGFpbmVyOiBIVE1MRWxlbWVudDtcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzY3JvbGxpbmcgc3RhdGUgb2Ygcm93cyBpbiB0aGUgZ3JpZCBjaGFuZ2VzLlxuICAgKiBXaGVuIHNjcm9sbGluZyBzdGFydHMgYHRydWVgIGlzIGVtaXR0ZWQgYW5kIHdoZW4gdGhlIHNjcm9sbGluZyBlbmRzIGBmYWxzZWAgaXMgZW1pdHRlZC5cbiAgICpcbiAgICogVGhlIGdyaWQgaXMgaW4gXCJzY3JvbGxpbmdcIiBzdGF0ZSBmcm9tIHRoZSBmaXJzdCBzY3JvbGwgZXZlbnQgYW5kIHVudGlsIDIgYW5pbWF0aW9uIGZyYW1lc1xuICAgKiBoYXZlIHBhc3NlZCB3aXRob3V0IGEgc2Nyb2xsIGV2ZW50LlxuICAgKlxuICAgKiBXaGVuIHNjcm9sbGluZywgdGhlIGVtaXR0ZWQgdmFsdWUgaXMgdGhlIGRpcmVjdGlvbjogLTEgb3IgMVxuICAgKiBXaGVuIG5vdCBzY3JvbGxpbmcsIHRoZSBlbWl0dGVkIHZhbHVlIGlzIDAuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgZXZlbnQgcnVucyBvdXRzaWRlIHRoZSBhbmd1bGFyIHpvbmUuXG4gICAqL1xuICBAT3V0cHV0KCkgc2Nyb2xsaW5nID0gbmV3IEV2ZW50RW1pdHRlcjwgLTEgfCAwIHwgMSA+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGVzdGltYXRpb24gb2YgdGhlIGN1cnJlbnQgZnJhbWUgcmF0ZSB3aGlsZSBzY3JvbGxpbmcsIGluIGEgNTAwbXMgaW50ZXJ2YWwuXG4gICAqXG4gICAqIFRoZSBmcmFtZSByYXRlIHZhbHVlIGlzIHRoZSBhdmVyYWdlIGZyYW1lIHJhdGUgZnJvbSBhbGwgbWVhc3VyZW1lbnRzIHNpbmNlIHRoZSBzY3JvbGxpbmcgYmVnYW4uXG4gICAqIFRvIGVzdGltYXRlIHRoZSBmcmFtZSByYXRlLCBhIHNpZ25pZmljYW50IG51bWJlciBvZiBtZWFzdXJlbWVudHMgaXMgcmVxdWlyZWQgc28gdmFsdWUgaXMgZW1pdHRlZCBldmVyeSA1MDAgbXMuXG4gICAqIFRoaXMgbWVhbnMgdGhhdCBhIHNpbmdsZSBzY3JvbGwgb3Igc2hvcnQgc2Nyb2xsIGJ1cnN0cyB3aWxsIG5vdCByZXN1bHQgaW4gYSBgc2Nyb2xsRnJhbWVSYXRlYCBlbWlzc2lvbnMuXG4gICAqXG4gICAqIFZhbGlkIG9uIHdoZW4gdmlydHVhbCBzY3JvbGxpbmcgaXMgZW5hYmxlZC5cbiAgICpcbiAgICogTk9URTogVGhpcyBldmVudCBydW5zIG91dHNpZGUgdGhlIGFuZ3VsYXIgem9uZS5cbiAgICpcbiAgICogSW4gdGhlIGZ1dHVyZSB0aGUgbWVhc3VyZW1lbnQgbG9naWMgbWlnaHQgYmUgcmVwbGFjZWQgd2l0aCB0aGUgRnJhbWUgVGltaW5nIEFQSVxuICAgKiBTZWU6XG4gICAqIC0gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxNC8xMS9mcmFtZS10aW1pbmctYXBpXG4gICAqIC0gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1BlcmZvcm1hbmNlT2JzZXJ2ZXJcbiAgICogLSBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlYXJjaGl2ZS9mcmFtZS10aW1pbmctcG9seWZpbGwvd2lraS9FeHBsYWluZXJcbiAgICovXG4gIEBPdXRwdXQoKSBzY3JvbGxGcmFtZVJhdGUgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4oKTtcblxuICAvKipcbiAgICogVGhlIGBzY3JvbGxIZWlnaHRgIG9mIHRoZSB2aXJ0dWFsIHNjcm9sbCB2aWV3cG9ydC5cbiAgICogVGhlIGBzY3JvbGxIZWlnaHRgIGlzIHVwZGF0ZWQgYnkgdGhlIHZpcnR1YWwgc2Nyb2xsICh1cGRhdGUgbG9naWMgYW5kIGZyZXF1ZW5jeSBkZXBlbmRzIG9uIHRoZSBzdHJhdGVneSBpbXBsZW1lbnRhdGlvbikgdGhyb3VnaFxuICAgKiB0aGUgYHNldFRvdGFsQ29udGVudFNpemUoc2l6ZSlgIG1ldGhvZC4gVGhlIGlucHV0IHNpemUgaXMgdXNlZCB0byBwb3NpdGlvbiBhIGR1bW15IHNwYWNlciBlbGVtZW50IGF0IGEgcG9zaXRpb24gdGhhdCBtaW1pY3MgdGhlIGBzY3JvbGxIZWlnaHRgLlxuICAgKlxuICAgKiBJbiB0aGVvcnksIHRoZSBzaXplIHNlbnQgdG8gYHNldFRvdGFsQ29udGVudFNpemVgIHNob3VsZCBlcXVhbCB0aGUgYHNjcm9sbEhlaWdodGAgdmFsdWUsIG9uY2UgdGhlIGJyb3dzZXIgdXBkYXRlJ3MgdGhlIGxheW91dC5cbiAgICogSW4gcmVhbGl0eSBpdCBkb2VzIG5vdCBoYXBwZW4sIHNvbWV0aW1lcyB0aGV5IGFyZSBub3QgZXF1YWwuIFNldHRpbmcgYSBzaXplIHdpbGwgcmVzdWx0IGluIGEgZGlmZmVyZW50IGBzY3JvbGxIZWlnaHRgLlxuICAgKiBUaGlzIG1pZ2h0IGJlIGR1ZSB0byBjaGFuZ2VzIGluIG1lYXN1cmVtZW50cyB3aGVuIGhhbmRsaW5nIHN0aWNreSBtZXRhIHJvd3MgKG1vdmluZyBiYWNrIGFuZCBmb3J0aClcbiAgICpcbiAgICogQmVjYXVzZSB0aGUgcG9zaXRpb24gb2YgdGhlIGR1bW15IHNwYWNlciBlbGVtZW50IGlzIHNldCB0aHJvdWdoIERJIHRoZSBsYXlvdXQgd2lsbCBydW4gaW4gdGhlIG5leHQgbWljcm8tdGFzayBhZnRlciB0aGUgY2FsbCB0byBgc2V0VG90YWxDb250ZW50U2l6ZWAuXG4gICAqL1xuICBzY3JvbGxIZWlnaHQgPSAwO1xuXG4gIG5nZVJlbmRlcmVkQ29udGVudFNpemUgPSAwO1xuICBwYmxGaWxsZXJIZWlnaHQ6IHN0cmluZztcblxuICBnZXQgd2hlZWxNb2RlKCk6IFBibE5ncmlkQmFzZVZpcnR1YWxTY3JvbGxEaXJlY3RpdmVbJ3doZWVsTW9kZSddIHtcbiAgICByZXR1cm4gKHRoaXMucGJsU2Nyb2xsU3RyYXRlZ3kgYXMgUGJsTmdyaWRCYXNlVmlydHVhbFNjcm9sbERpcmVjdGl2ZSkud2hlZWxNb2RlIHx8IHRoaXMud2hlZWxNb2RlRGVmYXVsdCB8fCAncGFzc2l2ZSc7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGJvdW5kaW5nIGNsaWVudCByZWN0YW5nbGUgYm94ZXMgZm9yIHRoZSB2aXJ0dWFsIHNjcm9sbCBjb250YWluZXJcbiAgICogU2luY2UgcGVyZm9ybWluZyB0aGVzZSBtZWFzdXJlbWVudHMgaW1wYWN0IHBlcmZvcm1hbmNlIHRoZSB2YWx1ZXMgYXJlIGFyZSBjYWNoZWQgYmV0d2VlbiByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZXMuXG4gICAqIEkuRSAyIHN1YnNlcXVlbnQgbWVhc3VyZW1lbnRzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZSwgdGhlIG5leHQgbWVhc3VyZW1lbnQgd2lsbCBvbmx5IHRha2UgcGxhY2UgYWZ0ZXJcbiAgICogdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lICh1c2luZyBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBBUEkpXG4gICAqL1xuICBnZXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0cygpOiB7IGNsaWVudFJlY3Q6IERPTVJlY3Q7IGlubmVyV2lkdGg6IG51bWJlcjsgaW5uZXJIZWlnaHQ6IG51bWJlcjsgc2Nyb2xsQmFyV2lkdGg6IG51bWJlcjsgc2Nyb2xsQmFySGVpZ2h0OiBudW1iZXI7IH0ge1xuICAgIGlmICghdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0cykge1xuICAgICAgY29uc3QgaW5uZXJCb3ggPSB0aGlzLl9pbm5lckJveEhlbHBlci5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgY2xpZW50UmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdHMgPSB7XG4gICAgICAgIGNsaWVudFJlY3QsXG4gICAgICAgIGlubmVyV2lkdGg6IGlubmVyQm94LndpZHRoLFxuICAgICAgICBpbm5lckhlaWdodDogaW5uZXJCb3guaGVpZ2h0LFxuICAgICAgICBzY3JvbGxCYXJXaWR0aDogY2xpZW50UmVjdC53aWR0aCAtIGlubmVyQm94LndpZHRoLFxuICAgICAgICBzY3JvbGxCYXJIZWlnaHQ6IGNsaWVudFJlY3QuaGVpZ2h0IC0gaW5uZXJCb3guaGVpZ2h0LFxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNldEN1cnJlbnRCb3ggPSAoKSA9PiB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3RzID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKHRoaXMuX2lzU2Nyb2xsaW5nKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsaW5nLnBpcGUoZmlsdGVyKHNjcm9sbGluZyA9PiBzY3JvbGxpbmcgPT09IDApLCB0YWtlKDEpKS5zdWJzY3JpYmUocmVzZXRDdXJyZW50Qm94KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNldEN1cnJlbnRCb3gpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3RzO1xuICB9XG5cbiAgZ2V0IGlubmVyV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3RzLmlubmVyV2lkdGg7XG4gIH1cblxuICBnZXQgb3V0ZXJXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdHMuY2xpZW50UmVjdC53aWR0aDtcbiAgfVxuXG4gIGdldCBpbm5lckhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdHMuaW5uZXJXaWR0aDtcbiAgfVxuXG4gIGdldCBvdXRlckhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdHMuY2xpZW50UmVjdC5oZWlnaHQ7XG4gIH1cblxuICBnZXQgc2Nyb2xsV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnNjcm9sbFdpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdHJ1ZSwgdGhlIHZpcnR1YWwgcGFnaW5nIGZlYXR1cmUgaXMgZW5hYmxlZCBiZWNhdXNlIHRoZSB2aXJ0dWFsIGNvbnRlbnQgc2l6ZSBleGNlZWQgdGhlIHN1cHBvcnRlZCBoZWlnaHQgb2YgdGhlIGJyb3dzZXIgc28gcGFnaW5nIGlzIGVuYWJsZS5cbiAgICovXG4gIGdldCB2aXJ0dWFsUGFnaW5nQWN0aXZlKCkgeyByZXR1cm4gdGhpcy5oZWlnaHRQYWdpbmc/LmFjdGl2ZSA/PyBmYWxzZTsgfVxuXG4gIHJlYWRvbmx5IGludGVyc2VjdGlvbjogUm93SW50ZXJzZWN0aW9uVHJhY2tlcjtcbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHJlYWRvbmx5IF9taW5XaWR0aCQ6IE9ic2VydmFibGU8bnVtYmVyPjtcblxuICBwcml2YXRlIG9mZnNldENoYW5nZSQgPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgb2Zmc2V0ID0gMDtcbiAgcHJpdmF0ZSBpc0NEUGVuZGluZzogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuICBwcml2YXRlIHdoZWVsTW9kZURlZmF1bHQ6ICBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlWyd3aGVlbE1vZGUnXTtcbiAgcHJpdmF0ZSBncmlkOiBfUGJsTmdyaWRDb21wb25lbnQ8YW55PjtcbiAgcHJpdmF0ZSBmb3JPZj86IFBibFZpcnR1YWxTY3JvbGxGb3JPZjxhbnk+O1xuICBwcml2YXRlIF9ib3VuZGluZ0NsaWVudFJlY3RzOiBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnRbJ2dldEJvdW5kaW5nQ2xpZW50UmVjdHMnXTtcbiAgcHJpdmF0ZSBoZWlnaHRQYWdpbmc6IFZpcnR1YWxTY3JvbGxIaWdodFBhZ2luZztcblxuICBjb25zdHJ1Y3RvcihlbFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgbmdab25lOiBOZ1pvbmUsXG4gICAgICAgICAgICAgIGNvbmZpZzogUGJsTmdyaWRDb25maWdTZXJ2aWNlLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFZJUlRVQUxfU0NST0xMX1NUUkFURUdZKSBwdWJsaWMgcGJsU2Nyb2xsU3RyYXRlZ3k6IFBibE5ncmlkVmlydHVhbFNjcm9sbFN0cmF0ZWd5LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBkaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgICAgICAgICAgICBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgICAgICAgICAgICB2aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxuICAgICAgICAgICAgICBASW5qZWN0KEVYVF9BUElfVE9LRU4pIHByaXZhdGUgZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERJU0FCTEVfSU5URVJTRUNUSU9OX09CU0VSVkFCTEUpIGRpc2FibGVJbnRlcnNlY3Rpb25PYnNlcnZlcj86IGJvb2xlYW4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVklSVFVBTF9TQ1JPTExBQkxFKSBzY3JvbGxhYmxlPzogQ2RrVmlydHVhbFNjcm9sbGFibGUsKSB7XG4gICAgc3VwZXIoZWxSZWYsXG4gICAgICAgICAgY2RyLFxuICAgICAgICAgIG5nWm9uZSxcbiAgICAgICAgICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBgUGJsTmdyaWREeW5hbWljVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBpbiB2NFxuICAgICAgICAgIHBibFNjcm9sbFN0cmF0ZWd5ID0gcmVzb2x2ZVNjcm9sbFN0cmF0ZWd5KGNvbmZpZywgcGJsU2Nyb2xsU3RyYXRlZ3ksIEFQUF9ERUZBVUxUX1ZJUlRVQUxfU0NST0xMX1NUUkFURUdZKSxcbiAgICAgICAgICBkaXIsXG4gICAgICAgICAgc2Nyb2xsRGlzcGF0Y2hlcixcbiAgICAgICAgICB2aWV3cG9ydFJ1bGVyLFxuICAgICAgICAgIHNjcm9sbGFibGUpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5ncmlkID0gZXh0QXBpLmdyaWQ7XG5cbiAgICBpZiAoY29uZmlnLmhhcygndmlydHVhbFNjcm9sbCcpKSB7XG4gICAgICB0aGlzLndoZWVsTW9kZURlZmF1bHQgPSBjb25maWcuZ2V0KCd2aXJ0dWFsU2Nyb2xsJykud2hlZWxNb2RlO1xuICAgIH1cbiAgICBjb25maWcub25VcGRhdGUoJ3ZpcnR1YWxTY3JvbGwnKS5waXBlKHVucngodGhpcykpLnN1YnNjcmliZSggY2hhbmdlID0+IHRoaXMud2hlZWxNb2RlRGVmYXVsdCA9IGNoYW5nZS5jdXJyLndoZWVsTW9kZSk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBwYmxTY3JvbGxTdHJhdGVneS50eXBlICYmIHBibFNjcm9sbFN0cmF0ZWd5LnR5cGUgIT09ICd2U2Nyb2xsTm9uZSc7XG5cbiAgICBleHRBcGkuc2V0Vmlld3BvcnQodGhpcyk7XG4gICAgdGhpcy5vZmZzZXRDaGFuZ2UgPSB0aGlzLm9mZnNldENoYW5nZSQuYXNPYnNlcnZhYmxlKCk7XG5cbiAgICB0aGlzLl9taW5XaWR0aCQgPSB0aGlzLmdyaWQuY29sdW1uQXBpLnRvdGFsQ29sdW1uV2lkdGhDaGFuZ2U7XG5cbiAgICB0aGlzLmludGVyc2VjdGlvbiA9IG5ldyBSb3dJbnRlcnNlY3Rpb25UcmFja2VyKHRoaXMuZWxlbWVudCwgISFkaXNhYmxlSW50ZXJzZWN0aW9uT2JzZXJ2ZXIpO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5wYmxTY3JvbGxTdHJhdGVneS5hdHRhY2hFeHRBcGkodGhpcy5leHRBcGkpO1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIC8vIEVuYWJsaW5nIHZpcnR1YWwgc2Nyb2xsIGV2ZW50IHdpdGggYnJvd3NlciBoZWlnaHQgbGltaXRcbiAgICAgIC8vIEJhc2VkIG9uOiBodHRwOi8vanNmaWRkbGUubmV0L1NEYTJCLzI2My9cbiAgICAgIHRoaXMuaGVpZ2h0UGFnaW5nID0gbmV3IFZpcnR1YWxTY3JvbGxIaWdodFBhZ2luZyh0aGlzKTtcbiAgICB9XG4gICAgc3VwZXIubmdPbkluaXQoKTtcblxuICAgIC8vIEluaXQgdGhlIHNjcm9sbGluZyB3YXRjaGVyIHdoaWNoIHRyYWNrIHNjcm9sbCBldmVudHMgYW4gZW1pdHMgYHNjcm9sbGluZ2AgYW5kIGBzY3JvbGxGcmFtZVJhdGVgIGV2ZW50cy5cbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciggKCkgPT4gdGhpcy5lbGVtZW50U2Nyb2xsZWQoKS5zdWJzY3JpYmUoY3JlYXRlU2Nyb2xsV2F0Y2hlckZuKHRoaXMpKSApO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIC8vIElmIHZpcnR1YWwgc2Nyb2xsIGlzIGRpc2FibGVkIChgTm9WaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgKSB3ZSBuZWVkIHRvIGRpc2FibGUgYW55IGVmZmVjdCBhcHBsaWVkXG4gICAgLy8gYnkgdGhlIHZpZXdwb3J0LCB3cmFwcGluZyB0aGUgY29udGVudCBpbmplY3RlZCB0byBpdC5cbiAgICAvLyBUaGUgbWFpbiBlZmZlY3QgaXMgdGhlIGdyaWQgaGF2aW5nIGhlaWdodCAwIGF0IGFsbCB0aW1lcywgdW5sZXNzIHRoZSBoZWlnaHQgaXMgZXhwbGljaXRseSBzZXQuXG4gICAgLy8gVGhpcyBoYXBwZW5zIGJlY2F1c2UgdGhlIGNvbnRlbnQgdGFraW5nIG91dCBvZiB0aGUgbGF5b3V0LCB3cmFwcGVkIGluIGFic29sdXRlIHBvc2l0aW9uaW5nLlxuICAgIC8vIEFkZGl0aW9uYWxseSwgdGhlIGhvc3QgaXRzZWxmICh2aWV3cG9ydCkgaXMgc2V0IHRvIGNvbnRhaW46IHN0cmljdC5cbiAgICBjb25zdCB7IGdyaWQgfSA9IHRoaXM7XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy5mb3JPZiA9IG5ldyBQYmxWaXJ0dWFsU2Nyb2xsRm9yT2Y8YW55Pih0aGlzLmV4dEFwaSwgdGhpcy5uZ1pvbmUpO1xuICAgICAgaWYgKCF0aGlzLmhlaWdodFBhZ2luZy5hY3RpdmUpIHtcbiAgICAgICAgdGhpcy5mb3JPZi53aGVlbENvbnRyb2wud2hlZWxMaXN0ZW4oKTtcbiAgICAgIH1cblxuICAgICAgLy8gYHdoZWVsYCBtb2RlIGRvZXMgbm90IHdvcmsgd2VsbCB3aXRoIHRoZSB3b3JrYXJvdW5kIHRvIGZpeCBoZWlnaHQgbGltaXQsIHNvIHdlIGRpc2FibGUgaXQgd2hlbiBpdCdzIG9uXG4gICAgICB0aGlzLmhlaWdodFBhZ2luZy5hY3RpdmVDaGFuZ2VkXG4gICAgICAgIC5zdWJzY3JpYmUoICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5oZWlnaHRQYWdpbmcuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmZvck9mLndoZWVsQ29udHJvbC53aGVlbFVuTGlzdGVuKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZm9yT2Yud2hlZWxDb250cm9sLndoZWVsTGlzdGVuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnNjcm9sbGluZ1xuICAgICAgLnBpcGUodW5yeCh0aGlzKSlcbiAgICAgIC5zdWJzY3JpYmUoIGlzU2Nyb2xsaW5nID0+IHtcbiAgICAgICAgdGhpcy5faXNTY3JvbGxpbmcgPSAhIWlzU2Nyb2xsaW5nO1xuICAgICAgICBpZiAoaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICBncmlkLmFkZENsYXNzKCdwYmwtbmdyaWQtc2Nyb2xsaW5nJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ3JpZC5yZW1vdmVDbGFzcygncGJsLW5ncmlkLXNjcm9sbGluZycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJzZWN0aW9uLmRlc3Ryb3koKTtcbiAgICB0aGlzLmhlaWdodFBhZ2luZz8uZGlzcG9zZSgpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5kZXRhY2hWaWV3UG9ydCgpO1xuICAgIHRoaXMub2Zmc2V0Q2hhbmdlJC5jb21wbGV0ZSgpO1xuICAgIHVucngua2lsbCh0aGlzKTtcbiAgfVxuXG4gIHJlTWVhc3VyZUN1cnJlbnRSZW5kZXJlZENvbnRlbnQoKSB7XG4gICAgdGhpcy5wYmxTY3JvbGxTdHJhdGVneS5vbkNvbnRlbnRSZW5kZXJlZCgpO1xuICB9XG5cbiAgbWVhc3VyZVNjcm9sbE9mZnNldChmcm9tPzogJ3RvcCcgfCAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnc3RhcnQnIHwgJ2VuZCcpOiBudW1iZXIge1xuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHN1cGVyLm1lYXN1cmVTY3JvbGxPZmZzZXQoZnJvbSk7XG4gICAgcmV0dXJuICghZnJvbSB8fCBmcm9tID09PSAndG9wJykgJiYgdGhpcy5oZWlnaHRQYWdpbmcgPyB0aGlzLmhlaWdodFBhZ2luZy50cmFuc2Zvcm1TY3JvbGxPZmZzZXQoc2Nyb2xsT2Zmc2V0KSA6IHNjcm9sbE9mZnNldDtcbiAgfVxuXG4gIGdldE9mZnNldFRvUmVuZGVyZWRDb250ZW50U3RhcnQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgcmVuZGVyZWRDb250ZW50U3RhcnQgPSBzdXBlci5nZXRPZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KCk7XG4gICAgcmV0dXJuIHRoaXMuaGVpZ2h0UGFnaW5nPy50cmFuc2Zvcm1PZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KHJlbmRlcmVkQ29udGVudFN0YXJ0KSA/PyByZW5kZXJlZENvbnRlbnRTdGFydDtcbiAgfVxuXG4gIHNldFJlbmRlcmVkQ29udGVudE9mZnNldChvZmZzZXQ6IG51bWJlciwgdG86ICd0by1zdGFydCcgfCAndG8tZW5kJyA9ICd0by1zdGFydCcpIHtcbiAgICBpZiAodGhpcy5oZWlnaHRQYWdpbmc/LmFjdGl2ZSkge1xuICAgICAgb2Zmc2V0ID0gdGhpcy5oZWlnaHRQYWdpbmcudHJhbnNmb3JtUmVuZGVyZWRDb250ZW50T2Zmc2V0KG9mZnNldCwgdG8pO1xuICAgIH1cbiAgICBzdXBlci5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQob2Zmc2V0LCB0byk7XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgaWYgKHRoaXMub2Zmc2V0ICE9PSBvZmZzZXQpIHtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgIGlmICghdGhpcy5pc0NEUGVuZGluZykge1xuICAgICAgICAgIHRoaXMuaXNDRFBlbmRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuaXNDRFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdGhpcy5vZmZzZXRDaGFuZ2UkLm5leHQodGhpcy5vZmZzZXQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0VG90YWxDb250ZW50U2l6ZShzaXplOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5oZWlnaHRQYWdpbmc/LnNob3VsZFRyYW5zZm9ybVRvdGFsQ29udGVudFNpemUoc2l6ZSkpIHtcbiAgICAgIHNpemUgPSB0aGlzLmhlaWdodFBhZ2luZy50cmFuc2Zvcm1Ub3RhbENvbnRlbnRTaXplKHNpemUsIHN1cGVyLm1lYXN1cmVTY3JvbGxPZmZzZXQoKSk7XG4gICAgfVxuICAgIHN1cGVyLnNldFRvdGFsQ29udGVudFNpemUoc2l6ZSk7XG5cbiAgICAvLyBUT0RPKHNobG9taWFzc2FmKVtwZXJmLCAzXTogcnVuIHRoaXMgb25jZS4uLiAoYWdncmVnYXRlIGFsbCBjYWxscyB3aXRoaW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZyYW1lKVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICB0aGlzLnNjcm9sbEhlaWdodCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHQ7IC8vc2l6ZTtcbiAgICAgIHRoaXMudXBkYXRlRmlsbGVyKCk7XG4gICAgICAvLyBXZSBtdXN0IHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGJlY2F1c2UgdGhlIGZpbGxlciBkaXYgZWxlbWVudCBpcyB1cGRhdGVkIHRocm91Z2ggYmluZGluZ3NcbiAgICAgIHRoaXMuY2RyLm1hcmtGb3JDaGVjaygpO1xuICAgIH0pXG4gIH1cblxuICAvKiogTWVhc3VyZSB0aGUgY29tYmluZWQgc2l6ZSBvZiBhbGwgb2YgdGhlIHJlbmRlcmVkIGl0ZW1zLiAqL1xuICBtZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpOiBudW1iZXIge1xuICAgIGxldCBzaXplID0gc3VwZXIubWVhc3VyZVJlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgc2l6ZSAtPSB0aGlzLnN0aWNreVJvd0hlYWRlckNvbnRhaW5lci5vZmZzZXRIZWlnaHQgKyB0aGlzLnN0aWNreVJvd0Zvb3RlckNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgIC8vIENvbXBlbnNhdGUgZm9yIGh6IHNjcm9sbCBiYXIsIGlmIGV4aXN0cywgb25seSBpbiBub24gdmlydHVhbCBzY3JvbGwgbW9kZS5cbiAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgIHNpemUgKz0gdGhpcy5vdXRlckhlaWdodCAtIHRoaXMuaW5uZXJIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5nZVJlbmRlcmVkQ29udGVudFNpemUgPSBzaXplO1xuICB9XG5cbiAgY2hlY2tWaWV3cG9ydFNpemUoKSB7XG4gICAgLy8gVE9ETzogQ2hlY2sgZm9yIGNoYW5nZXMgaW4gYENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydGAgc291cmNlIGNvZGUsIHdoZW4gcmVzaXppbmcgaXMgaGFuZGxlZCFcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyL2Jsb2IvMjhmYjNhYmU3N2M1MzM2ZTQ3MzljODIwNTg0ZWM5OWMyM2YxYWUzOC9zcmMvY2RrL3Njcm9sbGluZy92aXJ0dWFsLXNjcm9sbC12aWV3cG9ydC50cyNMMzQxXG4gICAgY29uc3QgcHJldiA9IHRoaXMuZ2V0Vmlld3BvcnRTaXplKCk7XG4gICAgc3VwZXIuY2hlY2tWaWV3cG9ydFNpemUoKTtcbiAgICBpZiAocHJldiAhPT0gdGhpcy5nZXRWaWV3cG9ydFNpemUoKSkge1xuICAgICAgdGhpcy51cGRhdGVGaWxsZXIoKTtcbiAgICB9XG4gIH1cblxuICBkZXRhY2hWaWV3UG9ydCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5mb3JPZikge1xuICAgICAgdGhpcy5mb3JPZi5kZXN0cm95KCk7XG4gICAgICB0aGlzLmZvck9mID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPKFJFRkFDVE9SX1JFRiAxKTogTW92ZSB0byB1c2Ugcm93QXBpIHNvIHdlIGNhbiBhY2NlcHQgcm93cy9jZWxscyBhbmQgbm90IGh0bWwgZWxlbWVudHMuXG4gICAqIEl0IHdpbGwgYWxsb3cgdXMgdG8gYnJpbmcgaW50byB2aWV3IHJvd3MgYXMgd2VsbC5cbiAgICogVGhpcyB3aWxsIGNoYW5nZSB0aGUgbWV0aG9kcyBzaWduYXR1cmUhXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3Njcm9sbEludG9WaWV3KGNlbGxFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudDtcbiAgICBjb25zdCBlbEJveCA9IGNlbGxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGNvbnRhaW5lckJveCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0cy5jbGllbnRSZWN0O1xuXG4gICAgLy8gVmVydGljYWwgaGFuZGxpbmcuXG4gICAgLy8gV2UgaGF2ZSB2ZXJ0aWNhbCB2aXJ0dWFsIHNjcm9sbCwgc28gaGVyZSB3ZSB1c2UgdGhlIHZpcnR1YWwgc2Nyb2xsIEFQSSB0byBzY3JvbGwgaW50byB0aGUgdGFyZ2V0XG4gICAgaWYgKGVsQm94LnRvcCA8IGNvbnRhaW5lckJveC50b3ApIHsgLy8gb3V0IGZyb20gdG9wXG4gICAgICBjb25zdCBvZmZzZXQgPSBlbEJveC50b3AgLSBjb250YWluZXJCb3gudG9wO1xuICAgICAgdGhpcy5zY3JvbGxUb09mZnNldCh0aGlzLm1lYXN1cmVTY3JvbGxPZmZzZXQoKSArIG9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChlbEJveC5ib3R0b20gPiBjb250YWluZXJCb3guYm90dG9tKSB7IC8vIG91dCBmcm9tIGJvdHRvbVxuICAgICAgY29uc3Qgb2Zmc2V0ID0gZWxCb3guYm90dG9tIC0gKGNvbnRhaW5lckJveC5ib3R0b20gLSB0aGlzLmdldFNjcm9sbEJhclRoaWNrbmVzcygnaG9yaXpvbnRhbCcpKTtcbiAgICAgIHRoaXMuc2Nyb2xsVG9PZmZzZXQodGhpcy5tZWFzdXJlU2Nyb2xsT2Zmc2V0KCkgKyBvZmZzZXQpO1xuICAgIH1cblxuICAgIC8vIEhvcml6b250YWwgaGFuZGxpbmcuXG4gICAgLy8gV2UgRE9OJ1QgaGF2ZSBob3Jpem9udGFsIHZpcnR1YWwgc2Nyb2xsLCBzbyBoZXJlIHdlIHVzZSB0aGUgRE9NIEFQSSB0byBzY3JvbGwgaW50byB0aGUgdGFyZ2V0XG4gICAgLy8gVE9ETzogV2hlbiBpbXBsZW1lbnRpbmcgaG9yaXpvbnRhbCB2aXJ0dWFsIHNjcm9sbCwgcmVmYWN0b3IgdGhpcyBhcyB3ZWxsLlxuICAgIGlmIChlbEJveC5sZWZ0IDwgY29udGFpbmVyQm94LmxlZnQpIHsgLy8gb3V0IGZyb20gbGVmdFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gZWxCb3gubGVmdCAtIGNvbnRhaW5lckJveC5sZWZ0O1xuICAgICAgY29udGFpbmVyLnNjcm9sbChjb250YWluZXIuc2Nyb2xsTGVmdCArIG9mZnNldCwgY29udGFpbmVyLnNjcm9sbFRvcCk7XG4gICAgfSBlbHNlIGlmIChlbEJveC5yaWdodCA+IGNvbnRhaW5lckJveC5yaWdodCkgeyAvLyBvdXQgZnJvbSByaWdodFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gZWxCb3gucmlnaHQgLSAoY29udGFpbmVyQm94LnJpZ2h0IC0gdGhpcy5nZXRTY3JvbGxCYXJUaGlja25lc3MoJ3ZlcnRpY2FsJykpO1xuICAgICAgY29udGFpbmVyLnNjcm9sbChjb250YWluZXIuc2Nyb2xsTGVmdCArIG9mZnNldCwgY29udGFpbmVyLnNjcm9sbFRvcCk7XG4gICAgfVxuICB9XG5cbiAgb25Tb3VyY2VMZW5ndGhDaGFuZ2UocHJldjogbnVtYmVyLCBjdXJyOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNoZWNrVmlld3BvcnRTaXplKCk7XG4gICAgdGhpcy51cGRhdGVGaWxsZXIoKTtcbiAgfVxuXG4gIGF0dGFjaChmb3JPZjogQ2RrVmlydHVhbEZvck9mPGFueT4gJiBOZ2VWaXJ0dWFsVGFibGVSb3dJbmZvKSB7XG4gICAgc3VwZXIuYXR0YWNoKGZvck9mKTtcbiAgICBjb25zdCBzY3JvbGxTdHJhdGVneSA9IHRoaXMucGJsU2Nyb2xsU3RyYXRlZ3kgaW5zdGFuY2VvZiBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlXG4gICAgICA/IHRoaXMucGJsU2Nyb2xsU3RyYXRlZ3kuX3Njcm9sbFN0cmF0ZWd5XG4gICAgICA6IHRoaXMucGJsU2Nyb2xsU3RyYXRlZ3lcbiAgICA7XG4gICAgaWYgKHNjcm9sbFN0cmF0ZWd5IGluc3RhbmNlb2YgUGJsTmdyaWRBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSkge1xuICAgICAgc2Nyb2xsU3RyYXRlZ3kuYXZlcmFnZXIuc2V0Um93SW5mbyhmb3JPZik7XG4gICAgfVxuICB9XG5cbiAgc2V0UmVuZGVyZWRSYW5nZShyYW5nZTogTGlzdFJhbmdlKSB7XG4gICAgc3VwZXIuc2V0UmVuZGVyZWRSYW5nZShyYW5nZSk7XG4gIH1cblxuICBnZXRTY3JvbGxCYXJUaGlja25lc3MobG9jYXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcpIHtcbiAgICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMub3V0ZXJIZWlnaHQgLSB0aGlzLmlubmVySGVpZ2h0O1xuICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5vdXRlcldpZHRoIC0gdGhpcy5pbm5lcldpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlRmlsbGVyKCk6IHZvaWQge1xuICAgIHRoaXMubWVhc3VyZVJlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICBpZiAodGhpcy5ncmlkLm5vRmlsbGVyKSB7XG4gICAgICB0aGlzLnBibEZpbGxlckhlaWdodCA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYmxGaWxsZXJIZWlnaHQgPSB0aGlzLmdldFZpZXdwb3J0U2l6ZSgpID49IHRoaXMubmdlUmVuZGVyZWRDb250ZW50U2l6ZSA/XG4gICAgICAgIGBjYWxjKDEwMCUgLSAke3RoaXMubmdlUmVuZGVyZWRDb250ZW50U2l6ZX1weClgXG4gICAgICAgIDogdW5kZWZpbmVkXG4gICAgICA7XG4gICAgfVxuICB9XG5cbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgQ1NTU3R5bGVEZWNsYXJhdGlvbiB7XG4gICAgY29udGFpbjogc3RyaW5nO1xuICB9XG59XG4iLCI8cCAjaW5uZXJCb3hIZWxwZXIgY2xhc3M9XCJjZGstdmlydHVhbC1zY3JvbGwtaW5uZXItd2lkdGhcIj48L3A+XG48bmctY29udGVudCBzZWxlY3Q9XCIuY2RrLXZpcnR1YWwtc2Nyb2xsLWJlZm9yZS1jb250ZW50LXdyYXBwZXJcIj48L25nLWNvbnRlbnQ+XG48IS0tXG4gIFdyYXAgdGhlIHJlbmRlcmVkIGNvbnRlbnQgaW4gYW4gZWxlbWVudCB0aGF0IHdpbGwgYmUgdXNlZCB0byBvZmZzZXQgaXQgYmFzZWQgb24gdGhlIHNjcm9sbFxuICBwb3NpdGlvbi5cbi0tPlxuPGRpdiAjY29udGVudFdyYXBwZXIgW2NsYXNzLmNkay12aXJ0dWFsLXNjcm9sbC1jb250ZW50LXdyYXBwZXJdPVwiZW5hYmxlZFwiIHN0eWxlPVwid2lkdGg6IDEwMCVcIiBbc3R5bGUubWluV2lkdGgucHhdPVwiX21pbldpZHRoJCB8IGFzeW5jXCI+XG4gIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbjwvZGl2PlxuXG48IS0tXG4gIFNwYWNlciB1c2VkIHRvIGZvcmNlIHRoZSBzY3JvbGxpbmcgY29udGFpbmVyIHRvIHRoZSBjb3JyZWN0IHNpemUgZm9yIHRoZSAqdG90YWwqIG51bWJlciBvZiBpdGVtc1xuICBzbyB0aGF0IHRoZSBzY3JvbGxiYXIgY2FwdHVyZXMgdGhlIHNpemUgb2YgdGhlIGVudGlyZSBkYXRhIHNldC5cbi0tPlxuPGRpdiAqbmdJZj1cImVuYWJsZWRcIiBjbGFzcz1cImNkay12aXJ0dWFsLXNjcm9sbC1zcGFjZXJcIlxuICAgICBbc3R5bGUud2lkdGhdPVwiX3RvdGFsQ29udGVudFdpZHRoXCIgW3N0eWxlLmhlaWdodF09XCJfdG90YWxDb250ZW50SGVpZ2h0XCI+PC9kaXY+XG48ZGl2ICpuZ0lmPVwicGJsRmlsbGVySGVpZ2h0ICYmIGVuYWJsZWRcIlxuICAgIGNsYXNzPVwicGJsLW5ncmlkLXNwYWNlLWZpbGxcIlxuICAgIFtzdHlsZS5taW5XaWR0aC5weF09XCJfbWluV2lkdGgkIHwgYXN5bmNcIlxuICAgIFtzdHlsZS50b3AucHhdPVwibmdlUmVuZGVyZWRDb250ZW50U2l6ZVwiXG4gICAgW3N0eWxlLmhlaWdodF09XCJwYmxGaWxsZXJIZWlnaHRcIj48L2Rpdj5cbiJdfQ==