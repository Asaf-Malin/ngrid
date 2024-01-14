import { Observable } from 'rxjs';
import { PblDataSourceAdapter, PblDataSourceConfigurableTriggers } from '@asafmalin/ngrid';
import { PblInfiniteScrollTriggerChangedEvent } from './infinite-scroll-datasource.types';
import { PblInfiniteScrollDSContext } from './infinite-scroll-datasource.context';
export declare class PblInfiniteScrollDataSourceAdapter<T = any, TData = any> extends PblDataSourceAdapter<T, TData, PblInfiniteScrollTriggerChangedEvent<TData>> {
    private context;
    readonly virtualRowsLoading: Observable<boolean>;
    constructor(context: PblInfiniteScrollDSContext<T, TData>, config: false | Partial<Record<keyof PblDataSourceConfigurableTriggers, boolean>>, onVirtualLoading: Observable<boolean>);
    dispose(): void;
    protected emitOnSourceChanging(event: PblInfiniteScrollTriggerChangedEvent<TData>): void;
}
