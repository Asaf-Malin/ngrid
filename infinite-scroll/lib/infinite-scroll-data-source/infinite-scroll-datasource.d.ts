import { PblDataSource, PblDataSourceOptions, PblNgridRowContext } from '@pebula/ngrid';
import { PblInfiniteScrollDSContext } from './infinite-scroll-datasource.context';
import { PblInfiniteScrollDataSourceAdapter } from './infinite-scroll-datasource-adapter';
import { PblInfiniteScrollTriggerChangedEvent } from './infinite-scroll-datasource.types';
export declare class PblInfiniteScrollDataSource<T = any, TData = any> extends PblDataSource<T, TData, PblInfiniteScrollTriggerChangedEvent<TData>, PblInfiniteScrollDataSourceAdapter<T, TData>> {
    private readonly context;
    get maxCacheSize(): number;
    get cacheSize(): number;
    constructor(context: PblInfiniteScrollDSContext<T, TData>, options?: PblDataSourceOptions);
    setCacheSize(maxSize: number): void;
    purgeCache(): void;
    isVirtualRow(row: any): boolean;
    isVirtualContext(context: PblNgridRowContext<any>): boolean;
    /**
     * Update the size of the datasource to reflect a virtual size.
     * This will extend the scrollable size of the grid.
     *
     * > Note that you can only add to the size, if the current size is larger than the new size nothing will happen.
     */
    updateVirtualSize(newSize: number): void;
    static updateVirtualSize(newSize: number, values: any[]): void;
}
