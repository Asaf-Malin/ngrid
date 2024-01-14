import { fromEvent, timer, ReplaySubject } from 'rxjs';
import { bufferWhen, debounce, map, filter, takeUntil } from 'rxjs/operators';
import { Directive, EventEmitter, Injector } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController, PblColumn } from '@asafmalin/ngrid';
import { matrixRowFromRow, isRowContainer, findCellRenderIndex, findParentCell } from './utils';
import { handleFocusAndSelection } from './focus-and-selection';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export const PLUGIN_KEY = 'targetEvents';
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
export function runOnce() {
    PblColumn.extendProperty('editable');
}
export class PblNgridTargetEventsPlugin {
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
export class PblNgridTargetEventsPluginDirective extends PblNgridTargetEventsPlugin {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWV2ZW50cy1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3RhcmdldC1ldmVudHMvc3JjL2xpYi90YXJnZXQtZXZlbnRzL3RhcmdldC1ldmVudHMtcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFZLGFBQWEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNqRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlFLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFhLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3ZGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7QUFvQmhFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBbUIsY0FBYyxDQUFDO0FBRXpELFNBQVMsWUFBWSxDQUFDLE1BQXNDO0lBQzFELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFhO0lBQ3BDLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBYSxDQUFDLENBQUM7SUFDeEQsSUFBSSxVQUFVLEVBQUU7UUFDZCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUM7S0FDN0M7U0FBTSxJQUFJLGNBQWMsQ0FB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Y2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tRXZlbnQsIHRpbWVyLCBPYnNlcnZlciwgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgYnVmZmVyV2hlbiwgZGVib3VuY2UsIG1hcCwgZmlsdGVyLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgT25EZXN0cm95LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLCBQYmxDb2x1bW4gfSBmcm9tICdAcGVidWxhL25ncmlkJztcblxuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7IG1hdHJpeFJvd0Zyb21Sb3csIGlzUm93Q29udGFpbmVyLCBmaW5kQ2VsbFJlbmRlckluZGV4LCBmaW5kUGFyZW50Q2VsbCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgaGFuZGxlRm9jdXNBbmRTZWxlY3Rpb24gfSBmcm9tICcuL2ZvY3VzLWFuZC1zZWxlY3Rpb24nO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9jb3JlL2xpYi9jb25maWd1cmF0aW9uL3R5cGUnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkQ29uZmlnIHtcbiAgICB0YXJnZXRFdmVudHM/OiB7XG4gICAgICAvKiogV2hlbiBzZXQgdG8gdHJ1ZSB3aWxsIGVuYWJsZSB0aGUgdGFyZ2V0IGV2ZW50cyBwbHVnaW4gb24gYWxsIHRhYmxlIGluc3RhbmNlcyBieSBkZWZhdWx0LiAqL1xuICAgICAgYXV0b0VuYWJsZT86IGJvb2xlYW47XG4gICAgfTtcbiAgfVxufVxuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbiB7XG4gICAgdGFyZ2V0RXZlbnRzPzogUGJsTmdyaWRUYXJnZXRFdmVudHNQbHVnaW47XG4gIH1cbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uRmFjdG9yaWVzIHtcbiAgICB0YXJnZXRFdmVudHM6IGtleW9mIHR5cGVvZiBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUExVR0lOX0tFWTogJ3RhcmdldEV2ZW50cycgPSAndGFyZ2V0RXZlbnRzJztcblxuZnVuY3Rpb24gaGFzTGlzdGVuZXJzKHNvdXJjZTogeyBvYnNlcnZlcnM6IE9ic2VydmVyPGFueT5bXSB9KTogYm9vbGVhbiB7XG4gIHJldHVybiBzb3VyY2Uub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIGZpbmRFdmVudFNvdXJjZShzb3VyY2U6IEV2ZW50KTogeyB0eXBlOiAncm93JyB8ICdjZWxsJywgdGFyZ2V0OiBIVE1MRWxlbWVudCB9IHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgY2VsbFRhcmdldCA9IGZpbmRQYXJlbnRDZWxsKHNvdXJjZS50YXJnZXQgYXMgYW55KTtcbiAgaWYgKGNlbGxUYXJnZXQpIHtcbiAgICByZXR1cm4geyB0eXBlOiAnY2VsbCcsIHRhcmdldDogY2VsbFRhcmdldCB9O1xuICB9IGVsc2UgaWYgKGlzUm93Q29udGFpbmVyKHNvdXJjZS50YXJnZXQgYXMgYW55KSkge1xuICAgIHJldHVybiB7IHR5cGU6ICdjZWxsJywgdGFyZ2V0OiBzb3VyY2UudGFyZ2V0IGFzIGFueSB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5PbmNlKCk6IHZvaWQge1xuICBQYmxDb2x1bW4uZXh0ZW5kUHJvcGVydHkoJ2VkaXRhYmxlJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbjxUID0gYW55PiB7XG4gIHJvd0NsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxFdmVudHMuUGJsTmdyaWRSb3dFdmVudDxUPj4oKTtcbiAgcm93RGJsQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+PigpO1xuICByb3dFbnRlciA9IG5ldyBFdmVudEVtaXR0ZXI8RXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD4+KCk7XG4gIHJvd0xlYXZlID0gbmV3IEV2ZW50RW1pdHRlcjxFdmVudHMuUGJsTmdyaWRSb3dFdmVudDxUPj4oKTtcblxuICBjZWxsQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBNb3VzZUV2ZW50Pj4oKTtcbiAgY2VsbERibENsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VCwgTW91c2VFdmVudD4+KCk7XG4gIGNlbGxFbnRlciA9IG5ldyBFdmVudEVtaXR0ZXI8RXZlbnRzLlBibE5ncmlkQ2VsbEV2ZW50PFQsIE1vdXNlRXZlbnQ+PigpO1xuICBjZWxsTGVhdmUgPSBuZXcgRXZlbnRFbWl0dGVyPEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBNb3VzZUV2ZW50Pj4oKTtcblxuICBtb3VzZURvd24gPSBuZXcgRXZlbnRFbWl0dGVyPEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBNb3VzZUV2ZW50PiB8IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+PigpO1xuICBtb3VzZVVwID0gbmV3IEV2ZW50RW1pdHRlcjxFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VCwgTW91c2VFdmVudD4gfCBFdmVudHMuUGJsTmdyaWRSb3dFdmVudDxUPj4oKTtcbiAga2V5VXAgPSBuZXcgRXZlbnRFbWl0dGVyPEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBLZXlib2FyZEV2ZW50PiB8IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+PigpO1xuICBrZXlEb3duID0gbmV3IEV2ZW50RW1pdHRlcjxFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VCwgS2V5Ym9hcmRFdmVudD4gfCBFdmVudHMuUGJsTmdyaWRSb3dFdmVudDxUPj4oKTtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICBwcml2YXRlIF9yZW1vdmVQbHVnaW46ICh0YWJsZTogUGJsTmdyaWRDb21wb25lbnQ8YW55PikgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PixcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIHBsdWdpbkN0cmw6IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlcikge1xuICAgIHRoaXMuX3JlbW92ZVBsdWdpbiA9IHBsdWdpbkN0cmwuc2V0UGx1Z2luKFBMVUdJTl9LRVksIHRoaXMpO1xuICAgIHBsdWdpbkN0cmwub25Jbml0KCkuc3Vic2NyaWJlKCAoKSA9PiB0aGlzLmluaXQoKSApO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZTxUID0gYW55Pih0YWJsZTogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgaW5qZWN0b3I6IEluamVjdG9yKTogUGJsTmdyaWRUYXJnZXRFdmVudHNQbHVnaW48VD4ge1xuICAgIGNvbnN0IHBsdWdpbkN0cmwgPSBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZCh0YWJsZSk7XG4gICAgcmV0dXJuIG5ldyBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbjxUPih0YWJsZSwgaW5qZWN0b3IsIHBsdWdpbkN0cmwpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0dXBEb21FdmVudHMoKTtcbiAgICBoYW5kbGVGb2N1c0FuZFNlbGVjdGlvbih0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBEb21FdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZDtcbiAgICBjb25zdCBjZGtUYWJsZSA9IHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGU7XG4gICAgY29uc3QgY2RrVGFibGVFbGVtZW50ID0gY2RrVGFibGUuX2VsZW1lbnQ7XG5cbiAgICBjb25zdCBjcmVhdGVDZWxsRXZlbnQgPSA8VEV2ZW50IGV4dGVuZHMgRXZlbnQ+KGNlbGxUYXJnZXQ6IEhUTUxFbGVtZW50LCBzb3VyY2U6IFRFdmVudCk6IEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBURXZlbnQ+IHwgdW5kZWZpbmVkID0+IHtcbiAgICAgIGNvbnN0IHJvd1RhcmdldCA9IGNlbGxUYXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgIGNvbnN0IG1hdHJpeFBvaW50ID0gbWF0cml4Um93RnJvbVJvdyhyb3dUYXJnZXQsIGNka1RhYmxlLl9yb3dPdXRsZXQudmlld0NvbnRhaW5lcik7XG4gICAgICBpZiAobWF0cml4UG9pbnQpIHtcbiAgICAgICAgY29uc3QgZXZlbnQ6IEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBURXZlbnQ+ID0geyAuLi5tYXRyaXhQb2ludCwgc291cmNlLCBjZWxsVGFyZ2V0LCByb3dUYXJnZXQgfSBhcyBhbnk7XG4gICAgICAgIGlmIChtYXRyaXhQb2ludC50eXBlID09PSAnZGF0YScpIHtcbiAgICAgICAgICAoZXZlbnQgYXMgRXZlbnRzLlBibE5ncmlkRGF0YU1hdHJpeFBvaW50PFQ+KS5yb3cgPSBncmlkLmRzLnJlbmRlcmVkRGF0YVttYXRyaXhQb2ludC5yb3dJbmRleF07XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuc3ViVHlwZSA9PT0gJ21ldGEnKSB7XG4gICAgICAgICAgLy8gV2hlbiBtdWx0aXBsZSBjb250YWluZXJzIGV4aXN0cyAoZml4ZWQvc3RpY2t5L3JvdykgdGhlIHJvd0luZGV4IHdlIGdldCBpcyB0aGUgb25lIHJlbGF0aXZlIHRvIHRoZSBjb250YWluZXIuLlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZmluZCB0aGUgcm93SW5kZXggcmVsYXRpdmUgdG8gdGhlIGRlZmluaXRpb25zOlxuICAgICAgICAgIGNvbnN0IHsgbWV0YVJvd1NlcnZpY2UgfSA9IHRoaXMucGx1Z2luQ3RybC5leHRBcGkucm93c0FwaTtcbiAgICAgICAgICBjb25zdCBkYiA9IGV2ZW50LnR5cGUgPT09ICdoZWFkZXInID8gbWV0YVJvd1NlcnZpY2UuaGVhZGVyIDogbWV0YVJvd1NlcnZpY2UuZm9vdGVyO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBjb2xsIG9mIFtkYi5maXhlZCwgZGIucm93LCBkYi5zdGlja3ldKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb2xsLmZpbmQoIGl0ZW0gPT4gaXRlbS5lbCA9PT0gZXZlbnQucm93VGFyZ2V0ICk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIGV2ZW50LnJvd0luZGV4ID0gcmVzdWx0LmluZGV4O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBgbWV0YWRhdGFGcm9tRWxlbWVudCgpYCBkb2VzIG5vdCBwcm92aWRlIGNvbHVtbiBpbmZvcm1hdGlvbiBub3IgdGhlIGNvbHVtbiBpdHNlbGYuIFRoaXMgd2lsbCBleHRlbmQgZnVuY3Rpb25hbGl0eSB0byBhZGQgdGhlIGNvbHVtbkluZGV4IGFuZCBjb2x1bW4uXG4gICAgICAgICAgICBUaGUgc2ltcGxlIGNhc2UgaXMgd2hlbiBgc3ViVHlwZSA9PT0gJ2RhdGEnYCwgaW4gdGhpcyBjYXNlIHRoZSBjb2x1bW4gaXMgYWx3YXlzIHRoZSBkYXRhIGNvbHVtbiBmb3IgYWxsIHR5cGVzIChoZWFkZXIsIGRhdGEgYW5kIGZvb3RlcilcblxuICAgICAgICAgICAgSWYgYHN1YlR5cGUgIT09ICdkYXRhJ2Agd2UgbmVlZCB0byBnZXQgdGhlIHByb3BlciBjb2x1bW4gYmFzZWQgdHlwZSAodHlwZSBjYW4gb25seSBiZSBgaGVhZGVyYCBvciBgZm9vdGVyYCBhdCB0aGlzIHBvaW50KS5cbiAgICAgICAgICAgIEJ1dCB0aGF0J3Mgbm90IGFsbCwgYmVjYXVzZSBgbWV0YWRhdGFGcm9tRWxlbWVudCgpYCBkb2VzIG5vdCBoYW5kbGUgYG1ldGEtZ3JvdXBgIHN1YlR5cGUgd2UgbmVlZCB0byBkbyBpdCBoZXJlLi4uXG4gICAgICAgICovXG4gICAgICAgIGV2ZW50LmNvbEluZGV4ID0gZmluZENlbGxSZW5kZXJJbmRleChjZWxsVGFyZ2V0KTtcbiAgICAgICAgaWYgKG1hdHJpeFBvaW50LnN1YlR5cGUgPT09ICdkYXRhJykge1xuICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMuZ3JpZC5jb2x1bW5BcGkuZmluZENvbHVtbkF0KGV2ZW50LmNvbEluZGV4KTtcbiAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IHRoaXMuZ3JpZC5jb2x1bW5BcGkuaW5kZXhPZihjb2x1bW4pO1xuICAgICAgICAgIGV2ZW50LmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgICAgICAoZXZlbnQgYXMgRXZlbnRzLlBibE5ncmlkRGF0YU1hdHJpeFBvaW50PFQ+KS5jb250ZXh0ID0gdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jb250ZXh0QXBpLmdldENlbGwoZXZlbnQucm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBpZiAoIShldmVudCBhcyBFdmVudHMuUGJsTmdyaWREYXRhTWF0cml4UG9pbnQ8VD4pLmNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY29udGV4dEFwaS5jbGVhcih0cnVlKTtcbiAgICAgICAgICAgIChldmVudCBhcyBFdmVudHMuUGJsTmdyaWREYXRhTWF0cml4UG9pbnQ8VD4pLmNvbnRleHQgPSB0aGlzLnBsdWdpbkN0cmwuZXh0QXBpLmNvbnRleHRBcGkuZ2V0Q2VsbChldmVudC5yb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdG9yZSA9IHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY29sdW1uU3RvcmU7XG4gICAgICAgICAgY29uc3Qgcm93SW5mbyA9IChtYXRyaXhQb2ludC50eXBlID09PSAnaGVhZGVyJyA/IHN0b3JlLm1ldGFIZWFkZXJSb3dzIDogc3RvcmUubWV0YUZvb3RlclJvd3MpW2V2ZW50LnJvd0luZGV4XTtcbiAgICAgICAgICBjb25zdCByZWNvcmQgPSBzdG9yZS5maW5kKHJvd0luZm8ua2V5c1tldmVudC5jb2xJbmRleF0pO1xuICAgICAgICAgIGlmIChyb3dJbmZvLmlzR3JvdXApIHtcbiAgICAgICAgICAgIGV2ZW50LnN1YlR5cGUgPSAnbWV0YS1ncm91cCc7XG4gICAgICAgICAgICBldmVudC5jb2x1bW4gPSBtYXRyaXhQb2ludC50eXBlID09PSAnaGVhZGVyJyA/IHJlY29yZC5oZWFkZXJHcm91cCA6IHJlY29yZC5mb290ZXJHcm91cDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQuY29sdW1uID0gbWF0cml4UG9pbnQudHlwZSA9PT0gJ2hlYWRlcicgPyByZWNvcmQuaGVhZGVyIDogcmVjb3JkLmZvb3RlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZVJvd0V2ZW50ID0gPFRFdmVudCBleHRlbmRzIEV2ZW50Pihyb3dUYXJnZXQ6IEhUTUxFbGVtZW50LCBzb3VyY2U6IFRFdmVudCwgcm9vdD86IEV2ZW50cy5QYmxOZ3JpZENlbGxFdmVudDxULCBURXZlbnQ+KTogRXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD4gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgY29uc3QgZXZlbnQ6IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+ID0ge1xuICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICByb3dUYXJnZXQsXG4gICAgICAgICAgdHlwZTogcm9vdC50eXBlLFxuICAgICAgICAgIHN1YlR5cGU6IHJvb3Quc3ViVHlwZSxcbiAgICAgICAgICByb3dJbmRleDogcm9vdC5yb3dJbmRleCxcbiAgICAgICAgICByb290XG4gICAgICAgIH0gYXMgYW55O1xuICAgICAgICBpZiAocm9vdC50eXBlID09PSAnZGF0YScpIHtcbiAgICAgICAgICAoZXZlbnQgYXMgRXZlbnRzLlBibE5ncmlkRGF0YU1hdHJpeFJvdzxUPikucm93ID0gcm9vdC5yb3c7XG4gICAgICAgICAgKGV2ZW50IGFzIEV2ZW50cy5QYmxOZ3JpZERhdGFNYXRyaXhSb3c8VD4pLmNvbnRleHQgPSByb290LmNvbnRleHQucm93Q29udGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtYXRyaXhQb2ludCA9IG1hdHJpeFJvd0Zyb21Sb3cocm93VGFyZ2V0LCBjZGtUYWJsZS5fcm93T3V0bGV0LnZpZXdDb250YWluZXIpO1xuICAgICAgICBpZiAobWF0cml4UG9pbnQpIHtcbiAgICAgICAgICBjb25zdCBldmVudDogRXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD4gPSB7IC4uLm1hdHJpeFBvaW50LCBzb3VyY2UsIHJvd1RhcmdldCB9IGFzIGFueTtcbiAgICAgICAgICBpZiAobWF0cml4UG9pbnQudHlwZSA9PT0gJ2RhdGEnKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLnBsdWdpbkN0cmwuZXh0QXBpLmNvbnRleHRBcGkuZ2V0Um93KG1hdHJpeFBvaW50LnJvd0luZGV4KTtcbiAgICAgICAgICAgIGlmICghcm93KSB7XG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAoZXZlbnQgYXMgRXZlbnRzLlBibE5ncmlkRGF0YU1hdHJpeFJvdzxUPikuY29udGV4dCA9IHJvdztcbiAgICAgICAgICAgIChldmVudCBhcyBFdmVudHMuUGJsTmdyaWREYXRhTWF0cml4Um93PFQ+KS5yb3cgPSByb3cuJGltcGxpY2l0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qICBJZiBgc3ViVHlwZSAhPT0gJ2RhdGEnYCBpdCBjYW4gb25seSBiZSBgbWV0YWAgYmVjYXVzZSBgbWV0YWRhdGFGcm9tRWxlbWVudCgpYCBkb2VzIG5vdCBoYW5kbGUgYG1ldGEtZ3JvdXBgIHN1YlR5cGUuXG4gICAgICAgICAgICAgIFdlIG5lZWQgdG8gZXh0ZW5kIHRoaXMgbWlzc2luZyBwYXJ0LCB3ZSBkb24ndCBoYXZlIGNvbHVtbnMgaGVyZSBzbyB3ZSB3aWxsIHRyeSB0byBpbmZlciBpdCB1c2luZyB0aGUgZmlyc3QgY29sdW1uLlxuXG4gICAgICAgICAgICAgIEl0J3Mgc2ltaWxhciB0byBob3cgaXQncyBoYW5kbGVkIGluIGNlbGwgY2xpY2tzLCBidXQgaGVyZSB3ZSBkb24ndCBuZWVkIHRvIGV4dGVuZHMgdGhlIGNvbHVtbiBpbmZvLlxuICAgICAgICAgICAgICBXZSBvbmx5IG5lZWQgdG8gY2hhbmdlIHRoZSBgc3ViVHlwZWAgd2hlbiB0aGUgcm93IGlzIGEgZ3JvdXAgcm93LCBnZXR0aW5nIGEgc3BlY2lmaWMgY29sdW1uIGlzIGlycmVsZXZhbnQuXG4gICAgICAgICAgICAgIFdlIGp1c3QgbmVlZCBBIGNvbHVtbiBiZWNhdXNlIGdyb3VwIGNvbHVtbnMgZG9uJ3QgbWl4IHdpdGggcmVndWxhciBtZXRhIGNvbHVtbnMuXG5cbiAgICAgICAgICAgICAgTk9URTogV2hlbiBzdWJUeXBlIGlzIG5vdCAnZGF0YScgdGhlIHlwZSBjYW4gb25seSBiZSBgaGVhZGVyYCBvciBgZm9vdGVyYC5cbiAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChtYXRyaXhQb2ludC5zdWJUeXBlICE9PSAnZGF0YScpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jb2x1bW5TdG9yZTtcblxuICAgICAgICAgICAgY29uc3Qgcm93SW5mbyA9IChtYXRyaXhQb2ludC50eXBlID09PSAnaGVhZGVyJyA/IHN0b3JlLm1ldGFIZWFkZXJSb3dzIDogc3RvcmUubWV0YUZvb3RlclJvd3MpW2V2ZW50LnJvd0luZGV4XTtcbiAgICAgICAgICAgIGlmIChyb3dJbmZvLmlzR3JvdXApIHtcbiAgICAgICAgICAgICAgZXZlbnQuc3ViVHlwZSA9ICdtZXRhLWdyb3VwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RDZWxsRW50ZXJFdmVudDogRXZlbnRzLlBibE5ncmlkQ2VsbEV2ZW50PFQsIE1vdXNlRXZlbnQ+O1xuICAgIGxldCBsYXN0Um93RW50ZXJFdmVudDogRXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD47XG4gICAgY29uc3QgZW1pdENlbGxMZWF2ZSA9IChzb3VyY2U6IE1vdXNlRXZlbnQpOiBFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VD4gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgaWYgKGxhc3RDZWxsRW50ZXJFdmVudCkge1xuICAgICAgICBjb25zdCBsYXN0Q2VsbEVudGVyRXZlbnRUZW1wID0gbGFzdENlbGxFbnRlckV2ZW50O1xuICAgICAgICB0aGlzLmNlbGxMZWF2ZS5lbWl0KE9iamVjdC5hc3NpZ24oe30sIGxhc3RDZWxsRW50ZXJFdmVudFRlbXAsIHsgc291cmNlIH0pKTtcbiAgICAgICAgbGFzdENlbGxFbnRlckV2ZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gbGFzdENlbGxFbnRlckV2ZW50VGVtcDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZW1pdFJvd0xlYXZlID0gKHNvdXJjZTogTW91c2VFdmVudCk6IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+IHwgdW5kZWZpbmVkID0+IHtcbiAgICAgIGlmIChsYXN0Um93RW50ZXJFdmVudCkge1xuICAgICAgICBjb25zdCBsYXN0Um93RW50ZXJFdmVudFRlbXAgPSBsYXN0Um93RW50ZXJFdmVudDtcbiAgICAgICAgdGhpcy5yb3dMZWF2ZS5lbWl0KE9iamVjdC5hc3NpZ24oe30sIGxhc3RSb3dFbnRlckV2ZW50VGVtcCwgeyBzb3VyY2UgfSkpO1xuICAgICAgICBsYXN0Um93RW50ZXJFdmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGxhc3RSb3dFbnRlckV2ZW50VGVtcDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcm9jZXNzRXZlbnQgPSA8VEV2ZW50IGV4dGVuZHMgRXZlbnQ+KGU6IFRFdmVudCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZmluZEV2ZW50U291cmNlKGUpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBpZiAocmVzdWx0LnR5cGUgPT09ICdjZWxsJykge1xuICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3JlYXRlQ2VsbEV2ZW50PFRFdmVudD4ocmVzdWx0LnRhcmdldCwgZSk7XG4gICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB0eXBlOiByZXN1bHQudHlwZSxcbiAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgIHdhaXRUaW1lOiBoYXNMaXN0ZW5lcnModGhpcy5jZWxsRGJsQ2xpY2spID8gMjUwIDogMSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdC50eXBlID09PSAncm93Jykge1xuICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3JlYXRlUm93RXZlbnQocmVzdWx0LnRhcmdldCwgZSk7XG4gICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB0eXBlOiByZXN1bHQudHlwZSxcbiAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgIHdhaXRUaW1lOiBoYXNMaXN0ZW5lcnModGhpcy5yb3dEYmxDbGljaykgPyAyNTAgOiAxLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqIFNwbGl0IHRoZSByZXN1bHQgb2YgcHJvY2Vzc0V2ZW50IGludG8gY2VsbCBhbmQgcm93IGV2ZW50cywgaWYgdHlwZSBpcyByb3cgb25seSByb3cgZXZlbnQgaXMgcmV0dXJuZWQsIGlmIGNlbGwgdGhlbiBjZWxsIGlzIHJldHVybmVkIGFuZCByb3cgaXMgY3JlYXRlZCBhbG9uZyBzaWRlLiAqL1xuICAgIGNvbnN0IHNwbGl0UHJvY2Vzc2VkRXZlbnQgPSA8VEV2ZW50IGV4dGVuZHMgRXZlbnQ+KGV2ZW50OiBSZXR1cm5UeXBlPHR5cGVvZiBwcm9jZXNzRXZlbnQ+KSA9PiB7XG4gICAgICBjb25zdCBjZWxsRXZlbnQgPSBldmVudC50eXBlID09PSAnY2VsbCcgPyBldmVudC5ldmVudCBhcyBFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VCwgVEV2ZW50PiA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHJvd0V2ZW50ID0gY2VsbEV2ZW50XG4gICAgICAgID8gY3JlYXRlUm93RXZlbnQ8VEV2ZW50PihjZWxsRXZlbnQucm93VGFyZ2V0LCBjZWxsRXZlbnQuc291cmNlLCBjZWxsRXZlbnQpXG4gICAgICAgIDogZXZlbnQuZXZlbnQgYXMgRXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD5cbiAgICAgIDtcbiAgICAgIHJldHVybiB7IGNlbGxFdmVudCwgcm93RXZlbnQgfTtcbiAgICB9O1xuXG4gICAgY29uc3QgcmVnaXN0ZXJVcERvd25FdmVudHMgPSA8VEV2ZW50IGV4dGVuZHMgRXZlbnQ+KGV2ZW50TmFtZTogc3RyaW5nLCBlbWl0dGVyOiBFdmVudEVtaXR0ZXI8RXZlbnRzLlBibE5ncmlkQ2VsbEV2ZW50PFQsIFRFdmVudD4gfCBFdmVudHMuUGJsTmdyaWRSb3dFdmVudDxUPj4pID0+IHtcbiAgICAgIGZyb21FdmVudChjZGtUYWJsZUVsZW1lbnQsIGV2ZW50TmFtZSlcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICBmaWx0ZXIoIHNvdXJjZSA9PiBoYXNMaXN0ZW5lcnMoZW1pdHRlcikgKSxcbiAgICAgICAgICBtYXAocHJvY2Vzc0V2ZW50KSxcbiAgICAgICAgICBmaWx0ZXIoIHJlc3VsdCA9PiAhIXJlc3VsdCApLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoIHJlc3VsdCA9PiB7XG4gICAgICAgICAgY29uc3QgeyBjZWxsRXZlbnQsIHJvd0V2ZW50IH0gPSBzcGxpdFByb2Nlc3NlZEV2ZW50PFRFdmVudD4ocmVzdWx0KTtcbiAgICAgICAgICBlbWl0dGVyLmVtaXQoY2VsbEV2ZW50IHx8IHJvd0V2ZW50KTtcbiAgICAgICAgICB0aGlzLnN5bmNSb3coY2VsbEV2ZW50IHx8IHJvd0V2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJVcERvd25FdmVudHM8TW91c2VFdmVudD4oJ21vdXNldXAnLCB0aGlzLm1vdXNlVXApO1xuICAgIHJlZ2lzdGVyVXBEb3duRXZlbnRzPE1vdXNlRXZlbnQ+KCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93bik7XG4gICAgcmVnaXN0ZXJVcERvd25FdmVudHM8S2V5Ym9hcmRFdmVudD4oJ2tleXVwJywgdGhpcy5rZXlVcCk7XG4gICAgcmVnaXN0ZXJVcERvd25FdmVudHM8S2V5Ym9hcmRFdmVudD4oJ2tleWRvd24nLCB0aGlzLmtleURvd24pO1xuXG4gICAgLypcbiAgICAgIEhhbmRsaW5nIGNsaWNrIHN0cmVhbSBmb3IgYm90aCBjbGljayBhbmQgZG91YmxlIGNsaWNrIGV2ZW50cy5cbiAgICAgIFdlIHdhbnQgdG8gZGV0ZWN0IGRvdWJsZSBjbGlja3MgYW5kIGNsaWNrcyB3aXRoIG1pbmltYWwgZGVsYXlzXG4gICAgICBXZSBjaGVjayBpZiBhIGRvdWJsZSBjbGljayBoYXMgbGlzdGVuZXJzLCBpZiBub3Qgd2Ugd29uJ3QgZGVsYXkgdGhlIGNsaWNrLi4uXG4gICAgICBUT0RPOiBvbiBkb3VibGUgY2xpY2ssIGRvbid0IHdhaXQgdGhlIHdob2xlIDI1MCBtcyBpZiAyIGNsaWNrcyBoYXBwZW4uXG4gICAgKi9cbiAgICBjb25zdCBjbGlja1N0cmVhbSA9IGZyb21FdmVudChjZGtUYWJsZUVsZW1lbnQsICdjbGljaycpLnBpcGUoXG4gICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgZmlsdGVyKCBzb3VyY2UgPT4gaGFzTGlzdGVuZXJzKHRoaXMuY2VsbENsaWNrKSB8fCBoYXNMaXN0ZW5lcnModGhpcy5jZWxsRGJsQ2xpY2spIHx8IGhhc0xpc3RlbmVycyh0aGlzLnJvd0NsaWNrKSB8fCBoYXNMaXN0ZW5lcnModGhpcy5yb3dEYmxDbGljaykgKSxcbiAgICAgIG1hcChwcm9jZXNzRXZlbnQpLFxuICAgICAgZmlsdGVyKCByZXN1bHQgPT4gISFyZXN1bHQgKSxcbiAgICApO1xuXG4gICAgY2xpY2tTdHJlYW1cbiAgICAgIC5waXBlKFxuICAgICAgICBidWZmZXJXaGVuKCAoKSA9PiBjbGlja1N0cmVhbS5waXBlKCBkZWJvdW5jZSggZSA9PiB0aW1lcihlLndhaXRUaW1lKSApICkgKSxcbiAgICAgICAgZmlsdGVyKCBldmVudHMgPT4gZXZlbnRzLmxlbmd0aCA+IDAgKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50cyA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IGlzRG91YmxlQ2xpY2sgPSBldmVudHMubGVuZ3RoID09PSAxOyAvLyBpZiB3ZSBoYXZlIDIgZXZlbnRzIGl0cyBkb3VibGUgY2xpY2ssIG90aGVyd2lzZSBzaW5nbGUuXG4gICAgICAgIGNvbnN0IHsgY2VsbEV2ZW50LCByb3dFdmVudCB9ID0gc3BsaXRQcm9jZXNzZWRFdmVudDxNb3VzZUV2ZW50PihldmVudCk7XG4gICAgICAgIGlmIChpc0RvdWJsZUNsaWNrKSB7XG4gICAgICAgICAgaWYgKGNlbGxFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5jZWxsRGJsQ2xpY2suZW1pdChjZWxsRXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJvd0RibENsaWNrLmVtaXQocm93RXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjZWxsRXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY2VsbENsaWNrLmVtaXQoY2VsbEV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yb3dDbGljay5lbWl0KHJvd0V2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN5bmNSb3coY2VsbEV2ZW50IHx8IHJvd0V2ZW50KTtcbiAgICAgIH0pO1xuXG5cbiAgICBmcm9tRXZlbnQoY2RrVGFibGVFbGVtZW50LCAnbW91c2VsZWF2ZScpXG4gICAgICAucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoIChzb3VyY2U6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGxhc3RFdmVudDogRXZlbnRzLlBibE5ncmlkUm93RXZlbnQ8VD4gfCBFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VD4gPSBlbWl0Q2VsbExlYXZlKHNvdXJjZSk7XG4gICAgICAgIGxhc3RFdmVudCA9IGVtaXRSb3dMZWF2ZShzb3VyY2UpIHx8IGxhc3RFdmVudDtcbiAgICAgICAgaWYgKGxhc3RFdmVudCkge1xuICAgICAgICAgIHRoaXMuc3luY1JvdyhsYXN0RXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGZyb21FdmVudChjZGtUYWJsZUVsZW1lbnQsICdtb3VzZW1vdmUnKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCAoc291cmNlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGNlbGxUYXJnZXQ6IEhUTUxFbGVtZW50ID0gZmluZFBhcmVudENlbGwoc291cmNlLnRhcmdldCBhcyBhbnkpO1xuICAgICAgICBjb25zdCBsYXN0Q2VsbFRhcmdldCA9IGxhc3RDZWxsRW50ZXJFdmVudCAmJiBsYXN0Q2VsbEVudGVyRXZlbnQuY2VsbFRhcmdldDtcbiAgICAgICAgY29uc3QgbGFzdFJvd1RhcmdldCA9IGxhc3RSb3dFbnRlckV2ZW50ICYmIGxhc3RSb3dFbnRlckV2ZW50LnJvd1RhcmdldDtcblxuICAgICAgICBsZXQgY2VsbEV2ZW50OiBFdmVudHMuUGJsTmdyaWRDZWxsRXZlbnQ8VCwgTW91c2VFdmVudD47XG4gICAgICAgIGxldCBsYXN0RXZlbnQ6IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+IHwgRXZlbnRzLlBibE5ncmlkQ2VsbEV2ZW50PFQ+O1xuXG4gICAgICAgIGlmIChsYXN0Q2VsbFRhcmdldCAhPT0gY2VsbFRhcmdldCkge1xuICAgICAgICAgIGxhc3RFdmVudCA9IGVtaXRDZWxsTGVhdmUoc291cmNlKSB8fCBsYXN0RXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2VsbFRhcmdldCkge1xuICAgICAgICAgIGlmIChsYXN0Q2VsbFRhcmdldCAhPT0gY2VsbFRhcmdldCkge1xuICAgICAgICAgICAgY2VsbEV2ZW50ID0gY3JlYXRlQ2VsbEV2ZW50KGNlbGxUYXJnZXQsIHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY2VsbEV2ZW50KSB7XG4gICAgICAgICAgICAgIHRoaXMuY2VsbEVudGVyLmVtaXQobGFzdENlbGxFbnRlckV2ZW50ID0gY2VsbEV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvd1RhcmdldCA9IChjZWxsRXZlbnQgJiYgY2VsbEV2ZW50LnJvd1RhcmdldCkgfHwgKGlzUm93Q29udGFpbmVyKHNvdXJjZS50YXJnZXQgYXMgYW55KSAmJiBzb3VyY2UudGFyZ2V0IGFzIGFueSk7XG5cbiAgICAgICAgaWYgKGxhc3RSb3dUYXJnZXQgIT09IHJvd1RhcmdldCkge1xuICAgICAgICAgIGxhc3RFdmVudCA9IGVtaXRSb3dMZWF2ZShzb3VyY2UpIHx8IGxhc3RFdmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3dUYXJnZXQpIHtcbiAgICAgICAgICBpZiAobGFzdFJvd1RhcmdldCAhPT0gcm93VGFyZ2V0KSB7XG4gICAgICAgICAgICBjb25zdCByb3dFdmVudCA9IGNyZWF0ZVJvd0V2ZW50KHJvd1RhcmdldCwgc291cmNlLCBjZWxsRXZlbnQpO1xuICAgICAgICAgICAgaWYgKHJvd0V2ZW50KSB7XG4gICAgICAgICAgICAgIHRoaXMucm93RW50ZXIuZW1pdChsYXN0Um93RW50ZXJFdmVudCA9IHJvd0V2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdEV2ZW50KSB7XG4gICAgICAgICAgdGhpcy5zeW5jUm93KGxhc3RFdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4odGhpcy5ncmlkKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY1JvdzxURXZlbnQgZXh0ZW5kcyBFdmVudD4oZXZlbnQ6IEV2ZW50cy5QYmxOZ3JpZFJvd0V2ZW50PFQ+IHwgRXZlbnRzLlBibE5ncmlkQ2VsbEV2ZW50PFQsIFRFdmVudD4pOiB2b2lkIHtcbiAgICB0aGlzLmdyaWQucm93c0FwaS5zeW5jUm93cyhldmVudC50eXBlLCBldmVudC5yb3dJbmRleCk7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkaXJlY3RpdmUtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbdGFyZ2V0RXZlbnRzXSwgcGJsLW5ncmlkW21vdXNlRG93bl0sIHBibC1uZ3JpZFttb3VzZVVwXSwgcGJsLW5ncmlkW3Jvd0NsaWNrXSwgcGJsLW5ncmlkW3Jvd0RibENsaWNrXSwgcGJsLW5ncmlkW3Jvd0VudGVyXSwgcGJsLW5ncmlkW3Jvd0xlYXZlXSwgcGJsLW5ncmlkW2NlbGxDbGlja10sIHBibC1uZ3JpZFtjZWxsRGJsQ2xpY2tdLCBwYmwtbmdyaWRbY2VsbEVudGVyXSwgcGJsLW5ncmlkW2NlbGxMZWF2ZV0sIHBibC1uZ3JpZFtrZXlEb3duXSwgcGJsLW5ncmlkW2tleVVwXScsXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp1c2Utb3V0cHV0LXByb3BlcnR5LWRlY29yYXRvclxuICBvdXRwdXRzOiBbICdtb3VzZURvd24nLCAnbW91c2VVcCcsICdyb3dDbGljaycsICdyb3dEYmxDbGljaycsICdyb3dFbnRlcicsICdyb3dMZWF2ZScsICdjZWxsQ2xpY2snLCAnY2VsbERibENsaWNrJywgJ2NlbGxFbnRlcicsICdjZWxsTGVhdmUnLCAna2V5RG93bicsICdrZXlVcCcgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbkRpcmVjdGl2ZTxUPiBleHRlbmRzIFBibE5ncmlkVGFyZ2V0RXZlbnRzUGx1Z2luPFQ+IGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICBjb25zdHJ1Y3Rvcih0YWJsZTogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgaW5qZWN0b3I6IEluamVjdG9yLCBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcih0YWJsZSwgaW5qZWN0b3IsIHBsdWdpbkN0cmwpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxufVxuIl19