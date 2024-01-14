import { PblDataSourceTriggerChangedEvent, DataSourceOf } from '@pebula/ngrid/core';
import { PblInfiniteScrollFactoryOptions, PblInfiniteScrollDsOptions } from './infinite-scroll-datasource.types';
import { PblInfiniteScrollDataSourceCache } from './infinite-scroll-datasource.cache';
import { PblInfiniteScrollDataSource } from './infinite-scroll-datasource';
import { PblInfiniteScrollDataSourceAdapter } from './infinite-scroll-datasource-adapter';
declare module '@pebula/ngrid/core/lib/data-source/adapter/types' {
    interface PblDataSourceTriggerChangedEventSource {
        /**
         * The source of the event was from a scroll that reached into a group of rows that the grid needs to fetch.
         */
        infiniteScroll: true;
    }
}
export declare class PblInfiniteScrollDSContext<T, TData = any> {
    private factoryOptions;
    options: PblInfiniteScrollDsOptions;
    totalLength: number;
    cache: PblInfiniteScrollDataSourceCache<T, TData>;
    private ds;
    private adapter;
    private currentSessionToken;
    private queue;
    private onVirtualLoading;
    private virtualLoadingSessions;
    private pendingTrigger$;
    private customTriggers;
    private timeoutCancelTokens;
    private ignoreScrolling;
    private lastEventState;
    constructor(factoryOptions: PblInfiniteScrollFactoryOptions<T, TData>);
    onTrigger(rawEvent: PblDataSourceTriggerChangedEvent<TData>): false | DataSourceOf<T>;
    getAdapter(): PblInfiniteScrollDataSourceAdapter<T, TData>;
    getDataSource(): PblInfiniteScrollDataSource<T, TData>;
    dispose(): void;
    /**
     * This is where we detect if we need to internally invoke a trigger because we've reached an area
     * in the grid where row's does not exists but we show the dummy row, hence we need to fetch them.
     * The grid will never trigger an event here since from the grid's perspective a row is showing...
     * This detection also handle's scrolling and session so we don't invoke the trigger to much.
     */
    private onRenderedDataChanged;
    /**
     * Create a new event state for the given event, store it in the lastEventState property
     * and returns a pipe that will sync the state of the event as the call progress.
     * @param event
     */
    private wrapEventState;
    private deferSyncRows;
    private safeAsyncOp;
    private tickVirtualLoading;
    private handleScrolling;
    private invokeInitialOnTrigger;
    private invokeRuntimeOnTrigger;
    private tryGetInfiniteEvent;
}
