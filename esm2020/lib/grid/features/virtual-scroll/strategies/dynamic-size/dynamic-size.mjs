import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { unrx } from '@pebula/ngrid/core';
import { Sizer } from './sizer';
export class PblNgridDynamicVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this.type = 'vScrollDynamic';
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._lastExcessHeight = 0;
        this.sizer = new Sizer();
        this.sizer.itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this.sizer.itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    attachExtApi(extApi) {
        this.extApi = extApi;
        this.extApi.events
            .subscribe(event => {
            if (event.kind === 'onDataSource') {
                this.onDatasource(event.curr, event.prev);
            }
        });
        if (this.extApi.grid.ds) {
            this.onDatasource(this.extApi.grid.ds);
        }
    }
    attach(viewport) {
        if (!this.extApi) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid use of attach, you must first attach `PblNgridExtensionApi`');
            }
        }
        this._viewport = viewport;
        this._updateSizeAndRange();
    }
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    onContentScrolled() {
        this._updateRenderedRange();
    }
    onDataLengthChanged() {
        this.sizer.itemsLength = this._viewport.getDataLength();
        this._updateSizeAndRange();
    }
    onContentRendered() {
        this._checkRenderedContentSize();
    }
    onRenderedOffsetChanged() {
        if (this._viewport) {
            this._lastRenderedContentOffset = this._viewport.getOffsetToRenderedContentStart();
        }
    }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(this.sizer.getSizeBefore(index), behavior);
        }
    }
    onDatasource(curr, prev) {
        if (prev) {
            unrx.kill(this, prev);
        }
        if (curr) {
            curr.onSourceChanging
                .pipe(unrx(this, curr))
                .subscribe(() => {
                this.sizer.clear();
            });
        }
    }
    _updateSizeAndRange() {
        this._updateTotalContentSize();
        this._updateRenderedRange(true);
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        for (const row of this.extApi.rowsApi.dataRows()) {
            if (row.context) {
                this.sizer.setSize(row.context.dsIndex, row.height);
            }
        }
        this._viewport.setTotalContentSize(this.sizer.getTotalContentSize());
    }
    _checkRenderedContentSize() {
        this._updateTotalContentSize();
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange(skipSizeSync) {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        // if (!skipSizeSync) {
        //   for (let i = renderedRange.start; i <= renderedRange.end; i++) {
        //     this.sizer.setSize(i, this.extApi.rowsApi.findDataRowByDsIndex(i)?.height ?? this.sizer.itemSize);
        //   }
        // }
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        let firstVisibleIndex = this.sizer.findRenderItemAtOffset(scrollOffset);
        let excessHeight = 0;
        // When user scrolls to the top, rows change context, sometimes new rows are added etc.
        // With dynamic size, rows with additional size payload will cause the scroll offset to change because they are added
        // before the visible rows, this will throw the entire scroll out of sync.
        // To solve this we use a 2 step process.
        // 1) For each `_updateRenderRange` cycle of scrolling to the TOP, we sum up excess all height and save them.
        // 2) If we had excess height it will create a scroll change which will lead us back here. Now we check if we
        // have previously saved access height, if so we reduce the scroll offset back to what it was supposed to be, like adding the height did not effect the offset.
        // Since the first step causes a scroll offset flicker, the grid will jump forward and show rows not in the range we want, if we just move back on the 2nd tick
        // it will cause a flicker in the grid. To prevent it we compensate by pushing in the 1st tick, the rendered content offset forward to match the offset change.
        // In the second tick we revet it and restore the offset.
        if (this._lastExcessHeight) {
            const lastExcessHeight = this._lastExcessHeight;
            this._lastExcessHeight = 0;
            this._viewport.setRenderedContentOffset(this._lastRenderedContentOffset - lastExcessHeight);
            this._viewport.scrollToOffset(scrollOffset - lastExcessHeight);
            return;
        }
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            let spaceToFill = viewportSize;
            let expandEnd = firstVisibleIndex;
            while (spaceToFill > 0) {
                spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
            }
            const maxVisibleItems = expandEnd - firstVisibleIndex;
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex !== newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = this.sizer.getSizeBefore(firstVisibleIndex);
                newRange.start = firstVisibleIndex;
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        let contentOffset = this.sizer.getSizeBefore(newRange.start);
        const currentStartBuffer = scrollOffset - contentOffset;
        if (currentStartBuffer < this._minBufferPx && newRange.start !== 0) {
            let spaceToFill = this._maxBufferPx - currentStartBuffer;
            if (spaceToFill < 0) {
                spaceToFill = Math.abs(spaceToFill) + this._maxBufferPx;
            }
            let expandStart = newRange.start;
            while (spaceToFill > 0) {
                const newSize = this.sizer.getSizeForItem(--expandStart);
                spaceToFill -= newSize;
                excessHeight += newSize - this.sizer.itemSize;
            }
            expandStart = Math.max(0, expandStart);
            if (expandStart !== newRange.start) {
                newRange.start = expandStart;
                contentOffset = this.sizer.getSizeBefore(expandStart);
            }
            spaceToFill = viewportSize + this._minBufferPx;
            let expandEnd = firstVisibleIndex;
            while (spaceToFill > 0) {
                spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
            }
            newRange.end = Math.min(dataLength, expandEnd);
        }
        else {
            const renderDataEnd = contentOffset + this.sizer.getSizeForRange(newRange.start, newRange.end);
            const currentEndBuffer = renderDataEnd - (scrollOffset + viewportSize);
            if (currentEndBuffer < this._minBufferPx && newRange.end !== dataLength) {
                let spaceToFill = this._maxBufferPx - currentEndBuffer;
                if (spaceToFill < 0) {
                    spaceToFill = Math.abs(spaceToFill) + this._maxBufferPx;
                }
                let expandEnd = newRange.end;
                while (spaceToFill > 0) {
                    spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
                }
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, expandEnd);
                    spaceToFill = this._minBufferPx;
                    let expandStart = firstVisibleIndex;
                    while (spaceToFill > 0) {
                        spaceToFill -= this.sizer.getSizeForItem(--expandStart);
                    }
                    expandStart = Math.max(0, expandStart);
                    if (expandStart !== newRange.start) {
                        newRange.start = expandStart;
                        contentOffset = this.sizer.getSizeBefore(expandStart);
                    }
                }
            }
        }
        this._lastExcessHeight = excessHeight;
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(contentOffset + excessHeight);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pYy1zaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvc3RyYXRlZ2llcy9keW5hbWljLXNpemUvZHluYW1pYy1zaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEQsT0FBTyxFQUFpQixJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUt6RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBUWhDLE1BQU0sT0FBTyxvQ0FBb0M7SUF5Qi9DOzs7O09BSUc7SUFDSCxZQUFZLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFtQjtRQTVCN0QsU0FBSSxHQUFxQixnQkFBZ0IsQ0FBQztRQUV6Qyx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXZELGtFQUFrRTtRQUNsRSx3QkFBbUIsR0FBdUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFakcsNkJBQTZCO1FBQ25CLGNBQVMsR0FBZ0QsSUFBSSxDQUFDO1FBUzlELHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQVk5QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHVCQUF1QixDQUFDLFFBQWdCLEVBQUUsV0FBbUIs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QWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBRUYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkaXN0aW5jdFVudGlsQ2hhbmdlZCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IFBibERhdGFTb3VyY2UsIHVucnggfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpLCBQYmxOZ3JpZEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50IH0gZnJvbSAnLi4vLi4vdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50JztcbmltcG9ydCB7IFBibE5ncmlkVmlydHVhbFNjcm9sbFN0cmF0ZWd5IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgU2l6ZXIgfSBmcm9tICcuL3NpemVyJztcblxuZGVjbGFyZSBtb2R1bGUgJy4uL3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFZpcnR1YWxTY3JvbGxTdHJhdGVneU1hcCB7XG4gICAgdlNjcm9sbER5bmFtaWM6IFBibE5ncmlkRHluYW1pY1ZpcnR1YWxTY3JvbGxTdHJhdGVneTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGJsTmdyaWREeW5hbWljVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgUGJsTmdyaWRWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3k8J3ZTY3JvbGxEeW5hbWljJz4ge1xuXG4gIHJlYWRvbmx5IHR5cGU6ICd2U2Nyb2xsRHluYW1pYycgPSAndlNjcm9sbER5bmFtaWMnO1xuXG4gIHByb3RlY3RlZCBfc2Nyb2xsZWRJbmRleENoYW5nZSA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgc2Nyb2xsZWRJbmRleENoYW5nZTogT2JzZXJ2YWJsZTxudW1iZXI+ID0gdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuXG4gIC8qKiBUaGUgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIHByb3RlY3RlZCBfdmlld3BvcnQ6IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByb3RlY3RlZCBfbWluQnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByb3RlY3RlZCBfbWF4QnVmZmVyUHg6IG51bWJlcjtcblxuICBwcm90ZWN0ZWQgX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ6IG51bWJlcjtcbiAgcHJvdGVjdGVkIF9sYXN0RXhjZXNzSGVpZ2h0ID0gMDtcblxuICBwcm90ZWN0ZWQgc2l6ZXI6IFNpemVyO1xuXG4gIHByaXZhdGUgZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaXRlbVNpemUgVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSB2aXJ0dWFsbHkgc2Nyb2xsaW5nIGxpc3QuXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIChpbiBwaXhlbHMpIGJlZm9yZSBuZWVkaW5nIHRvIHJlbmRlciBtb3JlXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgYW1vdW50IG9mIGJ1ZmZlciAoaW4gcGl4ZWxzKSB0byByZW5kZXIgd2hlbiByZW5kZXJpbmcgbW9yZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGl0ZW1TaXplOiBudW1iZXIsIG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNpemVyID0gbmV3IFNpemVyKCk7XG4gICAgdGhpcy5zaXplci5pdGVtU2l6ZSA9IGl0ZW1TaXplO1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGl0ZW0gc2l6ZSBhbmQgYnVmZmVyIHNpemUuXG4gICAqIEBwYXJhbSBpdGVtU2l6ZSBUaGUgc2l6ZSBvZiB0aGUgaXRlbXMgaW4gdGhlIHZpcnR1YWxseSBzY3JvbGxpbmcgbGlzdC5cbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgYmVmb3JlIG5lZWRpbmcgdG8gcmVuZGVyIG1vcmVcbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBhbW91bnQgb2YgYnVmZmVyIChpbiBwaXhlbHMpIHRvIHJlbmRlciB3aGVuIHJlbmRlcmluZyBtb3JlLlxuICAgKi9cbiAgdXBkYXRlSXRlbUFuZEJ1ZmZlclNpemUoaXRlbVNpemU6IG51bWJlciwgbWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIGlmIChtYXhCdWZmZXJQeCA8IG1pbkJ1ZmZlclB4ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ0RLIHZpcnR1YWwgc2Nyb2xsOiBtYXhCdWZmZXJQeCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBtaW5CdWZmZXJQeCcpO1xuICAgIH1cbiAgICB0aGlzLnNpemVyLml0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVSZW5kZXJlZFJhbmdlKCk7XG4gIH1cblxuICBhdHRhY2hFeHRBcGkoZXh0QXBpOiBQYmxOZ3JpZEV4dGVuc2lvbkFwaSk6IHZvaWQge1xuICAgIHRoaXMuZXh0QXBpID0gZXh0QXBpIGFzIFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGk7XG4gICAgdGhpcy5leHRBcGkuZXZlbnRzXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5raW5kID09PSAnb25EYXRhU291cmNlJykge1xuICAgICAgICAgIHRoaXMub25EYXRhc291cmNlKGV2ZW50LmN1cnIsIGV2ZW50LnByZXYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBpZiAodGhpcy5leHRBcGkuZ3JpZC5kcykge1xuICAgICAgdGhpcy5vbkRhdGFzb3VyY2UodGhpcy5leHRBcGkuZ3JpZC5kcyk7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoKHZpZXdwb3J0OiBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZXh0QXBpKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB1c2Ugb2YgYXR0YWNoLCB5b3UgbXVzdCBmaXJzdCBhdHRhY2ggYFBibE5ncmlkRXh0ZW5zaW9uQXBpYCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3ZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gICAgdGhpcy5fdXBkYXRlU2l6ZUFuZFJhbmdlKCk7XG4gIH1cblxuICBkZXRhY2goKTogdm9pZCB7XG4gICAgdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcbiAgfVxuXG4gIG9uRGF0YUxlbmd0aENoYW5nZWQoKSB7XG4gICAgdGhpcy5zaXplci5pdGVtc0xlbmd0aCA9IHRoaXMuX3ZpZXdwb3J0LmdldERhdGFMZW5ndGgoKTtcbiAgICB0aGlzLl91cGRhdGVTaXplQW5kUmFuZ2UoKTtcbiAgfVxuXG4gIG9uQ29udGVudFJlbmRlcmVkKCkge1xuICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICB9XG5cbiAgb25SZW5kZXJlZE9mZnNldENoYW5nZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ID0gdGhpcy5fdmlld3BvcnQuZ2V0T2Zmc2V0VG9SZW5kZXJlZENvbnRlbnRTdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGwgdG8gdGhlIG9mZnNldCBmb3IgdGhlIGdpdmVuIGluZGV4LlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIHNjcm9sbCB0by5cbiAgICogQHBhcmFtIGJlaGF2aW9yIFRoZSBTY3JvbGxCZWhhdmlvciB0byB1c2Ugd2hlbiBzY3JvbGxpbmcuXG4gICAqL1xuICBzY3JvbGxUb0luZGV4KGluZGV4OiBudW1iZXIsIGJlaGF2aW9yOiBTY3JvbGxCZWhhdmlvcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fdmlld3BvcnQuc2Nyb2xsVG9PZmZzZXQodGhpcy5zaXplci5nZXRTaXplQmVmb3JlKGluZGV4KSwgYmVoYXZpb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBvbkRhdGFzb3VyY2UoY3VycjogUGJsRGF0YVNvdXJjZSwgcHJldj86IFBibERhdGFTb3VyY2UpIHtcbiAgICBpZiAocHJldikge1xuICAgICAgdW5yeC5raWxsKHRoaXMsIHByZXYpO1xuICAgIH1cbiAgICBpZiAoY3Vycikge1xuICAgICAgY3Vyci5vblNvdXJjZUNoYW5naW5nXG4gICAgICAgIC5waXBlKHVucngodGhpcywgY3VycikpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2l6ZXIuY2xlYXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIF91cGRhdGVTaXplQW5kUmFuZ2UoKSB7XG4gICAgdGhpcy5fdXBkYXRlVG90YWxDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UodHJ1ZSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cbiAgcHJvdGVjdGVkIF91cGRhdGVUb3RhbENvbnRlbnRTaXplKCkge1xuICAgIGlmICghdGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmV4dEFwaS5yb3dzQXBpLmRhdGFSb3dzKCkpIHtcbiAgICAgIGlmIChyb3cuY29udGV4dCkge1xuICAgICAgICB0aGlzLnNpemVyLnNldFNpemUocm93LmNvbnRleHQuZHNJbmRleCwgcm93LmhlaWdodCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0aGlzLnNpemVyLmdldFRvdGFsQ29udGVudFNpemUoKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpIHtcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKCk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHJlbmRlcmVkIHJhbmdlLiAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZVJlbmRlcmVkUmFuZ2Uoc2tpcFNpemVTeW5jPzogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdGhpcy5fdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuXG4gICAgLy8gaWYgKCFza2lwU2l6ZVN5bmMpIHtcbiAgICAvLyAgIGZvciAobGV0IGkgPSByZW5kZXJlZFJhbmdlLnN0YXJ0OyBpIDw9IHJlbmRlcmVkUmFuZ2UuZW5kOyBpKyspIHtcbiAgICAvLyAgICAgdGhpcy5zaXplci5zZXRTaXplKGksIHRoaXMuZXh0QXBpLnJvd3NBcGkuZmluZERhdGFSb3dCeURzSW5kZXgoaSk/LmhlaWdodCA/PyB0aGlzLnNpemVyLml0ZW1TaXplKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG5cbiAgICBjb25zdCBuZXdSYW5nZSA9IHtzdGFydDogcmVuZGVyZWRSYW5nZS5zdGFydCwgZW5kOiByZW5kZXJlZFJhbmdlLmVuZH07XG4gICAgY29uc3Qgdmlld3BvcnRTaXplID0gdGhpcy5fdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCk7XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IHRoaXMuX3ZpZXdwb3J0LmdldERhdGFMZW5ndGgoKTtcbiAgICBsZXQgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIGxldCBmaXJzdFZpc2libGVJbmRleCA9IHRoaXMuc2l6ZXIuZmluZFJlbmRlckl0ZW1BdE9mZnNldChzY3JvbGxPZmZzZXQpO1xuICAgIGxldCBleGNlc3NIZWlnaHQgPSAwO1xuXG4gICAgLy8gV2hlbiB1c2VyIHNjcm9sbHMgdG8gdGhlIHRvcCwgcm93cyBjaGFuZ2UgY29udGV4dCwgc29tZXRpbWVzIG5ldyByb3dzIGFyZSBhZGRlZCBldGMuXG4gICAgLy8gV2l0aCBkeW5hbWljIHNpemUsIHJvd3Mgd2l0aCBhZGRpdGlvbmFsIHNpemUgcGF5bG9hZCB3aWxsIGNhdXNlIHRoZSBzY3JvbGwgb2Zmc2V0IHRvIGNoYW5nZSBiZWNhdXNlIHRoZXkgYXJlIGFkZGVkXG4gICAgLy8gYmVmb3JlIHRoZSB2aXNpYmxlIHJvd3MsIHRoaXMgd2lsbCB0aHJvdyB0aGUgZW50aXJlIHNjcm9sbCBvdXQgb2Ygc3luYy5cbiAgICAvLyBUbyBzb2x2ZSB0aGlzIHdlIHVzZSBhIDIgc3RlcCBwcm9jZXNzLlxuICAgIC8vIDEpIEZvciBlYWNoIGBfdXBkYXRlUmVuZGVyUmFuZ2VgIGN5Y2xlIG9mIHNjcm9sbGluZyB0byB0aGUgVE9QLCB3ZSBzdW0gdXAgZXhjZXNzIGFsbCBoZWlnaHQgYW5kIHNhdmUgdGhlbS5cbiAgICAvLyAyKSBJZiB3ZSBoYWQgZXhjZXNzIGhlaWdodCBpdCB3aWxsIGNyZWF0ZSBhIHNjcm9sbCBjaGFuZ2Ugd2hpY2ggd2lsbCBsZWFkIHVzIGJhY2sgaGVyZS4gTm93IHdlIGNoZWNrIGlmIHdlXG4gICAgLy8gaGF2ZSBwcmV2aW91c2x5IHNhdmVkIGFjY2VzcyBoZWlnaHQsIGlmIHNvIHdlIHJlZHVjZSB0aGUgc2Nyb2xsIG9mZnNldCBiYWNrIHRvIHdoYXQgaXQgd2FzIHN1cHBvc2VkIHRvIGJlLCBsaWtlIGFkZGluZyB0aGUgaGVpZ2h0IGRpZCBub3QgZWZmZWN0IHRoZSBvZmZzZXQuXG4gICAgLy8gU2luY2UgdGhlIGZpcnN0IHN0ZXAgY2F1c2VzIGEgc2Nyb2xsIG9mZnNldCBmbGlja2VyLCB0aGUgZ3JpZCB3aWxsIGp1bXAgZm9yd2FyZCBhbmQgc2hvdyByb3dzIG5vdCBpbiB0aGUgcmFuZ2Ugd2Ugd2FudCwgaWYgd2UganVzdCBtb3ZlIGJhY2sgb24gdGhlIDJuZCB0aWNrXG4gICAgLy8gaXQgd2lsbCBjYXVzZSBhIGZsaWNrZXIgaW4gdGhlIGdyaWQuIFRvIHByZXZlbnQgaXQgd2UgY29tcGVuc2F0ZSBieSBwdXNoaW5nIGluIHRoZSAxc3QgdGljaywgdGhlIHJlbmRlcmVkIGNvbnRlbnQgb2Zmc2V0IGZvcndhcmQgdG8gbWF0Y2ggdGhlIG9mZnNldCBjaGFuZ2UuXG4gICAgLy8gSW4gdGhlIHNlY29uZCB0aWNrIHdlIHJldmV0IGl0IGFuZCByZXN0b3JlIHRoZSBvZmZzZXQuXG4gICAgaWYgKHRoaXMuX2xhc3RFeGNlc3NIZWlnaHQpIHtcbiAgICAgIGNvbnN0IGxhc3RFeGNlc3NIZWlnaHQgPSB0aGlzLl9sYXN0RXhjZXNzSGVpZ2h0O1xuICAgICAgdGhpcy5fbGFzdEV4Y2Vzc0hlaWdodCA9IDA7XG4gICAgICB0aGlzLl92aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCAtIGxhc3RFeGNlc3NIZWlnaHQpO1xuICAgICAgdGhpcy5fdmlld3BvcnQuc2Nyb2xsVG9PZmZzZXQoc2Nyb2xsT2Zmc2V0IC0gbGFzdEV4Y2Vzc0hlaWdodCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdXNlciBzY3JvbGxzIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgYW5kIGRhdGEgY2hhbmdlcyB0byBhIHNtYWxsZXIgbGlzdFxuICAgIGlmIChuZXdSYW5nZS5lbmQgPiBkYXRhTGVuZ3RoKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIHJlY2FsY3VsYXRlIHRoZSBmaXJzdCB2aXNpYmxlIGluZGV4IGJhc2VkIG9uIG5ldyBkYXRhIGxlbmd0aCBhbmQgdmlld3BvcnQgc2l6ZS5cbiAgICAgIGxldCBzcGFjZVRvRmlsbCA9IHZpZXdwb3J0U2l6ZTtcbiAgICAgIGxldCBleHBhbmRFbmQgPSBmaXJzdFZpc2libGVJbmRleDtcbiAgICAgIHdoaWxlIChzcGFjZVRvRmlsbCA+IDApIHtcbiAgICAgICAgc3BhY2VUb0ZpbGwgLT0gdGhpcy5zaXplci5nZXRTaXplRm9ySXRlbSgrK2V4cGFuZEVuZCk7XG4gICAgICB9XG4gICAgICBjb25zdCBtYXhWaXNpYmxlSXRlbXMgPSBleHBhbmRFbmQgLSBmaXJzdFZpc2libGVJbmRleDtcbiAgICAgIGNvbnN0IG5ld1Zpc2libGVJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGZpcnN0VmlzaWJsZUluZGV4LCBkYXRhTGVuZ3RoIC0gbWF4VmlzaWJsZUl0ZW1zKSk7XG5cbiAgICAgIC8vIElmIGZpcnN0IHZpc2libGUgaW5kZXggY2hhbmdlZCB3ZSBtdXN0IHVwZGF0ZSBzY3JvbGwgb2Zmc2V0IHRvIGhhbmRsZSBzdGFydC9lbmQgYnVmZmVyc1xuICAgICAgLy8gQ3VycmVudCByYW5nZSBtdXN0IGFsc28gYmUgYWRqdXN0ZWQgdG8gY292ZXIgdGhlIG5ldyBwb3NpdGlvbiAoYm90dG9tIG9mIG5ldyBsaXN0KS5cbiAgICAgIGlmIChmaXJzdFZpc2libGVJbmRleCAhPT0gbmV3VmlzaWJsZUluZGV4KSB7XG4gICAgICAgIGZpcnN0VmlzaWJsZUluZGV4ID0gbmV3VmlzaWJsZUluZGV4O1xuICAgICAgICBzY3JvbGxPZmZzZXQgPSAgdGhpcy5zaXplci5nZXRTaXplQmVmb3JlKGZpcnN0VmlzaWJsZUluZGV4KTtcbiAgICAgICAgbmV3UmFuZ2Uuc3RhcnQgPSBmaXJzdFZpc2libGVJbmRleDtcbiAgICAgIH1cblxuICAgICAgbmV3UmFuZ2UuZW5kID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGF0YUxlbmd0aCwgbmV3UmFuZ2Uuc3RhcnQgKyBtYXhWaXNpYmxlSXRlbXMpKTtcbiAgICB9XG5cbiAgICBsZXQgY29udGVudE9mZnNldCA9IHRoaXMuc2l6ZXIuZ2V0U2l6ZUJlZm9yZShuZXdSYW5nZS5zdGFydCk7XG4gICAgY29uc3QgY3VycmVudFN0YXJ0QnVmZmVyID0gc2Nyb2xsT2Zmc2V0IC0gY29udGVudE9mZnNldDtcblxuICAgIGlmIChjdXJyZW50U3RhcnRCdWZmZXIgPCB0aGlzLl9taW5CdWZmZXJQeCAmJiBuZXdSYW5nZS5zdGFydCAhPT0gMCkge1xuICAgICAgbGV0IHNwYWNlVG9GaWxsID0gdGhpcy5fbWF4QnVmZmVyUHggLSBjdXJyZW50U3RhcnRCdWZmZXI7XG4gICAgICBpZiAoc3BhY2VUb0ZpbGwgPCAwKSB7XG4gICAgICAgIHNwYWNlVG9GaWxsID0gTWF0aC5hYnMoc3BhY2VUb0ZpbGwpICsgdGhpcy5fbWF4QnVmZmVyUHg7XG4gICAgICB9XG4gICAgICBsZXQgZXhwYW5kU3RhcnQgPSBuZXdSYW5nZS5zdGFydDtcbiAgICAgIHdoaWxlIChzcGFjZVRvRmlsbCA+IDApIHtcbiAgICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuc2l6ZXIuZ2V0U2l6ZUZvckl0ZW0oLS1leHBhbmRTdGFydCk7XG4gICAgICAgIHNwYWNlVG9GaWxsIC09IG5ld1NpemU7XG4gICAgICAgIGV4Y2Vzc0hlaWdodCArPSBuZXdTaXplIC0gdGhpcy5zaXplci5pdGVtU2l6ZTtcbiAgICAgIH1cblxuICAgICAgZXhwYW5kU3RhcnQgPSBNYXRoLm1heCgwLCBleHBhbmRTdGFydCk7XG4gICAgICBpZiAoZXhwYW5kU3RhcnQgIT09IG5ld1JhbmdlLnN0YXJ0KSB7XG4gICAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gZXhwYW5kU3RhcnQ7XG4gICAgICAgIGNvbnRlbnRPZmZzZXQgPSB0aGlzLnNpemVyLmdldFNpemVCZWZvcmUoZXhwYW5kU3RhcnQpO1xuICAgICAgfVxuXG4gICAgICBzcGFjZVRvRmlsbCA9IHZpZXdwb3J0U2l6ZSArIHRoaXMuX21pbkJ1ZmZlclB4O1xuICAgICAgbGV0IGV4cGFuZEVuZCA9IGZpcnN0VmlzaWJsZUluZGV4O1xuICAgICAgd2hpbGUgKHNwYWNlVG9GaWxsID4gMCkge1xuICAgICAgICBzcGFjZVRvRmlsbCAtPSB0aGlzLnNpemVyLmdldFNpemVGb3JJdGVtKCsrZXhwYW5kRW5kKTtcbiAgICAgIH1cbiAgICAgIG5ld1JhbmdlLmVuZCA9IE1hdGgubWluKGRhdGFMZW5ndGgsIGV4cGFuZEVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlbmRlckRhdGFFbmQgPSBjb250ZW50T2Zmc2V0ICsgdGhpcy5zaXplci5nZXRTaXplRm9yUmFuZ2UobmV3UmFuZ2Uuc3RhcnQsIG5ld1JhbmdlLmVuZCk7XG4gICAgICBjb25zdCBjdXJyZW50RW5kQnVmZmVyID0gcmVuZGVyRGF0YUVuZCAtIChzY3JvbGxPZmZzZXQgKyB2aWV3cG9ydFNpemUpO1xuICAgICAgaWYgKGN1cnJlbnRFbmRCdWZmZXIgPCB0aGlzLl9taW5CdWZmZXJQeCAmJiBuZXdSYW5nZS5lbmQgIT09IGRhdGFMZW5ndGgpIHtcbiAgICAgICAgbGV0IHNwYWNlVG9GaWxsID0gdGhpcy5fbWF4QnVmZmVyUHggLSBjdXJyZW50RW5kQnVmZmVyO1xuICAgICAgICBpZiAoc3BhY2VUb0ZpbGwgPCAwKSB7XG4gICAgICAgICAgc3BhY2VUb0ZpbGwgPSBNYXRoLmFicyhzcGFjZVRvRmlsbCkgKyB0aGlzLl9tYXhCdWZmZXJQeDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZXhwYW5kRW5kID0gbmV3UmFuZ2UuZW5kO1xuICAgICAgICB3aGlsZSAoc3BhY2VUb0ZpbGwgPiAwKSB7XG4gICAgICAgICAgc3BhY2VUb0ZpbGwgLT0gdGhpcy5zaXplci5nZXRTaXplRm9ySXRlbSgrK2V4cGFuZEVuZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4cGFuZEVuZCA+IDApIHtcbiAgICAgICAgICBuZXdSYW5nZS5lbmQgPSBNYXRoLm1pbihkYXRhTGVuZ3RoLCBleHBhbmRFbmQpO1xuXG4gICAgICAgICAgc3BhY2VUb0ZpbGwgPSB0aGlzLl9taW5CdWZmZXJQeDtcbiAgICAgICAgICBsZXQgZXhwYW5kU3RhcnQgPSBmaXJzdFZpc2libGVJbmRleDtcbiAgICAgICAgICB3aGlsZSAoc3BhY2VUb0ZpbGwgPiAwKSB7XG4gICAgICAgICAgICBzcGFjZVRvRmlsbCAtPSB0aGlzLnNpemVyLmdldFNpemVGb3JJdGVtKC0tZXhwYW5kU3RhcnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4cGFuZFN0YXJ0ID0gTWF0aC5tYXgoMCwgZXhwYW5kU3RhcnQpO1xuICAgICAgICAgIGlmIChleHBhbmRTdGFydCAhPT0gbmV3UmFuZ2Uuc3RhcnQpIHtcbiAgICAgICAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gZXhwYW5kU3RhcnQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5zaXplci5nZXRTaXplQmVmb3JlKGV4cGFuZFN0YXJ0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAgdGhpcy5fbGFzdEV4Y2Vzc0hlaWdodCA9IGV4Y2Vzc0hlaWdodDtcbiAgICB0aGlzLl92aWV3cG9ydC5zZXRSZW5kZXJlZFJhbmdlKG5ld1JhbmdlKTtcbiAgICB0aGlzLl92aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQoY29udGVudE9mZnNldCArIGV4Y2Vzc0hlaWdodCk7XG4gICAgdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5uZXh0KE1hdGguZmxvb3IoZmlyc3RWaXNpYmxlSW5kZXgpKTtcbiAgfVxuXG59XG4iXX0=