import { Injectable, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DragDropRegistry } from '@angular/cdk/drag-drop';
import { PblDragRef } from './drag-ref';
import { PblDropListRef } from './drop-list-ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/cdk/drag-drop";
/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
    dragStartThreshold: 5,
    pointerDirectionChangeThreshold: 5
};
/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
export class PblDragDrop {
    constructor(_document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
    }
    /**
     * Turns an element into a draggable item.
     * @param element Element to which to attach the dragging functionality.
     * @param config Object used to configure the dragging behavior.
     */
    createDrag(element, config = DEFAULT_CONFIG) {
        return new PblDragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry);
    }
    /**
     * Turns an element into a drop list.
     * @param element Element to which to attach the drop list functionality.
     */
    createDropList(element) {
        return new PblDropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
    }
}
/** @nocollapse */ PblDragDrop.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, deps: [{ token: DOCUMENT }, { token: i0.NgZone }, { token: i1.ViewportRuler }, { token: i2.DragDropRegistry }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblDragDrop.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone }, { type: i1.ViewportRuler }, { type: i2.DragDropRegistry }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb3JlL2RyYWctZHJvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQWMsTUFBTSxlQUFlLENBQUM7QUFDdkUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQXVDLGdCQUFnQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFL0YsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUN2QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFakQsa0VBQWtFO0FBQ2xFLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLGtCQUFrQixFQUFFLENBQUM7SUFDckIsK0JBQStCLEVBQUUsQ0FBQztDQUNuQyxDQUFDO0FBRUY7O0dBRUc7QUFFSCxNQUFNLE9BQU8sV0FBVztJQUN0QixZQUF3QyxTQUFjLEVBQ2hDLE9BQWUsRUFDZixjQUE2QixFQUM3QixpQkFBeUQ7UUFIdkMsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUNoQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUF3QztJQUFHLENBQUM7SUFFbkY7Ozs7T0FJRztJQUNILFVBQVUsQ0FBVSxPQUE4QyxFQUM5QyxTQUF3QixjQUFjO1FBQ3hELE9BQU8sSUFBSSxVQUFVLENBQUksT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2SCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsY0FBYyxDQUFVLE9BQThDO1FBQ3BFLE9BQU8sSUFBSSxjQUFjLENBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ25ILENBQUM7OzJIQXRCVSxXQUFXLGtCQUNGLFFBQVE7K0hBRGpCLFdBQVcsY0FEQyxNQUFNOzJGQUNsQixXQUFXO2tCQUR2QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBRWpCLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCwgTmdab25lLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7IERyYWdSZWYsIERyYWdSZWZDb25maWcsIERyb3BMaXN0UmVmLCBEcmFnRHJvcFJlZ2lzdHJ5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2RyYWctZHJvcCc7XG5cbmltcG9ydCB7IFBibERyYWdSZWYgfSBmcm9tICcuL2RyYWctcmVmJ1xuaW1wb3J0IHsgUGJsRHJvcExpc3RSZWYgfSBmcm9tICcuL2Ryb3AtbGlzdC1yZWYnO1xuXG4vKiogRGVmYXVsdCBjb25maWd1cmF0aW9uIHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyBhIGBEcmFnUmVmYC4gKi9cbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xuICBkcmFnU3RhcnRUaHJlc2hvbGQ6IDUsXG4gIHBvaW50ZXJEaXJlY3Rpb25DaGFuZ2VUaHJlc2hvbGQ6IDVcbn07XG5cbi8qKlxuICogU2VydmljZSB0aGF0IGFsbG93cyBmb3IgZHJhZy1hbmQtZHJvcCBmdW5jdGlvbmFsaXR5IHRvIGJlIGF0dGFjaGVkIHRvIERPTSBlbGVtZW50cy5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUGJsRHJhZ0Ryb3Age1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcm90ZWN0ZWQgX2RvY3VtZW50OiBhbnksXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfbmdab25lOiBOZ1pvbmUsXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIF9kcmFnRHJvcFJlZ2lzdHJ5OiBEcmFnRHJvcFJlZ2lzdHJ5PERyYWdSZWYsIERyb3BMaXN0UmVmPikge31cblxuICAvKipcbiAgICogVHVybnMgYW4gZWxlbWVudCBpbnRvIGEgZHJhZ2dhYmxlIGl0ZW0uXG4gICAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gd2hpY2ggdG8gYXR0YWNoIHRoZSBkcmFnZ2luZyBmdW5jdGlvbmFsaXR5LlxuICAgKiBAcGFyYW0gY29uZmlnIE9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZHJhZ2dpbmcgYmVoYXZpb3IuXG4gICAqL1xuICBjcmVhdGVEcmFnPFQgPSBhbnk+KGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBEcmFnUmVmQ29uZmlnID0gREVGQVVMVF9DT05GSUcpOiBQYmxEcmFnUmVmPFQ+IHtcbiAgICByZXR1cm4gbmV3IFBibERyYWdSZWY8VD4oZWxlbWVudCwgY29uZmlnLCB0aGlzLl9kb2N1bWVudCwgdGhpcy5fbmdab25lLCB0aGlzLl92aWV3cG9ydFJ1bGVyLCB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUdXJucyBhbiBlbGVtZW50IGludG8gYSBkcm9wIGxpc3QuXG4gICAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gd2hpY2ggdG8gYXR0YWNoIHRoZSBkcm9wIGxpc3QgZnVuY3Rpb25hbGl0eS5cbiAgICovXG4gIGNyZWF0ZURyb3BMaXN0PFQgPSBhbnk+KGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQpOiBQYmxEcm9wTGlzdFJlZjxUPiB7XG4gICAgcmV0dXJuIG5ldyBQYmxEcm9wTGlzdFJlZjxUPihlbGVtZW50LCB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LCB0aGlzLl9kb2N1bWVudCwgdGhpcy5fbmdab25lLCB0aGlzLl92aWV3cG9ydFJ1bGVyKTtcbiAgfVxufVxuIl19