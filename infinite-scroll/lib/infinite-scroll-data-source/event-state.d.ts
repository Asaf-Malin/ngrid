import { Observable } from 'rxjs';
import { PblInfiniteScrollTriggerChangedEvent } from './infinite-scroll-datasource.types';
/**
 * @internal
 */
export declare class EventState<T> {
    readonly event: PblInfiniteScrollTriggerChangedEvent;
    private done;
    private notFull;
    constructor(event?: PblInfiniteScrollTriggerChangedEvent);
    isDone(): boolean;
    rangeEquals(event: PblInfiniteScrollTriggerChangedEvent): boolean;
    /**
     * When true is returned, the handling of `PblDataSource.onRenderedDataChanged` should be skipped.
     * Usually, the event state will keep track of the returned value and check if the length of items returned covers
     * the total length required by the event. Only when not enough items have been returned, the returned value will be true.
     * Once true is returned, it will toggle back to false, i.e. it will tell you to skip once only.
     */
    skipNextRender(): boolean;
    pipe(): (o: Observable<T[]>) => Observable<T[]>;
}
