import { PblInfiniteScrollCacheOptions } from './infinite-scroll-datasource.types';
import { StartOrEnd } from './caching';
import { PblInfiniteScrollDSContext } from './infinite-scroll-datasource.context';
export declare class PblInfiniteScrollDataSourceCache<T, TData = any> {
    private readonly context;
    get maxSize(): number;
    get size(): number;
    get empty(): boolean;
    private cacheAdapter;
    constructor(context: PblInfiniteScrollDSContext<T, TData>, options?: PblInfiniteScrollCacheOptions);
    setCacheSize(maxSize: number): void;
    matchNewBlock(): import("./caching").CacheBlock;
    createInitialBlock(): import("./caching").CacheBlock;
    update(startRow: number, endRow: number, direction: StartOrEnd): import("./caching").RowSequence[];
    clear(): import("./caching").RowSequence[];
}
