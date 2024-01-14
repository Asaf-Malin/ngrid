import { PblCdkVirtualScrollViewportComponent } from '../virtual-scroll-viewport.component';
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
export declare function createScrollWatcherFn(vScrollViewport: PblCdkVirtualScrollViewportComponent): () => void;
