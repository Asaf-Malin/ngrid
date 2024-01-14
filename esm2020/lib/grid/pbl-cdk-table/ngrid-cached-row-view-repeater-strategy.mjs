import { Injectable } from '@angular/core';
import { PblNgridBaseRowViewRepeaterStrategy } from './ngrid-base-row-view-repeater-strategy';
import * as i0 from "@angular/core";
/**
 * This is a noop strategy that simply prevents the CDK from rendering cells for each row and instead the logic for it is now
 * handled within the row itself.
 *
 * This is very powerful and eliminate the need to use column declaration in strings.
 * Since we have a column store we can take it directly from there.
 *
 * Additionally, a temp fix for a bug is applied (see `workaroundEnabled`
 * Remove when and if PR https://github.com/angular/components/pull/20765 is accepted and the old version not supporting the solution is not supported by ngrid.
 */
export class PblNgridCachedRowViewRepeaterStrategy extends PblNgridBaseRowViewRepeaterStrategy {
    constructor() {
        super(...arguments);
        /**
         * The size of the cache used to store unused views.
         * Setting the cache size to `0` will disable caching. Defaults to 20 views.
         */
        this.viewCacheSize = 20;
        /**
         * View cache that stores embedded view instances that have been previously stamped out,
         * but don't are not currently rendered. The view repeater will reuse these views rather than
         * creating brand new ones.
         */
        this._viewCache = [];
    }
    detach() {
        for (const view of this._viewCache) {
            view.destroy();
        }
    }
    addItem(adjustedPreviousIndex, currentIndex, state) {
        /* Inserts a view for a new item, either from the cache or by creating a new one.
           Returns `undefined` if the item was inserted into a cached view. */
        state.view = this._insertViewFromCache(currentIndex, state.vcRef);
        if (state.view) {
            state.view.context.$implicit = state.itemValueResolver(state.record);
            state.op = 0 /* _ViewRepeaterOperation.REPLACED */;
        }
        else {
            state.view = state.createEmbeddedView(state.record, adjustedPreviousIndex, currentIndex);
            state.op = 1 /* _ViewRepeaterOperation.INSERTED */;
        }
    }
    removeItem(removeAt, state) {
        /** Detaches the view at the given index and inserts into the view cache. */
        const detachedView = this._detachView(removeAt, state.vcRef);
        this._maybeCacheView(detachedView, state.vcRef);
        state.op = 3 /* _ViewRepeaterOperation.REMOVED */;
    }
    moveItem(moveFrom, moveTo, state) {
        state.view = state.vcRef.get(moveFrom);
        state.vcRef.move(state.view, moveTo);
        state.view.context.$implicit = state.itemValueResolver(state.record);
        state.op = 2 /* _ViewRepeaterOperation.MOVED */;
    }
    /**
     * Cache the given detached view. If the cache is full, the view will be
     * destroyed.
     */
    _maybeCacheView(view, viewContainerRef) {
        if (this._viewCache.length < this.viewCacheSize) {
            this._viewCache.push(view);
            this.extApi.rowsApi.findRowByElement(view.rootNodes[0])._detach();
            // Notify this row is not part of the view, its cached (however, the component and any child component is not destroyed)
        }
        else {
            const index = viewContainerRef.indexOf(view);
            // The host component could remove views from the container outside of
            // the view repeater. It's unlikely this will occur, but just in case,
            // destroy the view on its own, otherwise destroy it through the
            // container to ensure that all the references are removed.
            if (index === -1) {
                view.destroy();
            }
            else {
                viewContainerRef.remove(index);
            }
        }
    }
    /** Inserts a recycled view from the cache at the given index. */
    _insertViewFromCache(index, viewContainerRef) {
        const cachedView = this._viewCache.pop();
        if (cachedView) {
            // Notify that the items is not longer cached, now live and playing the game
            this.extApi.rowsApi.findRowByElement(cachedView.rootNodes[0])._attach();
            viewContainerRef.insert(cachedView, index);
        }
        return cachedView || null;
    }
    /** Detaches the embedded view at the given index. */
    _detachView(index, viewContainerRef) {
        return viewContainerRef.detach(index);
    }
}
/** @nocollapse */ PblNgridCachedRowViewRepeaterStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridCachedRowViewRepeaterStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyaWQtY2FjaGVkLXJvdy12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvcGJsLWNkay10YWJsZS9uZ3JpZC1jYWNoZWQtcm93LXZpZXctcmVwZWF0ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFtQixVQUFVLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBSTlFLE9BQU8sRUFBd0IsbUNBQW1DLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQzs7QUFHcEg7Ozs7Ozs7OztHQVNHO0FBRUgsTUFBTSxPQUFPLHFDQUE2RixTQUFRLG1DQUE0QztJQUQ5Sjs7UUFHRTs7O1dBR0c7UUFDSCxrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUVuQjs7OztXQUlHO1FBQ0ssZUFBVSxHQUF5QixFQUFFLENBQUM7S0E0RS9DO0lBMUVDLE1BQU07UUFDSixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztJQUdTLE9BQU8sQ0FBQyxxQkFBb0MsRUFBRSxZQUEyQixFQUFFLEtBQW9DO1FBQ3RIOzhFQUNzRTtRQUN2RSxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JFLEtBQUssQ0FBQyxFQUFFLDBDQUFrQyxDQUFDO1NBQzVDO2FBQU07WUFDTCxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3pGLEtBQUssQ0FBQyxFQUFFLDBDQUFrQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVTLFVBQVUsQ0FBQyxRQUFnQixFQUFFLEtBQW9DO1FBQ3ZFLDRFQUE0RTtRQUM5RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELEtBQUssQ0FBQyxFQUFFLHlDQUFpQyxDQUFDO0lBQzVDLENBQUM7SUFFUyxRQUFRLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsS0FBb0M7UUFDdkYsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQXVCLENBQUM7UUFDN0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRSxLQUFLLENBQUMsRUFBRSx1Q0FBK0IsQ0FBQztJQUMxQyxDQUFDO0lBR0Q7OztPQUdHO0lBQ0ssZUFBZSxDQUFDLElBQXdCLEVBQUUsZ0JBQWtDO1FBQ2xGLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUMvQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEUsd0hBQXdIO1NBQ3pIO2FBQU07WUFDTCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0Msc0VBQXNFO1lBQ3RFLHNFQUFzRTtZQUN0RSxnRUFBZ0U7WUFDaEUsMkRBQTJEO1lBQzNELElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNoQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7aUJBQU07Z0JBQ0wsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsaUVBQWlFO0lBQ3pELG9CQUFvQixDQUFDLEtBQWEsRUFBRSxnQkFBa0M7UUFDNUUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QyxJQUFJLFVBQVUsRUFBRTtZQUNkLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sVUFBVSxJQUFJLElBQUksQ0FBQztJQUM1QixDQUFDO0lBRUQscURBQXFEO0lBQzdDLFdBQVcsQ0FBQyxLQUFhLEVBQUUsZ0JBQWtDO1FBQ25FLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBdUIsQ0FBQztJQUM5RCxDQUFDOztxSkF4RlUscUNBQXFDO3lKQUFyQyxxQ0FBcUM7MkZBQXJDLHFDQUFxQztrQkFEakQsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVtYmVkZGVkVmlld1JlZiwgSW5qZWN0YWJsZSwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgX1ZpZXdSZXBlYXRlckl0ZW1JbnNlcnRBcmdzLCBfVmlld1JlcGVhdGVyT3BlcmF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFJlbmRlclJvdyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmltcG9ydCB7IENoYW5nZU9wZXJhdGlvblN0YXRlLCBQYmxOZ3JpZEJhc2VSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneSB9IGZyb20gJy4vbmdyaWQtYmFzZS1yb3ctdmlldy1yZXBlYXRlci1zdHJhdGVneSc7XG5pbXBvcnQgeyBQYmxSb3dDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9yb3cnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBub29wIHN0cmF0ZWd5IHRoYXQgc2ltcGx5IHByZXZlbnRzIHRoZSBDREsgZnJvbSByZW5kZXJpbmcgY2VsbHMgZm9yIGVhY2ggcm93IGFuZCBpbnN0ZWFkIHRoZSBsb2dpYyBmb3IgaXQgaXMgbm93XG4gKiBoYW5kbGVkIHdpdGhpbiB0aGUgcm93IGl0c2VsZi5cbiAqXG4gKiBUaGlzIGlzIHZlcnkgcG93ZXJmdWwgYW5kIGVsaW1pbmF0ZSB0aGUgbmVlZCB0byB1c2UgY29sdW1uIGRlY2xhcmF0aW9uIGluIHN0cmluZ3MuXG4gKiBTaW5jZSB3ZSBoYXZlIGEgY29sdW1uIHN0b3JlIHdlIGNhbiB0YWtlIGl0IGRpcmVjdGx5IGZyb20gdGhlcmUuXG4gKlxuICogQWRkaXRpb25hbGx5LCBhIHRlbXAgZml4IGZvciBhIGJ1ZyBpcyBhcHBsaWVkIChzZWUgYHdvcmthcm91bmRFbmFibGVkYFxuICogUmVtb3ZlIHdoZW4gYW5kIGlmIFBSIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDc2NSBpcyBhY2NlcHRlZCBhbmQgdGhlIG9sZCB2ZXJzaW9uIG5vdCBzdXBwb3J0aW5nIHRoZSBzb2x1dGlvbiBpcyBub3Qgc3VwcG9ydGVkIGJ5IG5ncmlkLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRDYWNoZWRSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneTxULCBSIGV4dGVuZHMgUmVuZGVyUm93PFQ+LCBDIGV4dGVuZHMgUGJsUm93Q29udGV4dDxUPj4gZXh0ZW5kcyBQYmxOZ3JpZEJhc2VSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneTxULCBSLCBDPiB7XG5cbiAgLyoqXG4gICAqIFRoZSBzaXplIG9mIHRoZSBjYWNoZSB1c2VkIHRvIHN0b3JlIHVudXNlZCB2aWV3cy5cbiAgICogU2V0dGluZyB0aGUgY2FjaGUgc2l6ZSB0byBgMGAgd2lsbCBkaXNhYmxlIGNhY2hpbmcuIERlZmF1bHRzIHRvIDIwIHZpZXdzLlxuICAgKi9cbiAgdmlld0NhY2hlU2l6ZSA9IDIwO1xuXG4gIC8qKlxuICAgKiBWaWV3IGNhY2hlIHRoYXQgc3RvcmVzIGVtYmVkZGVkIHZpZXcgaW5zdGFuY2VzIHRoYXQgaGF2ZSBiZWVuIHByZXZpb3VzbHkgc3RhbXBlZCBvdXQsXG4gICAqIGJ1dCBkb24ndCBhcmUgbm90IGN1cnJlbnRseSByZW5kZXJlZC4gVGhlIHZpZXcgcmVwZWF0ZXIgd2lsbCByZXVzZSB0aGVzZSB2aWV3cyByYXRoZXIgdGhhblxuICAgKiBjcmVhdGluZyBicmFuZCBuZXcgb25lcy5cbiAgICovXG4gIHByaXZhdGUgX3ZpZXdDYWNoZTogRW1iZWRkZWRWaWV3UmVmPEM+W10gPSBbXTtcblxuICBkZXRhY2goKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB2aWV3IG9mIHRoaXMuX3ZpZXdDYWNoZSkge1xuICAgICAgdmlldy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cblxuICBwcm90ZWN0ZWQgYWRkSXRlbShhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsIGN1cnJlbnRJbmRleDogbnVtYmVyIHwgbnVsbCwgc3RhdGU6IENoYW5nZU9wZXJhdGlvblN0YXRlPFQsIFIsIEM+KSB7XG4gICAgIC8qIEluc2VydHMgYSB2aWV3IGZvciBhIG5ldyBpdGVtLCBlaXRoZXIgZnJvbSB0aGUgY2FjaGUgb3IgYnkgY3JlYXRpbmcgYSBuZXcgb25lLlxuICAgICAgICBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHRoZSBpdGVtIHdhcyBpbnNlcnRlZCBpbnRvIGEgY2FjaGVkIHZpZXcuICovXG4gICAgc3RhdGUudmlldyA9IHRoaXMuX2luc2VydFZpZXdGcm9tQ2FjaGUoY3VycmVudEluZGV4LCBzdGF0ZS52Y1JlZik7XG4gICAgaWYgKHN0YXRlLnZpZXcpIHtcbiAgICAgIHN0YXRlLnZpZXcuY29udGV4dC4kaW1wbGljaXQgPSBzdGF0ZS5pdGVtVmFsdWVSZXNvbHZlcihzdGF0ZS5yZWNvcmQpO1xuICAgICAgc3RhdGUub3AgPSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLlJFUExBQ0VEO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS52aWV3ID0gc3RhdGUuY3JlYXRlRW1iZWRkZWRWaWV3KHN0YXRlLnJlY29yZCwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xuICAgICAgc3RhdGUub3AgPSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLklOU0VSVEVEO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCByZW1vdmVJdGVtKHJlbW92ZUF0OiBudW1iZXIsIHN0YXRlOiBDaGFuZ2VPcGVyYXRpb25TdGF0ZTxULCBSLCBDPikge1xuICAgICAgLyoqIERldGFjaGVzIHRoZSB2aWV3IGF0IHRoZSBnaXZlbiBpbmRleCBhbmQgaW5zZXJ0cyBpbnRvIHRoZSB2aWV3IGNhY2hlLiAqL1xuICAgIGNvbnN0IGRldGFjaGVkVmlldyA9IHRoaXMuX2RldGFjaFZpZXcocmVtb3ZlQXQsIHN0YXRlLnZjUmVmKTtcbiAgICB0aGlzLl9tYXliZUNhY2hlVmlldyhkZXRhY2hlZFZpZXcsIHN0YXRlLnZjUmVmKTtcbiAgICBzdGF0ZS5vcCA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uUkVNT1ZFRDtcbiAgfVxuXG4gIHByb3RlY3RlZCBtb3ZlSXRlbShtb3ZlRnJvbTogbnVtYmVyLCBtb3ZlVG86IG51bWJlciwgc3RhdGU6IENoYW5nZU9wZXJhdGlvblN0YXRlPFQsIFIsIEM+KSB7XG4gICAgc3RhdGUudmlldyA9IHN0YXRlLnZjUmVmLmdldChtb3ZlRnJvbSkgYXMgRW1iZWRkZWRWaWV3UmVmPEM+O1xuICAgIHN0YXRlLnZjUmVmLm1vdmUoc3RhdGUudmlldywgbW92ZVRvKTtcbiAgICBzdGF0ZS52aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gc3RhdGUuaXRlbVZhbHVlUmVzb2x2ZXIoc3RhdGUucmVjb3JkKTtcbiAgICBzdGF0ZS5vcCA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uTU9WRUQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgZ2l2ZW4gZGV0YWNoZWQgdmlldy4gSWYgdGhlIGNhY2hlIGlzIGZ1bGwsIHRoZSB2aWV3IHdpbGwgYmVcbiAgICogZGVzdHJveWVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfbWF5YmVDYWNoZVZpZXcodmlldzogRW1iZWRkZWRWaWV3UmVmPEM+LCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdDYWNoZS5sZW5ndGggPCB0aGlzLnZpZXdDYWNoZVNpemUpIHtcbiAgICAgIHRoaXMuX3ZpZXdDYWNoZS5wdXNoKHZpZXcpO1xuICAgICAgdGhpcy5leHRBcGkucm93c0FwaS5maW5kUm93QnlFbGVtZW50KHZpZXcucm9vdE5vZGVzWzBdKS5fZGV0YWNoKCk7XG4gICAgICAvLyBOb3RpZnkgdGhpcyByb3cgaXMgbm90IHBhcnQgb2YgdGhlIHZpZXcsIGl0cyBjYWNoZWQgKGhvd2V2ZXIsIHRoZSBjb21wb25lbnQgYW5kIGFueSBjaGlsZCBjb21wb25lbnQgaXMgbm90IGRlc3Ryb3llZClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSB2aWV3Q29udGFpbmVyUmVmLmluZGV4T2Yodmlldyk7XG5cbiAgICAgIC8vIFRoZSBob3N0IGNvbXBvbmVudCBjb3VsZCByZW1vdmUgdmlld3MgZnJvbSB0aGUgY29udGFpbmVyIG91dHNpZGUgb2ZcbiAgICAgIC8vIHRoZSB2aWV3IHJlcGVhdGVyLiBJdCdzIHVubGlrZWx5IHRoaXMgd2lsbCBvY2N1ciwgYnV0IGp1c3QgaW4gY2FzZSxcbiAgICAgIC8vIGRlc3Ryb3kgdGhlIHZpZXcgb24gaXRzIG93biwgb3RoZXJ3aXNlIGRlc3Ryb3kgaXQgdGhyb3VnaCB0aGVcbiAgICAgIC8vIGNvbnRhaW5lciB0byBlbnN1cmUgdGhhdCBhbGwgdGhlIHJlZmVyZW5jZXMgYXJlIHJlbW92ZWQuXG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHZpZXcuZGVzdHJveSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZi5yZW1vdmUoaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBJbnNlcnRzIGEgcmVjeWNsZWQgdmlldyBmcm9tIHRoZSBjYWNoZSBhdCB0aGUgZ2l2ZW4gaW5kZXguICovXG4gIHByaXZhdGUgX2luc2VydFZpZXdGcm9tQ2FjaGUoaW5kZXg6IG51bWJlciwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZik6IEVtYmVkZGVkVmlld1JlZjxDPiB8IG51bGwge1xuICAgIGNvbnN0IGNhY2hlZFZpZXcgPSB0aGlzLl92aWV3Q2FjaGUucG9wKCk7XG4gICAgaWYgKGNhY2hlZFZpZXcpIHtcbiAgICAgIC8vIE5vdGlmeSB0aGF0IHRoZSBpdGVtcyBpcyBub3QgbG9uZ2VyIGNhY2hlZCwgbm93IGxpdmUgYW5kIHBsYXlpbmcgdGhlIGdhbWVcbiAgICAgIHRoaXMuZXh0QXBpLnJvd3NBcGkuZmluZFJvd0J5RWxlbWVudChjYWNoZWRWaWV3LnJvb3ROb2Rlc1swXSkuX2F0dGFjaCgpO1xuICAgICAgdmlld0NvbnRhaW5lclJlZi5pbnNlcnQoY2FjaGVkVmlldywgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gY2FjaGVkVmlldyB8fCBudWxsO1xuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoZSBlbWJlZGRlZCB2aWV3IGF0IHRoZSBnaXZlbiBpbmRleC4gKi9cbiAgcHJpdmF0ZSBfZGV0YWNoVmlldyhpbmRleDogbnVtYmVyLCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICByZXR1cm4gdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaW5kZXgpIGFzIEVtYmVkZGVkVmlld1JlZjxDPjtcbiAgfVxufVxuIl19