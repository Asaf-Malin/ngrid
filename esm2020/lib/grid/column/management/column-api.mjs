import { map } from 'rxjs/operators';
import { ON_RESIZE_ROW } from '@pebula/ngrid/core';
import { isPblColumn } from '../model/column';
export class ColumnApi {
    constructor() { }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static create(extApi) {
        const instance = new ColumnApi();
        instance.grid = extApi.grid;
        instance.store = extApi.columnStore;
        instance.extApi = extApi;
        return instance;
    }
    get visibleColumnIds() { return this.store.visibleColumnIds; }
    get hiddenColumnIds() { return this.store.hiddenColumnIds; }
    get visibleColumns() { return this.store.visibleColumns; }
    get columns() { return this.store.allColumns; }
    get columnIds() { return this.store.columnIds; }
    get totalColumnWidthChange() {
        if (!this._totalColumnWidthChange) {
            this._totalColumnWidthChange = this.extApi.events
                .pipe(ON_RESIZE_ROW, 
            // We might get a null sizeInfo when a new column is added - see syncColumnGroupsSize()
            map(e => this.grid.columnApi.visibleColumns.reduce((p, c) => p + c.sizeInfo?.width ?? 0, 0)));
        }
        return this._totalColumnWidthChange;
    }
    /**
     * Returns the `PblColumn` at the specified index from the list of rendered columns (i.e. not hidden).
     */
    findColumnAt(renderColumnIndex) {
        return this.store.visibleColumns[renderColumnIndex];
    }
    /**
     * Returns the column matching provided `id`.
     *
     * The search is performed on all known columns.
     */
    findColumn(id) {
        const result = this.store.find(id);
        if (result) {
            return result.data;
        }
    }
    /**
    * Returns the render index of column or -1 if not found.
    *
    * The render index represents the current location of the column in the group of visible columns.
    */
    renderIndexOf(column) {
        const c = typeof column === 'string' ? this.findColumn(column) : column;
        return this.store.visibleColumns.indexOf(c);
    }
    /**
     * Returns the index of a column or -1 if not found.
     */
    indexOf(column) {
        const c = typeof column === 'string' ? this.findColumn(column) : column;
        return this.store.allColumns.indexOf(c);
    }
    isColumnHidden(column) {
        return this.store.isColumnHidden(column);
    }
    /**
     * Hide columns in the table
     */
    hideColumns(column, ...columns) {
        this.store.updateColumnVisibility([column, ...columns]);
    }
    showColumns(columnOrShowAll, ...columns) {
        if (columnOrShowAll === true) {
            this.store.clearColumnVisibility();
        }
        else {
            this.store.updateColumnVisibility(undefined, [columnOrShowAll, ...columns]);
        }
    }
    /**
     * Update the width of the column with the provided width.
     *
     * The width is set in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     *
     * Resizing the column will trigger a table width resizing event, updating column group if necessary.
     */
    resizeColumn(column, width) {
        column.updateWidth(width);
        // this.grid.resetColumnsWidth();
        // this.grid.resizeColumns();
    }
    /**
     * Resize the column to best fit it's content.
     *
     * - Content: All of the cells rendered for this column (header, data and footer cells).
     * - Best fit: The width of the cell with the height width measured.
     *
     * The best fit found (width) is then used to call `resizeColumn()`.
     */
    autoSizeColumn(column) {
        const size = this.findColumnAutoSize(column);
        this.resizeColumn(column, `${size}px`);
    }
    autoSizeColumns(...columns) {
        const cols = columns.length > 0 ? columns : this.visibleColumns;
        for (const column of cols) {
            const size = this.findColumnAutoSize(column);
            column.updateWidth(`${size}px`);
        }
        // this.grid.resetColumnsWidth();
        // this.grid.resizeColumns();
    }
    /**
     * For each visible column in the table, resize the width to a proportional width relative to the total width provided.
     */
    autoSizeToFit(totalWidth, options = {}) {
        const wLogic = this.extApi.widthCalc.dynamicColumnWidth;
        const { visibleColumns } = this;
        const columnBehavior = options.columnBehavior || (() => options);
        let overflowTotalWidth = 0;
        let totalMinWidth = 0;
        const withMinWidth = [];
        const widthBreakouts = visibleColumns.map((column, index) => {
            const widthBreakout = wLogic.widthBreakout(column.sizeInfo);
            const instructions = { ...(columnBehavior(column) || {}), ...options };
            overflowTotalWidth += widthBreakout.content;
            totalWidth -= widthBreakout.nonContent;
            if (instructions.keepMinWidth && column.minWidth) {
                totalMinWidth += column.minWidth;
                withMinWidth.push(index);
            }
            return { ...widthBreakout, instructions };
        });
        const p = totalMinWidth / totalWidth;
        const level = (overflowTotalWidth * p - totalMinWidth) / (1 - p);
        for (const i of withMinWidth) {
            const addition = level * (visibleColumns[i].minWidth / totalMinWidth);
            widthBreakouts[i].content += addition;
            overflowTotalWidth += addition;
        }
        for (let i = 0; i < visibleColumns.length; i++) {
            const widthBreakout = widthBreakouts[i];
            const instructions = widthBreakout.instructions;
            const column = visibleColumns[i];
            const r = widthBreakout.content / overflowTotalWidth;
            if (!instructions.keepMinWidth || !column.minWidth) {
                column.minWidth = undefined;
            }
            if (!instructions.keepMaxWidth || !column.maxWidth) {
                column.maxWidth = undefined;
                column.checkMaxWidthLock(column.sizeInfo.width); // if its locked, we need to release...
            }
            // There are 3 scenarios when updating the column
            // 1) if it's a fixed width or we're force into fixed width
            // 2) Not fixed width and width is set (%)
            // 3) Not fixed width an width is not set ( the width depends on the calculated `defaultWidth` done in `this.grid.resetColumnsWidth()` )
            let width;
            const { forceWidthType } = instructions;
            if (forceWidthType === 'px' || (!forceWidthType && column.isFixedWidth)) { // (1)
                width = `${totalWidth * r}px`;
            }
            else if (forceWidthType === '%' || (!forceWidthType && column.width)) { // (2)
                width = `${100 * r}%`;
            } // else (3) -> the update is skipped and it will run through resetColumnsWidth
            if (width) {
                column.updateWidth(width);
            }
        }
        // we now reset the column widths, this will calculate a new `defaultWidth` and set it in all columns but the relevant ones are column from (3)
        // It will also mark all columnDefs for check
        this.extApi.widthCalc.resetColumnsWidth();
        this.extApi.widthCalc.calcColumnWidth();
    }
    moveColumn(column, anchor) {
        if (isPblColumn(anchor)) {
            return column === anchor ? false : this.store.moveColumn(column, anchor);
        }
        else {
            const a = this.findColumnAt(anchor);
            return a ? this.moveColumn(column, a) : false;
        }
    }
    /**
     * Swap positions between 2 existing columns.
     */
    swapColumns(col1, col2) {
        return this.store.swapColumns(col1, col2);
    }
    addGroupBy(...column) { this.store.addGroupBy(...column); }
    removeGroupBy(...column) { this.store.removeGroupBy(...column); }
    findColumnAutoSize(column) {
        const { columnDef } = column;
        const cells = columnDef.queryCellElements();
        for (let i = 0, len = cells.length; i < len; i++) {
            const parentRow = this.extApi.rowsApi.findRowByElement(cells[i].parentElement);
            if (parentRow.rowType === 'header' && parentRow.gridWidthRow) {
                cells.splice(i, 1);
                break;
            }
        }
        let size = 0;
        let internalWidth;
        for (const c of cells) {
            if (c.childElementCount <= 1) {
                const element = (c.firstElementChild || c);
                internalWidth = element.scrollWidth;
            }
            else {
                internalWidth = 0;
                let el = c.firstElementChild;
                do {
                    switch (getComputedStyle(el).position) {
                        case 'sticky':
                        case 'absolute':
                        case 'fixed':
                            break;
                        default:
                            internalWidth += el.scrollWidth;
                            break;
                    }
                } while (el = el.nextElementSibling);
            }
            if (internalWidth > size) {
                size = internalWidth + 1;
                // we add 1 pixel because `element.scrollWidth` does not support subpixel values, the width is converted to an integer removing subpixel values (fractions).
            }
        }
        return size;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NvbHVtbi9tYW5hZ2VtZW50L2NvbHVtbi1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUluRCxPQUFPLEVBQWEsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJekQsTUFBTSxPQUFPLFNBQVM7SUF1Q3BCLGdCQUF3QixDQUFDO0lBckN6QixnRkFBZ0Y7SUFDaEYsd0lBQXdJO0lBQ3hJLDBGQUEwRjtJQUMxRix5R0FBeUc7SUFDekcsTUFBTSxDQUFDLE1BQU0sQ0FBSSxNQUE0QjtRQUMzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLFNBQVMsRUFBSyxDQUFDO1FBRXBDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUM1QixRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFekIsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELElBQUksZ0JBQWdCLEtBQWUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUN4RSxJQUFJLGVBQWUsS0FBZSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUN0RSxJQUFJLGNBQWMsS0FBa0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxPQUFPLEtBQWtCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzVELElB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NEo7YUFDN0o7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBPTl9SRVNJWkVfUk9XIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5Sb3dDb21wb25lbnQgfSBmcm9tICcuLi8uLi9yb3cvY29sdW1ucy1yb3cuY29tcG9uZW50JztcbmltcG9ydCB7IFBibENvbHVtbiwgaXNQYmxDb2x1bW4gfSBmcm9tICcuLi9tb2RlbC9jb2x1bW4nO1xuaW1wb3J0IHsgUGJsQ29sdW1uU3RvcmUgfSBmcm9tICcuL2NvbHVtbi1zdG9yZSc7XG5pbXBvcnQgeyBBdXRvU2l6ZVRvRml0T3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQ29sdW1uQXBpPFQ+IHtcblxuICAvLyB3b3JrYXJvdW5kLCB3ZSBuZWVkIGEgcGFyYW1ldGVyLWxlc3MgY29uc3RydWN0b3Igc2luY2UgQG5ndG9vbHMvd2VicGFja0A4LjAuNFxuICAvLyBOb24gQEluamVjdGFibGUgY2xhc3NlcyBhcmUgbm93IGdldHRpbmcgYWRkZGVkIHdpdGggaGFyZCByZWZlcmVuY2UgdG8gdGhlIGN0b3IgcGFyYW1zIHdoaWNoIGF0IHRoZSBjbGFzcyBjcmVhdGlvbiBwb2ludCBhcmUgdW5kZWZpbmVkXG4gIC8vIGZvcndhcmRSZWYoKSB3aWxsIG5vdCBoZWxwIHNpbmNlIGl0J3Mgbm90IGluamVjdCBieSBhbmd1bGFyLCB3ZSBpbnN0YW50aWF0ZSB0aGUgY2xhc3MuLlxuICAvLyBwcm9iYWJseSBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvY29tbWl0LzYzOTE5ODQ5OTk3M2UwZjQzN2YwNTliM2M5MzNjNzJjNzMzZDkzZDhcbiAgc3RhdGljIGNyZWF0ZTxUPihleHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpKTogQ29sdW1uQXBpPFQ+IHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBDb2x1bW5BcGk8VD4oKTtcblxuICAgIGluc3RhbmNlLmdyaWQgPSBleHRBcGkuZ3JpZDtcbiAgICBpbnN0YW5jZS5zdG9yZSA9IGV4dEFwaS5jb2x1bW5TdG9yZTtcbiAgICBpbnN0YW5jZS5leHRBcGkgPSBleHRBcGk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBnZXQgdmlzaWJsZUNvbHVtbklkcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnN0b3JlLnZpc2libGVDb2x1bW5JZHM7IH1cbiAgZ2V0IGhpZGRlbkNvbHVtbklkcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnN0b3JlLmhpZGRlbkNvbHVtbklkczsgfVxuICBnZXQgdmlzaWJsZUNvbHVtbnMoKTogUGJsQ29sdW1uW10geyByZXR1cm4gdGhpcy5zdG9yZS52aXNpYmxlQ29sdW1uczsgfVxuICBnZXQgY29sdW1ucygpOiBQYmxDb2x1bW5bXSB7IHJldHVybiB0aGlzLnN0b3JlLmFsbENvbHVtbnM7IH1cbiAgZ2V0IGNvbHVtbklkcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnN0b3JlLmNvbHVtbklkczsgfVxuXG4gIGdldCB0b3RhbENvbHVtbldpZHRoQ2hhbmdlKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLl90b3RhbENvbHVtbldpZHRoQ2hhbmdlKSB7XG4gICAgICB0aGlzLl90b3RhbENvbHVtbldpZHRoQ2hhbmdlID0gdGhpcy5leHRBcGkuZXZlbnRzXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIE9OX1JFU0laRV9ST1csXG4gICAgICAgICAgLy8gV2UgbWlnaHQgZ2V0IGEgbnVsbCBzaXplSW5mbyB3aGVuIGEgbmV3IGNvbHVtbiBpcyBhZGRlZCAtIHNlZSBzeW5jQ29sdW1uR3JvdXBzU2l6ZSgpXG4gICAgICAgICAgbWFwKCBlID0+IHRoaXMuZ3JpZC5jb2x1bW5BcGkudmlzaWJsZUNvbHVtbnMucmVkdWNlKCAocCwgYykgPT4gcCArIGMuc2l6ZUluZm8/LndpZHRoID8/IDAsIDAgKSApLFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdG90YWxDb2x1bW5XaWR0aENoYW5nZTtcbiAgfVxuXG4gIHByaXZhdGUgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PFQ+O1xuICBwcml2YXRlIHN0b3JlOiBQYmxDb2x1bW5TdG9yZTtcbiAgcHJpdmF0ZSBleHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpO1xuICBwcml2YXRlIF90b3RhbENvbHVtbldpZHRoQ2hhbmdlOiBPYnNlcnZhYmxlPG51bWJlcj47XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgUGJsQ29sdW1uYCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGZyb20gdGhlIGxpc3Qgb2YgcmVuZGVyZWQgY29sdW1ucyAoaS5lLiBub3QgaGlkZGVuKS5cbiAgICovXG4gIGZpbmRDb2x1bW5BdChyZW5kZXJDb2x1bW5JbmRleDogbnVtYmVyKTogUGJsQ29sdW1uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS52aXNpYmxlQ29sdW1uc1tyZW5kZXJDb2x1bW5JbmRleF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29sdW1uIG1hdGNoaW5nIHByb3ZpZGVkIGBpZGAuXG4gICAqXG4gICAqIFRoZSBzZWFyY2ggaXMgcGVyZm9ybWVkIG9uIGFsbCBrbm93biBjb2x1bW5zLlxuICAgKi9cbiAgZmluZENvbHVtbihpZDogc3RyaW5nKTogUGJsQ29sdW1uIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnN0b3JlLmZpbmQoaWQpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBSZXR1cm5zIHRoZSByZW5kZXIgaW5kZXggb2YgY29sdW1uIG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAgKlxuICAqIFRoZSByZW5kZXIgaW5kZXggcmVwcmVzZW50cyB0aGUgY3VycmVudCBsb2NhdGlvbiBvZiB0aGUgY29sdW1uIGluIHRoZSBncm91cCBvZiB2aXNpYmxlIGNvbHVtbnMuXG4gICovXG4gIHJlbmRlckluZGV4T2YoY29sdW1uOiBzdHJpbmcgfCBQYmxDb2x1bW4pOiBudW1iZXIge1xuICAgIGNvbnN0IGMgPSB0eXBlb2YgY29sdW1uID09PSAnc3RyaW5nJyA/IHRoaXMuZmluZENvbHVtbihjb2x1bW4pIDogY29sdW1uO1xuICAgIHJldHVybiB0aGlzLnN0b3JlLnZpc2libGVDb2x1bW5zLmluZGV4T2YoYyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgYSBjb2x1bW4gb3IgLTEgaWYgbm90IGZvdW5kLlxuICAgKi9cbiAgaW5kZXhPZihjb2x1bW46IHN0cmluZyB8IFBibENvbHVtbik6IG51bWJlciB7XG4gICAgY29uc3QgYyA9IHR5cGVvZiBjb2x1bW4gPT09ICdzdHJpbmcnID8gdGhpcy5maW5kQ29sdW1uKGNvbHVtbikgOiBjb2x1bW47XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuYWxsQ29sdW1ucy5pbmRleE9mKGMpO1xuICB9XG5cbiAgaXNDb2x1bW5IaWRkZW4oY29sdW1uOiBQYmxDb2x1bW4pIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5pc0NvbHVtbkhpZGRlbihjb2x1bW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGUgY29sdW1ucyBpbiB0aGUgdGFibGVcbiAgICovXG4gIGhpZGVDb2x1bW5zKGNvbHVtbjogUGJsQ29sdW1uIHwgc3RyaW5nLCAgLi4uY29sdW1uczogUGJsQ29sdW1uW10gfCBzdHJpbmdbXSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUudXBkYXRlQ29sdW1uVmlzaWJpbGl0eShbY29sdW1uLCAuLi5jb2x1bW5zXSBhcyBQYmxDb2x1bW5bXSB8IHN0cmluZ1tdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIHZpc2liaWxpdHkgc3RhdGUgb2YgdGhlIHByb3ZpZGVkIGNvbHVtbnMgdG8gdmlzaWJsZS5cbiAgICogSWYgbm8gY29sdW1ucyBhcmUgcHJvdmlkZWQgYWxsIGNvbHVtbnNcbiAgICovXG4gIHNob3dDb2x1bW5zKHNob3dBbGw6IHRydWUpOiB2b2lkO1xuICBzaG93Q29sdW1ucyhjb2x1bW46IFBibENvbHVtbiB8IHN0cmluZywgIC4uLmNvbHVtbnM6IFBibENvbHVtbltdIHwgc3RyaW5nW10pOiB2b2lkO1xuICBzaG93Q29sdW1ucyhjb2x1bW5PclNob3dBbGw6IFBibENvbHVtbiB8IHN0cmluZyB8IHRydWUsICAuLi5jb2x1bW5zOiBQYmxDb2x1bW5bXSB8IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgaWYgKGNvbHVtbk9yU2hvd0FsbCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdG9yZS5jbGVhckNvbHVtblZpc2liaWxpdHkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdG9yZS51cGRhdGVDb2x1bW5WaXNpYmlsaXR5KHVuZGVmaW5lZCwgW2NvbHVtbk9yU2hvd0FsbCwgLi4uY29sdW1uc10gYXMgUGJsQ29sdW1uW10gfCBzdHJpbmdbXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbiB3aXRoIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAgICpcbiAgICogVGhlIHdpZHRoIGlzIHNldCBpbiBweCBvciAlIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OiAjIyUgb3IgIyNweFxuICAgKiBFeGFtcGxlczogJzUwJScsICc1MHB4J1xuICAgKlxuICAgKiBSZXNpemluZyB0aGUgY29sdW1uIHdpbGwgdHJpZ2dlciBhIHRhYmxlIHdpZHRoIHJlc2l6aW5nIGV2ZW50LCB1cGRhdGluZyBjb2x1bW4gZ3JvdXAgaWYgbmVjZXNzYXJ5LlxuICAgKi9cbiAgcmVzaXplQ29sdW1uKGNvbHVtbjogUGJsQ29sdW1uLCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29sdW1uLnVwZGF0ZVdpZHRoKHdpZHRoKTtcbiAgICAvLyB0aGlzLmdyaWQucmVzZXRDb2x1bW5zV2lkdGgoKTtcbiAgICAvLyB0aGlzLmdyaWQucmVzaXplQ29sdW1ucygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgY29sdW1uIHRvIGJlc3QgZml0IGl0J3MgY29udGVudC5cbiAgICpcbiAgICogLSBDb250ZW50OiBBbGwgb2YgdGhlIGNlbGxzIHJlbmRlcmVkIGZvciB0aGlzIGNvbHVtbiAoaGVhZGVyLCBkYXRhIGFuZCBmb290ZXIgY2VsbHMpLlxuICAgKiAtIEJlc3QgZml0OiBUaGUgd2lkdGggb2YgdGhlIGNlbGwgd2l0aCB0aGUgaGVpZ2h0IHdpZHRoIG1lYXN1cmVkLlxuICAgKlxuICAgKiBUaGUgYmVzdCBmaXQgZm91bmQgKHdpZHRoKSBpcyB0aGVuIHVzZWQgdG8gY2FsbCBgcmVzaXplQ29sdW1uKClgLlxuICAgKi9cbiAgYXV0b1NpemVDb2x1bW4oY29sdW1uOiBQYmxDb2x1bW4pOiB2b2lkIHtcbiAgICBjb25zdCBzaXplID0gdGhpcy5maW5kQ29sdW1uQXV0b1NpemUoY29sdW1uKTtcbiAgICB0aGlzLnJlc2l6ZUNvbHVtbihjb2x1bW4sIGAke3NpemV9cHhgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZWFjaCB2aXNpYmxlIGNvbHVtbiBpbiB0aGUgdGFibGUsIHJlc2l6ZSB0byBiZXN0IGZpdCBpdCdzIGNvbnRlbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgc2ltcGx5IHJ1biBgYXV0b1NpemVDb2x1bW4oKWAgb24gdGhlIHZpc2libGUgY29sdW1ucyBpbiB0aGUgdGFibGUuXG4gICAqL1xuICBhdXRvU2l6ZUNvbHVtbnMoKTogdm9pZDtcbiAgLyoqXG4gICAqIEZvciBlYWNoIGNvbHVtbiBpbiB0aGUgbGlzdCBvZiBjb2x1bW4gcHJvdmlkZWQsIHJlc2l6ZSB0byBiZXN0IGZpdCBpdCdzIGNvbnRlbnQuXG4gICAqXG4gICAqIE1ha2Ugc3VyZSB5b3UgYXJlIG5vdCByZXNpemluZyBhbiBoaWRkZW4gY29sdW1uLlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHNpbXBseSBydW4gYGF1dG9TaXplQ29sdW1uKClgIG9uIHRoZSBjb2x1bW5zIHByb3ZpZGVkLlxuICAgKi9cbiAgYXV0b1NpemVDb2x1bW5zKC4uLmNvbHVtbnM6IFBibENvbHVtbltdKTogdm9pZDsgLy8gdHNsaW50OmRpc2FibGUtbGluZTp1bmlmaWVkLXNpZ25hdHVyZXNcbiAgYXV0b1NpemVDb2x1bW5zKC4uLmNvbHVtbnM6IFBibENvbHVtbltdKTogdm9pZCB7XG4gICAgY29uc3QgY29scyA9IGNvbHVtbnMubGVuZ3RoID4gMCA/IGNvbHVtbnMgOiB0aGlzLnZpc2libGVDb2x1bW5zO1xuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHMpIHtcbiAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmZpbmRDb2x1bW5BdXRvU2l6ZShjb2x1bW4pO1xuICAgICAgY29sdW1uLnVwZGF0ZVdpZHRoKGAke3NpemV9cHhgKTtcbiAgICB9XG4gICAgLy8gdGhpcy5ncmlkLnJlc2V0Q29sdW1uc1dpZHRoKCk7XG4gICAgLy8gdGhpcy5ncmlkLnJlc2l6ZUNvbHVtbnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZWFjaCB2aXNpYmxlIGNvbHVtbiBpbiB0aGUgdGFibGUsIHJlc2l6ZSB0aGUgd2lkdGggdG8gYSBwcm9wb3J0aW9uYWwgd2lkdGggcmVsYXRpdmUgdG8gdGhlIHRvdGFsIHdpZHRoIHByb3ZpZGVkLlxuICAgKi9cbiAgYXV0b1NpemVUb0ZpdCh0b3RhbFdpZHRoOiBudW1iZXIsIG9wdGlvbnM6IEF1dG9TaXplVG9GaXRPcHRpb25zID0ge30pOiB2b2lkIHtcbiAgICBjb25zdCB3TG9naWMgPSB0aGlzLmV4dEFwaS53aWR0aENhbGMuZHluYW1pY0NvbHVtbldpZHRoO1xuICAgIGNvbnN0IHsgdmlzaWJsZUNvbHVtbnMgfSA9IHRoaXM7XG4gICAgY29uc3QgY29sdW1uQmVoYXZpb3I6IEF1dG9TaXplVG9GaXRPcHRpb25zWydjb2x1bW5CZWhhdmlvciddID0gb3B0aW9ucy5jb2x1bW5CZWhhdmlvciB8fCAoICgpID0+IG9wdGlvbnMgKSBhcyBhbnk7XG5cbiAgICBsZXQgb3ZlcmZsb3dUb3RhbFdpZHRoID0gMDtcbiAgICBsZXQgdG90YWxNaW5XaWR0aCA9IDA7XG5cbiAgICBjb25zdCB3aXRoTWluV2lkdGg6IG51bWJlcltdID0gW107XG5cbiAgICBjb25zdCB3aWR0aEJyZWFrb3V0cyA9IHZpc2libGVDb2x1bW5zLm1hcCggKGNvbHVtbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHdpZHRoQnJlYWtvdXQgPSB3TG9naWMud2lkdGhCcmVha291dChjb2x1bW4uc2l6ZUluZm8pO1xuICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25zID0geyAuLi4oY29sdW1uQmVoYXZpb3IoY29sdW1uKSB8fCB7fSksIC4uLm9wdGlvbnMgfTtcblxuICAgICAgb3ZlcmZsb3dUb3RhbFdpZHRoICs9IHdpZHRoQnJlYWtvdXQuY29udGVudDtcbiAgICAgIHRvdGFsV2lkdGggLT0gd2lkdGhCcmVha291dC5ub25Db250ZW50O1xuXG4gICAgICBpZiAoaW5zdHJ1Y3Rpb25zLmtlZXBNaW5XaWR0aCAmJiBjb2x1bW4ubWluV2lkdGgpIHtcbiAgICAgICAgdG90YWxNaW5XaWR0aCArPSBjb2x1bW4ubWluV2lkdGg7XG4gICAgICAgIHdpdGhNaW5XaWR0aC5wdXNoKGluZGV4KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgLi4ud2lkdGhCcmVha291dCwgaW5zdHJ1Y3Rpb25zIH07XG4gICAgfSk7XG5cbiAgICBjb25zdCBwID0gdG90YWxNaW5XaWR0aCAvIHRvdGFsV2lkdGg7XG4gICAgY29uc3QgbGV2ZWwgPSAob3ZlcmZsb3dUb3RhbFdpZHRoICogcCAgLSB0b3RhbE1pbldpZHRoKSAvICgxIC0gcCk7XG4gICAgZm9yIChjb25zdCBpIG9mIHdpdGhNaW5XaWR0aCkge1xuICAgICAgY29uc3QgYWRkaXRpb24gPSBsZXZlbCAqICh2aXNpYmxlQ29sdW1uc1tpXS5taW5XaWR0aCAvIHRvdGFsTWluV2lkdGgpXG4gICAgICB3aWR0aEJyZWFrb3V0c1tpXS5jb250ZW50ICs9IGFkZGl0aW9uO1xuICAgICAgb3ZlcmZsb3dUb3RhbFdpZHRoICs9IGFkZGl0aW9uO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlzaWJsZUNvbHVtbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHdpZHRoQnJlYWtvdXQgPSB3aWR0aEJyZWFrb3V0c1tpXTtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9ucyA9IHdpZHRoQnJlYWtvdXQuaW5zdHJ1Y3Rpb25zO1xuICAgICAgY29uc3QgY29sdW1uID0gdmlzaWJsZUNvbHVtbnNbaV07XG5cbiAgICAgIGNvbnN0IHIgPSB3aWR0aEJyZWFrb3V0LmNvbnRlbnQgLyBvdmVyZmxvd1RvdGFsV2lkdGg7XG5cbiAgICAgIGlmICghaW5zdHJ1Y3Rpb25zLmtlZXBNaW5XaWR0aCB8fCAhY29sdW1uLm1pbldpZHRoKSB7XG4gICAgICAgIGNvbHVtbi5taW5XaWR0aCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmICghaW5zdHJ1Y3Rpb25zLmtlZXBNYXhXaWR0aCB8fCAhY29sdW1uLm1heFdpZHRoKSB7XG4gICAgICAgIGNvbHVtbi5tYXhXaWR0aCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29sdW1uLmNoZWNrTWF4V2lkdGhMb2NrKGNvbHVtbi5zaXplSW5mby53aWR0aCk7IC8vIGlmIGl0cyBsb2NrZWQsIHdlIG5lZWQgdG8gcmVsZWFzZS4uLlxuICAgICAgfVxuXG4gICAgICAvLyBUaGVyZSBhcmUgMyBzY2VuYXJpb3Mgd2hlbiB1cGRhdGluZyB0aGUgY29sdW1uXG4gICAgICAvLyAxKSBpZiBpdCdzIGEgZml4ZWQgd2lkdGggb3Igd2UncmUgZm9yY2UgaW50byBmaXhlZCB3aWR0aFxuICAgICAgLy8gMikgTm90IGZpeGVkIHdpZHRoIGFuZCB3aWR0aCBpcyBzZXQgKCUpXG4gICAgICAvLyAzKSBOb3QgZml4ZWQgd2lkdGggYW4gd2lkdGggaXMgbm90IHNldCAoIHRoZSB3aWR0aCBkZXBlbmRzIG9uIHRoZSBjYWxjdWxhdGVkIGBkZWZhdWx0V2lkdGhgIGRvbmUgaW4gYHRoaXMuZ3JpZC5yZXNldENvbHVtbnNXaWR0aCgpYCApXG4gICAgICBsZXQgd2lkdGg6IHN0cmluZztcbiAgICAgIGNvbnN0IHsgZm9yY2VXaWR0aFR5cGUgfSA9IGluc3RydWN0aW9ucztcbiAgICAgIGlmIChmb3JjZVdpZHRoVHlwZSA9PT0gJ3B4JyB8fCAoIWZvcmNlV2lkdGhUeXBlICYmIGNvbHVtbi5pc0ZpeGVkV2lkdGgpKSB7IC8vICgxKVxuICAgICAgICB3aWR0aCA9IGAke3RvdGFsV2lkdGggKiByfXB4YDtcbiAgICAgIH0gZWxzZSBpZiAoZm9yY2VXaWR0aFR5cGUgPT09ICclJyB8fCAoIWZvcmNlV2lkdGhUeXBlICYmIGNvbHVtbi53aWR0aCkpIHsgLy8gKDIpXG4gICAgICAgIHdpZHRoID0gYCR7MTAwICogcn0lYDtcbiAgICAgIH0gLy8gZWxzZSAoMykgLT4gdGhlIHVwZGF0ZSBpcyBza2lwcGVkIGFuZCBpdCB3aWxsIHJ1biB0aHJvdWdoIHJlc2V0Q29sdW1uc1dpZHRoXG5cbiAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICBjb2x1bW4udXBkYXRlV2lkdGgod2lkdGgpO1xuICAgICAgfVxuXG4gICAgfVxuICAgIC8vIHdlIG5vdyByZXNldCB0aGUgY29sdW1uIHdpZHRocywgdGhpcyB3aWxsIGNhbGN1bGF0ZSBhIG5ldyBgZGVmYXVsdFdpZHRoYCBhbmQgc2V0IGl0IGluIGFsbCBjb2x1bW5zIGJ1dCB0aGUgcmVsZXZhbnQgb25lcyBhcmUgY29sdW1uIGZyb20gKDMpXG4gICAgLy8gSXQgd2lsbCBhbHNvIG1hcmsgYWxsIGNvbHVtbkRlZnMgZm9yIGNoZWNrXG4gICAgdGhpcy5leHRBcGkud2lkdGhDYWxjLnJlc2V0Q29sdW1uc1dpZHRoKCk7XG4gICAgdGhpcy5leHRBcGkud2lkdGhDYWxjLmNhbGNDb2x1bW5XaWR0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHByb3ZpZGVkIGBjb2x1bW5gIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgYGFuY2hvcmAgY29sdW1uLlxuICAgKiBUaGUgbmV3IGxvY2F0aW9uIG9mIHRoZSBhbmNob3IgY29sdW1uIHdpbGwgYmUgaXQncyBvcmlnaW5hbCBsb2NhdGlvbiBwbHVzIG9yIG1pbnVzIDEsIGRlcGVuZGluZyBvbiB0aGUgZGVsdGEgYmV0d2VlblxuICAgKiB0aGUgY29sdW1ucy4gSWYgdGhlIG9yaWdpbiBvZiB0aGUgYGNvbHVtbmAgaXMgYmVmb3JlIHRoZSBgYW5jaG9yYCB0aGVuIHRoZSBhbmNob3IncyBuZXcgcG9zaXRpb24gaXMgbWludXMgb25lLCBvdGhlcndpc2UgcGx1cyAxLlxuICAgKi9cbiAgbW92ZUNvbHVtbihjb2x1bW46IFBibENvbHVtbiwgYW5jaG9yOiBQYmxDb2x1bW4pOiBib29sZWFuO1xuICAgIC8qKlxuICAgKiBNb3ZlIHRoZSBwcm92aWRlZCBgY29sdW1uYCB0byB0aGUgcG9zaXRpb24gb2YgdGhlIGNvbHVtbiBhdCBgcmVuZGVyQ29sdW1uSW5kZXhgLlxuICAgKiBgcmVuZGVyQ29sdW1uSW5kZXhgIG11c3QgYmUgYSB2aXNpYmxlIGNvbHVtbiAoaS5lLiBub3QgaGlkZGVuKVxuICAgKi9cbiAgbW92ZUNvbHVtbihjb2x1bW46IFBibENvbHVtbiwgcmVuZGVyQ29sdW1uSW5kZXg6IG51bWJlcik6IGJvb2xlYW47IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6dW5pZmllZC1zaWduYXR1cmVzXG4gIG1vdmVDb2x1bW4oY29sdW1uOiBQYmxDb2x1bW4sIGFuY2hvcjogUGJsQ29sdW1uIHwgbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKGlzUGJsQ29sdW1uKGFuY2hvcikpIHtcbiAgICAgIHJldHVybiBjb2x1bW4gPT09IGFuY2hvciA/IGZhbHNlIDogdGhpcy5zdG9yZS5tb3ZlQ29sdW1uKGNvbHVtbiwgYW5jaG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYSA9IHRoaXMuZmluZENvbHVtbkF0KGFuY2hvcik7XG4gICAgICByZXR1cm4gYSA/IHRoaXMubW92ZUNvbHVtbihjb2x1bW4sIGEpIDogZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN3YXAgcG9zaXRpb25zIGJldHdlZW4gMiBleGlzdGluZyBjb2x1bW5zLlxuICAgKi9cbiAgc3dhcENvbHVtbnMoY29sMTogUGJsQ29sdW1uLCBjb2wyOiBQYmxDb2x1bW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5zd2FwQ29sdW1ucyhjb2wxLCBjb2wyKTtcbiAgfVxuXG4gIGFkZEdyb3VwQnkoLi4uY29sdW1uOiBQYmxDb2x1bW5bXSk6IHZvaWQgeyB0aGlzLnN0b3JlLmFkZEdyb3VwQnkoLi4uY29sdW1uKTsgfVxuICByZW1vdmVHcm91cEJ5KC4uLmNvbHVtbjogUGJsQ29sdW1uW10pOiB2b2lkIHsgdGhpcy5zdG9yZS5yZW1vdmVHcm91cEJ5KC4uLmNvbHVtbik7IH1cblxuICBwcml2YXRlIGZpbmRDb2x1bW5BdXRvU2l6ZShjb2x1bW46IFBibENvbHVtbik6IG51bWJlciB7XG4gICAgY29uc3QgeyBjb2x1bW5EZWYgfSA9IGNvbHVtbjtcbiAgICBjb25zdCBjZWxscyA9IGNvbHVtbkRlZi5xdWVyeUNlbGxFbGVtZW50cygpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjZWxscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgcGFyZW50Um93ID0gdGhpcy5leHRBcGkucm93c0FwaS5maW5kUm93QnlFbGVtZW50KGNlbGxzW2ldLnBhcmVudEVsZW1lbnQpO1xuICAgICAgaWYgKHBhcmVudFJvdy5yb3dUeXBlID09PSAnaGVhZGVyJyAmJiAocGFyZW50Um93IGFzIHVua25vd24gYXMgUGJsTmdyaWRDb2x1bW5Sb3dDb21wb25lbnQpLmdyaWRXaWR0aFJvdykge1xuICAgICAgICBjZWxscy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBzaXplID0gMDtcbiAgICBsZXQgaW50ZXJuYWxXaWR0aDogbnVtYmVyO1xuICAgIGZvciAoY29uc3QgYyBvZiBjZWxscykge1xuICAgICAgaWYgKGMuY2hpbGRFbGVtZW50Q291bnQgPD0gMSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gKGMuZmlyc3RFbGVtZW50Q2hpbGQgfHwgYykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGludGVybmFsV2lkdGggPSBlbGVtZW50LnNjcm9sbFdpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxXaWR0aCA9IDA7XG4gICAgICAgIGxldCBlbDogRWxlbWVudCA9IGMuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBzd2l0Y2ggKGdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdzdGlja3knOlxuICAgICAgICAgICAgY2FzZSAnYWJzb2x1dGUnOlxuICAgICAgICAgICAgY2FzZSAnZml4ZWQnOlxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGludGVybmFsV2lkdGggKz0gZWwuc2Nyb2xsV2lkdGg7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcpXG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJuYWxXaWR0aCA+IHNpemUpIHtcbiAgICAgICAgc2l6ZSA9IGludGVybmFsV2lkdGggKyAxO1xuICAgICAgICAvLyB3ZSBhZGQgMSBwaXhlbCBiZWNhdXNlIGBlbGVtZW50LnNjcm9sbFdpZHRoYCBkb2VzIG5vdCBzdXBwb3J0IHN1YnBpeGVsIHZhbHVlcywgdGhlIHdpZHRoIGlzIGNvbnZlcnRlZCB0byBhbiBpbnRlZ2VyIHJlbW92aW5nIHN1YnBpeGVsIHZhbHVlcyAoZnJhY3Rpb25zKS5cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNpemU7XG4gIH1cbn1cbiJdfQ==