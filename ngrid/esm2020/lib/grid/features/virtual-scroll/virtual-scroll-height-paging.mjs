import { Subject } from 'rxjs';
import { calculateBrowserPxLimit } from './utils';
/**
 * Logic for height paging:
 *
 * The whole logic is here to workaround browser issues with PX limit.
 * With virtual scroll we simulate the height by rendering a small viewport size box that inside
 * we create a fake element that simulate the height of the total items we need to render.
 * When the user scrolls we calculate the items that should be rendered for that scroll position.
 *
 * This is ok, until we reach a limit of maximum height/width a browser can handle which is implementation based.
 * Chrome will break on 34m PX, same for safari but firefox (OSX) it's 17m.
 *
 * What paging does is set a fixed height, which is below the limit of the browser.
 * Then fit the total height required into the fixed height we defined using math.
 *
 * This is done via pages. We split the scroll area into pages, each page we go over will offset the scroll bar a bit
 * to compensate for the gap between the total height and the fixed height.
 *
 * For example, if the total items height is 1000px and the fixed height is 600px, we have a 400px height to compensate while scrolling.
 * If we have 11 pages, that's 10 pages we swap, each swap should compensate 40px so we will in total compensate 400px.
 * When the user scroll's down and reaches the "page" we slightly shift the scroll bar up 40px, giving us 40px more to scroll down, 10 times like this and we get 400px additional scroll area
 * which is what we need for all of our items.
 *
 * This is the theory, in practice this depends on the scroll delta, on large scrolls we can't change the actual scroll position, we just recalculate the current page/offset
 * On small delta's we do calculate and if a fix is required we will do it.
 *
 * This "fix" only happen when the scroll position + delta moves us from a page to the next/prev page.
 * Since we're talking large scale here, the pages are quite big so getting to that point should be rare.
 *
 * The logic here is incomplete, especially when switching from location based calculation where we set the page/offset based on the scroll offset
 * To page based calculation where we calculate the location (scroll offset) based on the page/offset we're in.
 *
 * The 2 methods can't work together because if you do a paged based calc you push the scroll offset which will reflect on the next location based calc.
 *
 * The 2 methods run based on the scroll delta, on large scroll gaps we want to do location based calc because we don't really scroll it might be wheel but also might be dragging the bar.
 * On small incremental wheel events we want to determine when the page shifts.
 *
 * In general, we want to have lower page height which means more offset points.
 * This means more places where the user can "see" these jumps but each jump is minimal.
 * However, if we do large page height, less jumps, we probably be in a situation where the user never see these jumps.
 * The problem is, when the jumps occurs the whole math is useless, and this happens on MOST up scrolls.
 *
 * This is to say, we need to refactor this process to use only one method and find the sweet spot for the page height.
 * Maybe 3 X ViewPort size...
 */
// const LOG = msg => console.log(msg) ;
/* Height limits: Chrome,  Safari: ~34m | FireFox: ~17m
*/
const MAX_SCROLL_HEIGHT = calculateBrowserPxLimit();
export class VirtualScrollHightPaging {
    constructor(viewport) {
        this.viewport = viewport;
        this.afterToEnd = false;
        this.active = false;
        this.activeChanged = new Subject();
        const onContentScrolled = viewport.pblScrollStrategy.onContentScrolled;
        viewport.pblScrollStrategy.onContentScrolled = () => {
            if (this.active) {
                const scrollOffset = viewport.element.scrollTop;
                const delta = scrollOffset - this.prevScrollOffset;
                const viewportSize = delta > 0 ? viewport.getViewportSize() : 80;
                if (Math.abs(delta) > viewportSize) {
                    // LOG(`DELTA#BEFORE ${scrollOffset} - ${this.page}`);
                    this.page = Math.floor(scrollOffset * ((this.totalHeight - viewportSize) / (MAX_SCROLL_HEIGHT - viewportSize)) * (1 / this.pageHeight));
                    // LOG(`DELTA ${scrollOffset} - ${this.page}`);
                    this.offset = Math.round(this.page * this.coff);
                    this.prevScrollOffset = scrollOffset;
                }
                else if (this.prevScrollOffset !== scrollOffset) {
                    // next page
                    if (delta > 0 && scrollOffset + this.offset > (this.page + 1) * this.pageHeight) {
                        // LOG(`NEXT ${scrollOffset}`);
                        this.page += 1;
                        this.offset += this.coff;
                        viewport.element.scrollTop = this.prevScrollOffset = Math.floor(scrollOffset - this.coff);
                        // LOG(`NEXT# 2 ${viewport.element.scrollTop}`);
                        return;
                    }
                    // prev page
                    else if (delta < 0 && scrollOffset + this.offset < this.page * this.pageHeight) {
                        // LOG(`PREV ${scrollOffset}`);
                        this.page -= 1;
                        this.offset -= this.coff;
                        viewport.element.scrollTop = this.prevScrollOffset = Math.floor(scrollOffset + this.coff);
                        // LOG(`PREV# 2 ${viewport.element.scrollTop}`);
                        return;
                    }
                    else {
                        // LOG(`SKIP ${scrollOffset}`);
                        this.prevScrollOffset = scrollOffset;
                    }
                }
            }
            onContentScrolled.call(viewport.pblScrollStrategy);
        };
    }
    transformScrollOffset(originalOffset) {
        return originalOffset + (this.active ? this.offset : 0);
    }
    transformOffsetToRenderedContentStart(originalRenderContentStart) {
        return (!originalRenderContentStart || !this.active)
            ? originalRenderContentStart
            : originalRenderContentStart + this.offset;
    }
    transformRenderedContentOffset(offset, to = 'to-start') {
        if (this.active) {
            if (!this.afterToEnd) {
                offset -= this.offset;
            }
            this.afterToEnd = to === 'to-end';
        }
        return offset;
    }
    transformTotalContentSize(totalHeight, scrollOffset) {
        const wasActive = !!this.active;
        if (totalHeight <= MAX_SCROLL_HEIGHT) {
            this.active = false;
        }
        else if (this.totalHeight !== totalHeight) {
            this.active = true;
            this.totalHeight = totalHeight;
            this.pageHeight = MAX_SCROLL_HEIGHT / 100;
            this.pageCount = Math.ceil(totalHeight / this.pageHeight);
            this.coff = Math.floor((totalHeight - MAX_SCROLL_HEIGHT) / (this.pageCount - 1));
            this.prevScrollOffset = scrollOffset;
            this.offset = this.offset || 0;
            this.page = this.page || 0;
            this.afterToEnd = !!this.afterToEnd;
            totalHeight = MAX_SCROLL_HEIGHT;
        }
        if (wasActive !== this.active) {
            this.activeChanged.next();
        }
        return totalHeight;
    }
    shouldTransformTotalContentSize(totalHeight) {
        if (totalHeight <= MAX_SCROLL_HEIGHT) {
            this.active = false;
        }
        else if (this.totalHeight !== totalHeight) {
            return true;
        }
        return false;
    }
    dispose() {
        this.activeChanged.complete();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwtaGVpZ2h0LXBhZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2ZlYXR1cmVzL3ZpcnR1YWwtc2Nyb2xsL3ZpcnR1YWwtc2Nyb2xsLWhlaWdodC1wYWdpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHbEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQ0c7QUFFSCx3Q0FBd0M7QUFFeEM7RUFDRTtBQUNGLE1BQU0saUJBQWlCLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztBQUVwRCxNQUFNLE9BQU8sd0JBQXdCO0lBY25DLFlBQW9CLFFBQThDO1FBQTlDLGFBQVEsR0FBUixRQUFRLENBQXNDO1FBTmxFLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFFbkIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUVmLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUdsQyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUN2RSxRQUFRLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxFQUFFO1lBQ2xELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDaEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDbkQsTUFBTSxZQUFZLEdBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFF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LElBQUksRUFBRSxDQUFDO1NBQzNCO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUVELCtCQUErQixDQUFDLFdBQW1CO1FBQ2pELElBQUksV0FBVyxJQUFJLGlCQUFpQixFQUFFO1lBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3JCO2FBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFdBQVcsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2FsY3VsYXRlQnJvd3NlclB4TGltaXQgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4vdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50JztcblxuLyoqXG4gKiBMb2dpYyBmb3IgaGVpZ2h0IHBhZ2luZzpcbiAqXG4gKiBUaGUgd2hvbGUgbG9naWMgaXMgaGVyZSB0byB3b3JrYXJvdW5kIGJyb3dzZXIgaXNzdWVzIHdpdGggUFggbGltaXQuXG4gKiBXaXRoIHZpcnR1YWwgc2Nyb2xsIHdlIHNpbXVsYXRlIHRoZSBoZWlnaHQgYnkgcmVuZGVyaW5nIGEgc21hbGwgdmlld3BvcnQgc2l6ZSBib3ggdGhhdCBpbnNpZGVcbiAqIHdlIGNyZWF0ZSBhIGZha2UgZWxlbWVudCB0aGF0IHNpbXVsYXRlIHRoZSBoZWlnaHQgb2YgdGhlIHRvdGFsIGl0ZW1zIHdlIG5lZWQgdG8gcmVuZGVyLlxuICogV2hlbiB0aGUgdXNlciBzY3JvbGxzIHdlIGNhbGN1bGF0ZSB0aGUgaXRlbXMgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQgZm9yIHRoYXQgc2Nyb2xsIHBvc2l0aW9uLlxuICpcbiAqIFRoaXMgaXMgb2ssIHVudGlsIHdlIHJlYWNoIGEgbGltaXQgb2YgbWF4aW11bSBoZWlnaHQvd2lkdGggYSBicm93c2VyIGNhbiBoYW5kbGUgd2hpY2ggaXMgaW1wbGVtZW50YXRpb24gYmFzZWQuXG4gKiBDaHJvbWUgd2lsbCBicmVhayBvbiAzNG0gUFgsIHNhbWUgZm9yIHNhZmFyaSBidXQgZmlyZWZveCAoT1NYKSBpdCdzIDE3bS5cbiAqXG4gKiBXaGF0IHBhZ2luZyBkb2VzIGlzIHNldCBhIGZpeGVkIGhlaWdodCwgd2hpY2ggaXMgYmVsb3cgdGhlIGxpbWl0IG9mIHRoZSBicm93c2VyLlxuICogVGhlbiBmaXQgdGhlIHRvdGFsIGhlaWdodCByZXF1aXJlZCBpbnRvIHRoZSBmaXhlZCBoZWlnaHQgd2UgZGVmaW5lZCB1c2luZyBtYXRoLlxuICpcbiAqIFRoaXMgaXMgZG9uZSB2aWEgcGFnZXMuIFdlIHNwbGl0IHRoZSBzY3JvbGwgYXJlYSBpbnRvIHBhZ2VzLCBlYWNoIHBhZ2Ugd2UgZ28gb3ZlciB3aWxsIG9mZnNldCB0aGUgc2Nyb2xsIGJhciBhIGJpdFxuICogdG8gY29tcGVuc2F0ZSBmb3IgdGhlIGdhcCBiZXR3ZWVuIHRoZSB0b3RhbCBoZWlnaHQgYW5kIHRoZSBmaXhlZCBoZWlnaHQuXG4gKlxuICogRm9yIGV4YW1wbGUsIGlmIHRoZSB0b3RhbCBpdGVtcyBoZWlnaHQgaXMgMTAwMHB4IGFuZCB0aGUgZml4ZWQgaGVpZ2h0IGlzIDYwMHB4LCB3ZSBoYXZlIGEgNDAwcHggaGVpZ2h0IHRvIGNvbXBlbnNhdGUgd2hpbGUgc2Nyb2xsaW5nLlxuICogSWYgd2UgaGF2ZSAxMSBwYWdlcywgdGhhdCdzIDEwIHBhZ2VzIHdlIHN3YXAsIGVhY2ggc3dhcCBzaG91bGQgY29tcGVuc2F0ZSA0MHB4IHNvIHdlIHdpbGwgaW4gdG90YWwgY29tcGVuc2F0ZSA0MDBweC5cbiAqIFdoZW4gdGhlIHVzZXIgc2Nyb2xsJ3MgZG93biBhbmQgcmVhY2hlcyB0aGUgXCJwYWdlXCIgd2Ugc2xpZ2h0bHkgc2hpZnQgdGhlIHNjcm9sbCBiYXIgdXAgNDBweCwgZ2l2aW5nIHVzIDQwcHggbW9yZSB0byBzY3JvbGwgZG93biwgMTAgdGltZXMgbGlrZSB0aGlzIGFuZCB3ZSBnZXQgNDAwcHggYWRkaXRpb25hbCBzY3JvbGwgYXJlYVxuICogd2hpY2ggaXMgd2hhdCB3ZSBuZWVkIGZvciBhbGwgb2Ygb3VyIGl0ZW1zLlxuICpcbiAqIFRoaXMgaXMgdGhlIHRoZW9yeSwgaW4gcHJhY3RpY2UgdGhpcyBkZXBlbmRzIG9uIHRoZSBzY3JvbGwgZGVsdGEsIG9uIGxhcmdlIHNjcm9sbHMgd2UgY2FuJ3QgY2hhbmdlIHRoZSBhY3R1YWwgc2Nyb2xsIHBvc2l0aW9uLCB3ZSBqdXN0IHJlY2FsY3VsYXRlIHRoZSBjdXJyZW50IHBhZ2Uvb2Zmc2V0XG4gKiBPbiBzbWFsbCBkZWx0YSdzIHdlIGRvIGNhbGN1bGF0ZSBhbmQgaWYgYSBmaXggaXMgcmVxdWlyZWQgd2Ugd2lsbCBkbyBpdC5cbiAqXG4gKiBUaGlzIFwiZml4XCIgb25seSBoYXBwZW4gd2hlbiB0aGUgc2Nyb2xsIHBvc2l0aW9uICsgZGVsdGEgbW92ZXMgdXMgZnJvbSBhIHBhZ2UgdG8gdGhlIG5leHQvcHJldiBwYWdlLlxuICogU2luY2Ugd2UncmUgdGFsa2luZyBsYXJnZSBzY2FsZSBoZXJlLCB0aGUgcGFnZXMgYXJlIHF1aXRlIGJpZyBzbyBnZXR0aW5nIHRvIHRoYXQgcG9pbnQgc2hvdWxkIGJlIHJhcmUuXG4gKlxuICogVGhlIGxvZ2ljIGhlcmUgaXMgaW5jb21wbGV0ZSwgZXNwZWNpYWxseSB3aGVuIHN3aXRjaGluZyBmcm9tIGxvY2F0aW9uIGJhc2VkIGNhbGN1bGF0aW9uIHdoZXJlIHdlIHNldCB0aGUgcGFnZS9vZmZzZXQgYmFzZWQgb24gdGhlIHNjcm9sbCBvZmZzZXRcbiAqIFRvIHBhZ2UgYmFzZWQgY2FsY3VsYXRpb24gd2hlcmUgd2UgY2FsY3VsYXRlIHRoZSBsb2NhdGlvbiAoc2Nyb2xsIG9mZnNldCkgYmFzZWQgb24gdGhlIHBhZ2Uvb2Zmc2V0IHdlJ3JlIGluLlxuICpcbiAqIFRoZSAyIG1ldGhvZHMgY2FuJ3Qgd29yayB0b2dldGhlciBiZWNhdXNlIGlmIHlvdSBkbyBhIHBhZ2VkIGJhc2VkIGNhbGMgeW91IHB1c2ggdGhlIHNjcm9sbCBvZmZzZXQgd2hpY2ggd2lsbCByZWZsZWN0IG9uIHRoZSBuZXh0IGxvY2F0aW9uIGJhc2VkIGNhbGMuXG4gKlxuICogVGhlIDIgbWV0aG9kcyBydW4gYmFzZWQgb24gdGhlIHNjcm9sbCBkZWx0YSwgb24gbGFyZ2Ugc2Nyb2xsIGdhcHMgd2Ugd2FudCB0byBkbyBsb2NhdGlvbiBiYXNlZCBjYWxjIGJlY2F1c2Ugd2UgZG9uJ3QgcmVhbGx5IHNjcm9sbCBpdCBtaWdodCBiZSB3aGVlbCBidXQgYWxzbyBtaWdodCBiZSBkcmFnZ2luZyB0aGUgYmFyLlxuICogT24gc21hbGwgaW5jcmVtZW50YWwgd2hlZWwgZXZlbnRzIHdlIHdhbnQgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIHBhZ2Ugc2hpZnRzLlxuICpcbiAqIEluIGdlbmVyYWwsIHdlIHdhbnQgdG8gaGF2ZSBsb3dlciBwYWdlIGhlaWdodCB3aGljaCBtZWFucyBtb3JlIG9mZnNldCBwb2ludHMuXG4gKiBUaGlzIG1lYW5zIG1vcmUgcGxhY2VzIHdoZXJlIHRoZSB1c2VyIGNhbiBcInNlZVwiIHRoZXNlIGp1bXBzIGJ1dCBlYWNoIGp1bXAgaXMgbWluaW1hbC5cbiAqIEhvd2V2ZXIsIGlmIHdlIGRvIGxhcmdlIHBhZ2UgaGVpZ2h0LCBsZXNzIGp1bXBzLCB3ZSBwcm9iYWJseSBiZSBpbiBhIHNpdHVhdGlvbiB3aGVyZSB0aGUgdXNlciBuZXZlciBzZWUgdGhlc2UganVtcHMuXG4gKiBUaGUgcHJvYmxlbSBpcywgd2hlbiB0aGUganVtcHMgb2NjdXJzIHRoZSB3aG9sZSBtYXRoIGlzIHVzZWxlc3MsIGFuZCB0aGlzIGhhcHBlbnMgb24gTU9TVCB1cCBzY3JvbGxzLlxuICpcbiAqIFRoaXMgaXMgdG8gc2F5LCB3ZSBuZWVkIHRvIHJlZmFjdG9yIHRoaXMgcHJvY2VzcyB0byB1c2Ugb25seSBvbmUgbWV0aG9kIGFuZCBmaW5kIHRoZSBzd2VldCBzcG90IGZvciB0aGUgcGFnZSBoZWlnaHQuXG4gKiBNYXliZSAzIFggVmlld1BvcnQgc2l6ZS4uLlxuICovXG5cbi8vIGNvbnN0IExPRyA9IG1zZyA9PiBjb25zb2xlLmxvZyhtc2cpIDtcblxuLyogSGVpZ2h0IGxpbWl0czogQ2hyb21lLCAgU2FmYXJpOiB+MzRtIHwgRmlyZUZveDogfjE3bVxuKi9cbmNvbnN0IE1BWF9TQ1JPTExfSEVJR0hUID0gY2FsY3VsYXRlQnJvd3NlclB4TGltaXQoKTtcblxuZXhwb3J0IGNsYXNzIFZpcnR1YWxTY3JvbGxIaWdodFBhZ2luZyB7XG4gIHRvdGFsSGVpZ2h0OiBudW1iZXI7XG4gIHBhZ2VIZWlnaHQ6IG51bWJlcjtcbiAgcGFnZUNvdW50OiBudW1iZXI7XG4gIGNvZmY6IG51bWJlcjtcbiAgcHJldlNjcm9sbE9mZnNldDogbnVtYmVyO1xuICBvZmZzZXQ6IG51bWJlcjtcbiAgcGFnZTogbnVtYmVyO1xuICBhZnRlclRvRW5kID0gZmFsc2U7XG5cbiAgYWN0aXZlID0gZmFsc2U7XG5cbiAgYWN0aXZlQ2hhbmdlZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB2aWV3cG9ydDogUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50KSB7XG4gICAgY29uc3Qgb25Db250ZW50U2Nyb2xsZWQgPSB2aWV3cG9ydC5wYmxTY3JvbGxTdHJhdGVneS5vbkNvbnRlbnRTY3JvbGxlZDtcbiAgICB2aWV3cG9ydC5wYmxTY3JvbGxTdHJhdGVneS5vbkNvbnRlbnRTY3JvbGxlZCA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICBjb25zdCBzY3JvbGxPZmZzZXQgPSB2aWV3cG9ydC5lbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBzY3JvbGxPZmZzZXQgLSB0aGlzLnByZXZTY3JvbGxPZmZzZXQ7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0U2l6ZSA9ICBkZWx0YSA+IDAgPyB2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSA6IDgwO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YSkgPiB2aWV3cG9ydFNpemUpIHtcbiAgICAgICAgICAvLyBMT0coYERFTFRBI0JFRk9SRSAke3Njcm9sbE9mZnNldH0gLSAke3RoaXMucGFnZX1gKTtcbiAgICAgICAgICB0aGlzLnBhZ2UgPSBNYXRoLmZsb29yKHNjcm9sbE9mZnNldCAqICgodGhpcy50b3RhbEhlaWdodCAtIHZpZXdwb3J0U2l6ZSkgLyAoTUFYX1NDUk9MTF9IRUlHSFQgLSB2aWV3cG9ydFNpemUpKSAqICgxIC8gdGhpcy5wYWdlSGVpZ2h0KSk7XG4gICAgICAgICAgLy8gTE9HKGBERUxUQSAke3Njcm9sbE9mZnNldH0gLSAke3RoaXMucGFnZX1gKTtcbiAgICAgICAgICB0aGlzLm9mZnNldCA9IE1hdGgucm91bmQodGhpcy5wYWdlICogdGhpcy5jb2ZmKTtcbiAgICAgICAgICB0aGlzLnByZXZTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2U2Nyb2xsT2Zmc2V0ICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgICAvLyBuZXh0IHBhZ2VcbiAgICAgICAgICBpZiAoZGVsdGEgPiAwICYmIHNjcm9sbE9mZnNldCArIHRoaXMub2Zmc2V0ID4gKHRoaXMucGFnZSArIDEpICogdGhpcy5wYWdlSGVpZ2h0KSB7XG4gICAgICAgICAgICAvLyBMT0coYE5FWFQgJHtzY3JvbGxPZmZzZXR9YCk7XG4gICAgICAgICAgICB0aGlzLnBhZ2UgKz0gMTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHRoaXMuY29mZjtcbiAgICAgICAgICAgIHZpZXdwb3J0LmVsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5wcmV2U2Nyb2xsT2Zmc2V0ID0gTWF0aC5mbG9vcihzY3JvbGxPZmZzZXQgLSB0aGlzLmNvZmYpO1xuICAgICAgICAgICAgLy8gTE9HKGBORVhUIyAyICR7dmlld3BvcnQuZWxlbWVudC5zY3JvbGxUb3B9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHByZXYgcGFnZVxuICAgICAgICAgIGVsc2UgaWYgKGRlbHRhIDwgMCAmJiBzY3JvbGxPZmZzZXQgKyB0aGlzLm9mZnNldCA8IHRoaXMucGFnZSAqIHRoaXMucGFnZUhlaWdodCkge1xuICAgICAgICAgICAgLy8gTE9HKGBQUkVWICR7c2Nyb2xsT2Zmc2V0fWApO1xuICAgICAgICAgICAgdGhpcy5wYWdlIC09IDE7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCAtPSB0aGlzLmNvZmY7XG4gICAgICAgICAgICB2aWV3cG9ydC5lbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMucHJldlNjcm9sbE9mZnNldCA9IE1hdGguZmxvb3Ioc2Nyb2xsT2Zmc2V0ICsgdGhpcy5jb2ZmKTtcbiAgICAgICAgICAgIC8vIExPRyhgUFJFViMgMiAke3ZpZXdwb3J0LmVsZW1lbnQuc2Nyb2xsVG9wfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIExPRyhgU0tJUCAke3Njcm9sbE9mZnNldH1gKTtcbiAgICAgICAgICAgIHRoaXMucHJldlNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9uQ29udGVudFNjcm9sbGVkLmNhbGwodmlld3BvcnQucGJsU2Nyb2xsU3RyYXRlZ3kpO1xuICAgIH1cbiAgfVxuXG4gIHRyYW5zZm9ybVNjcm9sbE9mZnNldChvcmlnaW5hbE9mZnNldDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gb3JpZ2luYWxPZmZzZXQgKyAodGhpcy5hY3RpdmUgPyB0aGlzLm9mZnNldCA6IDApO1xuICB9XG5cbiAgdHJhbnNmb3JtT2Zmc2V0VG9SZW5kZXJlZENvbnRlbnRTdGFydChvcmlnaW5hbFJlbmRlckNvbnRlbnRTdGFydDogbnVtYmVyIHwgbnVsbCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiAoIW9yaWdpbmFsUmVuZGVyQ29udGVudFN0YXJ0IHx8ICF0aGlzLmFjdGl2ZSlcbiAgICAgPyBvcmlnaW5hbFJlbmRlckNvbnRlbnRTdGFydFxuICAgICA6IG9yaWdpbmFsUmVuZGVyQ29udGVudFN0YXJ0ICsgdGhpcy5vZmZzZXRcbiAgICA7XG4gIH1cblxuICB0cmFuc2Zvcm1SZW5kZXJlZENvbnRlbnRPZmZzZXQob2Zmc2V0OiBudW1iZXIsIHRvOiAndG8tc3RhcnQnIHwgJ3RvLWVuZCcgPSAndG8tc3RhcnQnKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIGlmICghdGhpcy5hZnRlclRvRW5kKSB7XG4gICAgICAgIG9mZnNldCAtPSB0aGlzLm9mZnNldDtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWZ0ZXJUb0VuZCA9IHRvID09PSAndG8tZW5kJztcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIHRyYW5zZm9ybVRvdGFsQ29udGVudFNpemUodG90YWxIZWlnaHQ6IG51bWJlciwgc2Nyb2xsT2Zmc2V0OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IHdhc0FjdGl2ZSA9ICEhdGhpcy5hY3RpdmU7XG4gICAgaWYgKHRvdGFsSGVpZ2h0IDw9IE1BWF9TQ1JPTExfSEVJR0hUKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy50b3RhbEhlaWdodCAhPT0gdG90YWxIZWlnaHQpIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIHRoaXMudG90YWxIZWlnaHQgPSB0b3RhbEhlaWdodDtcbiAgICAgIHRoaXMucGFnZUhlaWdodCA9IE1BWF9TQ1JPTExfSEVJR0hUIC8gMTAwO1xuICAgICAgdGhpcy5wYWdlQ291bnQgPSBNYXRoLmNlaWwodG90YWxIZWlnaHQgLyB0aGlzLnBhZ2VIZWlnaHQpO1xuICAgICAgdGhpcy5jb2ZmID0gTWF0aC5mbG9vcigodG90YWxIZWlnaHQgLSBNQVhfU0NST0xMX0hFSUdIVCkgLyAodGhpcy5wYWdlQ291bnQgLSAxKSk7XG4gICAgICB0aGlzLnByZXZTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0IHx8IDA7XG4gICAgICB0aGlzLnBhZ2UgPSB0aGlzLnBhZ2UgfHwgMDtcbiAgICAgIHRoaXMuYWZ0ZXJUb0VuZCA9ICEhdGhpcy5hZnRlclRvRW5kO1xuICAgICAgdG90YWxIZWlnaHQgPSBNQVhfU0NST0xMX0hFSUdIVDtcbiAgICB9XG4gICAgaWYgKHdhc0FjdGl2ZSAhPT0gdGhpcy5hY3RpdmUpIHtcbiAgICAgIHRoaXMuYWN0aXZlQ2hhbmdlZC5uZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbEhlaWdodDtcbiAgfVxuXG4gIHNob3VsZFRyYW5zZm9ybVRvdGFsQ29udGVudFNpemUodG90YWxIZWlnaHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0b3RhbEhlaWdodCA8PSBNQVhfU0NST0xMX0hFSUdIVCkge1xuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudG90YWxIZWlnaHQgIT09IHRvdGFsSGVpZ2h0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmFjdGl2ZUNoYW5nZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19