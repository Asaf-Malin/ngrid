import { animationFrameScheduler, Subscription } from 'rxjs';
import { auditTime, take } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, Optional, NgZone, ViewEncapsulation } from '@angular/core';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DragDropRegistry, CDK_DRAG_CONFIG } from '@angular/cdk/drag-drop';
import { isPblColumn, PblNgridPluginController } from '@pebula/ngrid';
import { toggleNativeDragInteractions } from './cdk-encapsulated-code';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/cdk/drag-drop";
export const COL_RESIZE_PLUGIN_KEY = 'columnResize';
/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false });
export class PblNgridDragResizeComponent {
    constructor(element, _ngZone, _viewportRuler, _dragDropRegistry, _config) {
        this.element = element;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
        this._config = _config;
        /**
         * The area (in pixels) in which the handle can be grabbed and resize the cell.
         * Default: 6
         */
        this.grabAreaWidth = 6;
        this._pointerMoveSubscription = Subscription.EMPTY;
        this._pointerUpSubscription = Subscription.EMPTY;
        this._rootElementInitSubscription = Subscription.EMPTY;
        this._pointerDown = (event) => {
            this._initializeDragSequence(this._rootElement, event);
        };
        /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
        this._pointerMove = (event) => {
            const pointerPosition = this._getPointerPositionOnPage(event);
            const distanceX = pointerPosition.x - this._pickupPositionOnPage.x;
            const distanceY = pointerPosition.y - this._pickupPositionOnPage.y;
            if (!this._hasStartedDragging) {
                // Only start dragging after the user has moved more than the minimum distance in either
                // direction. Note that this is preferable over doing something like `skip(minimumDistance)`
                // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                // per pixel of movement (e.g. if the user moves their pointer quickly).
                if (Math.abs(distanceX) + Math.abs(distanceY) >= this._config.dragStartThreshold) {
                    this._hasStartedDragging = true;
                    // It will be a good thing if we turned of the header's resize observer to boost performance
                    // However, because we relay on the total grid minimum width updates to relatively even out the columns it will not work.
                    // Group cells will not cover all of the children, when we enlarge the width of a child in the group.
                    // This is because the max-width of the group is set proportional to the total min-width of the inner grid.
                    // For it to work we need to directly update the width of ALL OF THE GROUPS.
                    // this.column.columnDef.isDragging = true;
                    this.column.sizeInfo.updateSize();
                    this._lastWidth = this._initialWidth = this.column.columnDef.netWidth;
                }
                return;
            }
            this._hasMoved = true;
            event.preventDefault();
            event.stopPropagation();
            const dir = this._extApi.getDirection() === 'rtl' ? -1 : 1;
            let newWidth = Math.max(0, this._initialWidth + (distanceX * dir));
            if (newWidth > this.column.maxWidth) {
                newWidth = this.column.maxWidth;
            }
            else if (distanceX < 0 && newWidth < this.column.minWidth) {
                newWidth = this.column.minWidth;
            }
            if (this._lastWidth !== newWidth) {
                this._lastWidth = newWidth;
                this.column.updateWidth(`${newWidth}px`);
                this._extApi.widthCalc.resetColumnsWidth();
                // `this.column.updateWidth` will update the grid width cell only, which will trigger a resize that will update all other cells
                // `this.grid.resetColumnsWidth()` will re-adjust all other grid width cells, and if their size changes they will trigger the resize event...
            }
        };
        /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
        this._pointerUp = () => {
            if (!this.isDragging()) {
                return;
            }
            this._removeSubscriptions();
            this._dragDropRegistry.stopDragging(this);
            if (!this._hasStartedDragging) {
                return;
            }
            // this.column.columnDef.isDragging = false;
            this.grid.columnApi.resizeColumn(this.column, this._lastWidth + 'px');
        };
        this._config = {
            dragStartThreshold: _config && _config.dragStartThreshold != null ? _config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: _config && _config.pointerDirectionChangeThreshold != null ? _config.pointerDirectionChangeThreshold : 5,
            zIndex: _config?.zIndex
        };
        _dragDropRegistry.registerDragItem(this);
    }
    // tslint:disable-next-line:no-input-rename
    set context(value) {
        if (value) {
            const { col, grid } = value;
            if (isPblColumn(col)) {
                this.column = col;
                this.grid = grid;
                this._extApi = PblNgridPluginController.find(grid).extApi;
                return;
            }
        }
        this.column = this._extApi = this.grid = undefined;
    }
    ngAfterViewInit() {
        // We need to wait for the zone to stabilize, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position and then they get transferred to the portal.
        this._rootElementInitSubscription = this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
            const rootElement = this._rootElement = this._getRootElement();
            const cell = rootElement.parentElement;
            cell.classList.add('pbl-ngrid-column-resize');
            rootElement.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
            rootElement.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
            toggleNativeDragInteractions(rootElement, false);
        });
    }
    ngOnDestroy() {
        if (this._rootElement) {
            this._rootElement.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
            this._rootElement.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
        }
        this._rootElementInitSubscription.unsubscribe();
        this._dragDropRegistry.removeDragItem(this);
        this._removeSubscriptions();
    }
    onDoubleClick(event) {
        this.grid.columnApi.autoSizeColumn(this.column);
    }
    /**
   * Sets up the different variables and subscriptions
   * that will be necessary for the dragging sequence.
   * @param referenceElement Element that started the drag sequence.
   * @param event Browser event object that started the sequence.
   */
    _initializeDragSequence(referenceElement, event) {
        // Always stop propagation for the event that initializes
        // the dragging sequence, in order to prevent it from potentially
        // starting another sequence for a draggable parent somewhere up the DOM tree.
        event.stopPropagation();
        // Abort if the user is already dragging or is using a mouse button other than the primary one.
        if (this.isDragging() || (!this._isTouchEvent(event) && event.button !== 0)) {
            return;
        }
        this._hasStartedDragging = this._hasMoved = false;
        this._pointerMoveSubscription = this._dragDropRegistry.pointerMove
            .pipe(auditTime(0, animationFrameScheduler))
            .subscribe(this._pointerMove);
        this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
        this._scrollPosition = this._viewportRuler.getViewportScrollPosition();
        this._pickupPositionOnPage = this._getPointerPositionOnPage(event);
        this._dragDropRegistry.startDragging(this, event);
    }
    _getPointerPositionOnPage(event) {
        const point = this._isTouchEvent(event) ? event.touches[0] : event;
        return {
            x: point.pageX - this._scrollPosition.left,
            y: point.pageY - this._scrollPosition.top
        };
    }
    _isTouchEvent(event) {
        return event.type.startsWith('touch');
    }
    /**
     *
     * @deprecated Will be removed in v5, use `isDragging()` instead
     */
    _isDragging() {
        return this.isDragging();
    }
    isDragging() {
        return this._dragDropRegistry.isDragging(this);
    }
    _getRootElement() {
        return this.element.nativeElement;
    }
    _removeSubscriptions() {
        this._pointerMoveSubscription.unsubscribe();
        this._pointerUpSubscription.unsubscribe();
    }
}
/** @nocollapse */ PblNgridDragResizeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragResizeComponent, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: i1.ViewportRuler }, { token: i2.DragDropRegistry }, { token: CDK_DRAG_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDragResizeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDragResizeComponent, selector: "pbl-ngrid-drag-resize", inputs: { context: "context", grabAreaWidth: "grabAreaWidth" }, host: { listeners: { "dblclick": "onDoubleClick($event)" }, properties: { "style.width.px": "grabAreaWidth" }, classAttribute: "pbl-ngrid-column-resizer" }, ngImport: i0, template: "<ng-content></ng-content>\n", styles: [".pbl-ngrid-column-resizer{position:absolute;right:0;height:100%;cursor:col-resize;z-index:50000}[dir=rtl] .pbl-ngrid-column-resizer{right:unset;left:0}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragResizeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-drag-resize', host: {
                        'class': 'pbl-ngrid-column-resizer',
                        '[style.width.px]': 'grabAreaWidth',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<ng-content></ng-content>\n", styles: [".pbl-ngrid-column-resizer{position:absolute;right:0;height:100%;cursor:col-resize;z-index:50000}[dir=rtl] .pbl-ngrid-column-resizer{right:unset;left:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i1.ViewportRuler }, { type: i2.DragDropRegistry }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }]; }, propDecorators: { context: [{
                type: Input
            }], grabAreaWidth: [{
                type: Input
            }], onDoubleClick: [{
                type: HostListener,
                args: ['dblclick', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvY29sdW1uLXJlc2l6ZS9jb2x1bW4tcmVzaXplLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsUUFBUSxFQUVSLE1BQU0sRUFDTixpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3hFLE9BQU8sRUFBa0IsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFM0YsT0FBTyxFQUF5RCxXQUFXLEVBQUUsd0JBQXdCLEVBQXdCLE1BQU0sZUFBZSxDQUFDO0FBQ25KLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7O0FBUXZFLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFtQixjQUFjLENBQUM7QUFFcEUsaUVBQWlFO0FBQ2pFLE1BQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztBQUVyRixpRUFBaUU7QUFD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QUdHO0lBQ0gsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO0lBQzFCLENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTyxlQUFlO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDcEMsQ0FBQztJQUNPLG9CQUFvQjtRQUMxQixJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzVDLENBQUM7OzJJQWpOVSwyQkFBMkIsK0hBeUNOLGVBQWU7K0hBekNwQywyQkFBMkIsMFJDaER4Qyw2QkFDQTsyRkQrQ2EsMkJBQTJCO2tCQVh2QyxTQUFTOytCQUNFLHVCQUF1QixRQUMzQjt3QkFDSixPQUFPLEVBQUUsMEJBQTBCO3dCQUNuQyxrQkFBa0IsRUFBRSxlQUFlO3FCQUNwQyxtQkFHZ0IsdUJBQXVCLENBQUMsTUFBTSxpQkFDaEMsaUJBQWlCLENBQUMsSUFBSTs7MEJBMkN4QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGVBQWU7NENBdENsQyxPQUFPO3NCQUFuQixLQUFLO2dCQWlCRyxhQUFhO3NCQUFyQixLQUFLO2dCQXdETixhQUFhO3NCQURaLFlBQVk7dUJBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgYXVkaXRUaW1lLCB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgT25EZXN0cm95LFxuICBOZ1pvbmUsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBWaWV3cG9ydFJ1bGVyIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQgeyBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7IERyYWdEcm9wQ29uZmlnLCBEcmFnRHJvcFJlZ2lzdHJ5LCBDREtfRFJBR19DT05GSUcgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibENvbHVtbiwgUGJsTmdyaWRNZXRhQ2VsbENvbnRleHQsIGlzUGJsQ29sdW1uLCBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIFBibE5ncmlkRXh0ZW5zaW9uQXBpIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyB0b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zIH0gZnJvbSAnLi9jZGstZW5jYXBzdWxhdGVkLWNvZGUnO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbiB7XG4gICAgY29sdW1uUmVzaXplPzogUGJsTmdyaWREcmFnUmVzaXplQ29tcG9uZW50O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDT0xfUkVTSVpFX1BMVUdJTl9LRVk6ICdjb2x1bW5SZXNpemUnID0gJ2NvbHVtblJlc2l6ZSc7XG5cbi8qKiBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gYmluZCBhIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXIuICovXG5jb25zdCBwYXNzaXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtwYXNzaXZlOiB0cnVlfSk7XG5cbi8qKiBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gYmluZCBhbiBhY3RpdmUgZXZlbnQgbGlzdGVuZXIuICovXG5jb25zdCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe3Bhc3NpdmU6IGZhbHNlfSk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZC1kcmFnLXJlc2l6ZScsIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIGhvc3Q6IHsgLy8gdHNsaW50OmRpc2FibGUtbGluZTp1c2UtaG9zdC1wcm9wZXJ0eS1kZWNvcmF0b3JcbiAgICAnY2xhc3MnOiAncGJsLW5ncmlkLWNvbHVtbi1yZXNpemVyJyxcbiAgICAnW3N0eWxlLndpZHRoLnB4XSc6ICdncmFiQXJlYVdpZHRoJyxcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvbHVtbi1yZXNpemUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vY29sdW1uLXJlc2l6ZS5jb21wb25lbnQuc2NzcycgXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkRHJhZ1Jlc2l6ZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWlucHV0LXJlbmFtZVxuICBASW5wdXQoKSBzZXQgY29udGV4dCh2YWx1ZTogUGJsTmdyaWRNZXRhQ2VsbENvbnRleHQ8YW55Pikge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgY29uc3QgeyBjb2wsIGdyaWQgfSA9IHZhbHVlO1xuICAgICAgaWYgKGlzUGJsQ29sdW1uKGNvbCkpIHtcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2w7XG4gICAgICAgIHRoaXMuZ3JpZCA9IGdyaWQ7XG4gICAgICAgIHRoaXMuX2V4dEFwaSA9IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKGdyaWQpLmV4dEFwaTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbHVtbiA9IHRoaXMuX2V4dEFwaSA9IHRoaXMuZ3JpZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXJlYSAoaW4gcGl4ZWxzKSBpbiB3aGljaCB0aGUgaGFuZGxlIGNhbiBiZSBncmFiYmVkIGFuZCByZXNpemUgdGhlIGNlbGwuXG4gICAqIERlZmF1bHQ6IDZcbiAgICovXG4gIEBJbnB1dCgpIGdyYWJBcmVhV2lkdGggPSA2O1xuXG4gIGNvbHVtbjogUGJsQ29sdW1uO1xuICBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+O1xuXG4gIF9oYXNTdGFydGVkRHJhZ2dpbmc6IGJvb2xlYW47XG4gIHByaXZhdGUgX2hhc01vdmVkOiBib29sZWFuO1xuICBwcml2YXRlIF9yb290RWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgX3BvaW50ZXJNb3ZlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9wb2ludGVyVXBTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX3Njcm9sbFBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn07XG4gIHByaXZhdGUgX3BpY2t1cFBvc2l0aW9uT25QYWdlOiBQb2ludDtcbiAgcHJpdmF0ZSBfaW5pdGlhbFdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgX2xhc3RXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIF9leHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpO1xuICBwcml2YXRlIF9yb290RWxlbWVudEluaXRTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZHJhZ0Ryb3BSZWdpc3RyeTogRHJhZ0Ryb3BSZWdpc3RyeTxQYmxOZ3JpZERyYWdSZXNpemVDb21wb25lbnQsIGFueT4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0RSQUdfQ09ORklHKSBwcml2YXRlIF9jb25maWc6IERyYWdEcm9wQ29uZmlnKSB7XG4gICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgZHJhZ1N0YXJ0VGhyZXNob2xkOiBfY29uZmlnICYmIF9jb25maWcuZHJhZ1N0YXJ0VGhyZXNob2xkICE9IG51bGwgPyBfY29uZmlnLmRyYWdTdGFydFRocmVzaG9sZCA6IDUsXG4gICAgICBwb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkOiBfY29uZmlnICYmIF9jb25maWcucG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZCAhPSBudWxsID8gX2NvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkIDogNSxcbiAgICAgIHpJbmRleDogX2NvbmZpZz8uekluZGV4XG4gICAgfTtcbiAgICBfZHJhZ0Ryb3BSZWdpc3RyeS5yZWdpc3RlckRyYWdJdGVtKHRoaXMpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIC8vIFdlIG5lZWQgdG8gd2FpdCBmb3IgdGhlIHpvbmUgdG8gc3RhYmlsaXplLCBpbiBvcmRlciBmb3IgdGhlIHJlZmVyZW5jZVxuICAgIC8vIGVsZW1lbnQgdG8gYmUgaW4gdGhlIHByb3BlciBwbGFjZSBpbiB0aGUgRE9NLiBUaGlzIGlzIG1vc3RseSByZWxldmFudFxuICAgIC8vIGZvciBkcmFnZ2FibGUgZWxlbWVudHMgaW5zaWRlIHBvcnRhbHMgc2luY2UgdGhleSBnZXQgc3RhbXBlZCBvdXQgaW5cbiAgICAvLyB0aGVpciBvcmlnaW5hbCBET00gcG9zaXRpb24gYW5kIHRoZW4gdGhleSBnZXQgdHJhbnNmZXJyZWQgdG8gdGhlIHBvcnRhbC5cbiAgICB0aGlzLl9yb290RWxlbWVudEluaXRTdWJzY3JpcHRpb24gPSB0aGlzLl9uZ1pvbmUub25TdGFibGUuYXNPYnNlcnZhYmxlKCkucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgY29uc3Qgcm9vdEVsZW1lbnQgPSB0aGlzLl9yb290RWxlbWVudCA9IHRoaXMuX2dldFJvb3RFbGVtZW50KCk7XG4gICAgICBjb25zdCBjZWxsID0gcm9vdEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgncGJsLW5ncmlkLWNvbHVtbi1yZXNpemUnKTtcbiAgICAgIHJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgICByb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fcG9pbnRlckRvd24sIHBhc3NpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgICB0b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKHJvb3RFbGVtZW50ICwgZmFsc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Jvb3RFbGVtZW50KSB7XG4gICAgICB0aGlzLl9yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9wb2ludGVyRG93biwgYWN0aXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgdGhpcy5fcm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3BvaW50ZXJEb3duLCBwYXNzaXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH1cbiAgICB0aGlzLl9yb290RWxlbWVudEluaXRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnJlbW92ZURyYWdJdGVtKHRoaXMpO1xuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbnMoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RibGNsaWNrJywgWyckZXZlbnQnXSlcbiAgb25Eb3VibGVDbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZ3JpZC5jb2x1bW5BcGkuYXV0b1NpemVDb2x1bW4odGhpcy5jb2x1bW4pO1xuICB9XG5cbiAgX3BvaW50ZXJEb3duID0gKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuICAgIHRoaXMuX2luaXRpYWxpemVEcmFnU2VxdWVuY2UodGhpcy5fcm9vdEVsZW1lbnQsIGV2ZW50KTtcbiAgfVxuXG4gICAgLyoqXG4gICAqIFNldHMgdXAgdGhlIGRpZmZlcmVudCB2YXJpYWJsZXMgYW5kIHN1YnNjcmlwdGlvbnNcbiAgICogdGhhdCB3aWxsIGJlIG5lY2Vzc2FyeSBmb3IgdGhlIGRyYWdnaW5nIHNlcXVlbmNlLlxuICAgKiBAcGFyYW0gcmVmZXJlbmNlRWxlbWVudCBFbGVtZW50IHRoYXQgc3RhcnRlZCB0aGUgZHJhZyBzZXF1ZW5jZS5cbiAgICogQHBhcmFtIGV2ZW50IEJyb3dzZXIgZXZlbnQgb2JqZWN0IHRoYXQgc3RhcnRlZCB0aGUgc2VxdWVuY2UuXG4gICAqL1xuICBwcml2YXRlIF9pbml0aWFsaXplRHJhZ1NlcXVlbmNlKHJlZmVyZW5jZUVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcbiAgICAvLyBBbHdheXMgc3RvcCBwcm9wYWdhdGlvbiBmb3IgdGhlIGV2ZW50IHRoYXQgaW5pdGlhbGl6ZXNcbiAgICAvLyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UsIGluIG9yZGVyIHRvIHByZXZlbnQgaXQgZnJvbSBwb3RlbnRpYWxseVxuICAgIC8vIHN0YXJ0aW5nIGFub3RoZXIgc2VxdWVuY2UgZm9yIGEgZHJhZ2dhYmxlIHBhcmVudCBzb21ld2hlcmUgdXAgdGhlIERPTSB0cmVlLlxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgLy8gQWJvcnQgaWYgdGhlIHVzZXIgaXMgYWxyZWFkeSBkcmFnZ2luZyBvciBpcyB1c2luZyBhIG1vdXNlIGJ1dHRvbiBvdGhlciB0aGFuIHRoZSBwcmltYXJ5IG9uZS5cbiAgICBpZiAodGhpcy5pc0RyYWdnaW5nKCkgfHwgKCF0aGlzLl9pc1RvdWNoRXZlbnQoZXZlbnQpICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9oYXNTdGFydGVkRHJhZ2dpbmcgPSB0aGlzLl9oYXNNb3ZlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlU3Vic2NyaXB0aW9uID0gdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5wb2ludGVyTW92ZVxuICAgICAgLnBpcGUoYXVkaXRUaW1lKDAsIGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyKSlcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fcG9pbnRlck1vdmUpO1xuICAgIHRoaXMuX3BvaW50ZXJVcFN1YnNjcmlwdGlvbiA9IHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkucG9pbnRlclVwLnN1YnNjcmliZSh0aGlzLl9wb2ludGVyVXApO1xuICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uID0gdGhpcy5fdmlld3BvcnRSdWxlci5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk7XG5cbiAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZSA9IHRoaXMuX2dldFBvaW50ZXJQb3NpdGlvbk9uUGFnZShldmVudCk7XG4gICAgdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5zdGFydERyYWdnaW5nKHRoaXMsIGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVyIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSB1c2VyIG1vdmVzIHRoZWlyIHBvaW50ZXIgYWZ0ZXIgdGhleSd2ZSBpbml0aWF0ZWQgYSBkcmFnLiAqL1xuICBwcml2YXRlIF9wb2ludGVyTW92ZSA9IChldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcbiAgICBjb25zdCBwb2ludGVyUG9zaXRpb24gPSB0aGlzLl9nZXRQb2ludGVyUG9zaXRpb25PblBhZ2UoZXZlbnQpO1xuICAgIGNvbnN0IGRpc3RhbmNlWCA9IHBvaW50ZXJQb3NpdGlvbi54IC0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueDtcbiAgICBjb25zdCBkaXN0YW5jZVkgPSBwb2ludGVyUG9zaXRpb24ueSAtIHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLnk7XG5cbiAgICBpZiAoIXRoaXMuX2hhc1N0YXJ0ZWREcmFnZ2luZykge1xuICAgICAgLy8gT25seSBzdGFydCBkcmFnZ2luZyBhZnRlciB0aGUgdXNlciBoYXMgbW92ZWQgbW9yZSB0aGFuIHRoZSBtaW5pbXVtIGRpc3RhbmNlIGluIGVpdGhlclxuICAgICAgLy8gZGlyZWN0aW9uLiBOb3RlIHRoYXQgdGhpcyBpcyBwcmVmZXJhYmxlIG92ZXIgZG9pbmcgc29tZXRoaW5nIGxpa2UgYHNraXAobWluaW11bURpc3RhbmNlKWBcbiAgICAgIC8vIGluIHRoZSBgcG9pbnRlck1vdmVgIHN1YnNjcmlwdGlvbiwgYmVjYXVzZSB3ZSdyZSBub3QgZ3VhcmFudGVlZCB0byBoYXZlIG9uZSBtb3ZlIGV2ZW50XG4gICAgICAvLyBwZXIgcGl4ZWwgb2YgbW92ZW1lbnQgKGUuZy4gaWYgdGhlIHVzZXIgbW92ZXMgdGhlaXIgcG9pbnRlciBxdWlja2x5KS5cbiAgICAgIGlmIChNYXRoLmFicyhkaXN0YW5jZVgpICsgTWF0aC5hYnMoZGlzdGFuY2VZKSA+PSB0aGlzLl9jb25maWcuZHJhZ1N0YXJ0VGhyZXNob2xkKSB7XG4gICAgICAgIHRoaXMuX2hhc1N0YXJ0ZWREcmFnZ2luZyA9IHRydWU7XG5cbiAgICAgICAgLy8gSXQgd2lsbCBiZSBhIGdvb2QgdGhpbmcgaWYgd2UgdHVybmVkIG9mIHRoZSBoZWFkZXIncyByZXNpemUgb2JzZXJ2ZXIgdG8gYm9vc3QgcGVyZm9ybWFuY2VcbiAgICAgICAgLy8gSG93ZXZlciwgYmVjYXVzZSB3ZSByZWxheSBvbiB0aGUgdG90YWwgZ3JpZCBtaW5pbXVtIHdpZHRoIHVwZGF0ZXMgdG8gcmVsYXRpdmVseSBldmVuIG91dCB0aGUgY29sdW1ucyBpdCB3aWxsIG5vdCB3b3JrLlxuICAgICAgICAvLyBHcm91cCBjZWxscyB3aWxsIG5vdCBjb3ZlciBhbGwgb2YgdGhlIGNoaWxkcmVuLCB3aGVuIHdlIGVubGFyZ2UgdGhlIHdpZHRoIG9mIGEgY2hpbGQgaW4gdGhlIGdyb3VwLlxuICAgICAgICAvLyBUaGlzIGlzIGJlY2F1c2UgdGhlIG1heC13aWR0aCBvZiB0aGUgZ3JvdXAgaXMgc2V0IHByb3BvcnRpb25hbCB0byB0aGUgdG90YWwgbWluLXdpZHRoIG9mIHRoZSBpbm5lciBncmlkLlxuICAgICAgICAvLyBGb3IgaXQgdG8gd29yayB3ZSBuZWVkIHRvIGRpcmVjdGx5IHVwZGF0ZSB0aGUgd2lkdGggb2YgQUxMIE9GIFRIRSBHUk9VUFMuXG4gICAgICAgIC8vIHRoaXMuY29sdW1uLmNvbHVtbkRlZi5pc0RyYWdnaW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmNvbHVtbi5zaXplSW5mby51cGRhdGVTaXplKCk7XG4gICAgICAgIHRoaXMuX2xhc3RXaWR0aCA9IHRoaXMuX2luaXRpYWxXaWR0aCA9IHRoaXMuY29sdW1uLmNvbHVtbkRlZi5uZXRXaWR0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9oYXNNb3ZlZCA9IHRydWU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGNvbnN0IGRpciA9IHRoaXMuX2V4dEFwaS5nZXREaXJlY3Rpb24oKSA9PT0gJ3J0bCcgPyAtMSA6IDE7XG4gICAgbGV0IG5ld1dpZHRoID0gTWF0aC5tYXgoMCwgdGhpcy5faW5pdGlhbFdpZHRoICsgKGRpc3RhbmNlWCAqIGRpcikpO1xuXG4gICAgaWYgKG5ld1dpZHRoID4gdGhpcy5jb2x1bW4ubWF4V2lkdGgpIHtcbiAgICAgIG5ld1dpZHRoID0gdGhpcy5jb2x1bW4ubWF4V2lkdGg7XG4gICAgfSBlbHNlIGlmIChkaXN0YW5jZVggPCAwICYmIG5ld1dpZHRoIDwgdGhpcy5jb2x1bW4ubWluV2lkdGgpIHtcbiAgICAgIG5ld1dpZHRoID0gdGhpcy5jb2x1bW4ubWluV2lkdGg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhc3RXaWR0aCAhPT0gbmV3V2lkdGgpIHtcbiAgICAgIHRoaXMuX2xhc3RXaWR0aCA9IG5ld1dpZHRoO1xuICAgICAgdGhpcy5jb2x1bW4udXBkYXRlV2lkdGgoYCR7bmV3V2lkdGh9cHhgKTtcbiAgICAgIHRoaXMuX2V4dEFwaS53aWR0aENhbGMucmVzZXRDb2x1bW5zV2lkdGgoKTtcbiAgICAgIC8vIGB0aGlzLmNvbHVtbi51cGRhdGVXaWR0aGAgd2lsbCB1cGRhdGUgdGhlIGdyaWQgd2lkdGggY2VsbCBvbmx5LCB3aGljaCB3aWxsIHRyaWdnZXIgYSByZXNpemUgdGhhdCB3aWxsIHVwZGF0ZSBhbGwgb3RoZXIgY2VsbHNcbiAgICAgIC8vIGB0aGlzLmdyaWQucmVzZXRDb2x1bW5zV2lkdGgoKWAgd2lsbCByZS1hZGp1c3QgYWxsIG90aGVyIGdyaWQgd2lkdGggY2VsbHMsIGFuZCBpZiB0aGVpciBzaXplIGNoYW5nZXMgdGhleSB3aWxsIHRyaWdnZXIgdGhlIHJlc2l6ZSBldmVudC4uLlxuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVyIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSB1c2VyIGxpZnRzIHRoZWlyIHBvaW50ZXIgdXAsIGFmdGVyIGluaXRpYXRpbmcgYSBkcmFnLiAqL1xuICBwcml2YXRlIF9wb2ludGVyVXAgPSAoKSA9PiB7XG4gICAgaWYgKCF0aGlzLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbnMoKTtcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnN0b3BEcmFnZ2luZyh0aGlzKTtcblxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gdGhpcy5jb2x1bW4uY29sdW1uRGVmLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmdyaWQuY29sdW1uQXBpLnJlc2l6ZUNvbHVtbih0aGlzLmNvbHVtbiwgdGhpcy5fbGFzdFdpZHRoICsgJ3B4Jyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQb2ludGVyUG9zaXRpb25PblBhZ2UoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogUG9pbnQge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5faXNUb3VjaEV2ZW50KGV2ZW50KSA/IGV2ZW50LnRvdWNoZXNbMF0gOiBldmVudDtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBwb2ludC5wYWdlWCAtIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmxlZnQsXG4gICAgICB5OiBwb2ludC5wYWdlWSAtIHRoaXMuX3Njcm9sbFBvc2l0aW9uLnRvcFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9pc1RvdWNoRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogZXZlbnQgaXMgVG91Y2hFdmVudCB7XG4gICAgcmV0dXJuIGV2ZW50LnR5cGUuc3RhcnRzV2l0aCgndG91Y2gnKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBXaWxsIGJlIHJlbW92ZWQgaW4gdjUsIHVzZSBgaXNEcmFnZ2luZygpYCBpbnN0ZWFkXG4gICAqL1xuICBfaXNEcmFnZ2luZygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RyYWdnaW5nKClcbiAgfVxuXG4gIGlzRHJhZ2dpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuaXNEcmFnZ2luZyh0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFJvb3RFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gIH1cbiAgcHJpdmF0ZSBfcmVtb3ZlU3Vic2NyaXB0aW9ucygpIHtcbiAgICB0aGlzLl9wb2ludGVyTW92ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3BvaW50ZXJVcFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG59XG5cbmludGVyZmFjZSBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuIiwiPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuIl19