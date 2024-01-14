import { BehaviorSubject, Subject, of, asapScheduler } from 'rxjs';
import { mapTo, skip, observeOn, tap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { unrx } from '../utils/unrx';
import { PblPagingPaginator, PblTokenPaginator } from './triggers/pagination';
import { createFilter } from './triggers/filter';
const PROCESSING_SUBSCRIPTION_GROUP = {};
export class PblDataSource extends DataSource {
    constructor(adapter, options) {
        super();
        this._selection = new SelectionModel(true, []);
        this._tableConnectionChange$ = new Subject();
        this._onRenderDataChanging = new Subject();
        this._renderData$ = new BehaviorSubject([]);
        this._filter$ = new BehaviorSubject(undefined);
        this._sort$ = new BehaviorSubject({ column: null, sort: null, skipUpdate: false });
        this._onError$ = new Subject();
        options = options || {};
        this.adapter = adapter;
        this.onSourceChanging = this._adapter.onSourceChanging;
        // emit source changed event every time adapter gets new data
        this.onSourceChanged = this.adapter.onSourceChanged
            .pipe(observeOn(asapScheduler, 0), // emit on the end of the current turn (micro-task) to ensure `onSourceChanged` emission in `_updateProcessingLogic` run's first.
        mapTo(undefined));
        this.onRenderDataChanging = this._onRenderDataChanging.asObservable();
        this.onRenderedDataChanged = this._renderData$.pipe(skip(1), mapTo(undefined));
        this.onError = this._onError$.asObservable();
        this.tableConnectionChange = this._tableConnectionChange$.asObservable();
        this.keepAlive = options.keepAlive || false;
        this.skipInitial = options.skipInitial || false;
        this.sortChange = this._sort$.asObservable();
    }
    get pagination() { return this._pagination; }
    set pagination(value) {
        if (this._pagination !== value) {
            this._pagination = value;
            switch (value) {
                case 'pageNumber':
                    this._paginator = new PblPagingPaginator();
                    break;
                case 'token':
                    this._paginator = new PblTokenPaginator();
                    break;
                default:
                    this._paginator = undefined;
                    break;
            }
            if (this._adapter) {
                this._adapter.setPaginator(this._paginator);
            }
        }
    }
    get adapter() { return this._adapter; }
    ;
    set adapter(value) {
        if (this._adapter !== value) {
            this._adapter = value;
            if (this.pagination) {
                this._adapter.setPaginator(this._paginator);
            }
        }
    }
    /** Returns the starting index of the rendered data */
    get renderStart() { return this._lastRange ? this._lastRange.start : 0; }
    get renderLength() { return this._renderData$.value.length; }
    get renderedData() { return this._renderData$.value || []; }
    /**
     * The `source` with sorting applied.
     * Valid only when sorting is performed client-side.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The sorted data is updated just before `onRenderDataChanging` fire.
     */
    get sortedData() { return (this._lastAdapterEvent && this._lastAdapterEvent.sorted) || []; }
    ;
    /**
     * The `source` with filtering applied.
     * Valid only when filtering is performed client-side.
     * If sorting is applied as well, the filtered results are also sorted.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The filtered data is updated just before `onRenderDataChanging` fire.
     */
    get filteredData() { return (this._lastAdapterEvent && this._lastAdapterEvent.filtered) || []; }
    ;
    get filter() { return this._filter$.value; }
    get sort() { return this._sort$.value; }
    get paginator() { return this._paginator; }
    get length() { return this.source.length; }
    get source() { return this._source || []; }
    /** Represents selected items on the data source. */
    get selection() { return this._selection; }
    /**
     * A custom trigger that invokes a manual data source change with the provided data value in the `data` property at tht event.
     */
    refresh(data) {
        if (this._tableConnected) {
            this._adapter.refresh(data);
        }
        else {
            this._lastRefresh = data;
        }
    }
    setFilter(value, columns) {
        if (value && typeof value !== 'function' && (!columns || columns.length === 0)) {
            throw new Error('Invalid filter definitions, columns are mandatory when using a single value input.');
        }
        this._filter$.next(createFilter(value, columns || []));
    }
    /**
     * Refresh the filters result.
     *
     * Note that this should only be used when using a predicate function filter and not the simple value filter.
     * In general the filter is refreshed every time it is set and each time the data is updated so manually refreshing a value filter
     * has no impact.
     *
     * For custom predicate function filters this might be useful.
     *
     */
    syncFilter() {
        const currentFilter = this._adapter.clearCache('filter');
        if (currentFilter) {
            this.setFilter(currentFilter.filter, currentFilter.columns);
        }
    }
    setSort(column, sort, skipUpdate = false) {
        if (!column || typeof column === 'boolean') {
            this._sort$.next({ column: null, sort: {}, skipUpdate: !!column });
        }
        else {
            this._sort$.next({ column, sort, skipUpdate });
        }
    }
    dispose() {
        if (!this._disposed) {
            unrx.kill(this);
            this._adapter.dispose();
            this._onRenderDataChanging.complete();
            this._renderData$.complete();
            this._filter$.complete();
            this._sort$.complete();
            this._onError$.complete();
            this._disposed = true;
        }
    }
    disconnect(cv) {
        this._lastRefresh = undefined;
        this._tableConnectionChange$.next(this._tableConnected = false);
        if (this.keepAlive === false) {
            this.dispose();
        }
    }
    connect(cv) {
        if (this._disposed) {
            throw new Error('PblDataSource is disposed. Use `keepAlive` if you move datasource between tables.');
        }
        this._tableConnected = true;
        this._updateProcessingLogic(cv);
        this._tableConnectionChange$.next(this._tableConnected);
        return this._renderData$;
    }
    /**
     * Move's an item (in the entire source) from one index to the other, pushing the item in the destination one item backwards.
     *
     * Note that if the rendered data is a subset of the entire source (i.e virtual scroll & range) the indices are considered
     * local to the rendered view and are translated to fit the entire source.
     *
     * Tp disable this behavior, set the `absolute` parameter to `true`
     */
    moveItem(fromIndex, toIndex, absolute = false) {
        if (absolute !== true && this._lastRange) {
            fromIndex = this._lastRange.start + fromIndex;
            toIndex = this._lastRange.start + toIndex;
        }
        if (this.length > 0) {
            this._eventEmitter.emitEvent({ source: 'ds', kind: 'onBeforeMoveItem', fromIndex, toIndex });
            moveItemInArray(this._source, fromIndex, toIndex);
            const data = this._lastRange
                ? this._source.slice(this._lastRange.start, this._lastRange.end)
                : this._source;
            this._renderData$.next(data);
        }
    }
    _attachEmitter(emitter) {
        this._eventEmitter = emitter;
    }
    _detachEmitter() {
        this._eventEmitter = undefined;
    }
    _updateProcessingLogic(cv) {
        const initialState = { filter: this.filter, sort: this.sort };
        const paginator = this._paginator;
        if (paginator) {
            initialState.pagination = { page: paginator.page, perPage: paginator.perPage };
        }
        const stream = this._adapter.updateProcessingLogic(this._filter$, this._sort$, paginator ? paginator.onChange : of(undefined), initialState);
        unrx.kill(this, PROCESSING_SUBSCRIPTION_GROUP);
        const trimToRange = (range, data) => data.slice(range.start, range.end + 1);
        /* We use this flag to skip handling `viewChange` events
           This is on when a call to get data from the adapter (stream) is initiated and set off once the data arrives.
           In this period, we don't want to update the view, instead, we save the last view range and when the data arrive we trim it to fit the view. */
        let skipViewChange;
        let lastEmittedSource;
        // We listen to view changes (scroll updates, practical only in virtual scroll) and trim the data displayed based on what
        // the view change instructs us.
        cv.viewChange
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP))
            .subscribe(range => {
            if (this._lastRange?.start === range.start && this._lastRange?.end === range.end) {
                return;
            }
            this._lastRange = range;
            if (!skipViewChange) {
                if (range && lastEmittedSource?.length) {
                    this._renderData$.next(trimToRange(this._lastRange, lastEmittedSource));
                }
            }
        });
        // We listen to incoming data update triggers when the data is about to change
        stream
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP), tap(result => {
            lastEmittedSource = result.data;
            skipViewChange = true;
            this._onRenderDataChanging.next(this._lastAdapterEvent = result);
        }))
            .subscribe(({ data }) => {
            if (this._lastRange && data?.length) {
                data = trimToRange(this._lastRange, data);
            }
            this._renderData$.next(data);
            skipViewChange = false;
        }, error => { this._onError$.next(error); });
        this._adapter.onSourceChanged
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP))
            .subscribe(source => this._source = source || []);
        if (this._lastRefresh !== undefined) {
            this._adapter.refresh(this._lastRefresh);
            this._lastRefresh = undefined;
        }
        else if (!this.skipInitial) {
            // _refresh$ is a Subject, we must emit once so combineLatest will work
            this.refresh();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2NvcmUvc3JjL2xpYi9kYXRhLXNvdXJjZS9kYXRhLXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9FLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3RCxPQUFPLEVBQUUsY0FBYyxFQUErQixNQUFNLDBCQUEwQixDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFekQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUdyQyxPQUFPLEVBQXVDLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDbEgsT0FBTyxFQUFnRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUk5RyxNQUFNLDZCQUE2QixHQUFHLEVBQUUsQ0FBQztBQWdCekMsTUFBTSxPQUFPLGFBRzBILFNBQVEsVUFBYTtJQWdKMUosWUFBWSxPQUEyQixFQUFFLE9BQThCO1FBQ3JFLEtBQUssRUFBRSxDQUFDO1FBckJTLGVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsNEJBQXVCLEdBQUcsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUNqRCwwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBaUUsQ0FBQztRQUNyRyxpQkFBWSxHQUFHLElBQUksZUFBZSxDQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLGFBQVEsR0FBc0MsSUFBSSxlQUFl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QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO2FBQy9DLFNBQVMsQ0FBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBRSxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDNUIsdUVBQXVFO1lBQ3ZFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCwgb2YsIGFzYXBTY2hlZHVsZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcFRvLCBza2lwLCBvYnNlcnZlT24sIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgU2VsZWN0aW9uTW9kZWwsIENvbGxlY3Rpb25WaWV3ZXIsIExpc3RSYW5nZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7IG1vdmVJdGVtSW5BcnJheSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnLi4vdXRpbHMvdW5yeCc7XG5pbXBvcnQgeyBQYmxOZ3JpZEV2ZW50RW1pdHRlciB9IGZyb20gJy4uL2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IHsgUGJsQ29sdW1uRGVmaW5pdGlvbiB9IGZyb20gJy4uL21vZGVscy9jb2x1bW4nO1xuaW1wb3J0IHsgUGJsTmdyaWRQYWdpbmF0b3JLaW5kLCBQYmxQYWdpbmF0b3IsIFBibFBhZ2luZ1BhZ2luYXRvciwgUGJsVG9rZW5QYWdpbmF0b3IgfSBmcm9tICcuL3RyaWdnZXJzL3BhZ2luYXRpb24nXG5pbXBvcnQgeyBEYXRhU291cmNlUHJlZGljYXRlLCBEYXRhU291cmNlRmlsdGVyLCBEYXRhU291cmNlRmlsdGVyVG9rZW4sIGNyZWF0ZUZpbHRlciB9IGZyb20gJy4vdHJpZ2dlcnMvZmlsdGVyJ1xuaW1wb3J0IHsgUGJsTmdyaWRTb3J0RGVmaW5pdGlvbiwgUGJsTmdyaWREYXRhU291cmNlU29ydENoYW5nZSB9IGZyb20gJy4vdHJpZ2dlcnMvc29ydCdcbmltcG9ydCB7IFBibERhdGFTb3VyY2VBZGFwdGVyLCBQYmxEYXRhU291cmNlVHJpZ2dlckNhY2hlLCBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudCwgUGJsRGF0YVNvdXJjZUFkYXB0ZXJQcm9jZXNzZWRSZXN1bHQgfSBmcm9tICcuL2FkYXB0ZXInO1xuXG5jb25zdCBQUk9DRVNTSU5HX1NVQlNDUklQVElPTl9HUk9VUCA9IHt9O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBibERhdGFTb3VyY2VPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZW4gc2V0IHRvIFRydWUgd2lsbCBub3QgZGlzY29ubmVjdCB1cG9uIHRhYmxlIGRpc2Nvbm5lY3Rpb24sIG90aGVyd2lzZSBkb2VzLlxuICAgKi9cbiAga2VlcEFsaXZlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFNraXAgdGhlIGZpcnN0IHRyaWdnZXIgZW1pc3Npb24uXG4gICAqIFVzZSB0aGlzIGZvciBsYXRlIGJpbmRpbmcsIHVzdWFsbHkgd2l0aCBhIGNhbGwgdG8gcmVmcmVzaCgpIG9uIHRoZSBkYXRhIHNvdXJjZS5cbiAgICpcbiAgICogTm90ZSB0aGF0IG9ubHkgdGhlIGludGVybmFsIHRyaWdnZXIgY2FsbCBpcyBza2lwcGVkLCBhIGN1c3RvbSBjYWxscyB0byByZWZyZXNoIHdpbGwgZ28gdGhyb3VnaFxuICAgKi9cbiAgc2tpcEluaXRpYWw/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgUGJsRGF0YVNvdXJjZTxUID0gYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgVERhdGEgPSBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBURXZlbnQgZXh0ZW5kcyBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4gPSBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBURGF0YVNvdXJjZUFkYXB0ZXIgZXh0ZW5kcyBQYmxEYXRhU291cmNlQWRhcHRlcjxULCBURGF0YSwgVEV2ZW50PiA9IFBibERhdGFTb3VyY2VBZGFwdGVyPFQsIFREYXRhLCBURXZlbnQ+PiBleHRlbmRzIERhdGFTb3VyY2U8VD4ge1xuXG4gIGdldCBwYWdpbmF0aW9uKCk6IFBibE5ncmlkUGFnaW5hdG9yS2luZCB8IGZhbHNlIHsgcmV0dXJuIHRoaXMuX3BhZ2luYXRpb247IH1cbiAgc2V0IHBhZ2luYXRpb24odmFsdWU6IFBibE5ncmlkUGFnaW5hdG9yS2luZCB8IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMuX3BhZ2luYXRpb24gIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl9wYWdpbmF0aW9uID0gdmFsdWU7XG4gICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ3BhZ2VOdW1iZXInOlxuICAgICAgICAgIHRoaXMuX3BhZ2luYXRvciA9IG5ldyBQYmxQYWdpbmdQYWdpbmF0b3IoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG9rZW4nOlxuICAgICAgICAgIHRoaXMuX3BhZ2luYXRvciA9IG5ldyBQYmxUb2tlblBhZ2luYXRvcigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuX3BhZ2luYXRvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9hZGFwdGVyKSB7XG4gICAgICAgIHRoaXMuX2FkYXB0ZXIuc2V0UGFnaW5hdG9yKHRoaXMuX3BhZ2luYXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0IGV2ZW50cyB3aGVuIGFuIG5ldyBpbmNvbWluZyBzb3VyY2UgaXMgZXhwZWN0ZWQsIGJlZm9yZSBjYWxsaW5nIHRoZSB0cmlnZ2VyIGhhbmRsZXIgdG8gZ2V0IHRoZSBuZXcgc291cmNlLlxuICAgKiBUaGlzIGV2ZW4gaXMgdXN1YWxseSBmb2xsb3dlZCBieSB0aGUgYG9uU291cmNlQ2hhbmdlZGAgZXZlbnQgYnV0IG5vdCBhbHdheXMuIFRoaXMgaXMgYmVjYXVzZSB0aGUgdHJpZ2dlciBoYW5kbGVyXG4gICAqIGNhbiBjYW5jZWwgdGhlIG9wZXJhdGlvbiAod2hlbiBpdCByZXR1cm5zIGZhbHNlKSB3aGljaCBtZWFucyBhbiBgb25Tb3VyY2VDaGFuZ2VkYCBldmVudCB3aWxsIG5vdCBmaXJlLlxuICAgKlxuICAgKiBFbWlzc2lvbnMgb2NjdXIgd2hlbiB0aGUgdHJpZ2dlciBoYW5kbGVyIGlzIGludm9rZWQgYW5kIGFsc28gd2hlbiB0aGUgdHJpZ2dlciBoYW5kbGVyIHJldHVybmVkIGFuIG9ic2VydmFibGUgYW5kIHRoZSBvYnNlcnZhYmxlIGVtaXRzLlxuICAgKlxuICAgKiA+IE5vdGUgdGhhdCBhIG1pY3JvLXRhc2sgZGVsYXlzIGlzIGFwcGxpZWQgYmV0d2VlbiB0aGUgYG9uU291cmNlQ2hhbmdpbmdgIHN1YnNlcXVlbnQgYG9uU291cmNlQ2hhbmdlZGAgZXZlbnQgKHdoZW4gZW1pdHRlZCkuXG4gICAqL1xuICByZWFkb25seSBvblNvdXJjZUNoYW5naW5nOiBPYnNlcnZhYmxlPHZvaWQ+O1xuICAvKipcbiAgICogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXQgZXZlbnRzIHdoZW4gYSBuZXcgc291cmNlIGhhcyBiZWVuIHJlY2VpdmVkIGZyb20gdGhlIHRyaWdnZXIgaGFuZGxlciBidXQgYmVmb3JlIGFueSBwcm9jZXNzaW5nIGlzIGFwcGxpZWQuXG4gICAqIEVtaXNzaW9ucyBvY2N1ciB3aGVuIHRoZSB0cmlnZ2VyIGhhbmRsZXIgaXMgaW52b2tlZCBhbmQgYWxzbyB3aGVuIHRoZSB0cmlnZ2VyIGhhbmRsZXIgcmV0dXJuZWQgYW4gb2JzZXJ2YWJsZSBhbmQgdGhlIG9ic2VydmFibGUgZW1pdHMuXG4gICAqXG4gICAqIEV4YW1wbGVzOiBDYWxsaW5nIGByZWZyZXNoKClgLCBmaWx0ZXIgLyBzb3J0IC8gcGFnaW5hdGlvbiBldmVudHMuXG4gICAqXG4gICAqID4gTm90ZSB0aGF0IHRoZSBgb25Tb3VyY2VDaGFuZ2VkYCBmaXJlZCBiZWZvcmUgdGhlIGRhdGEgaXMgcmVuZGVyZWQgYW5lIGJlZm9yZSBhbnkgY2xpZW50LXNpZGUgZmlsdGVyL3NvcnQvcGFnaW5hdGlvbiBhcmUgYXBwbGllZC5cbiAgICogSXQgb25seSBpbmRpY2F0ZXMgdGhhdCB0aGUgc291cmNlIGRhdGEtc2V0IGlzIG5vdyB1cGRhdGVkIGFuZCB0aGUgZ3JpZCBpcyBhYm91dCB0byBhcHBseSBsb2dpYyBvbiB0aGUgZGF0YS1zZXQgYW5kIHRoZW4gcmVuZGVyIGl0LlxuICAgKi9cbiAgcmVhZG9ubHkgb25Tb3VyY2VDaGFuZ2VkOiBPYnNlcnZhYmxlPHZvaWQ+O1xuICAvKipcbiAgICogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXQgZXZlbnRzIHdoZW4gbmV3IHNvdXJjZSBoYXMgYmVlbiByZWNlaXZlZCBmcm9tIHRoZSB0cmlnZ2VyIGhhbmRsZXIgYW5kIGFmdGVyIGl0IHdhcyBwcm9jZXNzZWQuXG4gICAqIEVtaXNzaW9ucyB3aWxsIG9jY3VyIGFmdGVyIGBvblNvdXJjZUNoYW5nZWRgIGV2ZW50IGhhcyBiZWVuIGZpcmVkLlxuICAgKlxuICAgKiBUaGUgbWFpbiBkaWZmZXJlbmNlIGJldHdlZW4gYG9uU291cmNlQ2hhbmdlZGAgYW5kIGBvblJlbmRlckRhdGFDaGFuZ2luZ2AgaXMgbG9jYWwgcHJvY2Vzc2luZyBwZXJmb3JtZWQgaW4gdGhlIGRhdGFzb3VyY2UuXG4gICAqIFRoZXNlIGFyZSB1c3VhbGx5IGNsaWVudC1zaWRlIG9wZXJhdGlvbnMgbGlrZSBmaWx0ZXIvc29ydC9wYWdpbmF0aW9uLiBJZiBhbGwgb2YgdGhlc2UgZXZlbnRzIGFyZSBoYW5kbGVkIG1hbnVhbGx5IChjdXN0b20pXG4gICAqIGluIHRoZSB0cmlnZ2VyIGhhbmRsZXIgdGhlbiBgb25Tb3VyY2VDaGFuZ2VkYCBhbmQgYG9uUmVuZGVyRGF0YUNoYW5naW5nYCBoYXZlIG5vIGRpZmZlcmVuY2UuXG4gICAqXG4gICAqID4gTm90ZSB0aGF0IGBvblJlbmRlckRhdGFDaGFuZ2luZ2AgYW5kIGBvblJlbmRlcmVkRGF0YUNoYW5nZWRgIGFyZSBub3QgY2xvc2VseSByZWxhdGVkIGFzIGBvblJlbmRlcmVkRGF0YUNoYW5nZWRgIGZpcmVzIGF0XG4gICAqIGEgbXVjaCBtb3JlIHJhcGlkIHBhY2UgKHZpcnR1YWwgc2Nyb2xsKS4gVGhlIG5hbWUgYG9uUmVuZGVyRGF0YUNoYW5naW5nYCBtaWdodCBjaGFuZ2UgaW4gdGhlIGZ1dHVyZS5cbiAgICovXG4gIHJlYWRvbmx5IG9uUmVuZGVyRGF0YUNoYW5naW5nOiBPYnNlcnZhYmxlPHsgZXZlbnQ6IFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlZEV2ZW50PFREYXRhPiwgZGF0YTogVFtdIH0+O1xuICAvKipcbiAgICogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXQgZXZlbnRzIHdoZW4gdGhlIGdyaWQgaXMgYWJvdXQgdG8gcmVuZGVyIGRhdGEuXG4gICAqIFRoZSByZW5kZXJlZCBkYXRhIGlzIHVwZGF0ZWQgd2hlbiB0aGUgc291cmNlIGNoYW5nZWQgb3Igd2hlbiB0aGUgZ3JpZCBpcyBpbiB2aXJ0dWFsIHNjcm9sbCBtb2RlIGFuZCB0aGUgdXNlciBpcyBzY3JvbGxpbmcuXG4gICAqXG4gICAqIEVhY2ggZW1pc3Npb24gcmVmbGVjdHMgYSBjaGFuZ2UgaW4gdGhlIGRhdGEgdGhhdCB0aGUgZ3JpZCBpcyByZW5kZXJpbmcuXG4gICAqL1xuICByZWFkb25seSBvblJlbmRlcmVkRGF0YUNoYW5nZWQ6IE9ic2VydmFibGU8dm9pZD47XG4gIHJlYWRvbmx5IG9uRXJyb3I6IE9ic2VydmFibGU8RXJyb3I+O1xuICAvKipcbiAgICogQW4gZXZlbnQgdGhhdCBmaXJlcyB3aGVuIHRoZSBjb25uZWN0aW9uIHN0YXRlIHRvIGEgdGFibGUgaGFzIGNoYW5nZWQuXG4gICAqL1xuICByZWFkb25seSB0YWJsZUNvbm5lY3Rpb25DaGFuZ2U6IE9ic2VydmFibGU8Ym9vbGVhbj47XG4gIHJlYWRvbmx5IHNvcnRDaGFuZ2U6IE9ic2VydmFibGU8UGJsTmdyaWREYXRhU291cmNlU29ydENoYW5nZT47XG5cbiAgLyoqXG4gICAqIFdoZW4gc2V0IHRvIFRydWUgd2lsbCBub3QgZGlzY29ubmVjdCB1cG9uIHRhYmxlIGRpc2Nvbm5lY3Rpb24sIG90aGVyd2lzZSB1bnN1YnNjcmliZSBmcm9tIHRoZVxuICAgKiBkYXRhc291cmNlIHdoZW4gdGhlIHRhYmxlIGRpc2Nvbm5lY3RzLlxuICAgKi9cbiAgcmVhZG9ubHkga2VlcEFsaXZlOiBib29sZWFuO1xuICAvKipcbiAgICogU2tpcCB0aGUgZmlyc3QgdHJpZ2dlciBlbWlzc2lvbi5cbiAgICogVXNlIHRoaXMgZm9yIGxhdGUgYmluZGluZywgdXN1YWxseSB3aXRoIGEgY2FsbCB0byByZWZyZXNoKCkgb24gdGhlIGRhdGEgc291cmNlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgb25seSB0aGUgaW50ZXJuYWwgdHJpZ2dlciBjYWxsIGlzIHNraXBwZWQsIGEgY3VzdG9tIGNhbGxzIHRvIHJlZnJlc2ggd2lsbCBnbyB0aHJvdWdoXG4gICAqL1xuICByZWFkb25seSBza2lwSW5pdGlhbDogYm9vbGVhbjtcblxuICBnZXQgYWRhcHRlcigpOiBURGF0YVNvdXJjZUFkYXB0ZXIgeyByZXR1cm4gdGhpcy5fYWRhcHRlcjsgfTtcbiAgc2V0IGFkYXB0ZXIodmFsdWU6IFREYXRhU291cmNlQWRhcHRlcikge1xuICAgIGlmICh0aGlzLl9hZGFwdGVyICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fYWRhcHRlciA9IHZhbHVlO1xuICAgICAgaWYgKHRoaXMucGFnaW5hdGlvbikge1xuICAgICAgICB0aGlzLl9hZGFwdGVyLnNldFBhZ2luYXRvcih0aGlzLl9wYWdpbmF0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBzdGFydGluZyBpbmRleCBvZiB0aGUgcmVuZGVyZWQgZGF0YSAqL1xuICBnZXQgcmVuZGVyU3RhcnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2xhc3RSYW5nZSA/IHRoaXMuX2xhc3RSYW5nZS5zdGFydCA6IDA7IH1cbiAgZ2V0IHJlbmRlckxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcmVuZGVyRGF0YSQudmFsdWUubGVuZ3RoOyB9XG4gIGdldCByZW5kZXJlZERhdGEoKTogVFtdIHsgcmV0dXJuIHRoaXMuX3JlbmRlckRhdGEkLnZhbHVlIHx8IFtdOyB9XG4gIC8qKlxuICAgKiBUaGUgYHNvdXJjZWAgd2l0aCBzb3J0aW5nIGFwcGxpZWQuXG4gICAqIFZhbGlkIG9ubHkgd2hlbiBzb3J0aW5nIGlzIHBlcmZvcm1lZCBjbGllbnQtc2lkZS5cbiAgICpcbiAgICogVG8gZ2V0IHJlYWwtdGltZSBub3RpZmljYXRpb25zIHVzZSBgb25SZW5kZXJEYXRhQ2hhbmdpbmdgLlxuICAgKiBUaGUgc29ydGVkIGRhdGEgaXMgdXBkYXRlZCBqdXN0IGJlZm9yZSBgb25SZW5kZXJEYXRhQ2hhbmdpbmdgIGZpcmUuXG4gICAqL1xuICBnZXQgc29ydGVkRGF0YSgpOiBUW10geyByZXR1cm4gKHRoaXMuX2xhc3RBZGFwdGVyRXZlbnQgJiYgdGhpcy5fbGFzdEFkYXB0ZXJFdmVudC5zb3J0ZWQpIHx8IFtdOyB9O1xuICAvKipcbiAgICogVGhlIGBzb3VyY2VgIHdpdGggZmlsdGVyaW5nIGFwcGxpZWQuXG4gICAqIFZhbGlkIG9ubHkgd2hlbiBmaWx0ZXJpbmcgaXMgcGVyZm9ybWVkIGNsaWVudC1zaWRlLlxuICAgKiBJZiBzb3J0aW5nIGlzIGFwcGxpZWQgYXMgd2VsbCwgdGhlIGZpbHRlcmVkIHJlc3VsdHMgYXJlIGFsc28gc29ydGVkLlxuICAgKlxuICAgKiBUbyBnZXQgcmVhbC10aW1lIG5vdGlmaWNhdGlvbnMgdXNlIGBvblJlbmRlckRhdGFDaGFuZ2luZ2AuXG4gICAqIFRoZSBmaWx0ZXJlZCBkYXRhIGlzIHVwZGF0ZWQganVzdCBiZWZvcmUgYG9uUmVuZGVyRGF0YUNoYW5naW5nYCBmaXJlLlxuICAgKi9cbiAgZ2V0IGZpbHRlcmVkRGF0YSgpOiBUW10geyByZXR1cm4gKHRoaXMuX2xhc3RBZGFwdGVyRXZlbnQgJiYgdGhpcy5fbGFzdEFkYXB0ZXJFdmVudC5maWx0ZXJlZCkgfHwgW107IH07XG5cbiAgZ2V0IGZpbHRlcigpOiBEYXRhU291cmNlRmlsdGVyIHsgcmV0dXJuIHRoaXMuX2ZpbHRlciQudmFsdWU7IH1cbiAgZ2V0IHNvcnQoKTogUGJsTmdyaWREYXRhU291cmNlU29ydENoYW5nZSB7IHJldHVybiB0aGlzLl9zb3J0JC52YWx1ZTsgfVxuICBnZXQgcGFnaW5hdG9yKCk6IFBibFBhZ2luYXRvcjxhbnk+IHsgcmV0dXJuIHRoaXMuX3BhZ2luYXRvcjsgfVxuXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuc291cmNlLmxlbmd0aDsgfVxuICBnZXQgc291cmNlKCk6IFRbXSB7IHJldHVybiB0aGlzLl9zb3VyY2UgfHwgW107IH1cblxuICAvKiogUmVwcmVzZW50cyBzZWxlY3RlZCBpdGVtcyBvbiB0aGUgZGF0YSBzb3VyY2UuICovXG4gIGdldCBzZWxlY3Rpb24oKTogU2VsZWN0aW9uTW9kZWw8VD4geyByZXR1cm4gdGhpcy5fc2VsZWN0aW9uOyB9XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9zZWxlY3Rpb24gPSBuZXcgU2VsZWN0aW9uTW9kZWw8VD4odHJ1ZSwgW10pO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3RhYmxlQ29ubmVjdGlvbkNoYW5nZSQgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX29uUmVuZGVyRGF0YUNoYW5naW5nID0gbmV3IFN1YmplY3Q8eyBldmVudDogUGJsRGF0YVNvdXJjZVRyaWdnZXJDaGFuZ2VkRXZlbnQ8VERhdGE+LCBkYXRhOiBUW10gfT4oKTtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9yZW5kZXJEYXRhJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VFtdPihbXSk7XG4gIHByb3RlY3RlZCByZWFkb25seSBfZmlsdGVyJDogQmVoYXZpb3JTdWJqZWN0PERhdGFTb3VyY2VGaWx0ZXI+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxEYXRhU291cmNlRmlsdGVyPih1bmRlZmluZWQpO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3NvcnQkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxQYmxOZ3JpZERhdGFTb3VyY2VTb3J0Q2hhbmdlICYgeyBza2lwVXBkYXRlOiBib29sZWFuIH0+KHsgY29sdW1uOiBudWxsLCBzb3J0OiBudWxsLCBza2lwVXBkYXRlOiBmYWxzZSB9KTtcbiAgcHJvdGVjdGVkIF9vbkVycm9yJCA9IG5ldyBTdWJqZWN0PEVycm9yPigpO1xuXG4gIHByb3RlY3RlZCBfcGFnaW5hdG9yOiBQYmxQYWdpbmF0b3I8YW55PjtcblxuICBwcml2YXRlIF9wYWdpbmF0aW9uOiBQYmxOZ3JpZFBhZ2luYXRvcktpbmQgfCBmYWxzZTtcbiAgcHJpdmF0ZSBfYWRhcHRlcjogVERhdGFTb3VyY2VBZGFwdGVyO1xuICBwcml2YXRlIF9zb3VyY2U6IFRbXTtcbiAgcHJpdmF0ZSBfZGlzcG9zZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgX3RhYmxlQ29ubmVjdGVkOiBib29sZWFuO1xuICBwcml2YXRlIF9sYXN0UmVmcmVzaDogVERhdGE7XG4gIHByaXZhdGUgX2xhc3RSYW5nZTogTGlzdFJhbmdlO1xuICBwcml2YXRlIF9sYXN0QWRhcHRlckV2ZW50OiBQYmxEYXRhU291cmNlQWRhcHRlclByb2Nlc3NlZFJlc3VsdDxULCBURGF0YT47XG4gIHByaXZhdGUgX2V2ZW50RW1pdHRlcjogUGJsTmdyaWRFdmVudEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IoYWRhcHRlcjogVERhdGFTb3VyY2VBZGFwdGVyLCBvcHRpb25zPzogUGJsRGF0YVNvdXJjZU9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5hZGFwdGVyID0gYWRhcHRlcjtcblxuICAgIHRoaXMub25Tb3VyY2VDaGFuZ2luZyA9IHRoaXMuX2FkYXB0ZXIub25Tb3VyY2VDaGFuZ2luZztcbiAgICAvLyBlbWl0IHNvdXJjZSBjaGFuZ2VkIGV2ZW50IGV2ZXJ5IHRpbWUgYWRhcHRlciBnZXRzIG5ldyBkYXRhXG4gICAgdGhpcy5vblNvdXJjZUNoYW5nZWQgPSB0aGlzLmFkYXB0ZXIub25Tb3VyY2VDaGFuZ2VkXG4gICAgLnBpcGUoXG4gICAgICBvYnNlcnZlT24oYXNhcFNjaGVkdWxlciwgMCksIC8vIGVtaXQgb24gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB0dXJuIChtaWNyby10YXNrKSB0byBlbnN1cmUgYG9uU291cmNlQ2hhbmdlZGAgZW1pc3Npb24gaW4gYF91cGRhdGVQcm9jZXNzaW5nTG9naWNgIHJ1bidzIGZpcnN0LlxuICAgICAgbWFwVG8odW5kZWZpbmVkKVxuICAgICk7XG4gICAgdGhpcy5vblJlbmRlckRhdGFDaGFuZ2luZyA9IHRoaXMuX29uUmVuZGVyRGF0YUNoYW5naW5nLmFzT2JzZXJ2YWJsZSgpO1xuICAgIHRoaXMub25SZW5kZXJlZERhdGFDaGFuZ2VkID0gdGhpcy5fcmVuZGVyRGF0YSQucGlwZShza2lwKDEpLCBtYXBUbyh1bmRlZmluZWQpKTtcbiAgICB0aGlzLm9uRXJyb3IgPSB0aGlzLl9vbkVycm9yJC5hc09ic2VydmFibGUoKTtcbiAgICB0aGlzLnRhYmxlQ29ubmVjdGlvbkNoYW5nZSA9IHRoaXMuX3RhYmxlQ29ubmVjdGlvbkNoYW5nZSQuYXNPYnNlcnZhYmxlKCk7XG5cbiAgICB0aGlzLmtlZXBBbGl2ZSA9IG9wdGlvbnMua2VlcEFsaXZlIHx8IGZhbHNlO1xuICAgIHRoaXMuc2tpcEluaXRpYWwgPSBvcHRpb25zLnNraXBJbml0aWFsIHx8IGZhbHNlO1xuICAgIHRoaXMuc29ydENoYW5nZSA9IHRoaXMuX3NvcnQkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY3VzdG9tIHRyaWdnZXIgdGhhdCBpbnZva2VzIGEgbWFudWFsIGRhdGEgc291cmNlIGNoYW5nZSB3aXRoIHRoZSBwcm92aWRlZCBkYXRhIHZhbHVlIGluIHRoZSBgZGF0YWAgcHJvcGVydHkgYXQgdGh0IGV2ZW50LlxuICAgKi9cbiAgcmVmcmVzaChkYXRhPzogVERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdGFibGVDb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuX2FkYXB0ZXIucmVmcmVzaChkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbGFzdFJlZnJlc2ggPSBkYXRhO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgZmlsdGVyIGRlZmluaXRpb24gZm9yIHRoZSBjdXJyZW50IGRhdGEgc2V0LlxuICAgKi9cbiAgc2V0RmlsdGVyKCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBTZXQgdGhlIGZpbHRlciBkZWZpbml0aW9uIGZvciB0aGUgY3VycmVudCBkYXRhIHNldCB1c2luZyBhIGZ1bmN0aW9uIHByZWRpY2F0ZS5cbiAgICpcbiAgICogPiBOb3RlIHRoYXQgd2hlbiB1c2luZyBhIGN1c3RvbSBwcmVkaWNhdGUgZnVuY3Rpb24gYWxsIGxvZ2ljIGlzIHBhc3NlZCB0byB0aGUgcHJlZGljYXRlIGFuZCB0aGUgZGF0YXNvdXJjZSAvIGdyaWQgZG9lcyBub3QgaGFuZGxlIHRoZSBmaWx0ZXJpbmcgcHJvY2Vzcy5cbiAgICogVGhpcyBtZWFucyB0aGF0IGFueSBjb2x1bW4gc3BlY2lmaWMgZmlsdGVyLCBzZXQgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBpcyBpZ25vcmVkLCBpZiB5b3Ugd2FudCB0byB0YWtlIHRoZXNlIGZpbHRlcnMgaW50byBjb25zaWRlcmF0aW9uXG4gICAqIHVzZSB0aGUgY29sdW1uIGluc3RhbmNlIHByb3ZpZGVkIHRvIGlkZW50aWZ5IGFuZCB1c2UgdGhlc2UgZmlsdGVycyAodGhlIGBmaWx0ZXJgIHByb3BlcnR5IGluIGBQYmxDb2x1bW5gKS5cbiAgICovXG4gIHNldEZpbHRlcih2YWx1ZTogRGF0YVNvdXJjZVByZWRpY2F0ZSwgY29sdW1ucz86IFBibENvbHVtbkRlZmluaXRpb25bXSk6IHZvaWQ7XG4gIC8qKlxuICAgKiBTZXQgdGhlIGZpbHRlciBkZWZpbml0aW9uIGZvciB0aGUgY3VycmVudCBkYXRhIHNldCB1c2luZyBhIHZhbHVlIHRvIGNvbXBhcmUgd2l0aCBhbmQgYSBsaXN0IG9mIGNvbHVtbnMgd2l0aCB0aGUgdmFsdWVzIHRvIGNvbXBhcmUgdG8uXG4gICAqXG4gICAqIFdoZW4gYSBjb2x1bW4gaW5zdGFuY2UgaGFzIGEgc3BlY2lmaWMgcHJlZGljYXRlIHNldCAoYFBibENvbHVtbi5maWx0ZXJgKSB0aGVuIGl0IHdpbGwgYmUgdXNlZCwgb3RoZXJ3aXNlXG4gICAqIHRoZSBgZ2VuZXJpY0NvbHVtblByZWRpY2F0ZWAgd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgc2V0RmlsdGVyKHZhbHVlOiBhbnksIGNvbHVtbnM6IFBibENvbHVtbkRlZmluaXRpb25bXSk6IHZvaWQ7XG4gIHNldEZpbHRlcih2YWx1ZT86IERhdGFTb3VyY2VGaWx0ZXJUb2tlbiwgY29sdW1ucz86IFBibENvbHVtbkRlZmluaXRpb25bXSk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgKCFjb2x1bW5zIHx8IGNvbHVtbnMubGVuZ3RoID09PSAwKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZpbHRlciBkZWZpbml0aW9ucywgY29sdW1ucyBhcmUgbWFuZGF0b3J5IHdoZW4gdXNpbmcgYSBzaW5nbGUgdmFsdWUgaW5wdXQuJyk7XG4gICAgfVxuICAgIHRoaXMuX2ZpbHRlciQubmV4dChjcmVhdGVGaWx0ZXIodmFsdWUsIGNvbHVtbnMgfHwgW10pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZyZXNoIHRoZSBmaWx0ZXJzIHJlc3VsdC5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aGVuIHVzaW5nIGEgcHJlZGljYXRlIGZ1bmN0aW9uIGZpbHRlciBhbmQgbm90IHRoZSBzaW1wbGUgdmFsdWUgZmlsdGVyLlxuICAgKiBJbiBnZW5lcmFsIHRoZSBmaWx0ZXIgaXMgcmVmcmVzaGVkIGV2ZXJ5IHRpbWUgaXQgaXMgc2V0IGFuZCBlYWNoIHRpbWUgdGhlIGRhdGEgaXMgdXBkYXRlZCBzbyBtYW51YWxseSByZWZyZXNoaW5nIGEgdmFsdWUgZmlsdGVyXG4gICAqIGhhcyBubyBpbXBhY3QuXG4gICAqXG4gICAqIEZvciBjdXN0b20gcHJlZGljYXRlIGZ1bmN0aW9uIGZpbHRlcnMgdGhpcyBtaWdodCBiZSB1c2VmdWwuXG4gICAqXG4gICAqL1xuICBzeW5jRmlsdGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRGaWx0ZXIgPSB0aGlzLl9hZGFwdGVyLmNsZWFyQ2FjaGUoJ2ZpbHRlcicpO1xuICAgIGlmIChjdXJyZW50RmlsdGVyKSB7XG4gICAgICB0aGlzLnNldEZpbHRlcihjdXJyZW50RmlsdGVyLmZpbHRlciwgY3VycmVudEZpbHRlci5jb2x1bW5zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIGN1cnJlbnQgc29ydCBkZWZpbml0aW9ucy5cbiAgICogQHBhcmFtIHNraXBVcGRhdGUgV2hlbiB0cnVlIHdpbGwgbm90IHVwZGF0ZSB0aGUgZGF0YXNvdXJjZSwgdXNlIHRoaXMgd2hlbiB0aGUgZGF0YSBjb21lcyBzb3J0ZWQgYW5kIHlvdSB3YW50IHRvIHN5bmMgdGhlIGRlZmluaXRpb25zIHdpdGggdGhlIGN1cnJlbnQgZGF0YSBzZXQuXG4gICAqIGRlZmF1bHQgdG8gZmFsc2UuXG4gICAqL1xuICBzZXRTb3J0KHNraXBVcGRhdGU/OiBib29sZWFuKTogdm9pZDtcbiAgLyoqXG4gICAqIFNldCB0aGUgc29ydGluZyBkZWZpbml0aW9uIGZvciB0aGUgY3VycmVudCBkYXRhIHNldC5cbiAgICogQHBhcmFtIGNvbHVtblxuICAgKiBAcGFyYW0gc29ydFxuICAgKiBAcGFyYW0gc2tpcFVwZGF0ZSBXaGVuIHRydWUgd2lsbCBub3QgdXBkYXRlIHRoZSBkYXRhc291cmNlLCB1c2UgdGhpcyB3aGVuIHRoZSBkYXRhIGNvbWVzIHNvcnRlZCBhbmQgeW91IHdhbnQgdG8gc3luYyB0aGUgZGVmaW5pdGlvbnMgd2l0aCB0aGUgY3VycmVudCBkYXRhIHNldC5cbiAgICogZGVmYXVsdCB0byBmYWxzZS5cbiAgICovXG4gIHNldFNvcnQoY29sdW1uOiBQYmxDb2x1bW5EZWZpbml0aW9uLCBzb3J0OiBQYmxOZ3JpZFNvcnREZWZpbml0aW9uLCBza2lwVXBkYXRlPzogYm9vbGVhbik6IHZvaWQ7XG4gIHNldFNvcnQoY29sdW1uPzogUGJsQ29sdW1uRGVmaW5pdGlvbiB8IGJvb2xlYW4sIHNvcnQ/OiBQYmxOZ3JpZFNvcnREZWZpbml0aW9uLCBza2lwVXBkYXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICBpZiAoIWNvbHVtbiB8fCB0eXBlb2YgY29sdW1uID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHRoaXMuX3NvcnQkLm5leHQoeyBjb2x1bW46IG51bGwsIHNvcnQ6IHt9LCBza2lwVXBkYXRlOiAhIWNvbHVtbiB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc29ydCQubmV4dCh7IGNvbHVtbiwgc29ydCwgc2tpcFVwZGF0ZSB9KTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgIHVucngua2lsbCh0aGlzKTtcbiAgICAgIHRoaXMuX2FkYXB0ZXIuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb25SZW5kZXJEYXRhQ2hhbmdpbmcuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuX3JlbmRlckRhdGEkLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLl9maWx0ZXIkLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLl9zb3J0JC5jb21wbGV0ZSgpO1xuICAgICAgdGhpcy5fb25FcnJvciQuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0KGN2OiBDb2xsZWN0aW9uVmlld2VyKTogdm9pZCB7XG4gICAgdGhpcy5fbGFzdFJlZnJlc2ggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fdGFibGVDb25uZWN0aW9uQ2hhbmdlJC5uZXh0KHRoaXMuX3RhYmxlQ29ubmVjdGVkID0gZmFsc2UpO1xuICAgIGlmICh0aGlzLmtlZXBBbGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3QoY3Y6IENvbGxlY3Rpb25WaWV3ZXIpOiBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIGlmICh0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYmxEYXRhU291cmNlIGlzIGRpc3Bvc2VkLiBVc2UgYGtlZXBBbGl2ZWAgaWYgeW91IG1vdmUgZGF0YXNvdXJjZSBiZXR3ZWVuIHRhYmxlcy4nKTtcbiAgICB9XG4gICAgdGhpcy5fdGFibGVDb25uZWN0ZWQgPSB0cnVlXG4gICAgdGhpcy5fdXBkYXRlUHJvY2Vzc2luZ0xvZ2ljKGN2KTtcbiAgICB0aGlzLl90YWJsZUNvbm5lY3Rpb25DaGFuZ2UkLm5leHQodGhpcy5fdGFibGVDb25uZWN0ZWQpO1xuICAgIHJldHVybiB0aGlzLl9yZW5kZXJEYXRhJDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlJ3MgYW4gaXRlbSAoaW4gdGhlIGVudGlyZSBzb3VyY2UpIGZyb20gb25lIGluZGV4IHRvIHRoZSBvdGhlciwgcHVzaGluZyB0aGUgaXRlbSBpbiB0aGUgZGVzdGluYXRpb24gb25lIGl0ZW0gYmFja3dhcmRzLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgaWYgdGhlIHJlbmRlcmVkIGRhdGEgaXMgYSBzdWJzZXQgb2YgdGhlIGVudGlyZSBzb3VyY2UgKGkuZSB2aXJ0dWFsIHNjcm9sbCAmIHJhbmdlKSB0aGUgaW5kaWNlcyBhcmUgY29uc2lkZXJlZFxuICAgKiBsb2NhbCB0byB0aGUgcmVuZGVyZWQgdmlldyBhbmQgYXJlIHRyYW5zbGF0ZWQgdG8gZml0IHRoZSBlbnRpcmUgc291cmNlLlxuICAgKlxuICAgKiBUcCBkaXNhYmxlIHRoaXMgYmVoYXZpb3IsIHNldCB0aGUgYGFic29sdXRlYCBwYXJhbWV0ZXIgdG8gYHRydWVgXG4gICAqL1xuICBtb3ZlSXRlbShmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyLCBhYnNvbHV0ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKGFic29sdXRlICE9PSB0cnVlICYmIHRoaXMuX2xhc3RSYW5nZSkge1xuICAgICAgZnJvbUluZGV4ID0gdGhpcy5fbGFzdFJhbmdlLnN0YXJ0ICsgZnJvbUluZGV4O1xuICAgICAgdG9JbmRleCA9IHRoaXMuX2xhc3RSYW5nZS5zdGFydCArIHRvSW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXRFdmVudCh7IHNvdXJjZTogJ2RzJywga2luZDogJ29uQmVmb3JlTW92ZUl0ZW0nLCBmcm9tSW5kZXgsIHRvSW5kZXggfSk7XG4gICAgICBtb3ZlSXRlbUluQXJyYXkodGhpcy5fc291cmNlLCBmcm9tSW5kZXgsIHRvSW5kZXgpXG4gICAgICBjb25zdCBkYXRhID0gdGhpcy5fbGFzdFJhbmdlXG4gICAgICAgID8gdGhpcy5fc291cmNlLnNsaWNlKHRoaXMuX2xhc3RSYW5nZS5zdGFydCwgdGhpcy5fbGFzdFJhbmdlLmVuZClcbiAgICAgICAgOiB0aGlzLl9zb3VyY2VcbiAgICAgIDtcbiAgICAgIHRoaXMuX3JlbmRlckRhdGEkLm5leHQoZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgX2F0dGFjaEVtaXR0ZXIoZW1pdHRlcjogUGJsTmdyaWRFdmVudEVtaXR0ZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBlbWl0dGVyO1xuICB9XG5cbiAgX2RldGFjaEVtaXR0ZXIoKTogdm9pZCB7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlUHJvY2Vzc2luZ0xvZ2ljKGN2OiBDb2xsZWN0aW9uVmlld2VyKTogdm9pZCB7XG4gICAgY29uc3QgaW5pdGlhbFN0YXRlOiBQYXJ0aWFsPFBibERhdGFTb3VyY2VUcmlnZ2VyQ2FjaGU8VERhdGE+PiA9IHsgZmlsdGVyOiB0aGlzLmZpbHRlciwgIHNvcnQ6IHRoaXMuc29ydCB9O1xuICAgIGNvbnN0IHBhZ2luYXRvciA9IHRoaXMuX3BhZ2luYXRvcjtcbiAgICBpZiAocGFnaW5hdG9yKSB7XG4gICAgICBpbml0aWFsU3RhdGUucGFnaW5hdGlvbiA9IHsgcGFnZTogcGFnaW5hdG9yLnBhZ2UsIHBlclBhZ2U6IHBhZ2luYXRvci5wZXJQYWdlIH07XG4gICAgfVxuICAgIGNvbnN0IHN0cmVhbSA9IHRoaXMuX2FkYXB0ZXIudXBkYXRlUHJvY2Vzc2luZ0xvZ2ljKFxuICAgICAgdGhpcy5fZmlsdGVyJCxcbiAgICAgIHRoaXMuX3NvcnQkLFxuICAgICAgcGFnaW5hdG9yID8gcGFnaW5hdG9yLm9uQ2hhbmdlIDogb2YodW5kZWZpbmVkKSxcbiAgICAgIGluaXRpYWxTdGF0ZSxcbiAgICApO1xuXG4gICAgdW5yeC5raWxsKHRoaXMsIFBST0NFU1NJTkdfU1VCU0NSSVBUSU9OX0dST1VQKVxuXG4gICAgY29uc3QgdHJpbVRvUmFuZ2UgPSAocmFuZ2U6IExpc3RSYW5nZSwgZGF0YTogYW55W10pID0+IGRhdGEuc2xpY2UocmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZCArIDEpIDtcblxuICAgIC8qIFdlIHVzZSB0aGlzIGZsYWcgdG8gc2tpcCBoYW5kbGluZyBgdmlld0NoYW5nZWAgZXZlbnRzXG4gICAgICAgVGhpcyBpcyBvbiB3aGVuIGEgY2FsbCB0byBnZXQgZGF0YSBmcm9tIHRoZSBhZGFwdGVyIChzdHJlYW0pIGlzIGluaXRpYXRlZCBhbmQgc2V0IG9mZiBvbmNlIHRoZSBkYXRhIGFycml2ZXMuXG4gICAgICAgSW4gdGhpcyBwZXJpb2QsIHdlIGRvbid0IHdhbnQgdG8gdXBkYXRlIHRoZSB2aWV3LCBpbnN0ZWFkLCB3ZSBzYXZlIHRoZSBsYXN0IHZpZXcgcmFuZ2UgYW5kIHdoZW4gdGhlIGRhdGEgYXJyaXZlIHdlIHRyaW0gaXQgdG8gZml0IHRoZSB2aWV3LiAqL1xuICAgIGxldCBza2lwVmlld0NoYW5nZTogYm9vbGVhbjtcbiAgICBsZXQgbGFzdEVtaXR0ZWRTb3VyY2U6IFRbXTtcblxuICAgIC8vIFdlIGxpc3RlbiB0byB2aWV3IGNoYW5nZXMgKHNjcm9sbCB1cGRhdGVzLCBwcmFjdGljYWwgb25seSBpbiB2aXJ0dWFsIHNjcm9sbCkgYW5kIHRyaW0gdGhlIGRhdGEgZGlzcGxheWVkIGJhc2VkIG9uIHdoYXRcbiAgICAvLyB0aGUgdmlldyBjaGFuZ2UgaW5zdHJ1Y3RzIHVzLlxuICAgIGN2LnZpZXdDaGFuZ2VcbiAgICAgIC5waXBlKHVucngodGhpcywgUFJPQ0VTU0lOR19TVUJTQ1JJUFRJT05fR1JPVVApKVxuICAgICAgLnN1YnNjcmliZSggcmFuZ2UgPT4ge1xuICAgICAgICBpZiAodGhpcy5fbGFzdFJhbmdlPy5zdGFydCA9PT0gcmFuZ2Uuc3RhcnQgJiYgdGhpcy5fbGFzdFJhbmdlPy5lbmQgPT09IHJhbmdlLmVuZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgaWYgKCFza2lwVmlld0NoYW5nZSkge1xuICAgICAgICAgIGlmIChyYW5nZSAmJiBsYXN0RW1pdHRlZFNvdXJjZT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJEYXRhJC5uZXh0KHRyaW1Ub1JhbmdlKHRoaXMuX2xhc3RSYW5nZSwgbGFzdEVtaXR0ZWRTb3VyY2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gV2UgbGlzdGVuIHRvIGluY29taW5nIGRhdGEgdXBkYXRlIHRyaWdnZXJzIHdoZW4gdGhlIGRhdGEgaXMgYWJvdXQgdG8gY2hhbmdlXG4gICAgc3RyZWFtXG4gICAgICAucGlwZShcbiAgICAgICAgdW5yeCh0aGlzLCBQUk9DRVNTSU5HX1NVQlNDUklQVElPTl9HUk9VUCksXG4gICAgICAgIHRhcCggcmVzdWx0ID0+IHtcbiAgICAgICAgICBsYXN0RW1pdHRlZFNvdXJjZSA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgIHNraXBWaWV3Q2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9vblJlbmRlckRhdGFDaGFuZ2luZy5uZXh0KHRoaXMuX2xhc3RBZGFwdGVyRXZlbnQgPSByZXN1bHQpO1xuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgKHtkYXRhfSkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLl9sYXN0UmFuZ2UgJiYgZGF0YT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhID0gdHJpbVRvUmFuZ2UodGhpcy5fbGFzdFJhbmdlLCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmVuZGVyRGF0YSQubmV4dChkYXRhKTtcbiAgICAgICAgICBza2lwVmlld0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvciA9PiB7IHRoaXMuX29uRXJyb3IkLm5leHQoZXJyb3IpIH1cbiAgICAgICk7XG5cbiAgICB0aGlzLl9hZGFwdGVyLm9uU291cmNlQ2hhbmdlZFxuICAgICAgLnBpcGUodW5yeCh0aGlzLCBQUk9DRVNTSU5HX1NVQlNDUklQVElPTl9HUk9VUCkpXG4gICAgICAuc3Vic2NyaWJlKCBzb3VyY2UgPT4gdGhpcy5fc291cmNlID0gc291cmNlIHx8IFtdICk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFJlZnJlc2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fYWRhcHRlci5yZWZyZXNoKHRoaXMuX2xhc3RSZWZyZXNoKTtcbiAgICAgIHRoaXMuX2xhc3RSZWZyZXNoID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuc2tpcEluaXRpYWwpIHtcbiAgICAgIC8vIF9yZWZyZXNoJCBpcyBhIFN1YmplY3QsIHdlIG11c3QgZW1pdCBvbmNlIHNvIGNvbWJpbmVMYXRlc3Qgd2lsbCB3b3JrXG4gICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG4gIH1cbn1cblxuIl19