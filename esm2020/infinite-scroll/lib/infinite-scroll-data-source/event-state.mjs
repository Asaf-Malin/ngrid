import { tap } from 'rxjs/operators';
/**
 * @internal
 */
export class EventState {
    constructor(event = null) {
        this.event = event;
    }
    isDone() {
        return this.done;
    }
    rangeEquals(event) {
        return event.fromRow === this.event.fromRow && event.toRow === this.event.toRow;
    }
    /**
     * When true is returned, the handling of `PblDataSource.onRenderedDataChanged` should be skipped.
     * Usually, the event state will keep track of the returned value and check if the length of items returned covers
     * the total length required by the event. Only when not enough items have been returned, the returned value will be true.
     * Once true is returned, it will toggle back to false, i.e. it will tell you to skip once only.
     */
    skipNextRender() {
        if (this.notFull) {
            this.notFull = false;
            return true;
        }
        return false;
    }
    pipe() {
        return (o) => {
            return o.pipe(tap(values => {
                this.done = true;
                this.notFull = values.length < this.event.offset;
            }));
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2luZmluaXRlLXNjcm9sbC9zcmMvbGliL2luZmluaXRlLXNjcm9sbC1kYXRhLXNvdXJjZS9ldmVudC1zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHckM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUlyQixZQUE0QixRQUE4QyxJQUFJO1FBQWxELFVBQUssR0FBTCxLQUFLLENBQTZDO0lBQUksQ0FBQztJQUduRixNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBMkM7UUFDckQsT0FBTyxLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDbEYsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsY0FBYztRQUNaLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsSUFBSTtRQUNGLE9BQU8sQ0FBQyxDQUFrQixFQUFFLEVBQUU7WUFDNUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNYLEdBQUcsQ0FBRSxNQUFNLENBQUMsRUFBRTtnQkFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ25ELENBQUMsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQgfSBmcm9tICcuL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLnR5cGVzJztcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50U3RhdGU8VD4ge1xuICBwcml2YXRlIGRvbmU6IGJvb2xlYW47XG4gIHByaXZhdGUgbm90RnVsbDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgZXZlbnQ6IFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudCA9IG51bGwpIHsgfVxuXG5cbiAgaXNEb25lKCkge1xuICAgIHJldHVybiB0aGlzLmRvbmU7XG4gIH1cblxuICByYW5nZUVxdWFscyhldmVudDogUGJsSW5maW5pdGVTY3JvbGxUcmlnZ2VyQ2hhbmdlZEV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LmZyb21Sb3cgPT09IHRoaXMuZXZlbnQuZnJvbVJvdyAmJiBldmVudC50b1JvdyA9PT0gdGhpcy5ldmVudC50b1JvdztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRydWUgaXMgcmV0dXJuZWQsIHRoZSBoYW5kbGluZyBvZiBgUGJsRGF0YVNvdXJjZS5vblJlbmRlcmVkRGF0YUNoYW5nZWRgIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKiBVc3VhbGx5LCB0aGUgZXZlbnQgc3RhdGUgd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSByZXR1cm5lZCB2YWx1ZSBhbmQgY2hlY2sgaWYgdGhlIGxlbmd0aCBvZiBpdGVtcyByZXR1cm5lZCBjb3ZlcnNcbiAgICogdGhlIHRvdGFsIGxlbmd0aCByZXF1aXJlZCBieSB0aGUgZXZlbnQuIE9ubHkgd2hlbiBub3QgZW5vdWdoIGl0ZW1zIGhhdmUgYmVlbiByZXR1cm5lZCwgdGhlIHJldHVybmVkIHZhbHVlIHdpbGwgYmUgdHJ1ZS5cbiAgICogT25jZSB0cnVlIGlzIHJldHVybmVkLCBpdCB3aWxsIHRvZ2dsZSBiYWNrIHRvIGZhbHNlLCBpLmUuIGl0IHdpbGwgdGVsbCB5b3UgdG8gc2tpcCBvbmNlIG9ubHkuXG4gICAqL1xuICBza2lwTmV4dFJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5ub3RGdWxsKSB7XG4gICAgICB0aGlzLm5vdEZ1bGwgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwaXBlKCkge1xuICAgIHJldHVybiAobzogT2JzZXJ2YWJsZTxUW10+KSA9PiB7XG4gICAgICByZXR1cm4gby5waXBlKFxuICAgICAgICB0YXAoIHZhbHVlcyA9PiB7XG4gICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLm5vdEZ1bGwgPSB2YWx1ZXMubGVuZ3RoIDwgdGhpcy5ldmVudC5vZmZzZXQ7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==