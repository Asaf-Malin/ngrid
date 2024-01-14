import { RefreshDataWrapper, PblDataSourceTriggerChange, PblDataSourceTriggers, PblDataSourceTriggerCache, TriggerChangedEventFor } from './types';
export declare const EMPTY: any;
/** @internal */
export declare type DEEP_COMPARATORS<K extends keyof PblDataSourceTriggerCache> = {
    [P in K]?: (prev: PblDataSourceTriggerCache[P], curr: PblDataSourceTriggerCache[P]) => boolean;
};
export declare const DEEP_COMPARATORS: DEEP_COMPARATORS<keyof PblDataSourceTriggerCache>;
export declare function fromRefreshDataWrapper<T>(change: PblDataSourceTriggerChange<RefreshDataWrapper<T>>): PblDataSourceTriggerChange<T>;
export declare type CoValue<P extends keyof PblDataSourceTriggerCache> = P extends keyof PblDataSourceTriggers ? PblDataSourceTriggers[P] : PblDataSourceTriggerCache[P];
export declare function createChangeContainer<P extends keyof PblDataSourceTriggerCache>(type: P, value: CoValue<P>, cache: PblDataSourceTriggerCache): TriggerChangedEventFor<P>;
