import { PblInfiniteScrollDSContext } from '../../infinite-scroll-datasource.context';
import { CacheAdapterOptions, CacheBlock, PblNgridCacheAdapter, RowSequence, StartOrEnd } from '../cache-adapter';
export interface FragmentedBlockCacheOptions extends CacheAdapterOptions {
    /**
     * When set to true the cache will force the blocks to align perfectly, where no event can be fired with rows
     * that overlap any other pervious or future event unless they overlap fully.
     * For example, if the block size is 50 and "strictPaging" is true the events will include fromRow, toRows: [0, 49] [50, 99] .... [300, 349]
     * If 'strictPaging is false you might get the above but might also get [73, 122] etc...
     * @default false
     */
    strictPaging?: boolean;
}
/**
 * A Caching strategy that enforces storing cache rows in blocks where
 *
 *  - All blocks have the same predefined size (configurable)
 *  - A block contains items in a sequence (I.E A block is a page)
 *
 * In Addition, the cache is limited by size (configurable).
 * When items are added or when maximum size is updated the cache will auto-purge items
 * that cause overflow.
 *
 * Beside overflow, not other logic can perform automatic purging.
 *
 * This is best for grid's that use a datasource with an index based pagination (skip/limit) and
 */
export declare class FragmentedBlockCache implements PblNgridCacheAdapter<FragmentedBlockCacheOptions> {
    private readonly context;
    get maxSize(): number;
    get size(): number;
    get empty(): boolean;
    readonly options: FragmentedBlockCacheOptions;
    private _maxSize;
    private coldLocation;
    private fragments;
    private lastStartRow;
    private lastDir;
    constructor(context: PblInfiniteScrollDSContext<any>, options?: FragmentedBlockCacheOptions);
    remove(startRow: number, count: number): RowSequence[];
    /**
     * Set the new max size for this cache.
     * @returns When new max size is bigger the old & current size violates the new max size, return the number of items trimmed from the cache
     * with positive value if trimmed from end, negative value if trimmed from start. Otherwise returns 0.
     */
    setCacheSize(maxSize: number): RowSequence[];
    update(startRow: number, endRow: number, direction: StartOrEnd): RowSequence[];
    clear(): RowSequence[];
    createBlock(startIndex: number, endIndex: number, totalLength?: number): CacheBlock | undefined;
    private matchBlock;
    private add;
    private oversize;
    private alignBoundary;
}
