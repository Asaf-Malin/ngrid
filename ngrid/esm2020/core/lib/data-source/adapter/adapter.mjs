import { Subject, combineLatest, of, from, isObservable, asapScheduler } from 'rxjs';
import { filter, map, switchMap, tap, debounceTime, observeOn } from 'rxjs/operators';
import { filter as filteringFn } from '../triggers/filter';
import { applySort } from '../triggers/sort';
import { createChangeContainer, fromRefreshDataWrapper, EMPTY } from './utils';
const CUSTOM_BEHAVIOR_TRIGGER_KEYS = ['sort', 'filter', 'pagination'];
const TRIGGER_KEYS = [...CUSTOM_BEHAVIOR_TRIGGER_KEYS, 'data'];
const SOURCE_CHANGING_TOKEN = {};
const DEFAULT_INITIAL_CACHE_STATE = { filter: EMPTY, sort: EMPTY, pagination: {}, data: EMPTY };
/**
 * An adapter that handles changes
 */
export class PblDataSourceAdapter {
    /**
     * A Data Source adapter contains flow logic for the datasource and subsequent emissions of datasource instances.
     * The logic is determined by the combination of the config object and the sourceFactory provided to this adapter, making this adapter actually a container.
     *
     * There are 4 triggers that are responsible for datasource emissions, when one of them is triggered it will invoke the `sourceFactory`
     * returning a new datasource, i.e. a new datasource emission.
     *
     * The triggers are: filter, sort, pagination and refresh.
     *
     * The refresh trigger does not effect the input sent to the `sourceFactory` function, it is just a mean to initiate a call to create a new
     * datasource without changing previous flow variables.
     * It's important to note that calling `sourceFactory` with the same input 2 or more times does not guarantee identical response. For example
     * calling a remote server that might change it's data between calls.
     *
     * All other triggers (3) will change the input sent to the `sourceFactory` function which will use them to return a datasource.
     *
     * The input sent to `sourceFactory` is the values that each of the 3 triggers yields, when one trigger changes a new value for it is sent
     * and the last values of the other 2 triggers is sent with it. i.e. the combination of the last known value for all 3 triggers is sent.
     *
     * To enable smart caching and data management `sourceFactory` does not get the raw values of each trigger. `sourceFactory` will get
     * an event object that contains metadata about each trigger, whether it triggered the change or not as well as old and new values.
     *
     * The returned value from `sourceFactory` is then used as the datasource, applying all triggers that are not overridden by the user.
     * The returned value of `sourceFactory` can be a `DataSourceOf` or `false`.
     *   - `DataSourceOf` means a valid datasource, either observable/promise of array or an array.
     *   - `false` means skip, returning false will instruct the adapter to skip execution for this trigger cycle.
     *
     * Using a trigger is a binary configuration option, when a trigger is turned on it means that changes to it will be passed to the `sourceFactory`.
     * When a trigger is turned off it is not listened to and `undefined` will be sent as a value for it to the `sourceFactory`.
     *
     * The adapter comes with built in flow logic for all 3 triggers, when a trigger is turned off the adapter will take the result of `sourceFactory` and
     * apply the default behavior to it.
     *
     * For all triggers, the default behavior means client implementation. For filtering, client side filtering. For sorting, client side sorting.
     * For Pagination, client side pagination.
     *
     * You can opt in to one or more triggers and implement your own behavior inside the `sourceFactory`
     * @param sourceFactory - A function that returns the datasource based on flow instructions.
     * The instructions are optional, they might or might not exist depending on the configuration of the adapter.
     * When `sourceFactory` returns false the entire trigger cycle is skipped.
     * @param config - A configuration object describing how this adapter should behave.
     */
    constructor(sourceFactory, config) {
        this.sourceFactory = sourceFactory;
        this._inFlight = new Set();
        this._inPreFlight = false;
        this.config = Object.assign({}, config || {});
        this._refresh$ = new Subject();
        this._onSourceChange$ = new Subject();
        this.onSourceChanged = this._onSourceChange$.pipe(filter(d => d !== SOURCE_CHANGING_TOKEN));
        this.onSourceChanging = this._onSourceChange$.pipe(filter(d => d === SOURCE_CHANGING_TOKEN));
    }
    static hasCustomBehavior(config) {
        for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
            if (!!config[key]) {
                return true;
            }
        }
        return false;
    }
    /** Returns true if the event is triggered from a custom behavior (filter, sort and/or pagination and the configuration allows it) */
    static isCustomBehaviorEvent(event, config) {
        for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
            if (!!config[key] && event[key].changed) {
                return true;
            }
        }
        return false;
    }
    get inFlight() { return this._inPreFlight || this._inFlight.size > 0; }
    dispose() {
        this._refresh$.complete();
        this._onSourceChange$.complete();
    }
    refresh(data) {
        this._refresh$.next({ data });
    }
    /**
     * Clears the cache from any existing datasource trigger such as filter, sort etc.
     * @returns The cached value or null if not there.
     */
    clearCache(cacheKey) {
        if (this.cache && cacheKey in this.cache) {
            const prev = this.cache[cacheKey];
            this.cache[cacheKey] = DEFAULT_INITIAL_CACHE_STATE[cacheKey];
            return prev;
        }
        else {
            return null;
        }
    }
    setPaginator(paginator) {
        this.paginator = paginator;
    }
    updateProcessingLogic(filter$, sort$, pagination$, initialState = {}) {
        let updates = -1;
        const changedFilter = e => updates === -1 || e.changed;
        const skipUpdate = (o) => o.skipUpdate !== true;
        this._lastSource = undefined;
        this.cache = { ...DEFAULT_INITIAL_CACHE_STATE, ...initialState };
        const combine = [
            filter$.pipe(map(value => createChangeContainer('filter', value, this.cache)), filter(changedFilter)),
            sort$.pipe(filter(skipUpdate), map(value => createChangeContainer('sort', value, this.cache)), filter(changedFilter)),
            pagination$.pipe(map(value => createChangeContainer('pagination', value, this.cache)), filter(changedFilter)),
            this._refresh$.pipe(map(value => fromRefreshDataWrapper(createChangeContainer('data', value, this.cache))), filter(changedFilter)),
        ];
        const hasCustomBehavior = PblDataSourceAdapter.hasCustomBehavior(this.config);
        return combineLatest([combine[0], combine[1], combine[2], combine[3]])
            .pipe(tap(() => this._inPreFlight = true), 
        // Defer to next loop cycle, until no more incoming.
        // We use an async schedular here (instead of asapSchedular) because we want to have the largest debounce window without compromising integrity
        // With an async schedular we know we will run after all micro-tasks but before "real" async operations.
        debounceTime(0), switchMap(([filterInput, sort, pagination, data]) => {
            this._inPreFlight = false;
            updates++; // if first, will be 0 now (starts from -1).
            const event = {
                id: Math.random() * 10,
                filter: filterInput,
                sort,
                pagination,
                data,
                eventSource: data.changed ? 'data' : 'customTrigger',
                isInitial: updates === 0,
                updateTotalLength: (totalLength) => {
                    if (this.paginator) {
                        this.paginator.total = totalLength;
                    }
                }
            };
            this.onStartOfEvent(event);
            const runHandle = data.changed
                || (hasCustomBehavior && PblDataSourceAdapter.isCustomBehaviorEvent(event, this.config));
            const response$ = runHandle
                ? this.runHandle(event)
                    .pipe(map(data => {
                    if (data !== false) { // if the user didn't return "false" from his handler, we infer data was changed!
                        event.data.changed = true;
                    }
                    return { event, data };
                }))
                : of({ event, data: this._lastSource });
            return response$
                .pipe(map(response => {
                // If runHandle() returned false, we do not process and return undefined.
                if (response.data === false) {
                    return;
                }
                const config = this.config;
                const event = response.event;
                // mark which of the triggers has changes
                // The logic is based on the user's configuration and the incoming event
                const withChanges = {};
                for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
                    if (!config[key] && (event.isInitial || event[key].changed)) {
                        withChanges[key] = true;
                    }
                }
                // When data changed, apply some logic (caching, operational, etc...)
                if (event.data.changed) {
                    // cache the data when it has changed.
                    this._lastSource = response.data;
                    if (config.sort) {
                        // When the user is sorting (i.e. server sorting), the last sort cached is always the last source we get from the user.
                        this._lastSortedSource = this._lastSource;
                    }
                    else {
                        // When user is NOT sorting (we sort locally) AND the data has changed we need to apply sorting on it
                        // this might already be true (if sorting was the trigger)...
                        withChanges.sort = true;
                        // because we sort and then filter, filtering updates are also triggered by sort updated
                        withChanges.filter = true;
                    }
                    if (config.filter) {
                        // When the user is filtering (i.e. server filtering), the last filter cached is always the last source we get from the user.
                        this._lastFilteredSource = this._lastSource;
                    }
                    else {
                        // When user is NOT filtering (we filter locally) AND the data has changed we need to apply filtering on it
                        // this might already be true (if filtering was the trigger)...
                        withChanges.filter = true;
                    }
                }
                // When user is NOT applying pagination (we paginate locally) AND if we (sort OR filter) locally we also need to paginate locally
                if (!config.pagination && (withChanges.sort || withChanges.filter)) {
                    withChanges.pagination = true;
                }
                // Now, apply: sort --> filter --> pagination     ( ORDER MATTERS!!! )
                if (withChanges.sort) {
                    this._lastSortedSource = this.applySort(this._lastSource, event.sort.curr || event.sort.prev);
                }
                let data = this._lastSortedSource;
                // we check if filter was asked, but also if we have a filter we re-run
                // Only sorting is cached at this point filtering is always calculated
                if (withChanges.filter || (!config.filter && event.filter.curr?.filter)) {
                    data = this._lastFilteredSource = this.applyFilter(data, event.filter.curr || event.filter.prev);
                    if (!this.config.pagination) {
                        if (withChanges.filter || !withChanges.pagination) {
                            this.resetPagination(data.length);
                        }
                    }
                }
                if (withChanges.pagination) {
                    data = this.applyPagination(data);
                }
                const clonedEvent = { ...event };
                // We use `combineLatest` which caches pervious events, only new events are replaced.
                // We need to mark everything as NOT CHANGED, so subsequent calls will not have their changed flag set to true.
                //
                // We also clone the object so we can pass on the proper values.
                // We create shallow clones so complex objects (column in sort, user data in data) will not throw on circular.
                // For pagination we deep clone because it contains primitives and we need to also clone the internal change objects.
                for (const k of TRIGGER_KEYS) {
                    clonedEvent[k] = k === 'pagination'
                        ? JSON.parse(JSON.stringify(event[k]))
                        : { ...event[k] };
                    event[k].changed = false;
                }
                event.pagination.page.changed = event.pagination.perPage.changed = false;
                return {
                    event: clonedEvent,
                    data,
                    sorted: this._lastSortedSource,
                    filtered: this._lastFilteredSource,
                };
            }), tap(() => this.onEndOfEvent(event)), 
            // If runHandle() returned false, we will get undefined here, we do not emit these to the grid, nothing to do.
            filter(r => !!r));
        }));
    }
    applyFilter(data, dataSourceFilter) {
        return filteringFn(data, dataSourceFilter);
    }
    applySort(data, event) {
        return applySort(event.column, event.sort, data);
    }
    applyPagination(data) {
        if (this.paginator) {
            // Set the rendered rows length to the virtual page size. Fill in the data provided
            // from the index start until the end index or pagination size, whichever is smaller.
            const range = this.paginator.range;
            return data.slice(range[0], range[1]);
        }
        return data;
    }
    resetPagination(totalLength) {
        if (this.paginator) {
            this.paginator.total = totalLength;
            this.paginator.page = totalLength > 0 ? 1 : 0;
        }
    }
    onStartOfEvent(event) {
        this._inFlight.add(event);
    }
    onEndOfEvent(event) {
        this._inFlight.delete(event);
    }
    emitOnSourceChanging(event) {
        this._onSourceChange$.next(SOURCE_CHANGING_TOKEN);
    }
    emitOnSourceChanged(event, data) {
        this._onSourceChange$.next(data);
    }
    /**
     * Execute the user-provided function that returns the data collection.
     * This method wraps each of the triggers with a container providing metadata for the trigger. (Old value, was changed? and new value if changed)
     * This is where all cache logic is managed (createChangeContainer).
     *
     * To build a data collection the information from all triggers is required, even if it was not changed.
     * When a trigger is fired with a new value the new value replaces the old value for the trigger and all other triggers will keep their old value.
     * Sending the triggers to the handlers is not enough, we also need to the handlers which of the trigger's have change so they can return
     * data without doing redundant work.
     * For example, fetching paginated data from the server requires a call whenever the pages changes but if the filtering is local for the current page
     * and the filter trigger is fired the handler needs to know that pagination did not change so it will not go and fetch data from the server.
     *
     * The handler can return several data structures, observable, promise, array or false.
     * This method will normalize the response into an observable and notify that the source changed (onSourceChanged).
     *
     * When the response is false that handler wants to skip this cycle, this means that onSourceChanged will not emit and
     * a dead-end observable is returned (observable that will never emit).
     */
    runHandle(event) {
        const result = this.sourceFactory(event);
        if (result === false) {
            return of(false);
        }
        this.emitOnSourceChanging(event);
        const obs = Array.isArray(result)
            ? of(result)
            // else ->            observable : promise
            : (isObservable(result) ? result : from(result))
                .pipe(map(data => Array.isArray(data) ? data : [])) // TODO: should we error? warn? notify?
        ;
        return obs.pipe(observeOn(asapScheduler, 0), // run as a micro-task
        tap(data => this.emitOnSourceChanged(event, data)));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvY29yZS9zcmMvbGliL2RhdGEtc291cmNlL2FkYXB0ZXIvYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsT0FBTyxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakcsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdEYsT0FBTyxFQUFvQixNQUFNLElBQUksV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0UsT0FBTyxFQUFnQyxTQUFTLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQVkzRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsc0JBQXNCLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRS9FLE1BQU0sNEJBQTRCLEdBQW1ELENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN0SCxNQUFNLFlBQVksR0FBdUMsQ0FBQyxHQUFHLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ25HLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0FBRWpDLE1BQU0sMkJBQTJCLEdBQW1DLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBRWhJOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQXVDL0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BeUNHO0lBQ0gsWUFBbUIsYUFBMkQsRUFDbEUsTUFBa0Y7UUFE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Q0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQyx1Q0FBdUM7U0FDbEc7UUFFRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQ2IsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRSxzQkFBc0I7UUFDbkQsR0FBRyxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFXLENBQUMsQ0FBRSxDQUM1RCxDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCwgY29tYmluZUxhdGVzdCwgb2YsIGZyb20sIGlzT2JzZXJ2YWJsZSwgYXNhcFNjaGVkdWxlciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyLCBtYXAsIHN3aXRjaE1hcCwgdGFwLCBkZWJvdW5jZVRpbWUsIG9ic2VydmVPbiB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgUGJsUGFnaW5hdG9yLCBQYmxQYWdpbmF0b3JDaGFuZ2VFdmVudCB9IGZyb20gJy4uL3RyaWdnZXJzL3BhZ2luYXRpb24vdHlwZXMnO1xuaW1wb3J0IHsgRGF0YVNvdXJjZUZpbHRlciwgZmlsdGVyIGFzIGZpbHRlcmluZ0ZuIH0gZnJvbSAnLi4vdHJpZ2dlcnMvZmlsdGVyJztcbmltcG9ydCB7IFBibE5ncmlkRGF0YVNvdXJjZVNvcnRDaGFuZ2UsIGFwcGx5U29ydCB9IGZyb20gJy4uL3RyaWdnZXJzL3NvcnQnO1xuXG5pbXBvcnQge1xuICBSZWZyZXNoRGF0YVdyYXBwZXIsXG4gIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycyxcbiAgUGJsRGF0YVNvdXJjZVRyaWdnZXJzLFxuICBQYmxEYXRhU291cmNlVHJpZ2dlckNhY2hlLFxuICBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudCxcbiAgVHJpZ2dlckNoYW5nZWRFdmVudEZvcixcbiAgUGJsRGF0YVNvdXJjZUFkYXB0ZXJQcm9jZXNzZWRSZXN1bHQsXG4gIFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlSGFuZGxlcixcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBjcmVhdGVDaGFuZ2VDb250YWluZXIsIGZyb21SZWZyZXNoRGF0YVdyYXBwZXIsIEVNUFRZIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IENVU1RPTV9CRUhBVklPUl9UUklHR0VSX0tFWVM6IEFycmF5PGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2Vycz4gPSBbJ3NvcnQnLCAnZmlsdGVyJywgJ3BhZ2luYXRpb24nXTtcbmNvbnN0IFRSSUdHRVJfS0VZUzogQXJyYXk8a2V5b2YgUGJsRGF0YVNvdXJjZVRyaWdnZXJzPiA9IFsuLi5DVVNUT01fQkVIQVZJT1JfVFJJR0dFUl9LRVlTLCAnZGF0YSddO1xuY29uc3QgU09VUkNFX0NIQU5HSU5HX1RPS0VOID0ge307XG5cbmNvbnN0IERFRkFVTFRfSU5JVElBTF9DQUNIRV9TVEFURTogUGJsRGF0YVNvdXJjZVRyaWdnZXJDYWNoZTxhbnk+ID0geyBmaWx0ZXI6IEVNUFRZLCBzb3J0OiBFTVBUWSwgcGFnaW5hdGlvbjoge30sIGRhdGE6IEVNUFRZIH07XG5cbi8qKlxuICogQW4gYWRhcHRlciB0aGF0IGhhbmRsZXMgY2hhbmdlc1xuICovXG5leHBvcnQgY2xhc3MgUGJsRGF0YVNvdXJjZUFkYXB0ZXI8VCA9IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBURGF0YSA9IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBURXZlbnQgZXh0ZW5kcyBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4gPSBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4+IHtcblxuICBzdGF0aWMgaGFzQ3VzdG9tQmVoYXZpb3IoY29uZmlnOiBQYXJ0aWFsPFJlY29yZDxrZXlvZiBQYmxEYXRhU291cmNlQ29uZmlndXJhYmxlVHJpZ2dlcnMsIGJvb2xlYW4+Pik6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIENVU1RPTV9CRUhBVklPUl9UUklHR0VSX0tFWVMpIHtcbiAgICAgIGlmICghIWNvbmZpZ1trZXldKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQgZnJvbSBhIGN1c3RvbSBiZWhhdmlvciAoZmlsdGVyLCBzb3J0IGFuZC9vciBwYWdpbmF0aW9uIGFuZCB0aGUgY29uZmlndXJhdGlvbiBhbGxvd3MgaXQpICovXG4gIHN0YXRpYyBpc0N1c3RvbUJlaGF2aW9yRXZlbnQoZXZlbnQ6IFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlZEV2ZW50LCBjb25maWc6IFBhcnRpYWw8UmVjb3JkPGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycywgYm9vbGVhbj4+KSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgQ1VTVE9NX0JFSEFWSU9SX1RSSUdHRVJfS0VZUykge1xuICAgICAgaWYgKCEhY29uZmlnW2tleV0gJiYgZXZlbnRba2V5XS5jaGFuZ2VkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZWFkb25seSBvblNvdXJjZUNoYW5nZWQ6IE9ic2VydmFibGU8VFtdPjtcbiAgcmVhZG9ubHkgb25Tb3VyY2VDaGFuZ2luZzogT2JzZXJ2YWJsZTx2b2lkPjtcblxuICBnZXQgaW5GbGlnaHQoKSB7IHJldHVybiB0aGlzLl9pblByZUZsaWdodCB8fCB0aGlzLl9pbkZsaWdodC5zaXplID4gMDsgfVxuXG4gIHByb3RlY3RlZCBwYWdpbmF0b3I/OiBQYmxQYWdpbmF0b3I8YW55PjtcbiAgcHJpdmF0ZSByZWFkb25seSBjb25maWc6IFBhcnRpYWw8UmVjb3JkPGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycywgYm9vbGVhbj4+O1xuICBwcml2YXRlIGNhY2hlOiBQYmxEYXRhU291cmNlVHJpZ2dlckNhY2hlPFREYXRhPjtcbiAgcHJpdmF0ZSBfb25Tb3VyY2VDaGFuZ2UkOiBTdWJqZWN0PGFueSB8IFRbXT47XG4gIHByaXZhdGUgX3JlZnJlc2gkOiBTdWJqZWN0PFJlZnJlc2hEYXRhV3JhcHBlcjxURGF0YT4+O1xuICBwcml2YXRlIF9sYXN0U291cmNlOiBUW107XG4gIHByaXZhdGUgX2xhc3RTb3J0ZWRTb3VyY2U6IFRbXTtcbiAgcHJpdmF0ZSBfbGFzdEZpbHRlcmVkU291cmNlOiBUW107XG4gIHByaXZhdGUgX2luRmxpZ2h0ID0gbmV3IFNldDxURXZlbnQ+KCk7XG4gIHByaXZhdGUgX2luUHJlRmxpZ2h0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEEgRGF0YSBTb3VyY2UgYWRhcHRlciBjb250YWlucyBmbG93IGxvZ2ljIGZvciB0aGUgZGF0YXNvdXJjZSBhbmQgc3Vic2VxdWVudCBlbWlzc2lvbnMgb2YgZGF0YXNvdXJjZSBpbnN0YW5jZXMuXG4gICAqIFRoZSBsb2dpYyBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBjb21iaW5hdGlvbiBvZiB0aGUgY29uZmlnIG9iamVjdCBhbmQgdGhlIHNvdXJjZUZhY3RvcnkgcHJvdmlkZWQgdG8gdGhpcyBhZGFwdGVyLCBtYWtpbmcgdGhpcyBhZGFwdGVyIGFjdHVhbGx5IGEgY29udGFpbmVyLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgNCB0cmlnZ2VycyB0aGF0IGFyZSByZXNwb25zaWJsZSBmb3IgZGF0YXNvdXJjZSBlbWlzc2lvbnMsIHdoZW4gb25lIG9mIHRoZW0gaXMgdHJpZ2dlcmVkIGl0IHdpbGwgaW52b2tlIHRoZSBgc291cmNlRmFjdG9yeWBcbiAgICogcmV0dXJuaW5nIGEgbmV3IGRhdGFzb3VyY2UsIGkuZS4gYSBuZXcgZGF0YXNvdXJjZSBlbWlzc2lvbi5cbiAgICpcbiAgICogVGhlIHRyaWdnZXJzIGFyZTogZmlsdGVyLCBzb3J0LCBwYWdpbmF0aW9uIGFuZCByZWZyZXNoLlxuICAgKlxuICAgKiBUaGUgcmVmcmVzaCB0cmlnZ2VyIGRvZXMgbm90IGVmZmVjdCB0aGUgaW5wdXQgc2VudCB0byB0aGUgYHNvdXJjZUZhY3RvcnlgIGZ1bmN0aW9uLCBpdCBpcyBqdXN0IGEgbWVhbiB0byBpbml0aWF0ZSBhIGNhbGwgdG8gY3JlYXRlIGEgbmV3XG4gICAqIGRhdGFzb3VyY2Ugd2l0aG91dCBjaGFuZ2luZyBwcmV2aW91cyBmbG93IHZhcmlhYmxlcy5cbiAgICogSXQncyBpbXBvcnRhbnQgdG8gbm90ZSB0aGF0IGNhbGxpbmcgYHNvdXJjZUZhY3RvcnlgIHdpdGggdGhlIHNhbWUgaW5wdXQgMiBvciBtb3JlIHRpbWVzIGRvZXMgbm90IGd1YXJhbnRlZSBpZGVudGljYWwgcmVzcG9uc2UuIEZvciBleGFtcGxlXG4gICAqIGNhbGxpbmcgYSByZW1vdGUgc2VydmVyIHRoYXQgbWlnaHQgY2hhbmdlIGl0J3MgZGF0YSBiZXR3ZWVuIGNhbGxzLlxuICAgKlxuICAgKiBBbGwgb3RoZXIgdHJpZ2dlcnMgKDMpIHdpbGwgY2hhbmdlIHRoZSBpbnB1dCBzZW50IHRvIHRoZSBgc291cmNlRmFjdG9yeWAgZnVuY3Rpb24gd2hpY2ggd2lsbCB1c2UgdGhlbSB0byByZXR1cm4gYSBkYXRhc291cmNlLlxuICAgKlxuICAgKiBUaGUgaW5wdXQgc2VudCB0byBgc291cmNlRmFjdG9yeWAgaXMgdGhlIHZhbHVlcyB0aGF0IGVhY2ggb2YgdGhlIDMgdHJpZ2dlcnMgeWllbGRzLCB3aGVuIG9uZSB0cmlnZ2VyIGNoYW5nZXMgYSBuZXcgdmFsdWUgZm9yIGl0IGlzIHNlbnRcbiAgICogYW5kIHRoZSBsYXN0IHZhbHVlcyBvZiB0aGUgb3RoZXIgMiB0cmlnZ2VycyBpcyBzZW50IHdpdGggaXQuIGkuZS4gdGhlIGNvbWJpbmF0aW9uIG9mIHRoZSBsYXN0IGtub3duIHZhbHVlIGZvciBhbGwgMyB0cmlnZ2VycyBpcyBzZW50LlxuICAgKlxuICAgKiBUbyBlbmFibGUgc21hcnQgY2FjaGluZyBhbmQgZGF0YSBtYW5hZ2VtZW50IGBzb3VyY2VGYWN0b3J5YCBkb2VzIG5vdCBnZXQgdGhlIHJhdyB2YWx1ZXMgb2YgZWFjaCB0cmlnZ2VyLiBgc291cmNlRmFjdG9yeWAgd2lsbCBnZXRcbiAgICogYW4gZXZlbnQgb2JqZWN0IHRoYXQgY29udGFpbnMgbWV0YWRhdGEgYWJvdXQgZWFjaCB0cmlnZ2VyLCB3aGV0aGVyIGl0IHRyaWdnZXJlZCB0aGUgY2hhbmdlIG9yIG5vdCBhcyB3ZWxsIGFzIG9sZCBhbmQgbmV3IHZhbHVlcy5cbiAgICpcbiAgICogVGhlIHJldHVybmVkIHZhbHVlIGZyb20gYHNvdXJjZUZhY3RvcnlgIGlzIHRoZW4gdXNlZCBhcyB0aGUgZGF0YXNvdXJjZSwgYXBwbHlpbmcgYWxsIHRyaWdnZXJzIHRoYXQgYXJlIG5vdCBvdmVycmlkZGVuIGJ5IHRoZSB1c2VyLlxuICAgKiBUaGUgcmV0dXJuZWQgdmFsdWUgb2YgYHNvdXJjZUZhY3RvcnlgIGNhbiBiZSBhIGBEYXRhU291cmNlT2ZgIG9yIGBmYWxzZWAuXG4gICAqICAgLSBgRGF0YVNvdXJjZU9mYCBtZWFucyBhIHZhbGlkIGRhdGFzb3VyY2UsIGVpdGhlciBvYnNlcnZhYmxlL3Byb21pc2Ugb2YgYXJyYXkgb3IgYW4gYXJyYXkuXG4gICAqICAgLSBgZmFsc2VgIG1lYW5zIHNraXAsIHJldHVybmluZyBmYWxzZSB3aWxsIGluc3RydWN0IHRoZSBhZGFwdGVyIHRvIHNraXAgZXhlY3V0aW9uIGZvciB0aGlzIHRyaWdnZXIgY3ljbGUuXG4gICAqXG4gICAqIFVzaW5nIGEgdHJpZ2dlciBpcyBhIGJpbmFyeSBjb25maWd1cmF0aW9uIG9wdGlvbiwgd2hlbiBhIHRyaWdnZXIgaXMgdHVybmVkIG9uIGl0IG1lYW5zIHRoYXQgY2hhbmdlcyB0byBpdCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYHNvdXJjZUZhY3RvcnlgLlxuICAgKiBXaGVuIGEgdHJpZ2dlciBpcyB0dXJuZWQgb2ZmIGl0IGlzIG5vdCBsaXN0ZW5lZCB0byBhbmQgYHVuZGVmaW5lZGAgd2lsbCBiZSBzZW50IGFzIGEgdmFsdWUgZm9yIGl0IHRvIHRoZSBgc291cmNlRmFjdG9yeWAuXG4gICAqXG4gICAqIFRoZSBhZGFwdGVyIGNvbWVzIHdpdGggYnVpbHQgaW4gZmxvdyBsb2dpYyBmb3IgYWxsIDMgdHJpZ2dlcnMsIHdoZW4gYSB0cmlnZ2VyIGlzIHR1cm5lZCBvZmYgdGhlIGFkYXB0ZXIgd2lsbCB0YWtlIHRoZSByZXN1bHQgb2YgYHNvdXJjZUZhY3RvcnlgIGFuZFxuICAgKiBhcHBseSB0aGUgZGVmYXVsdCBiZWhhdmlvciB0byBpdC5cbiAgICpcbiAgICogRm9yIGFsbCB0cmlnZ2VycywgdGhlIGRlZmF1bHQgYmVoYXZpb3IgbWVhbnMgY2xpZW50IGltcGxlbWVudGF0aW9uLiBGb3IgZmlsdGVyaW5nLCBjbGllbnQgc2lkZSBmaWx0ZXJpbmcuIEZvciBzb3J0aW5nLCBjbGllbnQgc2lkZSBzb3J0aW5nLlxuICAgKiBGb3IgUGFnaW5hdGlvbiwgY2xpZW50IHNpZGUgcGFnaW5hdGlvbi5cbiAgICpcbiAgICogWW91IGNhbiBvcHQgaW4gdG8gb25lIG9yIG1vcmUgdHJpZ2dlcnMgYW5kIGltcGxlbWVudCB5b3VyIG93biBiZWhhdmlvciBpbnNpZGUgdGhlIGBzb3VyY2VGYWN0b3J5YFxuICAgKiBAcGFyYW0gc291cmNlRmFjdG9yeSAtIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBkYXRhc291cmNlIGJhc2VkIG9uIGZsb3cgaW5zdHJ1Y3Rpb25zLlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb25zIGFyZSBvcHRpb25hbCwgdGhleSBtaWdodCBvciBtaWdodCBub3QgZXhpc3QgZGVwZW5kaW5nIG9uIHRoZSBjb25maWd1cmF0aW9uIG9mIHRoZSBhZGFwdGVyLlxuICAgKiBXaGVuIGBzb3VyY2VGYWN0b3J5YCByZXR1cm5zIGZhbHNlIHRoZSBlbnRpcmUgdHJpZ2dlciBjeWNsZSBpcyBza2lwcGVkLlxuICAgKiBAcGFyYW0gY29uZmlnIC0gQSBjb25maWd1cmF0aW9uIG9iamVjdCBkZXNjcmliaW5nIGhvdyB0aGlzIGFkYXB0ZXIgc2hvdWxkIGJlaGF2ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzb3VyY2VGYWN0b3J5OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZUhhbmRsZXI8VCwgVEV2ZW50PixcbiAgICAgICAgICAgICAgY29uZmlnPzogZmFsc2UgfCBQYXJ0aWFsPFJlY29yZDxrZXlvZiBQYmxEYXRhU291cmNlQ29uZmlndXJhYmxlVHJpZ2dlcnMsIGJvb2xlYW4+Pikge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnIHx8IHt9KTtcblxuICAgIHRoaXMuX3JlZnJlc2gkID0gbmV3IFN1YmplY3Q8UmVmcmVzaERhdGFXcmFwcGVyPFREYXRhPj4oKTtcbiAgICB0aGlzLl9vblNvdXJjZUNoYW5nZSQgPSBuZXcgU3ViamVjdDxUW10+KCk7XG4gICAgdGhpcy5vblNvdXJjZUNoYW5nZWQgPSB0aGlzLl9vblNvdXJjZUNoYW5nZSQucGlwZShmaWx0ZXIoIGQgPT4gZCAhPT0gU09VUkNFX0NIQU5HSU5HX1RPS0VOICkpO1xuICAgIHRoaXMub25Tb3VyY2VDaGFuZ2luZyA9IHRoaXMuX29uU291cmNlQ2hhbmdlJC5waXBlKGZpbHRlciggZCA9PiBkID09PSBTT1VSQ0VfQ0hBTkdJTkdfVE9LRU4gKSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlZnJlc2gkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fb25Tb3VyY2VDaGFuZ2UkLmNvbXBsZXRlKCk7XG4gIH1cblxuICByZWZyZXNoKGRhdGE/OiBURGF0YSk6IHZvaWQge1xuICAgIHRoaXMuX3JlZnJlc2gkLm5leHQoeyBkYXRhIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgY2FjaGUgZnJvbSBhbnkgZXhpc3RpbmcgZGF0YXNvdXJjZSB0cmlnZ2VyIHN1Y2ggYXMgZmlsdGVyLCBzb3J0IGV0Yy5cbiAgICogQHJldHVybnMgVGhlIGNhY2hlZCB2YWx1ZSBvciBudWxsIGlmIG5vdCB0aGVyZS5cbiAgICovXG4gIGNsZWFyQ2FjaGU8UCBleHRlbmRzIGtleW9mIFBibERhdGFTb3VyY2VUcmlnZ2VyQ2FjaGU+KGNhY2hlS2V5OiBQKTogUGJsRGF0YVNvdXJjZVRyaWdnZXJDYWNoZTxURGF0YT5bUF0gfCBudWxsIHtcbiAgICBpZiAoY2FjaGVLZXkgaW4gdGhpcy5jYWNoZSkge1xuICAgICAgY29uc3QgcHJldiA9IHRoaXMuY2FjaGVbY2FjaGVLZXldO1xuICAgICAgdGhpcy5jYWNoZVtjYWNoZUtleV0gPSBERUZBVUxUX0lOSVRJQUxfQ0FDSEVfU1RBVEVbY2FjaGVLZXldO1xuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhZ2luYXRvcihwYWdpbmF0b3I6IFBibFBhZ2luYXRvcjxhbnk+IHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgdGhpcy5wYWdpbmF0b3IgPSBwYWdpbmF0b3I7XG4gIH1cblxuICB1cGRhdGVQcm9jZXNzaW5nTG9naWMoZmlsdGVyJDogT2JzZXJ2YWJsZTxEYXRhU291cmNlRmlsdGVyPixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnQkOiBPYnNlcnZhYmxlPFBibE5ncmlkRGF0YVNvdXJjZVNvcnRDaGFuZ2UgJiB7IHNraXBVcGRhdGU6IGJvb2xlYW4gfT4sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uJDogT2JzZXJ2YWJsZTxQYmxQYWdpbmF0b3JDaGFuZ2VFdmVudD4sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsU3RhdGU6IFBhcnRpYWw8UGJsRGF0YVNvdXJjZVRyaWdnZXJDYWNoZTxURGF0YT4+ID0ge30pOiBPYnNlcnZhYmxlPFBibERhdGFTb3VyY2VBZGFwdGVyUHJvY2Vzc2VkUmVzdWx0PFQsIFREYXRhPj4ge1xuICAgIGxldCB1cGRhdGVzID0gLTE7XG4gICAgY29uc3QgY2hhbmdlZEZpbHRlciA9IGUgPT4gdXBkYXRlcyA9PT0gLTEgfHwgZS5jaGFuZ2VkO1xuICAgIGNvbnN0IHNraXBVcGRhdGUgPSAobzogUGJsTmdyaWREYXRhU291cmNlU29ydENoYW5nZSAmIHsgc2tpcFVwZGF0ZTogYm9vbGVhbiB9KSA9PiBvLnNraXBVcGRhdGUgIT09IHRydWU7XG5cbiAgICB0aGlzLl9sYXN0U291cmNlID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5jYWNoZSA9IHsgLi4uREVGQVVMVF9JTklUSUFMX0NBQ0hFX1NUQVRFLCAuLi5pbml0aWFsU3RhdGUgfTtcblxuICAgIGNvbnN0IGNvbWJpbmU6IFtcbiAgICAgIE9ic2VydmFibGU8VHJpZ2dlckNoYW5nZWRFdmVudEZvcjwnZmlsdGVyJz4+LFxuICAgICAgT2JzZXJ2YWJsZTxUcmlnZ2VyQ2hhbmdlZEV2ZW50Rm9yPCdzb3J0Jz4+LFxuICAgICAgT2JzZXJ2YWJsZTxUcmlnZ2VyQ2hhbmdlZEV2ZW50Rm9yPCdwYWdpbmF0aW9uJz4+LFxuICAgICAgT2JzZXJ2YWJsZTxUcmlnZ2VyQ2hhbmdlZEV2ZW50Rm9yPCdkYXRhJz4+XG4gICAgXSA9IFtcbiAgICAgIGZpbHRlciQucGlwZSggbWFwKCB2YWx1ZSA9PiBjcmVhdGVDaGFuZ2VDb250YWluZXIoJ2ZpbHRlcicsIHZhbHVlLCB0aGlzLmNhY2hlKSApLCBmaWx0ZXIoY2hhbmdlZEZpbHRlcikgKSxcbiAgICAgIHNvcnQkLnBpcGUoIGZpbHRlcihza2lwVXBkYXRlKSwgbWFwKCB2YWx1ZSA9PiBjcmVhdGVDaGFuZ2VDb250YWluZXIoJ3NvcnQnLCB2YWx1ZSwgdGhpcy5jYWNoZSkgKSwgZmlsdGVyKGNoYW5nZWRGaWx0ZXIpICksXG4gICAgICBwYWdpbmF0aW9uJC5waXBlKCBtYXAoIHZhbHVlID0+IGNyZWF0ZUNoYW5nZUNvbnRhaW5lcigncGFnaW5hdGlvbicsIHZhbHVlLCB0aGlzLmNhY2hlKSApLCBmaWx0ZXIoY2hhbmdlZEZpbHRlcikgKSxcbiAgICAgIHRoaXMuX3JlZnJlc2gkLnBpcGUoIG1hcCggdmFsdWUgPT4gZnJvbVJlZnJlc2hEYXRhV3JhcHBlcihjcmVhdGVDaGFuZ2VDb250YWluZXIoJ2RhdGEnLCB2YWx1ZSwgdGhpcy5jYWNoZSkpICksIGZpbHRlcihjaGFuZ2VkRmlsdGVyKSApLFxuICAgIF07XG5cbiAgICBjb25zdCBoYXNDdXN0b21CZWhhdmlvciA9IFBibERhdGFTb3VyY2VBZGFwdGVyLmhhc0N1c3RvbUJlaGF2aW9yKHRoaXMuY29uZmlnKTtcblxuICAgIHJldHVybiBjb21iaW5lTGF0ZXN0KFtjb21iaW5lWzBdLCBjb21iaW5lWzFdLCBjb21iaW5lWzJdLCBjb21iaW5lWzNdXSlcbiAgICAgIC5waXBlKFxuICAgICAgICB0YXAoICgpID0+IHRoaXMuX2luUHJlRmxpZ2h0ID0gdHJ1ZSksXG4gICAgICAgIC8vIERlZmVyIHRvIG5leHQgbG9vcCBjeWNsZSwgdW50aWwgbm8gbW9yZSBpbmNvbWluZy5cbiAgICAgICAgLy8gV2UgdXNlIGFuIGFzeW5jIHNjaGVkdWxhciBoZXJlIChpbnN0ZWFkIG9mIGFzYXBTY2hlZHVsYXIpIGJlY2F1c2Ugd2Ugd2FudCB0byBoYXZlIHRoZSBsYXJnZXN0IGRlYm91bmNlIHdpbmRvdyB3aXRob3V0IGNvbXByb21pc2luZyBpbnRlZ3JpdHlcbiAgICAgICAgLy8gV2l0aCBhbiBhc3luYyBzY2hlZHVsYXIgd2Uga25vdyB3ZSB3aWxsIHJ1biBhZnRlciBhbGwgbWljcm8tdGFza3MgYnV0IGJlZm9yZSBcInJlYWxcIiBhc3luYyBvcGVyYXRpb25zLlxuICAgICAgICBkZWJvdW5jZVRpbWUoMCksXG4gICAgICAgIHN3aXRjaE1hcCggKFtmaWx0ZXJJbnB1dCwgc29ydCwgcGFnaW5hdGlvbiwgZGF0YSBdKSA9PiB7XG4gICAgICAgICAgdGhpcy5faW5QcmVGbGlnaHQgPSBmYWxzZTtcblxuICAgICAgICAgIHVwZGF0ZXMrKzsgLy8gaWYgZmlyc3QsIHdpbGwgYmUgMCBub3cgKHN0YXJ0cyBmcm9tIC0xKS5cbiAgICAgICAgICBjb25zdCBldmVudDogVEV2ZW50ID0ge1xuICAgICAgICAgICAgaWQ6IE1hdGgucmFuZG9tKCkgKiAxMCxcbiAgICAgICAgICAgIGZpbHRlcjogZmlsdGVySW5wdXQsXG4gICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgcGFnaW5hdGlvbixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBldmVudFNvdXJjZTogZGF0YS5jaGFuZ2VkID8gJ2RhdGEnIDogJ2N1c3RvbVRyaWdnZXInLFxuICAgICAgICAgICAgaXNJbml0aWFsOiB1cGRhdGVzID09PSAwLFxuICAgICAgICAgICAgdXBkYXRlVG90YWxMZW5ndGg6ICh0b3RhbExlbmd0aCkgPT4ge1xuICAgICAgICAgICAgICBpZiAodGhpcy5wYWdpbmF0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRvci50b3RhbCA9IHRvdGFsTGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBhcyBURXZlbnQ7XG4gICAgICAgICAgdGhpcy5vblN0YXJ0T2ZFdmVudChldmVudCk7XG5cbiAgICAgICAgICBjb25zdCBydW5IYW5kbGUgPSBkYXRhLmNoYW5nZWRcbiAgICAgICAgICAgIHx8ICggaGFzQ3VzdG9tQmVoYXZpb3IgJiYgUGJsRGF0YVNvdXJjZUFkYXB0ZXIuaXNDdXN0b21CZWhhdmlvckV2ZW50KGV2ZW50LCB0aGlzLmNvbmZpZykgKTtcblxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlJCA9IHJ1bkhhbmRsZVxuICAgICAgICAgICAgPyB0aGlzLnJ1bkhhbmRsZShldmVudCBhcyBURXZlbnQpXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICBtYXAoIGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSAhPT0gZmFsc2UpIHsgLy8gaWYgdGhlIHVzZXIgZGlkbid0IHJldHVybiBcImZhbHNlXCIgZnJvbSBoaXMgaGFuZGxlciwgd2UgaW5mZXIgZGF0YSB3YXMgY2hhbmdlZCFcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5kYXRhLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGV2ZW50LCBkYXRhIH07XG4gICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIDogb2YoeyBldmVudCwgZGF0YTogdGhpcy5fbGFzdFNvdXJjZSB9KVxuICAgICAgICAgICAgO1xuXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlJFxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIG1hcCggcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8vIElmIHJ1bkhhbmRsZSgpIHJldHVybmVkIGZhbHNlLCB3ZSBkbyBub3QgcHJvY2VzcyBhbmQgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSByZXNwb25zZS5ldmVudDtcblxuICAgICAgICAgICAgICAgIC8vIG1hcmsgd2hpY2ggb2YgdGhlIHRyaWdnZXJzIGhhcyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgLy8gVGhlIGxvZ2ljIGlzIGJhc2VkIG9uIHRoZSB1c2VyJ3MgY29uZmlndXJhdGlvbiBhbmQgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgY29uc3Qgd2l0aENoYW5nZXM6IFBhcnRpYWw8UmVjb3JkPGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycywgYm9vbGVhbj4+ID0ge307XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgQ1VTVE9NX0JFSEFWSU9SX1RSSUdHRVJfS0VZUykge1xuICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWdba2V5XSAmJiAoZXZlbnQuaXNJbml0aWFsIHx8IGV2ZW50W2tleV0uY2hhbmdlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgd2l0aENoYW5nZXNba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBkYXRhIGNoYW5nZWQsIGFwcGx5IHNvbWUgbG9naWMgKGNhY2hpbmcsIG9wZXJhdGlvbmFsLCBldGMuLi4pXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGEuY2hhbmdlZCkge1xuICAgICAgICAgICAgICAgICAgLy8gY2FjaGUgdGhlIGRhdGEgd2hlbiBpdCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RTb3VyY2UgPSByZXNwb25zZS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnNvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBpcyBzb3J0aW5nIChpLmUuIHNlcnZlciBzb3J0aW5nKSwgdGhlIGxhc3Qgc29ydCBjYWNoZWQgaXMgYWx3YXlzIHRoZSBsYXN0IHNvdXJjZSB3ZSBnZXQgZnJvbSB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGFzdFNvcnRlZFNvdXJjZSA9IHRoaXMuX2xhc3RTb3VyY2U7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHVzZXIgaXMgTk9UIHNvcnRpbmcgKHdlIHNvcnQgbG9jYWxseSkgQU5EIHRoZSBkYXRhIGhhcyBjaGFuZ2VkIHdlIG5lZWQgdG8gYXBwbHkgc29ydGluZyBvbiBpdFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIG1pZ2h0IGFscmVhZHkgYmUgdHJ1ZSAoaWYgc29ydGluZyB3YXMgdGhlIHRyaWdnZXIpLi4uXG4gICAgICAgICAgICAgICAgICAgIHdpdGhDaGFuZ2VzLnNvcnQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugd2Ugc29ydCBhbmQgdGhlbiBmaWx0ZXIsIGZpbHRlcmluZyB1cGRhdGVzIGFyZSBhbHNvIHRyaWdnZXJlZCBieSBzb3J0IHVwZGF0ZWRcbiAgICAgICAgICAgICAgICAgICAgd2l0aENoYW5nZXMuZmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5maWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBpcyBmaWx0ZXJpbmcgKGkuZS4gc2VydmVyIGZpbHRlcmluZyksIHRoZSBsYXN0IGZpbHRlciBjYWNoZWQgaXMgYWx3YXlzIHRoZSBsYXN0IHNvdXJjZSB3ZSBnZXQgZnJvbSB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGFzdEZpbHRlcmVkU291cmNlID0gdGhpcy5fbGFzdFNvdXJjZTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gdXNlciBpcyBOT1QgZmlsdGVyaW5nICh3ZSBmaWx0ZXIgbG9jYWxseSkgQU5EIHRoZSBkYXRhIGhhcyBjaGFuZ2VkIHdlIG5lZWQgdG8gYXBwbHkgZmlsdGVyaW5nIG9uIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbWlnaHQgYWxyZWFkeSBiZSB0cnVlIChpZiBmaWx0ZXJpbmcgd2FzIHRoZSB0cmlnZ2VyKS4uLlxuICAgICAgICAgICAgICAgICAgICB3aXRoQ2hhbmdlcy5maWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdXNlciBpcyBOT1QgYXBwbHlpbmcgcGFnaW5hdGlvbiAod2UgcGFnaW5hdGUgbG9jYWxseSkgQU5EIGlmIHdlIChzb3J0IE9SIGZpbHRlcikgbG9jYWxseSB3ZSBhbHNvIG5lZWQgdG8gcGFnaW5hdGUgbG9jYWxseVxuICAgICAgICAgICAgICAgIGlmICghY29uZmlnLnBhZ2luYXRpb24gJiYgKHdpdGhDaGFuZ2VzLnNvcnQgfHwgd2l0aENoYW5nZXMuZmlsdGVyKSkge1xuICAgICAgICAgICAgICAgICAgd2l0aENoYW5nZXMucGFnaW5hdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm93LCBhcHBseTogc29ydCAtLT4gZmlsdGVyIC0tPiBwYWdpbmF0aW9uICAgICAoIE9SREVSIE1BVFRFUlMhISEgKVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpdGhDaGFuZ2VzLnNvcnQpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RTb3J0ZWRTb3VyY2UgPSB0aGlzLmFwcGx5U29ydCh0aGlzLl9sYXN0U291cmNlLCBldmVudC5zb3J0LmN1cnIgfHwgZXZlbnQuc29ydC5wcmV2KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZGF0YTogVFtdID0gdGhpcy5fbGFzdFNvcnRlZFNvdXJjZTtcblxuICAgICAgICAgICAgICAgIC8vIHdlIGNoZWNrIGlmIGZpbHRlciB3YXMgYXNrZWQsIGJ1dCBhbHNvIGlmIHdlIGhhdmUgYSBmaWx0ZXIgd2UgcmUtcnVuXG4gICAgICAgICAgICAgICAgLy8gT25seSBzb3J0aW5nIGlzIGNhY2hlZCBhdCB0aGlzIHBvaW50IGZpbHRlcmluZyBpcyBhbHdheXMgY2FsY3VsYXRlZFxuICAgICAgICAgICAgICAgIGlmICh3aXRoQ2hhbmdlcy5maWx0ZXIgfHwgKCFjb25maWcuZmlsdGVyICYmIGV2ZW50LmZpbHRlci5jdXJyPy5maWx0ZXIpKSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5fbGFzdEZpbHRlcmVkU291cmNlID0gdGhpcy5hcHBseUZpbHRlcihkYXRhLCBldmVudC5maWx0ZXIuY3VyciB8fCBldmVudC5maWx0ZXIucHJldik7XG4gICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLnBhZ2luYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpdGhDaGFuZ2VzLmZpbHRlciB8fCAhd2l0aENoYW5nZXMucGFnaW5hdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQYWdpbmF0aW9uKGRhdGEubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aXRoQ2hhbmdlcy5wYWdpbmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5hcHBseVBhZ2luYXRpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY2xvbmVkRXZlbnQ6IFRFdmVudCA9IHsgLi4uZXZlbnQgfTtcblxuICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBgY29tYmluZUxhdGVzdGAgd2hpY2ggY2FjaGVzIHBlcnZpb3VzIGV2ZW50cywgb25seSBuZXcgZXZlbnRzIGFyZSByZXBsYWNlZC5cbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIG1hcmsgZXZlcnl0aGluZyBhcyBOT1QgQ0hBTkdFRCwgc28gc3Vic2VxdWVudCBjYWxscyB3aWxsIG5vdCBoYXZlIHRoZWlyIGNoYW5nZWQgZmxhZyBzZXQgdG8gdHJ1ZS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIFdlIGFsc28gY2xvbmUgdGhlIG9iamVjdCBzbyB3ZSBjYW4gcGFzcyBvbiB0aGUgcHJvcGVyIHZhbHVlcy5cbiAgICAgICAgICAgICAgICAvLyBXZSBjcmVhdGUgc2hhbGxvdyBjbG9uZXMgc28gY29tcGxleCBvYmplY3RzIChjb2x1bW4gaW4gc29ydCwgdXNlciBkYXRhIGluIGRhdGEpIHdpbGwgbm90IHRocm93IG9uIGNpcmN1bGFyLlxuICAgICAgICAgICAgICAgIC8vIEZvciBwYWdpbmF0aW9uIHdlIGRlZXAgY2xvbmUgYmVjYXVzZSBpdCBjb250YWlucyBwcmltaXRpdmVzIGFuZCB3ZSBuZWVkIHRvIGFsc28gY2xvbmUgdGhlIGludGVybmFsIGNoYW5nZSBvYmplY3RzLlxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBUUklHR0VSX0tFWVMpIHtcbiAgICAgICAgICAgICAgICAgIGNsb25lZEV2ZW50W2tdID0gayA9PT0gJ3BhZ2luYXRpb24nXG4gICAgICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShldmVudFtrXSkpXG4gICAgICAgICAgICAgICAgICAgIDogeyAuLi5ldmVudFtrXSB9XG4gICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICBldmVudFtrXS5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2luYXRpb24ucGFnZS5jaGFuZ2VkID0gZXZlbnQucGFnaW5hdGlvbi5wZXJQYWdlLmNoYW5nZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBldmVudDogY2xvbmVkRXZlbnQsXG4gICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgc29ydGVkOiB0aGlzLl9sYXN0U29ydGVkU291cmNlLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyZWQ6IHRoaXMuX2xhc3RGaWx0ZXJlZFNvdXJjZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgdGFwKCAoKSA9PiB0aGlzLm9uRW5kT2ZFdmVudChldmVudCkgKSxcbiAgICAgICAgICAgICAgLy8gSWYgcnVuSGFuZGxlKCkgcmV0dXJuZWQgZmFsc2UsIHdlIHdpbGwgZ2V0IHVuZGVmaW5lZCBoZXJlLCB3ZSBkbyBub3QgZW1pdCB0aGVzZSB0byB0aGUgZ3JpZCwgbm90aGluZyB0byBkby5cbiAgICAgICAgICAgICAgZmlsdGVyKCByID0+ICEhciApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFwcGx5RmlsdGVyKGRhdGE6IFRbXSwgZGF0YVNvdXJjZUZpbHRlcjogRGF0YVNvdXJjZUZpbHRlcik6IFRbXSB7XG4gICAgcmV0dXJuIGZpbHRlcmluZ0ZuKGRhdGEsIGRhdGFTb3VyY2VGaWx0ZXIpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFwcGx5U29ydChkYXRhOiBUW10sIGV2ZW50OiBQYmxOZ3JpZERhdGFTb3VyY2VTb3J0Q2hhbmdlKTogVFtdIHtcbiAgICByZXR1cm4gYXBwbHlTb3J0KGV2ZW50LmNvbHVtbiwgZXZlbnQuc29ydCwgZGF0YSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXBwbHlQYWdpbmF0aW9uKGRhdGE6IFRbXSk6ICBUW10ge1xuICAgIGlmICh0aGlzLnBhZ2luYXRvcikge1xuICAgICAgLy8gU2V0IHRoZSByZW5kZXJlZCByb3dzIGxlbmd0aCB0byB0aGUgdmlydHVhbCBwYWdlIHNpemUuIEZpbGwgaW4gdGhlIGRhdGEgcHJvdmlkZWRcbiAgICAgIC8vIGZyb20gdGhlIGluZGV4IHN0YXJ0IHVudGlsIHRoZSBlbmQgaW5kZXggb3IgcGFnaW5hdGlvbiBzaXplLCB3aGljaGV2ZXIgaXMgc21hbGxlci5cbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5wYWdpbmF0b3IucmFuZ2U7XG4gICAgICByZXR1cm4gZGF0YS5zbGljZShyYW5nZVswXSwgcmFuZ2VbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZXNldFBhZ2luYXRpb24odG90YWxMZW5ndGg6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLnBhZ2luYXRvcikge1xuICAgICAgdGhpcy5wYWdpbmF0b3IudG90YWwgPSB0b3RhbExlbmd0aDtcbiAgICAgIHRoaXMucGFnaW5hdG9yLnBhZ2UgPSB0b3RhbExlbmd0aCA+IDAgPyAxIDogMDtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgb25TdGFydE9mRXZlbnQoZXZlbnQ6IFRFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2luRmxpZ2h0LmFkZChldmVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb25FbmRPZkV2ZW50KGV2ZW50OiBURXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pbkZsaWdodC5kZWxldGUoZXZlbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGVtaXRPblNvdXJjZUNoYW5naW5nKGV2ZW50OiBURXZlbnQpIHtcbiAgICB0aGlzLl9vblNvdXJjZUNoYW5nZSQubmV4dChTT1VSQ0VfQ0hBTkdJTkdfVE9LRU4pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGVtaXRPblNvdXJjZUNoYW5nZWQoZXZlbnQ6IFRFdmVudCwgZGF0YTogVFtdKSB7XG4gICAgdGhpcy5fb25Tb3VyY2VDaGFuZ2UkLm5leHQoZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgdXNlci1wcm92aWRlZCBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGRhdGEgY29sbGVjdGlvbi5cbiAgICogVGhpcyBtZXRob2Qgd3JhcHMgZWFjaCBvZiB0aGUgdHJpZ2dlcnMgd2l0aCBhIGNvbnRhaW5lciBwcm92aWRpbmcgbWV0YWRhdGEgZm9yIHRoZSB0cmlnZ2VyLiAoT2xkIHZhbHVlLCB3YXMgY2hhbmdlZD8gYW5kIG5ldyB2YWx1ZSBpZiBjaGFuZ2VkKVxuICAgKiBUaGlzIGlzIHdoZXJlIGFsbCBjYWNoZSBsb2dpYyBpcyBtYW5hZ2VkIChjcmVhdGVDaGFuZ2VDb250YWluZXIpLlxuICAgKlxuICAgKiBUbyBidWlsZCBhIGRhdGEgY29sbGVjdGlvbiB0aGUgaW5mb3JtYXRpb24gZnJvbSBhbGwgdHJpZ2dlcnMgaXMgcmVxdWlyZWQsIGV2ZW4gaWYgaXQgd2FzIG5vdCBjaGFuZ2VkLlxuICAgKiBXaGVuIGEgdHJpZ2dlciBpcyBmaXJlZCB3aXRoIGEgbmV3IHZhbHVlIHRoZSBuZXcgdmFsdWUgcmVwbGFjZXMgdGhlIG9sZCB2YWx1ZSBmb3IgdGhlIHRyaWdnZXIgYW5kIGFsbCBvdGhlciB0cmlnZ2VycyB3aWxsIGtlZXAgdGhlaXIgb2xkIHZhbHVlLlxuICAgKiBTZW5kaW5nIHRoZSB0cmlnZ2VycyB0byB0aGUgaGFuZGxlcnMgaXMgbm90IGVub3VnaCwgd2UgYWxzbyBuZWVkIHRvIHRoZSBoYW5kbGVycyB3aGljaCBvZiB0aGUgdHJpZ2dlcidzIGhhdmUgY2hhbmdlIHNvIHRoZXkgY2FuIHJldHVyblxuICAgKiBkYXRhIHdpdGhvdXQgZG9pbmcgcmVkdW5kYW50IHdvcmsuXG4gICAqIEZvciBleGFtcGxlLCBmZXRjaGluZyBwYWdpbmF0ZWQgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIgcmVxdWlyZXMgYSBjYWxsIHdoZW5ldmVyIHRoZSBwYWdlcyBjaGFuZ2VzIGJ1dCBpZiB0aGUgZmlsdGVyaW5nIGlzIGxvY2FsIGZvciB0aGUgY3VycmVudCBwYWdlXG4gICAqIGFuZCB0aGUgZmlsdGVyIHRyaWdnZXIgaXMgZmlyZWQgdGhlIGhhbmRsZXIgbmVlZHMgdG8ga25vdyB0aGF0IHBhZ2luYXRpb24gZGlkIG5vdCBjaGFuZ2Ugc28gaXQgd2lsbCBub3QgZ28gYW5kIGZldGNoIGRhdGEgZnJvbSB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBUaGUgaGFuZGxlciBjYW4gcmV0dXJuIHNldmVyYWwgZGF0YSBzdHJ1Y3R1cmVzLCBvYnNlcnZhYmxlLCBwcm9taXNlLCBhcnJheSBvciBmYWxzZS5cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBub3JtYWxpemUgdGhlIHJlc3BvbnNlIGludG8gYW4gb2JzZXJ2YWJsZSBhbmQgbm90aWZ5IHRoYXQgdGhlIHNvdXJjZSBjaGFuZ2VkIChvblNvdXJjZUNoYW5nZWQpLlxuICAgKlxuICAgKiBXaGVuIHRoZSByZXNwb25zZSBpcyBmYWxzZSB0aGF0IGhhbmRsZXIgd2FudHMgdG8gc2tpcCB0aGlzIGN5Y2xlLCB0aGlzIG1lYW5zIHRoYXQgb25Tb3VyY2VDaGFuZ2VkIHdpbGwgbm90IGVtaXQgYW5kXG4gICAqIGEgZGVhZC1lbmQgb2JzZXJ2YWJsZSBpcyByZXR1cm5lZCAob2JzZXJ2YWJsZSB0aGF0IHdpbGwgbmV2ZXIgZW1pdCkuXG4gICAqL1xuICBwcml2YXRlIHJ1bkhhbmRsZShldmVudDogVEV2ZW50KTogT2JzZXJ2YWJsZTxmYWxzZSB8IFRbXT4ge1xuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zb3VyY2VGYWN0b3J5KGV2ZW50KTtcbiAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIG9mKGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXRPblNvdXJjZUNoYW5naW5nKGV2ZW50KTtcblxuICAgIGNvbnN0IG9iczogT2JzZXJ2YWJsZTxUW10+ID0gQXJyYXkuaXNBcnJheShyZXN1bHQpXG4gICAgICA/IG9mKHJlc3VsdClcbiAgICAgIC8vIGVsc2UgLT4gICAgICAgICAgICBvYnNlcnZhYmxlIDogcHJvbWlzZVxuICAgICAgOiAoaXNPYnNlcnZhYmxlKHJlc3VsdCkgPyByZXN1bHQgOiBmcm9tKHJlc3VsdCkpXG4gICAgICAgICAgLnBpcGUobWFwKCBkYXRhID0+IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW10gKSkgLy8gVE9ETzogc2hvdWxkIHdlIGVycm9yPyB3YXJuPyBub3RpZnk/XG4gICAgO1xuXG4gICAgcmV0dXJuIG9icy5waXBlKFxuICAgICAgb2JzZXJ2ZU9uKGFzYXBTY2hlZHVsZXIsIDApLCAvLyBydW4gYXMgYSBtaWNyby10YXNrXG4gICAgICB0YXAoIGRhdGEgPT4gdGhpcy5lbWl0T25Tb3VyY2VDaGFuZ2VkKGV2ZW50LCBkYXRhIGFzIFRbXSkgKSxcbiAgICApO1xuICB9XG59XG4iXX0=