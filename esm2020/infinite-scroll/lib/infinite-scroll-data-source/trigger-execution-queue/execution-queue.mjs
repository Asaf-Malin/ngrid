import { from, isObservable, of } from 'rxjs';
import { TriggerExecutionProxyObservable } from './execution-proxy-observer';
// const LOG = msg => console.log(msg);
/**
 * Execute a data source trigger based on infinite trigger change events provided.
 * Each time an execution starts the event is compared to already in-process event that were executed and did not yet finish.
 * If the event overlaps with an existing event, it will not execute.
 * Events overlap when the event to be executed has a range that is contained with any other in-flight event.
 */
export class TriggerExecutionQueue {
    constructor(handler) {
        this.handler = handler;
        this.slots = 2;
        this.runningEvents = new Map();
    }
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
    execute(event, fallbackToOverlap = false) {
        const overlap = this.checkOverlap(event);
        if (!!overlap) {
            if (fallbackToOverlap) {
                overlap.keepAlive();
                return overlap;
            }
            return false;
        }
        // LOG(`EXECUTING HANDLER: ${event.fromRow} - ${event.toRow}`);
        const result = this.handler(event);
        if (result === false) {
            return false;
        }
        const triggerResult = Array.isArray(result)
            ? of(result)
            : isObservable(result)
                ? result
                : from(result);
        // LOG(`CREATE[${event.id}]: ${event.fromRow} - ${event.toRow}`);
        const obs = new TriggerExecutionProxyObservable(event, triggerResult);
        obs.onKilled.subscribe(() => this.runningEvents.delete(event));
        this.runningEvents.set(event, obs);
        return obs;
    }
    checkOverlap(event) {
        for (const [e, v] of this.runningEvents.entries()) {
            if (event.fromRow >= e.fromRow && event.toRow <= e.toRow) {
                // LOG(`OVERLAPPED: ${event.fromRow} - ${event.toRow}`);
                return v;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0aW9uLXF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9pbmZpbml0ZS1zY3JvbGwvc3JjL2xpYi9pbmZpbml0ZS1zY3JvbGwtZGF0YS1zb3VyY2UvdHJpZ2dlci1leGVjdXRpb24tcXVldWUvZXhlY3V0aW9uLXF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFjLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUcxRCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU3RSx1Q0FBdUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8scUJBQXFCO0lBTWhDLFlBQTZCLE9BQTBGO1FBQTFGLFlBQU8sR0FBUCxPQUFPLENBQW1GO1FBSmhILFVBQUssR0FBRyxDQUFDLENBQUM7UUFFVCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFxRixDQUFDO0lBRU0sQ0FBQztJQUU1SDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILE9BQU8sQ0FBQyxLQUFrRCxFQUFFLGlCQUFpQixHQUFHLEtBQUs7UUFDbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDYixJQUFJLGlCQUFpQixFQUFFO2dCQUNyQixPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sT0FBTyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELCtEQUErRDtRQUMvRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksTUFBTSxLQUFLLEtBQUssRUFBRTtZQUNwQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBR0QsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDekMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDWixDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLE1BQU07Z0JBQ1IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDakI7UUFFRCxpRUFBaUU7UUFDakUsTUFBTSxHQUFHLEdBQUcsSUFBSSwrQkFBK0IsQ0FBTSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDM0UsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRU8sWUFBWSxDQUFDLEtBQWtEO1FBQ3JFLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2pELElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDeEQsd0RBQXdEO2dCQUN4RCxPQUFPLENBQUMsQ0FBQzthQUNWO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tLCBpc09ic2VydmFibGUsIE9ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZUhhbmRsZXIgfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudCB9IGZyb20gJy4uL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLnR5cGVzJztcbmltcG9ydCB7IFRyaWdnZXJFeGVjdXRpb25Qcm94eU9ic2VydmFibGUgfSBmcm9tICcuL2V4ZWN1dGlvbi1wcm94eS1vYnNlcnZlcic7XG5cbi8vIGNvbnN0IExPRyA9IG1zZyA9PiBjb25zb2xlLmxvZyhtc2cpO1xuXG4vKipcbiAqIEV4ZWN1dGUgYSBkYXRhIHNvdXJjZSB0cmlnZ2VyIGJhc2VkIG9uIGluZmluaXRlIHRyaWdnZXIgY2hhbmdlIGV2ZW50cyBwcm92aWRlZC5cbiAqIEVhY2ggdGltZSBhbiBleGVjdXRpb24gc3RhcnRzIHRoZSBldmVudCBpcyBjb21wYXJlZCB0byBhbHJlYWR5IGluLXByb2Nlc3MgZXZlbnQgdGhhdCB3ZXJlIGV4ZWN1dGVkIGFuZCBkaWQgbm90IHlldCBmaW5pc2guXG4gKiBJZiB0aGUgZXZlbnQgb3ZlcmxhcHMgd2l0aCBhbiBleGlzdGluZyBldmVudCwgaXQgd2lsbCBub3QgZXhlY3V0ZS5cbiAqIEV2ZW50cyBvdmVybGFwIHdoZW4gdGhlIGV2ZW50IHRvIGJlIGV4ZWN1dGVkIGhhcyBhIHJhbmdlIHRoYXQgaXMgY29udGFpbmVkIHdpdGggYW55IG90aGVyIGluLWZsaWdodCBldmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyaWdnZXJFeGVjdXRpb25RdWV1ZTxULCBURGF0YSA9IGFueT4ge1xuXG4gIHB1YmxpYyBzbG90cyA9IDI7XG5cbiAgcHJpdmF0ZSBydW5uaW5nRXZlbnRzID0gbmV3IE1hcDxQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQ8VERhdGE+LCBUcmlnZ2VyRXhlY3V0aW9uUHJveHlPYnNlcnZhYmxlPFRbXT4+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBoYW5kbGVyOiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZUhhbmRsZXI8VCwgUGJsSW5maW5pdGVTY3JvbGxUcmlnZ2VyQ2hhbmdlZEV2ZW50PFREYXRhPj4pIHsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGFuIGV2ZW50IGFuZCBrZWVwIHRyYWNrIG9mIGl0IHVudGlsIGV4ZWN1dGlvbiBpcyBkb25lLlxuICAgKiBCZWZvcmUgZXhlY3V0aW9uLCBjaGVjayBpZiBvbmUgb2YgdGhlIGV2ZW50cyBjdXJyZW50bHkgaW4gZXhlY3V0aW9uLCBjb250YWlucyB0aGUgcHJvdmlkZWQgZXZlbnQuXG4gICAqIElmIHNvLCB0aGUgZXhlY3V0aW9uIGlzIHdpbGwgbm90IGdvIHRocm91Z2guXG4gICAqIEV2ZW50IGNvbnRhaW5zIGFub3RoZXIgZXZlbnQgb25seSBpZiB0aGUgcmFuZ2UgKGZyb20vdG8pIG9mIHRoZSBvdGhlciBldmVudCBpcyB3aXRoaW4gdGhlIGJvdW5kYXJpZXMgb2YgaXQncyBvd24gcmFuZ2UuXG4gICAqIEZvciBleGFtcGxlLCB0aGUgZXZlbnQgZnJvbSByb3cgNTAgdG8gcm93IDEwMCBjb250YWlucyB0aGUgZXZlbnQgZnJvbSByb3cgNzAgdG8gcm93IDEwMCBidXQgaXQgZG9lcyBub3QgY29udGFpblxuICAgKiB0aGUgZXZlbnQgZnJvbSByb3cgNDkgdG8gcm93IDUwLlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIGZhbGxiYWNrVG9PdmVybGFwIFdoZW4gdHJ1ZSAoYW5kIHRoZW4gYSBjb250YWluaW5nIGV2ZW50IGlzIGZvdW5kKSwgd2lsbCBzaWduYWwgdGhlIGNvbnRhaW5pbmcgZXZlbnQgdG9cbiAgICogdGhhdCBhbiBldmVudCB3aXRoIGEgc2V0IG9yIGFsbCBpdGVtcyBpdCBpcyBmZXRjaGluZyB0cnlpbmcgdG8gZXhlY3V0ZSBhZ2FpbiBidXQgd2FzIGRlbmllZCBhbmQgaXQgd2lsbCBhbHNvXG4gICAqIHJldHVybiBpdCdzIGN1cnJlbnRseSBydW5uaW5nIG9ic2VydmFibGUuXG4gICAqIER1ZSB0byBob3cgdGhlIGRhdGFzb3VyY2Ugd29ya3MsIGl0IHdpbGwgdHJ5IHRvIHVuc3Vic2NyaWJlL2NhbmNlbCB0aGUgY3VycmVudGx5IHJ1bm5pbmcgb2JzZXJ2YWJsZSBhbmQgc3Vic2NyaWJlXG4gICAqIHRvIHRoZSByZXR1cm5lZCBvYnNlcnZhYmxlICh3aGljaCBpcyB0aGUgc2FtZSksIGJ5IHNpZ25hbGluZyB3ZSBhbGxvdyB0aGUgcnVubmluZyBvYnNlcnZhYmxlIHRvIHByZXZlbnQgY2xvc2luZyB0aGVcbiAgICogcnVubmluZyBjYWxsIGFuZCByZW1haW4gaW4gZmFjdCB3ZSdyZSBtYWtpbmcgaXQgXCJob3RcIiBmb3IgcGVyaW9kIG9mIHRpbWUgc28gaXQgd2lsbCBub3QgY2FuY2VsIGFueSBydW5uaW5nIGNhbGwuXG4gICAqL1xuICBleGVjdXRlKGV2ZW50OiBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQ8VERhdGE+LCBmYWxsYmFja1RvT3ZlcmxhcCA9IGZhbHNlKTogZmFsc2UgfCBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIGNvbnN0IG92ZXJsYXAgPSB0aGlzLmNoZWNrT3ZlcmxhcChldmVudCk7XG4gICAgaWYgKCEhb3ZlcmxhcCkge1xuICAgICAgaWYgKGZhbGxiYWNrVG9PdmVybGFwKSB7XG4gICAgICAgIG92ZXJsYXAua2VlcEFsaXZlKCk7XG4gICAgICAgIHJldHVybiBvdmVybGFwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIExPRyhgRVhFQ1VUSU5HIEhBTkRMRVI6ICR7ZXZlbnQuZnJvbVJvd30gLSAke2V2ZW50LnRvUm93fWApO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuaGFuZGxlcihldmVudCk7XG4gICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cblxuICAgIGNvbnN0IHRyaWdnZXJSZXN1bHQgPSBBcnJheS5pc0FycmF5KHJlc3VsdClcbiAgICAgID8gb2YocmVzdWx0KVxuICAgICAgOiBpc09ic2VydmFibGUocmVzdWx0KVxuICAgICAgICA/IHJlc3VsdFxuICAgICAgICA6IGZyb20ocmVzdWx0KVxuICAgIDtcblxuICAgIC8vIExPRyhgQ1JFQVRFWyR7ZXZlbnQuaWR9XTogJHtldmVudC5mcm9tUm93fSAtICR7ZXZlbnQudG9Sb3d9YCk7XG4gICAgY29uc3Qgb2JzID0gbmV3IFRyaWdnZXJFeGVjdXRpb25Qcm94eU9ic2VydmFibGU8VFtdPihldmVudCwgdHJpZ2dlclJlc3VsdCk7XG4gICAgb2JzLm9uS2lsbGVkLnN1YnNjcmliZSgoKSA9PiB0aGlzLnJ1bm5pbmdFdmVudHMuZGVsZXRlKGV2ZW50KSk7XG5cbiAgICB0aGlzLnJ1bm5pbmdFdmVudHMuc2V0KGV2ZW50LCBvYnMpO1xuXG4gICAgcmV0dXJuIG9icztcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tPdmVybGFwKGV2ZW50OiBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQ8VERhdGE+KSB7XG4gICAgZm9yIChjb25zdCBbZSwgdl0gb2YgdGhpcy5ydW5uaW5nRXZlbnRzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGV2ZW50LmZyb21Sb3cgPj0gZS5mcm9tUm93ICYmIGV2ZW50LnRvUm93IDw9IGUudG9Sb3cpIHtcbiAgICAgICAgLy8gTE9HKGBPVkVSTEFQUEVEOiAke2V2ZW50LmZyb21Sb3d9IC0gJHtldmVudC50b1Jvd31gKTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=