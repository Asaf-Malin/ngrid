import * as i0 from '@angular/core';
import { EventEmitter, Injectable, Inject, ElementRef, Directive, Optional, SkipSelf, Input, Output, Component, ChangeDetectionStrategy, ViewEncapsulation, HostListener, NgModule } from '@angular/core';
import * as i4 from '@angular/cdk/bidi';
import * as i1 from '@angular/cdk/scrolling';
import * as i2 from '@angular/cdk/drag-drop';
import { DropListRef, DragRef, CdkDropList, CDK_DROP_LIST_GROUP, CDK_DRAG_CONFIG, DragDrop, CDK_DROP_LIST, CdkDrag, CdkDragHandle, CDK_DRAG_PARENT, CDK_DRAG_HANDLE, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import * as i1$1 from '@asafmalin/ngrid';
import { PblNgridPluginController, isPblColumn, PblColumn, PblColumnGroup, PblNgridMultiTemplateRegistry, ngridPlugin, provideCommon, PblNgridModule } from '@asafmalin/ngrid';
import { Subject, BehaviorSubject, Subscription, animationFrameScheduler } from 'rxjs';
import { coerceElement, coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT, CommonModule } from '@angular/common';
import { take, takeUntil, auditTime } from 'rxjs/operators';
import { unrx } from '@asafmalin/ngrid/core';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';

class PblDropListRef extends DropListRef {
    constructor() {
        super(...arguments);
        /** Emits right before dragging has started. */
        this.beforeExit = new Subject();
    }
    withElement(element) {
        // TODO: Workaround, see if we can push this through https://github.com/angular/material2/issues/15086
        this.element = coerceElement(element);
        this.withScrollableParents([this.element]);
        return this;
    }
    dispose() {
        this.beforeExit.complete();
        super.dispose();
    }
}

class PblDragRef extends DragRef {
    constructor(...args) {
        super(...args);
        /**
         * Fires when the root element changes
         *
         * > Does not emit on the initial setup.
         */
        this.rootElementChanged = new EventEmitter();
        this.exited.subscribe(e => {
            const { container } = e;
            if (container instanceof PblDropListRef) {
                container.beforeExit.next({ item: this });
            }
        });
    }
    /**
     * Sets an alternate drag root element. The root element is the element that will be moved as
     * the user is dragging. Passing an alternate root element is useful when trying to enable
     * dragging on an element that you might not have access to.
     */
    withRootElement(rootElement) {
        // the first call to `withRootElement` comes from the base class, before we construct the emitter.
        // We don't need it anyway...
        if (this.rootElementChanged) {
            const element = coerceElement(rootElement);
            if (this.getRootElement() !== element) {
                this.rootElementChanged.next({ prev: this.getRootElement(), curr: element });
            }
        }
        return super.withRootElement(rootElement);
    }
    dispose() {
        this.rootElementChanged.complete();
        super.dispose();
    }
}

/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
    dragStartThreshold: 5,
    pointerDirectionChangeThreshold: 5
};
/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
class PblDragDrop {
    constructor(_document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
    }
    /**
     * Turns an element into a draggable item.
     * @param element Element to which to attach the dragging functionality.
     * @param config Object used to configure the dragging behavior.
     */
    createDrag(element, config = DEFAULT_CONFIG) {
        return new PblDragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry);
    }
    /**
     * Turns an element into a drop list.
     * @param element Element to which to attach the drop list functionality.
     */
    createDropList(element) {
        return new PblDropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
    }
}
/** @nocollapse */ PblDragDrop.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, deps: [{ token: DOCUMENT }, { token: i0.NgZone }, { token: i1.ViewportRuler }, { token: i2.DragDropRegistry }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblDragDrop.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragDrop, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone }, { type: i1.ViewportRuler }, { type: i2.DragDropRegistry }]; } });

class CdkLazyDropList extends CdkDropList {
    constructor(grid, element, dragDrop, changeDetectorRef, _scrollDispatcher, dir, group, config) {
        super(element, dragDrop, changeDetectorRef, _scrollDispatcher, dir, group, config);
        if (!(this.pblDropListRef instanceof PblDropListRef)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid `DropListRef` injection, the ref is not an instance of PblDropListRef');
            }
            return;
        }
        // This is a workaround for https://github.com/angular/material2/pull/14153
        // Working around the missing capability for selecting a container element that is not the drop container host.
        this.originalElement = element;
        if (grid) {
            this.updateGrid(grid);
        }
        this.initDropListRef();
    }
    get pblDropListRef() { return this._dropListRef; }
    get grid() { return this._gridApi?.grid; }
    set grid(value) { this.updateGrid(value); }
    get dir() { return this._gridApi?.getDirection(); }
    get gridApi() { return this._gridApi; }
    ngOnInit() {
        this._dropListRef.beforeStarted.subscribe(() => this.beforeStarted());
    }
    addDrag(drag) {
        this.addItem(drag);
    }
    removeDrag(drag) {
        this.removeItem(drag);
    }
    /**
     * A chance for inheriting implementations to change/modify the drop list ref instance
     *
     * We can't do this via a DragDrop service replacement as we might have multiple drop-lists on the same
     * element which mean they must share the same DragDrop factory...
     */
    initDropListRef() { }
    beforeStarted() {
        if (this.directContainerElement) {
            const element = this.originalElement.nativeElement.querySelector(this.directContainerElement);
            this.element = new ElementRef(element);
        }
        else {
            this.element = this.originalElement;
        }
        this.pblDropListRef.withElement(this.element);
        if (this.dir) {
            this.pblDropListRef.withDirection(this.dir);
        }
    }
    gridChanged(prev) { }
    updateGrid(grid) {
        if (grid !== this.grid) {
            const prev = this._gridApi;
            this._gridApi = grid ? PblNgridPluginController.find(grid).extApi : undefined;
            this.gridChanged(prev);
        }
    }
}
/** @nocollapse */ CdkLazyDropList.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDropList, deps: [{ token: i1$1.PblNgridComponent, optional: true }, { token: i0.ElementRef }, { token: i2.DragDrop }, { token: i0.ChangeDetectorRef }, { token: i1.ScrollDispatcher }, { token: i4.Directionality, optional: true }, { token: CDK_DROP_LIST_GROUP, optional: true, skipSelf: true }, { token: CDK_DRAG_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ CdkLazyDropList.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: CdkLazyDropList, selector: "[cdkLazyDropList]", inputs: { directContainerElement: ["cdkDropListDirectContainerElement", "directContainerElement"] }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useClass: CdkLazyDropList },
    ], exportAs: ["cdkLazyDropList"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDropList, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkLazyDropList]',
                    exportAs: 'cdkLazyDropList',
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useClass: CdkLazyDropList },
                    ],
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    }
                }]
        }], ctorParameters: function () { return [{ type: i1$1.PblNgridComponent, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.DragDrop }, { type: i0.ChangeDetectorRef }, { type: i1.ScrollDispatcher }, { type: i4.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.CdkDropListGroup, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DROP_LIST_GROUP]
                }, {
                    type: SkipSelf
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }]; }, propDecorators: { directContainerElement: [{
                type: Input,
                args: ['cdkDropListDirectContainerElement']
            }] } });

class CdkLazyDrag extends CdkDrag {
    constructor() {
        super(...arguments);
        this._hostNotRoot = false;
    }
    /**
     * A class to set when the root element is not the host element. (i.e. when `cdkDragRootElement` is used).
     */
    set rootElementSelectorClass(value) {
        if (value !== this._rootClass && this._hostNotRoot) {
            if (this._rootClass) {
                this.getRootElement().classList.remove(...this._rootClass.split(' '));
            }
            if (value) {
                this.getRootElement().classList.add(...value.split(' '));
            }
        }
        this._rootClass = value;
    }
    get pblDragRef() { return this._dragRef; }
    get cdkDropList() { return this.dropContainer; }
    set cdkDropList(dropList) {
        // TO SUPPORT `cdkDropList` via string input (ID) we need a reactive registry...
        const prev = this.cdkDropList;
        if (dropList !== prev) {
            if (prev) {
                prev.removeDrag(this);
            }
            this.dropContainer = dropList;
            if (dropList) {
                this._dragRef._withDropContainer(dropList.pblDropListRef);
                this._dragRef.beforeStarted.subscribe(() => {
                    if (dropList.dir) {
                        this._dragRef.withDirection(dropList.dir);
                    }
                });
                dropList.addDrag(this);
            }
            this.dropContainerChanged(prev);
        }
    }
    ngOnInit() {
        if (!(this.pblDragRef instanceof PblDragRef)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid `DragRef` injection, the ref is not an instance of PblDragRef');
            }
            return;
        }
        this.pblDragRef.rootElementChanged.subscribe(event => {
            const rootElementSelectorClass = this._rootClass;
            const hostNotRoot = this.element.nativeElement !== event.curr;
            if (rootElementSelectorClass) {
                if (this._hostNotRoot) {
                    event.prev.classList.remove(...rootElementSelectorClass.split(' '));
                }
                if (hostNotRoot) {
                    event.curr.classList.add(...rootElementSelectorClass.split(' '));
                }
            }
            this._hostNotRoot = hostNotRoot;
        });
    }
    // This is a workaround for https://github.com/angular/material2/pull/14158
    // Working around the issue of drop container is not the direct parent (father) of a drag item.
    // The entire ngAfterViewInit() overriding method can be removed if PR accepted.
    ngAfterViewInit() {
        this.started.subscribe(startedEvent => {
            if (this.dropContainer) {
                const element = this.getRootElement();
                const initialRootElementParent = element.parentNode;
                if (!element.nextSibling && initialRootElementParent !== this.dropContainer.element.nativeElement) {
                    this.ended.pipe(take(1)).subscribe(endedEvent => initialRootElementParent.appendChild(element));
                }
            }
        });
        super.ngAfterViewInit();
    }
    ngOnDestroy() {
        this.cdkDropList?.removeDrag(this);
        super.ngOnDestroy();
    }
    dropContainerChanged(prev) { }
}
/** @nocollapse */ CdkLazyDrag.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDrag, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ CdkLazyDrag.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: CdkLazyDrag, selector: "[cdkLazyDrag]", inputs: { rootElementSelectorClass: ["cdkDragRootElementClass", "rootElementSelectorClass"], cdkDropList: "cdkDropList" }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
    ], exportAs: ["cdkLazyDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDrag, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkLazyDrag]',
                    exportAs: 'cdkLazyDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                    ],
                }]
        }], propDecorators: { rootElementSelectorClass: [{
                type: Input,
                args: ['cdkDragRootElementClass']
            }], cdkDropList: [{
                type: Input
            }] } });

/** Handle that can be used to drag and CdkDrag instance. */
class PblDragHandle extends CdkDragHandle {
    constructor(element, parentDrag) {
        super(element, parentDrag);
        this.element = element;
    }
}
/** @nocollapse */ PblDragHandle.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragHandle, deps: [{ token: i0.ElementRef }, { token: CDK_DRAG_PARENT, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblDragHandle.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblDragHandle, selector: "[pblDragHandle]", host: { classAttribute: "cdk-drag-handle" }, providers: [
        {
            provide: CDK_DRAG_HANDLE,
            useExisting: PblDragHandle
        }
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragHandle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblDragHandle]',
                    host: {
                        'class': 'cdk-drag-handle'
                    },
                    providers: [
                        {
                            provide: CDK_DRAG_HANDLE,
                            useExisting: PblDragHandle
                        }
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_DRAG_PARENT]
                }, {
                    type: Optional
                }, {
                    type: SkipSelf
                }] }]; } });

const _PblDropListRef = () => { return PblDropListRef; };
class PblRowDropListRef extends _PblDropListRef() {
    constructor() {
        super(...arguments);
        this.scrollDif = 0;
    }
    _getItemIndexFromPointerPosition(item, pointerX, pointerY, delta) {
        return super._getItemIndexFromPointerPosition(item, pointerX, pointerY - this.scrollDif, delta);
    }
    start() {
        super.start();
        this.scrollDif = 0;
        if (this.gridApi.grid.viewport.enabled) {
            const initialTop = this.gridApi.grid.viewport.measureScrollOffset();
            this.gridApi.grid.viewport.elementScrolled()
                .pipe(takeUntil(this.dropped))
                .subscribe(() => {
                this.scrollDif = this.gridApi.grid.viewport.measureScrollOffset() - initialTop;
            });
        }
    }
}
function patchDropListRef$1(dropListRef, gridApi) {
    try {
        Object.setPrototypeOf(dropListRef, PblRowDropListRef.prototype);
    }
    catch (err) {
        dropListRef._getItemIndexFromPointerPosition = PblRowDropListRef.prototype._getItemIndexFromPointerPosition;
        dropListRef.start = PblRowDropListRef.prototype.start;
    }
    dropListRef.gridApi = gridApi;
}

const ROW_REORDER_PLUGIN_KEY = 'rowReorder';
let _uniqueIdCounter$3 = 0;
class PblNgridRowReorderPluginDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-row-reorder-list-${_uniqueIdCounter$3++}`;
        this._rowReorder = false;
    }
    get rowReorder() { return this._rowReorder; }
    ;
    set rowReorder(value) {
        value = coerceBooleanProperty(value);
        this._rowReorder = value;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removePlugin(this.grid);
    }
    getSortedItems() {
        const { rowsApi } = this.gridApi;
        // The CdkTable has a view repeater that cache view's for performance (only when virtual scroll enabled)
        // A cached view is not showing but still "living" so it's CdkDrag element is still up in the air
        // We need to filter them out
        // An alternative will be to catch the events of the rows attached/detached and add/remove them from the drop list.
        return super.getSortedItems().filter(item => {
            return rowsApi.findRowByElement(item.getRootElement())?.attached;
        });
    }
    initDropListRef() {
        patchDropListRef$1(this.pblDropListRef, this.gridApi);
    }
    gridChanged() {
        this._removePlugin = this.gridApi.pluginCtrl.setPlugin(ROW_REORDER_PLUGIN_KEY, this);
        this.directContainerElement = '.pbl-ngrid-scroll-container';
        this.dropped.subscribe((event) => {
            const item = event.item;
            const previousIndex = this.grid.ds.source.indexOf(item.draggedContext.row);
            const currentIndex = event.currentIndex + this.grid.ds.renderStart;
            this.grid.ds.moveItem(previousIndex, currentIndex, true);
            this.grid.rowsApi.syncRows('data');
        });
    }
}
/** @nocollapse */ PblNgridRowReorderPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowReorderPluginDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowReorderPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowReorderPluginDirective, selector: "pbl-ngrid[rowReorder]", inputs: { rowReorder: "rowReorder" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()", "class.pbl-row-reorder": "rowReorder && !this.grid.ds?.sort.sort?.order && !this.grid.ds?.filter?.filter" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CdkDropListGroup, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridRowReorderPluginDirective },
    ], exportAs: ["pblNgridRowReorder"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowReorderPluginDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[rowReorder]',
                    exportAs: 'pblNgridRowReorder',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                        '[class.pbl-row-reorder]': 'rowReorder && !this.grid.ds?.sort.sort?.order && !this.grid.ds?.filter?.filter',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CdkDropListGroup, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridRowReorderPluginDirective },
                    ],
                }]
        }], propDecorators: { rowReorder: [{
                type: Input
            }] } });

class PblNgridRowDragDirective extends CdkLazyDrag {
    constructor() {
        super(...arguments);
        this.rootElementSelector = 'pbl-ngrid-row';
    }
    get context() {
        return this._context;
    }
    set context(value) {
        this._context = value;
        const pluginCtrl = this.pluginCtrl = value && PblNgridPluginController.find(value.grid);
        const plugin = pluginCtrl?.getPlugin(ROW_REORDER_PLUGIN_KEY);
        this.cdkDropList = plugin || undefined;
    }
    /**
     * Reference to the last dragged context.
     *
     * This context is not similar to the `context` property.
     * The `context` property holds the current context which is shared and updated on scroll so if a user start a drag and then scrolled
     * the context will point to the row in view and not the original cell.
     */
    get draggedContext() {
        return this._draggedContext;
    }
    ngOnInit() {
        this.started.subscribe((event) => {
            const { col, row, grid, value } = this._context;
            this._draggedContext = { col, row, grid, value };
        });
        super.ngOnInit();
    }
}
/** @nocollapse */ PblNgridRowDragDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDragDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowDragDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowDragDirective, selector: "[pblNgridRowDrag]", inputs: { context: ["pblNgridRowDrag", "context"] }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DRAG_PARENT, useExisting: PblNgridRowDragDirective },
    ], exportAs: ["pblNgridRowDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDragDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowDrag]',
                    exportAs: 'pblNgridRowDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DRAG_PARENT, useExisting: PblNgridRowDragDirective },
                    ]
                }]
        }], propDecorators: { context: [{
                type: Input,
                args: ['pblNgridRowDrag']
            }] } });

class PblColumnDropListRef extends PblDropListRef {
    _sortPredicate(newIndex, drag, drop) {
        const siblings = this.data.getSortedItems().map(c => c._dragRef);
        const dragAtNewPosition = siblings[newIndex];
        if (dragAtNewPosition.data.column.wontBudge) {
            return false;
        }
        // we now need to find if between current and new position there are items with `wontBudge`
        const itemAtOriginalPosition = this.lastSwap ? this.lastSwap : drag;
        const currentIndex = siblings.findIndex(currentItem => currentItem === itemAtOriginalPosition);
        const start = Math.min(newIndex, currentIndex);
        const itemsDraggedOver = siblings.slice(start, Math.abs(newIndex - currentIndex) + start);
        for (const dragItem of itemsDraggedOver) {
            if (dragItem.data.column.wontBudge && dragItem !== drag) {
                return false;
            }
        }
        if (!drag.data.column.checkGroupLockConstraint(dragAtNewPosition.data.column)) {
            return false;
        }
        this.lastSwap = dragAtNewPosition;
        return true;
    }
    _sortItem(item, pointerX, pointerY, pointerDelta) {
        const lastSwap = this.lastSwap;
        this.sortPredicate = (index, drag) => this._sortPredicate(index, drag, this);
        super._sortItem(item, pointerX, pointerY, pointerDelta);
        if (this.lastSwap && this.lastSwap !== lastSwap && this.data.orientation === 'horizontal') {
            const siblings = this.data.getSortedItems().map(c => c._dragRef);
            siblings.forEach((sibling, index) => {
                // Don't do anything if the position hasn't changed.
                // if (oldOrder[index] === sibling) {
                //   return;
                // }
                const transform = sibling.getVisibleElement().style.transform;
                for (const c of sibling.data.getCells()) {
                    c.style.transform = transform;
                }
            });
        }
    }
}
function patchDropListRef(dropListRef) {
    try {
        Object.setPrototypeOf(dropListRef, PblColumnDropListRef.prototype);
    }
    catch (err) {
        dropListRef._sortPredicate = PblColumnDropListRef.prototype._sortPredicate;
        dropListRef._sortItem = PblColumnDropListRef.prototype._sortItem;
    }
}

// tslint:disable:no-output-rename
const COL_DRAG_CONTAINER_PLUGIN_KEY = 'columnDrag';
let _uniqueIdCounter$2 = 0;
class PblNgridColumnDragContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-drag-container-list-${_uniqueIdCounter$2++}`;
        this.orientation = 'horizontal';
        this._columnDrag = false;
        this.connections = new Set();
    }
    get columnDrag() { return this._columnDrag; }
    ;
    set columnDrag(value) {
        this._columnDrag = coerceBooleanProperty(value);
    }
    hasConnections() {
        return this.connections.size > 0;
    }
    canDrag(column) {
        return this.connections.size > 0;
    }
    connectTo(dropList) {
        if (!this.connections.has(dropList)) {
            this.connections.add(dropList);
            this.connectedTo = Array.from(this.connections);
            this.connectionsChanged.next();
        }
    }
    disconnectFrom(dropList) {
        if (this.connections.delete(dropList)) {
            this.connectedTo = Array.from(this.connections);
            this.connectionsChanged.next();
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.connectionsChanged.complete();
        this.dragging.complete();
        this._removePlugin(this.grid);
    }
    initDropListRef() {
        patchDropListRef(this.pblDropListRef);
    }
    beforeStarted() {
        super.beforeStarted();
        this.dragging.next(true);
    }
    gridChanged() {
        this.dragging = new BehaviorSubject(false);
        this.connectionsChanged = new Subject();
        this._removePlugin = this.gridApi.pluginCtrl.setPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY, this);
        this.directContainerElement = '.pbl-ngrid-header-row-main';
        this.dragging.subscribe(isDragging => {
            const el = this.originalElement.nativeElement;
            if (isDragging) {
                el.classList.add('pbl-ngrid-column-list-dragging');
            }
            else {
                el.classList.remove('pbl-ngrid-column-list-dragging');
            }
        });
        this.sortingDisabled = true;
    }
}
/** @nocollapse */ PblNgridColumnDragContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDragContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDragContainerDirective, selector: "pbl-ngrid[columnDrag]:not([columnReorder])", inputs: { columnDrag: "columnDrag" }, outputs: { dragging: "cdkDropDragging", connectionsChanged: "cdkDropConnectionsChanged" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDragContainerDirective },
    ], exportAs: ["pblNgridColumnDragContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[columnDrag]:not([columnReorder])',
                    exportAs: 'pblNgridColumnDragContainer',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDragContainerDirective },
                    ],
                }]
        }], propDecorators: { columnDrag: [{
                type: Input
            }], dragging: [{
                type: Output,
                args: ['cdkDropDragging']
            }], connectionsChanged: [{
                type: Output,
                args: ['cdkDropConnectionsChanged']
            }] } });

class PblNgridColumnDragDirective extends CdkLazyDrag {
    constructor() {
        super(...arguments);
        this.rootElementSelector = 'pbl-ngrid-header-cell';
    }
    get column() { return this._column; }
    set column(value) {
        if (value !== this._column) {
            this._column = value;
            this.updateDisabledState();
        }
    }
    ngAfterViewInit() {
        if (!this.cdkDropList) {
            this.cdkDropList = PblNgridPluginController.findPlugin(this.column.columnDef.grid, COL_DRAG_CONTAINER_PLUGIN_KEY);
        }
        super.ngAfterViewInit();
        this._dragRef.beforeStarted.subscribe(() => {
            const { cdkDropList } = this;
            if (cdkDropList?.canDrag(this.column)) {
                // we don't allow a new dragging session before the previous ends.
                // this sound impossible, but due to animation transitions its actually is.
                // if the `transitionend` is long enough, a new drag can start...
                //
                // the `disabled` state is checked by pointerDown AFTER calling before start so we can cancel the start...
                if (cdkDropList._dropListRef.isDragging()) {
                    return this.disabled = true;
                }
            }
        });
        this.started.subscribe(() => {
            if (this._column.columnDef) {
                this.column.columnDef.isDragging = true;
            }
        });
        this.ended.subscribe(() => {
            if (this._column.columnDef) {
                this.column.columnDef.isDragging = false;
            }
        });
    }
    ngOnDestroy() {
        unrx.kill(this);
        super.ngOnDestroy();
    }
    getCells() {
        if (!this.cache) {
            this.cache = this.column.columnDef.queryCellElements('table');
        }
        return this.cache;
    }
    reset() {
        super.reset();
        if (this.cache) {
            for (const el of this.cache) {
                el.style.transform = ``;
            }
            this.cache = undefined;
        }
    }
    dropContainerChanged(prev) {
        if (prev) {
            unrx.kill(this, prev);
        }
        this.updateDisabledState();
        this.updateBoundaryElement();
        if (this.cdkDropList) {
            this.cdkDropList.connectionsChanged
                .pipe(unrx(this, this.cdkDropList))
                .subscribe(() => this.updateBoundaryElement());
        }
    }
    updateDisabledState() {
        this.disabled = this.column && this.cdkDropList ? !this.cdkDropList.canDrag(this.column) : true;
    }
    updateBoundaryElement() {
        if (this.cdkDropList?.hasConnections()) {
            this.boundaryElement = undefined;
        }
        else {
            this.boundaryElement = this.cdkDropList.directContainerElement;
        }
    }
}
/** @nocollapse */ PblNgridColumnDragDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDragDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDragDirective, selector: "[pblNgridColumnDrag]", inputs: { column: ["pblNgridColumnDrag", "column"] }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DRAG_PARENT, useExisting: PblNgridColumnDragDirective }
    ], exportAs: ["pblNgridColumnDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridColumnDrag]',
                    exportAs: 'pblNgridColumnDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DRAG_PARENT, useExisting: PblNgridColumnDragDirective }
                    ]
                }]
        }], propDecorators: { column: [{
                type: Input,
                args: ['pblNgridColumnDrag']
            }] } });

// tslint:disable:no-output-rename
let _uniqueIdCounter$1 = 0;
class PblNgridColumnDropContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-drop-container-${_uniqueIdCounter$1++}`;
        this.orientation = 'horizontal';
        this.columnEntered = this.entered;
        this.columnExited = this.exited;
        this.columnDropped = this.dropped;
    }
    get columnContainer() { return this._columnContainer; }
    canDrag(column) {
        return true;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._columnContainer) {
            this._columnContainer.disconnectFrom(this);
        }
    }
    gridChanged() {
        const columnContainer = this.gridApi?.pluginCtrl.getPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY);
        if (columnContainer !== this._columnContainer) {
            if (this._columnContainer) {
                this._columnContainer.disconnectFrom(this);
            }
            this._columnContainer = columnContainer;
            if (columnContainer) {
                columnContainer.connectTo(this);
            }
        }
    }
}
/** @nocollapse */ PblNgridColumnDropContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDropContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDropContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDropContainerDirective, selector: "[pblColumnDropContainer]", inputs: { grid: ["pblColumnDropContainer", "grid"] }, outputs: { columnEntered: "columnEntered", columnExited: "columnExited", columnDropped: "columnDropped" }, host: { properties: { "id": "id" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDropContainerDirective },
    ], exportAs: ["pblColumnDropContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDropContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblColumnDropContainer]',
                    exportAs: 'pblColumnDropContainer',
                    inputs: ['grid: pblColumnDropContainer'],
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDropContainerDirective },
                    ],
                }]
        }], propDecorators: { columnEntered: [{
                type: Output
            }], columnExited: [{
                type: Output
            }], columnDropped: [{
                type: Output
            }] } });

// tslint:disable:no-output-rename
const COL_REORDER_PLUGIN_KEY = 'columnReorder';
class PblNgridColumnReorderPluginDirective extends PblNgridColumnDragContainerDirective {
    constructor() {
        super(...arguments);
        this._columnReorder = false;
        this._manualOverride = false;
    }
    get columnReorder() { return this._columnReorder; }
    ;
    set columnReorder(value) {
        this._columnReorder = coerceBooleanProperty(value);
        this.sortingDisabled = !this._columnReorder;
    }
    /**
     * When true, will not move the column on drop.
     * Instead you need to handle the dropped event.
     */
    get manualOverride() { return this._manualOverride; }
    ;
    set manualOverride(value) { this._manualOverride = coerceBooleanProperty(value); }
    canDrag(column) {
        return (this._columnReorder && column.reorder) || super.canDrag(column);
    }
    ngOnInit() {
        super.ngOnInit();
        this.dropped.subscribe(e => this._pblReset());
        this.pblDropListRef.beforeExit.subscribe(e => this._pblReset());
    }
    gridChanged() {
        super.gridChanged();
        this.dropped.subscribe((event) => {
            if (!this.manualOverride && this._columnReorder) {
                this.grid.columnApi.moveColumn(event.item.column, event.currentIndex);
            }
        });
    }
    _pblReset() {
        this.dragging.next(false);
        const siblings = this.getSortedItems().map(c => c._dragRef);
        siblings.forEach((sibling, index) => {
            for (const c of sibling.data.getCells()) {
                c.style.transform = ``;
            }
        });
    }
}
/** @nocollapse */ PblNgridColumnReorderPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnReorderPluginDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnReorderPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnReorderPluginDirective, selector: "pbl-ngrid[columnReorder]", inputs: { columnReorder: "columnReorder", manualOverride: "manualOverride" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnReorderPluginDirective },
    ], exportAs: ["pblNgridColumnReorder"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnReorderPluginDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[columnReorder]',
                    exportAs: 'pblNgridColumnReorder',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnReorderPluginDirective },
                    ],
                }]
        }], propDecorators: { columnReorder: [{
                type: Input
            }], manualOverride: [{
                type: Input
            }] } });

/**
 * Code from angular/material2 repository
 * File: https://github.com/angular/material2/blob/master/src/cdk/drag-drop/drag-styling.ts
 * Commit: https://github.com/angular/material2/blob/9cd3132607b4d5ae242291df41fb02dc7a453da8/src/cdk/drag-drop/drag-styling.ts
 *
 * This code is not public but required for the drag so duplicated here.
 **/
/**
 * Shallow-extends a stylesheet object with another stylesheet object.
 * @docs-private
 */
function extendStyles(dest, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    }
    return dest;
}
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * @param element Element on which to toggle the drag interactions.
 * @param enable Whether the drag interactions should be enabled.
 * @docs-private
 */
function toggleNativeDragInteractions(element, enable) {
    const userSelect = enable ? '' : 'none';
    extendStyles(element.style, {
        touchAction: enable ? '' : 'none',
        webkitUserDrag: enable ? '' : 'none',
        webkitTapHighlightColor: enable ? '' : 'transparent',
        userSelect: userSelect,
        msUserSelect: userSelect,
        webkitUserSelect: userSelect,
        MozUserSelect: userSelect
    });
}

const COL_RESIZE_PLUGIN_KEY = 'columnResize';
/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false });
class PblNgridDragResizeComponent {
    constructor(element, _ngZone, _viewportRuler, _dragDropRegistry, _config) {
        this.element = element;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
        this._config = _config;
        /**
         * The area (in pixels) in which the handle can be grabbed and resize the cell.
         * Default: 6
         */
        this.grabAreaWidth = 6;
        this._pointerMoveSubscription = Subscription.EMPTY;
        this._pointerUpSubscription = Subscription.EMPTY;
        this._rootElementInitSubscription = Subscription.EMPTY;
        this._pointerDown = (event) => {
            this._initializeDragSequence(this._rootElement, event);
        };
        /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
        this._pointerMove = (event) => {
            const pointerPosition = this._getPointerPositionOnPage(event);
            const distanceX = pointerPosition.x - this._pickupPositionOnPage.x;
            const distanceY = pointerPosition.y - this._pickupPositionOnPage.y;
            if (!this._hasStartedDragging) {
                // Only start dragging after the user has moved more than the minimum distance in either
                // direction. Note that this is preferable over doing something like `skip(minimumDistance)`
                // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                // per pixel of movement (e.g. if the user moves their pointer quickly).
                if (Math.abs(distanceX) + Math.abs(distanceY) >= this._config.dragStartThreshold) {
                    this._hasStartedDragging = true;
                    // It will be a good thing if we turned of the header's resize observer to boost performance
                    // However, because we relay on the total grid minimum width updates to relatively even out the columns it will not work.
                    // Group cells will not cover all of the children, when we enlarge the width of a child in the group.
                    // This is because the max-width of the group is set proportional to the total min-width of the inner grid.
                    // For it to work we need to directly update the width of ALL OF THE GROUPS.
                    // this.column.columnDef.isDragging = true;
                    this.column.sizeInfo.updateSize();
                    this._lastWidth = this._initialWidth = this.column.columnDef.netWidth;
                }
                return;
            }
            this._hasMoved = true;
            event.preventDefault();
            event.stopPropagation();
            const dir = this._extApi.getDirection() === 'rtl' ? -1 : 1;
            let newWidth = Math.max(0, this._initialWidth + (distanceX * dir));
            if (newWidth > this.column.maxWidth) {
                newWidth = this.column.maxWidth;
            }
            else if (distanceX < 0 && newWidth < this.column.minWidth) {
                newWidth = this.column.minWidth;
            }
            if (this._lastWidth !== newWidth) {
                this._lastWidth = newWidth;
                this.column.updateWidth(`${newWidth}px`);
                this._extApi.widthCalc.resetColumnsWidth();
                // `this.column.updateWidth` will update the grid width cell only, which will trigger a resize that will update all other cells
                // `this.grid.resetColumnsWidth()` will re-adjust all other grid width cells, and if their size changes they will trigger the resize event...
            }
        };
        /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
        this._pointerUp = () => {
            if (!this.isDragging()) {
                return;
            }
            this._removeSubscriptions();
            this._dragDropRegistry.stopDragging(this);
            if (!this._hasStartedDragging) {
                return;
            }
            // this.column.columnDef.isDragging = false;
            this.grid.columnApi.resizeColumn(this.column, this._lastWidth + 'px');
        };
        this._config = {
            dragStartThreshold: _config && _config.dragStartThreshold != null ? _config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: _config && _config.pointerDirectionChangeThreshold != null ? _config.pointerDirectionChangeThreshold : 5,
            zIndex: _config?.zIndex
        };
        _dragDropRegistry.registerDragItem(this);
    }
    // tslint:disable-next-line:no-input-rename
    set context(value) {
        if (value) {
            const { col, grid } = value;
            if (isPblColumn(col)) {
                this.column = col;
                this.grid = grid;
                this._extApi = PblNgridPluginController.find(grid).extApi;
                return;
            }
        }
        this.column = this._extApi = this.grid = undefined;
    }
    ngAfterViewInit() {
        // We need to wait for the zone to stabilize, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position and then they get transferred to the portal.
        this._rootElementInitSubscription = this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
            const rootElement = this._rootElement = this._getRootElement();
            const cell = rootElement.parentElement;
            cell.classList.add('pbl-ngrid-column-resize');
            rootElement.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
            rootElement.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
            toggleNativeDragInteractions(rootElement, false);
        });
    }
    ngOnDestroy() {
        if (this._rootElement) {
            this._rootElement.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
            this._rootElement.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
        }
        this._rootElementInitSubscription.unsubscribe();
        this._dragDropRegistry.removeDragItem(this);
        this._removeSubscriptions();
    }
    onDoubleClick(event) {
        this.grid.columnApi.autoSizeColumn(this.column);
    }
    /**
   * Sets up the different variables and subscriptions
   * that will be necessary for the dragging sequence.
   * @param referenceElement Element that started the drag sequence.
   * @param event Browser event object that started the sequence.
   */
    _initializeDragSequence(referenceElement, event) {
        // Always stop propagation for the event that initializes
        // the dragging sequence, in order to prevent it from potentially
        // starting another sequence for a draggable parent somewhere up the DOM tree.
        event.stopPropagation();
        // Abort if the user is already dragging or is using a mouse button other than the primary one.
        if (this.isDragging() || (!this._isTouchEvent(event) && event.button !== 0)) {
            return;
        }
        this._hasStartedDragging = this._hasMoved = false;
        this._pointerMoveSubscription = this._dragDropRegistry.pointerMove
            .pipe(auditTime(0, animationFrameScheduler))
            .subscribe(this._pointerMove);
        this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
        this._scrollPosition = this._viewportRuler.getViewportScrollPosition();
        this._pickupPositionOnPage = this._getPointerPositionOnPage(event);
        this._dragDropRegistry.startDragging(this, event);
    }
    _getPointerPositionOnPage(event) {
        const point = this._isTouchEvent(event) ? event.touches[0] : event;
        return {
            x: point.pageX - this._scrollPosition.left,
            y: point.pageY - this._scrollPosition.top
        };
    }
    _isTouchEvent(event) {
        return event.type.startsWith('touch');
    }
    /**
     *
     * @deprecated Will be removed in v5, use `isDragging()` instead
     */
    _isDragging() {
        return this.isDragging();
    }
    isDragging() {
        return this._dragDropRegistry.isDragging(this);
    }
    _getRootElement() {
        return this.element.nativeElement;
    }
    _removeSubscriptions() {
        this._pointerMoveSubscription.unsubscribe();
        this._pointerUpSubscription.unsubscribe();
    }
}
/** @nocollapse */ PblNgridDragResizeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragResizeComponent, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: i1.ViewportRuler }, { token: i2.DragDropRegistry }, { token: CDK_DRAG_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDragResizeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDragResizeComponent, selector: "pbl-ngrid-drag-resize", inputs: { context: "context", grabAreaWidth: "grabAreaWidth" }, host: { listeners: { "dblclick": "onDoubleClick($event)" }, properties: { "style.width.px": "grabAreaWidth" }, classAttribute: "pbl-ngrid-column-resizer" }, ngImport: i0, template: "<ng-content></ng-content>\n", styles: [".pbl-ngrid-column-resizer{position:absolute;right:0;height:100%;cursor:col-resize;z-index:50000}[dir=rtl] .pbl-ngrid-column-resizer{right:unset;left:0}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragResizeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-drag-resize', host: {
                        'class': 'pbl-ngrid-column-resizer',
                        '[style.width.px]': 'grabAreaWidth',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<ng-content></ng-content>\n", styles: [".pbl-ngrid-column-resizer{position:absolute;right:0;height:100%;cursor:col-resize;z-index:50000}[dir=rtl] .pbl-ngrid-column-resizer{right:unset;left:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i1.ViewportRuler }, { type: i2.DragDropRegistry }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }]; }, propDecorators: { context: [{
                type: Input
            }], grabAreaWidth: [{
                type: Input
            }], onDoubleClick: [{
                type: HostListener,
                args: ['dblclick', ['$event']]
            }] } });

function checkGroupLockConstraint(column) {
    for (const id of this.groups) {
        const g = this.groupStore.find(id);
        if (g && g.lockColumns && !column.isInGroup(g)) {
            return false;
        }
    }
    return true;
}
function colReorderExtendGrid() {
    PblColumn.extendProperty('reorder');
    PblColumn.extendProperty('wontBudge');
    PblColumnGroup.extendProperty('lockColumns');
    PblColumn.prototype.checkGroupLockConstraint = function (column) {
        return checkGroupLockConstraint.call(this, column) && checkGroupLockConstraint.call(column, this);
    };
}

// tslint:disable:no-output-rename
let _uniqueIdCounter = 0;
class PblNgridAggregationContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-aggregation-container-${_uniqueIdCounter++}`;
        this.orientation = 'horizontal';
    }
    ngOnInit() {
        super.ngOnInit();
        this.pblDropListRef.dropped
            .subscribe(event => {
            const item = event.item;
            this.pending = undefined;
            this.grid.columnApi.addGroupBy(item.data.column);
        });
        this.pblDropListRef.entered
            .subscribe(event => {
            const item = event.item;
            this.pending = item.data.column;
            item.getPlaceholderElement().style.display = 'none';
            for (const c of item.data.getCells()) {
                c.style.display = 'none';
            }
        });
        this.pblDropListRef.exited
            .subscribe(event => {
            const item = event.item;
            this.pending = undefined;
            item.getPlaceholderElement().style.display = '';
            for (const c of item.data.getCells()) {
                c.style.display = '';
            }
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.columnContainer.disconnectFrom(this);
    }
    gridChanged() {
        this.columnContainer = this.gridApi.pluginCtrl.getPlugin('columnReorder');
        this.columnContainer.connectTo(this);
    }
}
/** @nocollapse */ PblNgridAggregationContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridAggregationContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridAggregationContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridAggregationContainerDirective, selector: "[pblAggregationContainer]", host: { properties: { "id": "id" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridAggregationContainerDirective },
    ], exportAs: ["pblAggregationContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridAggregationContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblAggregationContainer]',
                    exportAs: 'pblAggregationContainer',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridAggregationContainerDirective },
                    ],
                }]
        }] });

/**
 * Marks the element as the resizer template for cells.
 */
class PblNgridCellDraggerRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'cellDragger';
        this.kind = 'dataHeaderExtensions';
    }
    shouldRender(context) {
        // We dont check for `context.col.reorder` because even if a specific column does not "reorder" we still need to render the cdk-drag
        // so the cdk-drop-list will be aware of this item, so if another item does reorder it will be able to move while taking this element into consideration.
        // I.E: It doesn't reorder but it's part of the playground.
        //
        // However, when the plugin does not exists for this table we don't need to render...
        const pluginCtrl = PblNgridPluginController.find(context.grid);
        return pluginCtrl.hasPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY);
    }
}
/** @nocollapse */ PblNgridCellDraggerRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDraggerRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1$1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellDraggerRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellDraggerRefDirective, selector: "[pblNgridCellDraggerRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDraggerRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridCellDraggerRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1$1.PblNgridRegistryService }]; } });

/**
 * Marks the element as the resizer template for cells.
 */
class PblNgridCellResizerRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'cellResizer';
        this.kind = 'dataHeaderExtensions';
    }
    shouldRender(context) {
        return !!context.col.resize;
    }
}
/** @nocollapse */ PblNgridCellResizerRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellResizerRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1$1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellResizerRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellResizerRefDirective, selector: "[pblNgridCellResizerRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellResizerRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridCellResizerRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1$1.PblNgridRegistryService }]; } });

function colResizeExtendGrid() {
    PblColumn.extendProperty('resize');
}

class DragPluginDefaultTemplatesComponent {
}
/** @nocollapse */ DragPluginDefaultTemplatesComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: DragPluginDefaultTemplatesComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ DragPluginDefaultTemplatesComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: DragPluginDefaultTemplatesComponent, selector: "pbl-drag-plugin-default-templates", ngImport: i0, template: `<pbl-ngrid-drag-resize *pblNgridCellResizerRef="let ctx" [context]="ctx"></pbl-ngrid-drag-resize>
<span *pblNgridCellDraggerRef="let ctx" [pblNgridColumnDrag]="ctx.col" cdkDragRootElementClass="cdk-drag"></span>`, isInline: true, dependencies: [{ kind: "directive", type: PblNgridColumnDragDirective, selector: "[pblNgridColumnDrag]", inputs: ["pblNgridColumnDrag"], exportAs: ["pblNgridColumnDrag"] }, { kind: "directive", type: PblNgridCellDraggerRefDirective, selector: "[pblNgridCellDraggerRef]" }, { kind: "component", type: PblNgridDragResizeComponent, selector: "pbl-ngrid-drag-resize", inputs: ["context", "grabAreaWidth"] }, { kind: "directive", type: PblNgridCellResizerRefDirective, selector: "[pblNgridCellResizerRef]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: DragPluginDefaultTemplatesComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-drag-plugin-default-templates',
                    template: `<pbl-ngrid-drag-resize *pblNgridCellResizerRef="let ctx" [context]="ctx"></pbl-ngrid-drag-resize>
<span *pblNgridCellDraggerRef="let ctx" [pblNgridColumnDrag]="ctx.col" cdkDragRootElementClass="cdk-drag"></span>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });

function ngridPlugins() {
    return [
        ngridPlugin({ id: ROW_REORDER_PLUGIN_KEY }, PblNgridRowReorderPluginDirective),
        ngridPlugin({ id: COL_DRAG_CONTAINER_PLUGIN_KEY }, PblNgridColumnDragContainerDirective),
        ngridPlugin({ id: COL_REORDER_PLUGIN_KEY, runOnce: colReorderExtendGrid }, PblNgridColumnReorderPluginDirective),
        ngridPlugin({ id: COL_RESIZE_PLUGIN_KEY, runOnce: colResizeExtendGrid }, PblNgridDragResizeComponent),
    ];
}
class PblNgridDragModule {
    static withDefaultTemplates() {
        return {
            ngModule: PblNgridDragModule,
            providers: provideCommon([{ component: DragPluginDefaultTemplatesComponent }]),
        };
    }
}
PblNgridDragModule.NGRID_PLUGIN = ngridPlugins();
/** @nocollapse */ PblNgridDragModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridDragModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragModule, declarations: [DragPluginDefaultTemplatesComponent,
        CdkLazyDropList, CdkLazyDrag, PblDragHandle,
        PblNgridRowReorderPluginDirective, PblNgridRowDragDirective,
        PblNgridColumnDragContainerDirective,
        PblNgridColumnDropContainerDirective, PblNgridColumnReorderPluginDirective, PblNgridColumnDragDirective, PblNgridCellDraggerRefDirective,
        PblNgridAggregationContainerDirective,
        PblNgridDragResizeComponent, PblNgridCellResizerRefDirective], imports: [CommonModule,
        PblNgridModule,
        DragDropModule], exports: [DragDropModule,
        CdkLazyDropList, CdkLazyDrag, PblDragHandle,
        PblNgridRowReorderPluginDirective, PblNgridRowDragDirective,
        PblNgridColumnDragContainerDirective,
        PblNgridColumnDropContainerDirective, PblNgridColumnReorderPluginDirective, PblNgridColumnDragDirective, PblNgridCellDraggerRefDirective,
        PblNgridAggregationContainerDirective,
        PblNgridDragResizeComponent, PblNgridCellResizerRefDirective] });
/** @nocollapse */ PblNgridDragModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragModule, imports: [CommonModule,
        PblNgridModule,
        DragDropModule, DragDropModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDragModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        PblNgridModule,
                        DragDropModule
                    ],
                    declarations: [
                        DragPluginDefaultTemplatesComponent,
                        CdkLazyDropList, CdkLazyDrag, PblDragHandle,
                        PblNgridRowReorderPluginDirective, PblNgridRowDragDirective,
                        PblNgridColumnDragContainerDirective,
                        PblNgridColumnDropContainerDirective, PblNgridColumnReorderPluginDirective, PblNgridColumnDragDirective, PblNgridCellDraggerRefDirective,
                        PblNgridAggregationContainerDirective,
                        PblNgridDragResizeComponent, PblNgridCellResizerRefDirective,
                    ],
                    exports: [
                        DragDropModule,
                        CdkLazyDropList, CdkLazyDrag, PblDragHandle,
                        PblNgridRowReorderPluginDirective, PblNgridRowDragDirective,
                        PblNgridColumnDragContainerDirective,
                        PblNgridColumnDropContainerDirective, PblNgridColumnReorderPluginDirective, PblNgridColumnDragDirective, PblNgridCellDraggerRefDirective,
                        PblNgridAggregationContainerDirective,
                        PblNgridDragResizeComponent, PblNgridCellResizerRefDirective,
                    ]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CdkLazyDrag, CdkLazyDropList, PblDragDrop, PblDragHandle, PblDragRef, PblDropListRef, PblNgridAggregationContainerDirective, PblNgridCellDraggerRefDirective, PblNgridCellResizerRefDirective, PblNgridColumnDragContainerDirective, PblNgridColumnDragDirective, PblNgridColumnDropContainerDirective, PblNgridColumnReorderPluginDirective, PblNgridDragModule, PblNgridDragResizeComponent, PblNgridRowDragDirective, PblNgridRowReorderPluginDirective };
//# sourceMappingURL=pebula-ngrid-drag.mjs.map
