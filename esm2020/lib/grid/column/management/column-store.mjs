import { Subject } from 'rxjs';
import { isDevMode } from '@angular/core';
import { findCellDef } from '../../cell/cell-def/utils';
import { PblColumnFactory, isPblColumn, PblColumn, PblMetaColumn, } from '../model';
import { StaticColumnWidthLogic } from '../width-logic/static-column-width';
import { resetColumnWidths } from '../../utils/width';
import { HiddenColumns } from './hidden-columns';
import { MetaRowsStore } from './meta-rows-store';
export class PblColumnStore {
    constructor(extApi, differs) {
        this.extApi = extApi;
        this.differs = differs;
        this.byId = new Map();
        this.hiddenColumns = new HiddenColumns();
        this._visibleChanged$ = new Subject();
        this.grid = extApi.grid;
        this.metaRowsStore = new MetaRowsStore(differs);
        this.resetIds();
        this.resetColumns();
        this.metaRowsStore.visibleChanged$
            .subscribe(event => {
            event.changes.forEachOperation((record, previousIndex, currentIndex) => {
                if (record.previousIndex == null) {
                    const columns = this.find(record.item);
                    const col = event.metaRow.kind === 'header' ?
                        event.metaRow.isGroup ? columns.headerGroup : columns.header
                        : event.metaRow.isGroup ? columns.footerGroup : columns.footer;
                    event.metaRow.rowDef.cols.splice(currentIndex, 0, col);
                }
                else if (currentIndex == null) {
                    event.metaRow.rowDef.cols.splice(previousIndex, 1);
                }
                else {
                    moveItemInArray(event.metaRow.rowDef.cols, previousIndex, currentIndex);
                }
            });
        });
    }
    get metaHeaderRows() { return this.metaRowsStore.headers; }
    get metaFooterRows() { return this.metaRowsStore.footers; }
    get primary() { return this._primary; }
    get groupStore() { return this._groupStore; }
    getColumnsOf(row) {
        switch (row.rowType) {
            case 'data':
            case 'header':
            case 'footer':
                return this.visibleColumns;
            case 'meta-header':
            case 'meta-footer':
                return row._row.rowDef.cols;
        }
        return [];
    }
    columnRowChange() {
        return this._visibleChanged$;
    }
    metaRowChange() {
        return this.metaRowsStore.visibleChanged$.asObservable();
    }
    isColumnHidden(column) {
        return this.hiddenColumns.hidden.has(column.id);
    }
    clearColumnVisibility() {
        this.updateColumnVisibility(undefined, this.allColumns);
    }
    updateColumnVisibility(hide, show) {
        const didHide = hide && this.hiddenColumns.add(hide);
        const didShow = show && this.hiddenColumns.remove(show);
        if (didShow || didHide) {
            this.setHidden();
            if (didShow) {
                // TODO(shlomiassaf) [perf, 4]: Right now we attach all columns, we can improve it by attaching only those "added" (we know them from "changes")
                this.attachCustomCellTemplates();
                this.attachCustomHeaderCellTemplates();
            }
            this.checkVisibleChanges();
            // This is mostly required when we un-hide things (didShow === true)
            // However, when we hide, we only need it when the event comes from any are not in the view
            // i.e. areas outside of the grid or areas which are CONTENT of the grid
            this.grid.rowsApi.syncRows();
        }
    }
    addGroupBy(...columns) {
        if (this.hiddenColumns.add(columns, 'groupBy')) {
            this.setHidden();
            this.checkVisibleChanges();
        }
    }
    removeGroupBy(...columns) {
        if (this.hiddenColumns.remove(columns, 'groupBy')) {
            this.setHidden();
            this.checkVisibleChanges();
        }
    }
    /**
     * Move the provided `column` to the position of the `anchor` column.
     * The new location of the anchor column will be it's original location plus or minus 1, depending on the delta between
     * the columns. If the origin of the `column` is before the `anchor` then the anchor's new position is minus one, otherwise plus 1.
     */
    moveColumn(column, anchor) {
        const { visibleColumns, allColumns } = this;
        let anchorIndex = visibleColumns.indexOf(anchor);
        let columnIndex = visibleColumns.indexOf(column);
        if (anchorIndex > -1 && columnIndex > -1) {
            moveItemInArray(visibleColumns, columnIndex, anchorIndex);
            if (this.hiddenColumns.allHidden.size > 0) {
                anchorIndex = allColumns.indexOf(anchor);
                columnIndex = allColumns.indexOf(column);
            }
            moveItemInArray(allColumns, columnIndex, anchorIndex);
            this.checkVisibleChanges();
            return true;
        }
    }
    swapColumns(col1, col2) {
        let col1Index = this.visibleColumns.indexOf(col1);
        let col2Index = this.visibleColumns.indexOf(col2);
        if (col1Index > -1 && col2Index > -1) {
            const { visibleColumns, allColumns } = this;
            visibleColumns[col1Index] = col2;
            visibleColumns[col2Index] = col1;
            if (this.hiddenColumns.allHidden.size) {
                col1Index = allColumns.indexOf(col1);
                col2Index = allColumns.indexOf(col2);
            }
            allColumns[col1Index] = col2;
            allColumns[col2Index] = col1;
            this.checkVisibleChanges();
            return true;
        }
        return false;
    }
    find(id) {
        return this.byId.get(id);
    }
    getAllHeaderGroup() {
        return this._groupStore ? this._groupStore.all : [];
    }
    getStaticWidth() {
        const rowWidth = new StaticColumnWidthLogic();
        for (const column of this.visibleColumns) {
            rowWidth.addColumn(column);
        }
        return rowWidth;
    }
    invalidate(columnOrDefinitionSet) {
        const columnSet = this.lastSet = 'groupStore' in columnOrDefinitionSet
            ? columnOrDefinitionSet
            : PblColumnFactory.fromDefinitionSet(columnOrDefinitionSet).build();
        const { groupStore, table, header, footer, headerGroup } = columnSet;
        this._groupStore = groupStore.clone();
        const rowWidth = new StaticColumnWidthLogic();
        this.resetColumns();
        this.resetIds();
        this.headerColumnDef = {
            rowClassName: (table.header && table.header.rowClassName) || '',
            type: (table.header && table.header.type) || 'fixed',
        };
        this.footerColumnDef = {
            rowClassName: (table.footer && table.footer.rowClassName) || '',
            type: (table.footer && table.footer.type) || 'fixed',
        };
        this._primary = undefined;
        this.hiddenColumnIds = Array.from(this.hiddenColumns.hidden);
        const hidden = this.hiddenColumns.syncAllHidden().allHidden;
        for (const def of table.cols) {
            let column;
            column = new PblColumn(def, this.groupStore);
            const columnRecord = this.getColumnRecord(column.id);
            columnRecord.data = column;
            this.allColumns.push(column);
            this.columnIds.push(column.id);
            column.hidden = hidden.has(column.id);
            if (!column.hidden) {
                this.visibleColumns.push(column);
                this.visibleColumnIds.push(column.id);
                rowWidth.addColumn(column);
            }
            if (column.pIndex) {
                if (this._primary && isDevMode()) {
                    console.warn(`Multiple primary index columns defined: previous: "${this._primary.id}", current: "${column.id}"`);
                }
                this._primary = column;
            }
        }
        for (const rowDef of header) {
            // TODO: this is shady, if we add objects to reoDef type later they will be copied by ref, need proper class with clone() method
            const newRowDef = { ...rowDef };
            newRowDef.cols = [];
            const keys = [];
            for (const def of rowDef.cols) {
                const metaCol = this.getColumnRecord(def.id, this.metaColumns);
                const column = metaCol.header || (metaCol.header = new PblMetaColumn(def));
                keys.push(column.id);
                newRowDef.cols.push(column);
            }
            this.metaRowsStore.setHeader({ rowDef: newRowDef, keys, kind: 'header' });
        }
        for (const rowDef of headerGroup) {
            this._updateGroup(rowDef);
        }
        for (const rowDef of footer) {
            // TODO: this is shady, if we add objects to reoDef type later they will be copied by ref, need proper class with clone() method
            const newRowDef = { ...rowDef };
            newRowDef.cols = [];
            const keys = [];
            for (const def of rowDef.cols) {
                const metaCol = this.getColumnRecord(def.id, this.metaColumns);
                const column = metaCol.footer || (metaCol.footer = new PblMetaColumn(def));
                keys.push(column.id);
                newRowDef.cols.push(column);
            }
            this.metaRowsStore.setFooter({ rowDef: newRowDef, keys, kind: 'footer' });
        }
        resetColumnWidths(rowWidth, this.visibleColumns, this.metaColumns);
        this.differ = this.differs.find(this.visibleColumns).create((i, c) => c.id);
        this.differ.diff(this.visibleColumns);
    }
    updateGroups(...rowIndex) {
        if (rowIndex.length === 0) {
            for (const rowDef of this.lastSet.headerGroup) {
                this._updateGroup(rowDef);
            }
        }
        else {
            const rows = rowIndex.slice();
            for (const rowDef of this.lastSet.headerGroup) {
                const idx = rows.indexOf(rowDef.rowIndex);
                if (idx > -1) {
                    rows.splice(idx, 1);
                    this._updateGroup(rowDef);
                    if (rows.length === 0) {
                        return;
                    }
                }
            }
        }
    }
    attachCustomCellTemplates(columns) {
        const { registry } = this.grid;
        if (!columns) {
            columns = this.visibleColumns;
        }
        for (const col of this.visibleColumns) {
            const cell = findCellDef(registry, col, 'tableCell', true);
            if (cell) {
                col.cellTpl = cell.tRef;
            }
            else {
                const defaultCellTemplate = registry.getMultiDefault('tableCell');
                col.cellTpl = defaultCellTemplate ? defaultCellTemplate.tRef : this.grid._fbTableCell;
            }
            const editorCell = findCellDef(registry, col, 'editorCell', true);
            if (editorCell) {
                col.editorTpl = editorCell.tRef;
            }
            else {
                const defaultCellTemplate = registry.getMultiDefault('editorCell');
                col.editorTpl = defaultCellTemplate ? defaultCellTemplate.tRef : undefined;
            }
        }
    }
    attachCustomHeaderCellTemplates(columns) {
        const { registry } = this.grid;
        if (!columns) {
            columns = [].concat(this.visibleColumns, this.metaColumns);
        }
        const defaultHeaderCellTemplate = registry.getMultiDefault('headerCell') || { tRef: this.grid._fbHeaderCell };
        const defaultFooterCellTemplate = registry.getMultiDefault('footerCell') || { tRef: this.grid._fbFooterCell };
        for (const col of columns) {
            if (isPblColumn(col)) {
                const headerCellDef = findCellDef(registry, col, 'headerCell', true) || defaultHeaderCellTemplate;
                const footerCellDef = findCellDef(registry, col, 'footerCell', true) || defaultFooterCellTemplate;
                col.headerCellTpl = headerCellDef.tRef;
                col.footerCellTpl = footerCellDef.tRef;
            }
            else {
                if (col.header) {
                    const headerCellDef = findCellDef(registry, col.header, 'headerCell', true) || defaultHeaderCellTemplate;
                    col.header.template = headerCellDef.tRef;
                }
                if (col.headerGroup) {
                    const headerCellDef = findCellDef(registry, col.headerGroup, 'headerCell', true) || defaultHeaderCellTemplate;
                    col.headerGroup.template = headerCellDef.tRef;
                }
                if (col.footer) {
                    const footerCellDef = findCellDef(registry, col.footer, 'footerCell', true) || defaultFooterCellTemplate;
                    col.footer.template = footerCellDef.tRef;
                }
            }
        }
    }
    dispose() {
        this._visibleChanged$.complete();
        this.metaRowsStore.dispose();
    }
    _updateGroup(columnSet) {
        const keys = [];
        const allKeys = [];
        const groups = [];
        for (let tIndex = 0; tIndex < this.visibleColumns.length; tIndex++) {
            const columns = [this.visibleColumns[tIndex - 1], this.visibleColumns[tIndex], this.visibleColumns[tIndex + 1]];
            const columnGroups = columns.map(c => c ? c.getGroupOfRow(columnSet.rowIndex) : undefined);
            // true when the group exists in one of the columns BUT NOT in the LAST COLUMN (i.e: Its a slave split)
            const groupExists = groups.lastIndexOf(columnGroups[1]) !== -1;
            const column = columns[1];
            const gColumn = column.groupLogic(columnGroups, groupExists);
            if (gColumn !== columnGroups[1]) {
                column.markNotInGroup(columnGroups[1]);
                column.markInGroup(gColumn);
            }
            const metaCol = this.getColumnRecord(gColumn.id, this.metaColumns);
            if (!metaCol.headerGroup) {
                metaCol.headerGroup = gColumn;
            }
            if (groups.lastIndexOf(gColumn) === -1) {
                allKeys.push(gColumn.id);
                if (gColumn.isVisible) {
                    keys.push(gColumn.id);
                }
            }
            gColumn.replace(column);
            groups.push(gColumn);
        }
        for (const ghost of this._groupStore.findGhosts()) {
            if (ghost.rowIndex === columnSet.rowIndex) {
                const { id } = ghost;
                let idx = allKeys.indexOf(id);
                if (idx !== -1) {
                    allKeys.splice(idx, 1);
                    idx = keys.indexOf(id);
                    if (idx !== -1) {
                        keys.splice(idx, 1);
                    }
                    this.metaColumns.splice(this.metaColumns.findIndex(m => m.id === id), 1);
                }
                this._groupStore.remove(ghost);
            }
        }
        this.metaRowsStore.updateHeader({ rowDef: columnSet, keys, allKeys, isGroup: true, kind: 'header' });
    }
    getColumnRecord(id, collection) {
        let columnRecord = this.byId.get(id);
        if (!columnRecord) {
            this.byId.set(id, columnRecord = { id });
            if (collection) {
                collection.push(columnRecord);
            }
        }
        return columnRecord;
    }
    setHidden() {
        const hidden = this.hiddenColumns.syncAllHidden().allHidden;
        this.visibleColumns = [];
        for (const c of this.allColumns) {
            c.hidden = hidden.has(c.id);
            if (!c.hidden) {
                this.visibleColumns.push(c);
            }
        }
        for (const h of this.metaRowsStore.headers) {
            if (h.isGroup) {
                h.keys = h.allKeys.filter(key => this.find(key).headerGroup.isVisible);
            }
        }
        resetColumnWidths(this.getStaticWidth(), this.visibleColumns, this.metaColumns);
    }
    resetColumns() {
        this.allColumns = [];
        this.visibleColumns = [];
        this.metaColumns = [];
        this.byId.clear();
    }
    resetIds() {
        this.columnIds = [];
        this.visibleColumnIds = [];
        this.hiddenColumnIds = [];
        this.metaRowsStore.clear();
    }
    checkVisibleChanges() {
        if (this.differ) {
            if (!this.columnUpdateInProgress) {
                this.columnUpdateInProgress = true;
                Promise.resolve()
                    .then(() => {
                    this.columnUpdateInProgress = false;
                    const changes = this.differ.diff(this.visibleColumns);
                    if (changes) {
                        this.hiddenColumnIds = Array.from(this.hiddenColumns.hidden);
                        this.visibleColumnIds = Array.from(this.visibleColumns).map(c => c.id);
                        this.columnIds = Array.from(this.allColumns).map(c => c.id);
                        this._visibleChanged$.next({ columns: this.visibleColumns, changes });
                        this.afterColumnPositionChange();
                    }
                });
            }
        }
        // no differ means we did not invalidate yet, so nothing will change until it start showing
    }
    afterColumnPositionChange() {
        // TODO: This shouldn't be here, it should be the responsibility of the caller to clear the context
        // Because now there is not option to control it.
        this.extApi.contextApi.clear(true);
        this.updateGroups();
        this.extApi.widthCalc.resetColumnsWidth();
        // now, any newly added column cells must first spin up to get a size
        // and most importantly have their ngAfterViewInit fired so the resize column will update the sizeInfo of the column!
        this.extApi.rowsApi.syncRows('header', true);
        this.extApi.widthCalc.calcColumnWidth();
    }
}
/**
 * Moves an item one index in an array to another.
 * @param array Array in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which the item should be moved.
 */
export function moveItemInArray(array, fromIndex, toIndex) {
    const from = clamp(fromIndex, array.length - 1);
    const to = clamp(toIndex, array.length - 1);
    if (from === to) {
        return;
    }
    const target = array[from];
    const delta = to < from ? -1 : 1;
    for (let i = from; i !== to; i += delta) {
        array[i] = array[i + delta];
    }
    array[to] = target;
}
export function moveItemInArrayExt(array, fromIndex, toIndex, fn) {
    const from = clamp(fromIndex, array.length - 1);
    const to = clamp(toIndex, array.length - 1);
    if (from === to) {
        return;
    }
    const target = array[from];
    const delta = to < from ? -1 : 1;
    for (let i = from; i !== to; i += delta) {
        const next = i + delta;
        fn(array[i], array[next], i, next);
        array[i] = array[next];
    }
    fn(array[to], target, to, from);
    array[to] = target;
}
/** Clamps a number between zero and a maximum. */
function clamp(value, max) {
    return Math.max(0, Math.min(max, value));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY29sdW1uL21hbmFnZW1lbnQvY29sdW1uLXN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBbUMsTUFBTSxlQUFlLENBQUM7QUFLM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFDTCxnQkFBZ0IsRUFFaEIsV0FBVyxFQUFFLFNBQVMsRUFBRSxhQUFhLEdBRXRDLE1BQU0sVUFBVSxDQUFDO0FBR2xCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXRELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbEQsTUFBTSxPQUFPLGNBQWM7SUF5QnpCLFlBQTZCLE1BQW9DLEVBQW1CLE9BQXdCO1FBQS9FLFdBQU0sR0FBTixNQUFNLENBQThCO1FBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBVHBHLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBcUQsQ0FBQztRQUdwRSxrQkFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7UUFFcEMscUJBQWdCLEdBQUcsSUFBSSxPQUFPLEVBQXVDLENBQUM7UUFLNUUsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFD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QUFHLFNBQVMsQ0FBQztRQUVyRSxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUV0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsZUFBZSxHQUFHO1lBQ3JCLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO1lBQy9ELElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPO1NBQ3JELENBQUE7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHO1lBQ3JCLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO1lBQy9ELElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPO1NBQ3JELENBQUE7UUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztRQUUxQixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUU1RCxLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxNQUFpQixDQUFDO1lBQ3RCLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELFlBQVksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUvQixNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNsQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUI7WUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUUsRUFBRTtvQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxzREFBc0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGdCQUFnQixNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDbEg7Z0JBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7YUFDeEI7U0FDRjtRQUVELEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxFQUFFO1lBQzNCLGdJQUFnSTtZQUNoSSxNQUFNLFNBQVMsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7WUFDaEMsU0FBUyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDcEIsTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO1lBQzFCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUMzRTtRQUVELEtBQUssTUFBTSxNQUFNLElBQUksV0FBVyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sRUFBRTtZQUMzQixnSUFBZ0k7WUFDaEksTUFBTSxTQUFTLEdBQUcsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sSUFBSSxHQUFhLEVBQUUsQ0FBQztZQUMxQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3QjtZQUNELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDM0U7UUFDRCxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsWUFBWSxDQUFDLEdBQUcsUUFBa0I7UUFDaEMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNCO1NBQ0Y7YUFBTTtZQUNMLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUM3QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3JCLE9BQU87cUJBQ1I7aUJBQ0Y7YUFDRjtTQUNGO0lBQ0gsQ0FBQztJQUVELHlCQUF5QixDQUFDLE9BQXFCO1FBQzdDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztTQUMvQjtRQUVELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0QsSUFBSyxJQUFJLEVBQUc7Z0JBQ1YsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNMLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbEUsR0FBRyxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQzthQUN2RjtZQUVELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRSxJQUFLLFVBQVUsRUFBRztnQkFDaEIsR0FBRyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNMLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbkUsR0FBRyxDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDNUU7U0FDRjtJQUNILENBQUM7SUFFRCwrQkFBK0IsQ0FBQyxPQUErQztRQUM3RSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUUvQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5RyxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5RyxLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRTtZQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLHlCQUF5QixDQUFDO2dCQUNsRyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUkseUJBQXlCLENBQUM7Z0JBQ2xHLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztnQkFDdkMsR0FBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNMLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtvQkFDZCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLHlCQUF5QixDQUFDO29CQUN6RyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUMxQztnQkFDRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7b0JBQ25CLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUkseUJBQXlCLENBQUM7b0JBQzlHLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQy9DO2dCQUNELElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtvQkFDZCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLHlCQUF5QixDQUFDO29CQUN6RyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUMxQzthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTyxZQUFZLENBQUMsU0FBdUM7UUFDMUQsTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO1FBQzFCLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUU3QixNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO1FBRXBDLEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNsRSxNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoSCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFFLENBQUM7WUFDN0YsdUdBQXVHO1lBQ3ZHLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFL0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBbUIsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNwRSxJQUFJLE9BQU8sS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUN4QixPQUFPLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtvQkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Y7WUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdEI7UUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDakQsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pDLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNkLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN2QixHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdkIsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ3JCO29CQUNELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDM0U7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEM7U0FDRjtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUVPLGVBQWUsQ0FBc0QsRUFBVSxFQUFFLFVBQWdCO1FBQ3ZHLElBQUksWUFBWSxHQUE4QyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFZLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLElBQUksVUFBVSxFQUFFO2dCQUNkLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBaUIsQ0FBQyxDQUFDO2FBQ3BDO1NBQ0Y7UUFDRCxPQUFPLFlBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUVPLFNBQVM7UUFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUM1RCxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6QixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDL0IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM3QjtTQUNGO1FBQ0QsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUMxQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBRSxDQUFDO2FBQzFFO1NBQ0Y7UUFDRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVPLFlBQVk7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU8sUUFBUTtRQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBR08sbUJBQW1CO1FBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxPQUFPLEVBQUU7cUJBQ2QsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDVCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO29CQUNwQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3RELElBQUksT0FBTyxFQUFFO3dCQUNYLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUM3RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO3dCQUN6RSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQzt3QkFDOUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQ3RFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO3FCQUNsQztnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNOO1NBQ0Y7UUFDRCwyRkFBMkY7SUFDN0YsQ0FBQztJQUVPLHlCQUF5QjtRQUMvQixtR0FBbUc7UUFDbkcsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQyxxRUFBcUU7UUFDckUscUhBQXFIO1FBQ3JILElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFVLEtBQVUsRUFBRSxTQUFpQixFQUFFLE9BQWU7SUFDckYsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUU1QyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7UUFDZixPQUFPO0tBQ1I7SUFFRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsTUFBTSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUU7UUFDdkMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDN0I7SUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQVUsS0FBVSxFQUNWLFNBQWlCLEVBQ2pCLE9BQWUsRUFDZixFQUEwRjtJQUNwSSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEQsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTVDLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtRQUNmLE9BQU87S0FDUjtJQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixNQUFNLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWpDLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUN2QyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDckIsQ0FBQztBQUdELGtEQUFrRDtBQUNsRCxTQUFTLEtBQUssQ0FBQyxLQUFhLEVBQUUsR0FBVztJQUN2QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGlzRGV2TW9kZSwgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EZWZpbml0aW9uU2V0LCBQYmxDb2x1bW5TZXQsIFBibE1ldGFSb3dEZWZpbml0aW9ucyB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBmaW5kQ2VsbERlZiB9IGZyb20gJy4uLy4uL2NlbGwvY2VsbC1kZWYvdXRpbHMnO1xuaW1wb3J0IHtcbiAgUGJsQ29sdW1uRmFjdG9yeSxcbiAgUGJsQ29sdW1uR3JvdXAsIFBibENvbHVtbkdyb3VwU3RvcmUsXG4gIGlzUGJsQ29sdW1uLCBQYmxDb2x1bW4sIFBibE1ldGFDb2x1bW4sXG4gIFBibE5ncmlkQ29sdW1uU2V0LFxufSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgeyBHcmlkUm93VHlwZSB9IGZyb20gJy4uLy4uL3Jvdy90eXBlcyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VSb3dDb21wb25lbnQgfSBmcm9tICcuLi8uLi9yb3cvYmFzZS1yb3cuY29tcG9uZW50JztcbmltcG9ydCB7IFN0YXRpY0NvbHVtbldpZHRoTG9naWMgfSBmcm9tICcuLi93aWR0aC1sb2dpYy9zdGF0aWMtY29sdW1uLXdpZHRoJztcbmltcG9ydCB7IHJlc2V0Q29sdW1uV2lkdGhzIH0gZnJvbSAnLi4vLi4vdXRpbHMvd2lkdGgnO1xuaW1wb3J0IHsgUGJsTWV0YUNvbHVtblN0b3JlLCBQYmxSb3dDb2x1bW5zQ2hhbmdlRXZlbnQsIFBibFJvd1R5cGVUb0NvbHVtblR5cGVNYXAgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IEhpZGRlbkNvbHVtbnMgfSBmcm9tICcuL2hpZGRlbi1jb2x1bW5zJztcbmltcG9ydCB7IE1ldGFSb3dzU3RvcmUgfSBmcm9tICcuL21ldGEtcm93cy1zdG9yZSc7XG5cbmV4cG9ydCBjbGFzcyBQYmxDb2x1bW5TdG9yZSB7XG4gIG1ldGFDb2x1bW5zOiBQYmxNZXRhQ29sdW1uU3RvcmVbXTtcbiAgZ2V0IG1ldGFIZWFkZXJSb3dzKCkgeyByZXR1cm4gdGhpcy5tZXRhUm93c1N0b3JlLmhlYWRlcnM7IH1cbiAgZ2V0IG1ldGFGb290ZXJSb3dzKCkgeyByZXR1cm4gdGhpcy5tZXRhUm93c1N0b3JlLmZvb3RlcnM7IH1cbiAgY29sdW1uSWRzOiBzdHJpbmdbXTtcbiAgdmlzaWJsZUNvbHVtbklkczogc3RyaW5nW107XG4gIGhpZGRlbkNvbHVtbklkczogc3RyaW5nW107XG4gIHZpc2libGVDb2x1bW5zOiBQYmxDb2x1bW5bXTtcbiAgYWxsQ29sdW1uczogUGJsQ29sdW1uW107XG4gIGhlYWRlckNvbHVtbkRlZjogUGJsTWV0YVJvd0RlZmluaXRpb25zO1xuICBmb290ZXJDb2x1bW5EZWY6IFBibE1ldGFSb3dEZWZpbml0aW9ucztcblxuICBnZXQgcHJpbWFyeSgpOiBQYmxDb2x1bW4gfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fcHJpbWFyeTsgfVxuICBnZXQgZ3JvdXBTdG9yZSgpOiBQYmxDb2x1bW5Hcm91cFN0b3JlIHsgcmV0dXJuIHRoaXMuX2dyb3VwU3RvcmU7IH1cblxuICBwcml2YXRlIF9wcmltYXJ5OiBQYmxDb2x1bW4gfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgYnlJZCA9IG5ldyBNYXA8c3RyaW5nLCBQYmxNZXRhQ29sdW1uU3RvcmUgJiB7IGRhdGE/OiBQYmxDb2x1bW4gfT4oKTtcbiAgcHJpdmF0ZSBfZ3JvdXBTdG9yZTogUGJsQ29sdW1uR3JvdXBTdG9yZTtcbiAgcHJpdmF0ZSBsYXN0U2V0OiBQYmxOZ3JpZENvbHVtblNldDtcbiAgcHJpdmF0ZSBoaWRkZW5Db2x1bW5zID0gbmV3IEhpZGRlbkNvbHVtbnMoKTtcbiAgcHJpdmF0ZSBkaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFBibENvbHVtbj47XG4gIHByaXZhdGUgX3Zpc2libGVDaGFuZ2VkJCA9IG5ldyBTdWJqZWN0PFBibFJvd0NvbHVtbnNDaGFuZ2VFdmVudDxQYmxDb2x1bW4+PigpO1xuICBwcml2YXRlIG1ldGFSb3dzU3RvcmU6IE1ldGFSb3dzU3RvcmU7XG4gIHByaXZhdGUgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpLCBwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycykge1xuICAgIHRoaXMuZ3JpZCA9IGV4dEFwaS5ncmlkO1xuICAgIHRoaXMubWV0YVJvd3NTdG9yZSA9IG5ldyBNZXRhUm93c1N0b3JlKGRpZmZlcnMpO1xuICAgIHRoaXMucmVzZXRJZHMoKTtcbiAgICB0aGlzLnJlc2V0Q29sdW1ucygpO1xuXG4gICAgdGhpcy5tZXRhUm93c1N0b3JlLnZpc2libGVDaGFuZ2VkJFxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LmNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigocmVjb3JkLCBwcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IHRoaXMuZmluZChyZWNvcmQuaXRlbSk7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBldmVudC5tZXRhUm93LmtpbmQgPT09ICdoZWFkZXInID9cbiAgICAgICAgICAgICAgZXZlbnQubWV0YVJvdy5pc0dyb3VwID8gY29sdW1ucy5oZWFkZXJHcm91cCA6IGNvbHVtbnMuaGVhZGVyXG4gICAgICAgICAgICAgIDogZXZlbnQubWV0YVJvdy5pc0dyb3VwID8gY29sdW1ucy5mb290ZXJHcm91cCA6IGNvbHVtbnMuZm9vdGVyO1xuICAgICAgICAgICAgZXZlbnQubWV0YVJvdy5yb3dEZWYuY29scy5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBjb2wpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50Lm1ldGFSb3cucm93RGVmLmNvbHMuc3BsaWNlKHByZXZpb3VzSW5kZXgsIDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb3ZlSXRlbUluQXJyYXkoZXZlbnQubWV0YVJvdy5yb3dEZWYuY29scywgcHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBnZXRDb2x1bW5zT2Y8VFJvd1R5cGUgZXh0ZW5kcyBHcmlkUm93VHlwZT4ocm93OiBQYmxOZ3JpZEJhc2VSb3dDb21wb25lbnQ8VFJvd1R5cGU+KTogUGJsUm93VHlwZVRvQ29sdW1uVHlwZU1hcDxUUm93VHlwZT5bXSB7XG4gICAgc3dpdGNoIChyb3cucm93VHlwZSkge1xuICAgICAgY2FzZSAnZGF0YSc6XG4gICAgICBjYXNlICdoZWFkZXInOlxuICAgICAgY2FzZSAnZm9vdGVyJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNvbHVtbnMgYXMgYW55O1xuICAgICAgY2FzZSAnbWV0YS1oZWFkZXInOlxuICAgICAgY2FzZSAnbWV0YS1mb290ZXInOlxuICAgICAgICByZXR1cm4gKHJvdyBhcyBhbnkpLl9yb3cucm93RGVmLmNvbHM7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbHVtblJvd0NoYW5nZSgpOiBPYnNlcnZhYmxlPFBibFJvd0NvbHVtbnNDaGFuZ2VFdmVudDxQYmxSb3dUeXBlVG9Db2x1bW5UeXBlTWFwPCdkYXRhJz4+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2libGVDaGFuZ2VkJCBhcyBhbnk7XG4gIH1cblxuICBtZXRhUm93Q2hhbmdlKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGFSb3dzU3RvcmUudmlzaWJsZUNoYW5nZWQkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgaXNDb2x1bW5IaWRkZW4oY29sdW1uOiBQYmxDb2x1bW4pIHtcbiAgICByZXR1cm4gdGhpcy5oaWRkZW5Db2x1bW5zLmhpZGRlbi5oYXMoY29sdW1uLmlkKTtcbiAgfVxuXG4gIGNsZWFyQ29sdW1uVmlzaWJpbGl0eSgpIHtcbiAgICB0aGlzLnVwZGF0ZUNvbHVtblZpc2liaWxpdHkodW5kZWZpbmVkLCB0aGlzLmFsbENvbHVtbnMpO1xuICB9XG5cbiAgdXBkYXRlQ29sdW1uVmlzaWJpbGl0eShoaWRlPzogUGJsQ29sdW1uW10gfCBzdHJpbmdbXSwgc2hvdz86IFBibENvbHVtbltdIHwgc3RyaW5nW10pIHtcbiAgICBjb25zdCBkaWRIaWRlID0gaGlkZSAmJiB0aGlzLmhpZGRlbkNvbHVtbnMuYWRkKGhpZGUpO1xuICAgIGNvbnN0IGRpZFNob3cgPSBzaG93ICYmIHRoaXMuaGlkZGVuQ29sdW1ucy5yZW1vdmUoc2hvdyk7XG4gICAgaWYgKGRpZFNob3cgfHwgZGlkSGlkZSkge1xuICAgICAgdGhpcy5zZXRIaWRkZW4oKTtcbiAgICAgIGlmIChkaWRTaG93KSB7XG4gICAgICAgIC8vIFRPRE8oc2hsb21pYXNzYWYpIFtwZXJmLCA0XTogUmlnaHQgbm93IHdlIGF0dGFjaCBhbGwgY29sdW1ucywgd2UgY2FuIGltcHJvdmUgaXQgYnkgYXR0YWNoaW5nIG9ubHkgdGhvc2UgXCJhZGRlZFwiICh3ZSBrbm93IHRoZW0gZnJvbSBcImNoYW5nZXNcIilcbiAgICAgICAgdGhpcy5hdHRhY2hDdXN0b21DZWxsVGVtcGxhdGVzKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoQ3VzdG9tSGVhZGVyQ2VsbFRlbXBsYXRlcygpO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGVja1Zpc2libGVDaGFuZ2VzKCk7XG4gICAgICAvLyBUaGlzIGlzIG1vc3RseSByZXF1aXJlZCB3aGVuIHdlIHVuLWhpZGUgdGhpbmdzIChkaWRTaG93ID09PSB0cnVlKVxuICAgICAgLy8gSG93ZXZlciwgd2hlbiB3ZSBoaWRlLCB3ZSBvbmx5IG5lZWQgaXQgd2hlbiB0aGUgZXZlbnQgY29tZXMgZnJvbSBhbnkgYXJlIG5vdCBpbiB0aGUgdmlld1xuICAgICAgLy8gaS5lLiBhcmVhcyBvdXRzaWRlIG9mIHRoZSBncmlkIG9yIGFyZWFzIHdoaWNoIGFyZSBDT05URU5UIG9mIHRoZSBncmlkXG4gICAgICB0aGlzLmdyaWQucm93c0FwaS5zeW5jUm93cygpO1xuICAgIH1cbiAgfVxuXG4gIGFkZEdyb3VwQnkoLi4uY29sdW1uczogUGJsQ29sdW1uW10gfCBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhpZGRlbkNvbHVtbnMuYWRkKGNvbHVtbnMsICdncm91cEJ5JykpIHtcbiAgICAgIHRoaXMuc2V0SGlkZGVuKCk7XG4gICAgICB0aGlzLmNoZWNrVmlzaWJsZUNoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVHcm91cEJ5KC4uLmNvbHVtbnM6IFBibENvbHVtbltdIHwgc3RyaW5nW10pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oaWRkZW5Db2x1bW5zLnJlbW92ZShjb2x1bW5zLCAnZ3JvdXBCeScpKSB7XG4gICAgICB0aGlzLnNldEhpZGRlbigpO1xuICAgICAgdGhpcy5jaGVja1Zpc2libGVDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHByb3ZpZGVkIGBjb2x1bW5gIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgYGFuY2hvcmAgY29sdW1uLlxuICAgKiBUaGUgbmV3IGxvY2F0aW9uIG9mIHRoZSBhbmNob3IgY29sdW1uIHdpbGwgYmUgaXQncyBvcmlnaW5hbCBsb2NhdGlvbiBwbHVzIG9yIG1pbnVzIDEsIGRlcGVuZGluZyBvbiB0aGUgZGVsdGEgYmV0d2VlblxuICAgKiB0aGUgY29sdW1ucy4gSWYgdGhlIG9yaWdpbiBvZiB0aGUgYGNvbHVtbmAgaXMgYmVmb3JlIHRoZSBgYW5jaG9yYCB0aGVuIHRoZSBhbmNob3IncyBuZXcgcG9zaXRpb24gaXMgbWludXMgb25lLCBvdGhlcndpc2UgcGx1cyAxLlxuICAgKi9cbiAgbW92ZUNvbHVtbihjb2x1bW46IFBibENvbHVtbiwgYW5jaG9yOiBQYmxDb2x1bW4pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHZpc2libGVDb2x1bW5zLCBhbGxDb2x1bW5zIH0gPSB0aGlzO1xuICAgIGxldCBhbmNob3JJbmRleCA9IHZpc2libGVDb2x1bW5zLmluZGV4T2YoYW5jaG9yKTtcbiAgICBsZXQgY29sdW1uSW5kZXggPSB2aXNpYmxlQ29sdW1ucy5pbmRleE9mKGNvbHVtbik7XG4gICAgaWYgKGFuY2hvckluZGV4ID4gLTEgJiYgY29sdW1uSW5kZXggPiAtMSkge1xuICAgICAgbW92ZUl0ZW1JbkFycmF5KHZpc2libGVDb2x1bW5zLCBjb2x1bW5JbmRleCwgYW5jaG9ySW5kZXgpO1xuICAgICAgaWYgKHRoaXMuaGlkZGVuQ29sdW1ucy5hbGxIaWRkZW4uc2l6ZSA+IDApIHtcbiAgICAgICAgYW5jaG9ySW5kZXggPSBhbGxDb2x1bW5zLmluZGV4T2YoYW5jaG9yKTtcbiAgICAgICAgY29sdW1uSW5kZXggPSBhbGxDb2x1bW5zLmluZGV4T2YoY29sdW1uKTtcbiAgICAgIH1cbiAgICAgIG1vdmVJdGVtSW5BcnJheShhbGxDb2x1bW5zLCBjb2x1bW5JbmRleCwgYW5jaG9ySW5kZXgpO1xuICAgICAgdGhpcy5jaGVja1Zpc2libGVDaGFuZ2VzKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzd2FwQ29sdW1ucyhjb2wxOiBQYmxDb2x1bW4sIGNvbDI6IFBibENvbHVtbik6IGJvb2xlYW4ge1xuICAgIGxldCBjb2wxSW5kZXggPSB0aGlzLnZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sMSk7XG4gICAgbGV0IGNvbDJJbmRleCA9IHRoaXMudmlzaWJsZUNvbHVtbnMuaW5kZXhPZihjb2wyKTtcbiAgICBpZiAoY29sMUluZGV4ID4gLTEgJiYgY29sMkluZGV4ID4gLTEpIHtcbiAgICAgIGNvbnN0IHsgdmlzaWJsZUNvbHVtbnMsIGFsbENvbHVtbnMgfSA9IHRoaXM7XG4gICAgICB2aXNpYmxlQ29sdW1uc1tjb2wxSW5kZXhdID0gY29sMjtcbiAgICAgIHZpc2libGVDb2x1bW5zW2NvbDJJbmRleF0gPSBjb2wxO1xuXG4gICAgICBpZiAodGhpcy5oaWRkZW5Db2x1bW5zLmFsbEhpZGRlbi5zaXplKSB7XG4gICAgICAgIGNvbDFJbmRleCA9IGFsbENvbHVtbnMuaW5kZXhPZihjb2wxKTtcbiAgICAgICAgY29sMkluZGV4ID0gYWxsQ29sdW1ucy5pbmRleE9mKGNvbDIpO1xuICAgICAgfVxuICAgICAgYWxsQ29sdW1uc1tjb2wxSW5kZXhdID0gY29sMjtcbiAgICAgIGFsbENvbHVtbnNbY29sMkluZGV4XSA9IGNvbDE7XG4gICAgICB0aGlzLmNoZWNrVmlzaWJsZUNoYW5nZXMoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBQYmxNZXRhQ29sdW1uU3RvcmUgJiB7IGRhdGE/OiBQYmxDb2x1bW4gfSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuYnlJZC5nZXQoaWQpO1xuICB9XG5cbiAgZ2V0QWxsSGVhZGVyR3JvdXAoKTogUGJsQ29sdW1uR3JvdXBbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2dyb3VwU3RvcmUgPyB0aGlzLl9ncm91cFN0b3JlLmFsbCA6IFtdO1xuICB9XG5cbiAgZ2V0U3RhdGljV2lkdGgoKTogU3RhdGljQ29sdW1uV2lkdGhMb2dpYyB7XG4gICAgY29uc3Qgcm93V2lkdGggPSBuZXcgU3RhdGljQ29sdW1uV2lkdGhMb2dpYygpO1xuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHRoaXMudmlzaWJsZUNvbHVtbnMpIHtcbiAgICAgIHJvd1dpZHRoLmFkZENvbHVtbihjb2x1bW4pO1xuICAgIH1cbiAgICByZXR1cm4gcm93V2lkdGg7XG4gIH1cblxuICBpbnZhbGlkYXRlKGNvbHVtbk9yRGVmaW5pdGlvblNldDogUGJsTmdyaWRDb2x1bW5EZWZpbml0aW9uU2V0IHwgUGJsTmdyaWRDb2x1bW5TZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjb2x1bW5TZXQ6IFBibE5ncmlkQ29sdW1uU2V0ID0gdGhpcy5sYXN0U2V0ID0gJ2dyb3VwU3RvcmUnIGluIGNvbHVtbk9yRGVmaW5pdGlvblNldFxuICAgICAgPyBjb2x1bW5PckRlZmluaXRpb25TZXRcbiAgICAgIDogUGJsQ29sdW1uRmFjdG9yeS5mcm9tRGVmaW5pdGlvblNldChjb2x1bW5PckRlZmluaXRpb25TZXQpLmJ1aWxkKClcbiAgICA7XG4gICAgY29uc3QgeyBncm91cFN0b3JlLCB0YWJsZSwgaGVhZGVyLCBmb290ZXIsIGhlYWRlckdyb3VwIH0gPSBjb2x1bW5TZXQ7XG5cbiAgICB0aGlzLl9ncm91cFN0b3JlID0gZ3JvdXBTdG9yZS5jbG9uZSgpO1xuXG4gICAgY29uc3Qgcm93V2lkdGggPSBuZXcgU3RhdGljQ29sdW1uV2lkdGhMb2dpYygpO1xuICAgIHRoaXMucmVzZXRDb2x1bW5zKCk7XG4gICAgdGhpcy5yZXNldElkcygpO1xuXG4gICAgdGhpcy5oZWFkZXJDb2x1bW5EZWYgPSB7XG4gICAgICByb3dDbGFzc05hbWU6ICh0YWJsZS5oZWFkZXIgJiYgdGFibGUuaGVhZGVyLnJvd0NsYXNzTmFtZSkgfHwgJycsXG4gICAgICB0eXBlOiAodGFibGUuaGVhZGVyICYmIHRhYmxlLmhlYWRlci50eXBlKSB8fCAnZml4ZWQnLFxuICAgIH1cbiAgICB0aGlzLmZvb3RlckNvbHVtbkRlZiA9IHtcbiAgICAgIHJvd0NsYXNzTmFtZTogKHRhYmxlLmZvb3RlciAmJiB0YWJsZS5mb290ZXIucm93Q2xhc3NOYW1lKSB8fCAnJyxcbiAgICAgIHR5cGU6ICh0YWJsZS5mb290ZXIgJiYgdGFibGUuZm9vdGVyLnR5cGUpIHx8ICdmaXhlZCcsXG4gICAgfVxuXG4gICAgdGhpcy5fcHJpbWFyeSA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuaGlkZGVuQ29sdW1uSWRzID0gQXJyYXkuZnJvbSh0aGlzLmhpZGRlbkNvbHVtbnMuaGlkZGVuKTtcbiAgICBjb25zdCBoaWRkZW4gPSB0aGlzLmhpZGRlbkNvbHVtbnMuc3luY0FsbEhpZGRlbigpLmFsbEhpZGRlbjtcblxuICAgIGZvciAoY29uc3QgZGVmIG9mIHRhYmxlLmNvbHMpIHtcbiAgICAgIGxldCBjb2x1bW46IFBibENvbHVtbjtcbiAgICAgIGNvbHVtbiA9IG5ldyBQYmxDb2x1bW4oZGVmLCB0aGlzLmdyb3VwU3RvcmUpO1xuICAgICAgY29uc3QgY29sdW1uUmVjb3JkID0gdGhpcy5nZXRDb2x1bW5SZWNvcmQoY29sdW1uLmlkKTtcbiAgICAgIGNvbHVtblJlY29yZC5kYXRhID0gY29sdW1uO1xuICAgICAgdGhpcy5hbGxDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICAgIHRoaXMuY29sdW1uSWRzLnB1c2goY29sdW1uLmlkKTtcblxuICAgICAgY29sdW1uLmhpZGRlbiA9IGhpZGRlbi5oYXMoY29sdW1uLmlkKTtcbiAgICAgIGlmICghY29sdW1uLmhpZGRlbikge1xuICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1uSWRzLnB1c2goY29sdW1uLmlkKTtcbiAgICAgICAgcm93V2lkdGguYWRkQ29sdW1uKGNvbHVtbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb2x1bW4ucEluZGV4KSB7XG4gICAgICAgIGlmICh0aGlzLl9wcmltYXJ5ICYmIGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBNdWx0aXBsZSBwcmltYXJ5IGluZGV4IGNvbHVtbnMgZGVmaW5lZDogcHJldmlvdXM6IFwiJHt0aGlzLl9wcmltYXJ5LmlkfVwiLCBjdXJyZW50OiBcIiR7Y29sdW1uLmlkfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHJpbWFyeSA9IGNvbHVtbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHJvd0RlZiBvZiBoZWFkZXIpIHtcbiAgICAgIC8vIFRPRE86IHRoaXMgaXMgc2hhZHksIGlmIHdlIGFkZCBvYmplY3RzIHRvIHJlb0RlZiB0eXBlIGxhdGVyIHRoZXkgd2lsbCBiZSBjb3BpZWQgYnkgcmVmLCBuZWVkIHByb3BlciBjbGFzcyB3aXRoIGNsb25lKCkgbWV0aG9kXG4gICAgICBjb25zdCBuZXdSb3dEZWYgPSB7IC4uLnJvd0RlZiB9O1xuICAgICAgbmV3Um93RGVmLmNvbHMgPSBbXTtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgICBmb3IgKGNvbnN0IGRlZiBvZiByb3dEZWYuY29scykge1xuICAgICAgICBjb25zdCBtZXRhQ29sID0gdGhpcy5nZXRDb2x1bW5SZWNvcmQoZGVmLmlkLCB0aGlzLm1ldGFDb2x1bW5zKTtcbiAgICAgICAgY29uc3QgY29sdW1uID0gbWV0YUNvbC5oZWFkZXIgfHwgKG1ldGFDb2wuaGVhZGVyID0gbmV3IFBibE1ldGFDb2x1bW4oZGVmKSk7XG4gICAgICAgIGtleXMucHVzaChjb2x1bW4uaWQpO1xuICAgICAgICBuZXdSb3dEZWYuY29scy5wdXNoKGNvbHVtbik7XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGFSb3dzU3RvcmUuc2V0SGVhZGVyKHsgcm93RGVmOiBuZXdSb3dEZWYsIGtleXMsIGtpbmQ6ICdoZWFkZXInIH0pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgcm93RGVmIG9mIGhlYWRlckdyb3VwKSB7XG4gICAgICB0aGlzLl91cGRhdGVHcm91cChyb3dEZWYpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgcm93RGVmIG9mIGZvb3Rlcikge1xuICAgICAgLy8gVE9ETzogdGhpcyBpcyBzaGFkeSwgaWYgd2UgYWRkIG9iamVjdHMgdG8gcmVvRGVmIHR5cGUgbGF0ZXIgdGhleSB3aWxsIGJlIGNvcGllZCBieSByZWYsIG5lZWQgcHJvcGVyIGNsYXNzIHdpdGggY2xvbmUoKSBtZXRob2RcbiAgICAgIGNvbnN0IG5ld1Jvd0RlZiA9IHsgLi4ucm93RGVmIH07XG4gICAgICBuZXdSb3dEZWYuY29scyA9IFtdO1xuICAgICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZGVmIG9mIHJvd0RlZi5jb2xzKSB7XG4gICAgICAgIGNvbnN0IG1ldGFDb2wgPSB0aGlzLmdldENvbHVtblJlY29yZChkZWYuaWQsIHRoaXMubWV0YUNvbHVtbnMpO1xuICAgICAgICBjb25zdCBjb2x1bW4gPSBtZXRhQ29sLmZvb3RlciB8fCAobWV0YUNvbC5mb290ZXIgPSBuZXcgUGJsTWV0YUNvbHVtbihkZWYpKTtcbiAgICAgICAga2V5cy5wdXNoKGNvbHVtbi5pZCk7XG4gICAgICAgIG5ld1Jvd0RlZi5jb2xzLnB1c2goY29sdW1uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0YVJvd3NTdG9yZS5zZXRGb290ZXIoeyByb3dEZWY6IG5ld1Jvd0RlZiwga2V5cywga2luZDogJ2Zvb3RlcicgfSk7XG4gICAgfVxuICAgIHJlc2V0Q29sdW1uV2lkdGhzKHJvd1dpZHRoLCB0aGlzLnZpc2libGVDb2x1bW5zLCB0aGlzLm1ldGFDb2x1bW5zKTtcbiAgICB0aGlzLmRpZmZlciA9IHRoaXMuZGlmZmVycy5maW5kKHRoaXMudmlzaWJsZUNvbHVtbnMpLmNyZWF0ZSgoaSwgYykgPT4gYy5pZCk7XG4gICAgdGhpcy5kaWZmZXIuZGlmZih0aGlzLnZpc2libGVDb2x1bW5zKTtcbiAgfVxuXG4gIHVwZGF0ZUdyb3VwcyguLi5yb3dJbmRleDogbnVtYmVyW10pOiB2b2lkIHtcbiAgICBpZiAocm93SW5kZXgubGVuZ3RoID09PSAwKSB7XG4gICAgICBmb3IgKGNvbnN0IHJvd0RlZiBvZiB0aGlzLmxhc3RTZXQuaGVhZGVyR3JvdXApIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlR3JvdXAocm93RGVmKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm93cyA9IHJvd0luZGV4LnNsaWNlKCk7XG4gICAgICBmb3IgKGNvbnN0IHJvd0RlZiBvZiB0aGlzLmxhc3RTZXQuaGVhZGVyR3JvdXApIHtcbiAgICAgICAgY29uc3QgaWR4ID0gcm93cy5pbmRleE9mKHJvd0RlZi5yb3dJbmRleCk7XG4gICAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICAgIHJvd3Muc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlR3JvdXAocm93RGVmKTtcbiAgICAgICAgICBpZiAocm93cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhdHRhY2hDdXN0b21DZWxsVGVtcGxhdGVzKGNvbHVtbnM/OiBQYmxDb2x1bW5bXSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVnaXN0cnkgfSA9IHRoaXMuZ3JpZDtcblxuICAgIGlmICghY29sdW1ucykge1xuICAgICAgY29sdW1ucyA9IHRoaXMudmlzaWJsZUNvbHVtbnM7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjb2wgb2YgdGhpcy52aXNpYmxlQ29sdW1ucykge1xuICAgICAgY29uc3QgY2VsbCA9IGZpbmRDZWxsRGVmKHJlZ2lzdHJ5LCBjb2wsICd0YWJsZUNlbGwnLCB0cnVlKTtcbiAgICAgIGlmICggY2VsbCApIHtcbiAgICAgICAgY29sLmNlbGxUcGwgPSBjZWxsLnRSZWY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q2VsbFRlbXBsYXRlID0gcmVnaXN0cnkuZ2V0TXVsdGlEZWZhdWx0KCd0YWJsZUNlbGwnKTtcbiAgICAgICAgY29sLmNlbGxUcGwgPSBkZWZhdWx0Q2VsbFRlbXBsYXRlID8gZGVmYXVsdENlbGxUZW1wbGF0ZS50UmVmIDogdGhpcy5ncmlkLl9mYlRhYmxlQ2VsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZWRpdG9yQ2VsbCA9IGZpbmRDZWxsRGVmKHJlZ2lzdHJ5LCBjb2wsICdlZGl0b3JDZWxsJywgdHJ1ZSk7XG4gICAgICBpZiAoIGVkaXRvckNlbGwgKSB7XG4gICAgICAgIGNvbC5lZGl0b3JUcGwgPSBlZGl0b3JDZWxsLnRSZWY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q2VsbFRlbXBsYXRlID0gcmVnaXN0cnkuZ2V0TXVsdGlEZWZhdWx0KCdlZGl0b3JDZWxsJyk7XG4gICAgICAgIGNvbC5lZGl0b3JUcGwgPSBkZWZhdWx0Q2VsbFRlbXBsYXRlID8gZGVmYXVsdENlbGxUZW1wbGF0ZS50UmVmIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGF0dGFjaEN1c3RvbUhlYWRlckNlbGxUZW1wbGF0ZXMoY29sdW1ucz86IEFycmF5PFBibENvbHVtbiB8IFBibE1ldGFDb2x1bW5TdG9yZT4pOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlZ2lzdHJ5IH0gPSB0aGlzLmdyaWQ7XG5cbiAgICBpZiAoIWNvbHVtbnMpIHtcbiAgICAgIGNvbHVtbnMgPSBbXS5jb25jYXQodGhpcy52aXNpYmxlQ29sdW1ucywgdGhpcy5tZXRhQ29sdW1ucyk7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdEhlYWRlckNlbGxUZW1wbGF0ZSA9IHJlZ2lzdHJ5LmdldE11bHRpRGVmYXVsdCgnaGVhZGVyQ2VsbCcpIHx8IHsgdFJlZjogdGhpcy5ncmlkLl9mYkhlYWRlckNlbGwgfTtcbiAgICBjb25zdCBkZWZhdWx0Rm9vdGVyQ2VsbFRlbXBsYXRlID0gcmVnaXN0cnkuZ2V0TXVsdGlEZWZhdWx0KCdmb290ZXJDZWxsJykgfHwgeyB0UmVmOiB0aGlzLmdyaWQuX2ZiRm9vdGVyQ2VsbCB9O1xuICAgIGZvciAoY29uc3QgY29sIG9mIGNvbHVtbnMpIHtcbiAgICAgIGlmIChpc1BibENvbHVtbihjb2wpKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlckNlbGxEZWYgPSBmaW5kQ2VsbERlZihyZWdpc3RyeSwgY29sLCAnaGVhZGVyQ2VsbCcsIHRydWUpIHx8IGRlZmF1bHRIZWFkZXJDZWxsVGVtcGxhdGU7XG4gICAgICAgIGNvbnN0IGZvb3RlckNlbGxEZWYgPSBmaW5kQ2VsbERlZihyZWdpc3RyeSwgY29sLCAnZm9vdGVyQ2VsbCcsIHRydWUpIHx8IGRlZmF1bHRGb290ZXJDZWxsVGVtcGxhdGU7XG4gICAgICAgIGNvbC5oZWFkZXJDZWxsVHBsID0gaGVhZGVyQ2VsbERlZi50UmVmO1xuICAgICAgICBjb2wuZm9vdGVyQ2VsbFRwbCA9IGZvb3RlckNlbGxEZWYudFJlZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjb2wuaGVhZGVyKSB7XG4gICAgICAgICAgY29uc3QgaGVhZGVyQ2VsbERlZiA9IGZpbmRDZWxsRGVmKHJlZ2lzdHJ5LCBjb2wuaGVhZGVyLCAnaGVhZGVyQ2VsbCcsIHRydWUpIHx8IGRlZmF1bHRIZWFkZXJDZWxsVGVtcGxhdGU7XG4gICAgICAgICAgY29sLmhlYWRlci50ZW1wbGF0ZSA9IGhlYWRlckNlbGxEZWYudFJlZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sLmhlYWRlckdyb3VwKSB7XG4gICAgICAgICAgY29uc3QgaGVhZGVyQ2VsbERlZiA9IGZpbmRDZWxsRGVmKHJlZ2lzdHJ5LCBjb2wuaGVhZGVyR3JvdXAsICdoZWFkZXJDZWxsJywgdHJ1ZSkgfHwgZGVmYXVsdEhlYWRlckNlbGxUZW1wbGF0ZTtcbiAgICAgICAgICBjb2wuaGVhZGVyR3JvdXAudGVtcGxhdGUgPSBoZWFkZXJDZWxsRGVmLnRSZWY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC5mb290ZXIpIHtcbiAgICAgICAgICBjb25zdCBmb290ZXJDZWxsRGVmID0gZmluZENlbGxEZWYocmVnaXN0cnksIGNvbC5mb290ZXIsICdmb290ZXJDZWxsJywgdHJ1ZSkgfHwgZGVmYXVsdEZvb3RlckNlbGxUZW1wbGF0ZTtcbiAgICAgICAgICBjb2wuZm9vdGVyLnRlbXBsYXRlID0gZm9vdGVyQ2VsbERlZi50UmVmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl92aXNpYmxlQ2hhbmdlZCQuY29tcGxldGUoKTtcbiAgICB0aGlzLm1ldGFSb3dzU3RvcmUuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlR3JvdXAoY29sdW1uU2V0OiBQYmxDb2x1bW5TZXQ8UGJsQ29sdW1uR3JvdXA+KTogdm9pZCB7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBhbGxLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgY29uc3QgZ3JvdXBzOiBQYmxDb2x1bW5Hcm91cFtdID0gW107XG5cbiAgICBmb3IgKGxldCB0SW5kZXggPSAwOyB0SW5kZXggPCB0aGlzLnZpc2libGVDb2x1bW5zLmxlbmd0aDsgdEluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNvbHVtbnMgPSBbdGhpcy52aXNpYmxlQ29sdW1uc1t0SW5kZXggLSAxXSwgdGhpcy52aXNpYmxlQ29sdW1uc1t0SW5kZXhdLCB0aGlzLnZpc2libGVDb2x1bW5zW3RJbmRleCArIDFdXTtcbiAgICAgIGNvbnN0IGNvbHVtbkdyb3VwcyA9IGNvbHVtbnMubWFwKCBjID0+IGMgPyBjLmdldEdyb3VwT2ZSb3coY29sdW1uU2V0LnJvd0luZGV4KSA6IHVuZGVmaW5lZCApO1xuICAgICAgLy8gdHJ1ZSB3aGVuIHRoZSBncm91cCBleGlzdHMgaW4gb25lIG9mIHRoZSBjb2x1bW5zIEJVVCBOT1QgaW4gdGhlIExBU1QgQ09MVU1OIChpLmU6IEl0cyBhIHNsYXZlIHNwbGl0KVxuICAgICAgY29uc3QgZ3JvdXBFeGlzdHMgPSBncm91cHMubGFzdEluZGV4T2YoY29sdW1uR3JvdXBzWzFdKSAhPT0gLTE7XG5cbiAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnNbMV07XG4gICAgICBjb25zdCBnQ29sdW1uID0gY29sdW1uLmdyb3VwTG9naWMoY29sdW1uR3JvdXBzIGFzIGFueSwgZ3JvdXBFeGlzdHMpO1xuICAgICAgaWYgKGdDb2x1bW4gIT09IGNvbHVtbkdyb3Vwc1sxXSkge1xuICAgICAgICBjb2x1bW4ubWFya05vdEluR3JvdXAoY29sdW1uR3JvdXBzWzFdKTtcbiAgICAgICAgY29sdW1uLm1hcmtJbkdyb3VwKGdDb2x1bW4pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtZXRhQ29sID0gdGhpcy5nZXRDb2x1bW5SZWNvcmQoZ0NvbHVtbi5pZCwgdGhpcy5tZXRhQ29sdW1ucyk7XG4gICAgICBpZiAoIW1ldGFDb2wuaGVhZGVyR3JvdXApIHtcbiAgICAgICAgbWV0YUNvbC5oZWFkZXJHcm91cCA9IGdDb2x1bW47XG4gICAgICB9XG5cbiAgICAgIGlmIChncm91cHMubGFzdEluZGV4T2YoZ0NvbHVtbikgPT09IC0xKSB7XG4gICAgICAgIGFsbEtleXMucHVzaChnQ29sdW1uLmlkKTtcbiAgICAgICAgaWYgKGdDb2x1bW4uaXNWaXNpYmxlKSB7XG4gICAgICAgICAga2V5cy5wdXNoKGdDb2x1bW4uaWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdDb2x1bW4ucmVwbGFjZShjb2x1bW4pO1xuICAgICAgZ3JvdXBzLnB1c2goZ0NvbHVtbik7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBnaG9zdCBvZiB0aGlzLl9ncm91cFN0b3JlLmZpbmRHaG9zdHMoKSkge1xuICAgICAgaWYgKGdob3N0LnJvd0luZGV4ID09PSBjb2x1bW5TZXQucm93SW5kZXgpIHtcbiAgICAgICAgY29uc3QgeyBpZCB9ID0gZ2hvc3Q7XG4gICAgICAgIGxldCBpZHggPSBhbGxLZXlzLmluZGV4T2YoaWQpO1xuICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgIGFsbEtleXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgaWR4ID0ga2V5cy5pbmRleE9mKGlkKTtcbiAgICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAga2V5cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5tZXRhQ29sdW1ucy5zcGxpY2UodGhpcy5tZXRhQ29sdW1ucy5maW5kSW5kZXgoIG0gPT4gbS5pZCA9PT0gaWQpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ncm91cFN0b3JlLnJlbW92ZShnaG9zdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubWV0YVJvd3NTdG9yZS51cGRhdGVIZWFkZXIoeyByb3dEZWY6IGNvbHVtblNldCwga2V5cywgYWxsS2V5cywgaXNHcm91cDogdHJ1ZSwga2luZDogJ2hlYWRlcicgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldENvbHVtblJlY29yZDxUIGV4dGVuZHMgUGJsTWV0YUNvbHVtblN0b3JlICYgeyBkYXRhPzogUGJsQ29sdW1uIH0+KGlkOiBzdHJpbmcsIGNvbGxlY3Rpb24/OiBUW10pOiBUICB7XG4gICAgbGV0IGNvbHVtblJlY29yZDogUGJsTWV0YUNvbHVtblN0b3JlICYgeyBkYXRhPzogUGJsQ29sdW1uIH0gPSB0aGlzLmJ5SWQuZ2V0KGlkKTtcbiAgICBpZiAoIWNvbHVtblJlY29yZCkge1xuICAgICAgdGhpcy5ieUlkLnNldChpZCwgY29sdW1uUmVjb3JkID0geyBpZCB9KTtcbiAgICAgIGlmIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNvbGxlY3Rpb24ucHVzaChjb2x1bW5SZWNvcmQgYXMgVCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2x1bW5SZWNvcmQgYXMgVDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SGlkZGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IGhpZGRlbiA9IHRoaXMuaGlkZGVuQ29sdW1ucy5zeW5jQWxsSGlkZGVuKCkuYWxsSGlkZGVuO1xuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgdGhpcy5hbGxDb2x1bW5zKSB7XG4gICAgICBjLmhpZGRlbiA9IGhpZGRlbi5oYXMoYy5pZCk7XG4gICAgICBpZiAoIWMuaGlkZGVuKSB7XG4gICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMucHVzaChjKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBoIG9mIHRoaXMubWV0YVJvd3NTdG9yZS5oZWFkZXJzKSB7XG4gICAgICBpZiAoaC5pc0dyb3VwKSB7XG4gICAgICAgIGgua2V5cyA9IGguYWxsS2V5cy5maWx0ZXIoIGtleSA9PiB0aGlzLmZpbmQoa2V5KS5oZWFkZXJHcm91cC5pc1Zpc2libGUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzZXRDb2x1bW5XaWR0aHModGhpcy5nZXRTdGF0aWNXaWR0aCgpLCB0aGlzLnZpc2libGVDb2x1bW5zLCB0aGlzLm1ldGFDb2x1bW5zKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRDb2x1bW5zKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsQ29sdW1ucyA9IFtdO1xuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcbiAgICB0aGlzLm1ldGFDb2x1bW5zID0gW107XG4gICAgdGhpcy5ieUlkLmNsZWFyKCk7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0SWRzKCk6IHZvaWQge1xuICAgIHRoaXMuY29sdW1uSWRzID0gW107XG4gICAgdGhpcy52aXNpYmxlQ29sdW1uSWRzID0gW107XG4gICAgdGhpcy5oaWRkZW5Db2x1bW5JZHMgPSBbXTtcbiAgICB0aGlzLm1ldGFSb3dzU3RvcmUuY2xlYXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgY29sdW1uVXBkYXRlSW5Qcm9ncmVzczogYm9vbGVhbjtcbiAgcHJpdmF0ZSBjaGVja1Zpc2libGVDaGFuZ2VzKCkge1xuICAgIGlmICh0aGlzLmRpZmZlcikge1xuICAgICAgaWYgKCF0aGlzLmNvbHVtblVwZGF0ZUluUHJvZ3Jlc3MpIHtcbiAgICAgICAgdGhpcy5jb2x1bW5VcGRhdGVJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtblVwZGF0ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLmRpZmZlci5kaWZmKHRoaXMudmlzaWJsZUNvbHVtbnMpO1xuICAgICAgICAgICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgICAgICAgICAgdGhpcy5oaWRkZW5Db2x1bW5JZHMgPSBBcnJheS5mcm9tKHRoaXMuaGlkZGVuQ29sdW1ucy5oaWRkZW4pO1xuICAgICAgICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5JZHMgPSBBcnJheS5mcm9tKHRoaXMudmlzaWJsZUNvbHVtbnMpLm1hcCggYyA9PiBjLmlkICk7XG4gICAgICAgICAgICAgIHRoaXMuY29sdW1uSWRzID0gQXJyYXkuZnJvbSh0aGlzLmFsbENvbHVtbnMpLm1hcCggYyA9PiBjLmlkICk7XG4gICAgICAgICAgICAgIHRoaXMuX3Zpc2libGVDaGFuZ2VkJC5uZXh0KHsgY29sdW1uczogdGhpcy52aXNpYmxlQ29sdW1ucywgY2hhbmdlcyB9KTtcbiAgICAgICAgICAgICAgdGhpcy5hZnRlckNvbHVtblBvc2l0aW9uQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG5vIGRpZmZlciBtZWFucyB3ZSBkaWQgbm90IGludmFsaWRhdGUgeWV0LCBzbyBub3RoaW5nIHdpbGwgY2hhbmdlIHVudGlsIGl0IHN0YXJ0IHNob3dpbmdcbiAgfVxuXG4gIHByaXZhdGUgYWZ0ZXJDb2x1bW5Qb3NpdGlvbkNoYW5nZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBUaGlzIHNob3VsZG4ndCBiZSBoZXJlLCBpdCBzaG91bGQgYmUgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjYWxsZXIgdG8gY2xlYXIgdGhlIGNvbnRleHRcbiAgICAvLyBCZWNhdXNlIG5vdyB0aGVyZSBpcyBub3Qgb3B0aW9uIHRvIGNvbnRyb2wgaXQuXG4gICAgdGhpcy5leHRBcGkuY29udGV4dEFwaS5jbGVhcih0cnVlKTtcbiAgICB0aGlzLnVwZGF0ZUdyb3VwcygpO1xuICAgIHRoaXMuZXh0QXBpLndpZHRoQ2FsYy5yZXNldENvbHVtbnNXaWR0aCgpO1xuICAgIC8vIG5vdywgYW55IG5ld2x5IGFkZGVkIGNvbHVtbiBjZWxscyBtdXN0IGZpcnN0IHNwaW4gdXAgdG8gZ2V0IGEgc2l6ZVxuICAgIC8vIGFuZCBtb3N0IGltcG9ydGFudGx5IGhhdmUgdGhlaXIgbmdBZnRlclZpZXdJbml0IGZpcmVkIHNvIHRoZSByZXNpemUgY29sdW1uIHdpbGwgdXBkYXRlIHRoZSBzaXplSW5mbyBvZiB0aGUgY29sdW1uIVxuICAgIHRoaXMuZXh0QXBpLnJvd3NBcGkuc3luY1Jvd3MoJ2hlYWRlcicsIHRydWUpO1xuICAgIHRoaXMuZXh0QXBpLndpZHRoQ2FsYy5jYWxjQ29sdW1uV2lkdGgoKTtcbiAgfVxufVxuXG4vKipcbiAqIE1vdmVzIGFuIGl0ZW0gb25lIGluZGV4IGluIGFuIGFycmF5IHRvIGFub3RoZXIuXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgaW4gd2hpY2ggdG8gbW92ZSB0aGUgaXRlbS5cbiAqIEBwYXJhbSBmcm9tSW5kZXggU3RhcnRpbmcgaW5kZXggb2YgdGhlIGl0ZW0uXG4gKiBAcGFyYW0gdG9JbmRleCBJbmRleCB0byB3aGljaCB0aGUgaXRlbSBzaG91bGQgYmUgbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlSXRlbUluQXJyYXk8VCA9IGFueT4oYXJyYXk6IFRbXSwgZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBmcm9tID0gY2xhbXAoZnJvbUluZGV4LCBhcnJheS5sZW5ndGggLSAxKTtcbiAgY29uc3QgdG8gPSBjbGFtcCh0b0luZGV4LCBhcnJheS5sZW5ndGggLSAxKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0YXJnZXQgPSBhcnJheVtmcm9tXTtcbiAgY29uc3QgZGVsdGEgPSB0byA8IGZyb20gPyAtMSA6IDE7XG5cbiAgZm9yIChsZXQgaSA9IGZyb207IGkgIT09IHRvOyBpICs9IGRlbHRhKSB7XG4gICAgYXJyYXlbaV0gPSBhcnJheVtpICsgZGVsdGFdO1xuICB9XG5cbiAgYXJyYXlbdG9dID0gdGFyZ2V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUl0ZW1JbkFycmF5RXh0PFQgPSBhbnk+KGFycmF5OiBUW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21JbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b0luZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuOiAocHJldmlvdXNJdGVtOiBULCBjdXJyZW50SXRlbTogVCwgcHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4gdm9pZCk6IHZvaWQge1xuICBjb25zdCBmcm9tID0gY2xhbXAoZnJvbUluZGV4LCBhcnJheS5sZW5ndGggLSAxKTtcbiAgY29uc3QgdG8gPSBjbGFtcCh0b0luZGV4LCBhcnJheS5sZW5ndGggLSAxKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0YXJnZXQgPSBhcnJheVtmcm9tXTtcbiAgY29uc3QgZGVsdGEgPSB0byA8IGZyb20gPyAtMSA6IDE7XG5cbiAgZm9yIChsZXQgaSA9IGZyb207IGkgIT09IHRvOyBpICs9IGRlbHRhKSB7XG4gICAgY29uc3QgbmV4dCA9IGkgKyBkZWx0YTtcbiAgICBmbihhcnJheVtpXSwgYXJyYXlbbmV4dF0sIGksIG5leHQpO1xuICAgIGFycmF5W2ldID0gYXJyYXlbbmV4dF07XG4gIH1cblxuICBmbihhcnJheVt0b10sIHRhcmdldCwgdG8sIGZyb20pO1xuICBhcnJheVt0b10gPSB0YXJnZXQ7XG59XG5cblxuLyoqIENsYW1wcyBhIG51bWJlciBiZXR3ZWVuIHplcm8gYW5kIGEgbWF4aW11bS4gKi9cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKG1heCwgdmFsdWUpKTtcbn1cbiJdfQ==