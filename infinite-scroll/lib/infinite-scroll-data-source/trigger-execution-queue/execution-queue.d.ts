import { Observable } from 'rxjs';
import { PblDataSourceTriggerChangeHandler } from '@pebula/ngrid';
import { PblInfiniteScrollTriggerChangedEvent } from '../infinite-scroll-datasource.types';
/**
 * Execute a data source trigger based on infinite trigger change events provided.
 * Each time an execution starts the event is compared to already in-process event that were executed and did not yet finish.
 * If the event overlaps with an existing event, it will not execute.
 * Events overlap when the event to be executed has a range that is contained with any other in-flight event.
 */
export declare class TriggerExecutionQueue<T, TData = any> {
    private readonly handler;
    slots: number;
    private runningEvents;
    constructor(handler: PblDataSourceTriggerChangeHandler<T, PblInfiniteScrollTriggerChangedEvent<TData>>);
    /**
     * Execute an event and keep track of it until execution is done.
     * Before execution, check if one of the events currently in execution, contains the provided event.
     * If so, the execution is will not go through.
     * Event contains another event only if the range (from/to) of the other event is within the boundaries of it's own range.
     * For example, the event from row 50 to row 100 contains the event from row 70 to row 100 but it does not contain
     * the event from row 49 to row 50.
     * @param event
     * @param fallbackToOverlap When true (and then a containing event is found), will signal the containing event to
     * that an event with a set or all items it is fetching trying to execute again but was denied and it will also
     * return it's currently running observable.
     * Due to how the datasource works, it will try to unsubscribe/cancel the currently running observable and subscribe
     * to the returned observable (which is the same), by signaling we allow the running observable to prevent closing the
     * running call and remain in fact we're making it "hot" for period of time so it will not cancel any running call.
     */
    execute(event: PblInfiniteScrollTriggerChangedEvent<TData>, fallbackToOverlap?: boolean): false | Observable<T[]>;
    private checkOverlap;
}
