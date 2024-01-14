import { PblDataSource } from './data-source';
import { PblDataSourceAdapter } from './adapter/adapter';
import { PblDataSourceBaseFactory } from './base/factory';
export declare class PblDataSourceFactory<T, TData = any> extends PblDataSourceBaseFactory<T, TData> {
    protected createAdapter(): PblDataSourceAdapter<T, TData>;
    protected createDataSource(adapter: PblDataSourceAdapter<T, TData>): PblDataSource<T, TData>;
}
export declare function createDS<T, TData = T[]>(): PblDataSourceFactory<T, TData>;
