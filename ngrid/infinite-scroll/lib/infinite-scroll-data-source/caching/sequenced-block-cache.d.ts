import { PblInfiniteScrollDSContext } from '../infinite-scroll-datasource.context';
import { CacheAdapterOptions, CacheBlock, PblNgridCacheAdapter, RowSequence, StartOrEnd } from './cache-adapter';
/**
 * A Caching strategy that enforces storing cache rows in blocks where
 *
 *  - All blocks have the same predefined size (configurable)
 *  - A block contains items in a sequence (I.E A block is a page)
 *  - Each block must continue a sequence from the last block.
 *
 * In Addition, the cache is limited by size (configurable).
 * When items are added or when maximum size is updated the cache will auto-purge items
 * that cause overflow.
 *
 * If items are added which breaks the current sequence the entire cache is purged automatically.
 *
 * This is best for grid's that use a datasource with page based pagination.
 * While the user scrolls, each next item is most often the next block in sequence.
 *
 * Note that when pre-defining the virtual size to the total amount of rows will allow the user
 * to fast scroll which might break the sequence, skipping a block or more, thus purging the entire cache.
 */
export declare class SequencedBlockCache implements PblNgridCacheAdapter<CacheAdapterOptions> {
    private readonly context;
    end: number;
    start: number;
    get maxSize(): number;
    get size(): number;
    get empty(): boolean;
    readonly options: CacheAdapterOptions;
    private _maxSize;
    private lastAdd;
    constructor(context: PblInfiniteScrollDSContext<any>, options?: CacheAdapterOptions);
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
    private oversize;
    private isSibling;
    private add;
    /**
     * Align the cache to fix max size.
     * @returns the number of items trimmed from the cache with positive value if trimmed from end, negative value if trimmed from start.
    */
    private alignBoundary;
}
