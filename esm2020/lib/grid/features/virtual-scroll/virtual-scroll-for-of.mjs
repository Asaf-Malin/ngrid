import { Subject, fromEvent, race, timer } from 'rxjs';
import { filter, startWith, pairwise, take, takeUntil, map, debounceTime } from 'rxjs/operators';
import { splitRange, updateStickyRows, measureRangeSize } from './utils';
import { MetaRowStickyScroll } from './meta-row-sticky-scroll';
function sortByIndex(a, b) { return a.index - b.index; }
;
export class PblVirtualScrollForOf {
    constructor(extApi, ngZone) {
        this.ngZone = ngZone;
        this.destroyed = new Subject();
        this.renderedContentOffset = 0;
        /** The length of meta rows [0] = header [1] = footer */
        this.metaRows = [0, 0];
        this.header = { rows: [], sticky: [], rendered: [] };
        this.footer = { rows: [], sticky: [], rendered: [] };
        this.grid = extApi.grid;
        this.cdkTable = extApi.cdkTable;
        this.viewport = extApi.viewport;
        this.viewChange = this.cdkTable.viewChange;
        extApi.events
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => {
            if (event.kind === 'onDataSource') {
                this.detachView();
                this.attachView(event.curr);
            }
        });
        this.attachView(extApi.grid.ds);
        const { metaRowService } = extApi.rowsApi;
        metaRowService.sync
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
            const headers = metaRowService.header.row.concat(metaRowService.header.sticky).sort(sortByIndex);
            const footers = metaRowService.footer.row.concat(metaRowService.footer.sticky).sort(sortByIndex);
            this.header.rows = headers.map(h => h.el);
            this.header.sticky = headers.map(h => h.rowDef.type === 'sticky');
            this.footer.rows = footers.map(h => h.el);
            this.footer.sticky = footers.map(h => h.rowDef.type === 'sticky');
            updateStickyRows(this.renderedContentOffset, this.header.rows, this.header.sticky, 'top');
            updateStickyRows(this.renderedContentOffset, this.footer.rows, this.footer.sticky, 'bottom');
        });
        this.viewport.offsetChange
            .pipe(takeUntil(this.destroyed))
            .subscribe(offset => {
            if (this.renderedContentOffset !== offset) {
                this.renderedContentOffset = offset;
                updateStickyRows(offset, this.header.rows, this.header.sticky, 'top');
                updateStickyRows(offset, this.footer.rows, this.footer.sticky, 'bottom');
            }
        });
        this.wheelControl = this.initWheelControl();
    }
    get headerLength() { return this.header.rows.length; }
    get rowLength() { return this.vcRefs.data.length; }
    get footerLength() { return this.footer.rows.length; }
    get vcRefs() {
        const value = {
            header: this.cdkTable._headerRowOutlet.viewContainer,
            data: this.cdkTable._rowOutlet.viewContainer,
            footer: this.cdkTable._footerRowOutlet.viewContainer,
        };
        Object.defineProperty(this, 'vcRefs', { value, configurable: true });
        return value;
    }
    /**
     * Measures the combined size (width for horizontal orientation, height for vertical) of all items
     * in the specified range. Throws an error if the range includes items that are not currently
     * rendered.
     */
    measureRangeSize(range, orientation) {
        if (range.start >= range.end) {
            return 0;
        }
        const renderedRanges = this._renderedRanges;
        const ranges = splitRange(range, this.metaRows[0], this.ds.length);
        const stickyStates = [this.header.sticky, [], this.footer.sticky];
        const vcRefs = [this.vcRefs.header, this.vcRefs.data, this.vcRefs.footer];
        const vcRefSizeReducer = (total, vcRef, index) => {
            return total + measureRangeSize(vcRef, ranges[index], renderedRanges[index], stickyStates[index]);
        };
        return vcRefs.reduce(vcRefSizeReducer, 0);
    }
    destroy() {
        this.detachView();
        this.destroyed.next();
        this.destroyed.complete();
    }
    initWheelControl() {
        let listening = false;
        let offset = 0;
        const viewPort = this.viewport.element;
        const metaRowStickyScroll = new MetaRowStickyScroll(this.viewport, viewPort, { header: this.header, footer: this.footer });
        let scrollPosition;
        const wheelListen = () => {
            if (!listening) {
                viewPort.addEventListener('wheel', handler, true);
                listening = true;
            }
        };
        const wheelUnListen = () => {
            if (listening) {
                viewPort.removeEventListener('wheel', handler, true);
                listening = false;
            }
        };
        const updateScrollPosition = () => scrollPosition = (this.viewport.measureScrollOffset()) / (this.viewport.scrollHeight - this.viewport.getViewportSize());
        const scrollEnd$ = this.viewport.scrolling.pipe(filter(s => !s));
        const handler = (event) => {
            if (event.deltaY) {
                if ((scrollPosition === 1 && event.deltaY > 0) || (offset === 0 && event.deltaY < 0)) {
                    return;
                }
                let newOffset = offset + event.deltaY;
                newOffset = Math.min(this.viewport.scrollHeight, Math.max(0, newOffset));
                if (newOffset !== offset) {
                    offset = newOffset;
                    if (metaRowStickyScroll.canMove() && metaRowStickyScroll.move(event.deltaY, viewPort.getBoundingClientRect())) {
                        const restore = () => {
                            metaRowStickyScroll.restore(this.renderedContentOffset);
                            updateScrollPosition();
                        };
                        switch (this.viewport.wheelMode) {
                            case 'passive':
                                wheelUnListen();
                                this.viewport.scrolling
                                    .pipe(debounceTime(150), filter(s => !s), take(1)).subscribe(() => {
                                    restore();
                                    wheelListen();
                                });
                                break;
                            case 'blocking':
                                scrollEnd$.pipe(take(1)).subscribe(restore);
                                break;
                            default:
                                const threshold = this.viewport.wheelMode;
                                let removedEvent = false;
                                this.viewport.scrollFrameRate
                                    .pipe(takeUntil(scrollEnd$.pipe(take(1))))
                                    .subscribe({
                                    next: frameRate => {
                                        if (!removedEvent && frameRate < threshold) {
                                            wheelUnListen();
                                            removedEvent = true;
                                        }
                                    },
                                    complete: () => {
                                        const lastWheel$ = fromEvent(viewPort, 'wheel').pipe(debounceTime(50), take(1));
                                        race(lastWheel$, timer(51))
                                            .subscribe(() => {
                                            restore();
                                            if (removedEvent) {
                                                wheelListen();
                                            }
                                        });
                                        // we restore back after 100 ms, for some reason, if it's immediate, we hit a cycle of wheel/scroll/no-scroll and not wheel/scroll/WAIIIIIT/no-scrol
                                        // TODO: maybe we can measure time between no-scrolling and wheel to find this MS value
                                        //        OR, register a temp `wheel` listener that will detect wheel end and re-register the original handler.
                                    }
                                });
                        }
                    }
                }
                this.viewport.scrollToOffset(offset);
                event.preventDefault();
                event.stopPropagation();
                return true;
            }
        };
        updateScrollPosition();
        // We don't auto enable, the virtual scroll viewport component will decide
        // wheelListen();
        this.viewport
            .scrolling
            .subscribe(isScrolling => {
            if (!isScrolling) {
                offset = this.viewport.measureScrollOffset();
            }
        });
        return { wheelListen, wheelUnListen, get listening() { return listening; } };
    }
    attachView(ds) {
        if (ds) {
            this.ds = ds;
            this._renderedRanges = [{ start: 0, end: 0 }, this.cdkTable.viewChange.value, { start: 0, end: 0 }];
            this.viewport.renderedRangeStream
                .pipe(takeUntil(this.destroyed))
                .subscribe(range => {
                if (this.headerLength + this.footerLength === 0) { // if no row/sticky meta rows, move on...
                    this._renderedRanges = [{ start: 0, end: 0 }, range, { start: 0, end: 0 }];
                    return this.cdkTable.viewChange.next(range);
                }
                /*  WHAT IS GOING ON HERE? */
                /*  Table rows are split into 3 sections: Header, Data, Footer.
                    In the virtual playground only DATA rows are dynamic. Header & Footer rows are fixed.
      
                    The `CdkTable` works the same, also have the same sections with a stream API for DATA rows only.
                    `CdkTable.viewChange.next(RANGE)` will emit to the datasource which will result in a new data section from the datasource.
      
                    `CdkTable` alone does not support virtual scrolling, to achieve it we use a virtual scroll viewport which wraps the entire `CdkTable`.
                    This means that ALL sections are wrapped (hence scrolled over) but only DATA rows are moving...
      
                    Each emission of `ListRange` in `renderedRangeStream` is based on size calculation of ALL sections (see `measureRangeSize` above)
                    and we need to extract the relevant range for DATA rows only and pass it on to the grid.
      
                    To make this work we need to extract Header/Footer rows based on the starting position of the range and handle them as well.
                    Because the grid will only handle the scrolling of DATA rows we need to update HEADER/FOOTER rows to show/hide based on the range.
      
                    Because Header/Footer rows are fixed we do this by hiding them with `display: none`, unless they are sticky / pinned.
                    One exception is the main header row, which we hide virtually because we need it to render and reflect the cell size.
      
                    We first extract the actual ranges for each section and update the `CdkTable` with the DATA row range.
                    We then wait for the rows to render, which is the time for us to also "render" Header/Footer rows...
                    We don't "render" them per-se, they are already rendered, we just show/hide them based on the range and state (sticky).
                    This is important, hiding will cause the total height of the scroll container to shrink to the size it should be.
                    We defer this operation to run AFTER the rows are rendered (not immediately) because an immediate change will trigger
                    a change in the scroll container size resulting in a scroll event that will bring us back here but this time with
                    a height that does not fit the range. Immediate change removes rows (Header/Footer) before the new range is applied.
                    Only after the rows are rendered we can show/hide the Header/Footer rows.
                */
                // Extracting actual ranges for each section.
                this._renderedRanges = splitRange(range, this.metaRows[0], ds.length);
                const [header, data, footer] = this._renderedRanges;
                this.cdkTable.onRenderRows.pipe(take(1)).subscribe(() => {
                    // We update the header DOM elements in reverse, skipping the last (first when reversed) DOM element.
                    // The skipped element is the grid's header row that must keep track of the layout for internal size calculation (e.g. group header rows).
                    // An hidden row is one that is out of range AND not sticky
                    if (this.headerLength > 0) {
                        const htmlRows = this.header.rows;
                        const renderedRows = this.header.rendered;
                        const stickyRows = this.header.sticky;
                        let rowIndex = 0;
                        for (const len = this.header.sticky.length - 1; rowIndex < len; rowIndex++) {
                            // assign rendered state + if not rendered and not sticky, set display to "none"
                            htmlRows[rowIndex].style.display = !(renderedRows[rowIndex] = rowIndex >= header.start) && !stickyRows[rowIndex]
                                ? 'none'
                                : null;
                        }
                        // Here we update the main header row, when we need to hide it we apply a class that will hide it virtually, i.e. not showing but keeping internal layout.
                        if (!(renderedRows[rowIndex] = rowIndex >= header.start) && !stickyRows[rowIndex]) {
                            htmlRows[rowIndex].classList.add('pbl-ngrid-row-visually-hidden');
                        }
                        else if (this.grid.showHeader && htmlRows[rowIndex]) {
                            htmlRows[rowIndex].classList.remove('pbl-ngrid-row-visually-hidden');
                        }
                    }
                    if (this.footerLength > 0) {
                        const htmlRows = this.footer.rows;
                        const renderedRows = this.footer.rendered;
                        const stickyRows = this.footer.sticky;
                        let rowIndex = 0;
                        for (const len = this.footer.sticky.length; rowIndex < len; rowIndex++) {
                            // assign rendered state + if not rendered and not sticky, set display to "none"
                            htmlRows[rowIndex].style.display = !(renderedRows[rowIndex] = rowIndex < footer.end) && !stickyRows[rowIndex]
                                ? 'none'
                                : null;
                        }
                    }
                });
                this.cdkTable.viewChange.next(data);
            });
            // add meta rows to the total row count.
            this.dataStream = ds.onRenderDataChanging
                .pipe(takeUntil(this.destroyed), map(({ data }) => {
                const metaRows = this.metaRows = [this.header.rows.length, this.footer.rows.length];
                return new Array(data.length + metaRows[0] + metaRows[1]);
            }));
            ds.onRenderedDataChanged
                .pipe(takeUntil(this.destroyed), map(() => ds.length), startWith(0), pairwise(), filter(([prev, curr]) => prev !== curr))
                .subscribe(([prev, curr]) => {
                this.ngZone.onStable.pipe(take(1)).subscribe(() => this.viewport.onSourceLengthChange(prev, curr));
            });
            this.viewport.attach(this);
        }
    }
    detachView() {
        this.ds = undefined;
        this.viewport.detach();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwtZm9yLW9mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvdmlydHVhbC1zY3JvbGwtZm9yLW9mLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBVWpHLE9BQU8sRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDekUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFL0QsU0FBUyxXQUFXLENBQUMsQ0FBb0IsRUFBRSxDQUFvQixJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQztBQUFBLENBQUM7QUFROUYsTUFBTSxPQUFPLHFCQUFxQjtJQXFDaEMsWUFBWSxNQUF1QyxFQUFVLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBMUJuRSxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQWFoQywwQkFBcUIsR0FBRyxDQUFDLENBQUM7UUFHbEMsd0RBQXdEO1FBQ2hELGFBQVEsR0FBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFcEMsV0FBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQW1CLEVBQUUsTUFBTSxFQUFFLEVBQWUsRUFBRSxRQUFRLEVBQUUsRUFBZSxFQUFFLENBQUM7UUFDM0YsV0FBTSxHQUFHLEVBQUUsSUFB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LENBQUMscUJBQXFCO2lCQUNyQixJQUFJLENBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDekIsR0FBRyxDQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUUsRUFDdEIsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNaLFFBQVEsRUFBRSxFQUNWLE1BQU0sQ0FBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFFLENBQzFDO2lCQUNBLFNBQVMsQ0FBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUUsQ0FBQztZQUN2RyxDQUFDLENBQUMsQ0FBQztZQUVMLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQVcsQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztJQUVPLFVBQVU7UUFDaEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0LCBmcm9tRXZlbnQsIHJhY2UsIHRpbWVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIsIHN0YXJ0V2l0aCwgcGFpcndpc2UsIHRha2UsIHRha2VVbnRpbCwgbWFwLCBkZWJvdW5jZVRpbWUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IE5nWm9uZSwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29sbGVjdGlvblZpZXdlciwgTGlzdFJhbmdlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFBibERhdGFTb3VyY2UgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBfUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi90b2tlbnMnO1xuaW1wb3J0IHsgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgUGJsQ2RrVGFibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9wYmwtY2RrLXRhYmxlL3BibC1jZGstdGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4vdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50JztcbmltcG9ydCB7IHNwbGl0UmFuZ2UsIHVwZGF0ZVN0aWNreVJvd3MsIG1lYXN1cmVSYW5nZVNpemUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE1ldGFSb3dTdGlja3lTY3JvbGwgfSBmcm9tICcuL21ldGEtcm93LXN0aWNreS1zY3JvbGwnO1xuXG5mdW5jdGlvbiBzb3J0QnlJbmRleChhOiB7IGluZGV4OiBudW1iZXIgfSwgYjogeyBpbmRleDogbnVtYmVyIH0pIHsgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4IH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmdlVmlydHVhbFRhYmxlUm93SW5mbyB7XG4gIHJlYWRvbmx5IGhlYWRlckxlbmd0aDogbnVtYmVyO1xuICByZWFkb25seSByb3dMZW5ndGg6IG51bWJlcjtcbiAgcmVhZG9ubHkgZm9vdGVyTGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBQYmxWaXJ0dWFsU2Nyb2xsRm9yT2Y8VD4gaW1wbGVtZW50cyBDb2xsZWN0aW9uVmlld2VyLCBOZ2VWaXJ0dWFsVGFibGVSb3dJbmZvIHtcbiAgdmlld0NoYW5nZTogT2JzZXJ2YWJsZTxMaXN0UmFuZ2U+O1xuXG4gIGRhdGFTdHJlYW06IE9ic2VydmFibGU8VFtdIHwgUmVhZG9ubHlBcnJheTxUPj47XG5cbiAgZ2V0IGhlYWRlckxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5oZWFkZXIucm93cy5sZW5ndGggIH1cbiAgZ2V0IHJvd0xlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy52Y1JlZnMuZGF0YS5sZW5ndGggIH1cbiAgZ2V0IGZvb3Rlckxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5mb290ZXIucm93cy5sZW5ndGggIH1cblxuICByZWFkb25seSB3aGVlbENvbnRyb2w6IHsgd2hlZWxMaXN0ZW46ICgpID0+IHZvaWQ7IHdoZWVsVW5MaXN0ZW46ICgpID0+IHZvaWQ7IHJlYWRvbmx5IGxpc3RlbmluZzogYm9vbGVhbjsgfTtcblxuICBwcml2YXRlIGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByaXZhdGUgZHM6IFBibERhdGFTb3VyY2U8VD47XG5cbiAgcHJpdmF0ZSBnZXQgdmNSZWZzKCk6IFJlY29yZDwnaGVhZGVyJyB8ICdkYXRhJyB8ICdmb290ZXInLCBWaWV3Q29udGFpbmVyUmVmPiB7XG4gICAgY29uc3QgdmFsdWUgPSB7XG4gICAgICBoZWFkZXI6IHRoaXMuY2RrVGFibGUuX2hlYWRlclJvd091dGxldC52aWV3Q29udGFpbmVyLFxuICAgICAgZGF0YTogdGhpcy5jZGtUYWJsZS5fcm93T3V0bGV0LnZpZXdDb250YWluZXIsXG4gICAgICBmb290ZXI6IHRoaXMuY2RrVGFibGUuX2Zvb3RlclJvd091dGxldC52aWV3Q29udGFpbmVyLFxuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2Y1JlZnMnLCB7IHZhbHVlLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJlZENvbnRlbnRPZmZzZXQgPSAwO1xuICAvKiogQSB0dXBsZSBjb250YWluaW5nIHRoZSBsYXN0IGtub3duIHJhbmdlcyBbaGVhZGVyLCBkYXRhLCBmb290ZXJdICovXG4gIHByaXZhdGUgX3JlbmRlcmVkUmFuZ2VzOiBbTGlzdFJhbmdlLCBMaXN0UmFuZ2UsIExpc3RSYW5nZV07XG4gIC8qKiBUaGUgbGVuZ3RoIG9mIG1ldGEgcm93cyBbMF0gPSBoZWFkZXIgWzFdID0gZm9vdGVyICovXG4gIHByaXZhdGUgbWV0YVJvd3M6IFtudW1iZXIsIG51bWJlcl0gPSBbMCwgMF07XG5cbiAgcHJpdmF0ZSBoZWFkZXIgPSB7IHJvd3M6IFtdIGFzIEhUTUxFbGVtZW50W10sIHN0aWNreTogW10gYXMgYm9vbGVhbltdLCByZW5kZXJlZDogW10gYXMgYm9vbGVhbltdIH07XG4gIHByaXZhdGUgZm9vdGVyID0geyByb3dzOiBbXSBhcyBIVE1MRWxlbWVudFtdLCBzdGlja3k6IFtdIGFzIGJvb2xlYW5bXSwgcmVuZGVyZWQ6IFtdIGFzIGJvb2xlYW5bXSB9O1xuXG4gIHByaXZhdGUgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PFQ+O1xuICBwcml2YXRlIGNka1RhYmxlOiBQYmxDZGtUYWJsZUNvbXBvbmVudDxUPjtcbiAgcHJpdmF0ZSB2aWV3cG9ydDogUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGV4dEFwaTogUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaTxUPiwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuZ3JpZCA9IGV4dEFwaS5ncmlkO1xuICAgIHRoaXMuY2RrVGFibGUgPSBleHRBcGkuY2RrVGFibGU7XG4gICAgdGhpcy52aWV3cG9ydCA9IGV4dEFwaS52aWV3cG9ydDtcblxuICAgIHRoaXMudmlld0NoYW5nZSA9IHRoaXMuY2RrVGFibGUudmlld0NoYW5nZTtcblxuICAgIGV4dEFwaS5ldmVudHNcbiAgICAgIC5waXBlKCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpIClcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmtpbmQgPT09ICdvbkRhdGFTb3VyY2UnKSB7XG4gICAgICAgICAgdGhpcy5kZXRhY2hWaWV3KCk7XG4gICAgICAgICAgdGhpcy5hdHRhY2hWaWV3KGV2ZW50LmN1cnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB0aGlzLmF0dGFjaFZpZXcoZXh0QXBpLmdyaWQuZHMpO1xuXG4gICAgY29uc3QgeyBtZXRhUm93U2VydmljZSB9ID0gZXh0QXBpLnJvd3NBcGk7XG4gICAgbWV0YVJvd1NlcnZpY2Uuc3luY1xuICAgICAgLnBpcGUoIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkgKVxuICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gbWV0YVJvd1NlcnZpY2UuaGVhZGVyLnJvdy5jb25jYXQobWV0YVJvd1NlcnZpY2UuaGVhZGVyLnN0aWNreSkuc29ydChzb3J0QnlJbmRleCk7XG4gICAgICAgIGNvbnN0IGZvb3RlcnMgPSBtZXRhUm93U2VydmljZS5mb290ZXIucm93LmNvbmNhdChtZXRhUm93U2VydmljZS5mb290ZXIuc3RpY2t5KS5zb3J0KHNvcnRCeUluZGV4KTtcblxuICAgICAgICB0aGlzLmhlYWRlci5yb3dzID0gaGVhZGVycy5tYXAoIGggPT4gaC5lbCApO1xuICAgICAgICB0aGlzLmhlYWRlci5zdGlja3kgPSBoZWFkZXJzLm1hcCggaCA9PiBoLnJvd0RlZi50eXBlID09PSAnc3RpY2t5JyApO1xuICAgICAgICB0aGlzLmZvb3Rlci5yb3dzID0gZm9vdGVycy5tYXAoIGggPT4gaC5lbCApO1xuICAgICAgICB0aGlzLmZvb3Rlci5zdGlja3kgPSBmb290ZXJzLm1hcCggaCA9PiBoLnJvd0RlZi50eXBlID09PSAnc3RpY2t5JyApO1xuXG4gICAgICAgIHVwZGF0ZVN0aWNreVJvd3ModGhpcy5yZW5kZXJlZENvbnRlbnRPZmZzZXQsIHRoaXMuaGVhZGVyLnJvd3MsIHRoaXMuaGVhZGVyLnN0aWNreSwgJ3RvcCcpO1xuICAgICAgICB1cGRhdGVTdGlja3lSb3dzKHRoaXMucmVuZGVyZWRDb250ZW50T2Zmc2V0LCB0aGlzLmZvb3Rlci5yb3dzLCB0aGlzLmZvb3Rlci5zdGlja3ksICdib3R0b20nKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy52aWV3cG9ydC5vZmZzZXRDaGFuZ2VcbiAgICAgIC5waXBlKCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpIClcbiAgICAgIC5zdWJzY3JpYmUoIG9mZnNldCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnJlbmRlcmVkQ29udGVudE9mZnNldCAhPT0gb2Zmc2V0KSB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlZENvbnRlbnRPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgdXBkYXRlU3RpY2t5Um93cyhvZmZzZXQsIHRoaXMuaGVhZGVyLnJvd3MsIHRoaXMuaGVhZGVyLnN0aWNreSwgJ3RvcCcpO1xuICAgICAgICAgIHVwZGF0ZVN0aWNreVJvd3Mob2Zmc2V0LCB0aGlzLmZvb3Rlci5yb3dzLCB0aGlzLmZvb3Rlci5zdGlja3ksICdib3R0b20nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLndoZWVsQ29udHJvbCA9IHRoaXMuaW5pdFdoZWVsQ29udHJvbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lYXN1cmVzIHRoZSBjb21iaW5lZCBzaXplICh3aWR0aCBmb3IgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgaGVpZ2h0IGZvciB2ZXJ0aWNhbCkgb2YgYWxsIGl0ZW1zXG4gICAqIGluIHRoZSBzcGVjaWZpZWQgcmFuZ2UuIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmFuZ2UgaW5jbHVkZXMgaXRlbXMgdGhhdCBhcmUgbm90IGN1cnJlbnRseVxuICAgKiByZW5kZXJlZC5cbiAgICovXG4gIG1lYXN1cmVSYW5nZVNpemUocmFuZ2U6IExpc3RSYW5nZSwgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcpOiBudW1iZXIge1xuICAgIGlmIChyYW5nZS5zdGFydCA+PSByYW5nZS5lbmQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlcmVkUmFuZ2VzID0gdGhpcy5fcmVuZGVyZWRSYW5nZXM7XG4gICAgY29uc3QgcmFuZ2VzID0gc3BsaXRSYW5nZShyYW5nZSwgdGhpcy5tZXRhUm93c1swXSwgdGhpcy5kcy5sZW5ndGgpO1xuICAgIGNvbnN0IHN0aWNreVN0YXRlcyA9IFsgdGhpcy5oZWFkZXIuc3RpY2t5LCBbXSwgdGhpcy5mb290ZXIuc3RpY2t5IF07XG5cbiAgICBjb25zdCB2Y1JlZnMgPSBbdGhpcy52Y1JlZnMuaGVhZGVyLCB0aGlzLnZjUmVmcy5kYXRhLCB0aGlzLnZjUmVmcy5mb290ZXJdO1xuICAgIGNvbnN0IHZjUmVmU2l6ZVJlZHVjZXIgPSAodG90YWw6IG51bWJlciwgdmNSZWY6IFZpZXdDb250YWluZXJSZWYsIGluZGV4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIHRvdGFsICsgbWVhc3VyZVJhbmdlU2l6ZSh2Y1JlZiwgcmFuZ2VzW2luZGV4XSwgcmVuZGVyZWRSYW5nZXNbaW5kZXhdLCBzdGlja3lTdGF0ZXNbaW5kZXhdKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZjUmVmcy5yZWR1Y2UodmNSZWZTaXplUmVkdWNlciwgMCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGV0YWNoVmlldygpO1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0V2hlZWxDb250cm9sKCkge1xuICAgIGxldCBsaXN0ZW5pbmcgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICBjb25zdCB2aWV3UG9ydCA9IHRoaXMudmlld3BvcnQuZWxlbWVudDtcbiAgICBjb25zdCBtZXRhUm93U3RpY2t5U2Nyb2xsID0gbmV3IE1ldGFSb3dTdGlja3lTY3JvbGwodGhpcy52aWV3cG9ydCwgdmlld1BvcnQsIHsgaGVhZGVyOiB0aGlzLmhlYWRlciwgZm9vdGVyOiB0aGlzLmZvb3RlciB9KTtcbiAgICBsZXQgc2Nyb2xsUG9zaXRpb246IG51bWJlcjtcblxuICAgIGNvbnN0IHdoZWVsTGlzdGVuID0gKCkgPT4ge1xuICAgICAgaWYgKCFsaXN0ZW5pbmcpIHtcbiAgICAgICAgdmlld1BvcnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBoYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgbGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHdoZWVsVW5MaXN0ZW4gPSAoKSA9PiB7XG4gICAgICBpZiAobGlzdGVuaW5nKSB7XG4gICAgICAgIHZpZXdQb3J0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgaGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGxpc3RlbmluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgdXBkYXRlU2Nyb2xsUG9zaXRpb24gPSAoKSA9PiBzY3JvbGxQb3NpdGlvbiA9ICh0aGlzLnZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKSkgLyAodGhpcy52aWV3cG9ydC5zY3JvbGxIZWlnaHQgLSB0aGlzLnZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpKTtcbiAgICBjb25zdCBzY3JvbGxFbmQkID0gdGhpcy52aWV3cG9ydC5zY3JvbGxpbmcucGlwZShmaWx0ZXIoIHMgPT4gIXMgKSk7XG5cbiAgICBjb25zdCBoYW5kbGVyID0gKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGVsdGFZKSB7XG4gICAgICAgIGlmICggKHNjcm9sbFBvc2l0aW9uID09PSAxICYmIGV2ZW50LmRlbHRhWSA+IDApIHx8IChvZmZzZXQgPT09IDAgJiYgZXZlbnQuZGVsdGFZIDwgMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5ld09mZnNldCA9IG9mZnNldCArIGV2ZW50LmRlbHRhWTtcbiAgICAgICAgbmV3T2Zmc2V0ID0gTWF0aC5taW4odGhpcy52aWV3cG9ydC5zY3JvbGxIZWlnaHQsIE1hdGgubWF4KDAsIG5ld09mZnNldCkpO1xuXG4gICAgICAgIGlmIChuZXdPZmZzZXQgIT09IG9mZnNldCkge1xuICAgICAgICAgIG9mZnNldCA9IG5ld09mZnNldDtcbiAgICAgICAgICBpZiAobWV0YVJvd1N0aWNreVNjcm9sbC5jYW5Nb3ZlKCkgJiYgbWV0YVJvd1N0aWNreVNjcm9sbC5tb3ZlKGV2ZW50LmRlbHRhWSwgdmlld1BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3RvcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIG1ldGFSb3dTdGlja3lTY3JvbGwucmVzdG9yZSh0aGlzLnJlbmRlcmVkQ29udGVudE9mZnNldCk7XG4gICAgICAgICAgICAgIHVwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlld3BvcnQud2hlZWxNb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ3Bhc3NpdmUnOlxuICAgICAgICAgICAgICAgIHdoZWVsVW5MaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbGluZ1xuICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIGRlYm91bmNlVGltZSgxNTApLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoIHMgPT4gIXMgKSxcbiAgICAgICAgICAgICAgICAgICAgdGFrZSgxKVxuICAgICAgICAgICAgICAgICAgKS5zdWJzY3JpYmUoICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdG9yZSgpO1xuICAgICAgICAgICAgICAgICAgICB3aGVlbExpc3RlbigpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2Jsb2NraW5nJzpcbiAgICAgICAgICAgICAgICBzY3JvbGxFbmQkLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKHJlc3RvcmUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnN0IHRocmVzaG9sZCA9IHRoaXMudmlld3BvcnQud2hlZWxNb2RlO1xuICAgICAgICAgICAgICAgIGxldCByZW1vdmVkRXZlbnQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsRnJhbWVSYXRlXG4gICAgICAgICAgICAgICAgICAucGlwZSh0YWtlVW50aWwoc2Nyb2xsRW5kJC5waXBlKHRha2UoMSkpKSlcbiAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXh0OiBmcmFtZVJhdGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVkRXZlbnQgJiYgZnJhbWVSYXRlIDwgdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdoZWVsVW5MaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZEV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0V2hlZWwkID0gZnJvbUV2ZW50KHZpZXdQb3J0LCAnd2hlZWwnKS5waXBlKGRlYm91bmNlVGltZSg1MCksIHRha2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmFjZShsYXN0V2hlZWwkLCB0aW1lcig1MSkgYXMgYW55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdG9yZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVkRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZWVsTGlzdGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgcmVzdG9yZSBiYWNrIGFmdGVyIDEwMCBtcywgZm9yIHNvbWUgcmVhc29uLCBpZiBpdCdzIGltbWVkaWF0ZSwgd2UgaGl0IGEgY3ljbGUgb2Ygd2hlZWwvc2Nyb2xsL25vLXNjcm9sbCBhbmQgbm90IHdoZWVsL3Njcm9sbC9XQUlJSUlJVC9uby1zY3JvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBtYXliZSB3ZSBjYW4gbWVhc3VyZSB0aW1lIGJldHdlZW4gbm8tc2Nyb2xsaW5nIGFuZCB3aGVlbCB0byBmaW5kIHRoaXMgTVMgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIE9SLCByZWdpc3RlciBhIHRlbXAgYHdoZWVsYCBsaXN0ZW5lciB0aGF0IHdpbGwgZGV0ZWN0IHdoZWVsIGVuZCBhbmQgcmUtcmVnaXN0ZXIgdGhlIG9yaWdpbmFsIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbFRvT2Zmc2V0KG9mZnNldCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHVwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgLy8gV2UgZG9uJ3QgYXV0byBlbmFibGUsIHRoZSB2aXJ0dWFsIHNjcm9sbCB2aWV3cG9ydCBjb21wb25lbnQgd2lsbCBkZWNpZGVcbiAgICAvLyB3aGVlbExpc3RlbigpO1xuXG4gICAgdGhpcy52aWV3cG9ydFxuICAgICAgLnNjcm9sbGluZ1xuICAgICAgLnN1YnNjcmliZShpc1Njcm9sbGluZyA9PiB7XG4gICAgICAgIGlmICghaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICBvZmZzZXQgPSB0aGlzLnZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICByZXR1cm4geyB3aGVlbExpc3Rlbiwgd2hlZWxVbkxpc3RlbiwgZ2V0IGxpc3RlbmluZygpIHsgcmV0dXJuIGxpc3RlbmluZyB9IH07XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaFZpZXcoZHM6IFBibERhdGFTb3VyY2U8VD4pOiB2b2lkIHtcbiAgICBpZiAoZHMpIHtcbiAgICAgIHRoaXMuZHMgPSBkcztcbiAgICAgIHRoaXMuX3JlbmRlcmVkUmFuZ2VzID0gWyB7IHN0YXJ0OiAwLCBlbmQ6IDAgfSwgdGhpcy5jZGtUYWJsZS52aWV3Q2hhbmdlLnZhbHVlLCB7IHN0YXJ0OiAwLCBlbmQ6IDAgfSBdO1xuXG4gICAgICB0aGlzLnZpZXdwb3J0LnJlbmRlcmVkUmFuZ2VTdHJlYW1cbiAgICAgICAgLnBpcGUoIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkgKVxuICAgICAgICAuc3Vic2NyaWJlKCByYW5nZSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaGVhZGVyTGVuZ3RoICsgdGhpcy5mb290ZXJMZW5ndGggPT09IDApIHsgLy8gaWYgbm8gcm93L3N0aWNreSBtZXRhIHJvd3MsIG1vdmUgb24uLi5cbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVkUmFuZ2VzID0gWyB7IHN0YXJ0OiAwLCBlbmQ6IDAgfSwgcmFuZ2UsIHsgc3RhcnQ6IDAsIGVuZDogMCB9IF07XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jZGtUYWJsZS52aWV3Q2hhbmdlLm5leHQocmFuZ2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qICBXSEFUIElTIEdPSU5HIE9OIEhFUkU/ICovXG5cbiAgICAgICAgICAvKiAgVGFibGUgcm93cyBhcmUgc3BsaXQgaW50byAzIHNlY3Rpb25zOiBIZWFkZXIsIERhdGEsIEZvb3Rlci5cbiAgICAgICAgICAgICAgSW4gdGhlIHZpcnR1YWwgcGxheWdyb3VuZCBvbmx5IERBVEEgcm93cyBhcmUgZHluYW1pYy4gSGVhZGVyICYgRm9vdGVyIHJvd3MgYXJlIGZpeGVkLlxuXG4gICAgICAgICAgICAgIFRoZSBgQ2RrVGFibGVgIHdvcmtzIHRoZSBzYW1lLCBhbHNvIGhhdmUgdGhlIHNhbWUgc2VjdGlvbnMgd2l0aCBhIHN0cmVhbSBBUEkgZm9yIERBVEEgcm93cyBvbmx5LlxuICAgICAgICAgICAgICBgQ2RrVGFibGUudmlld0NoYW5nZS5uZXh0KFJBTkdFKWAgd2lsbCBlbWl0IHRvIHRoZSBkYXRhc291cmNlIHdoaWNoIHdpbGwgcmVzdWx0IGluIGEgbmV3IGRhdGEgc2VjdGlvbiBmcm9tIHRoZSBkYXRhc291cmNlLlxuXG4gICAgICAgICAgICAgIGBDZGtUYWJsZWAgYWxvbmUgZG9lcyBub3Qgc3VwcG9ydCB2aXJ0dWFsIHNjcm9sbGluZywgdG8gYWNoaWV2ZSBpdCB3ZSB1c2UgYSB2aXJ0dWFsIHNjcm9sbCB2aWV3cG9ydCB3aGljaCB3cmFwcyB0aGUgZW50aXJlIGBDZGtUYWJsZWAuXG4gICAgICAgICAgICAgIFRoaXMgbWVhbnMgdGhhdCBBTEwgc2VjdGlvbnMgYXJlIHdyYXBwZWQgKGhlbmNlIHNjcm9sbGVkIG92ZXIpIGJ1dCBvbmx5IERBVEEgcm93cyBhcmUgbW92aW5nLi4uXG5cbiAgICAgICAgICAgICAgRWFjaCBlbWlzc2lvbiBvZiBgTGlzdFJhbmdlYCBpbiBgcmVuZGVyZWRSYW5nZVN0cmVhbWAgaXMgYmFzZWQgb24gc2l6ZSBjYWxjdWxhdGlvbiBvZiBBTEwgc2VjdGlvbnMgKHNlZSBgbWVhc3VyZVJhbmdlU2l6ZWAgYWJvdmUpXG4gICAgICAgICAgICAgIGFuZCB3ZSBuZWVkIHRvIGV4dHJhY3QgdGhlIHJlbGV2YW50IHJhbmdlIGZvciBEQVRBIHJvd3Mgb25seSBhbmQgcGFzcyBpdCBvbiB0byB0aGUgZ3JpZC5cblxuICAgICAgICAgICAgICBUbyBtYWtlIHRoaXMgd29yayB3ZSBuZWVkIHRvIGV4dHJhY3QgSGVhZGVyL0Zvb3RlciByb3dzIGJhc2VkIG9uIHRoZSBzdGFydGluZyBwb3NpdGlvbiBvZiB0aGUgcmFuZ2UgYW5kIGhhbmRsZSB0aGVtIGFzIHdlbGwuXG4gICAgICAgICAgICAgIEJlY2F1c2UgdGhlIGdyaWQgd2lsbCBvbmx5IGhhbmRsZSB0aGUgc2Nyb2xsaW5nIG9mIERBVEEgcm93cyB3ZSBuZWVkIHRvIHVwZGF0ZSBIRUFERVIvRk9PVEVSIHJvd3MgdG8gc2hvdy9oaWRlIGJhc2VkIG9uIHRoZSByYW5nZS5cblxuICAgICAgICAgICAgICBCZWNhdXNlIEhlYWRlci9Gb290ZXIgcm93cyBhcmUgZml4ZWQgd2UgZG8gdGhpcyBieSBoaWRpbmcgdGhlbSB3aXRoIGBkaXNwbGF5OiBub25lYCwgdW5sZXNzIHRoZXkgYXJlIHN0aWNreSAvIHBpbm5lZC5cbiAgICAgICAgICAgICAgT25lIGV4Y2VwdGlvbiBpcyB0aGUgbWFpbiBoZWFkZXIgcm93LCB3aGljaCB3ZSBoaWRlIHZpcnR1YWxseSBiZWNhdXNlIHdlIG5lZWQgaXQgdG8gcmVuZGVyIGFuZCByZWZsZWN0IHRoZSBjZWxsIHNpemUuXG5cbiAgICAgICAgICAgICAgV2UgZmlyc3QgZXh0cmFjdCB0aGUgYWN0dWFsIHJhbmdlcyBmb3IgZWFjaCBzZWN0aW9uIGFuZCB1cGRhdGUgdGhlIGBDZGtUYWJsZWAgd2l0aCB0aGUgREFUQSByb3cgcmFuZ2UuXG4gICAgICAgICAgICAgIFdlIHRoZW4gd2FpdCBmb3IgdGhlIHJvd3MgdG8gcmVuZGVyLCB3aGljaCBpcyB0aGUgdGltZSBmb3IgdXMgdG8gYWxzbyBcInJlbmRlclwiIEhlYWRlci9Gb290ZXIgcm93cy4uLlxuICAgICAgICAgICAgICBXZSBkb24ndCBcInJlbmRlclwiIHRoZW0gcGVyLXNlLCB0aGV5IGFyZSBhbHJlYWR5IHJlbmRlcmVkLCB3ZSBqdXN0IHNob3cvaGlkZSB0aGVtIGJhc2VkIG9uIHRoZSByYW5nZSBhbmQgc3RhdGUgKHN0aWNreSkuXG4gICAgICAgICAgICAgIFRoaXMgaXMgaW1wb3J0YW50LCBoaWRpbmcgd2lsbCBjYXVzZSB0aGUgdG90YWwgaGVpZ2h0IG9mIHRoZSBzY3JvbGwgY29udGFpbmVyIHRvIHNocmluayB0byB0aGUgc2l6ZSBpdCBzaG91bGQgYmUuXG4gICAgICAgICAgICAgIFdlIGRlZmVyIHRoaXMgb3BlcmF0aW9uIHRvIHJ1biBBRlRFUiB0aGUgcm93cyBhcmUgcmVuZGVyZWQgKG5vdCBpbW1lZGlhdGVseSkgYmVjYXVzZSBhbiBpbW1lZGlhdGUgY2hhbmdlIHdpbGwgdHJpZ2dlclxuICAgICAgICAgICAgICBhIGNoYW5nZSBpbiB0aGUgc2Nyb2xsIGNvbnRhaW5lciBzaXplIHJlc3VsdGluZyBpbiBhIHNjcm9sbCBldmVudCB0aGF0IHdpbGwgYnJpbmcgdXMgYmFjayBoZXJlIGJ1dCB0aGlzIHRpbWUgd2l0aFxuICAgICAgICAgICAgICBhIGhlaWdodCB0aGF0IGRvZXMgbm90IGZpdCB0aGUgcmFuZ2UuIEltbWVkaWF0ZSBjaGFuZ2UgcmVtb3ZlcyByb3dzIChIZWFkZXIvRm9vdGVyKSBiZWZvcmUgdGhlIG5ldyByYW5nZSBpcyBhcHBsaWVkLlxuICAgICAgICAgICAgICBPbmx5IGFmdGVyIHRoZSByb3dzIGFyZSByZW5kZXJlZCB3ZSBjYW4gc2hvdy9oaWRlIHRoZSBIZWFkZXIvRm9vdGVyIHJvd3MuXG4gICAgICAgICAgKi9cblxuICAgICAgICAgIC8vIEV4dHJhY3RpbmcgYWN0dWFsIHJhbmdlcyBmb3IgZWFjaCBzZWN0aW9uLlxuICAgICAgICAgIHRoaXMuX3JlbmRlcmVkUmFuZ2VzID0gc3BsaXRSYW5nZShyYW5nZSwgdGhpcy5tZXRhUm93c1swXSwgZHMubGVuZ3RoKTtcbiAgICAgICAgICBjb25zdCBbIGhlYWRlciwgZGF0YSwgZm9vdGVyIF0gPSB0aGlzLl9yZW5kZXJlZFJhbmdlcztcblxuICAgICAgICAgIHRoaXMuY2RrVGFibGUub25SZW5kZXJSb3dzLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFdlIHVwZGF0ZSB0aGUgaGVhZGVyIERPTSBlbGVtZW50cyBpbiByZXZlcnNlLCBza2lwcGluZyB0aGUgbGFzdCAoZmlyc3Qgd2hlbiByZXZlcnNlZCkgRE9NIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBUaGUgc2tpcHBlZCBlbGVtZW50IGlzIHRoZSBncmlkJ3MgaGVhZGVyIHJvdyB0aGF0IG11c3Qga2VlcCB0cmFjayBvZiB0aGUgbGF5b3V0IGZvciBpbnRlcm5hbCBzaXplIGNhbGN1bGF0aW9uIChlLmcuIGdyb3VwIGhlYWRlciByb3dzKS5cbiAgICAgICAgICAgIC8vIEFuIGhpZGRlbiByb3cgaXMgb25lIHRoYXQgaXMgb3V0IG9mIHJhbmdlIEFORCBub3Qgc3RpY2t5XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkZXJMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxSb3dzID0gdGhpcy5oZWFkZXIucm93cztcbiAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZWRSb3dzID0gdGhpcy5oZWFkZXIucmVuZGVyZWQ7XG4gICAgICAgICAgICAgIGNvbnN0IHN0aWNreVJvd3MgPSB0aGlzLmhlYWRlci5zdGlja3k7XG4gICAgICAgICAgICAgIGxldCByb3dJbmRleCA9IDA7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbGVuID0gdGhpcy5oZWFkZXIuc3RpY2t5Lmxlbmd0aCAtIDE7IHJvd0luZGV4IDwgbGVuOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIHJlbmRlcmVkIHN0YXRlICsgaWYgbm90IHJlbmRlcmVkIGFuZCBub3Qgc3RpY2t5LCBzZXQgZGlzcGxheSB0byBcIm5vbmVcIlxuICAgICAgICAgICAgICAgIGh0bWxSb3dzW3Jvd0luZGV4XS5zdHlsZS5kaXNwbGF5ID0gIShyZW5kZXJlZFJvd3Nbcm93SW5kZXhdID0gcm93SW5kZXggPj0gaGVhZGVyLnN0YXJ0KSAmJiAhc3RpY2t5Um93c1tyb3dJbmRleF1cbiAgICAgICAgICAgICAgICAgID8gJ25vbmUnXG4gICAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBIZXJlIHdlIHVwZGF0ZSB0aGUgbWFpbiBoZWFkZXIgcm93LCB3aGVuIHdlIG5lZWQgdG8gaGlkZSBpdCB3ZSBhcHBseSBhIGNsYXNzIHRoYXQgd2lsbCBoaWRlIGl0IHZpcnR1YWxseSwgaS5lLiBub3Qgc2hvd2luZyBidXQga2VlcGluZyBpbnRlcm5hbCBsYXlvdXQuXG4gICAgICAgICAgICAgIGlmICghKHJlbmRlcmVkUm93c1tyb3dJbmRleF0gPSByb3dJbmRleCA+PSBoZWFkZXIuc3RhcnQpICYmICFzdGlja3lSb3dzW3Jvd0luZGV4XSkge1xuICAgICAgICAgICAgICAgIGh0bWxSb3dzW3Jvd0luZGV4XS5jbGFzc0xpc3QuYWRkKCdwYmwtbmdyaWQtcm93LXZpc3VhbGx5LWhpZGRlbicpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZC5zaG93SGVhZGVyICYmIGh0bWxSb3dzW3Jvd0luZGV4XSkge1xuICAgICAgICAgICAgICAgIGh0bWxSb3dzW3Jvd0luZGV4XS5jbGFzc0xpc3QucmVtb3ZlKCdwYmwtbmdyaWQtcm93LXZpc3VhbGx5LWhpZGRlbicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmZvb3Rlckxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFJvd3MgPSB0aGlzLmZvb3Rlci5yb3dzO1xuICAgICAgICAgICAgICBjb25zdCByZW5kZXJlZFJvd3MgPSB0aGlzLmZvb3Rlci5yZW5kZXJlZDtcbiAgICAgICAgICAgICAgY29uc3Qgc3RpY2t5Um93cyA9IHRoaXMuZm9vdGVyLnN0aWNreTtcbiAgICAgICAgICAgICAgbGV0IHJvd0luZGV4ID0gMDtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBsZW4gPSB0aGlzLmZvb3Rlci5zdGlja3kubGVuZ3RoOyByb3dJbmRleCA8IGxlbjsgcm93SW5kZXgrKykge1xuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiByZW5kZXJlZCBzdGF0ZSArIGlmIG5vdCByZW5kZXJlZCBhbmQgbm90IHN0aWNreSwgc2V0IGRpc3BsYXkgdG8gXCJub25lXCJcbiAgICAgICAgICAgICAgICBodG1sUm93c1tyb3dJbmRleF0uc3R5bGUuZGlzcGxheSA9ICEocmVuZGVyZWRSb3dzW3Jvd0luZGV4XSA9IHJvd0luZGV4IDwgZm9vdGVyLmVuZCkgJiYgIXN0aWNreVJvd3Nbcm93SW5kZXhdXG4gICAgICAgICAgICAgICAgICA/ICdub25lJ1xuICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLmNka1RhYmxlLnZpZXdDaGFuZ2UubmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIGFkZCBtZXRhIHJvd3MgdG8gdGhlIHRvdGFsIHJvdyBjb3VudC5cbiAgICAgIHRoaXMuZGF0YVN0cmVhbSA9IGRzLm9uUmVuZGVyRGF0YUNoYW5naW5nXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgbWFwKCAoe2RhdGF9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhUm93cyA9IHRoaXMubWV0YVJvd3MgPSBbIHRoaXMuaGVhZGVyLnJvd3MubGVuZ3RoLCB0aGlzLmZvb3Rlci5yb3dzLmxlbmd0aCBdO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheSggZGF0YS5sZW5ndGggKyBtZXRhUm93c1swXSArIG1ldGFSb3dzWzFdICk7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgIGRzLm9uUmVuZGVyZWREYXRhQ2hhbmdlZFxuICAgICAgICAucGlwZShcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgIG1hcCggKCkgPT4gZHMubGVuZ3RoICksXG4gICAgICAgICAgc3RhcnRXaXRoKDApLFxuICAgICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgICAgZmlsdGVyKCAoW3ByZXYsIGN1cnJdKSA9PiBwcmV2ICE9PSBjdXJyICksXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSggKFtwcmV2LCBjdXJyXSkgPT4ge1xuICAgICAgICAgIHRoaXMubmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCAoKSA9PiB0aGlzLnZpZXdwb3J0Lm9uU291cmNlTGVuZ3RoQ2hhbmdlKHByZXYsIGN1cnIpICk7XG4gICAgICAgIH0pO1xuXG4gICAgICB0aGlzLnZpZXdwb3J0LmF0dGFjaCh0aGlzIGFzIGFueSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZXRhY2hWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuZHMgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy52aWV3cG9ydC5kZXRhY2goKTtcbiAgfVxufVxuIl19