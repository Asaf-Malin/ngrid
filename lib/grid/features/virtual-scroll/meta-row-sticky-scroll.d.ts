import { PblCdkVirtualScrollViewportComponent } from './virtual-scroll-viewport.component';
/**
 * A class that manages the life cycle of sticky meta rows (header & footer) while scrolling.
 * Sticky meta rows are moved to containers outside of the table so they do not depend on the `position: sticky` property.
 *
 * For `position: sticky` to work, a reference position is required (`top` for header, `bottom` for footer) which must reflect the current
 * offset measured by the virtual scroll viewport (this position compensate the offset of virtual scroll so the position is leveled, i.e. like top 0)
 *
 * When the user scroll's:
 * - The offset changes by the browser
 * - The virtual scroll will detect the new offset and update the wrapper with the new offset.
 *
 * There is a time gap between the operations above which causes rows to flicker in and out of view, this is why we move them to a fixed location.
 */
export declare class MetaRowStickyScroll {
    private viewport;
    private viewPortEl;
    private metaRows;
    private runningHeader;
    private runningFooter;
    private canMoveHeader;
    private canMoveFooter;
    private movedFooterRows;
    private movedHeaderRows;
    constructor(viewport: PblCdkVirtualScrollViewportComponent, viewPortEl: HTMLElement, metaRows: Record<'header' | 'footer', {
        rows: HTMLElement[];
        sticky: boolean[];
        rendered: boolean[];
    }>);
    canMove(): boolean;
    isRunning(): boolean;
    move(offset: number, viewPortElRect: ClientRect | DOMRect): boolean;
    restore(renderedContentOffset: number): void;
    private moveHeader;
    private moveFooter;
    private restoreHeader;
    private restoreFooter;
    private cloneAndMoveRow;
    private restoreRows;
}
