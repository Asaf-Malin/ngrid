import { ReplaySubject, fromEvent, timer } from 'rxjs';
import { filter, tap, switchMap, takeUntil, map, bufferWhen, debounce } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { EventEmitter, Directive, Input, NgModule } from '@angular/core';
import * as i1 from '@asafmalin/ngrid';
import { PblColumn, PblNgridPluginController, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import { RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i1$1 from '@asafmalin/ngrid/core';
import { unrx } from '@asafmalin/ngrid/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

function isCellEvent(event) {
    return !!event.cellTarget;
}
function isDataCellEvent(event) {
    return isCellEvent(event) && !!event.context;
}
/**
 * Returns true if the element is a row element (`pbl-ngrid-row`, `cdk-row`).
 *
 * This function works under the following assumptions:
 *
 *   - A row element MUST contain a "role" attribute with the value "row"
 */
function isRowContainer(element) {
    return element.getAttribute('role') === 'row';
}
/**
 * Find the cell element that is or wraps the provided element.
 * The element can be a table cell element (any type of) OR a nested element (any level) of a table cell element.
 *
 * This function works under the following assumptions:
 *
 *   - The parent of a cell element is a row element.
 *   - Each row element MUST contain a "role" attribute with the value "row"
 */
function findParentCell(element) {
    while (element.parentElement) {
        if (isRowContainer(element.parentElement)) {
            return element;
        }
        element = element.parentElement;
    }
}
/**
 * Returns the position (index) of the cell (element) among it's siblings.
 */
function findCellRenderIndex(cell) {
    let colIndex = 0;
    while (cell = cell.previousElementSibling) {
        colIndex++;
    }
    return colIndex;
}
/**
 * Returns table metadata for a given ROW element.
 * This function works under the following assumptions:
 *
 *   - Each row element MUST contain a "role" attribute with the value "row"
 *   - Each row element MUST contains the type identifier attribute "data-rowtype" (except "data" rows)
 *   - Allowed values for "data-rowtype" are: 'header' | 'meta-header' | 'footer' | 'meta-footer' | 'data'
 *   - Row's representing data items (data-rowtype="data") can omit the type attribute and the function will infer it.
 *
 * NOTE that this function DOES NOT identify subType of `meta-group` (`PblNgridMatrixRow<'header' | 'footer', 'meta-group'>`), it will return it as
 * 'meta`, you need to handle this case specifically.
 *
 * Because detection is based on DOM element position finding the original row index when multiple row containers are set (fixed/style/row) will not work.
 * The rowIndex will be relative to the container, and not the entire table.
 */
function matrixRowFromRow(row, vcRef) {
    const rowAttrType = row.getAttribute('data-rowtype') || 'data';
    // TODO: Error if rowAttrType is not one of the allowed values!
    let rowIndex = 0;
    switch (rowAttrType) {
        case 'data':
            const sourceRow = row;
            while (row.previousElementSibling) {
                rowIndex++;
                row = row.previousElementSibling;
            }
            rowIndex = Math.min(rowIndex, vcRef.length - 1);
            while (rowIndex > -1) {
                if (vcRef.get(rowIndex).rootNodes[0] === sourceRow) {
                    return {
                        type: 'data',
                        subType: 'data',
                        rowIndex,
                    };
                }
                rowIndex--;
            }
            return;
        case 'header':
        case 'footer':
            return {
                type: rowAttrType,
                subType: 'data',
                rowIndex,
            };
        default:
            while (row.previousElementSibling && row.previousElementSibling.getAttribute('data-rowtype') === rowAttrType) {
                rowIndex++;
                row = row.previousElementSibling;
            }
            return {
                type: rowAttrType === 'meta-footer' ? 'footer' : 'header',
                subType: 'meta',
                rowIndex,
            };
    }
}
/**
 * Given a list of cells stacked vertically (yAxis) and a list of cells stacked horizontally (xAxis) return all the cells inside (without the provided axis cells).
 *
 * In the following example, all [Yn] cells are provided in the yAxis param and all [Xn] cell in the xAxis params, the returned value will be an array
 * with all cells marked with Z.
 *    Y5  Z  Z  Z
 *    Y4  Z  Z  Z
 *    Y3  Z  Z  Z
 *    Y2  Z  Z  Z
 *    XY1 X2 X3 X4
 * @param contextApi
 * @param xAxis
 * @param yAxis
 */
function getInnerCellsInRect(contextApi, xAxis, yAxis) {
    const spaceInside = [];
    for (const vCell of yAxis) {
        for (const hCell of xAxis) {
            const vhContext = contextApi.findRowInCache(vCell.rowIdent).cells[hCell.colIndex];
            if (vhContext) {
                spaceInside.push({ rowIdent: vCell.rowIdent, colIndex: hCell.colIndex });
            }
        }
    }
    return spaceInside;
}
function rangeBetween(n1, n2) {
    const min = Math.min(n1, n2);
    const max = min === n1 ? n2 : n1;
    const result = [];
    for (let i = min + 1; i < max; i++) {
        result.push(i);
    }
    return result;
}

const isOsx = /^mac/.test(navigator.platform.toLowerCase());
const isMainMouseButtonClick = (event) => event.source.button === 0;
function handleFocusAndSelection(targetEvents) {
    const isCellFocusMode = () => targetEvents.grid.focusMode === 'cell';
    const handlers = createHandlers(targetEvents);
    // Handle array keys move (with shift for selection, without for cell focus change)
    targetEvents.keyDown
        .pipe(filter(isCellFocusMode))
        .subscribe(handlers.handleKeyDown);
    // Handle mouse down on cell (focus) and then moving for selection.
    targetEvents.mouseDown
        .pipe(filter(isCellFocusMode), filter(isDataCellEvent), filter(isMainMouseButtonClick), tap(event => {
        event.source.stopPropagation();
        event.source.preventDefault();
    }), tap(handlers.handleMouseDown), // handle mouse down focus
    switchMap(() => targetEvents.cellEnter.pipe(takeUntil(targetEvents.mouseUp))), filter(isDataCellEvent), filter(isMainMouseButtonClick))
        .subscribe(handlers.handleSelectionChangeByMouseClickAndMove); // now handle movements until mouseup
}
function createHandlers(targetEvents) {
    const { contextApi } = targetEvents.grid;
    function focusCell(rowIdent, colIndex, markForCheck) {
        contextApi.focusCell({ rowIdent, colIndex });
    }
    function handleMouseDown(event) {
        if (contextApi.focusedCell && event.source.shiftKey) {
            handleSelectionChangeByMouseClickAndMove(event);
        }
        else if (isOsx ? event.source.metaKey : event.source.ctrlKey) {
            if (event.context.selected) {
                contextApi.unselectCells([event.context]);
            }
            else {
                contextApi.selectCells([event.context]);
            }
        }
        else {
            focusCell(event.context.rowContext.identity, event.context.index);
        }
    }
    function handleKeyDown(event) {
        const source = event.source;
        if (isCellEvent(event)) {
            const sourceCell = event.cellTarget;
            let coeff = 1;
            let isHorizontal = false;
            switch (source.keyCode) {
                case UP_ARROW:
                    coeff = -1;
                case DOWN_ARROW: // tslint:disable-line: no-switch-case-fall-through
                    break;
                case LEFT_ARROW:
                    coeff = -1;
                case RIGHT_ARROW: // tslint:disable-line: no-switch-case-fall-through
                    isHorizontal = true;
                    break;
                default:
                    return;
            }
            event.source.preventDefault();
            event.source.stopPropagation();
            let activeFocus = contextApi.focusedCell;
            if (!activeFocus) {
                const cellContext = contextApi.getCell(sourceCell);
                activeFocus = {
                    rowIdent: cellContext.rowContext.identity,
                    colIndex: cellContext.index,
                };
            }
            if (!!source.shiftKey) {
                handleSelectionChangeByArrows(activeFocus, isHorizontal ? [coeff, 0] : [0, coeff]);
            }
            else {
                handleSingleItemFocus(activeFocus, isHorizontal ? [coeff, 0] : [0, coeff]);
            }
        }
    }
    /**
     * Handle selection changes caused ONLY by the use of the arrow keys with SHIFT key.
     *
     * The implementation is NOT incremental, it will re-calculate the selected cell on every arrow key press (every call to this function).
     *
     * First. A simple adjacent cell detection is performed to determine the direction of the current selected cells relative to the
     * source cell (usually the focused cell). We only care about 4 cells, adjacent to the source Cell: Top, Left, Bottom, Right
     *
     *    │ T │
     * ───┼───┼───
     *  R │ C │ L
     * ───┼───┼───
     *    │ B │
     *
     * We can only have 1 quarter selection with Arrow selection so it TL, TR, BR or BL, any other setup will clear the selection and start from scratch.
     *
     * > Note that the logic in this function is for use with arrow keys + SHIFT key, other selection logic
     * does not fit this scenario (e.g. MOUSE selection or ARROW KEYS + CTRL KEY selection)
     *
     * @param sourceCellRef A point reference to the source cell the direction is relative to
     * @param direction The direction of the new cell.
     * [1 | -1, 0] -> HORIZONTAL
     * [0, 1 | -1] -> VERTICAL
     */
    function handleSelectionChangeByArrows(sourceCellRef, direction) {
        const { rowIdent, colIndex } = sourceCellRef;
        const sourceCellState = contextApi.findRowInCache(rowIdent);
        const [moveH, moveV] = direction;
        const hAdj = [sourceCellState.cells[colIndex - 1], sourceCellState.cells[colIndex + 1]];
        const vAdj = [contextApi.findRowInCache(rowIdent, -1, true), contextApi.findRowInCache(rowIdent, 1, true)];
        let h = (hAdj[0] && hAdj[0].selected ? -1 : 0) + (hAdj[1] && hAdj[1].selected ? 1 : 0);
        let v = (vAdj[0] && vAdj[0].cells[colIndex].selected ? -1 : 0) + (vAdj[1] && vAdj[1].cells[colIndex].selected ? 1 : 0);
        if (h === 0) {
            h += moveH;
        }
        if (v === 0) {
            v += moveV;
        }
        const hCells = [];
        if (h !== 0) {
            let hContextIndex = colIndex;
            let hContext = sourceCellState.cells[colIndex];
            while (hContext && hContext.selected) {
                hCells.push({ rowIdent, colIndex: hContextIndex });
                hContextIndex += h;
                hContext = sourceCellState.cells[hContextIndex];
            }
            if (moveH) {
                if (h === moveH) {
                    if (hContext) {
                        hCells.push({ rowIdent, colIndex: hContextIndex });
                    }
                }
                else {
                    hCells.pop();
                }
            }
        }
        const vCells = [];
        if (v !== 0) {
            let vContextIdent = rowIdent;
            let vContext = contextApi.findRowInCache(vContextIdent, v, true);
            while (vContext && vContext.cells[colIndex].selected) {
                vContextIdent = vContext.identity;
                vCells.push({ rowIdent: vContextIdent, colIndex });
                vContext = contextApi.findRowInCache(vContextIdent, v, true);
            }
            if (moveV) {
                if (v === moveV) {
                    if (vContext) {
                        vCells.push({ rowIdent: vContext.identity, colIndex });
                    }
                }
                else {
                    vCells.pop();
                }
            }
        }
        const innerCells = getInnerCellsInRect(contextApi, hCells, vCells);
        contextApi.selectCells([sourceCellRef, ...hCells, ...vCells, ...innerCells], true);
    }
    function handleSelectionChangeByMouseClickAndMove(event) {
        const cellContext = event.context;
        const activeFocus = contextApi.focusedCell || {
            rowIdent: cellContext.rowContext.identity,
            colIndex: cellContext.index,
        };
        const focusedRowState = contextApi.findRowInCache(activeFocus.rowIdent);
        const hCells = [];
        const vCells = [];
        for (const i of rangeBetween(activeFocus.colIndex, cellContext.index)) {
            hCells.push({ rowIdent: activeFocus.rowIdent, colIndex: i });
        }
        hCells.push({ rowIdent: activeFocus.rowIdent, colIndex: cellContext.index });
        const rowHeight = Math.abs(cellContext.rowContext.dsIndex - focusedRowState.dsIndex);
        const dir = focusedRowState.dsIndex > cellContext.rowContext.dsIndex ? -1 : 1;
        for (let i = 1; i <= rowHeight; i++) {
            const state = contextApi.findRowInCache(activeFocus.rowIdent, dir * i, true);
            vCells.push({ rowIdent: state.identity, colIndex: activeFocus.colIndex });
        }
        const innerCells = getInnerCellsInRect(contextApi, hCells, vCells);
        contextApi.selectCells([activeFocus, ...hCells, ...vCells, ...innerCells], true);
    }
    /**
     * Swap the focus from the source cell to a straight adjacent cell (not diagonal).
     * @param sourceCellRef A point reference to the source cell the direction is relative to
     * @param direction The direction of the new cell.
     * [1 | -1, 0] -> HORIZONTAL
     * [0, 1 | -1] -> VERTICAL
     */
    function handleSingleItemFocus(sourceCellRef, direction) {
        const rowState = contextApi.findRowInCache(sourceCellRef.rowIdent, direction[1], true);
        if (rowState) {
            contextApi.focusCell({ rowIdent: rowState.identity, colIndex: sourceCellRef.colIndex + direction[0] });
        }
    }
    return {
        handleMouseDown,
        handleKeyDown,
        handleSelectionChangeByMouseClickAndMove
    };
}

const PLUGIN_KEY = 'targetEvents';
function hasListeners(source) {
    return source.observers.length > 0;
}
function findEventSource(source) {
    const cellTarget = findParentCell(source.target);
    if (cellTarget) {
        return { type: 'cell', target: cellTarget };
    }
    else if (isRowContainer(source.target)) {
        return { type: 'cell', target: source.target };
    }
}
function runOnce() {
    PblColumn.extendProperty('editable');
}
class PblNgridTargetEventsPlugin {
    constructor(grid, injector, pluginCtrl) {
        this.grid = grid;
        this.injector = injector;
        this.pluginCtrl = pluginCtrl;
        this.rowClick = new EventEmitter();
        this.rowDblClick = new EventEmitter();
        this.rowEnter = new EventEmitter();
        this.rowLeave = new EventEmitter();
        this.cellClick = new EventEmitter();
        this.cellDblClick = new EventEmitter();
        this.cellEnter = new EventEmitter();
        this.cellLeave = new EventEmitter();
        this.mouseDown = new EventEmitter();
        this.mouseUp = new EventEmitter();
        this.keyUp = new EventEmitter();
        this.keyDown = new EventEmitter();
        this.destroyed = new ReplaySubject();
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        pluginCtrl.onInit().subscribe(() => this.init());
    }
    static create(table, injector) {
        const pluginCtrl = PblNgridPluginController.find(table);
        return new PblNgridTargetEventsPlugin(table, injector, pluginCtrl);
    }
    init() {
        this.setupDomEvents();
        handleFocusAndSelection(this);
    }
    setupDomEvents() {
        const grid = this.grid;
        const cdkTable = this.pluginCtrl.extApi.cdkTable;
        const cdkTableElement = cdkTable._element;
        const createCellEvent = (cellTarget, source) => {
            const rowTarget = cellTarget.parentElement;
            const matrixPoint = matrixRowFromRow(rowTarget, cdkTable._rowOutlet.viewContainer);
            if (matrixPoint) {
                const event = { ...matrixPoint, source, cellTarget, rowTarget };
                if (matrixPoint.type === 'data') {
                    event.row = grid.ds.renderedData[matrixPoint.rowIndex];
                }
                else if (event.subType === 'meta') {
                    // When multiple containers exists (fixed/sticky/row) the rowIndex we get is the one relative to the container..
                    // We need to find the rowIndex relative to the definitions:
                    const { metaRowService } = this.pluginCtrl.extApi.rowsApi;
                    const db = event.type === 'header' ? metaRowService.header : metaRowService.footer;
                    for (const coll of [db.fixed, db.row, db.sticky]) {
                        const result = coll.find(item => item.el === event.rowTarget);
                        if (result) {
                            event.rowIndex = result.index;
                            break;
                        }
                    }
                }
                /* `metadataFromElement()` does not provide column information nor the column itself. This will extend functionality to add the columnIndex and column.
                    The simple case is when `subType === 'data'`, in this case the column is always the data column for all types (header, data and footer)
        
                    If `subType !== 'data'` we need to get the proper column based type (type can only be `header` or `footer` at this point).
                    But that's not all, because `metadataFromElement()` does not handle `meta-group` subType we need to do it here...
                */
                event.colIndex = findCellRenderIndex(cellTarget);
                if (matrixPoint.subType === 'data') {
                    const column = this.grid.columnApi.findColumnAt(event.colIndex);
                    const columnIndex = this.grid.columnApi.indexOf(column);
                    event.column = column;
                    event.context = this.pluginCtrl.extApi.contextApi.getCell(event.rowIndex, columnIndex);
                    if (!event.context) {
                        this.pluginCtrl.extApi.contextApi.clear(true);
                        event.context = this.pluginCtrl.extApi.contextApi.getCell(event.rowIndex, columnIndex);
                    }
                }
                else {
                    const store = this.pluginCtrl.extApi.columnStore;
                    const rowInfo = (matrixPoint.type === 'header' ? store.metaHeaderRows : store.metaFooterRows)[event.rowIndex];
                    const record = store.find(rowInfo.keys[event.colIndex]);
                    if (rowInfo.isGroup) {
                        event.subType = 'meta-group';
                        event.column = matrixPoint.type === 'header' ? record.headerGroup : record.footerGroup;
                    }
                    else {
                        event.column = matrixPoint.type === 'header' ? record.header : record.footer;
                    }
                }
                return event;
            }
        };
        const createRowEvent = (rowTarget, source, root) => {
            if (root) {
                const event = {
                    source,
                    rowTarget,
                    type: root.type,
                    subType: root.subType,
                    rowIndex: root.rowIndex,
                    root
                };
                if (root.type === 'data') {
                    event.row = root.row;
                    event.context = root.context.rowContext;
                }
                return event;
            }
            else {
                const matrixPoint = matrixRowFromRow(rowTarget, cdkTable._rowOutlet.viewContainer);
                if (matrixPoint) {
                    const event = { ...matrixPoint, source, rowTarget };
                    if (matrixPoint.type === 'data') {
                        const row = this.pluginCtrl.extApi.contextApi.getRow(matrixPoint.rowIndex);
                        if (!row) {
                            return undefined;
                        }
                        event.context = row;
                        event.row = row.$implicit;
                    }
                    /*  If `subType !== 'data'` it can only be `meta` because `metadataFromElement()` does not handle `meta-group` subType.
                        We need to extend this missing part, we don't have columns here so we will try to infer it using the first column.
          
                        It's similar to how it's handled in cell clicks, but here we don't need to extends the column info.
                        We only need to change the `subType` when the row is a group row, getting a specific column is irrelevant.
                        We just need A column because group columns don't mix with regular meta columns.
          
                        NOTE: When subType is not 'data' the ype can only be `header` or `footer`.
                    */
                    if (matrixPoint.subType !== 'data') {
                        const store = this.pluginCtrl.extApi.columnStore;
                        const rowInfo = (matrixPoint.type === 'header' ? store.metaHeaderRows : store.metaFooterRows)[event.rowIndex];
                        if (rowInfo.isGroup) {
                            event.subType = 'meta-group';
                        }
                    }
                    return event;
                }
            }
        };
        let lastCellEnterEvent;
        let lastRowEnterEvent;
        const emitCellLeave = (source) => {
            if (lastCellEnterEvent) {
                const lastCellEnterEventTemp = lastCellEnterEvent;
                this.cellLeave.emit(Object.assign({}, lastCellEnterEventTemp, { source }));
                lastCellEnterEvent = undefined;
                return lastCellEnterEventTemp;
            }
        };
        const emitRowLeave = (source) => {
            if (lastRowEnterEvent) {
                const lastRowEnterEventTemp = lastRowEnterEvent;
                this.rowLeave.emit(Object.assign({}, lastRowEnterEventTemp, { source }));
                lastRowEnterEvent = undefined;
                return lastRowEnterEventTemp;
            }
        };
        const processEvent = (e) => {
            const result = findEventSource(e);
            if (result) {
                if (result.type === 'cell') {
                    const event = createCellEvent(result.target, e);
                    if (event) {
                        return {
                            type: result.type,
                            event,
                            waitTime: hasListeners(this.cellDblClick) ? 250 : 1,
                        };
                    }
                }
                else if (result.type === 'row') {
                    const event = createRowEvent(result.target, e);
                    if (event) {
                        return {
                            type: result.type,
                            event,
                            waitTime: hasListeners(this.rowDblClick) ? 250 : 1,
                        };
                    }
                }
            }
        };
        /** Split the result of processEvent into cell and row events, if type is row only row event is returned, if cell then cell is returned and row is created along side. */
        const splitProcessedEvent = (event) => {
            const cellEvent = event.type === 'cell' ? event.event : undefined;
            const rowEvent = cellEvent
                ? createRowEvent(cellEvent.rowTarget, cellEvent.source, cellEvent)
                : event.event;
            return { cellEvent, rowEvent };
        };
        const registerUpDownEvents = (eventName, emitter) => {
            fromEvent(cdkTableElement, eventName)
                .pipe(takeUntil(this.destroyed), filter(source => hasListeners(emitter)), map(processEvent), filter(result => !!result))
                .subscribe(result => {
                const { cellEvent, rowEvent } = splitProcessedEvent(result);
                emitter.emit(cellEvent || rowEvent);
                this.syncRow(cellEvent || rowEvent);
            });
        };
        registerUpDownEvents('mouseup', this.mouseUp);
        registerUpDownEvents('mousedown', this.mouseDown);
        registerUpDownEvents('keyup', this.keyUp);
        registerUpDownEvents('keydown', this.keyDown);
        /*
          Handling click stream for both click and double click events.
          We want to detect double clicks and clicks with minimal delays
          We check if a double click has listeners, if not we won't delay the click...
          TODO: on double click, don't wait the whole 250 ms if 2 clicks happen.
        */
        const clickStream = fromEvent(cdkTableElement, 'click').pipe(takeUntil(this.destroyed), filter(source => hasListeners(this.cellClick) || hasListeners(this.cellDblClick) || hasListeners(this.rowClick) || hasListeners(this.rowDblClick)), map(processEvent), filter(result => !!result));
        clickStream
            .pipe(bufferWhen(() => clickStream.pipe(debounce(e => timer(e.waitTime)))), filter(events => events.length > 0))
            .subscribe(events => {
            const event = events.shift();
            const isDoubleClick = events.length === 1; // if we have 2 events its double click, otherwise single.
            const { cellEvent, rowEvent } = splitProcessedEvent(event);
            if (isDoubleClick) {
                if (cellEvent) {
                    this.cellDblClick.emit(cellEvent);
                }
                this.rowDblClick.emit(rowEvent);
            }
            else {
                if (cellEvent) {
                    this.cellClick.emit(cellEvent);
                }
                this.rowClick.emit(rowEvent);
            }
            this.syncRow(cellEvent || rowEvent);
        });
        fromEvent(cdkTableElement, 'mouseleave')
            .pipe(takeUntil(this.destroyed))
            .subscribe((source) => {
            let lastEvent = emitCellLeave(source);
            lastEvent = emitRowLeave(source) || lastEvent;
            if (lastEvent) {
                this.syncRow(lastEvent);
            }
        });
        fromEvent(cdkTableElement, 'mousemove')
            .pipe(takeUntil(this.destroyed))
            .subscribe((source) => {
            const cellTarget = findParentCell(source.target);
            const lastCellTarget = lastCellEnterEvent && lastCellEnterEvent.cellTarget;
            const lastRowTarget = lastRowEnterEvent && lastRowEnterEvent.rowTarget;
            let cellEvent;
            let lastEvent;
            if (lastCellTarget !== cellTarget) {
                lastEvent = emitCellLeave(source) || lastEvent;
            }
            if (cellTarget) {
                if (lastCellTarget !== cellTarget) {
                    cellEvent = createCellEvent(cellTarget, source);
                    if (cellEvent) {
                        this.cellEnter.emit(lastCellEnterEvent = cellEvent);
                    }
                }
                else {
                    return;
                }
            }
            const rowTarget = (cellEvent && cellEvent.rowTarget) || (isRowContainer(source.target) && source.target);
            if (lastRowTarget !== rowTarget) {
                lastEvent = emitRowLeave(source) || lastEvent;
            }
            if (rowTarget) {
                if (lastRowTarget !== rowTarget) {
                    const rowEvent = createRowEvent(rowTarget, source, cellEvent);
                    if (rowEvent) {
                        this.rowEnter.emit(lastRowEnterEvent = rowEvent);
                    }
                }
            }
            if (lastEvent) {
                this.syncRow(lastEvent);
            }
        });
    }
    destroy() {
        this.destroyed.next();
        this.destroyed.complete();
        this._removePlugin(this.grid);
    }
    syncRow(event) {
        this.grid.rowsApi.syncRows(event.type, event.rowIndex);
    }
}
class PblNgridTargetEventsPluginDirective extends PblNgridTargetEventsPlugin {
    constructor(table, injector, pluginCtrl) {
        super(table, injector, pluginCtrl);
    }
    ngOnDestroy() {
        this.destroy();
    }
}
/** @nocollapse */ PblNgridTargetEventsPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsPluginDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridTargetEventsPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridTargetEventsPluginDirective, selector: "pbl-ngrid[targetEvents], pbl-ngrid[mouseDown], pbl-ngrid[mouseUp], pbl-ngrid[rowClick], pbl-ngrid[rowDblClick], pbl-ngrid[rowEnter], pbl-ngrid[rowLeave], pbl-ngrid[cellClick], pbl-ngrid[cellDblClick], pbl-ngrid[cellEnter], pbl-ngrid[cellLeave], pbl-ngrid[keyDown], pbl-ngrid[keyUp]", outputs: { mouseDown: "mouseDown", mouseUp: "mouseUp", rowClick: "rowClick", rowDblClick: "rowDblClick", rowEnter: "rowEnter", rowLeave: "rowLeave", cellClick: "cellClick", cellDblClick: "cellDblClick", cellEnter: "cellEnter", cellLeave: "cellLeave", keyDown: "keyDown", keyUp: "keyUp" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsPluginDirective, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: 'pbl-ngrid[targetEvents], pbl-ngrid[mouseDown], pbl-ngrid[mouseUp], pbl-ngrid[rowClick], pbl-ngrid[rowDblClick], pbl-ngrid[rowEnter], pbl-ngrid[rowLeave], pbl-ngrid[cellClick], pbl-ngrid[cellDblClick], pbl-ngrid[cellEnter], pbl-ngrid[cellLeave], pbl-ngrid[keyDown], pbl-ngrid[keyUp]',
                    // tslint:disable-next-line:use-output-property-decorator
                    outputs: ['mouseDown', 'mouseUp', 'rowClick', 'rowDblClick', 'rowEnter', 'rowLeave', 'cellClick', 'cellDblClick', 'cellEnter', 'cellLeave', 'keyDown', 'keyUp']
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; } });

class PblNgridCellEditDirective {
    constructor(grid, injector, pluginCtrl) {
        this._click = false;
        this._dblClick = false;
        pluginCtrl.onInit()
            .subscribe(() => {
            this.targetEventsPlugin = pluginCtrl.getPlugin('targetEvents') || pluginCtrl.createPlugin('targetEvents');
            this.update();
        });
    }
    set cellEditClick(value) {
        value = coerceBooleanProperty(value);
        if (this._click !== value) {
            this._click = value;
            this.update();
        }
    }
    set cellEditDblClick(value) {
        value = coerceBooleanProperty(value);
        if (this._dblClick !== value) {
            this._dblClick = value;
            this.update();
        }
    }
    ngOnDestroy() {
        unrx.kill(this);
    }
    update() {
        if (this.targetEventsPlugin) {
            unrx.kill(this, this.targetEventsPlugin);
            if (this._click) {
                this.targetEventsPlugin.cellClick
                    .pipe(unrx(this, this.targetEventsPlugin))
                    .subscribe(event => {
                    if (event.type === 'data' && event.column.editable) {
                        event.context.startEdit(true);
                    }
                });
            }
            if (this._dblClick) {
                this.targetEventsPlugin.cellDblClick
                    .pipe(unrx(this, this.targetEventsPlugin))
                    .subscribe(event => {
                    if (event.type === 'data' && event.column.editable) {
                        event.context.startEdit(true);
                    }
                });
            }
        }
    }
}
/** @nocollapse */ PblNgridCellEditDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellEditDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellEditDirective, selector: "pbl-ngrid[cellEditClick], pbl-ngrid[cellEditDblClick]", inputs: { cellEditClick: "cellEditClick", cellEditDblClick: "cellEditDblClick" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditDirective, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: 'pbl-ngrid[cellEditClick], pbl-ngrid[cellEditDblClick]',
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { cellEditClick: [{
                type: Input
            }], cellEditDblClick: [{
                type: Input
            }] } });

class PblNgridTargetEventsModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridTargetEventsModule, (grid, controller) => {
            const targetEventsConfig = configService.get(PLUGIN_KEY);
            if (targetEventsConfig && targetEventsConfig.autoEnable === true) {
                controller.onInit()
                    .subscribe(() => {
                    if (!controller.hasPlugin(PLUGIN_KEY)) {
                        controller.createPlugin(PLUGIN_KEY);
                    }
                });
            }
        });
    }
}
PblNgridTargetEventsModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create', runOnce }, PblNgridTargetEventsPlugin);
/** @nocollapse */ PblNgridTargetEventsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, deps: [{ token: i1$1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridTargetEventsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, declarations: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective] });
/** @nocollapse */ PblNgridTargetEventsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective],
                    exports: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective]
                }]
        }], ctorParameters: function () { return [{ type: i1$1.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridCellEditDirective, PblNgridTargetEventsModule, PblNgridTargetEventsPlugin, PblNgridTargetEventsPluginDirective, isCellEvent, isDataCellEvent };
//# sourceMappingURL=pebula-ngrid-target-events.mjs.map
