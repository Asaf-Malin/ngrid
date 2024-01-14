import { PblDataSourceTriggerChangedEvent } from '@asafmalin/ngrid';
import { CacheBlock } from './caching';
import { PblInfiniteScrollDSContext } from './infinite-scroll-datasource.context';
import { PblInfiniteScrollDsOptions, PblInfiniteScrollTriggerChangedEvent } from './infinite-scroll-datasource.types';
export declare function normalizeOptions(rawOptions: PblInfiniteScrollDsOptions): PblInfiniteScrollDsOptions;
export declare function shouldTriggerInvisibleScroll<T, TData = any>(context: PblInfiniteScrollDSContext<T, TData>): boolean;
export declare function tryAddVirtualRowsBlock<T>(source: T[], event: PblInfiniteScrollTriggerChangedEvent<any>, blockSize: number): boolean;
export declare function upgradeChangeEventToInfinite<T, TData = any>(totalLength: number, event: PblDataSourceTriggerChangedEvent<TData>, blockMatch: CacheBlock): PblInfiniteScrollTriggerChangedEvent<TData>;
/**
 * Update the cache with new block information to reflect the last triggered event and
 * also update the datasource with the new values, removing values that are purged due to cache logic.
 * Returns the new datasource, or the original datasource editing in-place.
 *
 * For example, if the cache was empty the values provided are returned
 * Otherwise, the original datasource is edited and returned.
 */
export declare function updateCacheAndDataSource<T, TData = any>(context: PblInfiniteScrollDSContext<T, TData>, event: PblInfiniteScrollTriggerChangedEvent<TData>, values: T[]): T[];
