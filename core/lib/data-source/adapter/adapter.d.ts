import { Observable } from 'rxjs';
import { PblPaginator, PblPaginatorChangeEvent } from '../triggers/pagination/types';
import { DataSourceFilter } from '../triggers/filter';
import { PblNgridDataSourceSortChange } from '../triggers/sort';
import { PblDataSourceConfigurableTriggers, PblDataSourceTriggerCache, PblDataSourceTriggerChangedEvent, PblDataSourceAdapterProcessedResult, PblDataSourceTriggerChangeHandler } from './types';
/**
 * An adapter that handles changes
 */
export declare class PblDataSourceAdapter<T = any, TData = any, TEvent extends PblDataSourceTriggerChangedEvent<TData> = PblDataSourceTriggerChangedEvent<TData>> {
    sourceFactory: PblDataSourceTriggerChangeHandler<T, TEvent>;
    static hasCustomBehavior(config: Partial<Record<keyof PblDataSourceConfigurableTriggers, boolean>>): boolean;
    /** Returns true if the event is triggered from a custom behavior (filter, sort and/or pagination and the configuration allows it) */
    static isCustomBehaviorEvent(event: PblDataSourceTriggerChangedEvent, config: Partial<Record<keyof PblDataSourceConfigurableTriggers, boolean>>): boolean;
    readonly onSourceChanged: Observable<T[]>;
    readonly onSourceChanging: Observable<void>;
    get inFlight(): boolean;
    protected paginator?: PblPaginator<any>;
    private readonly config;
    private cache;
    private _onSourceChange$;
    private _refresh$;
    private _lastSource;
    private _lastSortedSource;
    private _lastFilteredSource;
    private _inFlight;
    private _inPreFlight;
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
    constructor(sourceFactory: PblDataSourceTriggerChangeHandler<T, TEvent>, config?: false | Partial<Record<keyof PblDataSourceConfigurableTriggers, boolean>>);
    dispose(): void;
    refresh(data?: TData): void;
    /**
     * Clears the cache from any existing datasource trigger such as filter, sort etc.
     * @returns The cached value or null if not there.
     */
    clearCache<P extends keyof PblDataSourceTriggerCache>(cacheKey: P): PblDataSourceTriggerCache<TData>[P] | null;
    setPaginator(paginator: PblPaginator<any> | undefined): void;
    updateProcessingLogic(filter$: Observable<DataSourceFilter>, sort$: Observable<PblNgridDataSourceSortChange & {
        skipUpdate: boolean;
    }>, pagination$: Observable<PblPaginatorChangeEvent>, initialState?: Partial<PblDataSourceTriggerCache<TData>>): Observable<PblDataSourceAdapterProcessedResult<T, TData>>;
    protected applyFilter(data: T[], dataSourceFilter: DataSourceFilter): T[];
    protected applySort(data: T[], event: PblNgridDataSourceSortChange): T[];
    protected applyPagination(data: T[]): T[];
    protected resetPagination(totalLength: number): void;
    protected onStartOfEvent(event: TEvent): void;
    protected onEndOfEvent(event: TEvent): void;
    protected emitOnSourceChanging(event: TEvent): void;
    protected emitOnSourceChanged(event: TEvent, data: T[]): void;
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
    private runHandle;
}
