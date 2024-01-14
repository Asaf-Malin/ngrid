import { BehaviorSubject, Subject, asapScheduler } from 'rxjs';
import { debounceTime, buffer, map, filter, take } from 'rxjs/operators';
import { ON_DESTROY, removeFromArray } from '@pebula/ngrid/core';
import { findRowRenderedIndex, resolveCellReference } from './utils';
import { PblRowContext } from './row';
import { PblCellContext } from './cell';
export class ContextApi {
    constructor(extApi) {
        this.extApi = extApi;
        this.viewCache = new Map();
        this.viewCacheGhost = new Set();
        this.cache = new Map();
        this.activeSelected = [];
        this.focusChanged$ = new BehaviorSubject({ prev: undefined, curr: undefined });
        this.selectionChanged$ = new Subject();
        /**
         * Notify when the focus has changed.
         *
         * > Note that the notification is not immediate, it will occur on the closest micro-task after the change.
         */
        this.focusChanged = this.focusChanged$
            .pipe(buffer(this.focusChanged$.pipe(debounceTime(0, asapScheduler))), map(events => ({ prev: events[0].prev, curr: events[events.length - 1].curr })));
        /**
         * Notify when the selected cells has changed.
         */
        this.selectionChanged = this.selectionChanged$.asObservable();
        this.columnApi = extApi.columnApi;
        extApi.events
            .pipe(filter(e => e.kind === 'onDataSource'), take(1)).subscribe(() => {
            this.vcRef = extApi.cdkTable._rowOutlet.viewContainer;
            this.syncViewAndContext();
            extApi.cdkTable.onRenderRows.subscribe(() => this.syncViewAndContext());
        });
        extApi.events.pipe(ON_DESTROY).subscribe(e => this.destroy());
    }
    /**
     * The reference to currently focused cell context.
     * You can retrieve the actual context or context cell using `findRowInView` and / or `findRowInCache`.
     *
     * > Note that when virtual scroll is enabled the currently focused cell does not have to exist in the view.
     * If this is the case `findRowInView` will return undefined, use `findRowInCache` instead.
     */
    get focusedCell() {
        return this.activeFocused ? { ...this.activeFocused } : undefined;
    }
    /**
     * The reference to currently selected range of cell's context.
     * You can retrieve the actual context or context cell using `findRowInView` and / or `findRowInCache`.
     *
     * > Note that when virtual scroll is enabled the currently selected cells does not have to exist in the view.
     * If this is the case `findRowInView` will return undefined, use `findRowInCache` instead.
     */
    get selectedCells() {
        return this.activeSelected.slice();
    }
    /**
     * Focus the provided cell.
     * If a cell is not provided will un-focus (blur) the currently focused cell (if there is one).
     * @param cellRef A Reference to the cell
     */
    focusCell(cellRef) {
        if (!cellRef) {
            if (this.activeFocused) {
                const { rowIdent, colIndex } = this.activeFocused;
                this.activeFocused = undefined;
                this.updateState(rowIdent, colIndex, { focused: false });
                this.emitFocusChanged(this.activeFocused);
                const rowContext = this.findRowInView(rowIdent);
                if (rowContext) {
                    this.extApi.grid.rowsApi.syncRows('data', rowContext.index);
                }
            }
        }
        else {
            const ref = resolveCellReference(cellRef, this);
            if (ref) {
                this.focusCell();
                if (ref instanceof PblCellContext) {
                    if (!ref.focused && !this.extApi.grid.viewport.isScrolling) {
                        this.updateState(ref.rowContext.identity, ref.index, { focused: true });
                        this.activeFocused = { rowIdent: ref.rowContext.identity, colIndex: ref.index };
                        this.selectCells([this.activeFocused], true);
                        this.extApi.grid.rowsApi.syncRows('data', ref.rowContext.index);
                    }
                }
                else {
                    this.updateState(ref[0].identity, ref[1], { focused: true });
                    this.activeFocused = { rowIdent: ref[0].identity, colIndex: ref[1] };
                }
                this.emitFocusChanged(this.activeFocused);
            }
        }
    }
    /**
     * Select all provided cells.
     * @param cellRef A Reference to the cell
     * @param clearCurrent Clear the current selection before applying the new selection.
     * Default to false (add to current).
     */
    selectCells(cellRefs, clearCurrent) {
        const toMarkRendered = new Set();
        if (clearCurrent) {
            this.unselectCells();
        }
        const added = [];
        for (const cellRef of cellRefs) {
            const ref = resolveCellReference(cellRef, this);
            if (ref instanceof PblCellContext) {
                if (!ref.selected && !this.extApi.grid.viewport.isScrolling) {
                    const rowIdent = ref.rowContext.identity;
                    const colIndex = ref.index;
                    this.updateState(rowIdent, colIndex, { selected: true });
                    const dataPoint = { rowIdent, colIndex };
                    this.activeSelected.push(dataPoint);
                    added.push(dataPoint);
                    toMarkRendered.add(ref.rowContext.index);
                }
            }
            else if (ref) {
                const [rowState, colIndex] = ref;
                if (!rowState.cells[colIndex].selected) {
                    this.updateState(rowState.identity, colIndex, { selected: true });
                    this.activeSelected.push({ rowIdent: rowState.identity, colIndex });
                }
            }
        }
        if (toMarkRendered.size > 0) {
            this.extApi.grid.rowsApi.syncRows('data', ...Array.from(toMarkRendered.values()));
        }
        this.selectionChanged$.next({ added, removed: [] });
    }
    /**
     * Unselect all provided cells.
     * If cells are not provided will un-select all currently selected cells.
     * @param cellRef A Reference to the cell
     */
    unselectCells(cellRefs) {
        const toMarkRendered = new Set();
        let toUnselect = this.activeSelected;
        let removeAll = true;
        if (Array.isArray(cellRefs)) {
            toUnselect = cellRefs;
            removeAll = false;
        }
        else {
            this.activeSelected = [];
        }
        const removed = [];
        for (const cellRef of toUnselect) {
            const ref = resolveCellReference(cellRef, this);
            if (ref instanceof PblCellContext) {
                if (ref.selected) {
                    const rowIdent = ref.rowContext.identity;
                    const colIndex = ref.index;
                    this.updateState(rowIdent, colIndex, { selected: false });
                    if (!removeAll) {
                        const wasRemoved = removeFromArray(this.activeSelected, item => item.colIndex === colIndex && item.rowIdent === rowIdent);
                        if (wasRemoved) {
                            removed.push({ rowIdent, colIndex });
                        }
                    }
                    toMarkRendered.add(ref.rowContext.index);
                }
            }
            else if (ref) {
                const [rowState, colIndex] = ref;
                if (rowState.cells[colIndex].selected) {
                    this.updateState(rowState.identity, colIndex, { selected: false });
                    if (!removeAll) {
                        const wasRemoved = removeFromArray(this.activeSelected, item => item.colIndex === colIndex && item.rowIdent === rowState.identity);
                        if (wasRemoved) {
                            removed.push({ rowIdent: rowState.identity, colIndex });
                        }
                    }
                }
            }
        }
        if (toMarkRendered.size > 0) {
            this.extApi.grid.rowsApi.syncRows('data', ...Array.from(toMarkRendered.values()));
        }
        this.selectionChanged$.next({ added: [], removed });
    }
    /**
     * Clears the entire context, including view cache and memory cache (rows out of view)
     * @param syncView If true will sync the view and the context right after clearing which will ensure the view cache is hot and synced with the actual rendered rows
     * Some plugins will expect a row to have a context so this might be required.
     * The view and context are synced every time rows are rendered so make sure you set this to true only when you know there is no rendering call coming down the pipe.
     */
    clear(syncView) {
        this.viewCache.clear();
        this.viewCacheGhost.clear();
        this.cache.clear();
        if (syncView === true) {
            for (const r of this.extApi.rowsApi.dataRows()) {
                this.viewCache.set(r.rowIndex, r.context);
                // we're clearing the existing view state on the component
                // If in the future we want to update state and not clear, remove this one
                // and instead just take the state and put it in the cache.
                // e.g. if on column swap we want to swap cells in the context...
                r.context.fromState(this.getCreateState(r.context));
                this.syncViewAndContext();
            }
        }
    }
    saveState(context) {
        if (context instanceof PblRowContext) {
            this.cache.set(context.identity, context.getState());
        }
    }
    getRow(row) {
        const index = typeof row === 'number' ? row : findRowRenderedIndex(row);
        return this.rowContext(index);
    }
    getCell(rowOrCellElement, col) {
        if (typeof rowOrCellElement === 'number') {
            const rowContext = this.rowContext(rowOrCellElement);
            if (rowContext) {
                return rowContext.cell(col);
            }
        }
        else {
            const ref = resolveCellReference(rowOrCellElement, this);
            if (ref instanceof PblCellContext) {
                return ref;
            }
        }
    }
    getDataItem(cell) {
        const ref = resolveCellReference(cell, this);
        if (ref instanceof PblCellContext) {
            return ref.col.getValue(ref.rowContext.$implicit);
        }
        else if (ref) {
            const row = this.extApi.grid.ds.source[ref[0].dsIndex];
            const column = this.extApi.grid.columnApi.findColumnAt(ref[1]);
            return column.getValue(row);
        }
    }
    createCellContext(renderRowIndex, column) {
        const rowContext = this.rowContext(renderRowIndex);
        const colIndex = this.columnApi.indexOf(column);
        return rowContext.cell(colIndex);
    }
    rowContext(renderRowIndex) {
        return this.viewCache.get(renderRowIndex);
    }
    updateState(rowIdentity, rowStateOrCellIndex, cellState) {
        const currentRowState = this.cache.get(rowIdentity);
        if (currentRowState) {
            if (typeof rowStateOrCellIndex === 'number') {
                const currentCellState = currentRowState.cells[rowStateOrCellIndex];
                if (currentCellState) {
                    Object.assign(currentCellState, cellState);
                }
            }
            else {
                Object.assign(currentRowState, rowStateOrCellIndex);
            }
            const rowContext = this.findRowInView(rowIdentity);
            if (rowContext) {
                rowContext.fromState(currentRowState);
            }
        }
    }
    /**
     * Try to find a specific row, using the row identity, in the current view.
     * If the row is not in the view (or even not in the cache) it will return undefined, otherwise returns the row's context instance (`PblRowContext`)
     * @param rowIdentity The row's identity. If a specific identity is used, please provide it otherwise provide the index of the row in the datasource.
     */
    findRowInView(rowIdentity) {
        const rowState = this.cache.get(rowIdentity);
        if (rowState) {
            const renderRowIndex = rowState.dsIndex - this.extApi.grid.ds.renderStart;
            const rowContext = this.viewCache.get(renderRowIndex);
            if (rowContext && rowContext.identity === rowIdentity) {
                return rowContext;
            }
        }
    }
    findRowInCache(rowIdentity, offset, create) {
        const rowState = this.cache.get(rowIdentity);
        if (!offset) {
            return rowState;
        }
        else {
            const dsIndex = rowState.dsIndex + offset;
            const identity = this.getRowIdentity(dsIndex);
            if (identity !== null) {
                let result = this.findRowInCache(identity);
                if (!result && create && dsIndex < this.extApi.grid.ds.length) {
                    result = PblRowContext.defaultState(identity, dsIndex, this.columnApi.columns.length);
                    this.cache.set(identity, result);
                }
                return result;
            }
        }
    }
    getRowIdentity(dsIndex, rowData) {
        const { ds } = this.extApi.grid;
        const { primary } = this.extApi.columnStore;
        const row = rowData || ds.source[dsIndex];
        if (!row) {
            return null;
        }
        else {
            return primary ? primary.getValue(row) : dsIndex;
        }
    }
    /** @internal */
    _createRowContext(data, renderRowIndex) {
        const context = new PblRowContext(data, this.extApi.grid.ds.renderStart + renderRowIndex, this.extApi);
        context.fromState(this.getCreateState(context));
        this.addToViewCache(renderRowIndex, context);
        return context;
    }
    _updateRowContext(rowContext, renderRowIndex) {
        const dsIndex = this.extApi.grid.ds.renderStart + renderRowIndex;
        const identity = this.getRowIdentity(dsIndex, rowContext.$implicit);
        if (rowContext.identity !== identity) {
            rowContext.saveState();
            rowContext.dsIndex = dsIndex;
            rowContext.identity = identity;
            rowContext.fromState(this.getCreateState(rowContext));
            this.addToViewCache(renderRowIndex, rowContext);
        }
    }
    addToViewCache(rowIndex, rowContext) {
        this.viewCache.set(rowIndex, rowContext);
        this.viewCacheGhost.delete(rowContext.identity);
    }
    getCreateState(context) {
        let state = this.cache.get(context.identity);
        if (!state) {
            state = PblRowContext.defaultState(context.identity, context.dsIndex, this.columnApi.columns.length);
            this.cache.set(context.identity, state);
        }
        return state;
    }
    emitFocusChanged(curr) {
        this.focusChanged$.next({
            prev: this.focusChanged$.value.curr,
            curr,
        });
    }
    destroy() {
        this.focusChanged$.complete();
        this.selectionChanged$.complete();
    }
    syncViewAndContext() {
        this.viewCacheGhost.forEach(ident => {
            if (!this.findRowInView(ident)) {
                this.cache.get(ident).firstRender = false;
            }
        });
        this.viewCacheGhost = new Set(Array.from(this.viewCache.values()).filter(v => v.firstRender).map(v => v.identity));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY29udGV4dC9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQWMsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekUsT0FBTyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWNqRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN0QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRXhDLE1BQU0sT0FBTyxVQUFVO0lBa0RyQixZQUFvQixNQUF1QztRQUF2QyxXQUFNLEdBQU4sTUFBTSxDQUFpQztRQWpEbkQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO1FBQ2hELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQU8sQ0FBQztRQUNoQyxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7UUFLM0MsbUJBQWMsR0FBb0IsRUFBRSxDQUFDO1FBQ3JDLGtCQUFhLEdBQUcsSUFBSSxlQUFlLENBQTRCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNyRyxzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBaUMsQ0FBQztRQUV6RTs7OztXQUlHO1FBQ00saUJBQVksR0FBMEMsSUFBSSxDQUFDLGFBQWE7YUFDOUUsSUFBSSxDQUNILE1BQU0sQ0FBNEIsSUFBSSxDQUFDLGFBQWEsQ0FB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ZWN0LCBPYnNlcnZhYmxlLCBhc2FwU2NoZWR1bGVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGJ1ZmZlciwgbWFwLCBmaWx0ZXIsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE9OX0RFU1RST1ksIHJlbW92ZUZyb21BcnJheSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi9jb2x1bW4vbW9kZWwnO1xuaW1wb3J0IHsgQ29sdW1uQXBpIH0gZnJvbSAnLi4vY29sdW1uL21hbmFnZW1lbnQnO1xuaW1wb3J0IHtcbiAgUm93Q29udGV4dFN0YXRlLFxuICBDZWxsQ29udGV4dFN0YXRlLFxuICBQYmxOZ3JpZENlbGxDb250ZXh0LFxuICBQYmxOZ3JpZFJvd0NvbnRleHQsXG4gIENlbGxSZWZlcmVuY2UsXG4gIEdyaWREYXRhUG9pbnQsXG4gIFBibE5ncmlkRm9jdXNDaGFuZ2VkRXZlbnQsXG4gIFBibE5ncmlkU2VsZWN0aW9uQ2hhbmdlZEV2ZW50XG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgZmluZFJvd1JlbmRlcmVkSW5kZXgsIHJlc29sdmVDZWxsUmVmZXJlbmNlIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBQYmxSb3dDb250ZXh0IH0gZnJvbSAnLi9yb3cnO1xuaW1wb3J0IHsgUGJsQ2VsbENvbnRleHQgfSBmcm9tICcuL2NlbGwnO1xuXG5leHBvcnQgY2xhc3MgQ29udGV4dEFwaTxUID0gYW55PiB7XG4gIHByaXZhdGUgdmlld0NhY2hlID0gbmV3IE1hcDxudW1iZXIsIFBibFJvd0NvbnRleHQ8VD4+KCk7XG4gIHByaXZhdGUgdmlld0NhY2hlR2hvc3QgPSBuZXcgU2V0PGFueT4oKTtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8YW55LCBSb3dDb250ZXh0U3RhdGU8VD4+KCk7XG4gIHByaXZhdGUgdmNSZWY6IFZpZXdDb250YWluZXJSZWY7XG4gIHByaXZhdGUgY29sdW1uQXBpOiBDb2x1bW5BcGk8VD47XG5cbiAgcHJpdmF0ZSBhY3RpdmVGb2N1c2VkOiBHcmlkRGF0YVBvaW50O1xuICBwcml2YXRlIGFjdGl2ZVNlbGVjdGVkOiBHcmlkRGF0YVBvaW50W10gPSBbXTtcbiAgcHJpdmF0ZSBmb2N1c0NoYW5nZWQkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxQYmxOZ3JpZEZvY3VzQ2hhbmdlZEV2ZW50Pih7IHByZXY6IHVuZGVmaW5lZCwgY3VycjogdW5kZWZpbmVkIH0pO1xuICBwcml2YXRlIHNlbGVjdGlvbkNoYW5nZWQkID0gbmV3IFN1YmplY3Q8UGJsTmdyaWRTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIE5vdGlmeSB3aGVuIHRoZSBmb2N1cyBoYXMgY2hhbmdlZC5cbiAgICpcbiAgICogPiBOb3RlIHRoYXQgdGhlIG5vdGlmaWNhdGlvbiBpcyBub3QgaW1tZWRpYXRlLCBpdCB3aWxsIG9jY3VyIG9uIHRoZSBjbG9zZXN0IG1pY3JvLXRhc2sgYWZ0ZXIgdGhlIGNoYW5nZS5cbiAgICovXG4gIHJlYWRvbmx5IGZvY3VzQ2hhbmdlZDogT2JzZXJ2YWJsZTxQYmxOZ3JpZEZvY3VzQ2hhbmdlZEV2ZW50PiA9IHRoaXMuZm9jdXNDaGFuZ2VkJFxuICAgIC5waXBlKFxuICAgICAgYnVmZmVyPFBibE5ncmlkRm9jdXNDaGFuZ2VkRXZlbnQ+KHRoaXMuZm9jdXNDaGFuZ2VkJC5waXBlKGRlYm91bmNlVGltZSgwLCBhc2FwU2NoZWR1bGVyKSkpLFxuICAgICAgbWFwKCBldmVudHMgPT4gKHsgcHJldjogZXZlbnRzWzBdLnByZXYsIGN1cnI6IGV2ZW50c1tldmVudHMubGVuZ3RoIC0gMV0uY3VyciB9KSApXG4gICAgKTtcblxuICAvKipcbiAgICogTm90aWZ5IHdoZW4gdGhlIHNlbGVjdGVkIGNlbGxzIGhhcyBjaGFuZ2VkLlxuICAgKi9cbiAgcmVhZG9ubHkgc2VsZWN0aW9uQ2hhbmdlZDogT2JzZXJ2YWJsZTxQYmxOZ3JpZFNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSB0aGlzLnNlbGVjdGlvbkNoYW5nZWQkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKlxuICAgKiBUaGUgcmVmZXJlbmNlIHRvIGN1cnJlbnRseSBmb2N1c2VkIGNlbGwgY29udGV4dC5cbiAgICogWW91IGNhbiByZXRyaWV2ZSB0aGUgYWN0dWFsIGNvbnRleHQgb3IgY29udGV4dCBjZWxsIHVzaW5nIGBmaW5kUm93SW5WaWV3YCBhbmQgLyBvciBgZmluZFJvd0luQ2FjaGVgLlxuICAgKlxuICAgKiA+IE5vdGUgdGhhdCB3aGVuIHZpcnR1YWwgc2Nyb2xsIGlzIGVuYWJsZWQgdGhlIGN1cnJlbnRseSBmb2N1c2VkIGNlbGwgZG9lcyBub3QgaGF2ZSB0byBleGlzdCBpbiB0aGUgdmlldy5cbiAgICogSWYgdGhpcyBpcyB0aGUgY2FzZSBgZmluZFJvd0luVmlld2Agd2lsbCByZXR1cm4gdW5kZWZpbmVkLCB1c2UgYGZpbmRSb3dJbkNhY2hlYCBpbnN0ZWFkLlxuICAgKi9cbiAgZ2V0IGZvY3VzZWRDZWxsKCk6IEdyaWREYXRhUG9pbnQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZUZvY3VzZWQgPyB7Li4udGhpcy5hY3RpdmVGb2N1c2VkIH0gOiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlZmVyZW5jZSB0byBjdXJyZW50bHkgc2VsZWN0ZWQgcmFuZ2Ugb2YgY2VsbCdzIGNvbnRleHQuXG4gICAqIFlvdSBjYW4gcmV0cmlldmUgdGhlIGFjdHVhbCBjb250ZXh0IG9yIGNvbnRleHQgY2VsbCB1c2luZyBgZmluZFJvd0luVmlld2AgYW5kIC8gb3IgYGZpbmRSb3dJbkNhY2hlYC5cbiAgICpcbiAgICogPiBOb3RlIHRoYXQgd2hlbiB2aXJ0dWFsIHNjcm9sbCBpcyBlbmFibGVkIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY2VsbHMgZG9lcyBub3QgaGF2ZSB0byBleGlzdCBpbiB0aGUgdmlldy5cbiAgICogSWYgdGhpcyBpcyB0aGUgY2FzZSBgZmluZFJvd0luVmlld2Agd2lsbCByZXR1cm4gdW5kZWZpbmVkLCB1c2UgYGZpbmRSb3dJbkNhY2hlYCBpbnN0ZWFkLlxuICAgKi9cbiAgZ2V0IHNlbGVjdGVkQ2VsbHMoKTogR3JpZERhdGFQb2ludFtdIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVTZWxlY3RlZC5zbGljZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBleHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGk8VD4pIHtcbiAgICB0aGlzLmNvbHVtbkFwaSA9IGV4dEFwaS5jb2x1bW5BcGk7XG4gICAgZXh0QXBpLmV2ZW50c1xuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlciggZSA9PiBlLmtpbmQgPT09ICdvbkRhdGFTb3VyY2UnKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy52Y1JlZiA9IGV4dEFwaS5jZGtUYWJsZS5fcm93T3V0bGV0LnZpZXdDb250YWluZXI7XG4gICAgICAgIHRoaXMuc3luY1ZpZXdBbmRDb250ZXh0KCk7XG4gICAgICAgIGV4dEFwaS5jZGtUYWJsZS5vblJlbmRlclJvd3Muc3Vic2NyaWJlKCgpID0+IHRoaXMuc3luY1ZpZXdBbmRDb250ZXh0KCkpO1xuICAgICAgfSk7XG5cbiAgICBleHRBcGkuZXZlbnRzLnBpcGUoT05fREVTVFJPWSkuc3Vic2NyaWJlKCBlID0+IHRoaXMuZGVzdHJveSgpICk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXMgdGhlIHByb3ZpZGVkIGNlbGwuXG4gICAqIElmIGEgY2VsbCBpcyBub3QgcHJvdmlkZWQgd2lsbCB1bi1mb2N1cyAoYmx1cikgdGhlIGN1cnJlbnRseSBmb2N1c2VkIGNlbGwgKGlmIHRoZXJlIGlzIG9uZSkuXG4gICAqIEBwYXJhbSBjZWxsUmVmIEEgUmVmZXJlbmNlIHRvIHRoZSBjZWxsXG4gICAqL1xuICBmb2N1c0NlbGwoY2VsbFJlZj86IENlbGxSZWZlcmVuY2UpOiB2b2lkIHtcbiAgICBpZiAoIWNlbGxSZWYpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZUZvY3VzZWQpIHtcbiAgICAgICAgY29uc3QgeyByb3dJZGVudCwgY29sSW5kZXggfSA9IHRoaXMuYWN0aXZlRm9jdXNlZDtcbiAgICAgICAgdGhpcy5hY3RpdmVGb2N1c2VkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKHJvd0lkZW50LCBjb2xJbmRleCwgeyBmb2N1c2VkOiBmYWxzZSB9KTtcbiAgICAgICAgdGhpcy5lbWl0Rm9jdXNDaGFuZ2VkKHRoaXMuYWN0aXZlRm9jdXNlZCk7XG4gICAgICAgIGNvbnN0IHJvd0NvbnRleHQgPSB0aGlzLmZpbmRSb3dJblZpZXcocm93SWRlbnQpO1xuICAgICAgICBpZiAocm93Q29udGV4dCkge1xuICAgICAgICAgIHRoaXMuZXh0QXBpLmdyaWQucm93c0FwaS5zeW5jUm93cygnZGF0YScsIHJvd0NvbnRleHQuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlZiA9IHJlc29sdmVDZWxsUmVmZXJlbmNlKGNlbGxSZWYsIHRoaXMgYXMgYW55KTtcbiAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgdGhpcy5mb2N1c0NlbGwoKTtcbiAgICAgICAgaWYgKHJlZiBpbnN0YW5jZW9mIFBibENlbGxDb250ZXh0KSB7XG4gICAgICAgICAgaWYgKCFyZWYuZm9jdXNlZCAmJiAhdGhpcy5leHRBcGkuZ3JpZC52aWV3cG9ydC5pc1Njcm9sbGluZykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShyZWYucm93Q29udGV4dC5pZGVudGl0eSwgcmVmLmluZGV4LCB7IGZvY3VzZWQ6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRm9jdXNlZCA9IHsgcm93SWRlbnQ6IHJlZi5yb3dDb250ZXh0LmlkZW50aXR5LCBjb2xJbmRleDogcmVmLmluZGV4IH07XG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0Q2VsbHMoIFsgdGhpcy5hY3RpdmVGb2N1c2VkIF0sIHRydWUpO1xuXG4gICAgICAgICAgICB0aGlzLmV4dEFwaS5ncmlkLnJvd3NBcGkuc3luY1Jvd3MoJ2RhdGEnLCByZWYucm93Q29udGV4dC5pbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUocmVmWzBdLmlkZW50aXR5LCByZWZbMV0sIHsgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUZvY3VzZWQgPSB7IHJvd0lkZW50OiByZWZbMF0uaWRlbnRpdHksIGNvbEluZGV4OiByZWZbMV0gfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXRGb2N1c0NoYW5nZWQodGhpcy5hY3RpdmVGb2N1c2VkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGFsbCBwcm92aWRlZCBjZWxscy5cbiAgICogQHBhcmFtIGNlbGxSZWYgQSBSZWZlcmVuY2UgdG8gdGhlIGNlbGxcbiAgICogQHBhcmFtIGNsZWFyQ3VycmVudCBDbGVhciB0aGUgY3VycmVudCBzZWxlY3Rpb24gYmVmb3JlIGFwcGx5aW5nIHRoZSBuZXcgc2VsZWN0aW9uLlxuICAgKiBEZWZhdWx0IHRvIGZhbHNlIChhZGQgdG8gY3VycmVudCkuXG4gICAqL1xuICBzZWxlY3RDZWxscyhjZWxsUmVmczogQ2VsbFJlZmVyZW5jZVtdLCBjbGVhckN1cnJlbnQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdG9NYXJrUmVuZGVyZWQgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICAgIGlmIChjbGVhckN1cnJlbnQpIHtcbiAgICAgIHRoaXMudW5zZWxlY3RDZWxscygpO1xuICAgIH1cblxuICAgIGNvbnN0IGFkZGVkOiBHcmlkRGF0YVBvaW50W10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgY2VsbFJlZiBvZiBjZWxsUmVmcykge1xuICAgICAgY29uc3QgcmVmID0gcmVzb2x2ZUNlbGxSZWZlcmVuY2UoY2VsbFJlZiwgdGhpcyBhcyBhbnkpO1xuICAgICAgaWYgKHJlZiBpbnN0YW5jZW9mIFBibENlbGxDb250ZXh0KSB7XG4gICAgICAgIGlmICghcmVmLnNlbGVjdGVkICYmICF0aGlzLmV4dEFwaS5ncmlkLnZpZXdwb3J0LmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgY29uc3Qgcm93SWRlbnQgPSByZWYucm93Q29udGV4dC5pZGVudGl0eVxuICAgICAgICAgIGNvbnN0IGNvbEluZGV4ID0gcmVmLmluZGV4O1xuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUocm93SWRlbnQsIGNvbEluZGV4LCB7IHNlbGVjdGVkOiB0cnVlIH0pO1xuXG4gICAgICAgICAgY29uc3QgZGF0YVBvaW50ID0geyByb3dJZGVudCwgY29sSW5kZXggfTtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNlbGVjdGVkLnB1c2goZGF0YVBvaW50KTtcbiAgICAgICAgICBhZGRlZC5wdXNoKGRhdGFQb2ludCk7XG5cbiAgICAgICAgICB0b01hcmtSZW5kZXJlZC5hZGQocmVmLnJvd0NvbnRleHQuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJlZikge1xuICAgICAgICBjb25zdCBbIHJvd1N0YXRlLCBjb2xJbmRleCBdID0gcmVmO1xuICAgICAgICBpZiAoIXJvd1N0YXRlLmNlbGxzW2NvbEluZGV4XS5zZWxlY3RlZCkge1xuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUocm93U3RhdGUuaWRlbnRpdHksIGNvbEluZGV4LCB7IHNlbGVjdGVkOiB0cnVlIH0pO1xuICAgICAgICAgIHRoaXMuYWN0aXZlU2VsZWN0ZWQucHVzaCggeyByb3dJZGVudDogcm93U3RhdGUuaWRlbnRpdHksIGNvbEluZGV4IH0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0b01hcmtSZW5kZXJlZC5zaXplID4gMCkge1xuICAgICAgdGhpcy5leHRBcGkuZ3JpZC5yb3dzQXBpLnN5bmNSb3dzKCdkYXRhJywgLi4uQXJyYXkuZnJvbSh0b01hcmtSZW5kZXJlZC52YWx1ZXMoKSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlZCQubmV4dCh7IGFkZGVkLCByZW1vdmVkOiBbXSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnNlbGVjdCBhbGwgcHJvdmlkZWQgY2VsbHMuXG4gICAqIElmIGNlbGxzIGFyZSBub3QgcHJvdmlkZWQgd2lsbCB1bi1zZWxlY3QgYWxsIGN1cnJlbnRseSBzZWxlY3RlZCBjZWxscy5cbiAgICogQHBhcmFtIGNlbGxSZWYgQSBSZWZlcmVuY2UgdG8gdGhlIGNlbGxcbiAgICovXG4gIHVuc2VsZWN0Q2VsbHMoY2VsbFJlZnM/OiBDZWxsUmVmZXJlbmNlW10pOiB2b2lkIHtcbiAgICBjb25zdCB0b01hcmtSZW5kZXJlZCA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGxldCB0b1Vuc2VsZWN0OiBDZWxsUmVmZXJlbmNlW10gPSB0aGlzLmFjdGl2ZVNlbGVjdGVkO1xuICAgIGxldCByZW1vdmVBbGwgPSB0cnVlO1xuXG4gICAgaWYoQXJyYXkuaXNBcnJheShjZWxsUmVmcykpIHtcbiAgICAgIHRvVW5zZWxlY3QgPSBjZWxsUmVmcztcbiAgICAgIHJlbW92ZUFsbCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2ZVNlbGVjdGVkID0gW107XG4gICAgfVxuXG4gICAgY29uc3QgcmVtb3ZlZDogR3JpZERhdGFQb2ludFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGNlbGxSZWYgb2YgdG9VbnNlbGVjdCkge1xuICAgICAgY29uc3QgcmVmID0gcmVzb2x2ZUNlbGxSZWZlcmVuY2UoY2VsbFJlZiwgdGhpcyBhcyBhbnkpO1xuICAgICAgaWYgKHJlZiBpbnN0YW5jZW9mIFBibENlbGxDb250ZXh0KSB7XG4gICAgICAgIGlmIChyZWYuc2VsZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCByb3dJZGVudCA9IHJlZi5yb3dDb250ZXh0LmlkZW50aXR5XG4gICAgICAgICAgY29uc3QgY29sSW5kZXggPSByZWYuaW5kZXg7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShyb3dJZGVudCwgY29sSW5kZXgsIHsgc2VsZWN0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgIGlmICghcmVtb3ZlQWxsKSB7XG4gICAgICAgICAgICBjb25zdCB3YXNSZW1vdmVkID0gcmVtb3ZlRnJvbUFycmF5KHRoaXMuYWN0aXZlU2VsZWN0ZWQsIGl0ZW0gPT4gaXRlbS5jb2xJbmRleCA9PT0gY29sSW5kZXggJiYgaXRlbS5yb3dJZGVudCA9PT0gcm93SWRlbnQpO1xuICAgICAgICAgICAgaWYgKHdhc1JlbW92ZWQpIHtcbiAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKHsgcm93SWRlbnQsIGNvbEluZGV4IH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvTWFya1JlbmRlcmVkLmFkZChyZWYucm93Q29udGV4dC5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVmKSB7XG4gICAgICAgIGNvbnN0IFsgcm93U3RhdGUsIGNvbEluZGV4IF0gPSByZWY7XG4gICAgICAgIGlmIChyb3dTdGF0ZS5jZWxsc1tjb2xJbmRleF0uc2VsZWN0ZWQpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKHJvd1N0YXRlLmlkZW50aXR5LCBjb2xJbmRleCwgeyBzZWxlY3RlZDogZmFsc2UgfSk7XG4gICAgICAgICAgaWYgKCFyZW1vdmVBbGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHdhc1JlbW92ZWQgPSByZW1vdmVGcm9tQXJyYXkodGhpcy5hY3RpdmVTZWxlY3RlZCwgaXRlbSA9PiBpdGVtLmNvbEluZGV4ID09PSBjb2xJbmRleCAmJiBpdGVtLnJvd0lkZW50ID09PSByb3dTdGF0ZS5pZGVudGl0eSk7XG4gICAgICAgICAgICBpZiAod2FzUmVtb3ZlZCkge1xuICAgICAgICAgICAgICByZW1vdmVkLnB1c2goeyByb3dJZGVudDogcm93U3RhdGUuaWRlbnRpdHksIGNvbEluZGV4IH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRvTWFya1JlbmRlcmVkLnNpemUgPiAwKSB7XG4gICAgICB0aGlzLmV4dEFwaS5ncmlkLnJvd3NBcGkuc3luY1Jvd3MoJ2RhdGEnLCAuLi5BcnJheS5mcm9tKHRvTWFya1JlbmRlcmVkLnZhbHVlcygpKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2VkJC5uZXh0KHsgYWRkZWQ6IFtdLCByZW1vdmVkIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgZW50aXJlIGNvbnRleHQsIGluY2x1ZGluZyB2aWV3IGNhY2hlIGFuZCBtZW1vcnkgY2FjaGUgKHJvd3Mgb3V0IG9mIHZpZXcpXG4gICAqIEBwYXJhbSBzeW5jVmlldyBJZiB0cnVlIHdpbGwgc3luYyB0aGUgdmlldyBhbmQgdGhlIGNvbnRleHQgcmlnaHQgYWZ0ZXIgY2xlYXJpbmcgd2hpY2ggd2lsbCBlbnN1cmUgdGhlIHZpZXcgY2FjaGUgaXMgaG90IGFuZCBzeW5jZWQgd2l0aCB0aGUgYWN0dWFsIHJlbmRlcmVkIHJvd3NcbiAgICogU29tZSBwbHVnaW5zIHdpbGwgZXhwZWN0IGEgcm93IHRvIGhhdmUgYSBjb250ZXh0IHNvIHRoaXMgbWlnaHQgYmUgcmVxdWlyZWQuXG4gICAqIFRoZSB2aWV3IGFuZCBjb250ZXh0IGFyZSBzeW5jZWQgZXZlcnkgdGltZSByb3dzIGFyZSByZW5kZXJlZCBzbyBtYWtlIHN1cmUgeW91IHNldCB0aGlzIHRvIHRydWUgb25seSB3aGVuIHlvdSBrbm93IHRoZXJlIGlzIG5vIHJlbmRlcmluZyBjYWxsIGNvbWluZyBkb3duIHRoZSBwaXBlLlxuICAgKi9cbiAgY2xlYXIoc3luY1ZpZXc/OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy52aWV3Q2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLnZpZXdDYWNoZUdob3N0LmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICAgIGlmIChzeW5jVmlldyA9PT0gdHJ1ZSkge1xuICAgICAgZm9yIChjb25zdCByIG9mIHRoaXMuZXh0QXBpLnJvd3NBcGkuZGF0YVJvd3MoKSkge1xuICAgICAgICB0aGlzLnZpZXdDYWNoZS5zZXQoci5yb3dJbmRleCwgci5jb250ZXh0KTtcbiAgICAgICAgLy8gd2UncmUgY2xlYXJpbmcgdGhlIGV4aXN0aW5nIHZpZXcgc3RhdGUgb24gdGhlIGNvbXBvbmVudFxuICAgICAgICAvLyBJZiBpbiB0aGUgZnV0dXJlIHdlIHdhbnQgdG8gdXBkYXRlIHN0YXRlIGFuZCBub3QgY2xlYXIsIHJlbW92ZSB0aGlzIG9uZVxuICAgICAgICAvLyBhbmQgaW5zdGVhZCBqdXN0IHRha2UgdGhlIHN0YXRlIGFuZCBwdXQgaXQgaW4gdGhlIGNhY2hlLlxuICAgICAgICAvLyBlLmcuIGlmIG9uIGNvbHVtbiBzd2FwIHdlIHdhbnQgdG8gc3dhcCBjZWxscyBpbiB0aGUgY29udGV4dC4uLlxuICAgICAgICByLmNvbnRleHQuZnJvbVN0YXRlKHRoaXMuZ2V0Q3JlYXRlU3RhdGUoci5jb250ZXh0KSk7XG4gICAgICAgIHRoaXMuc3luY1ZpZXdBbmRDb250ZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2F2ZVN0YXRlKGNvbnRleHQ6IFBibE5ncmlkUm93Q29udGV4dDxUPikge1xuICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgUGJsUm93Q29udGV4dCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY29udGV4dC5pZGVudGl0eSwgY29udGV4dC5nZXRTdGF0ZSgpKTtcbiAgICB9XG4gIH1cblxuICBnZXRSb3cocm93OiBudW1iZXIgfCBIVE1MRWxlbWVudCk6IFBibE5ncmlkUm93Q29udGV4dDxUPiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgaW5kZXggPSB0eXBlb2Ygcm93ID09PSAnbnVtYmVyJyA/IHJvdyA6IGZpbmRSb3dSZW5kZXJlZEluZGV4KHJvdyk7XG4gICAgcmV0dXJuIHRoaXMucm93Q29udGV4dChpbmRleCk7XG4gIH1cblxuICBnZXRDZWxsKGNlbGw6IEhUTUxFbGVtZW50IHwgR3JpZERhdGFQb2ludCk6IFBibE5ncmlkQ2VsbENvbnRleHQgfCB1bmRlZmluZWRcbiAgLyoqXG4gICAqIFJldHVybiB0aGUgY2VsbCBjb250ZXh0IGZvciB0aGUgY2VsbCBhdCB0aGUgcG9pbnQgc3BlY2lmaWVkXG4gICAqIEBwYXJhbSByb3dcbiAgICogQHBhcmFtIGNvbFxuICAgKi9cbiAgZ2V0Q2VsbChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBQYmxOZ3JpZENlbGxDb250ZXh0IHwgdW5kZWZpbmVkO1xuICBnZXRDZWxsKHJvd09yQ2VsbEVsZW1lbnQ6IG51bWJlciB8IEhUTUxFbGVtZW50IHwgR3JpZERhdGFQb2ludCwgY29sPzogbnVtYmVyKTogUGJsTmdyaWRDZWxsQ29udGV4dCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHR5cGVvZiByb3dPckNlbGxFbGVtZW50ID09PSAnbnVtYmVyJykge1xuICAgICAgY29uc3Qgcm93Q29udGV4dCA9IHRoaXMucm93Q29udGV4dChyb3dPckNlbGxFbGVtZW50KTtcbiAgICAgIGlmIChyb3dDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiByb3dDb250ZXh0LmNlbGwoY29sKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVmID0gcmVzb2x2ZUNlbGxSZWZlcmVuY2Uocm93T3JDZWxsRWxlbWVudCwgdGhpcyBhcyBhbnkpO1xuICAgICAgaWYgKHJlZiBpbnN0YW5jZW9mIFBibENlbGxDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiByZWY7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0RGF0YUl0ZW0oY2VsbDogQ2VsbFJlZmVyZW5jZSk6IGFueSB7XG4gICAgY29uc3QgcmVmID0gcmVzb2x2ZUNlbGxSZWZlcmVuY2UoY2VsbCwgdGhpcyBhcyBhbnkpO1xuICAgIGlmIChyZWYgaW5zdGFuY2VvZiBQYmxDZWxsQ29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlZi5jb2wuZ2V0VmFsdWUocmVmLnJvd0NvbnRleHQuJGltcGxpY2l0KTtcbiAgICB9IGVsc2UgaWYgKHJlZikge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5leHRBcGkuZ3JpZC5kcy5zb3VyY2VbcmVmWzBdLmRzSW5kZXhdO1xuICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5leHRBcGkuZ3JpZC5jb2x1bW5BcGkuZmluZENvbHVtbkF0KHJlZlsxXSk7XG4gICAgICByZXR1cm4gY29sdW1uLmdldFZhbHVlKHJvdyk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ2VsbENvbnRleHQocmVuZGVyUm93SW5kZXg6IG51bWJlciwgY29sdW1uOiBQYmxDb2x1bW4pOiBQYmxDZWxsQ29udGV4dDxUPiB7XG4gICAgY29uc3Qgcm93Q29udGV4dCA9IHRoaXMucm93Q29udGV4dChyZW5kZXJSb3dJbmRleCk7XG4gICAgY29uc3QgY29sSW5kZXggPSB0aGlzLmNvbHVtbkFwaS5pbmRleE9mKGNvbHVtbik7XG4gICAgcmV0dXJuIHJvd0NvbnRleHQuY2VsbChjb2xJbmRleCk7XG4gIH1cblxuICByb3dDb250ZXh0KHJlbmRlclJvd0luZGV4OiBudW1iZXIpOiBQYmxSb3dDb250ZXh0PFQ+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy52aWV3Q2FjaGUuZ2V0KHJlbmRlclJvd0luZGV4KTtcbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHJvd0lkZW50aXR5OiBhbnksIGNvbHVtbkluZGV4OiBudW1iZXIsIGNlbGxTdGF0ZTogUGFydGlhbDxDZWxsQ29udGV4dFN0YXRlPFQ+Pik6IHZvaWQ7XG4gIHVwZGF0ZVN0YXRlKHJvd0lkZW50aXR5OiBhbnksIHJvd1N0YXRlOiBQYXJ0aWFsPFJvd0NvbnRleHRTdGF0ZTxUPj4pOiB2b2lkO1xuICB1cGRhdGVTdGF0ZShyb3dJZGVudGl0eTogYW55LCByb3dTdGF0ZU9yQ2VsbEluZGV4OiBQYXJ0aWFsPFJvd0NvbnRleHRTdGF0ZTxUPj4gfCBudW1iZXIsIGNlbGxTdGF0ZT86IFBhcnRpYWw8Q2VsbENvbnRleHRTdGF0ZTxUPj4pOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50Um93U3RhdGUgPSB0aGlzLmNhY2hlLmdldChyb3dJZGVudGl0eSk7XG4gICAgaWYgKGN1cnJlbnRSb3dTdGF0ZSkge1xuICAgICAgaWYgKHR5cGVvZiByb3dTdGF0ZU9yQ2VsbEluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBjdXJyZW50Q2VsbFN0YXRlID0gY3VycmVudFJvd1N0YXRlLmNlbGxzW3Jvd1N0YXRlT3JDZWxsSW5kZXhdO1xuICAgICAgICBpZiAoY3VycmVudENlbGxTdGF0ZSkge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24oY3VycmVudENlbGxTdGF0ZSwgY2VsbFN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihjdXJyZW50Um93U3RhdGUsIHJvd1N0YXRlT3JDZWxsSW5kZXgpO1xuICAgICAgfVxuICAgICAgY29uc3Qgcm93Q29udGV4dCA9IHRoaXMuZmluZFJvd0luVmlldyhyb3dJZGVudGl0eSk7XG4gICAgICBpZiAocm93Q29udGV4dCkge1xuICAgICAgICByb3dDb250ZXh0LmZyb21TdGF0ZShjdXJyZW50Um93U3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gZmluZCBhIHNwZWNpZmljIHJvdywgdXNpbmcgdGhlIHJvdyBpZGVudGl0eSwgaW4gdGhlIGN1cnJlbnQgdmlldy5cbiAgICogSWYgdGhlIHJvdyBpcyBub3QgaW4gdGhlIHZpZXcgKG9yIGV2ZW4gbm90IGluIHRoZSBjYWNoZSkgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyB0aGUgcm93J3MgY29udGV4dCBpbnN0YW5jZSAoYFBibFJvd0NvbnRleHRgKVxuICAgKiBAcGFyYW0gcm93SWRlbnRpdHkgVGhlIHJvdydzIGlkZW50aXR5LiBJZiBhIHNwZWNpZmljIGlkZW50aXR5IGlzIHVzZWQsIHBsZWFzZSBwcm92aWRlIGl0IG90aGVyd2lzZSBwcm92aWRlIHRoZSBpbmRleCBvZiB0aGUgcm93IGluIHRoZSBkYXRhc291cmNlLlxuICAgKi9cbiAgZmluZFJvd0luVmlldyhyb3dJZGVudGl0eTogYW55KTogUGJsUm93Q29udGV4dDxUPiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgcm93U3RhdGUgPSB0aGlzLmNhY2hlLmdldChyb3dJZGVudGl0eSk7XG4gICAgaWYgKHJvd1N0YXRlKSB7XG4gICAgICBjb25zdCByZW5kZXJSb3dJbmRleCA9IHJvd1N0YXRlLmRzSW5kZXggLSB0aGlzLmV4dEFwaS5ncmlkLmRzLnJlbmRlclN0YXJ0O1xuICAgICAgY29uc3Qgcm93Q29udGV4dCA9IHRoaXMudmlld0NhY2hlLmdldChyZW5kZXJSb3dJbmRleCk7XG4gICAgICBpZiAocm93Q29udGV4dCAmJiByb3dDb250ZXh0LmlkZW50aXR5ID09PSByb3dJZGVudGl0eSkge1xuICAgICAgICByZXR1cm4gcm93Q29udGV4dDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHRvIGZpbmQgYSBzcGVjaWZpYyByb3cgY29udGV4dCwgdXNpbmcgdGhlIHJvdyBpZGVudGl0eSwgaW4gdGhlIGNvbnRleHQgY2FjaGUuXG4gICAqIE5vdGUgdGhhdCB0aGUgY2FjaGUgZG9lcyBub3QgaG9sZCB0aGUgY29udGV4dCBpdHNlbGYgYnV0IG9ubHkgdGhlIHN0YXRlIHRoYXQgY2FuIGxhdGVyIGJlIHVzZWQgdG8gcmV0cmlldmUgYSBjb250ZXh0IGluc3RhbmNlLiBUaGUgY29udGV4dCBpbnN0YW5jZVxuICAgKiBpcyBvbmx5IHVzZWQgYXMgY29udGV4dCBmb3Igcm93cyBpbiB2aWV3LlxuICAgKiBAcGFyYW0gcm93SWRlbnRpdHkgVGhlIHJvdydzIGlkZW50aXR5LiBJZiBhIHNwZWNpZmljIGlkZW50aXR5IGlzIHVzZWQsIHBsZWFzZSBwcm92aWRlIGl0IG90aGVyd2lzZSBwcm92aWRlIHRoZSBpbmRleCBvZiB0aGUgcm93IGluIHRoZSBkYXRhc291cmNlLlxuICAgKi9cbiAgZmluZFJvd0luQ2FjaGUocm93SWRlbnRpdHk6IGFueSk6IFJvd0NvbnRleHRTdGF0ZTxUPiB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFRyeSB0byBmaW5kIGEgc3BlY2lmaWMgcm93IGNvbnRleHQsIHVzaW5nIHRoZSByb3cgaWRlbnRpdHksIGluIHRoZSBjb250ZXh0IGNhY2hlLlxuICAgKiBOb3RlIHRoYXQgdGhlIGNhY2hlIGRvZXMgbm90IGhvbGQgdGhlIGNvbnRleHQgaXRzZWxmIGJ1dCBvbmx5IHRoZSBzdGF0ZSB0aGF0IGNhbiBsYXRlciBiZSB1c2VkIHRvIHJldHJpZXZlIGEgY29udGV4dCBpbnN0YW5jZS4gVGhlIGNvbnRleHQgaW5zdGFuY2VcbiAgICogaXMgb25seSB1c2VkIGFzIGNvbnRleHQgZm9yIHJvd3MgaW4gdmlldy5cbiAgICogQHBhcmFtIHJvd0lkZW50aXR5IFRoZSByb3cncyBpZGVudGl0eS4gSWYgYSBzcGVjaWZpYyBpZGVudGl0eSBpcyB1c2VkLCBwbGVhc2UgcHJvdmlkZSBpdCBvdGhlcndpc2UgcHJvdmlkZSB0aGUgaW5kZXggb2YgdGhlIHJvdyBpbiB0aGUgZGF0YXNvdXJjZS5cbiAgICogQHBhcmFtIG9mZnNldCBXaGVuIHNldCwgcmV0dXJucyB0aGUgcm93IGF0IHRoZSBvZmZzZXQgZnJvbSB0aGUgcm93IHdpdGggdGhlIHByb3ZpZGVkIHJvdyBpZGVudGl0eS4gQ2FuIGJlIGFueSBudW1lcmljIHZhbHVlIChlLmcgNSwgLTYsIDQpLlxuICAgKiBAcGFyYW0gY3JlYXRlIFdoZXRoZXIgdG8gY3JlYXRlIGEgbmV3IHN0YXRlIGlmIHRoZSBjdXJyZW50IHN0YXRlIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgZmluZFJvd0luQ2FjaGUocm93SWRlbnRpdHk6IGFueSwgb2Zmc2V0OiBudW1iZXIsIGNyZWF0ZTogYm9vbGVhbik6IFJvd0NvbnRleHRTdGF0ZTxUPiB8IHVuZGVmaW5lZDtcbiAgZmluZFJvd0luQ2FjaGUocm93SWRlbnRpdHk6IGFueSwgb2Zmc2V0PzogbnVtYmVyLCBjcmVhdGU/OiBib29sZWFuKTogUm93Q29udGV4dFN0YXRlPFQ+IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCByb3dTdGF0ZSA9IHRoaXMuY2FjaGUuZ2V0KHJvd0lkZW50aXR5KTtcblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICByZXR1cm4gcm93U3RhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRzSW5kZXggPSByb3dTdGF0ZS5kc0luZGV4ICsgb2Zmc2V0O1xuICAgICAgY29uc3QgaWRlbnRpdHkgPSB0aGlzLmdldFJvd0lkZW50aXR5KGRzSW5kZXgpO1xuICAgICAgaWYgKGlkZW50aXR5ICE9PSBudWxsKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLmZpbmRSb3dJbkNhY2hlKGlkZW50aXR5KTtcbiAgICAgICAgaWYgKCFyZXN1bHQgJiYgY3JlYXRlICYmIGRzSW5kZXggPCB0aGlzLmV4dEFwaS5ncmlkLmRzLmxlbmd0aCkge1xuICAgICAgICAgIHJlc3VsdCA9IFBibFJvd0NvbnRleHQuZGVmYXVsdFN0YXRlKGlkZW50aXR5LCBkc0luZGV4LCB0aGlzLmNvbHVtbkFwaS5jb2x1bW5zLmxlbmd0aCk7XG4gICAgICAgICAgdGhpcy5jYWNoZS5zZXQoaWRlbnRpdHksIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRSb3dJZGVudGl0eShkc0luZGV4OiBudW1iZXIsIHJvd0RhdGE/OiBUKTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgeyBkcyB9ID0gdGhpcy5leHRBcGkuZ3JpZDtcbiAgICBjb25zdCB7IHByaW1hcnkgfSA9IHRoaXMuZXh0QXBpLmNvbHVtblN0b3JlO1xuXG4gICAgY29uc3Qgcm93ID0gcm93RGF0YSB8fCBkcy5zb3VyY2VbZHNJbmRleF07XG4gICAgaWYgKCFyb3cpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcHJpbWFyeSA/IHByaW1hcnkuZ2V0VmFsdWUocm93KSA6IGRzSW5kZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlUm93Q29udGV4dChkYXRhOiBULCByZW5kZXJSb3dJbmRleDogbnVtYmVyKTogUGJsUm93Q29udGV4dDxUPiB7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBQYmxSb3dDb250ZXh0PFQ+KGRhdGEsIHRoaXMuZXh0QXBpLmdyaWQuZHMucmVuZGVyU3RhcnQgKyByZW5kZXJSb3dJbmRleCwgdGhpcy5leHRBcGkpO1xuICAgIGNvbnRleHQuZnJvbVN0YXRlKHRoaXMuZ2V0Q3JlYXRlU3RhdGUoY29udGV4dCkpO1xuICAgIHRoaXMuYWRkVG9WaWV3Q2FjaGUocmVuZGVyUm93SW5kZXgsIGNvbnRleHQpO1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgX3VwZGF0ZVJvd0NvbnRleHQocm93Q29udGV4dDogUGJsUm93Q29udGV4dDxUPiwgcmVuZGVyUm93SW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IGRzSW5kZXggPSB0aGlzLmV4dEFwaS5ncmlkLmRzLnJlbmRlclN0YXJ0ICsgcmVuZGVyUm93SW5kZXg7XG4gICAgY29uc3QgaWRlbnRpdHkgPSB0aGlzLmdldFJvd0lkZW50aXR5KGRzSW5kZXgsIHJvd0NvbnRleHQuJGltcGxpY2l0KTtcbiAgICBpZiAocm93Q29udGV4dC5pZGVudGl0eSAhPT0gaWRlbnRpdHkpIHtcbiAgICAgIHJvd0NvbnRleHQuc2F2ZVN0YXRlKCk7XG4gICAgICByb3dDb250ZXh0LmRzSW5kZXggPSBkc0luZGV4O1xuICAgICAgcm93Q29udGV4dC5pZGVudGl0eSA9IGlkZW50aXR5O1xuICAgICAgcm93Q29udGV4dC5mcm9tU3RhdGUodGhpcy5nZXRDcmVhdGVTdGF0ZShyb3dDb250ZXh0KSk7XG4gICAgICB0aGlzLmFkZFRvVmlld0NhY2hlKHJlbmRlclJvd0luZGV4LCByb3dDb250ZXh0KVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9WaWV3Q2FjaGUocm93SW5kZXg6IG51bWJlciwgcm93Q29udGV4dDogUGJsUm93Q29udGV4dDxUPikge1xuICAgIHRoaXMudmlld0NhY2hlLnNldChyb3dJbmRleCwgcm93Q29udGV4dCk7XG4gICAgdGhpcy52aWV3Q2FjaGVHaG9zdC5kZWxldGUocm93Q29udGV4dC5pZGVudGl0eSk7XG4gIH1cblxuICBwcml2YXRlIGdldENyZWF0ZVN0YXRlKGNvbnRleHQ6IFBibFJvd0NvbnRleHQ8VD4pIHtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhY2hlLmdldChjb250ZXh0LmlkZW50aXR5KTtcbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICBzdGF0ZSA9IFBibFJvd0NvbnRleHQuZGVmYXVsdFN0YXRlKGNvbnRleHQuaWRlbnRpdHksIGNvbnRleHQuZHNJbmRleCwgdGhpcy5jb2x1bW5BcGkuY29sdW1ucy5sZW5ndGgpO1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY29udGV4dC5pZGVudGl0eSwgc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBwcml2YXRlIGVtaXRGb2N1c0NoYW5nZWQoY3VycjogUGJsTmdyaWRGb2N1c0NoYW5nZWRFdmVudFsnY3VyciddKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c0NoYW5nZWQkLm5leHQoe1xuICAgICAgcHJldjogdGhpcy5mb2N1c0NoYW5nZWQkLnZhbHVlLmN1cnIsXG4gICAgICBjdXJyLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNDaGFuZ2VkJC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlZCQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY1ZpZXdBbmRDb250ZXh0KCkge1xuICAgIHRoaXMudmlld0NhY2hlR2hvc3QuZm9yRWFjaCggaWRlbnQgPT4ge1xuICAgICAgaWYgKCF0aGlzLmZpbmRSb3dJblZpZXcoaWRlbnQpKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuZ2V0KGlkZW50KS5maXJzdFJlbmRlciA9IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy52aWV3Q2FjaGVHaG9zdCA9IG5ldyBTZXQoQXJyYXkuZnJvbSh0aGlzLnZpZXdDYWNoZS52YWx1ZXMoKSkuZmlsdGVyKCB2ID0+IHYuZmlyc3RSZW5kZXIgKS5tYXAoIHYgPT4gdi5pZGVudGl0eSApKTtcbiAgfVxufVxuXG4iXX0=