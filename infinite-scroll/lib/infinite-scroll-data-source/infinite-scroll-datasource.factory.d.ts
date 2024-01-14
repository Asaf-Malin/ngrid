import { PblDataSourceBaseFactory, PblDataSourceAdapter } from '@asafmalin/ngrid/core';
import { PblInfiniteScrollDsOptions, PblInfiniteScrollTriggerChangedEvent } from './infinite-scroll-datasource.types';
import { PblInfiniteScrollDataSource } from './infinite-scroll-datasource';
import { PblInfiniteScrollDataSourceAdapter } from './infinite-scroll-datasource-adapter';
import { PblNgridCacheAdapter, PblNgridCacheAdaptersMap } from './caching';
export declare class PblInfiniteScrollDSFactory<T, TData = any> extends PblDataSourceBaseFactory<T, TData, PblInfiniteScrollTriggerChangedEvent<TData>, PblInfiniteScrollDataSourceAdapter<T, TData>, PblInfiniteScrollDataSource<T, TData>> {
    private infiniteScrollOptions;
    private cacheOptions;
    private context;
    withInfiniteScrollOptions(options: PblInfiniteScrollDsOptions): this;
    withCacheOptions<P extends keyof PblNgridCacheAdaptersMap>(type: P, options?: PblNgridCacheAdaptersMap[P] extends PblNgridCacheAdapter<infer U> ? U : never): this;
    create(): PblInfiniteScrollDataSource<T, TData>;
    protected createAdapter(): PblInfiniteScrollDataSourceAdapter<T, TData>;
    protected createDataSource(adapter: PblDataSourceAdapter<T, TData, PblInfiniteScrollTriggerChangedEvent<TData>>): PblInfiniteScrollDataSource<T, TData>;
}
export declare function createInfiniteScrollDS<T, TData = T[]>(): PblInfiniteScrollDSFactory<T, TData>;
