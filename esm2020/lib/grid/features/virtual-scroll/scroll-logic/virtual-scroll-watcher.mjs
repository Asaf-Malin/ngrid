/**
 * Returns an handler (function) that should be called when an element starts scrolling.
 * The handler will track the scrolling until done emitting 2 events in the process:
 *
 * - `PblCdkVirtualScrollViewportComponent.scrolling`: Update the state of scrolling
 * - `PblCdkVirtualScrollViewportComponent.scrollFrameRate`: Update the estimated frame rate while scrolling
 *
 * `scrollFrameRate` is measured based on the frequency `requestAnimationFrame` is fired on.
 * The event will fire every 500ms, starting after 500ms of scrolling have passed which will allow decent sampling time.
 */
export function createScrollWatcherFn(vScrollViewport) {
    let scrolling = 0;
    let lastOffset = vScrollViewport.measureScrollOffset();
    return () => {
        /*  `scrolling` is a boolean flag that turns on with the first `scroll` events and ends after 2 browser animation frames have passed without a `scroll` event.
            This is an attempt to detect a scroll end event, which does not exist.
    
            `scrollFrameRate` is a number that represent a rough estimation of the frame rate by measuring the time passed between each request animation frame
            while the `scrolling` state is true. The frame rate value is the average frame rate from all measurements since the scrolling began.
            To estimate the frame rate, a significant number of measurements is required so value is emitted every 500 ms.
            This means that a single scroll or short scroll bursts will not result in a `scrollFrameRate` emissions.
    
        */
        if (scrolling === 0) {
            /*  The measure array holds values required for frame rate measurements.
                [0] Storage for last timestamp taken
                [1] The sum of all measurements taken (a measurement is the time between 2 snapshots)
                [2] The count of all measurements
                [3] The sum of all measurements taken WITHIN the current buffer window. This buffer is flushed into [1] every X ms (see buggerWindow const).
            */
            const bufferWindow = 499;
            const measure = [performance.now(), 0, 0, 0];
            const offset = vScrollViewport.measureScrollOffset();
            if (lastOffset === offset) {
                return;
            }
            const delta = lastOffset < offset ? 1 : -1;
            vScrollViewport.scrolling.next(delta);
            const raf = () => {
                const time = -measure[0] + (measure[0] = performance.now());
                if (time > 5) {
                    measure[1] += time;
                    measure[2] += 1;
                }
                if (scrolling === -1) {
                    scrolling = 0;
                    lastOffset = vScrollViewport.measureScrollOffset();
                    vScrollViewport.scrolling.next(0);
                }
                else {
                    if (measure[1] > bufferWindow) {
                        measure[3] += measure[1];
                        measure[1] = 0;
                        vScrollViewport.scrollFrameRate.emit(1000 / (measure[3] / measure[2]));
                    }
                    scrolling = scrolling === 1 ? -1 : 1;
                    requestAnimationFrame(raf);
                }
            };
            requestAnimationFrame(raf);
        }
        scrolling++;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwtd2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2ZlYXR1cmVzL3ZpcnR1YWwtc2Nyb2xsL3Njcm9sbC1sb2dpYy92aXJ0dWFsLXNjcm9sbC13YXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxlQUFxRDtJQUN6RixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFFdkQsT0FBTyxHQUFHLEVBQUU7UUFDVjs7Ozs7Ozs7VUFRRTtRQUNGLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtZQUNuQjs7Ozs7Y0FLRTtZQUNGLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztZQUN6QixNQUFNLE9BQU8sR0FBRyxDQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3JELElBQUksVUFBVSxLQUFLLE1BQU0sRUFBRTtnQkFBRSxPQUFPO2FBQUU7WUFDdEMsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV0QyxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzVELElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtvQkFDWixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO29CQUNuQixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQjtnQkFDRCxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDcEIsU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDZCxVQUFVLEdBQUcsZUFBZSxDQUFDLG1CQUFtQixFQUFFLENBQUM7b0JBQ25ELGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNuQztxQkFDSTtvQkFDSCxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLEVBQUU7d0JBQzdCLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2YsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3RFO29CQUNELFNBQVMsR0FBRyxTQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDNUI7WUFDSCxDQUFDLENBQUM7WUFDRixxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUNELFNBQVMsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4uL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0LmNvbXBvbmVudCc7XG5cbi8qKlxuICogUmV0dXJucyBhbiBoYW5kbGVyIChmdW5jdGlvbikgdGhhdCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gYW4gZWxlbWVudCBzdGFydHMgc2Nyb2xsaW5nLlxuICogVGhlIGhhbmRsZXIgd2lsbCB0cmFjayB0aGUgc2Nyb2xsaW5nIHVudGlsIGRvbmUgZW1pdHRpbmcgMiBldmVudHMgaW4gdGhlIHByb2Nlc3M6XG4gKlxuICogLSBgUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50LnNjcm9sbGluZ2A6IFVwZGF0ZSB0aGUgc3RhdGUgb2Ygc2Nyb2xsaW5nXG4gKiAtIGBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQuc2Nyb2xsRnJhbWVSYXRlYDogVXBkYXRlIHRoZSBlc3RpbWF0ZWQgZnJhbWUgcmF0ZSB3aGlsZSBzY3JvbGxpbmdcbiAqXG4gKiBgc2Nyb2xsRnJhbWVSYXRlYCBpcyBtZWFzdXJlZCBiYXNlZCBvbiB0aGUgZnJlcXVlbmN5IGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGlzIGZpcmVkIG9uLlxuICogVGhlIGV2ZW50IHdpbGwgZmlyZSBldmVyeSA1MDBtcywgc3RhcnRpbmcgYWZ0ZXIgNTAwbXMgb2Ygc2Nyb2xsaW5nIGhhdmUgcGFzc2VkIHdoaWNoIHdpbGwgYWxsb3cgZGVjZW50IHNhbXBsaW5nIHRpbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTY3JvbGxXYXRjaGVyRm4odlNjcm9sbFZpZXdwb3J0OiBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnQpIHtcbiAgbGV0IHNjcm9sbGluZyA9IDA7XG4gIGxldCBsYXN0T2Zmc2V0ID0gdlNjcm9sbFZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIC8qICBgc2Nyb2xsaW5nYCBpcyBhIGJvb2xlYW4gZmxhZyB0aGF0IHR1cm5zIG9uIHdpdGggdGhlIGZpcnN0IGBzY3JvbGxgIGV2ZW50cyBhbmQgZW5kcyBhZnRlciAyIGJyb3dzZXIgYW5pbWF0aW9uIGZyYW1lcyBoYXZlIHBhc3NlZCB3aXRob3V0IGEgYHNjcm9sbGAgZXZlbnQuXG4gICAgICAgIFRoaXMgaXMgYW4gYXR0ZW1wdCB0byBkZXRlY3QgYSBzY3JvbGwgZW5kIGV2ZW50LCB3aGljaCBkb2VzIG5vdCBleGlzdC5cblxuICAgICAgICBgc2Nyb2xsRnJhbWVSYXRlYCBpcyBhIG51bWJlciB0aGF0IHJlcHJlc2VudCBhIHJvdWdoIGVzdGltYXRpb24gb2YgdGhlIGZyYW1lIHJhdGUgYnkgbWVhc3VyaW5nIHRoZSB0aW1lIHBhc3NlZCBiZXR3ZWVuIGVhY2ggcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcbiAgICAgICAgd2hpbGUgdGhlIGBzY3JvbGxpbmdgIHN0YXRlIGlzIHRydWUuIFRoZSBmcmFtZSByYXRlIHZhbHVlIGlzIHRoZSBhdmVyYWdlIGZyYW1lIHJhdGUgZnJvbSBhbGwgbWVhc3VyZW1lbnRzIHNpbmNlIHRoZSBzY3JvbGxpbmcgYmVnYW4uXG4gICAgICAgIFRvIGVzdGltYXRlIHRoZSBmcmFtZSByYXRlLCBhIHNpZ25pZmljYW50IG51bWJlciBvZiBtZWFzdXJlbWVudHMgaXMgcmVxdWlyZWQgc28gdmFsdWUgaXMgZW1pdHRlZCBldmVyeSA1MDAgbXMuXG4gICAgICAgIFRoaXMgbWVhbnMgdGhhdCBhIHNpbmdsZSBzY3JvbGwgb3Igc2hvcnQgc2Nyb2xsIGJ1cnN0cyB3aWxsIG5vdCByZXN1bHQgaW4gYSBgc2Nyb2xsRnJhbWVSYXRlYCBlbWlzc2lvbnMuXG5cbiAgICAqL1xuICAgIGlmIChzY3JvbGxpbmcgPT09IDApIHtcbiAgICAgIC8qICBUaGUgbWVhc3VyZSBhcnJheSBob2xkcyB2YWx1ZXMgcmVxdWlyZWQgZm9yIGZyYW1lIHJhdGUgbWVhc3VyZW1lbnRzLlxuICAgICAgICAgIFswXSBTdG9yYWdlIGZvciBsYXN0IHRpbWVzdGFtcCB0YWtlblxuICAgICAgICAgIFsxXSBUaGUgc3VtIG9mIGFsbCBtZWFzdXJlbWVudHMgdGFrZW4gKGEgbWVhc3VyZW1lbnQgaXMgdGhlIHRpbWUgYmV0d2VlbiAyIHNuYXBzaG90cylcbiAgICAgICAgICBbMl0gVGhlIGNvdW50IG9mIGFsbCBtZWFzdXJlbWVudHNcbiAgICAgICAgICBbM10gVGhlIHN1bSBvZiBhbGwgbWVhc3VyZW1lbnRzIHRha2VuIFdJVEhJTiB0aGUgY3VycmVudCBidWZmZXIgd2luZG93LiBUaGlzIGJ1ZmZlciBpcyBmbHVzaGVkIGludG8gWzFdIGV2ZXJ5IFggbXMgKHNlZSBidWdnZXJXaW5kb3cgY29uc3QpLlxuICAgICAgKi9cbiAgICAgIGNvbnN0IGJ1ZmZlcldpbmRvdyA9IDQ5OTtcbiAgICAgIGNvbnN0IG1lYXN1cmUgPSBbIHBlcmZvcm1hbmNlLm5vdygpLCAwLCAwLCAwIF07XG4gICAgICBjb25zdCBvZmZzZXQgPSB2U2Nyb2xsVmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgICAgaWYgKGxhc3RPZmZzZXQgPT09IG9mZnNldCkgeyByZXR1cm47IH1cbiAgICAgIGNvbnN0IGRlbHRhID0gbGFzdE9mZnNldCA8IG9mZnNldCA/IDEgOiAtMTtcblxuICAgICAgdlNjcm9sbFZpZXdwb3J0LnNjcm9sbGluZy5uZXh0KGRlbHRhKTtcblxuICAgICAgY29uc3QgcmFmID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0aW1lID0gLW1lYXN1cmVbMF0gKyAobWVhc3VyZVswXSA9IHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgICAgaWYgKHRpbWUgPiA1KSB7XG4gICAgICAgICAgbWVhc3VyZVsxXSArPSB0aW1lO1xuICAgICAgICAgIG1lYXN1cmVbMl0gKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2Nyb2xsaW5nID09PSAtMSkge1xuICAgICAgICAgIHNjcm9sbGluZyA9IDA7XG4gICAgICAgICAgbGFzdE9mZnNldCA9IHZTY3JvbGxWaWV3cG9ydC5tZWFzdXJlU2Nyb2xsT2Zmc2V0KCk7XG4gICAgICAgICAgdlNjcm9sbFZpZXdwb3J0LnNjcm9sbGluZy5uZXh0KDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChtZWFzdXJlWzFdID4gYnVmZmVyV2luZG93KSB7XG4gICAgICAgICAgICBtZWFzdXJlWzNdICs9IG1lYXN1cmVbMV07XG4gICAgICAgICAgICBtZWFzdXJlWzFdID0gMDtcbiAgICAgICAgICAgIHZTY3JvbGxWaWV3cG9ydC5zY3JvbGxGcmFtZVJhdGUuZW1pdCgxMDAwIC8gKG1lYXN1cmVbM10vbWVhc3VyZVsyXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzY3JvbGxpbmcgPSBzY3JvbGxpbmcgPT09IDEgPyAtMSA6IDE7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJhZik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICB9XG4gICAgc2Nyb2xsaW5nKys7XG4gIH1cbn1cbiJdfQ==