import { Observable } from 'rxjs';
/**
 * Emits the values emitted by the source observable until a kill signal is sent to the group.
 * You can also specify a `subKillGroup` which can be used to kill specific subscriptions within a group.
 *
 * When a `killGroup` is "killed" all `subKillGroup` are killed as well. When a `subKillGroup` is "killed" the group remains
 * as well as other "subKillGroup" registered for that group.
 *
 * > WARNING: Do not apply operators that subscribe internally (e.g. combineLatest, switchMap) after the `killOnDestroy` operator.
 * Internal subscriptions will not unsubscribe automatically.
 * For more information see {@link https://blog.angularindepth.com/rxjs-avoiding-takeuntil-leaks-fb5182d047ef | this blog post}
 */
export declare function unrx<T>(killGroup: any, subKillGroup?: any): (source: Observable<T>) => Observable<T>;
export declare namespace unrx {
    /**
     * Send a "kill" signal to the specified `killGroup`.
     * This will immediately unsubscribe all subscriptions with the `unrx` pipe registered under the specified `killGroup`.
     *
     * Note that the entire `killGroup` is destroyed.
     */
    function kill(killGroup: any): void;
    /**
     * Send a "kill" signal to a specific `subKillGroup` in the specified `killGroup`.
     * This will immediately unsubscribe all subscriptions with the `unrx` pipe registered under the specified `killGroup` and `subKillGroup`.
     *
     */
    function kill(killGroup: any, ...subKillGroup: any[]): void;
    /** {@inheritdoc unrx} */
    function pipe<T>(killGroup: any, subKillGroup?: any): (source: Observable<T>) => Observable<T>;
}
