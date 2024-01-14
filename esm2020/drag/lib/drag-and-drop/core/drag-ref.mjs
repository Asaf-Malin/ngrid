import { EventEmitter } from '@angular/core';
import { coerceElement } from '@angular/cdk/coercion';
import { DragRef } from '@angular/cdk/drag-drop';
import { PblDropListRef } from './drop-list-ref';
export class PblDragRef extends DragRef {
    constructor(...args) {
        super(...args);
        /**
         * Fires when the root element changes
         *
         * > Does not emit on the initial setup.
         */
        this.rootElementChanged = new EventEmitter();
        this.exited.subscribe(e => {
            const { container } = e;
            if (container instanceof PblDropListRef) {
                container.beforeExit.next({ item: this });
            }
        });
    }
    /**
     * Sets an alternate drag root element. The root element is the element that will be moved as
     * the user is dragging. Passing an alternate root element is useful when trying to enable
     * dragging on an element that you might not have access to.
     */
    withRootElement(rootElement) {
        // the first call to `withRootElement` comes from the base class, before we construct the emitter.
        // We don't need it anyway...
        if (this.rootElementChanged) {
            const element = coerceElement(rootElement);
            if (this.getRootElement() !== element) {
                this.rootElementChanged.next({ prev: this.getRootElement(), curr: element });
            }
        }
        return super.withRootElement(rootElement);
    }
    dispose() {
        this.rootElementChanged.complete();
        super.dispose();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9kcmFnLWFuZC1kcm9wL2NvcmUvZHJhZy1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWpELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVqRCxNQUFNLE9BQU8sVUFBb0IsU0FBUSxPQUFVO0lBU2pELFlBQVksR0FBRyxJQUEyQztRQUN4RCxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQVJqQjs7OztXQUlHO1FBQ0gsdUJBQWtCLEdBQUcsSUFBSSxZQUFZLEVBQTZDLENBQUM7UUFJakYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDekIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFJLFNBQVMsWUFBWSxjQUFjLEVBQUU7Z0JBQ3ZDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDM0M7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLFdBQWtEO1FBQ2hFLGtHQUFrRztRQUNsRyw2QkFBNkI7UUFDN0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLE9BQU8sRUFBRTtnQkFDckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7YUFDN0U7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBjb2VyY2VFbGVtZW50IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IERyYWdSZWYgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuaW1wb3J0IHsgUGJsRHJvcExpc3RSZWYgfSBmcm9tICcuL2Ryb3AtbGlzdC1yZWYnO1xuXG5leHBvcnQgY2xhc3MgUGJsRHJhZ1JlZjxUID0gYW55PiBleHRlbmRzIERyYWdSZWY8VD4ge1xuXG4gIC8qKlxuICAgKiBGaXJlcyB3aGVuIHRoZSByb290IGVsZW1lbnQgY2hhbmdlc1xuICAgKlxuICAgKiA+IERvZXMgbm90IGVtaXQgb24gdGhlIGluaXRpYWwgc2V0dXAuXG4gICAqL1xuICByb290RWxlbWVudENoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHsgcHJldjogSFRNTEVsZW1lbnQ7IGN1cnI6IEhUTUxFbGVtZW50OyB9PigpO1xuXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3M6IENvbnN0cnVjdG9yUGFyYW1ldGVyczx0eXBlb2YgRHJhZ1JlZj4pIHtcbiAgICBzdXBlciguLi5hcmdzKTtcbiAgICB0aGlzLmV4aXRlZC5zdWJzY3JpYmUoIGUgPT4ge1xuICAgICAgY29uc3QgeyBjb250YWluZXIgfSA9IGU7XG4gICAgICBpZiAoY29udGFpbmVyIGluc3RhbmNlb2YgUGJsRHJvcExpc3RSZWYpIHtcbiAgICAgICAgY29udGFpbmVyLmJlZm9yZUV4aXQubmV4dCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhbHRlcm5hdGUgZHJhZyByb290IGVsZW1lbnQuIFRoZSByb290IGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIG1vdmVkIGFzXG4gICAqIHRoZSB1c2VyIGlzIGRyYWdnaW5nLiBQYXNzaW5nIGFuIGFsdGVybmF0ZSByb290IGVsZW1lbnQgaXMgdXNlZnVsIHdoZW4gdHJ5aW5nIHRvIGVuYWJsZVxuICAgKiBkcmFnZ2luZyBvbiBhbiBlbGVtZW50IHRoYXQgeW91IG1pZ2h0IG5vdCBoYXZlIGFjY2VzcyB0by5cbiAgICovXG4gIHdpdGhSb290RWxlbWVudChyb290RWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4gfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgIC8vIHRoZSBmaXJzdCBjYWxsIHRvIGB3aXRoUm9vdEVsZW1lbnRgIGNvbWVzIGZyb20gdGhlIGJhc2UgY2xhc3MsIGJlZm9yZSB3ZSBjb25zdHJ1Y3QgdGhlIGVtaXR0ZXIuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCBpdCBhbnl3YXkuLi5cbiAgICBpZiAodGhpcy5yb290RWxlbWVudENoYW5nZWQpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBjb2VyY2VFbGVtZW50KHJvb3RFbGVtZW50KTtcbiAgICAgIGlmICh0aGlzLmdldFJvb3RFbGVtZW50KCkgIT09IGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudENoYW5nZWQubmV4dCh7IHByZXY6IHRoaXMuZ2V0Um9vdEVsZW1lbnQoKSwgY3VycjogZWxlbWVudCB9KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIud2l0aFJvb3RFbGVtZW50KHJvb3RFbGVtZW50KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5yb290RWxlbWVudENoYW5nZWQuY29tcGxldGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==