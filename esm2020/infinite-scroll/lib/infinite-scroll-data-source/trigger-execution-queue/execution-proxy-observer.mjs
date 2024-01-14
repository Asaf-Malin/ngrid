import { Observable, Subject } from 'rxjs';
// const LOG = msg => console.log(msg);
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
export class TriggerExecutionProxyObservable extends Observable {
    constructor(event, target) {
        super(subscriber => this.onSubscribe(subscriber));
        this.event = event;
        this.target = target;
        this.onKilled = new Subject();
        this.canLive = false;
        // LOG(`NEW[${event.id}]: ${event.fromRow} - ${event.toRow}`);
    }
    keepAlive() {
        this.canLive = true;
    }
    onSubscribe(subscriber) {
        this.subscriber = subscriber;
        if (!this.baseSubscription) {
            this.baseSubscription = this.target.subscribe({
                next: v => this.subscriber.next(v),
                error: e => {
                    this.error = e;
                    this.subscriber.error(e);
                },
                complete: () => {
                    this.completed = true;
                    this.subscriber.complete();
                },
            });
        }
        return () => this.tearDown();
    }
    tearDown() {
        if (!this.canLive || this.completed || this.error) {
            // LOG(`UNSUBSCRIBE${this.event.id}: ${this.event.fromRow} - ${this.event.toRow}`);
            this.baseSubscription.unsubscribe();
            this.onKilled.next();
            this.onKilled.complete();
        }
        else {
            // LOG(`REMOVE CREDIT${this.event.id}: ${this.event.fromRow} - ${this.event.toRow}`);
            this.canLive = false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0aW9uLXByb3h5LW9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9pbmZpbml0ZS1zY3JvbGwvc3JjL2xpYi9pbmZpbml0ZS1zY3JvbGwtZGF0YS1zb3VyY2UvdHJpZ2dlci1leGVjdXRpb24tcXVldWUvZXhlY3V0aW9uLXByb3h5LW9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQTRCLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUdyRSx1Q0FBdUM7QUFFdkM7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxPQUFPLCtCQUFtQyxTQUFRLFVBQWE7SUFTbkUsWUFBNkIsS0FBMkMsRUFDM0MsTUFBcUI7UUFDaEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRnZCLFVBQUssR0FBTCxLQUFLLENBQXNDO1FBQzNDLFdBQU0sR0FBTixNQUFNLENBQWU7UUFUekMsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFaEMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQVMvQiw4REFBOEQ7SUFDaEUsQ0FBQztJQUVELFNBQVM7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRU8sV0FBVyxDQUFDLFVBQXlCO1FBQzNDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTdCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUM1QyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8sUUFBUTtRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNqRCxtRkFBbUY7WUFDbkYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMxQjthQUFNO1lBQ0wscUZBQXFGO1lBQ3JGLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaWJlciwgU3Vic2NyaXB0aW9uLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQgfSBmcm9tICcuLi9pbmZpbml0ZS1zY3JvbGwtZGF0YXNvdXJjZS50eXBlcyc7XG5cbi8vIGNvbnN0IExPRyA9IG1zZyA9PiBjb25zb2xlLmxvZyhtc2cpO1xuXG4vKipcbiAqIEEgd3JhcHBlciBhcm91bmQgYW4gb24gdHJpZ2dlciBvYnNlcnZhYmxlIGNhbGwgdGhhdCB3aWxsIHByZXZlbnQgaXQgZnJvbVxuICogY2xvc2luZyBpZiBtYXJrZWQgdG8gZG8gc28gKGNhbGxpbmcgYGtlZXBBbGl2ZSgpYCkuXG4gKiBJZiBga2VlcEFsaXZlKClgIHdhcyBjYWxsZWQgYW5kIHRoZSBvYnNlcnZhYmxlIGhhcyBiZWVuIHVuc3Vic2NyaWJlZCB0aGUgdGVhcmRvd24gbG9naWNcbiAqIHdpbGwgbm90IHVuc3Vic2NyaWJlIGZyb20gdGhlIHVuZGVybHlpbmcgb24tdHJpZ2dlciBvYnNlcnZhYmxlLCBpdCB3aWxsIGxldCBpdCByb2xsIHVudGlsXG4gKiBmaW5pc2hlZCBvciBiZWluZyBraWxsZWQgYWdhaW4uXG4gKiBLZWVwIGFsaXZlIGlzIGEgdG9nZ2xlLCBpZiBcInVzZWRcIiBpdCBjYW4gbm90IGJlIHVzZWQgYWdhaW4gdW5sZXNzIGBrZWVwQWxpdmUoKWAgaXMgY2FsbGVkIGFnYWluLlxuICpcbiAqIFRoaXMgb2JzZXJ2YWJsZSBpcyB1c2VkIGludGVybmFsbHkgYnkgdGhlIGV4ZWN1dGlvbiBxdWV1ZSB0byBwcmV2ZW50IG9uLXRyaWdnZXIgY2FsbHMgZnJvbSBiZWluZyBpbnZva2VkIGFuZFxuICogY2FuY2VsbGVkIG11bHRpcGxlIHRpbWVzLlxuICogVGhpcyB1c3VhbGx5IGhhcHBlbiB3aGVuIHNjcm9sbGluZywgc2luY2UgdGhlIHNjcm9sbCBtaWdodCBub3QgYnJlYWsgdGhlIGN1cnJlbnQgcGFnZSBibG9jayBmZXRjaGVkLCB1bnRpbCBmZXRjaGVkXG4gKiBpdCB3aWxsIGtlZXAgYXNraW5nIGZvciBpdCwgaGVuY2UgdGhlIG5lZWQgdG8ga2VlcCBpdCBhbGl2ZS5cbiAqIEVhY2ggZXhlY3V0aW9uIG11c3QgcmV0dXJuIGFuIG9ic2VydmFibGUgb3IgaXQgd2lsbCBnZXQgY2FuY2VsZWQsIHNvIHdlIHJldHVybiB0aGUgY3VycmVudGx5IGV4ZWN1dGVkIHRyaWdnZXJcbiAqIGluc3RlYWQgb2YgcnVubmluZyBpdCBhZ2Fpbi4uLlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmlnZ2VyRXhlY3V0aW9uUHJveHlPYnNlcnZhYmxlPFQ+IGV4dGVuZHMgT2JzZXJ2YWJsZTxUPiB7XG4gIHJlYWRvbmx5IG9uS2lsbGVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBwcml2YXRlIGNhbkxpdmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBiYXNlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxUPjtcbiAgcHJpdmF0ZSBlcnJvcj86IGFueTtcbiAgcHJpdmF0ZSBjb21wbGV0ZWQ/OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZXZlbnQ6IFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSB0YXJnZXQ6IE9ic2VydmFibGU8VD4pIHtcbiAgICBzdXBlcihzdWJzY3JpYmVyID0+IHRoaXMub25TdWJzY3JpYmUoc3Vic2NyaWJlcikpO1xuICAgIC8vIExPRyhgTkVXWyR7ZXZlbnQuaWR9XTogJHtldmVudC5mcm9tUm93fSAtICR7ZXZlbnQudG9Sb3d9YCk7XG4gIH1cblxuICBrZWVwQWxpdmUoKSB7XG4gICAgdGhpcy5jYW5MaXZlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgb25TdWJzY3JpYmUoc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxUPikge1xuICAgIHRoaXMuc3Vic2NyaWJlciA9IHN1YnNjcmliZXI7XG5cbiAgICBpZiAoIXRoaXMuYmFzZVN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5iYXNlU3Vic2NyaXB0aW9uID0gdGhpcy50YXJnZXQuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogdiA9PiB0aGlzLnN1YnNjcmliZXIubmV4dCh2KSxcbiAgICAgICAgZXJyb3I6IGUgPT4ge1xuICAgICAgICAgIHRoaXMuZXJyb3IgPSBlO1xuICAgICAgICAgIHRoaXMuc3Vic2NyaWJlci5lcnJvcihlKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5zdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4gdGhpcy50ZWFyRG93bigpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZWFyRG93bigpIHtcbiAgICBpZiAoIXRoaXMuY2FuTGl2ZSB8fCB0aGlzLmNvbXBsZXRlZCB8fCB0aGlzLmVycm9yKSB7XG4gICAgICAvLyBMT0coYFVOU1VCU0NSSUJFJHt0aGlzLmV2ZW50LmlkfTogJHt0aGlzLmV2ZW50LmZyb21Sb3d9IC0gJHt0aGlzLmV2ZW50LnRvUm93fWApO1xuICAgICAgdGhpcy5iYXNlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLm9uS2lsbGVkLm5leHQoKTtcbiAgICAgIHRoaXMub25LaWxsZWQuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTE9HKGBSRU1PVkUgQ1JFRElUJHt0aGlzLmV2ZW50LmlkfTogJHt0aGlzLmV2ZW50LmZyb21Sb3d9IC0gJHt0aGlzLmV2ZW50LnRvUm93fWApO1xuICAgICAgdGhpcy5jYW5MaXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG59XG4iXX0=