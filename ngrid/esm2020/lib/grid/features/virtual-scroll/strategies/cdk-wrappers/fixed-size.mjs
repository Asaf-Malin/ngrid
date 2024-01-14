import { FixedSizeVirtualScrollStrategy } from './fixed-size-cdk';
export class PblNgridFixedSizeVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
    constructor(itemSize, minBufferPx, maxBufferPx) {
        super(itemSize, minBufferPx, maxBufferPx);
        this.itemSize = itemSize;
    }
    get type() { return 'vScrollFixed'; }
    attachExtApi(extApi) {
        this.extApi = extApi;
    }
    attach(viewport) {
        if (!this.extApi) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid use of attach, you must first attach `PblNgridExtensionApi`');
            }
        }
        super.attach(this.viewport = viewport);
    }
    onContentScrolled() {
        // https://github.com/shlomiassaf/ngrid/issues/11
        // This is a workaround an issue with FixedSizeVirtualScrollStrategy
        // When:
        //    - The rendered data is changed so the data length is now LOWER then the current range (end - start)
        //    - The rendering direction is towards the top (start > end)
        //
        // For the issue to occur a big gap between the data length and the range length (gap), which does not happen on normal scrolling
        // but only when the data source is replaced (e.g. filtering).
        //
        // In such cases `onDataLengthChanged` is called which will call `_updateRenderedRange` which will calculate a new range
        // that is big, it will give the `start` a new value which creates the big gap.
        // It will then calculate a new "end" and leave the "start" so we have a big gap, larger then the viewport size.
        // After that it will create the new offset which is the itemSize * start, which is a bit lower then the offset but is large and again does not fit the viewport size
        // The scroll change will trigger `onContentScrolled` which will call `_updateRenderedRange` again,
        // with the same outcome, reducing the offset slightly, calling `onContentScrolled` again.
        // It will repeat until reaching the proper offset.
        //
        // The amount of offset reduced each time is approx the size of the buffers. (mix/max Buffer).
        //
        // This strategy is here only because of this error, it will let the initial update run and catch it's subsequent scroll event.
        if (!this.viewport) {
            return;
        }
        let { start, end } = this.viewport.getRenderedRange();
        const rangeLength = end - start;
        const dataLength = this.viewport.getDataLength();
        if (rangeLength < 0 && dataLength < -rangeLength) {
            start = dataLength - end;
            this.viewport.setRenderedRange({ start, end });
            this.viewport.setRenderedContentOffset(this.itemSize * start);
            // this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
        }
        else {
            super.onContentScrolled();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWQtc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2ZlYXR1cmVzL3ZpcnR1YWwtc2Nyb2xsL3N0cmF0ZWdpZXMvY2RrLXdyYXBwZXJzL2ZpeGVkLXNpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFRbEUsTUFBTSxPQUFPLHNDQUF1QyxTQUFRLDhCQUE4QjtJQU94RixZQUFvQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsV0FBbUI7UUFDNUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFEeEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtJQUVwQyxDQUFDO0lBUEQsSUFBSSxJQUFJLEtBQUssT0FBTyxjQUF1QixDQUFDLENBQUMsQ0FBQztJQVM5QyxZQUFZLENBQUMsTUFBNEI7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUE4QztRQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQzthQUN4RjtTQUNGO1FBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFHRCxpQkFBaUI7UUFDZixpREFBaUQ7UUFFakQsb0VBQW9FO1FBQ3BFLFFBQVE7UUFDUix5R0FBeUc7UUFDekcsZ0VBQWdFO1FBQ2hFLEVBQUU7UUFDRixpSUFBaUk7UUFDakksOERBQThEO1FBQzlELEVBQUU7UUFDRix3SEFBd0g7UUFDeEgsK0VBQStFO1FBQy9FLGdIQUFnSDtRQUNoSCxxS0FBcUs7UUFDckssbUdBQW1HO1FBQ25HLDBGQUEwRjtRQUMxRixtREFBbUQ7UUFDbkQsRUFBRTtRQUNGLDhGQUE4RjtRQUM5RixFQUFFO1FBQ0YsK0hBQStIO1FBQy9ILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE9BQU87U0FDUjtRQUNELElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3RELE1BQU0sV0FBVyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqRCxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQUksVUFBVSxHQUFHLENBQUMsV0FBVyxFQUFFO1lBQ2hELEtBQUssR0FBRyxVQUFVLEdBQUcsR0FBRyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDOUQsaUVBQWlFO1NBQ2xFO2FBQU07WUFDTCxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBibE5ncmlkRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQgfSBmcm9tICcuLi8uLi92aXJ0dWFsLXNjcm9sbC12aWV3cG9ydC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuL2ZpeGVkLXNpemUtY2RrJztcblxuZGVjbGFyZSBtb2R1bGUgJy4uL3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFZpcnR1YWxTY3JvbGxTdHJhdGVneU1hcCB7XG4gICAgdlNjcm9sbEZpeGVkOiBQYmxOZ3JpZEZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgZXh0ZW5kcyBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgaW1wbGVtZW50cyBQYmxOZ3JpZFZpcnR1YWxTY3JvbGxTdHJhdGVneTwndlNjcm9sbEZpeGVkJz4ge1xuXG4gIGdldCB0eXBlKCkgeyByZXR1cm4gJ3ZTY3JvbGxGaXhlZCcgYXMgY29uc3Q7IH1cblxuICBwcml2YXRlIHZpZXdwb3J0OiBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQ7XG4gIHByb3RlY3RlZCBleHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlbVNpemU6IG51bWJlciwgbWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIHN1cGVyKGl0ZW1TaXplLCBtaW5CdWZmZXJQeCwgbWF4QnVmZmVyUHgpO1xuICB9XG5cbiAgYXR0YWNoRXh0QXBpKGV4dEFwaTogUGJsTmdyaWRFeHRlbnNpb25BcGkpOiB2b2lkIHtcbiAgICB0aGlzLmV4dEFwaSA9IGV4dEFwaTtcbiAgfVxuXG4gIGF0dGFjaCh2aWV3cG9ydDogUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmV4dEFwaSkge1xuICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdXNlIG9mIGF0dGFjaCwgeW91IG11c3QgZmlyc3QgYXR0YWNoIGBQYmxOZ3JpZEV4dGVuc2lvbkFwaWAnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuYXR0YWNoKHRoaXMudmlld3BvcnQgPSB2aWV3cG9ydCk7XG4gIH1cblxuXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaGxvbWlhc3NhZi9uZ3JpZC9pc3N1ZXMvMTFcblxuICAgIC8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGFuIGlzc3VlIHdpdGggRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5XG4gICAgLy8gV2hlbjpcbiAgICAvLyAgICAtIFRoZSByZW5kZXJlZCBkYXRhIGlzIGNoYW5nZWQgc28gdGhlIGRhdGEgbGVuZ3RoIGlzIG5vdyBMT1dFUiB0aGVuIHRoZSBjdXJyZW50IHJhbmdlIChlbmQgLSBzdGFydClcbiAgICAvLyAgICAtIFRoZSByZW5kZXJpbmcgZGlyZWN0aW9uIGlzIHRvd2FyZHMgdGhlIHRvcCAoc3RhcnQgPiBlbmQpXG4gICAgLy9cbiAgICAvLyBGb3IgdGhlIGlzc3VlIHRvIG9jY3VyIGEgYmlnIGdhcCBiZXR3ZWVuIHRoZSBkYXRhIGxlbmd0aCBhbmQgdGhlIHJhbmdlIGxlbmd0aCAoZ2FwKSwgd2hpY2ggZG9lcyBub3QgaGFwcGVuIG9uIG5vcm1hbCBzY3JvbGxpbmdcbiAgICAvLyBidXQgb25seSB3aGVuIHRoZSBkYXRhIHNvdXJjZSBpcyByZXBsYWNlZCAoZS5nLiBmaWx0ZXJpbmcpLlxuICAgIC8vXG4gICAgLy8gSW4gc3VjaCBjYXNlcyBgb25EYXRhTGVuZ3RoQ2hhbmdlZGAgaXMgY2FsbGVkIHdoaWNoIHdpbGwgY2FsbCBgX3VwZGF0ZVJlbmRlcmVkUmFuZ2VgIHdoaWNoIHdpbGwgY2FsY3VsYXRlIGEgbmV3IHJhbmdlXG4gICAgLy8gdGhhdCBpcyBiaWcsIGl0IHdpbGwgZ2l2ZSB0aGUgYHN0YXJ0YCBhIG5ldyB2YWx1ZSB3aGljaCBjcmVhdGVzIHRoZSBiaWcgZ2FwLlxuICAgIC8vIEl0IHdpbGwgdGhlbiBjYWxjdWxhdGUgYSBuZXcgXCJlbmRcIiBhbmQgbGVhdmUgdGhlIFwic3RhcnRcIiBzbyB3ZSBoYXZlIGEgYmlnIGdhcCwgbGFyZ2VyIHRoZW4gdGhlIHZpZXdwb3J0IHNpemUuXG4gICAgLy8gQWZ0ZXIgdGhhdCBpdCB3aWxsIGNyZWF0ZSB0aGUgbmV3IG9mZnNldCB3aGljaCBpcyB0aGUgaXRlbVNpemUgKiBzdGFydCwgd2hpY2ggaXMgYSBiaXQgbG93ZXIgdGhlbiB0aGUgb2Zmc2V0IGJ1dCBpcyBsYXJnZSBhbmQgYWdhaW4gZG9lcyBub3QgZml0IHRoZSB2aWV3cG9ydCBzaXplXG4gICAgLy8gVGhlIHNjcm9sbCBjaGFuZ2Ugd2lsbCB0cmlnZ2VyIGBvbkNvbnRlbnRTY3JvbGxlZGAgd2hpY2ggd2lsbCBjYWxsIGBfdXBkYXRlUmVuZGVyZWRSYW5nZWAgYWdhaW4sXG4gICAgLy8gd2l0aCB0aGUgc2FtZSBvdXRjb21lLCByZWR1Y2luZyB0aGUgb2Zmc2V0IHNsaWdodGx5LCBjYWxsaW5nIGBvbkNvbnRlbnRTY3JvbGxlZGAgYWdhaW4uXG4gICAgLy8gSXQgd2lsbCByZXBlYXQgdW50aWwgcmVhY2hpbmcgdGhlIHByb3BlciBvZmZzZXQuXG4gICAgLy9cbiAgICAvLyBUaGUgYW1vdW50IG9mIG9mZnNldCByZWR1Y2VkIGVhY2ggdGltZSBpcyBhcHByb3ggdGhlIHNpemUgb2YgdGhlIGJ1ZmZlcnMuIChtaXgvbWF4IEJ1ZmZlcikuXG4gICAgLy9cbiAgICAvLyBUaGlzIHN0cmF0ZWd5IGlzIGhlcmUgb25seSBiZWNhdXNlIG9mIHRoaXMgZXJyb3IsIGl0IHdpbGwgbGV0IHRoZSBpbml0aWFsIHVwZGF0ZSBydW4gYW5kIGNhdGNoIGl0J3Mgc3Vic2VxdWVudCBzY3JvbGwgZXZlbnQuXG4gICAgaWYgKCF0aGlzLnZpZXdwb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMudmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuICAgIGNvbnN0IHJhbmdlTGVuZ3RoID0gZW5kIC0gc3RhcnQ7XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IHRoaXMudmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpO1xuICAgIGlmIChyYW5nZUxlbmd0aCA8IDAgJiYgZGF0YUxlbmd0aCA8IC1yYW5nZUxlbmd0aCkge1xuICAgICAgc3RhcnQgPSBkYXRhTGVuZ3RoIC0gZW5kO1xuICAgICAgdGhpcy52aWV3cG9ydC5zZXRSZW5kZXJlZFJhbmdlKHsgc3RhcnQsIGVuZCB9KTtcbiAgICAgIHRoaXMudmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuaXRlbVNpemUgKiBzdGFydCk7XG4gICAgICAvLyB0aGlzLl9zY3JvbGxlZEluZGV4Q2hhbmdlLm5leHQoTWF0aC5mbG9vcihmaXJzdFZpc2libGVJbmRleCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5vbkNvbnRlbnRTY3JvbGxlZCgpO1xuICAgIH1cbiAgfVxufVxuIl19