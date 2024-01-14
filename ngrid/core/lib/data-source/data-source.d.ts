import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { PblNgridEventEmitter } from '../events/events';
import { PblColumnDefinition } from '../models/column';
import { PblNgridPaginatorKind, PblPaginator } from './triggers/pagination';
import { DataSourcePredicate, DataSourceFilter } from './triggers/filter';
import { PblNgridSortDefinition, PblNgridDataSourceSortChange } from './triggers/sort';
import { PblDataSourceAdapter, PblDataSourceTriggerChangedEvent } from './adapter';
export interface PblDataSourceOptions {
    /**
     * When set to True will not disconnect upon table disconnection, otherwise does.
     */
    keepAlive?: boolean;
    /**
     * Skip the first trigger emission.
     * Use this for late binding, usually with a call to refresh() on the data source.
     *
     * Note that only the internal trigger call is skipped, a custom calls to refresh will go through
     */
    skipInitial?: boolean;
}
export declare class PblDataSource<T = any, TData = any, TEvent extends PblDataSourceTriggerChangedEvent<TData> = PblDataSourceTriggerChangedEvent<TData>, TDataSourceAdapter extends PblDataSourceAdapter<T, TData, TEvent> = PblDataSourceAdapter<T, TData, TEvent>> extends DataSource<T> {
    get pagination(): PblNgridPaginatorKind | false;
    set pagination(value: PblNgridPaginatorKind | false);
    /**
     * An observable that emit events when an new incoming source is expected, before calling the trigger handler to get the new source.
     * This even is usually followed by the `onSourceChanged` event but not always. This is because the trigger handler
     * can cancel the operation (when it returns false) which means an `onSourceChanged` event will not fire.
     *
     * Emissions occur when the trigger handler is invoked and also when the trigger handler returned an observable and the observable emits.
     *
     * > Note that a micro-task delays is applied between the `onSourceChanging` subsequent `onSourceChanged` event (when emitted).
     */
    readonly onSourceChanging: Observable<void>;
    /**
     * An observable that emit events when a new source has been received from the trigger handler but before any processing is applied.
     * Emissions occur when the trigger handler is invoked and also when the trigger handler returned an observable and the observable emits.
     *
     * Examples: Calling `refresh()`, filter / sort / pagination events.
     *
     * > Note that the `onSourceChanged` fired before the data is rendered ane before any client-side filter/sort/pagination are applied.
     * It only indicates that the source data-set is now updated and the grid is about to apply logic on the data-set and then render it.
     */
    readonly onSourceChanged: Observable<void>;
    /**
     * An observable that emit events when new source has been received from the trigger handler and after it was processed.
     * Emissions will occur after `onSourceChanged` event has been fired.
     *
     * The main difference between `onSourceChanged` and `onRenderDataChanging` is local processing performed in the datasource.
     * These are usually client-side operations like filter/sort/pagination. If all of these events are handled manually (custom)
     * in the trigger handler then `onSourceChanged` and `onRenderDataChanging` have no difference.
     *
     * > Note that `onRenderDataChanging` and `onRenderedDataChanged` are not closely related as `onRenderedDataChanged` fires at
     * a much more rapid pace (virtual scroll). The name `onRenderDataChanging` might change in the future.
     */
    readonly onRenderDataChanging: Observable<{
        event: PblDataSourceTriggerChangedEvent<TData>;
        data: T[];
    }>;
    /**
     * An observable that emit events when the grid is about to render data.
     * The rendered data is updated when the source changed or when the grid is in virtual scroll mode and the user is scrolling.
     *
     * Each emission reflects a change in the data that the grid is rendering.
     */
    readonly onRenderedDataChanged: Observable<void>;
    readonly onError: Observable<Error>;
    /**
     * An event that fires when the connection state to a table has changed.
     */
    readonly tableConnectionChange: Observable<boolean>;
    readonly sortChange: Observable<PblNgridDataSourceSortChange>;
    /**
     * When set to True will not disconnect upon table disconnection, otherwise unsubscribe from the
     * datasource when the table disconnects.
     */
    readonly keepAlive: boolean;
    /**
     * Skip the first trigger emission.
     * Use this for late binding, usually with a call to refresh() on the data source.
     *
     * Note that only the internal trigger call is skipped, a custom calls to refresh will go through
     */
    readonly skipInitial: boolean;
    get adapter(): TDataSourceAdapter;
    set adapter(value: TDataSourceAdapter);
    /** Returns the starting index of the rendered data */
    get renderStart(): number;
    get renderLength(): number;
    get renderedData(): T[];
    /**
     * The `source` with sorting applied.
     * Valid only when sorting is performed client-side.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The sorted data is updated just before `onRenderDataChanging` fire.
     */
    get sortedData(): T[];
    /**
     * The `source` with filtering applied.
     * Valid only when filtering is performed client-side.
     * If sorting is applied as well, the filtered results are also sorted.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The filtered data is updated just before `onRenderDataChanging` fire.
     */
    get filteredData(): T[];
    get filter(): DataSourceFilter;
    get sort(): PblNgridDataSourceSortChange;
    get paginator(): PblPaginator<any>;
    get length(): number;
    get source(): T[];
    /** Represents selected items on the data source. */
    get selection(): SelectionModel<T>;
    protected readonly _selection: SelectionModel<T>;
    protected readonly _tableConnectionChange$: Subject<boolean>;
    protected readonly _onRenderDataChanging: Subject<{
        event: PblDataSourceTriggerChangedEvent<TData>;
        data: T[];
    }>;
    protected readonly _renderData$: BehaviorSubject<T[]>;
    protected readonly _filter$: BehaviorSubject<DataSourceFilter>;
    protected readonly _sort$: BehaviorSubject<PblNgridDataSourceSortChange & {
        skipUpdate: boolean;
    }>;
    protected _onError$: Subject<Error>;
    protected _paginator: PblPaginator<any>;
    private _pagination;
    private _adapter;
    private _source;
    private _disposed;
    private _tableConnected;
    private _lastRefresh;
    private _lastRange;
    private _lastAdapterEvent;
    private _eventEmitter;
    constructor(adapter: TDataSourceAdapter, options?: PblDataSourceOptions);
    /**
     * A custom trigger that invokes a manual data source change with the provided data value in the `data` property at tht event.
     */
    refresh(data?: TData): void;
    /**
     * Clear the filter definition for the current data set.
     */
    setFilter(): void;
    /**
     * Set the filter definition for the current data set using a function predicate.
     *
     * > Note that when using a custom predicate function all logic is passed to the predicate and the datasource / grid does not handle the filtering process.
     * This means that any column specific filter, set in the column definitions is ignored, if you want to take these filters into consideration
     * use the column instance provided to identify and use these filters (the `filter` property in `PblColumn`).
     */
    setFilter(value: DataSourcePredicate, columns?: PblColumnDefinition[]): void;
    /**
     * Set the filter definition for the current data set using a value to compare with and a list of columns with the values to compare to.
     *
     * When a column instance has a specific predicate set (`PblColumn.filter`) then it will be used, otherwise
     * the `genericColumnPredicate` will be used.
     */
    setFilter(value: any, columns: PblColumnDefinition[]): void;
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
    syncFilter(): void;
    /**
     * Clear the current sort definitions.
     * @param skipUpdate When true will not update the datasource, use this when the data comes sorted and you want to sync the definitions with the current data set.
     * default to false.
     */
    setSort(skipUpdate?: boolean): void;
    /**
     * Set the sorting definition for the current data set.
     * @param column
     * @param sort
     * @param skipUpdate When true will not update the datasource, use this when the data comes sorted and you want to sync the definitions with the current data set.
     * default to false.
     */
    setSort(column: PblColumnDefinition, sort: PblNgridSortDefinition, skipUpdate?: boolean): void;
    dispose(): void;
    disconnect(cv: CollectionViewer): void;
    connect(cv: CollectionViewer): Observable<T[]>;
    /**
     * Move's an item (in the entire source) from one index to the other, pushing the item in the destination one item backwards.
     *
     * Note that if the rendered data is a subset of the entire source (i.e virtual scroll & range) the indices are considered
     * local to the rendered view and are translated to fit the entire source.
     *
     * Tp disable this behavior, set the `absolute` parameter to `true`
     */
    moveItem(fromIndex: number, toIndex: number, absolute?: boolean): void;
    _attachEmitter(emitter: PblNgridEventEmitter): void;
    _detachEmitter(): void;
    private _updateProcessingLogic;
}
