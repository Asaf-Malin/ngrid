import { of, BehaviorSubject } from 'rxjs';
import { tap, finalize, take, filter, map } from 'rxjs/operators';
import { PblInfiniteScrollDataSourceCache } from './infinite-scroll-datasource.cache';
import { normalizeOptions, shouldTriggerInvisibleScroll, tryAddVirtualRowsBlock, updateCacheAndDataSource, upgradeChangeEventToInfinite } from './utils';
import { PblInfiniteScrollDataSource } from './infinite-scroll-datasource';
import { PblInfiniteScrollDataSourceAdapter } from './infinite-scroll-datasource-adapter';
import { TriggerExecutionQueue } from './trigger-execution-queue';
import { EventState } from './event-state';
export class PblInfiniteScrollDSContext {
    constructor(factoryOptions) {
        this.factoryOptions = factoryOptions;
        this.onVirtualLoading = new BehaviorSubject(false);
        this.virtualLoadingSessions = 0;
        this.timeoutCancelTokens = new Set();
        this.ignoreScrolling = false;
        this.lastEventState = new EventState();
        this.options = normalizeOptions(factoryOptions.infiniteOptions);
        if (this.options.initialVirtualSize > 0) {
            this.totalLength = this.options.initialVirtualSize;
        }
        this.queue = new TriggerExecutionQueue(this.factoryOptions.onTrigger);
    }
    onTrigger(rawEvent) {
        if (rawEvent.isInitial) {
            return this.invokeInitialOnTrigger(rawEvent);
        }
        if (this.pendingTrigger$) {
            // LOG(`HAS pendingTrigger$`);
            const pendingTrigger$ = this.pendingTrigger$;
            this.pendingTrigger$ = undefined;
            if (rawEvent.data.changed && rawEvent.data.curr === pendingTrigger$) {
                // LOG(`PENDING - MATCHED!`);
                this.currentSessionToken = undefined;
                return pendingTrigger$
                    .pipe(finalize(() => {
                    // LOG(`PENDING - RESULT DONE`);
                    this.deferSyncRows(16, () => this.tickVirtualLoading(-1));
                }));
            }
        }
        if (this.currentSessionToken && rawEvent.data.changed && rawEvent.data.curr === this.currentSessionToken) {
            if (this.ds.hostGrid.viewport.isScrolling) {
                this.handleScrolling(rawEvent);
                return of(this.ds.source);
            }
            const { result, event } = this.invokeRuntimeOnTrigger(rawEvent);
            if (!result || !event) { // !event for type gate, because if we have "result: then "event" is always set
                // LOG('NO SCROLL - FALSE TRIGGER!');
                this.currentSessionToken = undefined;
                return false;
            }
            else {
                const { source } = this.ds;
                if (tryAddVirtualRowsBlock(source, event, this.options.blockSize)) {
                    this.pendingTrigger$ = result;
                    this.tickVirtualLoading(1);
                    // LOG('NO SCROLL - VIRTUAL ROWS ADDED');
                    return of(source)
                        .pipe(finalize(() => {
                        this.deferSyncRows();
                        // LOG('NO SCROLL - VIRTUAL ROWS RENDERED');
                        this.currentSessionToken = undefined;
                        this.ds.refresh(result);
                    }));
                }
                else {
                    // LOG('NO SCROLL - NO VIRTUAL ROWS ADDED');
                    return result
                        .pipe(finalize(() => {
                        // LOG(`NO SCROLL - RESULT DONE`);
                        this.deferSyncRows(16);
                        this.currentSessionToken = undefined;
                    }));
                }
            }
        }
        if (rawEvent.data.changed || (this.customTriggers && PblInfiniteScrollDataSourceAdapter.isCustomBehaviorEvent(rawEvent, this.customTriggers))) {
            this.cache.clear();
            rawEvent.isInitial = true;
            return this.invokeInitialOnTrigger(rawEvent);
        }
        return false;
        // throw new Error('Invalid');
    }
    getAdapter() {
        if (!this.adapter) {
            this.customTriggers = this.factoryOptions.customTriggers || false;
            // we can't allow any internal trigger handlers to run
            // It will throw the entire datasource out of sync, infinite ds can't do that
            this.adapter = new PblInfiniteScrollDataSourceAdapter(this, { filter: true, sort: true, pagination: true }, this.onVirtualLoading);
        }
        return this.adapter;
    }
    getDataSource() {
        if (!this.ds) {
            this.ds = new PblInfiniteScrollDataSource(this, this.factoryOptions.dsOptions);
            this.cache = new PblInfiniteScrollDataSourceCache(this, this.factoryOptions.cacheOptions);
            this.ds.onRenderedDataChanged.subscribe(() => this.onRenderedDataChanged());
            if (this.factoryOptions.onCreated) {
                this.factoryOptions.onCreated(this.ds);
            }
        }
        return this.ds;
    }
    dispose() {
        this.onVirtualLoading.complete();
        for (const t of this.timeoutCancelTokens.values()) {
            clearTimeout(t);
        }
    }
    /**
     * This is where we detect if we need to internally invoke a trigger because we've reached an area
     * in the grid where row's does not exists but we show the dummy row, hence we need to fetch them.
     * The grid will never trigger an event here since from the grid's perspective a row is showing...
     * This detection also handle's scrolling and session so we don't invoke the trigger to much.
     */
    onRenderedDataChanged() {
        if (this.lastEventState.skipNextRender()) {
            // if the current event returned items that did not occupy the whole range of the event
            // stop, we don't want to check anything cause we already know we are missing items.
            // since we know we're missing items, we also know we're going to call the same range again which
            // did not return anyway, so it is useless and in the worst case might cause infinite loop
            // LOG(`RENDER DATA SKIPPING DUE TO SKIP NEXT RENDER!`);
            return;
        }
        if (!this.currentSessionToken) {
            if (shouldTriggerInvisibleScroll(this)) {
                // LOG(`RENDER DATA CHANGED FROM ROW ${this.ds.renderStart}`);
                const t = this.currentSessionToken = {};
                this.safeAsyncOp(() => {
                    if (this.currentSessionToken === t) {
                        this.ds.refresh(t);
                    }
                }, 0);
            }
        }
        else {
            // LOG(`RENDER DATA WITH SESSION FROM ROW ${this.ds.renderStart}`);
            if (!this.ds.hostGrid.viewport.isScrolling) {
                // LOG(`SESSION OVERRIDE`);
                this.ds.refresh(this.currentSessionToken = {});
            }
            else {
                if (!this.ignoreScrolling) {
                    this.ignoreScrolling = true;
                    this.ds.hostGrid.viewport.scrolling
                        .pipe(filter(d => d === 0), take(1))
                        .subscribe(d => {
                        this.ignoreScrolling = false;
                        if (shouldTriggerInvisibleScroll(this)) {
                            // LOG(`OVERRIDING AFTER SCROLL SESSION`);
                            this.currentSessionToken = undefined;
                            this.onRenderedDataChanged();
                        }
                    });
                }
            }
        }
    }
    /**
     * Create a new event state for the given event, store it in the lastEventState property
     * and returns a pipe that will sync the state of the event as the call progress.
     * @param event
     */
    wrapEventState(event) {
        return (this.lastEventState = new EventState(event)).pipe();
    }
    deferSyncRows(ms = 0, runBefore, runAfter) {
        this.safeAsyncOp(() => {
            runBefore && runBefore();
            this.ds.hostGrid.rowsApi.syncRows('data', true);
            runAfter && runAfter();
        }, ms);
    }
    safeAsyncOp(fn, delay) {
        const cancelToken = setTimeout(() => {
            this.timeoutCancelTokens.delete(cancelToken);
            fn();
        }, delay);
        this.timeoutCancelTokens.add(cancelToken);
    }
    tickVirtualLoading(value) {
        this.virtualLoadingSessions = this.virtualLoadingSessions + value;
        const inVirtualLoad = this.onVirtualLoading.value;
        switch (this.virtualLoadingSessions) {
            case 0:
                inVirtualLoad && this.onVirtualLoading.next(false);
                break;
            case 1:
                !inVirtualLoad && this.onVirtualLoading.next(true);
                break;
            default:
                if (this.virtualLoadingSessions < 0) {
                    this.virtualLoadingSessions = 0;
                }
                break;
        }
    }
    handleScrolling(rawEvent) {
        this.tickVirtualLoading(1);
        const newBlock = this.cache.matchNewBlock();
        const event = newBlock ? this.tryGetInfiniteEvent(rawEvent, newBlock) : false;
        if (event !== false) {
            if (tryAddVirtualRowsBlock(this.ds.source, event, this.options.blockSize)) {
                // LOG('SCROLL - VIRTUAL ROWS ADDED');
            }
        }
        this.ds.hostGrid.viewport.scrolling
            .pipe(filter(d => d === 0), take(1))
            .subscribe(d => {
            const { result } = this.invokeRuntimeOnTrigger(rawEvent);
            if (!!result) {
                if (this.pendingTrigger$) {
                    this.tickVirtualLoading(-1);
                }
                // LOG('SCROLL DONE - HAS RESULT - HAS PENDING');
                this.ds.refresh(this.pendingTrigger$ = result);
            }
            else if (!this.pendingTrigger$) {
                // LOG('SCROLL DONE = NO RESULT - NOT HAS PENDING');
                this.ds.refresh(this.pendingTrigger$ = of(this.ds.source));
            }
            else {
                // LOG('SCROLL DONE = NO RESULT - HAS PENDING');
                this.tickVirtualLoading(-1);
            }
        });
    }
    invokeInitialOnTrigger(rawEvent) {
        const event = this.tryGetInfiniteEvent(rawEvent, rawEvent.isInitial ? this.cache.createInitialBlock() : this.cache.createInitialBlock());
        const result = this.queue.execute(event);
        return result && result.pipe(this.wrapEventState(event), tap(values => {
            this.cache.clear();
            if (values.length > 1) {
                this.cache.update(0, values.length - 1, 1);
            }
            PblInfiniteScrollDataSource.updateVirtualSize(this.options.initialVirtualSize, values);
            if (!rawEvent.isInitial) {
                this.ds.hostGrid.viewport.scrollToOffset(0);
            }
        }));
    }
    invokeRuntimeOnTrigger(rawEvent) {
        const newBlock = this.cache.matchNewBlock();
        const event = newBlock ? this.tryGetInfiniteEvent(rawEvent, newBlock) : false;
        if (event !== false) {
            if (this.lastEventState.isDone() && this.lastEventState.rangeEquals(event)) {
                return { event: false };
            }
            event.eventSource = 'infiniteScroll';
            const triggerResult = this.queue.execute(event, true);
            if (triggerResult !== false) {
                return {
                    event,
                    result: triggerResult
                        .pipe(
                    // tap( () => LOG(`TRIGGER[${event.id}]: ${event.fromRow} - ${event.toRow}`)),
                    this.wrapEventState(event), map(values => updateCacheAndDataSource(this, event, values))),
                };
            }
        }
        return { event };
    }
    tryGetInfiniteEvent(rawEvent, block) {
        const totalLength = this.totalLength || 0;
        rawEvent.updateTotalLength = (totalLength) => { this.totalLength = totalLength; };
        rawEvent.totalLength = totalLength;
        return upgradeChangeEventToInfinite(totalLength, rawEvent, block);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UuY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvaW5maW5pdGUtc2Nyb2xsL3NyYy9saWIvaW5maW5pdGUtc2Nyb2xsLWRhdGEtc291cmNlL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLmNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLEVBQUUsRUFBRSxlQUFlLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdsRSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsNEJBQTRCLEVBQUUsc0JBQXNCLEVBQUUsd0JBQXdCLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDekosT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDM0UsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQWEzQyxNQUFNLE9BQU8sMEJBQTBCO0lBa0JyQyxZQUFvQixjQUF5RDtRQUF6RCxtQkFBYyxHQUFkLGNBQWMsQ0FBMkM7UUFSckUscUJBQWdCLEdBQUcsSUFBSSxlQUFlLENBQVUsS0FBSyxDQUFDLENBQUM7UUFDdkQsMkJBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBRzNCLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDeEMsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFDakMsbUJB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RSxDQUMvRDtpQkFDSixDQUFDO2FBQ0g7U0FDRjtRQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRU8sbUJBQW1CLENBQUMsUUFBaUQsRUFBRSxLQUFpQjtRQUM5RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUMxQyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxXQUFtQixFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixRQUFpRCxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDN0UsT0FBTyw0QkFBNEIsQ0FBVyxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlFLENBQUM7Q0FFRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIG9mLCBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCwgZmluYWxpemUsIHRha2UsIGZpbHRlciwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgUGJsRGF0YVNvdXJjZVRyaWdnZXJDaGFuZ2VkRXZlbnQsIERhdGFTb3VyY2VPZiwgUGJsRGF0YVNvdXJjZUNvbmZpZ3VyYWJsZVRyaWdnZXJzIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRmFjdG9yeU9wdGlvbnMsIFBibEluZmluaXRlU2Nyb2xsRHNPcHRpb25zLCBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQgfSBmcm9tICcuL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLnR5cGVzJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUNhY2hlIH0gZnJvbSAnLi9pbmZpbml0ZS1zY3JvbGwtZGF0YXNvdXJjZS5jYWNoZSc7XG5pbXBvcnQgeyBub3JtYWxpemVPcHRpb25zLCBzaG91bGRUcmlnZ2VySW52aXNpYmxlU2Nyb2xsLCB0cnlBZGRWaXJ0dWFsUm93c0Jsb2NrLCB1cGRhdGVDYWNoZUFuZERhdGFTb3VyY2UsIHVwZ3JhZGVDaGFuZ2VFdmVudFRvSW5maW5pdGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZSB9IGZyb20gJy4vaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UnO1xuaW1wb3J0IHsgUGJsSW5maW5pdGVTY3JvbGxEYXRhU291cmNlQWRhcHRlciB9IGZyb20gJy4vaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UtYWRhcHRlcic7XG5pbXBvcnQgeyBUcmlnZ2VyRXhlY3V0aW9uUXVldWUgfSBmcm9tICcuL3RyaWdnZXItZXhlY3V0aW9uLXF1ZXVlJztcbmltcG9ydCB7IENhY2hlQmxvY2sgfSBmcm9tICcuL2NhY2hpbmcnO1xuaW1wb3J0IHsgRXZlbnRTdGF0ZSB9IGZyb20gJy4vZXZlbnQtc3RhdGUnO1xuXG4vLyBjb25zdCBMT0cgPSBtc2cgPT4gY29uc29sZS5sb2cobXNnKSA7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2NvcmUvbGliL2RhdGEtc291cmNlL2FkYXB0ZXIvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlZEV2ZW50U291cmNlIHtcbiAgIC8qKlxuICAgICogVGhlIHNvdXJjZSBvZiB0aGUgZXZlbnQgd2FzIGZyb20gYSBzY3JvbGwgdGhhdCByZWFjaGVkIGludG8gYSBncm91cCBvZiByb3dzIHRoYXQgdGhlIGdyaWQgbmVlZHMgdG8gZmV0Y2guXG4gICAgKi9cbiAgICBpbmZpbml0ZVNjcm9sbDogdHJ1ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGJsSW5maW5pdGVTY3JvbGxEU0NvbnRleHQ8VCwgVERhdGEgPSBhbnk+IHtcblxuICBvcHRpb25zOiBQYmxJbmZpbml0ZVNjcm9sbERzT3B0aW9ucztcbiAgdG90YWxMZW5ndGg6IG51bWJlcjtcbiAgY2FjaGU6IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUNhY2hlPFQsIFREYXRhPjtcblxuICBwcml2YXRlIGRzOiBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2U8VCwgVERhdGE+O1xuICBwcml2YXRlIGFkYXB0ZXI6IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUFkYXB0ZXI8VCwgVERhdGE+O1xuICBwcml2YXRlIGN1cnJlbnRTZXNzaW9uVG9rZW46IGFueTtcbiAgcHJpdmF0ZSBxdWV1ZTogVHJpZ2dlckV4ZWN1dGlvblF1ZXVlPFQsIFREYXRhPjtcbiAgcHJpdmF0ZSBvblZpcnR1YWxMb2FkaW5nID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gIHByaXZhdGUgdmlydHVhbExvYWRpbmdTZXNzaW9ucyA9IDA7XG4gIHByaXZhdGUgcGVuZGluZ1RyaWdnZXIkOiBPYnNlcnZhYmxlPFRbXT47XG4gIHByaXZhdGUgY3VzdG9tVHJpZ2dlcnM6IGZhbHNlIHwgUGFydGlhbDxSZWNvcmQ8a2V5b2YgUGJsRGF0YVNvdXJjZUNvbmZpZ3VyYWJsZVRyaWdnZXJzLCBib29sZWFuPj47XG4gIHByaXZhdGUgdGltZW91dENhbmNlbFRva2VucyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBwcml2YXRlIGlnbm9yZVNjcm9sbGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIGxhc3RFdmVudFN0YXRlID0gbmV3IEV2ZW50U3RhdGU8VD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZhY3RvcnlPcHRpb25zOiBQYmxJbmZpbml0ZVNjcm9sbEZhY3RvcnlPcHRpb25zPFQsIFREYXRhPikge1xuICAgIHRoaXMub3B0aW9ucyA9IG5vcm1hbGl6ZU9wdGlvbnMoZmFjdG9yeU9wdGlvbnMuaW5maW5pdGVPcHRpb25zKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmluaXRpYWxWaXJ0dWFsU2l6ZSA+IDApIHtcbiAgICAgIHRoaXMudG90YWxMZW5ndGggPSB0aGlzLm9wdGlvbnMuaW5pdGlhbFZpcnR1YWxTaXplO1xuICAgIH1cbiAgICB0aGlzLnF1ZXVlID0gbmV3IFRyaWdnZXJFeGVjdXRpb25RdWV1ZTxULCBURGF0YT4odGhpcy5mYWN0b3J5T3B0aW9ucy5vblRyaWdnZXIpO1xuICB9XG5cbiAgb25UcmlnZ2VyKHJhd0V2ZW50OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4pOiBmYWxzZSB8IERhdGFTb3VyY2VPZjxUPiB7XG4gICAgaWYgKHJhd0V2ZW50LmlzSW5pdGlhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52b2tlSW5pdGlhbE9uVHJpZ2dlcihyYXdFdmVudCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGVuZGluZ1RyaWdnZXIkKSB7XG4gICAgICAvLyBMT0coYEhBUyBwZW5kaW5nVHJpZ2dlciRgKTtcbiAgICAgIGNvbnN0IHBlbmRpbmdUcmlnZ2VyJCA9IHRoaXMucGVuZGluZ1RyaWdnZXIkO1xuICAgICAgdGhpcy5wZW5kaW5nVHJpZ2dlciQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAocmF3RXZlbnQuZGF0YS5jaGFuZ2VkICYmIChyYXdFdmVudC5kYXRhLmN1cnIgYXMgYW55KSA9PT0gcGVuZGluZ1RyaWdnZXIkKSB7XG4gICAgICAgIC8vIExPRyhgUEVORElORyAtIE1BVENIRUQhYCk7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25Ub2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHBlbmRpbmdUcmlnZ2VyJFxuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgZmluYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBMT0coYFBFTkRJTkcgLSBSRVNVTFQgRE9ORWApO1xuICAgICAgICAgICAgICB0aGlzLmRlZmVyU3luY1Jvd3MoMTYsICgpID0+IHRoaXMudGlja1ZpcnR1YWxMb2FkaW5nKC0xKSk7XG5cbiAgICAgICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdXJyZW50U2Vzc2lvblRva2VuICYmIHJhd0V2ZW50LmRhdGEuY2hhbmdlZCAmJiByYXdFdmVudC5kYXRhLmN1cnIgPT09IHRoaXMuY3VycmVudFNlc3Npb25Ub2tlbikge1xuICAgICAgaWYgKHRoaXMuZHMuaG9zdEdyaWQudmlld3BvcnQuaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVTY3JvbGxpbmcocmF3RXZlbnQpO1xuICAgICAgICByZXR1cm4gb2YodGhpcy5kcy5zb3VyY2UpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHJlc3VsdCwgZXZlbnQgfSA9IHRoaXMuaW52b2tlUnVudGltZU9uVHJpZ2dlcihyYXdFdmVudCk7XG4gICAgICBpZiAoIXJlc3VsdCB8fCAhZXZlbnQpIHsgLy8gIWV2ZW50IGZvciB0eXBlIGdhdGUsIGJlY2F1c2UgaWYgd2UgaGF2ZSBcInJlc3VsdDogdGhlbiBcImV2ZW50XCIgaXMgYWx3YXlzIHNldFxuICAgICAgICAvLyBMT0coJ05PIFNDUk9MTCAtIEZBTFNFIFRSSUdHRVIhJyk7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25Ub2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBzb3VyY2UgfSA9IHRoaXMuZHM7XG4gICAgICAgIGlmICh0cnlBZGRWaXJ0dWFsUm93c0Jsb2NrKHNvdXJjZSwgZXZlbnQsIHRoaXMub3B0aW9ucy5ibG9ja1NpemUpKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nVHJpZ2dlciQgPSByZXN1bHQ7XG4gICAgICAgICAgdGhpcy50aWNrVmlydHVhbExvYWRpbmcoMSk7XG4gICAgICAgICAgLy8gTE9HKCdOTyBTQ1JPTEwgLSBWSVJUVUFMIFJPV1MgQURERUQnKTtcbiAgICAgICAgICByZXR1cm4gb2Yoc291cmNlKVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIGZpbmFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyU3luY1Jvd3MoKTtcbiAgICAgICAgICAgICAgICAvLyBMT0coJ05PIFNDUk9MTCAtIFZJUlRVQUwgUk9XUyBSRU5ERVJFRCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25Ub2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmRzLnJlZnJlc2gocmVzdWx0IGFzIGFueSk7XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBMT0coJ05PIFNDUk9MTCAtIE5PIFZJUlRVQUwgUk9XUyBBRERFRCcpO1xuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTE9HKGBOTyBTQ1JPTEwgLSBSRVNVTFQgRE9ORWApO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJTeW5jUm93cygxNik7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvblRva2VuID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmF3RXZlbnQuZGF0YS5jaGFuZ2VkIHx8ICh0aGlzLmN1c3RvbVRyaWdnZXJzICYmIFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUFkYXB0ZXIuaXNDdXN0b21CZWhhdmlvckV2ZW50KHJhd0V2ZW50LCB0aGlzLmN1c3RvbVRyaWdnZXJzKSkpIHtcbiAgICAgIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgICAgIHJhd0V2ZW50LmlzSW5pdGlhbCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5pbnZva2VJbml0aWFsT25UcmlnZ2VyKHJhd0V2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkJyk7XG4gIH1cblxuICBnZXRBZGFwdGVyKCk6IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUFkYXB0ZXI8VCwgVERhdGE+IHtcbiAgICBpZiAoIXRoaXMuYWRhcHRlcikge1xuICAgICAgdGhpcy5jdXN0b21UcmlnZ2VycyA9IHRoaXMuZmFjdG9yeU9wdGlvbnMuY3VzdG9tVHJpZ2dlcnMgfHwgZmFsc2U7XG4gICAgICAvLyB3ZSBjYW4ndCBhbGxvdyBhbnkgaW50ZXJuYWwgdHJpZ2dlciBoYW5kbGVycyB0byBydW5cbiAgICAgIC8vIEl0IHdpbGwgdGhyb3cgdGhlIGVudGlyZSBkYXRhc291cmNlIG91dCBvZiBzeW5jLCBpbmZpbml0ZSBkcyBjYW4ndCBkbyB0aGF0XG4gICAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgUGJsSW5maW5pdGVTY3JvbGxEYXRhU291cmNlQWRhcHRlcjxULCBURGF0YT4odGhpcywgeyBmaWx0ZXI6IHRydWUsIHNvcnQ6IHRydWUsIHBhZ2luYXRpb246IHRydWUgfSwgdGhpcy5vblZpcnR1YWxMb2FkaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlcjtcbiAgfVxuXG4gIGdldERhdGFTb3VyY2UoKTogUGJsSW5maW5pdGVTY3JvbGxEYXRhU291cmNlPFQsIFREYXRhPiB7XG4gICAgaWYgKCF0aGlzLmRzKSB7XG4gICAgICB0aGlzLmRzID0gbmV3IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZTxULCBURGF0YT4odGhpcywgdGhpcy5mYWN0b3J5T3B0aW9ucy5kc09wdGlvbnMpXG4gICAgICB0aGlzLmNhY2hlID0gbmV3IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUNhY2hlPFQsIFREYXRhPih0aGlzLCB0aGlzLmZhY3RvcnlPcHRpb25zLmNhY2hlT3B0aW9ucyk7XG4gICAgICB0aGlzLmRzLm9uUmVuZGVyZWREYXRhQ2hhbmdlZC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5vblJlbmRlcmVkRGF0YUNoYW5nZWQoKSApO1xuICAgICAgaWYgKHRoaXMuZmFjdG9yeU9wdGlvbnMub25DcmVhdGVkKSB7XG4gICAgICAgIHRoaXMuZmFjdG9yeU9wdGlvbnMub25DcmVhdGVkKHRoaXMuZHMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kcztcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5vblZpcnR1YWxMb2FkaW5nLmNvbXBsZXRlKCk7XG4gICAgZm9yIChjb25zdCB0IG9mIHRoaXMudGltZW91dENhbmNlbFRva2Vucy52YWx1ZXMoKSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHdoZXJlIHdlIGRldGVjdCBpZiB3ZSBuZWVkIHRvIGludGVybmFsbHkgaW52b2tlIGEgdHJpZ2dlciBiZWNhdXNlIHdlJ3ZlIHJlYWNoZWQgYW4gYXJlYVxuICAgKiBpbiB0aGUgZ3JpZCB3aGVyZSByb3cncyBkb2VzIG5vdCBleGlzdHMgYnV0IHdlIHNob3cgdGhlIGR1bW15IHJvdywgaGVuY2Ugd2UgbmVlZCB0byBmZXRjaCB0aGVtLlxuICAgKiBUaGUgZ3JpZCB3aWxsIG5ldmVyIHRyaWdnZXIgYW4gZXZlbnQgaGVyZSBzaW5jZSBmcm9tIHRoZSBncmlkJ3MgcGVyc3BlY3RpdmUgYSByb3cgaXMgc2hvd2luZy4uLlxuICAgKiBUaGlzIGRldGVjdGlvbiBhbHNvIGhhbmRsZSdzIHNjcm9sbGluZyBhbmQgc2Vzc2lvbiBzbyB3ZSBkb24ndCBpbnZva2UgdGhlIHRyaWdnZXIgdG8gbXVjaC5cbiAgICovXG4gIHByaXZhdGUgb25SZW5kZXJlZERhdGFDaGFuZ2VkKCkge1xuICAgIGlmICh0aGlzLmxhc3RFdmVudFN0YXRlLnNraXBOZXh0UmVuZGVyKCkpIHtcbiAgICAgIC8vIGlmIHRoZSBjdXJyZW50IGV2ZW50IHJldHVybmVkIGl0ZW1zIHRoYXQgZGlkIG5vdCBvY2N1cHkgdGhlIHdob2xlIHJhbmdlIG9mIHRoZSBldmVudFxuICAgICAgLy8gc3RvcCwgd2UgZG9uJ3Qgd2FudCB0byBjaGVjayBhbnl0aGluZyBjYXVzZSB3ZSBhbHJlYWR5IGtub3cgd2UgYXJlIG1pc3NpbmcgaXRlbXMuXG4gICAgICAvLyBzaW5jZSB3ZSBrbm93IHdlJ3JlIG1pc3NpbmcgaXRlbXMsIHdlIGFsc28ga25vdyB3ZSdyZSBnb2luZyB0byBjYWxsIHRoZSBzYW1lIHJhbmdlIGFnYWluIHdoaWNoXG4gICAgICAvLyBkaWQgbm90IHJldHVybiBhbnl3YXksIHNvIGl0IGlzIHVzZWxlc3MgYW5kIGluIHRoZSB3b3JzdCBjYXNlIG1pZ2h0IGNhdXNlIGluZmluaXRlIGxvb3BcbiAgICAgIC8vIExPRyhgUkVOREVSIERBVEEgU0tJUFBJTkcgRFVFIFRPIFNLSVAgTkVYVCBSRU5ERVIhYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvblRva2VuKSB7XG4gICAgICBpZiAoc2hvdWxkVHJpZ2dlckludmlzaWJsZVNjcm9sbCh0aGlzKSkge1xuICAgICAgICAvLyBMT0coYFJFTkRFUiBEQVRBIENIQU5HRUQgRlJPTSBST1cgJHt0aGlzLmRzLnJlbmRlclN0YXJ0fWApO1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5jdXJyZW50U2Vzc2lvblRva2VuID0ge307XG4gICAgICAgIHRoaXMuc2FmZUFzeW5jT3AoKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTZXNzaW9uVG9rZW4gPT09IHQpIHtcbiAgICAgICAgICAgIHRoaXMuZHMucmVmcmVzaCh0IGFzIGFueSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTE9HKGBSRU5ERVIgREFUQSBXSVRIIFNFU1NJT04gRlJPTSBST1cgJHt0aGlzLmRzLnJlbmRlclN0YXJ0fWApO1xuICAgICAgaWYgKCF0aGlzLmRzLmhvc3RHcmlkLnZpZXdwb3J0LmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgIC8vIExPRyhgU0VTU0lPTiBPVkVSUklERWApO1xuICAgICAgICB0aGlzLmRzLnJlZnJlc2godGhpcy5jdXJyZW50U2Vzc2lvblRva2VuID0ge30gYXMgYW55KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5pZ25vcmVTY3JvbGxpbmcpIHtcbiAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5kcy5ob3N0R3JpZC52aWV3cG9ydC5zY3JvbGxpbmdcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICBmaWx0ZXIoIGQgPT4gZCA9PT0gMCksXG4gICAgICAgICAgICAgIHRha2UoMSksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuc3Vic2NyaWJlKGQgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAoc2hvdWxkVHJpZ2dlckludmlzaWJsZVNjcm9sbCh0aGlzKSkge1xuICAgICAgICAgICAgICAgIC8vIExPRyhgT1ZFUlJJRElORyBBRlRFUiBTQ1JPTEwgU0VTU0lPTmApO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25Ub2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVuZGVyZWREYXRhQ2hhbmdlZCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgZXZlbnQgc3RhdGUgZm9yIHRoZSBnaXZlbiBldmVudCwgc3RvcmUgaXQgaW4gdGhlIGxhc3RFdmVudFN0YXRlIHByb3BlcnR5XG4gICAqIGFuZCByZXR1cm5zIGEgcGlwZSB0aGF0IHdpbGwgc3luYyB0aGUgc3RhdGUgb2YgdGhlIGV2ZW50IGFzIHRoZSBjYWxsIHByb2dyZXNzLlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIHByaXZhdGUgd3JhcEV2ZW50U3RhdGUoZXZlbnQ6IFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4pIHtcbiAgICByZXR1cm4gKHRoaXMubGFzdEV2ZW50U3RhdGUgPSBuZXcgRXZlbnRTdGF0ZTxUPihldmVudCkpLnBpcGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVmZXJTeW5jUm93cyhtcyA9IDAsIHJ1bkJlZm9yZT86ICgpID0+IHZvaWQsIHJ1bkFmdGVyPzogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMuc2FmZUFzeW5jT3AoKCkgPT4ge1xuICAgICAgcnVuQmVmb3JlICYmIHJ1bkJlZm9yZSgpO1xuICAgICAgdGhpcy5kcy5ob3N0R3JpZC5yb3dzQXBpLnN5bmNSb3dzKCdkYXRhJywgdHJ1ZSk7XG4gICAgICBydW5BZnRlciAmJiBydW5BZnRlcigpO1xuICAgIH0sIG1zKTtcbiAgfVxuXG4gIHByaXZhdGUgc2FmZUFzeW5jT3AoZm46ICgpID0+IHZvaWQsIGRlbGF5OiBudW1iZXIpIHtcbiAgICBjb25zdCBjYW5jZWxUb2tlbiA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy50aW1lb3V0Q2FuY2VsVG9rZW5zLmRlbGV0ZShjYW5jZWxUb2tlbik7XG4gICAgICBmbigpO1xuICAgIH0sIGRlbGF5KSBhcyB1bmtub3duIGFzIG51bWJlcjtcbiAgICB0aGlzLnRpbWVvdXRDYW5jZWxUb2tlbnMuYWRkKGNhbmNlbFRva2VuKTtcbiAgfVxuXG4gIHByaXZhdGUgdGlja1ZpcnR1YWxMb2FkaW5nKHZhbHVlOiAtMSB8IDEpIHtcbiAgICB0aGlzLnZpcnR1YWxMb2FkaW5nU2Vzc2lvbnMgPSB0aGlzLnZpcnR1YWxMb2FkaW5nU2Vzc2lvbnMgKyB2YWx1ZTtcbiAgICBjb25zdCBpblZpcnR1YWxMb2FkID0gdGhpcy5vblZpcnR1YWxMb2FkaW5nLnZhbHVlO1xuICAgIHN3aXRjaCAodGhpcy52aXJ0dWFsTG9hZGluZ1Nlc3Npb25zKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGluVmlydHVhbExvYWQgJiYgdGhpcy5vblZpcnR1YWxMb2FkaW5nLm5leHQoZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgIWluVmlydHVhbExvYWQgJiYgdGhpcy5vblZpcnR1YWxMb2FkaW5nLm5leHQodHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHRoaXMudmlydHVhbExvYWRpbmdTZXNzaW9ucyA8IDApIHtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxMb2FkaW5nU2Vzc2lvbnMgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlU2Nyb2xsaW5nKHJhd0V2ZW50OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4pIHtcbiAgICB0aGlzLnRpY2tWaXJ0dWFsTG9hZGluZygxKTtcbiAgICBjb25zdCBuZXdCbG9jayA9IHRoaXMuY2FjaGUubWF0Y2hOZXdCbG9jaygpO1xuICAgIGNvbnN0IGV2ZW50ID0gbmV3QmxvY2sgPyB0aGlzLnRyeUdldEluZmluaXRlRXZlbnQocmF3RXZlbnQsIG5ld0Jsb2NrKSA6IGZhbHNlIGFzIGNvbnN0O1xuICAgIGlmIChldmVudCAhPT0gZmFsc2UpIHtcbiAgICAgIGlmICh0cnlBZGRWaXJ0dWFsUm93c0Jsb2NrKHRoaXMuZHMuc291cmNlLCBldmVudCwgdGhpcy5vcHRpb25zLmJsb2NrU2l6ZSkpIHtcbiAgICAgICAgLy8gTE9HKCdTQ1JPTEwgLSBWSVJUVUFMIFJPV1MgQURERUQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRzLmhvc3RHcmlkLnZpZXdwb3J0LnNjcm9sbGluZ1xuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlciggZCA9PiBkID09PSAwKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoZCA9PiB7XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0IH0gPSB0aGlzLmludm9rZVJ1bnRpbWVPblRyaWdnZXIocmF3RXZlbnQpO1xuICAgICAgICBpZiAoISFyZXN1bHQpIHtcbiAgICAgICAgICBpZiAodGhpcy5wZW5kaW5nVHJpZ2dlciQpIHtcbiAgICAgICAgICAgIHRoaXMudGlja1ZpcnR1YWxMb2FkaW5nKC0xKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTE9HKCdTQ1JPTEwgRE9ORSAtIEhBUyBSRVNVTFQgLSBIQVMgUEVORElORycpO1xuICAgICAgICAgIHRoaXMuZHMucmVmcmVzaCh0aGlzLnBlbmRpbmdUcmlnZ2VyJCA9IHJlc3VsdCBhcyBhbnkpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlbmRpbmdUcmlnZ2VyJCkge1xuICAgICAgICAgIC8vIExPRygnU0NST0xMIERPTkUgPSBOTyBSRVNVTFQgLSBOT1QgSEFTIFBFTkRJTkcnKTtcbiAgICAgICAgICB0aGlzLmRzLnJlZnJlc2godGhpcy5wZW5kaW5nVHJpZ2dlciQgPSBvZih0aGlzLmRzLnNvdXJjZSkgYXMgYW55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBMT0coJ1NDUk9MTCBET05FID0gTk8gUkVTVUxUIC0gSEFTIFBFTkRJTkcnKTtcbiAgICAgICAgICB0aGlzLnRpY2tWaXJ0dWFsTG9hZGluZygtMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZva2VJbml0aWFsT25UcmlnZ2VyKHJhd0V2ZW50OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4pOiBmYWxzZSB8IERhdGFTb3VyY2VPZjxUPiB7XG4gICAgY29uc3QgZXZlbnQgPSB0aGlzLnRyeUdldEluZmluaXRlRXZlbnQocmF3RXZlbnQsIHJhd0V2ZW50LmlzSW5pdGlhbCA/IHRoaXMuY2FjaGUuY3JlYXRlSW5pdGlhbEJsb2NrKCkgOiB0aGlzLmNhY2hlLmNyZWF0ZUluaXRpYWxCbG9jaygpKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnF1ZXVlLmV4ZWN1dGUoZXZlbnQpO1xuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0LnBpcGUoXG4gICAgICB0aGlzLndyYXBFdmVudFN0YXRlKGV2ZW50KSxcbiAgICAgIHRhcCggdmFsdWVzID0+IHtcbiAgICAgICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICAgICAgICBpZih2YWx1ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRoaXMuY2FjaGUudXBkYXRlKDAsIHZhbHVlcy5sZW5ndGggLSAxLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZS51cGRhdGVWaXJ0dWFsU2l6ZSh0aGlzLm9wdGlvbnMuaW5pdGlhbFZpcnR1YWxTaXplLCB2YWx1ZXMpO1xuICAgICAgICBpZiAoIXJhd0V2ZW50LmlzSW5pdGlhbCkge1xuICAgICAgICAgIHRoaXMuZHMuaG9zdEdyaWQudmlld3BvcnQuc2Nyb2xsVG9PZmZzZXQoMCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGludm9rZVJ1bnRpbWVPblRyaWdnZXIocmF3RXZlbnQ6IFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlZEV2ZW50PFREYXRhPik6IHsgcmVzdWx0PzogT2JzZXJ2YWJsZTxUW10+OyBldmVudDogZmFsc2UgfCBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQ8VERhdGE+IH0ge1xuICAgIGNvbnN0IG5ld0Jsb2NrID0gdGhpcy5jYWNoZS5tYXRjaE5ld0Jsb2NrKCk7XG4gICAgY29uc3QgZXZlbnQgPSBuZXdCbG9jayA/IHRoaXMudHJ5R2V0SW5maW5pdGVFdmVudChyYXdFdmVudCwgbmV3QmxvY2spIDogZmFsc2UgYXMgY29uc3Q7XG5cbiAgICBpZihldmVudCAhPT0gZmFsc2UpIHtcbiAgICAgIGlmICh0aGlzLmxhc3RFdmVudFN0YXRlLmlzRG9uZSgpICYmIHRoaXMubGFzdEV2ZW50U3RhdGUucmFuZ2VFcXVhbHMoZXZlbnQpKSB7XG4gICAgICAgIHJldHVybiB7IGV2ZW50OiBmYWxzZSB9O1xuICAgICAgfVxuICAgICAgZXZlbnQuZXZlbnRTb3VyY2UgPSAnaW5maW5pdGVTY3JvbGwnO1xuICAgICAgY29uc3QgdHJpZ2dlclJlc3VsdCA9IHRoaXMucXVldWUuZXhlY3V0ZShldmVudCwgdHJ1ZSk7XG4gICAgICBpZiAodHJpZ2dlclJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICByZXN1bHQ6IHRyaWdnZXJSZXN1bHRcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAvLyB0YXAoICgpID0+IExPRyhgVFJJR0dFUlske2V2ZW50LmlkfV06ICR7ZXZlbnQuZnJvbVJvd30gLSAke2V2ZW50LnRvUm93fWApKSxcbiAgICAgICAgICAgICAgdGhpcy53cmFwRXZlbnRTdGF0ZShldmVudCksXG4gICAgICAgICAgICAgIG1hcCggdmFsdWVzID0+IHVwZGF0ZUNhY2hlQW5kRGF0YVNvdXJjZSh0aGlzLCBldmVudCwgdmFsdWVzKSApLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBldmVudCB9O1xuICB9XG5cbiAgcHJpdmF0ZSB0cnlHZXRJbmZpbml0ZUV2ZW50KHJhd0V2ZW50OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4sIGJsb2NrOiBDYWNoZUJsb2NrKSB7XG4gICAgY29uc3QgdG90YWxMZW5ndGggPSB0aGlzLnRvdGFsTGVuZ3RoIHx8IDA7XG4gICAgcmF3RXZlbnQudXBkYXRlVG90YWxMZW5ndGggPSAodG90YWxMZW5ndGg6IG51bWJlcikgPT4geyB0aGlzLnRvdGFsTGVuZ3RoID0gdG90YWxMZW5ndGg7IH07XG4gICAgKHJhd0V2ZW50IGFzIFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudCkudG90YWxMZW5ndGggPSB0b3RhbExlbmd0aDtcbiAgICByZXR1cm4gdXBncmFkZUNoYW5nZUV2ZW50VG9JbmZpbml0ZTxULCBURGF0YT4odG90YWxMZW5ndGgsIHJhd0V2ZW50LCBibG9jayk7XG4gIH1cblxufVxuIl19