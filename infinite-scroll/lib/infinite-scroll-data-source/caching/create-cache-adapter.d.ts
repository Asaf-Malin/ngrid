import { PblInfiniteScrollDSContext } from '../infinite-scroll-datasource.context';
import { SequencedBlockCache } from './sequenced-block-cache';
import { FragmentedBlockCache } from './fragmented-block-cache';
import { PblInfiniteScrollCacheOptions } from '../infinite-scroll-datasource.types';
import { NoOpBlockCache } from './noop-cache';
export interface PblNgridCacheAdaptersMap {
    noOpCache: NoOpBlockCache;
    sequenceBlocks: SequencedBlockCache;
    fragmentedBlocks: FragmentedBlockCache;
}
export declare function createCacheAdapter(context: PblInfiniteScrollDSContext<any>, options: PblInfiniteScrollCacheOptions): NoOpBlockCache | SequencedBlockCache | FragmentedBlockCache;
