import { asapScheduler, animationFrameScheduler } from 'rxjs';
import { filter, take, tap, observeOn, switchMap, map, mapTo, startWith, pairwise } from 'rxjs/operators';
import { Component, ElementRef, Input, Injector, ChangeDetectionStrategy, ViewChild, ViewChildren, QueryList, ViewEncapsulation, ChangeDetectorRef, TemplateRef, ViewContainerRef, NgZone, isDevMode, forwardRef, Attribute, Optional, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { CdkHeaderRowDef, CdkFooterRowDef, CdkRowDef } from '@angular/cdk/table';
import { PblNgridConfigService, PblDataSource, createDS, deprecatedWarning, unrx, } from '@pebula/ngrid/core';
import { PBL_NGRID_COMPONENT } from '../tokens';
import { EXT_API_TOKEN } from '../ext/grid-ext-api';
import { PblNgridPluginController } from '../ext/plugin-control';
import { PblNgridRegistryService } from './registry/registry.service';
import { PblNgridMetaRowService } from './meta-rows/meta-row.service';
import { createApis } from './api-factory';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid/core";
import * as i2 from "./registry/registry.service";
import * as i3 from "@angular/cdk/bidi";
import * as i4 from "@angular/common";
import * as i5 from "@angular/cdk/table";
import * as i6 from "./meta-rows/meta-row-container";
import * as i7 from "./pbl-cdk-table/pbl-cdk-table.component";
import * as i8 from "./row/row-def.directive";
import * as i9 from "./row/row.component";
import * as i10 from "./row/columns-row.component";
import * as i11 from "./row/meta-row.component";
import * as i12 from "./features/virtual-scroll/virtual-scroll-viewport.component";
export function internalApiFactory(grid) { return grid._extApi; }
export function pluginControllerFactory(grid) { return grid._plugin.controller; }
export function metaRowServiceFactory(grid) { return grid._extApi.rowsApi.metaRowService; }
export class PblNgridComponent {
    constructor(injector, vcRef, elRef, ngZone, cdr, config, 
    // TODO: Make private in v5
    /** @deprecated Will be removed in v5 */
    registry, id, dir) {
        this.elRef = elRef;
        this.ngZone = ngZone;
        this.cdr = cdr;
        this.config = config;
        this.registry = registry;
        this.id = id;
        this.rowClassUpdateFreq = 'item';
        this.rowFocus = '';
        this.cellFocus = '';
        this._dir = 'ltr';
        this._minDataViewHeight = 0;
        this._noCachePaginator = false;
        this._extApi = createApis(this, { config, registry, ngZone, injector, vcRef, elRef, cdRef: cdr, dir });
        dir?.change
            .pipe(unrx(this, 'dir'), startWith(dir.value))
            .subscribe(value => this._dir = value);
        const gridConfig = config.get('table');
        this.showHeader = gridConfig.showHeader;
        this.showFooter = gridConfig.showFooter;
        this.noFiller = gridConfig.noFiller;
        this._extApi.onConstructed(() => {
            this._viewport = this._extApi.viewport;
            this._cdkTable = this._extApi.cdkTable;
        });
        this.contextApi = this._extApi.contextApi;
        this._store = this._extApi.columnStore;
        this._plugin = this._extApi.plugin;
        this.columnApi = this._extApi.columnApi;
        this.rowsApi = this._extApi.rowsApi;
    }
    /**
     * Show/Hide the header row.
     * Default: true
     */
    get showHeader() { return this._showHeader; }
    ;
    set showHeader(value) {
        this._extApi.notifyPropChanged(this, 'showHeader', this._showHeader, this._showHeader = coerceBooleanProperty(value));
    }
    /**
     * Show/Hide the footer row.
     * Default: false
     */
    get showFooter() { return this._showFooter; }
    ;
    set showFooter(value) {
        this._extApi.notifyPropChanged(this, 'showFooter', this._showFooter, this._showFooter = coerceBooleanProperty(value));
    }
    /**
     * When true, the filler is disabled.
     */
    get noFiller() { return this._noFiller; }
    ;
    set noFiller(value) {
        this._noFiller = coerceBooleanProperty(value);
    }
    /**
     * The grid's source of data
     *
     * @remarks
     * The grid's source of data, which can be provided in 2 ways:
     *
     * - DataSourceOf<T>
     * - PblDataSource<T>
     *
     * The grid only works with `PblDataSource<T>`, `DataSourceOf<T>` is a shortcut for providing
     * the data array directly.
     *
     * `DataSourceOf<T>` can be:
     *
     * - Simple data array (each object represents one grid row)
     * - Promise for a data array
     * - Stream that emits a data array each time the array changes
     *
     * When a `DataSourceOf<T>` is provided it is converted into an instance of `PblDataSource<T>`.
     *
     * To access the `PblDataSource<T>` instance use the `ds` property (readonly).
     *
     * It is highly recommended to use `PblDataSource<T>` directly, the datasource factory makes it easy.
     * For example, when an array is provided the factory is used to convert it to a datasource:
     *
     * ```typescript
     * const collection: T[] = [];
     * const pblDataSource = createDS<T>().onTrigger( () => collection ).create();
     * ```
     *
     * > This is a write-only (setter) property that triggers the `setDataSource` method.
     */
    set dataSource(value) {
        if (value instanceof PblDataSource) {
            this.setDataSource(value);
        }
        else {
            this.setDataSource(createDS().onTrigger(() => value || []).create());
        }
    }
    get ds() { return this._dataSource; }
    ;
    get usePagination() { return this._pagination; }
    set usePagination(value) {
        if (value === '') {
            value = 'pageNumber';
        }
        if (value !== this._pagination) {
            this._pagination = value;
            this._extApi.logicaps.pagination();
        }
    }
    get noCachePaginator() { return this._noCachePaginator; }
    set noCachePaginator(value) {
        value = coerceBooleanProperty(value);
        if (this._noCachePaginator !== value) {
            this._noCachePaginator = value;
            if (this.ds && this.ds.paginator) {
                this.ds.paginator.noCacheMode = value;
            }
        }
    }
    /**
     * The minimum height to assign to the data viewport (where data rows are shown)
     *
     * The data viewport is the scrollable area where all data rows are visible, and some metadata rows might also be there
     * depending on their type (fixed/row/sticky) as well as outer section items.
     *
     * By default, the data viewport has no size and it will grow based on the available space it has left within the container.
     * The container will first assign height to any fixed rows and dynamic content (before/after) provided.
     *
     * If the container height is fixed (e.g. `<pbl-ngrid style="height: 500px"></pbl-ngrid>`) and there is no height left
     * for the data viewport then it will get no height (0 height).
     *
     * To deal with this issue there are 2 options:
     *
     * 1. Do not limit the height of the container
     * 2. Provide a default minimum height for the data viewport
     *
     * Option number 1 is not practical, it will disable all scrolling in the table, making it a long box scrollable by the host container.
     *
     * This is where we use option number 2.
     * By defining a default minimum height we ensure visibility and since there's a scroll there, the user can view all of the data.
     *
     * There are 2 types of inputs:
     *
     * A. Default minimum height in PX
     * B. Default minimum height in ROW COUNT
     *
     * For A, provide a positive value, for B provide a negative value.
     *
     * For example:
     *
     *  - Minimum data viewport of 100 pixels: `<pbl-ngrid minDataViewHeight="100"></pbl-ngrid>`
     *  - Minimum data viewport of 2 ros: `<pbl-ngrid minDataViewHeight="-2"></pbl-ngrid>`
     *
     * Notes when using rows:
     *  - The row height is calculated based on an initial row pre-loaded by the grid, this row will get it's height from the CSS theme defined.
     *  - The ROW COUNT is the lower value between the actual row count provided and the total rows to render.
     *
     * ## Container Overflow:
     *
     * Note that when using a default minimum height, if the minimum height of the data viewport PLUS the height of all other elements in the container EXCEEDS any fixed
     * height assigned to the container, the container will render a scrollbar which results in the possibility of 2 scrollbars, 1 for the container and the seconds
     * for the data viewport, if it has enough data rows.
     */
    get minDataViewHeight() { return this.minDataViewHeight; }
    set minDataViewHeight(value) {
        value = coerceNumberProperty(value);
        if (this._minDataViewHeight !== value) {
            this._minDataViewHeight = value;
        }
    }
    /**
     * @deprecated Will be removed in v5, see `minDataViewHeight`
     */
    get fallbackMinHeight() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            deprecatedWarning('PblNgridComponent.fallbackMinHeight', '4', 'PblNgridComponent.minDataViewHeight');
        }
        return this._minDataViewHeight > 0 ? this._minDataViewHeight : undefined;
    }
    set fallbackMinHeight(value) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            deprecatedWarning('PblNgridComponent.fallbackMinHeight', '4', 'PblNgridComponent.minDataViewHeight');
        }
        this.minDataViewHeight = value;
    }
    get dir() { return this._dir; }
    ;
    /**
     * When true, the virtual paging feature is enabled because the virtual content size exceed the supported height of the browser so paging is enable.
     */
    get virtualPagingActive() { return this.viewport.virtualPagingActive; }
    get metaHeaderRows() { return this._store.metaHeaderRows; }
    get metaFooterRows() { return this._store.metaFooterRows; }
    get metaColumns() { return this._store.metaColumns; }
    get columnRowDef() {
        return {
            header: this._store.headerColumnDef,
            footer: this._store.footerColumnDef
        };
    }
    get viewport() { return this._viewport; }
    get innerTableMinWidth() { return this._cdkTable?.minWidth; }
    ngAfterContentInit() {
        this._extApi.logicaps.bindRegistry();
    }
    ngAfterViewInit() {
        this.invalidateColumns();
        Object.defineProperty(this, 'isInit', { value: true });
        this._plugin.emitEvent({ source: 'grid', kind: 'onInit' });
        this._extApi.logicaps.pagination();
        this.contextApi.focusChanged
            .subscribe(event => {
            if (event.curr) {
                this.rowsApi
                    .findDataRowByIdentity(event.curr.rowIdent)
                    ?.getCellById(this.columnApi.columnIds[event.curr.colIndex])
                    ?.focus();
            }
        });
    }
    ngOnChanges(changes) {
        let processColumns = false;
        if (changes.focusMode) {
            this.rowFocus = this.focusMode === 'row' ? 0 : '';
            this.cellFocus = this.focusMode === 'cell' ? 0 : '';
        }
        if (changes.columns && this.isInit) {
            processColumns = true;
        }
        if (processColumns === true) {
            this.invalidateColumns();
            this.ngZone.onStable.pipe(take(1)).subscribe(() => this.rowsApi.syncRows('all', true));
        }
    }
    ngOnDestroy() {
        this._store.dispose();
        const destroy = () => {
            this._plugin.destroy();
            this.viewport.detachViewPort();
            unrx.kill(this);
        };
        let p;
        this._plugin.emitEvent({ source: 'grid', kind: 'onDestroy', wait: (_p) => p = _p });
        if (p) {
            p.then(destroy).catch(destroy);
        }
        else {
            destroy();
        }
    }
    trackBy(index, item) {
        return index;
    }
    setSort(columnOrAlias, sort, skipUpdate = false) {
        if (!columnOrAlias || typeof columnOrAlias === 'boolean') {
            this.ds.setSort(!!columnOrAlias);
            return;
        }
        let column;
        if (typeof columnOrAlias === 'string') {
            column = this._store.visibleColumns.find(c => c.alias ? c.alias === columnOrAlias : (c.sort && c.id === columnOrAlias));
            if (!column && isDevMode()) {
                console.warn(`Could not find column with alias "${columnOrAlias}".`);
                return;
            }
        }
        else {
            column = columnOrAlias;
        }
        this.ds.setSort(column, sort, skipUpdate);
    }
    setFilter(value, columns) {
        if (arguments.length > 0) {
            let columnInstances;
            if (Array.isArray(columns) && typeof columns[0] === 'string') {
                columnInstances = [];
                for (const colId of columns) {
                    const column = this._store.visibleColumns.find(c => c.alias ? c.alias === colId : (c.id === colId));
                    if (!column && isDevMode()) {
                        console.warn(`Could not find column with alias ${colId} "${colId}".`);
                        return;
                    }
                    columnInstances.push(column);
                }
            }
            else {
                columnInstances = columns;
            }
            this.ds.setFilter(value, columnInstances);
        }
        else {
            this.ds.setFilter();
        }
    }
    setDataSource(value) {
        if (this._dataSource !== value) {
            // KILL ALL subscriptions for the previous datasource.
            if (this._dataSource) {
                unrx.kill(this, this._dataSource);
            }
            const prev = this._dataSource;
            this._dataSource = value;
            this._cdkTable.dataSource = value;
            this._extApi.logicaps.pagination();
            this._extApi.logicaps.noData(false);
            if (prev?.hostGrid === this) {
                prev._detachEmitter();
            }
            this._dataSource._attachEmitter(this._plugin);
            this._plugin.emitEvent({
                source: 'ds',
                kind: 'onDataSource',
                prev,
                curr: value
            });
            // clear the context, new datasource
            this._extApi.contextApi.clear();
            if (value) {
                if (isDevMode()) {
                    value.onError.pipe(unrx(this, value)).subscribe(console.error.bind(console));
                }
                // We register to this event because it fires before the entire data-changing process starts.
                // This is required because `onRenderDataChanging` is fired async, just before the data is emitted.
                // Its not enough to clear the context when `setDataSource` is called, we also need to handle `refresh` calls which will not
                // trigger this method.
                value.onSourceChanging
                    .pipe(unrx(this, value))
                    .subscribe(() => {
                    if (this.config.get('table').clearContextOnSourceChanging) {
                        this._extApi.contextApi.clear();
                    }
                });
                // Run CD, scheduled as a micro-task, after each rendering
                value.onRenderDataChanging
                    .pipe(filter(({ event }) => !event.isInitial && (event.pagination.changed || event.sort.changed || event.filter.changed)), 
                // Context between the operations are not supported at the moment
                // Event for client side operations...
                // TODO: can we remove this? we clear the context with `onSourceChanging`
                tap(() => !this._store.primary && this._extApi.contextApi.clear()), switchMap(() => value.onRenderedDataChanged.pipe(take(1), mapTo(this.ds.renderLength))), observeOn(asapScheduler), unrx(this, value))
                    .subscribe(previousRenderLength => {
                    // If the number of rendered items has changed the grid will update the data and run CD on it.
                    // so we only update the rows.
                    if (previousRenderLength === this.ds.renderLength) {
                        this.rowsApi.syncRows(true);
                    }
                    else {
                        this.rowsApi.syncRows('header', true);
                        this.rowsApi.syncRows('footer', true);
                    }
                });
                // Handling no data overlay
                // Handling fallback minimum height.
                value.onRenderedDataChanged
                    .pipe(map(() => this.ds.renderLength), startWith(null), pairwise(), tap(([prev, curr]) => {
                    const noDataShowing = !!this._extApi.logicaps.noData.viewActive;
                    if ((curr > 0 && noDataShowing) || (curr === 0 && !noDataShowing)) {
                        this._extApi.logicaps.noData();
                    }
                }), observeOn(animationFrameScheduler), // ww want to give the browser time to remove/add rows
                unrx(this, value))
                    .subscribe(() => {
                    const el = this.viewport.element;
                    if (this.ds.renderLength > 0 && this._minDataViewHeight) {
                        let h;
                        if (this._minDataViewHeight > 0) {
                            h = Math.min(this._minDataViewHeight, this.viewport.measureRenderedContentSize());
                        }
                        else {
                            const rowHeight = this.findInitialRowHeight();
                            const rowCount = Math.min(this.ds.renderLength, this._minDataViewHeight * -1);
                            h = rowHeight * rowCount;
                        }
                        el.style.minHeight = h + 'px';
                        // We need to trigger CD when not using virtual scroll or else the rows won't show on initial load, only after user interactions
                        if (!this.viewport.enabled) {
                            this.rowsApi.syncRows(true);
                        }
                    }
                });
            }
        }
    }
    /**
     * Invalidates the header, including a full rebuild of column headers
     */
    invalidateColumns() {
        this._plugin.emitEvent({ source: 'grid', kind: 'beforeInvalidateHeaders' });
        this._extApi.contextApi.clear();
        this._store.invalidate(this.columns);
        this._store.attachCustomCellTemplates();
        this._store.attachCustomHeaderCellTemplates();
        this._cdkTable.clearHeaderRowDefs();
        this._cdkTable.clearFooterRowDefs();
        // this.cdr.markForCheck();
        this.cdr.detectChanges();
        // after invalidating the headers we now have optional header/headerGroups/footer rows added
        // we need to update the template with this data which will create new rows (header/footer)
        this.resetHeaderRowDefs();
        this.resetFooterRowDefs();
        this.cdr.markForCheck();
        // Each row will rebuild it's own cells.
        // This will be done in the RowsApi, which listens to `onInvalidateHeaders`
        this._plugin.emitEvent({ source: 'grid', kind: 'onInvalidateHeaders' });
    }
    /**
     * Create an embedded view before or after the user projected content.
     */
    createView(location, templateRef, context, index) {
        const vcRef = this.getInternalVcRef(location);
        const view = vcRef.createEmbeddedView(templateRef, context, index);
        view.detectChanges();
        return view;
    }
    /**
     * Remove an already created embedded view.
     * @param view - The view to remove
     * @param location - The location, if not set defaults to `before`
     * @returns true when a view was removed, false when not. (did not exist in the view container for the provided location)
     */
    removeView(view, location) {
        const vcRef = this.getInternalVcRef(location);
        const idx = vcRef.indexOf(view);
        if (idx === -1) {
            return false;
        }
        else {
            vcRef.remove(idx);
            return true;
        }
    }
    /**
     * Resize all visible columns to fit content of the grid.
     * @param forceFixedWidth - When true will resize all columns with absolute pixel values, otherwise will keep the same format as originally set (% or none)
     */
    autoSizeColumnToFit(options) {
        const { innerWidth, outerWidth } = this.viewport;
        // calculate auto-size on the width without scroll bar and take box model gaps into account
        // TODO: if no scroll bar exists the calc will not include it, next if more rows are added a scroll bar will appear...
        this.columnApi.autoSizeToFit(outerWidth - (outerWidth - innerWidth), options);
    }
    findInitialRowHeight() {
        let rowElement;
        const row = this.rowsApi.findDataRowByIndex(0);
        if (row) {
            const height = getComputedStyle(row.element).height;
            return parseInt(height, 10);
        }
        else if (this._vcRefBeforeContent) {
            rowElement = this._vcRefBeforeContent.length > 0
                ? this._vcRefBeforeContent.get(0).rootNodes[0]
                : this._vcRefBeforeContent.element.nativeElement;
            rowElement = rowElement.previousElementSibling;
            rowElement.style.display = '';
            const height = getComputedStyle(rowElement).height;
            rowElement.style.display = 'none';
            return parseInt(height, 10);
        }
    }
    addClass(...cls) {
        for (const c of cls) {
            this.elRef.nativeElement.classList.add(c);
        }
    }
    removeClass(...cls) {
        for (const c of cls) {
            this.elRef.nativeElement.classList.remove(c);
        }
    }
    getInternalVcRef(location) {
        return location === 'beforeTable'
            ? this._vcRefBeforeTable
            : location === 'beforeContent' ? this._vcRefBeforeContent : this._vcRefAfterContent;
    }
    resetHeaderRowDefs() {
        if (this._headerRowDefs) {
            // The grid header (main, with column names) is always the last row def (index 0)
            // Because we want it to show last (after custom headers, group headers...) we first need to pull it and then push.
            this._cdkTable.clearHeaderRowDefs();
            const arr = this._headerRowDefs.toArray();
            arr.push(arr.shift());
            for (const rowDef of arr) {
                this._cdkTable.addHeaderRowDef(rowDef);
            }
        }
    }
    resetFooterRowDefs() {
        if (this._footerRowDefs) {
            this._cdkTable.clearFooterRowDefs();
            for (const rowDef of this._footerRowDefs.toArray()) {
                this._cdkTable.addFooterRowDef(rowDef);
            }
        }
    }
}
/** @nocollapse */ PblNgridComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridComponent, deps: [{ token: i0.Injector }, { token: i0.ViewContainerRef }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i1.PblNgridConfigService }, { token: i2.PblNgridRegistryService }, { token: 'id', attribute: true }, { token: i3.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridComponent, selector: "pbl-ngrid", inputs: { showHeader: "showHeader", showFooter: "showFooter", noFiller: "noFiller", focusMode: "focusMode", dataSource: "dataSource", usePagination: "usePagination", noCachePaginator: "noCachePaginator", columns: "columns", rowClassUpdate: "rowClassUpdate", rowClassUpdateFreq: "rowClassUpdateFreq", minDataViewHeight: "minDataViewHeight", fallbackMinHeight: "fallbackMinHeight" }, providers: [
        { provide: PBL_NGRID_COMPONENT, useExisting: PblNgridComponent },
        PblNgridRegistryService,
        {
            provide: PblNgridPluginController,
            useFactory: pluginControllerFactory,
            deps: [forwardRef((() => PblNgridComponent))],
        },
        {
            provide: EXT_API_TOKEN,
            useFactory: internalApiFactory,
            deps: [forwardRef((() => PblNgridComponent))],
        },
        {
            provide: PblNgridMetaRowService,
            useFactory: metaRowServiceFactory,
            deps: [forwardRef((() => PblNgridComponent))],
        }
    ], viewQueries: [{ propertyName: "_vcRefBeforeTable", first: true, predicate: ["beforeTable"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_vcRefBeforeContent", first: true, predicate: ["beforeContent"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_vcRefAfterContent", first: true, predicate: ["afterContent"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_fbTableCell", first: true, predicate: ["fbTableCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_fbHeaderCell", first: true, predicate: ["fbHeaderCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_fbFooterCell", first: true, predicate: ["fbFooterCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_tableRowDef", first: true, predicate: CdkRowDef, descendants: true, static: true }, { propertyName: "_headerRowDefs", predicate: CdkHeaderRowDef, descendants: true }, { propertyName: "_footerRowDefs", predicate: CdkFooterRowDef, descendants: true }], usesOnChanges: true, ngImport: i0, template: "<!-- GRID HEADER ROW DEF - THE MAIN HEADER OF THE GRID -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[]; sticky: columnRowDef.header?.type === 'sticky'\"\n                      [row]=\"columnRowDef.header\"\n                      class=\"pbl-ngrid-header-row-main\"></pbl-ngrid-column-row>\n\n<!-- DUPLICATE HEADER FOR THE MAIN HEADER, NEVER SEEN (NOT VISUAL), USED FOR RESIZING -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[];\"\n                      [row]=\"columnRowDef.header\"\n                      gridWidthRow\n                      style=\"visibility: hidden !important;\"\n                      class=\"pbl-ngrid-row-visually-hidden\"></pbl-ngrid-column-row>\n\n<!-- MULTI-HEADER ROW DEF & MULTI-HEADER GROUP ROW DEFINITION TEMPLATES -->\n<ng-container *ngFor=\"let row of metaHeaderRows;\">\n  <pbl-ngrid-meta-row *cdkHeaderRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<!-- GRID FOOTER ROW DEF -->\n<pbl-ngrid-column-row *cdkFooterRowDef=\"[]; sticky: columnRowDef.footer?.type === 'sticky'\"\n                      footer [row]=\"columnRowDef.footer\"></pbl-ngrid-column-row>\n<!-- GRID FOOTER ROW DEF -->\n<!-- MULTI-FOOTER ROW DEF -->\n<ng-container *ngFor=\"let row of metaFooterRows;\">\n  <pbl-ngrid-meta-row footer *cdkFooterRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<div class=\"pbl-ngrid-container\">\n  <ng-container #beforeTable></ng-container>\n  <div pbl-ngrid-fixed-meta-row-container=\"header\"></div>\n  <pbl-cdk-virtual-scroll-viewport class=\"pbl-ngrid-scroll-container\"\n                                   [stickyRowHeaderContainer]=\"stickyRowHeaderContainer\" [stickyRowFooterContainer]=\"stickyRowFooterContainer\">\n    <pbl-cdk-table tabindex=\"-1\">\n      <!-- Row templates. The columns used are set at the row template level -->\n\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n      <!-- We dont need columns because we implement them internally -->\n      <pbl-ngrid-row *pblNgridRowDef=\"let row;\" row></pbl-ngrid-row>\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n    </pbl-cdk-table>\n  </pbl-cdk-virtual-scroll-viewport>\n  <div pbl-ngrid-fixed-meta-row-container=\"footer\"></div>\n\n  <ng-container #beforeContent>\n    <!-- This dummy row is used to extract an initial row height -->\n    <div role=\"row\" row=\"\" class=\"pbl-ngrid-row cdk-row\" style=\"display: none;\"></div>\n  </ng-container>\n  <ng-content></ng-content>\n  <ng-container #afterContent></ng-container>\n\n  <!-- Placeholder for header/footer scroll containers that will get populated with header/meta roles when the following conditions are met:\n       - Virtual scrolling is enabled\n       - Rows are rendered in the viewport\n       - Container is scrolling\n\n       The placeholder is fixed so the browsers does not use sticky positioning while scrolling, which takes the rows out of view while scrolling.\n       While scrolling the rows are moved into this placeholder and when scrolling ends they return to their original positioning.\n\n       The actual rows are added into the internal div, within the placeholder.\n       The top container get the proper width and the internal header gets the scroll offset (horizontal) that matches the current offset.\n       This has an effect only when scrolling with the wheel within a long scrolling session.\n\n       Implementation is in the virtual scroll viewport (more precisely in `PblVirtualScrollForOf`)\n  -->\n  <div #stickyRowHeaderContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- HEADERS -->\n  <div #stickyRowFooterContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- FOOTERS -->\n</div>\n\n<ng-template #fbTableCell let-value=\"value\"><div>{{value}}</div></ng-template>\n<ng-template #fbHeaderCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n<ng-template #fbFooterCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n", dependencies: [{ kind: "directive", type: i4.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i5.CdkHeaderRowDef, selector: "[cdkHeaderRowDef]", inputs: ["cdkHeaderRowDef", "cdkHeaderRowDefSticky"] }, { kind: "directive", type: i5.CdkFooterRowDef, selector: "[cdkFooterRowDef]", inputs: ["cdkFooterRowDef", "cdkFooterRowDefSticky"] }, { kind: "component", type: i6.PblNgridMetaRowContainerComponent, selector: "div[pbl-ngrid-fixed-meta-row-container]", inputs: ["pbl-ngrid-fixed-meta-row-container"] }, { kind: "component", type: i7.PblCdkTableComponent, selector: "pbl-cdk-table", exportAs: ["pblCdkTable"] }, { kind: "directive", type: i8.PblNgridRowDef, selector: "[pblNgridRowDef]", inputs: ["pblNgridRowDefColumns", "pblNgridRowDefWhen"] }, { kind: "component", type: i9.PblNgridRowComponent, selector: "pbl-ngrid-row[row]", exportAs: ["pblNgridRow"] }, { kind: "component", type: i10.PblNgridColumnRowComponent, selector: "pbl-ngrid-column-row", inputs: ["row"] }, { kind: "component", type: i11.PblNgridMetaRowComponent, selector: "pbl-ngrid-meta-row", inputs: ["row"] }, { kind: "component", type: i12.PblCdkVirtualScrollViewportComponent, selector: "pbl-cdk-virtual-scroll-viewport", inputs: ["stickyRowHeaderContainer", "stickyRowFooterContainer"], outputs: ["scrolling", "scrollFrameRate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid', providers: [
                        { provide: PBL_NGRID_COMPONENT, useExisting: PblNgridComponent },
                        PblNgridRegistryService,
                        {
                            provide: PblNgridPluginController,
                            useFactory: pluginControllerFactory,
                            deps: [forwardRef((() => PblNgridComponent))],
                        },
                        {
                            provide: EXT_API_TOKEN,
                            useFactory: internalApiFactory,
                            deps: [forwardRef((() => PblNgridComponent))],
                        },
                        {
                            provide: PblNgridMetaRowService,
                            useFactory: metaRowServiceFactory,
                            deps: [forwardRef((() => PblNgridComponent))],
                        }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<!-- GRID HEADER ROW DEF - THE MAIN HEADER OF THE GRID -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[]; sticky: columnRowDef.header?.type === 'sticky'\"\n                      [row]=\"columnRowDef.header\"\n                      class=\"pbl-ngrid-header-row-main\"></pbl-ngrid-column-row>\n\n<!-- DUPLICATE HEADER FOR THE MAIN HEADER, NEVER SEEN (NOT VISUAL), USED FOR RESIZING -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[];\"\n                      [row]=\"columnRowDef.header\"\n                      gridWidthRow\n                      style=\"visibility: hidden !important;\"\n                      class=\"pbl-ngrid-row-visually-hidden\"></pbl-ngrid-column-row>\n\n<!-- MULTI-HEADER ROW DEF & MULTI-HEADER GROUP ROW DEFINITION TEMPLATES -->\n<ng-container *ngFor=\"let row of metaHeaderRows;\">\n  <pbl-ngrid-meta-row *cdkHeaderRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<!-- GRID FOOTER ROW DEF -->\n<pbl-ngrid-column-row *cdkFooterRowDef=\"[]; sticky: columnRowDef.footer?.type === 'sticky'\"\n                      footer [row]=\"columnRowDef.footer\"></pbl-ngrid-column-row>\n<!-- GRID FOOTER ROW DEF -->\n<!-- MULTI-FOOTER ROW DEF -->\n<ng-container *ngFor=\"let row of metaFooterRows;\">\n  <pbl-ngrid-meta-row footer *cdkFooterRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<div class=\"pbl-ngrid-container\">\n  <ng-container #beforeTable></ng-container>\n  <div pbl-ngrid-fixed-meta-row-container=\"header\"></div>\n  <pbl-cdk-virtual-scroll-viewport class=\"pbl-ngrid-scroll-container\"\n                                   [stickyRowHeaderContainer]=\"stickyRowHeaderContainer\" [stickyRowFooterContainer]=\"stickyRowFooterContainer\">\n    <pbl-cdk-table tabindex=\"-1\">\n      <!-- Row templates. The columns used are set at the row template level -->\n\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n      <!-- We dont need columns because we implement them internally -->\n      <pbl-ngrid-row *pblNgridRowDef=\"let row;\" row></pbl-ngrid-row>\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n    </pbl-cdk-table>\n  </pbl-cdk-virtual-scroll-viewport>\n  <div pbl-ngrid-fixed-meta-row-container=\"footer\"></div>\n\n  <ng-container #beforeContent>\n    <!-- This dummy row is used to extract an initial row height -->\n    <div role=\"row\" row=\"\" class=\"pbl-ngrid-row cdk-row\" style=\"display: none;\"></div>\n  </ng-container>\n  <ng-content></ng-content>\n  <ng-container #afterContent></ng-container>\n\n  <!-- Placeholder for header/footer scroll containers that will get populated with header/meta roles when the following conditions are met:\n       - Virtual scrolling is enabled\n       - Rows are rendered in the viewport\n       - Container is scrolling\n\n       The placeholder is fixed so the browsers does not use sticky positioning while scrolling, which takes the rows out of view while scrolling.\n       While scrolling the rows are moved into this placeholder and when scrolling ends they return to their original positioning.\n\n       The actual rows are added into the internal div, within the placeholder.\n       The top container get the proper width and the internal header gets the scroll offset (horizontal) that matches the current offset.\n       This has an effect only when scrolling with the wheel within a long scrolling session.\n\n       Implementation is in the virtual scroll viewport (more precisely in `PblVirtualScrollForOf`)\n  -->\n  <div #stickyRowHeaderContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- HEADERS -->\n  <div #stickyRowFooterContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- FOOTERS -->\n</div>\n\n<ng-template #fbTableCell let-value=\"value\"><div>{{value}}</div></ng-template>\n<ng-template #fbHeaderCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n<ng-template #fbFooterCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n" }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ViewContainerRef }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i1.PblNgridConfigService }, { type: i2.PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['id']
                }] }, { type: i3.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { showHeader: [{
                type: Input
            }], showFooter: [{
                type: Input
            }], noFiller: [{
                type: Input
            }], focusMode: [{
                type: Input
            }], dataSource: [{
                type: Input
            }], usePagination: [{
                type: Input
            }], noCachePaginator: [{
                type: Input
            }], columns: [{
                type: Input
            }], rowClassUpdate: [{
                type: Input
            }], rowClassUpdateFreq: [{
                type: Input
            }], minDataViewHeight: [{
                type: Input
            }], fallbackMinHeight: [{
                type: Input
            }], _vcRefBeforeTable: [{
                type: ViewChild,
                args: ['beforeTable', { read: ViewContainerRef, static: true }]
            }], _vcRefBeforeContent: [{
                type: ViewChild,
                args: ['beforeContent', { read: ViewContainerRef, static: true }]
            }], _vcRefAfterContent: [{
                type: ViewChild,
                args: ['afterContent', { read: ViewContainerRef, static: true }]
            }], _fbTableCell: [{
                type: ViewChild,
                args: ['fbTableCell', { read: TemplateRef, static: true }]
            }], _fbHeaderCell: [{
                type: ViewChild,
                args: ['fbHeaderCell', { read: TemplateRef, static: true }]
            }], _fbFooterCell: [{
                type: ViewChild,
                args: ['fbFooterCell', { read: TemplateRef, static: true }]
            }], _tableRowDef: [{
                type: ViewChild,
                args: [CdkRowDef, { static: true }]
            }], _headerRowDefs: [{
                type: ViewChildren,
                args: [CdkHeaderRowDef]
            }], _footerRowDefs: [{
                type: ViewChildren,
                args: [CdkFooterRowDef]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyaWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvbmdyaWQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvbmdyaWQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5RCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRyxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsRUFFVCxpQkFBaUIsRUFJakIsaUJBQWlCLEVBQ2pCLFdBQVcsRUFDWCxnQkFBZ0IsRUFFaEIsTUFBTSxFQUNOLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsR0FDM0MsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFhLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsb0JBQW9CLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRyxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVqRixPQUFPLEVBQ0wscUJBQXFCLEVBSStDLGFBQWEsRUFBZ0IsUUFBUSxFQUt6RyxpQkFBaUIsRUFBRSxJQUFJLEdBQ3hCLE1BQU0sb0JBQW9CLENBQUM7QUFFNUIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sV0FB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ZWR1bGVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIsIHRha2UsIHRhcCwgb2JzZXJ2ZU9uLCBzd2l0Y2hNYXAsIG1hcCwgbWFwVG8sIHN0YXJ0V2l0aCwgcGFpcndpc2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBJbmplY3RvcixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgaXNEZXZNb2RlLCBmb3J3YXJkUmVmLCBBdHRyaWJ1dGUsIE9wdGlvbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXQgfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHsgQ2RrSGVhZGVyUm93RGVmLCBDZGtGb290ZXJSb3dEZWYsIENka1Jvd0RlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmltcG9ydCB7XG4gIFBibE5ncmlkQ29uZmlnU2VydmljZSxcblxuICBQYmxOZ3JpZFBhZ2luYXRvcktpbmQsXG5cbiAgRGF0YVNvdXJjZVByZWRpY2F0ZSwgRGF0YVNvdXJjZUZpbHRlclRva2VuLCBQYmxOZ3JpZFNvcnREZWZpbml0aW9uLCBQYmxEYXRhU291cmNlLCBEYXRhU291cmNlT2YsIGNyZWF0ZURTLCBQYmxOZ3JpZE9uRGF0YVNvdXJjZUV2ZW50LFxuXG4gIFBibE5ncmlkQ29sdW1uRGVmaW5pdGlvblNldCxcbiAgUGJsTWV0YVJvd0RlZmluaXRpb25zLFxuXG4gIGRlcHJlY2F0ZWRXYXJuaW5nLCB1bnJ4LFxufSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQQkxfTkdSSURfQ09NUE9ORU5UIH0gZnJvbSAnLi4vdG9rZW5zJztcbmltcG9ydCB7IEVYVF9BUElfVE9LRU4sIFBibE5ncmlkRXh0ZW5zaW9uQXBpLCBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIFBibE5ncmlkUGx1Z2luQ29udGV4dCB9IGZyb20gJy4uL2V4dC9wbHVnaW4tY29udHJvbCc7XG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4vcmVnaXN0cnkvcmVnaXN0cnkuc2VydmljZSc7XG5pbXBvcnQgeyBQYmxDZGtUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4vcGJsLWNkay10YWJsZS9wYmwtY2RrLXRhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxDb2x1bW4sIFBibE5ncmlkQ29sdW1uU2V0LCAgfSBmcm9tICcuL2NvbHVtbi9tb2RlbCc7XG5pbXBvcnQgeyBQYmxDb2x1bW5TdG9yZSwgQ29sdW1uQXBpLCBBdXRvU2l6ZVRvRml0T3B0aW9ucyB9IGZyb20gJy4vY29sdW1uL21hbmFnZW1lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsQ29udGV4dCwgUGJsTmdyaWRNZXRhQ2VsbENvbnRleHQsIFBibE5ncmlkQ29udGV4dEFwaSwgUGJsTmdyaWRSb3dDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0L2luZGV4JztcbmltcG9ydCB7IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4vZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvdmlydHVhbC1zY3JvbGwtdmlld3BvcnQuY29tcG9uZW50JztcbmltcG9ydCB7IFBibE5ncmlkTWV0YVJvd1NlcnZpY2UgfSBmcm9tICcuL21ldGEtcm93cy9tZXRhLXJvdy5zZXJ2aWNlJztcblxuaW1wb3J0IHsgUm93c0FwaSB9IGZyb20gJy4vcm93JztcbmltcG9ydCB7IGNyZWF0ZUFwaXMgfSBmcm9tICcuL2FwaS1mYWN0b3J5JztcblxuZXhwb3J0IGZ1bmN0aW9uIGludGVybmFsQXBpRmFjdG9yeShncmlkOiB7IF9leHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpOyB9KSB7IHJldHVybiBncmlkLl9leHRBcGk7IH1cbmV4cG9ydCBmdW5jdGlvbiBwbHVnaW5Db250cm9sbGVyRmFjdG9yeShncmlkOiB7IF9wbHVnaW46IFBibE5ncmlkUGx1Z2luQ29udGV4dDsgfSkgeyByZXR1cm4gZ3JpZC5fcGx1Z2luLmNvbnRyb2xsZXI7IH1cbmV4cG9ydCBmdW5jdGlvbiBtZXRhUm93U2VydmljZUZhY3RvcnkoZ3JpZDogeyBfZXh0QXBpOiBQYmxOZ3JpZEV4dGVuc2lvbkFwaTsgfSkgeyByZXR1cm4gZ3JpZC5fZXh0QXBpLnJvd3NBcGkubWV0YVJvd1NlcnZpY2U7IH1cblxuZGVjbGFyZSBtb2R1bGUgJy4uL2V4dC90eXBlcycge1xuICBpbnRlcmZhY2UgT25Qcm9wQ2hhbmdlZFNvdXJjZXMge1xuICAgIGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50O1xuICB9XG4gIGludGVyZmFjZSBPblByb3BDaGFuZ2VkUHJvcGVydGllcyB7XG4gICAgZ3JpZDogUGljazxQYmxOZ3JpZENvbXBvbmVudCwgJ3Nob3dGb290ZXInIHwgJ3Nob3dIZWFkZXInIHwgJ3Jvd0NsYXNzVXBkYXRlJyB8ICdyb3dDbGFzc1VwZGF0ZUZyZXEnPjtcbiAgfVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWQnLFxuICB0ZW1wbGF0ZVVybDogJy4vbmdyaWQuY29tcG9uZW50Lmh0bWwnLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogUEJMX05HUklEX0NPTVBPTkVOVCwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkQ29tcG9uZW50fSxcbiAgICBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsXG4gICAgICB1c2VGYWN0b3J5OiBwbHVnaW5Db250cm9sbGVyRmFjdG9yeSxcbiAgICAgIGRlcHM6IFtmb3J3YXJkUmVmKCgpID0+IFBibE5ncmlkQ29tcG9uZW50KV0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBFWFRfQVBJX1RPS0VOLFxuICAgICAgdXNlRmFjdG9yeTogaW50ZXJuYWxBcGlGYWN0b3J5LFxuICAgICAgZGVwczogW2ZvcndhcmRSZWYoKCkgPT4gUGJsTmdyaWRDb21wb25lbnQpXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IFBibE5ncmlkTWV0YVJvd1NlcnZpY2UsXG4gICAgICB1c2VGYWN0b3J5OiBtZXRhUm93U2VydmljZUZhY3RvcnksXG4gICAgICBkZXBzOiBbZm9yd2FyZFJlZigoKSA9PiBQYmxOZ3JpZENvbXBvbmVudCldLFxuICAgIH1cbiAgXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ29tcG9uZW50PFQgPSBhbnk+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuXG4gIC8qKlxuICAgKiBTaG93L0hpZGUgdGhlIGhlYWRlciByb3cuXG4gICAqIERlZmF1bHQ6IHRydWVcbiAgICovXG4gIEBJbnB1dCgpIGdldCBzaG93SGVhZGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc2hvd0hlYWRlcjsgfTtcbiAgc2V0IHNob3dIZWFkZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9leHRBcGkubm90aWZ5UHJvcENoYW5nZWQodGhpcywgJ3Nob3dIZWFkZXInLCB0aGlzLl9zaG93SGVhZGVyLCB0aGlzLl9zaG93SGVhZGVyID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKSk7XG4gIH1cbiAgX3Nob3dIZWFkZXI6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFNob3cvSGlkZSB0aGUgZm9vdGVyIHJvdy5cbiAgICogRGVmYXVsdDogZmFsc2VcbiAgICovXG4gIEBJbnB1dCgpIGdldCBzaG93Rm9vdGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc2hvd0Zvb3RlcjsgfTtcbiAgc2V0IHNob3dGb290ZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9leHRBcGkubm90aWZ5UHJvcENoYW5nZWQodGhpcywgJ3Nob3dGb290ZXInLCB0aGlzLl9zaG93Rm9vdGVyLCB0aGlzLl9zaG93Rm9vdGVyID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKSk7XG4gIH1cbiAgX3Nob3dGb290ZXI6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZW4gdHJ1ZSwgdGhlIGZpbGxlciBpcyBkaXNhYmxlZC5cbiAgICovXG4gIEBJbnB1dCgpIGdldCBub0ZpbGxlcigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX25vRmlsbGVyOyB9O1xuICBzZXQgbm9GaWxsZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9ub0ZpbGxlciA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgX25vRmlsbGVyOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTZXQncyB0aGUgYmVoYXZpb3Igb2YgdGhlIGdyaWQgd2hlbiB0YWJiaW5nLlxuICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyBub25lIChyb3dzIGFuZCBjZWxscyBhcmUgbm90IGZvY3VzYWJsZSlcbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBmb2N1cyBtb2RlIGhhcyBhbiBlZmZlY3Qgb24gb3RoZXIgZnVuY3Rpb25zLCBmb3IgZXhhbXBsZSBhIGRldGFpbCByb3cgd2lsbCB0b2dnbGUgKG9wZW4vY2xvc2UpIHVzaW5nXG4gICAqIEVOVEVSIC8gU1BBQ0Ugb25seSB3aGVuIGZvY3VzTW9kZSBpcyBzZXQgdG8gYHJvd2AuXG4gICAqL1xuICBASW5wdXQoKSBmb2N1c01vZGU6ICdyb3cnIHwgJ2NlbGwnIHwgJ25vbmUnIHwgJycgfCBmYWxzZSB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGdyaWQncyBzb3VyY2Ugb2YgZGF0YVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBUaGUgZ3JpZCdzIHNvdXJjZSBvZiBkYXRhLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgaW4gMiB3YXlzOlxuICAgKlxuICAgKiAtIERhdGFTb3VyY2VPZjxUPlxuICAgKiAtIFBibERhdGFTb3VyY2U8VD5cbiAgICpcbiAgICogVGhlIGdyaWQgb25seSB3b3JrcyB3aXRoIGBQYmxEYXRhU291cmNlPFQ+YCwgYERhdGFTb3VyY2VPZjxUPmAgaXMgYSBzaG9ydGN1dCBmb3IgcHJvdmlkaW5nXG4gICAqIHRoZSBkYXRhIGFycmF5IGRpcmVjdGx5LlxuICAgKlxuICAgKiBgRGF0YVNvdXJjZU9mPFQ+YCBjYW4gYmU6XG4gICAqXG4gICAqIC0gU2ltcGxlIGRhdGEgYXJyYXkgKGVhY2ggb2JqZWN0IHJlcHJlc2VudHMgb25lIGdyaWQgcm93KVxuICAgKiAtIFByb21pc2UgZm9yIGEgZGF0YSBhcnJheVxuICAgKiAtIFN0cmVhbSB0aGF0IGVtaXRzIGEgZGF0YSBhcnJheSBlYWNoIHRpbWUgdGhlIGFycmF5IGNoYW5nZXNcbiAgICpcbiAgICogV2hlbiBhIGBEYXRhU291cmNlT2Y8VD5gIGlzIHByb3ZpZGVkIGl0IGlzIGNvbnZlcnRlZCBpbnRvIGFuIGluc3RhbmNlIG9mIGBQYmxEYXRhU291cmNlPFQ+YC5cbiAgICpcbiAgICogVG8gYWNjZXNzIHRoZSBgUGJsRGF0YVNvdXJjZTxUPmAgaW5zdGFuY2UgdXNlIHRoZSBgZHNgIHByb3BlcnR5IChyZWFkb25seSkuXG4gICAqXG4gICAqIEl0IGlzIGhpZ2hseSByZWNvbW1lbmRlZCB0byB1c2UgYFBibERhdGFTb3VyY2U8VD5gIGRpcmVjdGx5LCB0aGUgZGF0YXNvdXJjZSBmYWN0b3J5IG1ha2VzIGl0IGVhc3kuXG4gICAqIEZvciBleGFtcGxlLCB3aGVuIGFuIGFycmF5IGlzIHByb3ZpZGVkIHRoZSBmYWN0b3J5IGlzIHVzZWQgdG8gY29udmVydCBpdCB0byBhIGRhdGFzb3VyY2U6XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29sbGVjdGlvbjogVFtdID0gW107XG4gICAqIGNvbnN0IHBibERhdGFTb3VyY2UgPSBjcmVhdGVEUzxUPigpLm9uVHJpZ2dlciggKCkgPT4gY29sbGVjdGlvbiApLmNyZWF0ZSgpO1xuICAgKiBgYGBcbiAgICpcbiAgICogPiBUaGlzIGlzIGEgd3JpdGUtb25seSAoc2V0dGVyKSBwcm9wZXJ0eSB0aGF0IHRyaWdnZXJzIHRoZSBgc2V0RGF0YVNvdXJjZWAgbWV0aG9kLlxuICAgKi9cbiAgQElucHV0KCkgc2V0IGRhdGFTb3VyY2UodmFsdWU6IFBibERhdGFTb3VyY2U8VD4gfCBEYXRhU291cmNlT2Y8VD4pIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQYmxEYXRhU291cmNlKSB7XG4gICAgICB0aGlzLnNldERhdGFTb3VyY2UodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldERhdGFTb3VyY2UoY3JlYXRlRFM8VD4oKS5vblRyaWdnZXIoICgpID0+IHZhbHVlIHx8IFtdICkuY3JlYXRlKCkpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBkcygpOiBQYmxEYXRhU291cmNlPFQ+IHsgcmV0dXJuIHRoaXMuX2RhdGFTb3VyY2U7IH07XG5cbiAgQElucHV0KCkgZ2V0IHVzZVBhZ2luYXRpb24oKTogUGJsTmdyaWRQYWdpbmF0b3JLaW5kIHwgZmFsc2UgfCAnJyB7IHJldHVybiB0aGlzLl9wYWdpbmF0aW9uOyB9XG4gIHNldCB1c2VQYWdpbmF0aW9uKHZhbHVlOiBQYmxOZ3JpZFBhZ2luYXRvcktpbmQgfCBmYWxzZSB8ICcnKSB7XG4gICAgaWYgKCh2YWx1ZSBhcyBhbnkpID09PSAnJykge1xuICAgICAgdmFsdWUgPSAncGFnZU51bWJlcic7XG4gICAgfVxuICAgIGlmICggdmFsdWUgIT09IHRoaXMuX3BhZ2luYXRpb24gKSB7XG4gICAgICB0aGlzLl9wYWdpbmF0aW9uID0gdmFsdWUgYXMgYW55O1xuICAgICAgdGhpcy5fZXh0QXBpLmxvZ2ljYXBzLnBhZ2luYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKSBnZXQgbm9DYWNoZVBhZ2luYXRvcigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX25vQ2FjaGVQYWdpbmF0b3I7IH1cbiAgc2V0IG5vQ2FjaGVQYWdpbmF0b3IodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB2YWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgaWYgKHRoaXMuX25vQ2FjaGVQYWdpbmF0b3IgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl9ub0NhY2hlUGFnaW5hdG9yID0gdmFsdWU7XG4gICAgICBpZiAodGhpcy5kcyAmJiB0aGlzLmRzLnBhZ2luYXRvcikge1xuICAgICAgICB0aGlzLmRzLnBhZ2luYXRvci5ub0NhY2hlTW9kZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29sdW1uIGRlZmluaXRpb25zIGZvciB0aGlzIGdyaWQuXG4gICAqL1xuICBASW5wdXQoKSBjb2x1bW5zOiBQYmxOZ3JpZENvbHVtblNldCB8IFBibE5ncmlkQ29sdW1uRGVmaW5pdGlvblNldDtcblxuICBASW5wdXQoKSByb3dDbGFzc1VwZGF0ZTogdW5kZWZpbmVkIHwgKCAoY29udGV4dDogUGJsTmdyaWRSb3dDb250ZXh0PFQ+KSA9PiAoIHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4gfCB7IFtrbGFzczogc3RyaW5nXTogYW55IH0gKSk7XG4gIEBJbnB1dCgpIHJvd0NsYXNzVXBkYXRlRnJlcTogJ2l0ZW0nIHwgJ25nRG9DaGVjaycgfCAnbm9uZScgPSAnaXRlbSc7XG5cbiAgcm93Rm9jdXM6IDAgfCAnJyA9ICcnO1xuICBjZWxsRm9jdXM6IDAgfCAnJyA9ICcnO1xuXG4gIC8qKlxuICAgKiBUaGUgbWluaW11bSBoZWlnaHQgdG8gYXNzaWduIHRvIHRoZSBkYXRhIHZpZXdwb3J0ICh3aGVyZSBkYXRhIHJvd3MgYXJlIHNob3duKVxuICAgKlxuICAgKiBUaGUgZGF0YSB2aWV3cG9ydCBpcyB0aGUgc2Nyb2xsYWJsZSBhcmVhIHdoZXJlIGFsbCBkYXRhIHJvd3MgYXJlIHZpc2libGUsIGFuZCBzb21lIG1ldGFkYXRhIHJvd3MgbWlnaHQgYWxzbyBiZSB0aGVyZVxuICAgKiBkZXBlbmRpbmcgb24gdGhlaXIgdHlwZSAoZml4ZWQvcm93L3N0aWNreSkgYXMgd2VsbCBhcyBvdXRlciBzZWN0aW9uIGl0ZW1zLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB0aGUgZGF0YSB2aWV3cG9ydCBoYXMgbm8gc2l6ZSBhbmQgaXQgd2lsbCBncm93IGJhc2VkIG9uIHRoZSBhdmFpbGFibGUgc3BhY2UgaXQgaGFzIGxlZnQgd2l0aGluIHRoZSBjb250YWluZXIuXG4gICAqIFRoZSBjb250YWluZXIgd2lsbCBmaXJzdCBhc3NpZ24gaGVpZ2h0IHRvIGFueSBmaXhlZCByb3dzIGFuZCBkeW5hbWljIGNvbnRlbnQgKGJlZm9yZS9hZnRlcikgcHJvdmlkZWQuXG4gICAqXG4gICAqIElmIHRoZSBjb250YWluZXIgaGVpZ2h0IGlzIGZpeGVkIChlLmcuIGA8cGJsLW5ncmlkIHN0eWxlPVwiaGVpZ2h0OiA1MDBweFwiPjwvcGJsLW5ncmlkPmApIGFuZCB0aGVyZSBpcyBubyBoZWlnaHQgbGVmdFxuICAgKiBmb3IgdGhlIGRhdGEgdmlld3BvcnQgdGhlbiBpdCB3aWxsIGdldCBubyBoZWlnaHQgKDAgaGVpZ2h0KS5cbiAgICpcbiAgICogVG8gZGVhbCB3aXRoIHRoaXMgaXNzdWUgdGhlcmUgYXJlIDIgb3B0aW9uczpcbiAgICpcbiAgICogMS4gRG8gbm90IGxpbWl0IHRoZSBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lclxuICAgKiAyLiBQcm92aWRlIGEgZGVmYXVsdCBtaW5pbXVtIGhlaWdodCBmb3IgdGhlIGRhdGEgdmlld3BvcnRcbiAgICpcbiAgICogT3B0aW9uIG51bWJlciAxIGlzIG5vdCBwcmFjdGljYWwsIGl0IHdpbGwgZGlzYWJsZSBhbGwgc2Nyb2xsaW5nIGluIHRoZSB0YWJsZSwgbWFraW5nIGl0IGEgbG9uZyBib3ggc2Nyb2xsYWJsZSBieSB0aGUgaG9zdCBjb250YWluZXIuXG4gICAqXG4gICAqIFRoaXMgaXMgd2hlcmUgd2UgdXNlIG9wdGlvbiBudW1iZXIgMi5cbiAgICogQnkgZGVmaW5pbmcgYSBkZWZhdWx0IG1pbmltdW0gaGVpZ2h0IHdlIGVuc3VyZSB2aXNpYmlsaXR5IGFuZCBzaW5jZSB0aGVyZSdzIGEgc2Nyb2xsIHRoZXJlLCB0aGUgdXNlciBjYW4gdmlldyBhbGwgb2YgdGhlIGRhdGEuXG4gICAqXG4gICAqIFRoZXJlIGFyZSAyIHR5cGVzIG9mIGlucHV0czpcbiAgICpcbiAgICogQS4gRGVmYXVsdCBtaW5pbXVtIGhlaWdodCBpbiBQWFxuICAgKiBCLiBEZWZhdWx0IG1pbmltdW0gaGVpZ2h0IGluIFJPVyBDT1VOVFxuICAgKlxuICAgKiBGb3IgQSwgcHJvdmlkZSBhIHBvc2l0aXZlIHZhbHVlLCBmb3IgQiBwcm92aWRlIGEgbmVnYXRpdmUgdmFsdWUuXG4gICAqXG4gICAqIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgLSBNaW5pbXVtIGRhdGEgdmlld3BvcnQgb2YgMTAwIHBpeGVsczogYDxwYmwtbmdyaWQgbWluRGF0YVZpZXdIZWlnaHQ9XCIxMDBcIj48L3BibC1uZ3JpZD5gXG4gICAqICAtIE1pbmltdW0gZGF0YSB2aWV3cG9ydCBvZiAyIHJvczogYDxwYmwtbmdyaWQgbWluRGF0YVZpZXdIZWlnaHQ9XCItMlwiPjwvcGJsLW5ncmlkPmBcbiAgICpcbiAgICogTm90ZXMgd2hlbiB1c2luZyByb3dzOlxuICAgKiAgLSBUaGUgcm93IGhlaWdodCBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIGFuIGluaXRpYWwgcm93IHByZS1sb2FkZWQgYnkgdGhlIGdyaWQsIHRoaXMgcm93IHdpbGwgZ2V0IGl0J3MgaGVpZ2h0IGZyb20gdGhlIENTUyB0aGVtZSBkZWZpbmVkLlxuICAgKiAgLSBUaGUgUk9XIENPVU5UIGlzIHRoZSBsb3dlciB2YWx1ZSBiZXR3ZWVuIHRoZSBhY3R1YWwgcm93IGNvdW50IHByb3ZpZGVkIGFuZCB0aGUgdG90YWwgcm93cyB0byByZW5kZXIuXG4gICAqXG4gICAqICMjIENvbnRhaW5lciBPdmVyZmxvdzpcbiAgICpcbiAgICogTm90ZSB0aGF0IHdoZW4gdXNpbmcgYSBkZWZhdWx0IG1pbmltdW0gaGVpZ2h0LCBpZiB0aGUgbWluaW11bSBoZWlnaHQgb2YgdGhlIGRhdGEgdmlld3BvcnQgUExVUyB0aGUgaGVpZ2h0IG9mIGFsbCBvdGhlciBlbGVtZW50cyBpbiB0aGUgY29udGFpbmVyIEVYQ0VFRFMgYW55IGZpeGVkXG4gICAqIGhlaWdodCBhc3NpZ25lZCB0byB0aGUgY29udGFpbmVyLCB0aGUgY29udGFpbmVyIHdpbGwgcmVuZGVyIGEgc2Nyb2xsYmFyIHdoaWNoIHJlc3VsdHMgaW4gdGhlIHBvc3NpYmlsaXR5IG9mIDIgc2Nyb2xsYmFycywgMSBmb3IgdGhlIGNvbnRhaW5lciBhbmQgdGhlIHNlY29uZHNcbiAgICogZm9yIHRoZSBkYXRhIHZpZXdwb3J0LCBpZiBpdCBoYXMgZW5vdWdoIGRhdGEgcm93cy5cbiAgICovXG4gIEBJbnB1dCgpIGdldCBtaW5EYXRhVmlld0hlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5EYXRhVmlld0hlaWdodDsgfVxuICBzZXQgbWluRGF0YVZpZXdIZWlnaHQodmFsdWU6IG51bWJlcikge1xuICAgIHZhbHVlID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICAgIGlmICh0aGlzLl9taW5EYXRhVmlld0hlaWdodCAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuX21pbkRhdGFWaWV3SGVpZ2h0ID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCBpbiB2NSwgc2VlIGBtaW5EYXRhVmlld0hlaWdodGBcbiAgICovXG4gIEBJbnB1dCgpIGdldCBmYWxsYmFja01pbkhlaWdodCgpOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nKCdQYmxOZ3JpZENvbXBvbmVudC5mYWxsYmFja01pbkhlaWdodCcsICc0JywgJ1BibE5ncmlkQ29tcG9uZW50Lm1pbkRhdGFWaWV3SGVpZ2h0Jyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9taW5EYXRhVmlld0hlaWdodCA+IDAgPyB0aGlzLl9taW5EYXRhVmlld0hlaWdodCA6IHVuZGVmaW5lZDtcbiAgfVxuICBzZXQgZmFsbGJhY2tNaW5IZWlnaHQodmFsdWU6IG51bWJlcikge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nKCdQYmxOZ3JpZENvbXBvbmVudC5mYWxsYmFja01pbkhlaWdodCcsICc0JywgJ1BibE5ncmlkQ29tcG9uZW50Lm1pbkRhdGFWaWV3SGVpZ2h0Jyk7XG4gICAgfVxuICAgIHRoaXMubWluRGF0YVZpZXdIZWlnaHQgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBkaXIoKTogRGlyZWN0aW9uIHsgcmV0dXJuIHRoaXMuX2RpciB9O1xuXG4gIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uID0gJ2x0cic7XG4gIHByaXZhdGUgX21pbkRhdGFWaWV3SGVpZ2h0ID0gMDtcbiAgcHJpdmF0ZSBfZGF0YVNvdXJjZTogUGJsRGF0YVNvdXJjZTxUPjtcblxuICBAVmlld0NoaWxkKCdiZWZvcmVUYWJsZScsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0pIF92Y1JlZkJlZm9yZVRhYmxlOiBWaWV3Q29udGFpbmVyUmVmO1xuICBAVmlld0NoaWxkKCdiZWZvcmVDb250ZW50JywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSkgX3ZjUmVmQmVmb3JlQ29udGVudDogVmlld0NvbnRhaW5lclJlZjtcbiAgQFZpZXdDaGlsZCgnYWZ0ZXJDb250ZW50JywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSkgX3ZjUmVmQWZ0ZXJDb250ZW50OiBWaWV3Q29udGFpbmVyUmVmO1xuICBAVmlld0NoaWxkKCdmYlRhYmxlQ2VsbCcsIHsgcmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZSB9KSBfZmJUYWJsZUNlbGw6IFRlbXBsYXRlUmVmPFBibE5ncmlkQ2VsbENvbnRleHQ8VD4+O1xuICBAVmlld0NoaWxkKCdmYkhlYWRlckNlbGwnLCB7IHJlYWQ6IFRlbXBsYXRlUmVmLCBzdGF0aWM6IHRydWUgfSkgX2ZiSGVhZGVyQ2VsbDogVGVtcGxhdGVSZWY8UGJsTmdyaWRNZXRhQ2VsbENvbnRleHQ8VD4+O1xuICBAVmlld0NoaWxkKCdmYkZvb3RlckNlbGwnLCB7IHJlYWQ6IFRlbXBsYXRlUmVmLCBzdGF0aWM6IHRydWUgfSkgX2ZiRm9vdGVyQ2VsbDogVGVtcGxhdGVSZWY8UGJsTmdyaWRNZXRhQ2VsbENvbnRleHQ8VD4+O1xuICBAVmlld0NoaWxkKENka1Jvd0RlZiwgeyBzdGF0aWM6IHRydWUgfSkgX3RhYmxlUm93RGVmOiBDZGtSb3dEZWY8VD47XG4gIEBWaWV3Q2hpbGRyZW4oQ2RrSGVhZGVyUm93RGVmKSBfaGVhZGVyUm93RGVmczogUXVlcnlMaXN0PENka0hlYWRlclJvd0RlZj47XG4gIEBWaWV3Q2hpbGRyZW4oQ2RrRm9vdGVyUm93RGVmKSBfZm9vdGVyUm93RGVmczogUXVlcnlMaXN0PENka0Zvb3RlclJvd0RlZj47XG5cbiAgLyoqXG4gICAqIFdoZW4gdHJ1ZSwgdGhlIHZpcnR1YWwgcGFnaW5nIGZlYXR1cmUgaXMgZW5hYmxlZCBiZWNhdXNlIHRoZSB2aXJ0dWFsIGNvbnRlbnQgc2l6ZSBleGNlZWQgdGhlIHN1cHBvcnRlZCBoZWlnaHQgb2YgdGhlIGJyb3dzZXIgc28gcGFnaW5nIGlzIGVuYWJsZS5cbiAgICovXG4gIGdldCB2aXJ0dWFsUGFnaW5nQWN0aXZlKCkgeyByZXR1cm4gdGhpcy52aWV3cG9ydC52aXJ0dWFsUGFnaW5nQWN0aXZlOyB9XG5cbiAgZ2V0IG1ldGFIZWFkZXJSb3dzKCkgeyByZXR1cm4gdGhpcy5fc3RvcmUubWV0YUhlYWRlclJvd3M7IH1cbiAgZ2V0IG1ldGFGb290ZXJSb3dzKCkgeyByZXR1cm4gdGhpcy5fc3RvcmUubWV0YUZvb3RlclJvd3M7IH1cbiAgZ2V0IG1ldGFDb2x1bW5zKCk6IFBibENvbHVtblN0b3JlWydtZXRhQ29sdW1ucyddIHsgcmV0dXJuIHRoaXMuX3N0b3JlLm1ldGFDb2x1bW5zOyB9XG4gIGdldCBjb2x1bW5Sb3dEZWYoKTogeyBoZWFkZXI6IFBibE1ldGFSb3dEZWZpbml0aW9uczsgZm9vdGVyOiBQYmxNZXRhUm93RGVmaW5pdGlvbnM7IH0ge1xuICAgIHJldHVybiB7XG4gICAgICBoZWFkZXI6IHRoaXMuX3N0b3JlLmhlYWRlckNvbHVtbkRlZixcbiAgICAgIGZvb3RlcjogdGhpcy5fc3RvcmUuZm9vdGVyQ29sdW1uRGVmXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVlIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBpbml0aWFsaXplZCAoYWZ0ZXIgQWZ0ZXJWaWV3SW5pdClcbiAgICovXG4gIHJlYWRvbmx5IGlzSW5pdDogYm9vbGVhbjtcbiAgcmVhZG9ubHkgY29sdW1uQXBpOiBDb2x1bW5BcGk8VD47XG4gIHJlYWRvbmx5IHJvd3NBcGk6IFJvd3NBcGk8VD47XG4gIHJlYWRvbmx5IGNvbnRleHRBcGk6IFBibE5ncmlkQ29udGV4dEFwaTxUPjtcblxuICBnZXQgdmlld3BvcnQoKSB7IHJldHVybiB0aGlzLl92aWV3cG9ydDsgfVxuICBnZXQgaW5uZXJUYWJsZU1pbldpZHRoKCkgeyByZXR1cm4gdGhpcy5fY2RrVGFibGU/Lm1pbldpZHRoIH1cblxuICBwcml2YXRlIF9zdG9yZTogUGJsQ29sdW1uU3RvcmU7XG4gIHByaXZhdGUgX3BhZ2luYXRpb246IFBibE5ncmlkUGFnaW5hdG9yS2luZCB8IGZhbHNlO1xuICBwcml2YXRlIF9ub0NhY2hlUGFnaW5hdG9yID0gZmFsc2U7XG4gIHByaXZhdGUgX3BsdWdpbjogUGJsTmdyaWRQbHVnaW5Db250ZXh0O1xuICBwcml2YXRlIF9leHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGk8VD47XG4gIHByaXZhdGUgX2Nka1RhYmxlOiBQYmxDZGtUYWJsZUNvbXBvbmVudDxUPjtcbiAgcHJpdmF0ZSBfdmlld3BvcnQ6IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZzogUGJsTmdyaWRDb25maWdTZXJ2aWNlLFxuICAgICAgICAgICAgICAvLyBUT0RPOiBNYWtlIHByaXZhdGUgaW4gdjVcbiAgICAgICAgICAgICAgLyoqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCBpbiB2NSAqL1xuICAgICAgICAgICAgICBwdWJsaWMgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLFxuICAgICAgICAgICAgICBAQXR0cmlidXRlKCdpZCcpIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBkaXI/OiBEaXJlY3Rpb25hbGl0eSkge1xuICAgIHRoaXMuX2V4dEFwaSA9IGNyZWF0ZUFwaXModGhpcywgeyBjb25maWcsIHJlZ2lzdHJ5LCBuZ1pvbmUsIGluamVjdG9yLCB2Y1JlZiwgZWxSZWYsIGNkUmVmOiBjZHIsIGRpciB9KTtcblxuICAgIGRpcj8uY2hhbmdlXG4gICAgICAucGlwZShcbiAgICAgICAgdW5yeCh0aGlzLCAnZGlyJyksXG4gICAgICAgIHN0YXJ0V2l0aChkaXIudmFsdWUpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKHZhbHVlID0+IHRoaXMuX2RpciA9IHZhbHVlKTtcblxuICAgIGNvbnN0IGdyaWRDb25maWcgPSBjb25maWcuZ2V0KCd0YWJsZScpO1xuICAgIHRoaXMuc2hvd0hlYWRlciA9IGdyaWRDb25maWcuc2hvd0hlYWRlcjtcbiAgICB0aGlzLnNob3dGb290ZXIgPSBncmlkQ29uZmlnLnNob3dGb290ZXI7XG4gICAgdGhpcy5ub0ZpbGxlciA9IGdyaWRDb25maWcubm9GaWxsZXI7XG5cbiAgICB0aGlzLl9leHRBcGkub25Db25zdHJ1Y3RlZCgoKSA9PiB7XG4gICAgICB0aGlzLl92aWV3cG9ydCA9IHRoaXMuX2V4dEFwaS52aWV3cG9ydDtcbiAgICAgIHRoaXMuX2Nka1RhYmxlID0gdGhpcy5fZXh0QXBpLmNka1RhYmxlO1xuICAgIH0pO1xuICAgIHRoaXMuY29udGV4dEFwaSA9IHRoaXMuX2V4dEFwaS5jb250ZXh0QXBpO1xuICAgIHRoaXMuX3N0b3JlID0gdGhpcy5fZXh0QXBpLmNvbHVtblN0b3JlO1xuICAgIHRoaXMuX3BsdWdpbiA9IHRoaXMuX2V4dEFwaS5wbHVnaW47XG4gICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLl9leHRBcGkuY29sdW1uQXBpO1xuICAgIHRoaXMucm93c0FwaSA9IHRoaXMuX2V4dEFwaS5yb3dzQXBpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2V4dEFwaS5sb2dpY2Fwcy5iaW5kUmVnaXN0cnkoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmludmFsaWRhdGVDb2x1bW5zKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzSW5pdCcsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdGhpcy5fcGx1Z2luLmVtaXRFdmVudCh7IHNvdXJjZTogJ2dyaWQnLCBraW5kOiAnb25Jbml0JyB9KTtcblxuICAgIHRoaXMuX2V4dEFwaS5sb2dpY2Fwcy5wYWdpbmF0aW9uKCk7XG5cbiAgICB0aGlzLmNvbnRleHRBcGkuZm9jdXNDaGFuZ2VkXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5jdXJyKSB7XG4gICAgICAgICAgdGhpcy5yb3dzQXBpXG4gICAgICAgICAgICAuZmluZERhdGFSb3dCeUlkZW50aXR5KGV2ZW50LmN1cnIucm93SWRlbnQpXG4gICAgICAgICAgICA/LmdldENlbGxCeUlkKHRoaXMuY29sdW1uQXBpLmNvbHVtbklkc1tldmVudC5jdXJyLmNvbEluZGV4XSlcbiAgICAgICAgICAgID8uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgbGV0IHByb2Nlc3NDb2x1bW5zID0gZmFsc2U7XG5cbiAgICBpZiAoY2hhbmdlcy5mb2N1c01vZGUpIHtcbiAgICAgIHRoaXMucm93Rm9jdXMgPSB0aGlzLmZvY3VzTW9kZSA9PT0gJ3JvdycgPyAwIDogJyc7XG4gICAgICB0aGlzLmNlbGxGb2N1cyA9IHRoaXMuZm9jdXNNb2RlID09PSAnY2VsbCcgPyAwIDogJyc7XG4gICAgfVxuXG4gICAgaWYgKCBjaGFuZ2VzLmNvbHVtbnMgJiYgdGhpcy5pc0luaXQgKSB7XG4gICAgICBwcm9jZXNzQ29sdW1ucyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCBwcm9jZXNzQ29sdW1ucyA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNvbHVtbnMoKTtcbiAgICAgIHRoaXMubmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMucm93c0FwaS5zeW5jUm93cygnYWxsJywgdHJ1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmRpc3Bvc2UoKTtcbiAgICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgdGhpcy5fcGx1Z2luLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMudmlld3BvcnQuZGV0YWNoVmlld1BvcnQoKTtcbiAgICAgIHVucngua2lsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgbGV0IHA6IFByb21pc2U8dm9pZD47XG4gICAgdGhpcy5fcGx1Z2luLmVtaXRFdmVudCh7IHNvdXJjZTogJ2dyaWQnLCBraW5kOiAnb25EZXN0cm95Jywgd2FpdDogKF9wOiBQcm9taXNlPHZvaWQ+KSA9PiBwID0gX3AgfSk7XG4gICAgaWYgKHApIHtcbiAgICAgIHAudGhlbihkZXN0cm95KS5jYXRjaChkZXN0cm95KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIHRyYWNrQnkoaW5kZXg6IG51bWJlciwgaXRlbTogVCk6IGFueSB7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSBjdXJyZW50IHNvcnQgZGVmaW5pdGlvbnMuXG4gICAqIFRoaXMgbWV0aG9kIGlzIGEgcHJveHkgdG8gYFBibERhdGFTb3VyY2Uuc2V0U29ydGAsIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZSBgUGJsRGF0YVNvdXJjZS5zZXRTb3J0YFxuICAgKlxuICAgKiBAcGFyYW0gc2tpcFVwZGF0ZSBXaGVuIHRydWUgd2lsbCBub3QgdXBkYXRlIHRoZSBkYXRhc291cmNlLCB1c2UgdGhpcyB3aGVuIHRoZSBkYXRhIGNvbWVzIHNvcnRlZCBhbmQgeW91IHdhbnQgdG8gc3luYyB0aGUgZGVmaW5pdGlvbnMgd2l0aCB0aGUgY3VycmVudCBkYXRhIHNldC5cbiAgICogZGVmYXVsdCB0byBmYWxzZS5cbiAgICovXG4gIHNldFNvcnQoc2tpcFVwZGF0ZT86IGJvb2xlYW4pOiB2b2lkO1xuICAvKipcbiAgICogU2V0IHRoZSBzb3J0aW5nIGRlZmluaXRpb24gZm9yIHRoZSBjdXJyZW50IGRhdGEgc2V0LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBhIHByb3h5IHRvIGBQYmxEYXRhU291cmNlLnNldFNvcnRgIHdpdGggdGhlIGFkZGVkIHN1Z2FyIG9mIHByb3ZpZGluZyBjb2x1bW4gYnkgc3RyaW5nIHRoYXQgbWF0Y2ggdGhlIGBpZGAgb3IgYGFsaWFzYCBwcm9wZXJ0aWVzLlxuICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgYFBibERhdGFTb3VyY2Uuc2V0U29ydGBcbiAgICpcbiAgICogQHBhcmFtIGNvbHVtbk9yQWxpYXMgQSBjb2x1bW4gaW5zdGFuY2Ugb3IgYSBzdHJpbmcgbWF0Y2hpbmcgYFBibENvbHVtbi5hbGlhc2Agb3IgYFBibENvbHVtbi5pZGAuXG4gICAqIEBwYXJhbSBza2lwVXBkYXRlIFdoZW4gdHJ1ZSB3aWxsIG5vdCB1cGRhdGUgdGhlIGRhdGFzb3VyY2UsIHVzZSB0aGlzIHdoZW4gdGhlIGRhdGEgY29tZXMgc29ydGVkIGFuZCB5b3Ugd2FudCB0byBzeW5jIHRoZSBkZWZpbml0aW9ucyB3aXRoIHRoZSBjdXJyZW50IGRhdGEgc2V0LlxuICAgKiBkZWZhdWx0IHRvIGZhbHNlLlxuICAgKi9cbiAgc2V0U29ydChjb2x1bW5PckFsaWFzOiBQYmxDb2x1bW4gfCBzdHJpbmcsIHNvcnQ6IFBibE5ncmlkU29ydERlZmluaXRpb24sIHNraXBVcGRhdGU/OiBib29sZWFuKTogdm9pZDtcbiAgc2V0U29ydChjb2x1bW5PckFsaWFzPzogUGJsQ29sdW1uIHwgc3RyaW5nIHwgYm9vbGVhbiwgc29ydD86IFBibE5ncmlkU29ydERlZmluaXRpb24sIHNraXBVcGRhdGUgPSBmYWxzZSk6IHZvaWQge1xuICAgIGlmICghY29sdW1uT3JBbGlhcyB8fCB0eXBlb2YgY29sdW1uT3JBbGlhcyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aGlzLmRzLnNldFNvcnQoISFjb2x1bW5PckFsaWFzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgY29sdW1uOiBQYmxDb2x1bW47XG4gICAgaWYgKHR5cGVvZiBjb2x1bW5PckFsaWFzID09PSAnc3RyaW5nJykge1xuICAgICAgY29sdW1uID0gdGhpcy5fc3RvcmUudmlzaWJsZUNvbHVtbnMuZmluZCggYyA9PiBjLmFsaWFzID8gYy5hbGlhcyA9PT0gY29sdW1uT3JBbGlhcyA6IChjLnNvcnQgJiYgYy5pZCA9PT0gY29sdW1uT3JBbGlhcykgKTtcbiAgICAgIGlmICghY29sdW1uICYmIGlzRGV2TW9kZSgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgQ291bGQgbm90IGZpbmQgY29sdW1uIHdpdGggYWxpYXMgXCIke2NvbHVtbk9yQWxpYXN9XCIuYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29sdW1uID0gY29sdW1uT3JBbGlhcztcbiAgICB9XG4gICAgdGhpcy5kcy5zZXRTb3J0KGNvbHVtbiwgc29ydCwgc2tpcFVwZGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIGZpbHRlciBkZWZpbml0aW9uIGZvciB0aGUgY3VycmVudCBkYXRhIHNldC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYSBwcm94eSB0byBgUGJsRGF0YVNvdXJjZS5zZXRGaWx0ZXJgLCBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgYFBibERhdGFTb3VyY2Uuc2V0RmlsdGVyYC5cbiAgICovXG4gIHNldEZpbHRlcigpOiB2b2lkO1xuICAvKipcbiAgICogU2V0IHRoZSBmaWx0ZXIgZGVmaW5pdGlvbiBmb3IgdGhlIGN1cnJlbnQgZGF0YSBzZXQgdXNpbmcgYSBmdW5jdGlvbiBwcmVkaWNhdGUuXG4gICAqXG4gICogVGhpcyBtZXRob2QgaXMgYSBwcm94eSB0byBgUGJsRGF0YVNvdXJjZS5zZXRGaWx0ZXJgIHdpdGggdGhlIGFkZGVkIHN1Z2FyIG9mIHByb3ZpZGluZyBjb2x1bW4gYnkgc3RyaW5nIHRoYXQgbWF0Y2ggdGhlIGBpZGAgcHJvcGVydHkuXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZSBgUGJsRGF0YVNvdXJjZS5zZXRGaWx0ZXJgXG4gICAqL1xuICBzZXRGaWx0ZXIodmFsdWU6IERhdGFTb3VyY2VQcmVkaWNhdGUsIGNvbHVtbnM/OiBQYmxDb2x1bW5bXSB8IHN0cmluZ1tdKTogdm9pZDtcbiAgLyoqXG4gICAqIFNldCB0aGUgZmlsdGVyIGRlZmluaXRpb24gZm9yIHRoZSBjdXJyZW50IGRhdGEgc2V0IHVzaW5nIGEgdmFsdWUgdG8gY29tcGFyZSB3aXRoIGFuZCBhIGxpc3Qgb2YgY29sdW1ucyB3aXRoIHRoZSB2YWx1ZXMgdG8gY29tcGFyZSB0by5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYSBwcm94eSB0byBgUGJsRGF0YVNvdXJjZS5zZXRGaWx0ZXJgIHdpdGggdGhlIGFkZGVkIHN1Z2FyIG9mIHByb3ZpZGluZyBjb2x1bW4gYnkgc3RyaW5nIHRoYXQgbWF0Y2ggdGhlIGBpZGAgcHJvcGVydHkuXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZSBgUGJsRGF0YVNvdXJjZS5zZXRGaWx0ZXJgXG4gICAqL1xuICBzZXRGaWx0ZXIodmFsdWU6IGFueSwgY29sdW1uczogUGJsQ29sdW1uW10gfCBzdHJpbmdbXSk6IHZvaWQ7XG4gIHNldEZpbHRlcih2YWx1ZT86IERhdGFTb3VyY2VGaWx0ZXJUb2tlbiwgY29sdW1ucz86IFBibENvbHVtbltdIHwgc3RyaW5nW10pOiB2b2lkIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBjb2x1bW5JbnN0YW5jZXM6IFBibENvbHVtbltdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sdW1ucykgJiYgdHlwZW9mIGNvbHVtbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbHVtbkluc3RhbmNlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbElkIG9mIGNvbHVtbnMpIHtcbiAgICAgICAgICBjb25zdCBjb2x1bW4gPSB0aGlzLl9zdG9yZS52aXNpYmxlQ29sdW1ucy5maW5kKCBjID0+IGMuYWxpYXMgPyBjLmFsaWFzID09PSBjb2xJZCA6IChjLmlkID09PSBjb2xJZCkgKTtcbiAgICAgICAgICBpZiAoIWNvbHVtbiAmJiBpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgZmluZCBjb2x1bW4gd2l0aCBhbGlhcyAke2NvbElkfSBcIiR7Y29sSWR9XCIuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbHVtbkluc3RhbmNlcy5wdXNoKGNvbHVtbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbHVtbkluc3RhbmNlcyA9IGNvbHVtbnMgYXMgYW55O1xuICAgICAgfVxuICAgICAgdGhpcy5kcy5zZXRGaWx0ZXIodmFsdWUsIGNvbHVtbkluc3RhbmNlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZHMuc2V0RmlsdGVyKCk7XG4gICAgfVxuICB9XG5cbiAgc2V0RGF0YVNvdXJjZSh2YWx1ZTogUGJsRGF0YVNvdXJjZTxUPik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kYXRhU291cmNlICE9PSB2YWx1ZSkge1xuICAgICAgLy8gS0lMTCBBTEwgc3Vic2NyaXB0aW9ucyBmb3IgdGhlIHByZXZpb3VzIGRhdGFzb3VyY2UuXG4gICAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSkge1xuICAgICAgICB1bnJ4LmtpbGwodGhpcywgdGhpcy5fZGF0YVNvdXJjZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByZXYgPSB0aGlzLl9kYXRhU291cmNlO1xuICAgICAgdGhpcy5fZGF0YVNvdXJjZSA9IHZhbHVlO1xuICAgICAgdGhpcy5fY2RrVGFibGUuZGF0YVNvdXJjZSA9IHZhbHVlIGFzIGFueTtcblxuICAgICAgdGhpcy5fZXh0QXBpLmxvZ2ljYXBzLnBhZ2luYXRpb24oKTtcbiAgICAgIHRoaXMuX2V4dEFwaS5sb2dpY2Fwcy5ub0RhdGEoZmFsc2UpO1xuXG4gICAgICBpZiAocHJldj8uaG9zdEdyaWQgPT09IHRoaXMpIHtcbiAgICAgICAgcHJldi5fZGV0YWNoRW1pdHRlcigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9kYXRhU291cmNlLl9hdHRhY2hFbWl0dGVyKHRoaXMuX3BsdWdpbik7XG4gICAgICB0aGlzLl9wbHVnaW4uZW1pdEV2ZW50KHtcbiAgICAgICAgc291cmNlOiAnZHMnLFxuICAgICAgICBraW5kOiAnb25EYXRhU291cmNlJyxcbiAgICAgICAgcHJldixcbiAgICAgICAgY3VycjogdmFsdWVcbiAgICAgIH0gYXMgUGJsTmdyaWRPbkRhdGFTb3VyY2VFdmVudCk7XG5cbiAgICAgIC8vIGNsZWFyIHRoZSBjb250ZXh0LCBuZXcgZGF0YXNvdXJjZVxuICAgICAgdGhpcy5fZXh0QXBpLmNvbnRleHRBcGkuY2xlYXIoKTtcblxuICAgICAgaWYgKCB2YWx1ZSApIHtcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgdmFsdWUub25FcnJvci5waXBlKHVucngodGhpcywgdmFsdWUpKS5zdWJzY3JpYmUoY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIHJlZ2lzdGVyIHRvIHRoaXMgZXZlbnQgYmVjYXVzZSBpdCBmaXJlcyBiZWZvcmUgdGhlIGVudGlyZSBkYXRhLWNoYW5naW5nIHByb2Nlc3Mgc3RhcnRzLlxuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGJlY2F1c2UgYG9uUmVuZGVyRGF0YUNoYW5naW5nYCBpcyBmaXJlZCBhc3luYywganVzdCBiZWZvcmUgdGhlIGRhdGEgaXMgZW1pdHRlZC5cbiAgICAgICAgLy8gSXRzIG5vdCBlbm91Z2ggdG8gY2xlYXIgdGhlIGNvbnRleHQgd2hlbiBgc2V0RGF0YVNvdXJjZWAgaXMgY2FsbGVkLCB3ZSBhbHNvIG5lZWQgdG8gaGFuZGxlIGByZWZyZXNoYCBjYWxscyB3aGljaCB3aWxsIG5vdFxuICAgICAgICAvLyB0cmlnZ2VyIHRoaXMgbWV0aG9kLlxuICAgICAgICB2YWx1ZS5vblNvdXJjZUNoYW5naW5nXG4gICAgICAgICAgLnBpcGUodW5yeCh0aGlzLCB2YWx1ZSkpXG4gICAgICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmdldCgndGFibGUnKS5jbGVhckNvbnRleHRPblNvdXJjZUNoYW5naW5nKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2V4dEFwaS5jb250ZXh0QXBpLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUnVuIENELCBzY2hlZHVsZWQgYXMgYSBtaWNyby10YXNrLCBhZnRlciBlYWNoIHJlbmRlcmluZ1xuICAgICAgICB2YWx1ZS5vblJlbmRlckRhdGFDaGFuZ2luZ1xuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgZmlsdGVyKCAoe2V2ZW50fSkgPT4gIWV2ZW50LmlzSW5pdGlhbCAmJiAoZXZlbnQucGFnaW5hdGlvbi5jaGFuZ2VkIHx8IGV2ZW50LnNvcnQuY2hhbmdlZCB8fCBldmVudC5maWx0ZXIuY2hhbmdlZCkpLFxuICAgICAgICAgICAgLy8gQ29udGV4dCBiZXR3ZWVuIHRoZSBvcGVyYXRpb25zIGFyZSBub3Qgc3VwcG9ydGVkIGF0IHRoZSBtb21lbnRcbiAgICAgICAgICAgIC8vIEV2ZW50IGZvciBjbGllbnQgc2lkZSBvcGVyYXRpb25zLi4uXG4gICAgICAgICAgICAvLyBUT0RPOiBjYW4gd2UgcmVtb3ZlIHRoaXM/IHdlIGNsZWFyIHRoZSBjb250ZXh0IHdpdGggYG9uU291cmNlQ2hhbmdpbmdgXG4gICAgICAgICAgICB0YXAoICgpID0+ICF0aGlzLl9zdG9yZS5wcmltYXJ5ICYmIHRoaXMuX2V4dEFwaS5jb250ZXh0QXBpLmNsZWFyKCkgKSxcbiAgICAgICAgICAgIHN3aXRjaE1hcCggKCkgPT4gdmFsdWUub25SZW5kZXJlZERhdGFDaGFuZ2VkLnBpcGUodGFrZSgxKSwgbWFwVG8odGhpcy5kcy5yZW5kZXJMZW5ndGgpKSApLFxuICAgICAgICAgICAgb2JzZXJ2ZU9uKGFzYXBTY2hlZHVsZXIpLFxuICAgICAgICAgICAgdW5yeCh0aGlzLCB2YWx1ZSlcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSggcHJldmlvdXNSZW5kZXJMZW5ndGggPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlIG51bWJlciBvZiByZW5kZXJlZCBpdGVtcyBoYXMgY2hhbmdlZCB0aGUgZ3JpZCB3aWxsIHVwZGF0ZSB0aGUgZGF0YSBhbmQgcnVuIENEIG9uIGl0LlxuICAgICAgICAgICAgLy8gc28gd2Ugb25seSB1cGRhdGUgdGhlIHJvd3MuXG4gICAgICAgICAgICBpZiAocHJldmlvdXNSZW5kZXJMZW5ndGggPT09IHRoaXMuZHMucmVuZGVyTGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHRoaXMucm93c0FwaS5zeW5jUm93cyh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMucm93c0FwaS5zeW5jUm93cygnaGVhZGVyJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIHRoaXMucm93c0FwaS5zeW5jUm93cygnZm9vdGVyJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSGFuZGxpbmcgbm8gZGF0YSBvdmVybGF5XG4gICAgICAgIC8vIEhhbmRsaW5nIGZhbGxiYWNrIG1pbmltdW0gaGVpZ2h0LlxuICAgICAgICB2YWx1ZS5vblJlbmRlcmVkRGF0YUNoYW5nZWRcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgIG1hcCggKCkgPT4gdGhpcy5kcy5yZW5kZXJMZW5ndGggKSxcbiAgICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgICAgICB0YXAoIChbcHJldiwgY3Vycl0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9EYXRhU2hvd2luZyA9ICEhdGhpcy5fZXh0QXBpLmxvZ2ljYXBzLm5vRGF0YS52aWV3QWN0aXZlO1xuICAgICAgICAgICAgICBpZiAoIChjdXJyID4gMCAmJiBub0RhdGFTaG93aW5nKSB8fCAoY3VyciA9PT0gMCAmJiAhbm9EYXRhU2hvd2luZykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0QXBpLmxvZ2ljYXBzLm5vRGF0YSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG9ic2VydmVPbihhbmltYXRpb25GcmFtZVNjaGVkdWxlciksIC8vIHd3IHdhbnQgdG8gZ2l2ZSB0aGUgYnJvd3NlciB0aW1lIHRvIHJlbW92ZS9hZGQgcm93c1xuICAgICAgICAgICAgdW5yeCh0aGlzLCB2YWx1ZSlcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMudmlld3BvcnQuZWxlbWVudDtcbiAgICAgICAgICAgIGlmICh0aGlzLmRzLnJlbmRlckxlbmd0aCA+IDAgJiYgdGhpcy5fbWluRGF0YVZpZXdIZWlnaHQpIHtcbiAgICAgICAgICAgICAgbGV0IGg6IG51bWJlcjtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX21pbkRhdGFWaWV3SGVpZ2h0ID4gMCkge1xuICAgICAgICAgICAgICAgIGggPSBNYXRoLm1pbih0aGlzLl9taW5EYXRhVmlld0hlaWdodCwgdGhpcy52aWV3cG9ydC5tZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dIZWlnaHQgPSB0aGlzLmZpbmRJbml0aWFsUm93SGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93Q291bnQgPSBNYXRoLm1pbih0aGlzLmRzLnJlbmRlckxlbmd0aCwgdGhpcy5fbWluRGF0YVZpZXdIZWlnaHQgKiAtMSk7XG4gICAgICAgICAgICAgICAgaCA9IHJvd0hlaWdodCAqIHJvd0NvdW50O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsLnN0eWxlLm1pbkhlaWdodCA9IGggKyAncHgnO1xuICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHRyaWdnZXIgQ0Qgd2hlbiBub3QgdXNpbmcgdmlydHVhbCBzY3JvbGwgb3IgZWxzZSB0aGUgcm93cyB3b24ndCBzaG93IG9uIGluaXRpYWwgbG9hZCwgb25seSBhZnRlciB1c2VyIGludGVyYWN0aW9uc1xuICAgICAgICAgICAgICBpZiAoIXRoaXMudmlld3BvcnQuZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm93c0FwaS5zeW5jUm93cyh0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZhbGlkYXRlcyB0aGUgaGVhZGVyLCBpbmNsdWRpbmcgYSBmdWxsIHJlYnVpbGQgb2YgY29sdW1uIGhlYWRlcnNcbiAgICovXG4gIGludmFsaWRhdGVDb2x1bW5zKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsdWdpbi5lbWl0RXZlbnQoeyBzb3VyY2U6ICdncmlkJywga2luZDogJ2JlZm9yZUludmFsaWRhdGVIZWFkZXJzJyB9KTtcblxuICAgIHRoaXMuX2V4dEFwaS5jb250ZXh0QXBpLmNsZWFyKCk7XG4gICAgdGhpcy5fc3RvcmUuaW52YWxpZGF0ZSh0aGlzLmNvbHVtbnMpO1xuXG4gICAgdGhpcy5fc3RvcmUuYXR0YWNoQ3VzdG9tQ2VsbFRlbXBsYXRlcygpO1xuICAgIHRoaXMuX3N0b3JlLmF0dGFjaEN1c3RvbUhlYWRlckNlbGxUZW1wbGF0ZXMoKTtcbiAgICB0aGlzLl9jZGtUYWJsZS5jbGVhckhlYWRlclJvd0RlZnMoKTtcbiAgICB0aGlzLl9jZGtUYWJsZS5jbGVhckZvb3RlclJvd0RlZnMoKTtcbiAgICAvLyB0aGlzLmNkci5tYXJrRm9yQ2hlY2soKTtcbiAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICAvLyBhZnRlciBpbnZhbGlkYXRpbmcgdGhlIGhlYWRlcnMgd2Ugbm93IGhhdmUgb3B0aW9uYWwgaGVhZGVyL2hlYWRlckdyb3Vwcy9mb290ZXIgcm93cyBhZGRlZFxuICAgIC8vIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoaXMgZGF0YSB3aGljaCB3aWxsIGNyZWF0ZSBuZXcgcm93cyAoaGVhZGVyL2Zvb3RlcilcbiAgICB0aGlzLnJlc2V0SGVhZGVyUm93RGVmcygpO1xuICAgIHRoaXMucmVzZXRGb290ZXJSb3dEZWZzKCk7XG4gICAgdGhpcy5jZHIubWFya0ZvckNoZWNrKCk7XG5cbiAgICAvLyBFYWNoIHJvdyB3aWxsIHJlYnVpbGQgaXQncyBvd24gY2VsbHMuXG4gICAgLy8gVGhpcyB3aWxsIGJlIGRvbmUgaW4gdGhlIFJvd3NBcGksIHdoaWNoIGxpc3RlbnMgdG8gYG9uSW52YWxpZGF0ZUhlYWRlcnNgXG4gICAgdGhpcy5fcGx1Z2luLmVtaXRFdmVudCh7IHNvdXJjZTogJ2dyaWQnLCBraW5kOiAnb25JbnZhbGlkYXRlSGVhZGVycycgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIGVtYmVkZGVkIHZpZXcgYmVmb3JlIG9yIGFmdGVyIHRoZSB1c2VyIHByb2plY3RlZCBjb250ZW50LlxuICAgKi9cbiAgY3JlYXRlVmlldzxDPihsb2NhdGlvbjogJ2JlZm9yZVRhYmxlJyB8ICdiZWZvcmVDb250ZW50JyB8ICdhZnRlckNvbnRlbnQnLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8Qz4sIGNvbnRleHQ/OiBDLCBpbmRleD86IG51bWJlcik6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgY29uc3QgdmNSZWYgPSB0aGlzLmdldEludGVybmFsVmNSZWYobG9jYXRpb24pO1xuICAgIGNvbnN0IHZpZXcgPSB2Y1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGVtcGxhdGVSZWYsIGNvbnRleHQsIGluZGV4KTtcbiAgICB2aWV3LmRldGVjdENoYW5nZXMoKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gYWxyZWFkeSBjcmVhdGVkIGVtYmVkZGVkIHZpZXcuXG4gICAqIEBwYXJhbSB2aWV3IC0gVGhlIHZpZXcgdG8gcmVtb3ZlXG4gICAqIEBwYXJhbSBsb2NhdGlvbiAtIFRoZSBsb2NhdGlvbiwgaWYgbm90IHNldCBkZWZhdWx0cyB0byBgYmVmb3JlYFxuICAgKiBAcmV0dXJucyB0cnVlIHdoZW4gYSB2aWV3IHdhcyByZW1vdmVkLCBmYWxzZSB3aGVuIG5vdC4gKGRpZCBub3QgZXhpc3QgaW4gdGhlIHZpZXcgY29udGFpbmVyIGZvciB0aGUgcHJvdmlkZWQgbG9jYXRpb24pXG4gICAqL1xuICByZW1vdmVWaWV3KHZpZXc6IEVtYmVkZGVkVmlld1JlZjxhbnk+LCBsb2NhdGlvbjogJ2JlZm9yZVRhYmxlJyB8ICdiZWZvcmVDb250ZW50JyB8ICdhZnRlckNvbnRlbnQnKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmNSZWYgPSB0aGlzLmdldEludGVybmFsVmNSZWYobG9jYXRpb24pO1xuICAgIGNvbnN0IGlkeCA9IHZjUmVmLmluZGV4T2Yodmlldyk7XG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmNSZWYucmVtb3ZlKGlkeCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIGFsbCB2aXNpYmxlIGNvbHVtbnMgdG8gZml0IGNvbnRlbnQgb2YgdGhlIGdyaWQuXG4gICAqIEBwYXJhbSBmb3JjZUZpeGVkV2lkdGggLSBXaGVuIHRydWUgd2lsbCByZXNpemUgYWxsIGNvbHVtbnMgd2l0aCBhYnNvbHV0ZSBwaXhlbCB2YWx1ZXMsIG90aGVyd2lzZSB3aWxsIGtlZXAgdGhlIHNhbWUgZm9ybWF0IGFzIG9yaWdpbmFsbHkgc2V0ICglIG9yIG5vbmUpXG4gICAqL1xuICBhdXRvU2l6ZUNvbHVtblRvRml0KG9wdGlvbnM/OiBBdXRvU2l6ZVRvRml0T3B0aW9ucyk6IHZvaWQge1xuICAgIGNvbnN0IHsgaW5uZXJXaWR0aCwgb3V0ZXJXaWR0aCB9ID0gdGhpcy52aWV3cG9ydDtcblxuICAgIC8vIGNhbGN1bGF0ZSBhdXRvLXNpemUgb24gdGhlIHdpZHRoIHdpdGhvdXQgc2Nyb2xsIGJhciBhbmQgdGFrZSBib3ggbW9kZWwgZ2FwcyBpbnRvIGFjY291bnRcbiAgICAvLyBUT0RPOiBpZiBubyBzY3JvbGwgYmFyIGV4aXN0cyB0aGUgY2FsYyB3aWxsIG5vdCBpbmNsdWRlIGl0LCBuZXh0IGlmIG1vcmUgcm93cyBhcmUgYWRkZWQgYSBzY3JvbGwgYmFyIHdpbGwgYXBwZWFyLi4uXG4gICAgdGhpcy5jb2x1bW5BcGkuYXV0b1NpemVUb0ZpdChvdXRlcldpZHRoIC0gKG91dGVyV2lkdGggLSBpbm5lcldpZHRoKSwgb3B0aW9ucyk7XG4gIH1cblxuICBmaW5kSW5pdGlhbFJvd0hlaWdodCgpOiBudW1iZXIge1xuICAgIGxldCByb3dFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBjb25zdCByb3cgPSB0aGlzLnJvd3NBcGkuZmluZERhdGFSb3dCeUluZGV4KDApO1xuICAgIGlmIChyb3cpIHtcbiAgICAgIGNvbnN0IGhlaWdodCA9IGdldENvbXB1dGVkU3R5bGUocm93LmVsZW1lbnQpLmhlaWdodDtcbiAgICAgIHJldHVybiBwYXJzZUludChoZWlnaHQsIDEwKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3ZjUmVmQmVmb3JlQ29udGVudCkge1xuICAgICAgcm93RWxlbWVudCA9IHRoaXMuX3ZjUmVmQmVmb3JlQ29udGVudC5sZW5ndGggPiAwXG4gICAgICAgID8gKHRoaXMuX3ZjUmVmQmVmb3JlQ29udGVudC5nZXQoMCkgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXVxuICAgICAgICA6IHRoaXMuX3ZjUmVmQmVmb3JlQ29udGVudC5lbGVtZW50Lm5hdGl2ZUVsZW1lbnRcbiAgICAgIDtcbiAgICAgIHJvd0VsZW1lbnQgPSByb3dFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICByb3dFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIGNvbnN0IGhlaWdodCA9IGdldENvbXB1dGVkU3R5bGUocm93RWxlbWVudCkuaGVpZ2h0O1xuICAgICAgcm93RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgcmV0dXJuIHBhcnNlSW50KGhlaWdodCwgMTApO1xuICAgIH1cbiAgfVxuXG4gIGFkZENsYXNzKC4uLmNsczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY2xzKSB7XG4gICAgICB0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChjKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVDbGFzcyguLi5jbHM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjIG9mIGNscykge1xuICAgICAgdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbnRlcm5hbFZjUmVmKGxvY2F0aW9uOiAnYmVmb3JlVGFibGUnIHwgJ2JlZm9yZUNvbnRlbnQnIHwgJ2FmdGVyQ29udGVudCcpOiBWaWV3Q29udGFpbmVyUmVmIHtcbiAgICByZXR1cm4gbG9jYXRpb24gPT09ICdiZWZvcmVUYWJsZSdcbiAgICAgID8gdGhpcy5fdmNSZWZCZWZvcmVUYWJsZVxuICAgICAgOiBsb2NhdGlvbiA9PT0gJ2JlZm9yZUNvbnRlbnQnID8gdGhpcy5fdmNSZWZCZWZvcmVDb250ZW50IDogdGhpcy5fdmNSZWZBZnRlckNvbnRlbnRcbiAgICA7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0SGVhZGVyUm93RGVmcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faGVhZGVyUm93RGVmcykge1xuICAgICAgLy8gVGhlIGdyaWQgaGVhZGVyIChtYWluLCB3aXRoIGNvbHVtbiBuYW1lcykgaXMgYWx3YXlzIHRoZSBsYXN0IHJvdyBkZWYgKGluZGV4IDApXG4gICAgICAvLyBCZWNhdXNlIHdlIHdhbnQgaXQgdG8gc2hvdyBsYXN0IChhZnRlciBjdXN0b20gaGVhZGVycywgZ3JvdXAgaGVhZGVycy4uLikgd2UgZmlyc3QgbmVlZCB0byBwdWxsIGl0IGFuZCB0aGVuIHB1c2guXG5cbiAgICAgIHRoaXMuX2Nka1RhYmxlLmNsZWFySGVhZGVyUm93RGVmcygpO1xuICAgICAgY29uc3QgYXJyID0gdGhpcy5faGVhZGVyUm93RGVmcy50b0FycmF5KCk7XG4gICAgICBhcnIucHVzaChhcnIuc2hpZnQoKSk7XG5cbiAgICAgIGZvciAoY29uc3Qgcm93RGVmIG9mIGFycikge1xuICAgICAgICB0aGlzLl9jZGtUYWJsZS5hZGRIZWFkZXJSb3dEZWYocm93RGVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc2V0Rm9vdGVyUm93RGVmcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZm9vdGVyUm93RGVmcykge1xuICAgICAgdGhpcy5fY2RrVGFibGUuY2xlYXJGb290ZXJSb3dEZWZzKCk7XG4gICAgICBmb3IgKGNvbnN0IHJvd0RlZiBvZiB0aGlzLl9mb290ZXJSb3dEZWZzLnRvQXJyYXkoKSkge1xuICAgICAgICB0aGlzLl9jZGtUYWJsZS5hZGRGb290ZXJSb3dEZWYocm93RGVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd0hlYWRlcjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd0Zvb3RlcjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbm9GaWxsZXI6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX25vQ2FjaGVQYWdpbmF0b3I6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21pbkRhdGFWaWV3SGVpZ2h0OiBOdW1iZXJJbnB1dDtcbn1cbiIsIjwhLS0gR1JJRCBIRUFERVIgUk9XIERFRiAtIFRIRSBNQUlOIEhFQURFUiBPRiBUSEUgR1JJRCAtLT5cbjxwYmwtbmdyaWQtY29sdW1uLXJvdyAqY2RrSGVhZGVyUm93RGVmPVwiW107IHN0aWNreTogY29sdW1uUm93RGVmLmhlYWRlcj8udHlwZSA9PT0gJ3N0aWNreSdcIlxuICAgICAgICAgICAgICAgICAgICAgIFtyb3ddPVwiY29sdW1uUm93RGVmLmhlYWRlclwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJwYmwtbmdyaWQtaGVhZGVyLXJvdy1tYWluXCI+PC9wYmwtbmdyaWQtY29sdW1uLXJvdz5cblxuPCEtLSBEVVBMSUNBVEUgSEVBREVSIEZPUiBUSEUgTUFJTiBIRUFERVIsIE5FVkVSIFNFRU4gKE5PVCBWSVNVQUwpLCBVU0VEIEZPUiBSRVNJWklORyAtLT5cbjxwYmwtbmdyaWQtY29sdW1uLXJvdyAqY2RrSGVhZGVyUm93RGVmPVwiW107XCJcbiAgICAgICAgICAgICAgICAgICAgICBbcm93XT1cImNvbHVtblJvd0RlZi5oZWFkZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIGdyaWRXaWR0aFJvd1xuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInBibC1uZ3JpZC1yb3ctdmlzdWFsbHktaGlkZGVuXCI+PC9wYmwtbmdyaWQtY29sdW1uLXJvdz5cblxuPCEtLSBNVUxUSS1IRUFERVIgUk9XIERFRiAmIE1VTFRJLUhFQURFUiBHUk9VUCBST1cgREVGSU5JVElPTiBURU1QTEFURVMgLS0+XG48bmctY29udGFpbmVyICpuZ0Zvcj1cImxldCByb3cgb2YgbWV0YUhlYWRlclJvd3M7XCI+XG4gIDxwYmwtbmdyaWQtbWV0YS1yb3cgKmNka0hlYWRlclJvd0RlZj1cIltdOyBzdGlja3k6IHJvdy5yb3dEZWYudHlwZSA9PT0gJ3N0aWNreSdcIiBbcm93XT1cInJvd1wiPjwvcGJsLW5ncmlkLW1ldGEtcm93PlxuPC9uZy1jb250YWluZXI+XG5cbjwhLS0gR1JJRCBGT09URVIgUk9XIERFRiAtLT5cbjxwYmwtbmdyaWQtY29sdW1uLXJvdyAqY2RrRm9vdGVyUm93RGVmPVwiW107IHN0aWNreTogY29sdW1uUm93RGVmLmZvb3Rlcj8udHlwZSA9PT0gJ3N0aWNreSdcIlxuICAgICAgICAgICAgICAgICAgICAgIGZvb3RlciBbcm93XT1cImNvbHVtblJvd0RlZi5mb290ZXJcIj48L3BibC1uZ3JpZC1jb2x1bW4tcm93PlxuPCEtLSBHUklEIEZPT1RFUiBST1cgREVGIC0tPlxuPCEtLSBNVUxUSS1GT09URVIgUk9XIERFRiAtLT5cbjxuZy1jb250YWluZXIgKm5nRm9yPVwibGV0IHJvdyBvZiBtZXRhRm9vdGVyUm93cztcIj5cbiAgPHBibC1uZ3JpZC1tZXRhLXJvdyBmb290ZXIgKmNka0Zvb3RlclJvd0RlZj1cIltdOyBzdGlja3k6IHJvdy5yb3dEZWYudHlwZSA9PT0gJ3N0aWNreSdcIiBbcm93XT1cInJvd1wiPjwvcGJsLW5ncmlkLW1ldGEtcm93PlxuPC9uZy1jb250YWluZXI+XG5cbjxkaXYgY2xhc3M9XCJwYmwtbmdyaWQtY29udGFpbmVyXCI+XG4gIDxuZy1jb250YWluZXIgI2JlZm9yZVRhYmxlPjwvbmctY29udGFpbmVyPlxuICA8ZGl2IHBibC1uZ3JpZC1maXhlZC1tZXRhLXJvdy1jb250YWluZXI9XCJoZWFkZXJcIj48L2Rpdj5cbiAgPHBibC1jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQgY2xhc3M9XCJwYmwtbmdyaWQtc2Nyb2xsLWNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdGlja3lSb3dIZWFkZXJDb250YWluZXJdPVwic3RpY2t5Um93SGVhZGVyQ29udGFpbmVyXCIgW3N0aWNreVJvd0Zvb3RlckNvbnRhaW5lcl09XCJzdGlja3lSb3dGb290ZXJDb250YWluZXJcIj5cbiAgICA8cGJsLWNkay10YWJsZSB0YWJpbmRleD1cIi0xXCI+XG4gICAgICA8IS0tIFJvdyB0ZW1wbGF0ZXMuIFRoZSBjb2x1bW5zIHVzZWQgYXJlIHNldCBhdCB0aGUgcm93IHRlbXBsYXRlIGxldmVsIC0tPlxuXG4gICAgICA8IS0tIEdSSUQgUkVDT1JEIFJPVyBERUZJTklUSU9OIFRFTVBMQVRFUyAtLT5cbiAgICAgIDwhLS0gV2UgZG9udCBuZWVkIGNvbHVtbnMgYmVjYXVzZSB3ZSBpbXBsZW1lbnQgdGhlbSBpbnRlcm5hbGx5IC0tPlxuICAgICAgPHBibC1uZ3JpZC1yb3cgKnBibE5ncmlkUm93RGVmPVwibGV0IHJvdztcIiByb3c+PC9wYmwtbmdyaWQtcm93PlxuICAgICAgPCEtLSBHUklEIFJFQ09SRCBST1cgREVGSU5JVElPTiBURU1QTEFURVMgLS0+XG4gICAgPC9wYmwtY2RrLXRhYmxlPlxuICA8L3BibC1jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQ+XG4gIDxkaXYgcGJsLW5ncmlkLWZpeGVkLW1ldGEtcm93LWNvbnRhaW5lcj1cImZvb3RlclwiPjwvZGl2PlxuXG4gIDxuZy1jb250YWluZXIgI2JlZm9yZUNvbnRlbnQ+XG4gICAgPCEtLSBUaGlzIGR1bW15IHJvdyBpcyB1c2VkIHRvIGV4dHJhY3QgYW4gaW5pdGlhbCByb3cgaGVpZ2h0IC0tPlxuICAgIDxkaXYgcm9sZT1cInJvd1wiIHJvdz1cIlwiIGNsYXNzPVwicGJsLW5ncmlkLXJvdyBjZGstcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPjwvZGl2PlxuICA8L25nLWNvbnRhaW5lcj5cbiAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICA8bmctY29udGFpbmVyICNhZnRlckNvbnRlbnQ+PC9uZy1jb250YWluZXI+XG5cbiAgPCEtLSBQbGFjZWhvbGRlciBmb3IgaGVhZGVyL2Zvb3RlciBzY3JvbGwgY29udGFpbmVycyB0aGF0IHdpbGwgZ2V0IHBvcHVsYXRlZCB3aXRoIGhlYWRlci9tZXRhIHJvbGVzIHdoZW4gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gICAgICAgLSBWaXJ0dWFsIHNjcm9sbGluZyBpcyBlbmFibGVkXG4gICAgICAgLSBSb3dzIGFyZSByZW5kZXJlZCBpbiB0aGUgdmlld3BvcnRcbiAgICAgICAtIENvbnRhaW5lciBpcyBzY3JvbGxpbmdcblxuICAgICAgIFRoZSBwbGFjZWhvbGRlciBpcyBmaXhlZCBzbyB0aGUgYnJvd3NlcnMgZG9lcyBub3QgdXNlIHN0aWNreSBwb3NpdGlvbmluZyB3aGlsZSBzY3JvbGxpbmcsIHdoaWNoIHRha2VzIHRoZSByb3dzIG91dCBvZiB2aWV3IHdoaWxlIHNjcm9sbGluZy5cbiAgICAgICBXaGlsZSBzY3JvbGxpbmcgdGhlIHJvd3MgYXJlIG1vdmVkIGludG8gdGhpcyBwbGFjZWhvbGRlciBhbmQgd2hlbiBzY3JvbGxpbmcgZW5kcyB0aGV5IHJldHVybiB0byB0aGVpciBvcmlnaW5hbCBwb3NpdGlvbmluZy5cblxuICAgICAgIFRoZSBhY3R1YWwgcm93cyBhcmUgYWRkZWQgaW50byB0aGUgaW50ZXJuYWwgZGl2LCB3aXRoaW4gdGhlIHBsYWNlaG9sZGVyLlxuICAgICAgIFRoZSB0b3AgY29udGFpbmVyIGdldCB0aGUgcHJvcGVyIHdpZHRoIGFuZCB0aGUgaW50ZXJuYWwgaGVhZGVyIGdldHMgdGhlIHNjcm9sbCBvZmZzZXQgKGhvcml6b250YWwpIHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBvZmZzZXQuXG4gICAgICAgVGhpcyBoYXMgYW4gZWZmZWN0IG9ubHkgd2hlbiBzY3JvbGxpbmcgd2l0aCB0aGUgd2hlZWwgd2l0aGluIGEgbG9uZyBzY3JvbGxpbmcgc2Vzc2lvbi5cblxuICAgICAgIEltcGxlbWVudGF0aW9uIGlzIGluIHRoZSB2aXJ0dWFsIHNjcm9sbCB2aWV3cG9ydCAobW9yZSBwcmVjaXNlbHkgaW4gYFBibFZpcnR1YWxTY3JvbGxGb3JPZmApXG4gIC0tPlxuICA8ZGl2ICNzdGlja3lSb3dIZWFkZXJDb250YWluZXIgY2xhc3M9XCJwYmwtbmdyaWQtc3RpY2t5LXJvdy1zY3JvbGwtY29udGFpbmVyXCI+PGRpdiBbc3R5bGUubWluV2lkdGgucHhdPVwiaW5uZXJUYWJsZU1pbldpZHRoXCI+PC9kaXY+PC9kaXY+IDwhLS0gSEVBREVSUyAtLT5cbiAgPGRpdiAjc3RpY2t5Um93Rm9vdGVyQ29udGFpbmVyIGNsYXNzPVwicGJsLW5ncmlkLXN0aWNreS1yb3ctc2Nyb2xsLWNvbnRhaW5lclwiPjxkaXYgW3N0eWxlLm1pbldpZHRoLnB4XT1cImlubmVyVGFibGVNaW5XaWR0aFwiPjwvZGl2PjwvZGl2PiA8IS0tIEZPT1RFUlMgLS0+XG48L2Rpdj5cblxuPG5nLXRlbXBsYXRlICNmYlRhYmxlQ2VsbCBsZXQtdmFsdWU9XCJ2YWx1ZVwiPjxkaXY+e3t2YWx1ZX19PC9kaXY+PC9uZy10ZW1wbGF0ZT5cbjxuZy10ZW1wbGF0ZSAjZmJIZWFkZXJDZWxsIGxldC1jb2x1bW49XCJjb2xcIj48ZGl2Pnt7Y29sdW1uLmxhYmVsfX08L2Rpdj48L25nLXRlbXBsYXRlPlxuPG5nLXRlbXBsYXRlICNmYkZvb3RlckNlbGwgbGV0LWNvbHVtbj1cImNvbFwiPjxkaXY+e3tjb2x1bW4ubGFiZWx9fTwvZGl2PjwvbmctdGVtcGxhdGU+XG4iXX0=