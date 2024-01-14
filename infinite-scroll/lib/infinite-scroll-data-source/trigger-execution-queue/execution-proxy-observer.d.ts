import { Observable, Subject } from 'rxjs';
import { PblInfiniteScrollTriggerChangedEvent } from '../infinite-scroll-datasource.types';
/**
 * A wrapper around an on trigger observable call that will prevent it from
 * closing if marked to do so (calling `keepAlive()`).
 * If `keepAlive()` was called and the observable has been unsubscribed the teardown logic
 * will not unsubscribe from the underlying on-trigger observable, it will let it roll until
 * finished or being killed again.
 * Keep alive is a toggle, if "used" it can not be used again unless `keepAlive()` is called again.
 *
 * This observable is used internally by the execution queue to prevent on-trigger calls from being invoked and
 * cancelled multiple times.
 * This usually happen when scrolling, since the scroll might not break the current page block fetched, until fetched
 * it will keep asking for it, hence the need to keep it alive.
 * Each execution must return an observable or it will get canceled, so we return the currently executed trigger
 * instead of running it again...
 * @internal
 */
export declare class TriggerExecutionProxyObservable<T> extends Observable<T> {
    private readonly event;
    private readonly target;
    readonly onKilled: Subject<void>;
    private canLive;
    private baseSubscription;
    private subscriber;
    private error?;
    private completed?;
    constructor(event: PblInfiniteScrollTriggerChangedEvent, target: Observable<T>);
    keepAlive(): void;
    private onSubscribe;
    private tearDown;
}
