import { Subject, asapScheduler, animationFrameScheduler, of, BehaviorSubject, fromEventPattern, EMPTY, fromEvent, race, timer, Observable } from 'rxjs';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Inject, Component, Input, EventEmitter, Directive, Output, isDevMode, NgZone, InjectFlags, Injector, ViewContainerRef, Optional, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, Attribute, SkipSelf, IterableDiffers, ElementRef, ChangeDetectorRef, forwardRef, TemplateRef, ViewChildren, ComponentFactoryResolver, NgModule, Self } from '@angular/core';
import * as i1$2 from '@asafmalin/ngrid/core';
import { unrx, ON_RESIZE_ROW, getValue, deepPathSet, deprecatedWarning, ON_INVALIDATE_HEADERS, ON_INIT, StylingDiffer, ON_DESTROY, removeFromArray, ON_CONSTRUCTED, PblDataSource, createDS, PEB_NGRID_CONFIG, PblNgridConfigService } from '@asafmalin/ngrid/core';
export { PEB_NGRID_CONFIG, PblDataSource, PblDataSourceAdapter, PblDataSourceFactory, PblNgridConfigService, applySort, createDS } from '@asafmalin/ngrid/core';
import { debounceTime, filter, auditTime, take, map, mapTo, buffer, first, takeUntil, skip, startWith, pairwise, tap, switchMap, observeOn, distinctUntilChanged } from 'rxjs/operators';
import * as i1 from '@angular/common';
import { DOCUMENT, CommonModule } from '@angular/common';
import * as i4 from '@angular/cdk/table';
import { CdkColumnDef, CdkRow, CdkHeaderRow, CdkRowDef, CDK_TABLE, CdkTable, StickyStyler, _COALESCED_STYLE_SCHEDULER, STICKY_POSITIONING_LISTENER, _CoalescedStyleScheduler, CDK_TABLE_TEMPLATE, CdkHeaderRowDef, CdkFooterRowDef, CdkTableModule } from '@angular/cdk/table';
import * as i2 from '@angular/cdk/platform';
import { _VIEW_REPEATER_STRATEGY } from '@angular/cdk/collections';
import * as i3 from '@angular/cdk/scrolling';
import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY, VIRTUAL_SCROLLABLE, ScrollingModule } from '@angular/cdk/scrolling';
import * as i1$1 from '@angular/cdk/bidi';
import { coerceNumberProperty, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ScrollingModule as ScrollingModule$1 } from '@angular/cdk-experimental/scrolling';

function bindGridToDataSource(extApi) {
    extApi.events.subscribe(event => {
        if (event.kind === 'onDataSource') {
            const { curr, prev } = event;
            if (prev && prev.hostGrid === extApi.grid) {
                prev.hostGrid = undefined;
            }
            if (curr) {
                curr.hostGrid = extApi.grid;
            }
        }
        else if (event.kind === 'onDestroy') {
            const ds = extApi.grid.ds;
            if (ds.hostGrid === extApi.grid) {
                ds.hostGrid = undefined;
            }
        }
    });
}

const EXT_API_TOKEN = new InjectionToken('PBL_NGRID_EXTERNAL_API');

function metaRowSectionFactory() {
    return { fixed: [], row: [], sticky: [], all: [] };
}
class PblNgridMetaRowService {
    constructor(extApi) {
        this.extApi = extApi;
        this.header = metaRowSectionFactory();
        this.footer = metaRowSectionFactory();
        this.sync$ = new Subject();
        this.hzScroll$ = new Subject();
        this.sync = this.sync$ // TODO: complete
            .pipe(debounceTime(0, asapScheduler));
        this.hzScroll = this.hzScroll$.asObservable();
        extApi.onInit(() => {
            const { grid } = extApi;
            let hzOffset = grid.viewport.measureScrollOffset('start');
            let trackScroll = true;
            grid.viewport.elementScrolled()
                .pipe(filter(() => trackScroll), auditTime(0, animationFrameScheduler))
                .subscribe({
                next: () => {
                    const newOffset = grid.viewport.measureScrollOffset('start');
                    if (hzOffset !== newOffset) {
                        this.hzScroll$.next(hzOffset = newOffset);
                    }
                    else if (grid.viewport.isScrolling) {
                        trackScroll = false;
                        grid.viewport.scrolling
                            .pipe(take(1))
                            .subscribe(() => trackScroll = true);
                    }
                },
                complete: () => this.hzScroll$.complete(),
            });
        });
    }
    addMetaRow(metaRow) {
        const { columnStore } = this.extApi;
        const header = columnStore.metaHeaderRows;
        const footer = columnStore.metaFooterRows;
        const rowDef = metaRow.meta;
        if (rowDef === columnStore.headerColumnDef) {
            if (metaRow.gridWidthRow === true) {
                // This is a dummy row used to measure width and get width resize notifications
                this.gridWidthRow = { rowDef, el: metaRow.element };
            }
            else {
                // This is the main header column row, it doesn't have an index but we will assign as if it's the last
                // so other features will be able to sort by physical location
                this.addToSection(this.header, metaRow, columnStore.metaHeaderRows.length);
            }
        }
        else if (rowDef === columnStore.footerColumnDef) {
            // This is the main footer column row
            this.addToSection(this.footer, metaRow, 0);
        }
        else {
            // All meta rows
            let index = header.findIndex(h => h.rowDef === rowDef);
            if (index > -1) {
                this.addToSection(this.header, metaRow, index);
            }
            else {
                index = footer.findIndex(h => h.rowDef === rowDef);
                if (index > -1) {
                    this.addToSection(this.footer, metaRow, index);
                }
                else {
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error('Invalid operation');
                    }
                }
            }
        }
        this.sync$.next();
    }
    removeMetaRow(metaRow) {
        const rowDef = metaRow.meta;
        let index = this.header.all.indexOf(metaRow.meta);
        if (index > -1) {
            this.header.all.splice(index, 1);
            index = this.header[rowDef.type].findIndex(h => h.rowDef === rowDef);
            this.header[rowDef.type].splice(index, 1);
            this.sync$.next();
        }
        else if ((index = this.footer.all.indexOf(metaRow.meta)) > -1) {
            this.footer.all.splice(index, 1);
            index = this.footer[rowDef.type].findIndex(h => h.rowDef === rowDef);
            this.footer[rowDef.type].splice(index, 1);
            this.sync$.next();
        }
    }
    addToSection(section, metaRow, index) {
        const rowDef = metaRow.meta;
        section[rowDef.type].push({ index, rowDef, el: metaRow.element });
        section.all.push(rowDef);
    }
}
/** @nocollapse */ PblNgridMetaRowService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowService, deps: [{ token: EXT_API_TOKEN }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridMetaRowService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }]; } });

class PblNgridMetaRowContainerComponent {
    constructor(metaRows, elRef) {
        this.metaRows = metaRows;
        this._width$ = new Subject();
        this._totalColumnWidth = 0;
        this._hzScrollDir = 1;
        this.element = elRef.nativeElement;
        metaRows.sync.pipe(unrx(this)).subscribe(() => this.syncRowDefinitions());
        this.metaRows.extApi.events
            .pipe(ON_RESIZE_ROW, unrx(this))
            .subscribe(event => this.updateWidths());
        this.metaRows.extApi.grid.columnApi.totalColumnWidthChange
            .pipe(unrx(this))
            .subscribe(width => {
            this._totalColumnWidth = width;
            this.updateWidths();
        });
        this._hzScrollDir = this.metaRows.extApi.getDirection() === 'rtl' ? -1 : 1;
        this.metaRows.extApi.directionChange()
            .pipe(unrx(this))
            .subscribe(dir => this._hzScrollDir = dir === 'rtl' ? -1 : 1);
    }
    ngOnChanges(changes) {
        if ('type' in changes) {
            const scrollContainerElement = this.element;
            scrollContainerElement.scrollLeft = this.metaRows.extApi.grid.viewport.measureScrollOffset('start') * this._hzScrollDir;
            if (changes.type.isFirstChange) {
                this.metaRows.hzScroll
                    .pipe(unrx(this))
                    .subscribe(offset => scrollContainerElement.scrollLeft = offset * this._hzScrollDir);
                this.metaRows.extApi.cdkTable.onRenderRows
                    .pipe(unrx(this))
                    .subscribe(() => { this.updateWidths(); });
            }
        }
    }
    ngOnDestroy() {
        this._width$.complete();
        unrx.kill(this);
    }
    updateWidths() {
        this._innerWidth = this.metaRows.extApi.grid.viewport.innerWidth;
        this._minWidth = this.metaRows.extApi.cdkTable.minWidth;
        this._width = Math.max(this._innerWidth, this._minWidth);
        this._width$.next(Math.max(this._innerWidth, this._totalColumnWidth));
    }
    syncRowDefinitions() {
        const isHeader = this.type === 'header';
        const section = isHeader ? this.metaRows.header : this.metaRows.footer;
        const widthContainer = this.element.firstElementChild;
        const container = widthContainer.nextElementSibling;
        if (isHeader) {
            widthContainer.appendChild(this.metaRows.gridWidthRow.el);
        }
        for (const def of section.fixed) {
            container.appendChild(def.el);
        }
    }
}
/** @nocollapse */ PblNgridMetaRowContainerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowContainerComponent, deps: [{ token: PblNgridMetaRowService }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridMetaRowContainerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMetaRowContainerComponent, selector: "div[pbl-ngrid-fixed-meta-row-container]", inputs: { type: ["pbl-ngrid-fixed-meta-row-container", "type"] }, host: { properties: { "style.width.px": "_innerWidth" }, styleAttribute: "flex: 0 0 auto; overflow: hidden;" }, usesOnChanges: true, ngImport: i0, template: `<div class="pbl-cdk-table" style="height: 0px; overflow: hidden;" [style.width.px]="_width"></div><div class="pbl-cdk-table" [style.width.px]="_width$ | async"></div>`, isInline: true, dependencies: [{ kind: "pipe", type: i1.AsyncPipe, name: "async" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowContainerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'div[pbl-ngrid-fixed-meta-row-container]',
                    template: `<div class="pbl-cdk-table" style="height: 0px; overflow: hidden;" [style.width.px]="_width"></div><div class="pbl-cdk-table" [style.width.px]="_width$ | async"></div>`,
                    host: {
                        style: 'flex: 0 0 auto; overflow: hidden;',
                        '[style.width.px]': '_innerWidth',
                    },
                }]
        }], ctorParameters: function () { return [{ type: PblNgridMetaRowService }, { type: i0.ElementRef }]; }, propDecorators: { type: [{
                type: Input,
                args: ['pbl-ngrid-fixed-meta-row-container']
            }] } });

const COLUMN_NAME_CSS_PREFIX = 'pbl-ngrid-column';
/**
 * Returns a css class unique to the column
 */
function uniqueColumnCss(columnDef) {
    return `${COLUMN_NAME_CSS_PREFIX}-${columnDef.cssClassFriendlyName}`;
}
/**
 * Returns a css class unique to the type of the column (columns might share types)
 */
function uniqueColumnTypeCss(type) {
    return `${COLUMN_NAME_CSS_PREFIX}-type-${type.name}`;
}

const RE_PARSE_STYLE_LENGTH_UNIT = /((?:\d*\.)?\d+)(%|px)$/;
function parseStyleWidth(exp) {
    const match = RE_PARSE_STYLE_LENGTH_UNIT.exec(exp);
    if (match) {
        return { value: Number(match[1]), type: match[2] };
    }
}
function initDefinitions(def, target) {
    const copyKeys = ['id', 'label', 'css', 'minWidth', 'width', 'maxWidth', 'type'];
    copyKeys.forEach(k => k in def && (target[k] = def[k]));
    if (def.data) {
        target.data = Object.assign(target.data || {}, def.data);
    }
}

const PBL_NGRID_META_COLUMN_MARK = Symbol('PblMetaColumn');
const CLONE_PROPERTIES$2 = ['kind', 'rowIndex'];
function isPblMetaColumn(def) {
    return def instanceof PblMetaColumn || (def && def[PBL_NGRID_META_COLUMN_MARK] === true);
}
class PblMetaColumn {
    constructor(def) {
        /**
         * A place to store things...
         * This must be an object, values are shadow-copied so persist data between multiple plugins.
         */
        this.data = {};
        this.defaultWidth = '';
        this[PBL_NGRID_META_COLUMN_MARK] = true;
        initDefinitions(def, this);
        for (const prop of CLONE_PROPERTIES$2) {
            if (prop in def) {
                this[prop] = def[prop];
            }
        }
        if (!isPblMetaColumn(def)) {
            if (typeof def.type === 'string') {
                this.type = { name: def.type };
            }
        }
    }
    /**
     * The width in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     */
    get width() { return this._width; }
    set width(value) {
        if (value !== this._width) {
            this._parsedWidth = parseStyleWidth(this._width = value);
            // Error in dev, on prod just let it be unset
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._parsedWidth && value) {
                    throw new Error(`Invalid width "${value}" in column ${this.id}. Valid values are ##% or ##px (50% / 50px)`);
                }
            }
            const isFixedWidth = this._parsedWidth && this._parsedWidth.type === 'px';
            Object.defineProperty(this, 'isFixedWidth', { value: isFixedWidth, configurable: true });
        }
    }
    //#endregion PblMetaColumnDefinition
    get parsedWidth() { return this._parsedWidth; }
    /**
     * The column def for this column.
     */
    get columnDef() { return this._columnDef; }
    static extendProperty(name) {
        if (CLONE_PROPERTIES$2.indexOf(name) === -1) {
            CLONE_PROPERTIES$2.push(name);
        }
    }
    attach(columnDef) {
        this.detach();
        this._columnDef = columnDef;
        this.columnDef.updateWidth(this.width || this.defaultWidth, 'attach');
    }
    detach() {
        this._columnDef = undefined;
    }
    updateWidth(fallbackDefault) {
        this.defaultWidth = fallbackDefault || '';
        if (this.columnDef) {
            this.columnDef.updateWidth(this.width || fallbackDefault, 'update');
        }
    }
}

const PBL_NGRID_COLUMN_GROUP_MARK = Symbol('PblColumnGroup');
const CLONE_PROPERTIES$1 = [];
function isPblColumnGroup(def) {
    return def instanceof PblColumnGroup || (def && def[PBL_NGRID_COLUMN_GROUP_MARK] === true);
}
function getId(value) {
    return typeof value === 'string' ? value : value.id;
}
class PblColumnGroupStore {
    constructor() {
        this.store = new Map();
        this._all = [];
    }
    get all() { return this._all; }
    /**
     * Attach a column to a group.
     */
    attach(group, column) {
        const g = this._find(group);
        if (g) {
            g.activeColumns.add(getId(column));
            return true;
        }
        return false;
    }
    /**
     * Detach a column from a group.
     */
    detach(group, column) {
        const g = this._find(group);
        if (g) {
            return g.activeColumns.delete(getId(column));
        }
        return false;
    }
    /**
     * Returns a list of `PblColumnGroup` that does not have columns attached.
     */
    findGhosts() {
        return Array.from(this.store.values())
            .filter(item => item.activeColumns.size === 0)
            .map(item => item.group);
    }
    add(group) {
        this.store.set(group.id, { group, activeColumns: new Set() });
        this.updateAll();
    }
    remove(group) {
        const g = this.find(group);
        if (g && this.store.delete(g.id)) {
            this.updateAll();
            return true;
        }
        return false;
    }
    find(group) {
        const g = this._find(group);
        if (g) {
            return g.group;
        }
    }
    clone() {
        const c = new PblColumnGroupStore();
        c.store = new Map(this.store);
        c.updateAll();
        return c;
    }
    _find(group) {
        return this.store.get(getId(group));
    }
    updateAll() {
        this._all = Array.from(this.store.values()).map(item => item.group);
    }
}
class PblColumnGroup extends PblMetaColumn {
    constructor(def, columns, placeholder = false) {
        super(isPblColumnGroup(def)
            ? def
            : { id: `group-${def.columnIds.join('.')}-row-${def.rowIndex}`, kind: 'header', ...def });
        this.placeholder = placeholder;
        this[PBL_NGRID_COLUMN_GROUP_MARK] = true;
        this.columnIds = def.columnIds;
        this.columns = columns;
        for (const c of columns) {
            c.markInGroup(this);
        }
        for (const prop of CLONE_PROPERTIES$1) {
            if (prop in def) {
                this[prop] = def[prop];
            }
        }
    }
    //#endregion PblColumnGroupDefinition
    /**
     * Returns the visible state of the column.
     * The column is visible if AT LEAST ONE child column is visible (i.e. not hidden)
     */
    get isVisible() {
        return this.columns.some(c => !c.hidden);
    }
    static extendProperty(name) {
        if (CLONE_PROPERTIES$1.indexOf(name) === -1) {
            CLONE_PROPERTIES$1.push(name);
        }
    }
    createSlave(columns = []) {
        const slave = new PblColumnGroup({ ...this, id: this.id + '-slave' + Date.now() }, columns);
        slave.slaveOf = this;
        Object.defineProperty(slave, 'template', { get: function () { return this.slaveOf.template; }, set: function (value) { } });
        return slave;
    }
    replace(newColumn) {
        const { id } = newColumn;
        const idx = this.columns.findIndex(c => c.id === id);
        if (idx > -1) {
            this.columns.splice(idx, 1, newColumn);
            return true;
        }
        return false;
    }
}

const PBL_NGRID_COLUMN_MARK = Symbol('PblColumn');
const CLONE_PROPERTIES = ['pIndex', 'transform', 'filter', 'sort', 'alias', 'headerType', 'footerType', 'pin'];
function isPblColumn(def) {
    return def instanceof PblColumn || (def && def[PBL_NGRID_COLUMN_MARK] === true);
}
class PblColumn {
    constructor(def, groupStore) {
        /**
         * A place to store things...
         * This must be an object, values are shadow-copied so persist data between multiple plugins.
         */
        this.data = {};
        this.defaultWidth = '';
        /**
         * Groups that this column belongs to.
         * WARNING: DO NOT ADD/REMOVE GROUPS DIRECTLY, USE markInGroup/markNotInGroup.
         */
        this._groups = new Set();
        this[PBL_NGRID_COLUMN_MARK] = true;
        if (isPblColumn(def)) {
            initDefinitions(def, this);
            this.prop = def.prop;
            this.path = def.path;
            this.orgProp = def.orgProp;
            this.groupStore = groupStore || def.groupStore;
            this._groups = new Set(def._groups);
            for (const id of Array.from(def._groups.values())) {
                const g = this.groupStore.find(id);
                if (g) {
                    this.markInGroup(g);
                    g.replace(this);
                }
            }
        }
        else {
            const path = def.path || def.prop.split('.');
            const prop = def.path ? def.prop : path.pop();
            def = Object.create(def);
            def.id = def.id || def.prop || def.label;
            def.label = 'label' in def ? def.label : prop;
            if (typeof def.type === 'string') {
                def.type = { name: def.type };
            }
            if (typeof def.headerType === 'string') {
                def.headerType = { name: def.headerType };
            }
            if (typeof def.footerType === 'string') {
                def.footerType = { name: def.footerType };
            }
            initDefinitions(def, this);
            this.groupStore = groupStore || new PblColumnGroupStore();
            this.prop = prop;
            this.orgProp = def.prop;
            if (path.length) {
                this.path = path;
            }
        }
        for (const prop of CLONE_PROPERTIES) {
            if (prop in def) {
                this[prop] = def[prop];
            }
        }
    }
    /**
     * The width in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     */
    get width() { return this._width; }
    set width(value) {
        if (value !== this._width) {
            this._parsedWidth = parseStyleWidth(this._width = value);
            // Error in dev, on prod just let it be unset
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._parsedWidth && value) {
                    throw new Error(`Invalid width "${value}" in column ${this.prop}. Valid values are ##% or ##px (50% / 50px)`);
                }
            }
            const isFixedWidth = this._parsedWidth?.type === 'px';
            Object.defineProperty(this, 'isFixedWidth', { value: isFixedWidth, configurable: true });
        }
    }
    get parsedWidth() { return this._parsedWidth; }
    /**
     * The column def for this column.
     */
    get columnDef() { return this._columnDef; }
    get groups() { return Array.from(this._groups.values()); }
    static extendProperty(name) {
        if (CLONE_PROPERTIES.indexOf(name) === -1) {
            CLONE_PROPERTIES.push(name);
        }
    }
    attach(columnDef) {
        this.detach();
        this._columnDef = columnDef;
        if (this.defaultWidth) {
            this.columnDef.updateWidth(this.width || this.defaultWidth, 'attach');
        }
    }
    detach() {
        this._columnDef = undefined;
    }
    setDefaultWidth(defaultWidth) {
        this.defaultWidth = defaultWidth;
    }
    updateWidth(width) {
        if (width) {
            this.width = width;
        }
        const { columnDef } = this;
        if (columnDef) {
            columnDef.updateWidth(this.width || this.defaultWidth || '', 'update');
        }
    }
    /**
     * Get the value this column points to in the provided row
     */
    getValue(row) { return getValue(this, row); }
    /**
     * Set a value in the provided row where this column points to
     */
    setValue(row, value) { return deepPathSet(row, this, value); }
    /**
     * Mark's that this column belong to the provided group.
     * \> Note that this internal to the column and does not effect the group in any way.
     */
    markInGroup(g) {
        this.groupStore.attach(g, this);
        this._groups.add(g.id);
    }
    /**
     * Mark's that this column does not belong to the provided group.
     * \> Note that this internal to the column and does not effect the group in any way.
     */
    markNotInGroup(g) {
        this.groupStore.detach(g, this);
        return this._groups.delete(g.id);
    }
    isInGroup(g) {
        return this._groups.has(g.id);
    }
    getGroupOfRow(rowIndex) {
        const groupIds = this.groups;
        for (const id of groupIds) {
            const g = this.groupStore.find(id);
            if (g && g.rowIndex === rowIndex) {
                return g;
            }
        }
    }
    groupLogic(columnGroups, groupExists) {
        const [gPrev, gCurr, gNext] = columnGroups;
        // STATE: This column has same group of previous column, nothing to do.
        if (gCurr === gPrev) {
            return gCurr;
        }
        // STATE: The group exists in one of the columns BUT NOT in the LAST COLUMN (i.e: Its a slave split)
        if (groupExists) {
            // If the previous sibling group is a slave and this group is the origin of the slave, convert this group to the slave.
            if (gPrev && gCurr === gPrev.slaveOf) {
                return gPrev;
            }
            if (gNext && gCurr === gNext.slaveOf) {
                return gNext;
            }
            // Otherwise create the slave.
            const g = gCurr.createSlave([this]);
            this.groupStore.add(g);
            // If the current group is a placeholder and either the previous OR next sibling group is a placeholder as well
            // we want to group them together, although they are not related, because they both have identical headers (empty header).
            // Note that we still create the salve, we just don't use it.
            if (gCurr.placeholder) {
                const prevPH = gPrev && gPrev.placeholder;
                const nextPH = gNext && gNext.slaveOf && gNext.placeholder;
                const groupWithPlaceholder = prevPH ? gPrev : nextPH ? gNext : undefined;
                // const groupWithPlaceholder = prevPH && gPrev;
                if (groupWithPlaceholder) {
                    return groupWithPlaceholder;
                }
            }
            return g;
        }
        else if (gCurr?.slaveOf) {
            // STATE: The group IS a slave and it is set AFTER an item that belongs to the group it is slave of.
            if (gCurr.slaveOf === gPrev) {
                return gCurr.slaveOf;
            }
            if (gCurr.slaveOf === gPrev?.slaveOf) {
                return gPrev;
            }
            // STATE: The group IS a slave and it is set BEFORE an item that belongs to the group it is slave of.
            if (gCurr.slaveOf === gNext) {
                return gCurr.slaveOf;
            }
        }
        else {
            if (gPrev?.placeholder && gCurr?.placeholder) {
                return gPrev;
            }
        }
        return gCurr;
    }
    /**
     * Calculates if the column width is locked by a maximum by checking if the given width is equal to the max width.
     * If the result of the calculation (true/false) does not equal the previous lock state it will set the new lock state
     * and return true.
     * Otherwise return false.
     * @internal
     */
    checkMaxWidthLock(actualWidth) {
        if (actualWidth === this.maxWidth) {
            if (!this.maxWidthLock) {
                this.maxWidthLock = true;
                return true;
            }
        }
        else if (this.maxWidthLock) {
            this.maxWidthLock = false;
            return true;
        }
        return false;
    }
}

class PblColumnFactory {
    constructor() {
        this._raw = { table: { cols: [] }, header: [], footer: [], headerGroup: [] };
        this._defaults = {
            table: {},
            header: {},
            footer: {},
        };
        this._currentHeaderRow = 0;
        this._currentFooterRow = 0;
    }
    get currentHeaderRow() { return this._currentHeaderRow; }
    get currentFooterRow() { return this._currentFooterRow; }
    static fromDefinitionSet(defs) {
        const f = new PblColumnFactory();
        Object.assign(f._raw, defs);
        return f;
    }
    build() {
        const { _defaults, _raw } = this;
        const groupStore = new PblColumnGroupStore();
        const table = {
            header: _raw.table.header,
            footer: _raw.table.footer,
            cols: _raw.table.cols.map(d => new PblColumn({ ..._defaults.table, ...d }, groupStore)),
        };
        const header = _raw.header.map(h => ({
            rowIndex: h.rowIndex,
            rowClassName: h.rowClassName,
            type: h.type || 'fixed',
            cols: h.cols.map(c => new PblMetaColumn({ ..._defaults.header, ...c })),
        }));
        const footer = _raw.footer.map(f => ({
            rowIndex: f.rowIndex,
            rowClassName: f.rowClassName,
            type: f.type || 'fixed',
            cols: f.cols.map(c => new PblMetaColumn({ ..._defaults.footer, ...c }))
        }));
        const headerGroup = _raw.headerGroup.map(hg => ({
            rowIndex: hg.rowIndex,
            rowClassName: hg.rowClassName,
            type: hg.type || 'fixed',
            cols: this.buildHeaderGroups(hg.rowIndex, hg.cols, table.cols).map(g => {
                groupStore.add(g);
                return g;
            }),
        }));
        return {
            groupStore,
            table,
            header,
            footer,
            headerGroup,
        };
    }
    default(def, type = 'table') {
        this._defaults[type] = def;
        return this;
    }
    table(...defs) {
        const rowOptions = defs[0].prop ? {} : defs.shift();
        const { header, footer } = rowOptions;
        Object.assign(this._raw.table, { header, footer });
        this._raw.table.cols.push(...defs);
        return this;
    }
    header(...defs) {
        const rowIndex = this._currentHeaderRow++;
        const rowOptions = this.processRowOptions(defs);
        const rowClassName = this.genRowClass(rowOptions, rowIndex);
        const headers = defs.map((d) => {
            const def = {
                id: d.id,
                kind: 'header',
                rowIndex
            };
            return Object.assign(def, d);
        });
        this._raw.header.push({
            rowIndex,
            rowClassName,
            cols: headers,
            type: (rowOptions && rowOptions.type) || 'fixed',
        });
        return this;
    }
    footer(...defs) {
        const rowIndex = this._currentFooterRow++;
        const rowOptions = this.processRowOptions(defs);
        const rowClassName = this.genRowClass(rowOptions, rowIndex);
        const footers = defs.map((d) => {
            const def = {
                id: d.id,
                kind: 'footer',
                rowIndex
            };
            return Object.assign(def, d);
        });
        this._raw.footer.push({
            rowIndex,
            rowClassName,
            cols: footers,
            type: (rowOptions && rowOptions.type) || 'fixed',
        });
        return this;
    }
    headerGroup(...defs) {
        const rowIndex = this._currentHeaderRow++;
        const rowOptions = this.processRowOptions(defs, 'columnIds', 'prop');
        const rowClassName = this.genRowClass(rowOptions, rowIndex);
        const headerGroups = defs.map(d => Object.assign({ rowIndex }, d));
        this._raw.headerGroup.push({
            rowIndex,
            rowClassName,
            cols: headerGroups,
            type: (rowOptions && rowOptions.type) || 'fixed',
        });
        return this;
    }
    processRowOptions(defs, ...mustHaveProperty) {
        if (mustHaveProperty.length === 0) {
            mustHaveProperty = ['id'];
        }
        for (const prop of mustHaveProperty) {
            if (prop in defs[0]) {
                return;
            }
        }
        return defs.shift();
    }
    genRowClass(rowOptions, fallbackRowIndex) {
        return (rowOptions && rowOptions.rowClassName) || `pbl-ngrid-row-index-${fallbackRowIndex.toString()}`;
    }
    buildHeaderGroups(rowIndex, headerGroupDefs, table) {
        const headerGroup = [];
        // Building of header group rows requires some work.
        // The user defined groups might not cover all columns, creating gaps between group columns so we need to add placeholder groups to cover these gaps.
        // Moreover, the user might not specify a `prop`, which we might need to complete.
        // We do that for each header group row.
        //
        // The end goal is to return a list of `PblColumnGroup` that span over the entire columns of the grid.
        //
        // The logic is as follows:
        // For each column in the grid, find a matching column group - a group pointing at the column by having the same `prop`
        // If found, check it's span and skip X amount of columns where X is the span.
        // If a span is not defined then treat it as a greedy group that spans over all columns ahead until the next column that has a matching group column.
        //
        // If a column does not have a matching group column, search for group columns without a `prop` specified and when found set their `prop` to the current
        // column so we will now use them as if it's a user provided group for this column...
        //
        // If no group columns exists (or left), we create an ad-hoc group column and we will now use them as if it's a user provided group for this column...
        //
        const tableDefs = table.slice();
        const defs = headerGroupDefs.slice();
        for (const d of defs) {
            // TODO: remove in V5, when prop & span are deprecated
            // @deprecated Will be removed in v5
            if (d.prop) {
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                    deprecatedWarning('PblColumnGroupDefinition.prop', '4', 'PblColumnGroupDefinition.columnIds');
                    deprecatedWarning('PblColumnGroupDefinition.span', '4', 'PblColumnGroupDefinition.columnIds');
                }
                const start = tableDefs.findIndex(c => c.orgProp === d.prop);
                d.columnIds = tableDefs.slice(start, start + d.span + 1).map(c => c.id);
                delete d.prop;
                delete d.span;
            }
            d.rowIndex = rowIndex;
            const group = new PblColumnGroup(d, tableDefs.filter(c => d.columnIds.indexOf(c.orgProp) > -1), false);
            headerGroup.push(group);
        }
        let marker = 0;
        while (tableDefs.length) {
            const column = tableDefs.shift();
            const orgProp = column.orgProp;
            const existingGroupIndex = headerGroup.findIndex(hg => hg.columnIds.indexOf(orgProp) > -1);
            if (existingGroupIndex > -1) {
                const hg = headerGroup[existingGroupIndex];
                if (existingGroupIndex < marker) {
                    const columns = [column];
                    while (hg.columnIds.indexOf(tableDefs[0]?.orgProp) > -1) {
                        columns.push(tableDefs.shift());
                    }
                    headerGroup[marker] = hg.createSlave(columns);
                    marker += 1;
                }
                else {
                    while (hg.columnIds.indexOf(tableDefs[0]?.orgProp) > -1) {
                        tableDefs.shift();
                    }
                    marker += 1;
                }
            }
            else {
                const prev = headerGroup[marker - 1];
                if (prev?.placeholder) {
                    const clone = Object.keys(prev).reduce((p, c) => {
                        p[c] = prev[c];
                        return p;
                    }, {});
                    clone.columnIds = [...clone.columnIds, orgProp];
                    delete clone.id;
                    headerGroup[marker - 1] = new PblColumnGroup(clone, [...prev.columns, column], true);
                }
                else {
                    const d = { rowIndex, kind: 'header', columnIds: [orgProp] };
                    headerGroup.splice(marker, 0, new PblColumnGroup(d, [column], true));
                    marker += 1;
                }
            }
        }
        return headerGroup;
    }
}
function columnFactory() {
    return new PblColumnFactory();
}

/**
 * A class that represents the dimensions and style of a column cell.
 * The class is bound to an element and a column.
 *
 * Calling `updateSize()` will sync the layout from the DOM element to the class properties
 * and trigger a resize event on the column's column definition object.
 *
 * > Note that `updateSize()` only works when a column is attached
 *
 * This class shouldn't be used directly. In NGrid, it is wrapped by `PblColumnSizeObserver` which automatically triggers
 * update size events using the `ResizeObserver` API.
 */
class ColumnSizeInfo {
    constructor(target) {
        this.target = target;
    }
    get column() { return this._column; }
    set column(value) { this.attachColumn(value); }
    attachColumn(column) {
        this.detachColumn();
        if (column) {
            column.sizeInfo = this;
        }
        this._column = column;
    }
    detachColumn() {
        if (this._column) {
            this._column.sizeInfo = undefined;
            this._column = undefined;
        }
    }
    updateSize() {
        if (this.column && !this.column.columnDef.isDragging) {
            const el = this.target;
            const rect = el.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.style = getComputedStyle(el);
            this.column.columnDef.onResize();
        }
    }
}

/**
 * A column width calculator that calculates column width for a specific column or a group of columns.
 * It also provide the minimum required row width for the total columns added up to that point.
 *
 * The `DynamicColumnWidthLogic` takes into account real-time DOM measurements (especially box-model metadata), hence "dynamic".
 * It performs the calculation based on `PblColumn` and actual DOM size metadata.
 *
 * The `DynamicColumnWidthLogic` has 3 responsibilities:
 *
 * - It is responsible for enforcing the `maxWidth` boundary constraint for every column it processes by calculating the actual width
 * of a column and calling `PblColumn.checkMaxWidthLock` to verify if max width lock has changed due to the new actual width.
 *
 * - It calculates the absolute width for a group of columns, so `PblCdkVirtualScrollViewportComponentGroupColumn` can have an exact size that wraps it's children.
 *
 * - It calculates the `minimumRowWidth`, which represents the minimum width required width of the row, i.e. table.
 *
 * > Note that an instance of `DynamicColumnWidthLogic` represents a one-time pass for all columns, for every run a new instance is required.
 */
class DynamicColumnWidthLogic {
    constructor(strategy, dir) {
        this.strategy = strategy;
        this.dir = dir;
        this.cols = new Map();
        this._minimumRowWidth = 0;
    }
    get minimumRowWidth() { return this._minimumRowWidth; }
    ;
    reset() {
        this.maxWidthLockChanged = false;
        this._minimumRowWidth = 0;
        this.cols.clear();
    }
    /**
     * Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
     */
    widthBreakout(columnInfo) {
        return widthBreakout(this.strategy, columnInfo);
    }
    /**
     * Add a column to the calculation.
     *
     * The operation will update the minimum required width and trigger a `checkMaxWidthLock` on the column.
     * If the max width lock has changed the `maxWidthLockChanged` is set to true.
     *
     * A column that was previously added is ignored.
     *
     * Note that once `maxWidthLockChanged` is set to true it will never change.
     */
    addColumn(columnInfo) {
        if (!this.cols.has(columnInfo)) {
            const { column } = columnInfo;
            let minWidth = column.minWidth || 0;
            if (column.isFixedWidth) {
                minWidth = Math.max(column.parsedWidth.value, minWidth);
            }
            const nonContent = this.strategy.cell(columnInfo);
            const width = minWidth + nonContent;
            this.cols.set(columnInfo, width);
            this._minimumRowWidth += width;
            if (column.maxWidth) {
                const actualWidth = columnInfo.width - nonContent;
                if (column.checkMaxWidthLock(actualWidth)) {
                    this.maxWidthLockChanged = true;
                }
            }
        }
    }
    /**
     * Run each of the columns through `addColumn` and returns the sum of the width all columns using
     * the box model space strategy.
     *
     * The result represents the absolute width to be used in a `PblColumnGroup`.
     *
     * > Note that when a table has multiple column-group rows each column is the child of multiple group column, hence calling `addColumn` with the
     * same group more then once. However, since `addColumn()` ignores columns it already processed it is safe.
     */
    addGroup(columnInfos) {
        let sum = 0;
        for (const c of columnInfos) {
            this.addColumn(c);
            sum += c.width;
        }
        sum -= this.strategy.group(columnInfos, this.dir);
        return sum;
    }
}
/**
* Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
*/
function widthBreakout(strategy, columnInfo) {
    const nonContent = strategy.cell(columnInfo);
    return {
        content: columnInfo.width - nonContent,
        nonContent,
    };
}
const DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY = {
    cell(col) {
        const style = col.style;
        return parseInt(style.paddingLeft, 10) + parseInt(style.paddingRight, 10);
    },
    groupCell(col) {
        return 0;
    },
    group(cols, dir) {
        const len = cols.length;
        return len > 0 ? parseInt(cols[0].style[dir === 'rtl' ? 'paddingRight' : 'paddingLeft'], 10) + parseInt(cols[len - 1].style[dir === 'rtl' ? 'paddingLeft' : 'paddingRight'], 10) : 0;
    }
};

// tslint:disable:use-host-property-decorator
/**
 * Represents a runtime column definition for a user-defined column definitions.
 *
 * User defined column definitions are `PblColumn`, `PblMetaColumn`, `PblColumnGroup` etc...
 * They represent static column definitions and `PblNgridColumnDef` is the runtime instance of them.
 *
 */
class PblNgridColumnDef extends CdkColumnDef {
    constructor(extApi) {
        super();
        this.extApi = extApi;
        this.isDragging = false;
        /**
         * An event emitted when width of this column has changed.
         */
        this.widthChange = new EventEmitter();
        /**
         * The complete width definition for the column.
         *
         * There are 2 width sets (tuple):
         * - [0]: The source width definitions as set in static column definition instance
         * - [1]: The absolute width definitions, as currently set in the DOM (getBoundingClientRect())
         *
         * Each set is made up of 3 primitive width definitions: MIN-WIDTH, WIDTH and MAX-WIDTH.
         * The tuple represents them in that order, i.e: [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
         */
        this._widths = [];
        this.grid = extApi.grid;
        const { strategy } = extApi.widthCalc.dynamicColumnWidth;
        this.widthBreakout = c => widthBreakout(strategy, c);
    }
    get column() { return this._column; }
    ;
    set column(value) { this.attach(value); }
    /**
     * The absolute width definitions, as currently set in the DOM (getBoundingClientRect()).
     * If no measurements exists yet, return the user defined width's.
     *
     * The tuple represents them in that order, i.e: [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
     */
    get widths() { return this._widths[1]; }
    /**
     * The last net width of the column.
     * The net width is the absolute width of the column, without padding, border etc...
     */
    get netWidth() { return this._netWidth; }
    /**
     * Update the "widths" for this column and when width has changed.
     *
     * The "widths" are the 3 values representing a width of a cell: [minWidth, width, maxWidth],
     * this method is given the width and will calculate the minWidth and maxWidth based on the column definitions.
     *
     * If at least one value of "widths" has changed, fires the `widthChange` event with the `reason` provided.
     *
     * The reason can be used to optionally update the relevant cells, based on the source (reason) of the update.
     * - attach: This runtime column definition instance was attached to a static column definition instance.
     * - update: The width value was updated in the static column definition instance , which triggered a width update to the runtime column definition instance
     * - resize: A resize event to the header PblColumn cell was triggered, the width of the static column definition is not updated, only the runtime value is.
     *
     * Note that this updates the width of the column-def instance, not the column definitions width itself.
     * Only when `reason === 'update'` it means that the column definition was updated and triggered this update
     *
     * @param width The new width
     * @param reason The reason for this change
     */
    updateWidth(width, reason) {
        const { isFixedWidth, parsedWidth } = this._column;
        /*  Setting the minimum width is based on the input.
            If the original width is pixel fixed we will take the maximum between it and the min width.
            If not, we will the take minWidth.
            If none of the above worked we will try to see if the current width is set with %, if so it will be our min width.
        */
        const minWidthPx = isFixedWidth
            ? Math.max(this._column.parsedWidth.value, this._column.minWidth || 0)
            : this._column.minWidth;
        let minWidth = minWidthPx && `${minWidthPx}px`;
        if (!minWidth && parsedWidth?.type === '%') {
            minWidth = width;
        }
        const maxWidth = isFixedWidth
            ? Math.min(this._column.parsedWidth.value, this._column.maxWidth || this._column.parsedWidth.value)
            : this._column.maxWidth;
        const newWidths = [minWidth || '', width, maxWidth ? `${maxWidth}px` : width];
        if (reason === 'resize') {
            this._widths[1] = newWidths;
            this.widthChange.emit({ reason });
        }
        else {
            const prev = this._widths[0] || [];
            this._widths[0] = newWidths;
            if (!this._widths[1]) {
                this._widths[1] = newWidths;
            }
            for (let i = 0; i < 3; i++) {
                if (prev[i] !== newWidths[i]) {
                    this.widthChange.emit({ reason });
                    break;
                }
            }
        }
    }
    /**
     * Apply the current absolute width definitions (minWidth, width, maxWidth) onto an element.
     */
    applyWidth(element) { setWidth(element, this.widths); }
    /**
     * Apply the source width definitions )set in static column definition instance) onto an element.
     */
    applySourceWidth(element) { setWidth(element, this._widths[0]); }
    /**
     * Query for cell elements related to this column definition.
     *
     * This query is not cached - cache in implementation.
     */
    queryCellElements(...filter) {
        const cssId = `.${uniqueColumnCss(this)}`;
        const query = [];
        if (filter.length === 0) {
            query.push(cssId);
        }
        else {
            for (const f of filter) {
                switch (f) {
                    case 'table':
                        query.push(`.pbl-ngrid-cell${cssId}`);
                        break;
                    case 'header':
                        query.push(`.pbl-ngrid-header-cell${cssId}:not(.pbl-header-group-cell)`);
                        break;
                    case 'headerGroup':
                        query.push(`.pbl-header-group-cell${cssId}`);
                        break;
                    case 'footer':
                        query.push(`.pbl-ngrid-footer-cell${cssId}:not(.pbl-footer-group-cell)`);
                        break;
                    case 'footerGroup':
                        query.push(`.pbl-footer-group-cell${cssId}`);
                        break;
                }
            }
        }
        // we query from the master table container and not CDKTable because of fixed meta rows
        return query.length === 0 ? [] : Array.from(this.extApi.element.querySelectorAll(query.join(', ')));
    }
    /** @internal */
    ngOnDestroy() {
        this.detach();
        this.widthChange.complete();
    }
    onResize() {
        if (isPblColumn(this.column)) {
            const prevNetWidth = this._netWidth;
            this._netWidth = this.widthBreakout(this.column.sizeInfo).content;
            if (prevNetWidth !== this._netWidth) {
                const width = `${this._netWidth}px`;
                this.updateWidth(width, 'resize');
            }
        }
    }
    updatePin(pin) {
        this.sticky = this.stickyEnd = false;
        switch (pin) {
            case 'start':
                this.sticky = true;
                break;
            case 'end':
                this.stickyEnd = true;
                break;
        }
        if (this.grid.isInit) {
            this.extApi.cdkTable.updateStickyColumnStyles();
        }
    }
    attach(column) {
        if (this._column !== column) {
            this.detach();
            if (column) {
                this._column = column;
                column.attach(this);
                this.name = column.id.replace(/ /g, '_');
                if (isPblColumn(column)) {
                    this.updatePin(column.pin);
                }
            }
        }
    }
    detach() {
        if (this._column) {
            const col = this._column;
            this._column = undefined;
            col.detach();
        }
    }
}
/** @nocollapse */ PblNgridColumnDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDef, deps: [{ token: EXT_API_TOKEN }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDef, selector: "[pblNgridColumnDef]", inputs: { column: ["pblNgridColumnDef", "column"] }, outputs: { widthChange: "pblNgridColumnDefWidthChange" }, providers: [
        { provide: CdkColumnDef, useExisting: PblNgridColumnDef },
        { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: PblNgridColumnDef }
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridColumnDef]',
                    providers: [
                        { provide: CdkColumnDef, useExisting: PblNgridColumnDef },
                        { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: PblNgridColumnDef }
                    ],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }]; }, propDecorators: { column: [{
                type: Input,
                args: ['pblNgridColumnDef']
            }], widthChange: [{
                type: Output,
                args: ['pblNgridColumnDefWidthChange']
            }] } });
/**
 * Set the widths of an HTMLElement
 * @param el The element to set widths to
 * @param widths The widths, a tuple of 3 strings [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
 */
function setWidth(el, widths) {
    el.style.minWidth = widths[0];
    el.style.width = widths[1];
    el.style.maxWidth = widths[2];
    // TODO(shlomiassaf)[perf, 4]: Instead of using a tuple for width, use a CSSStyleDeclaration object and just assign the props
    // This will avoid the additional check for %
    // We will need to implement it in all places that `_widths` is updated in `PblNgridColumnDef`
    // Another TODO is to cache the previous `boxSizing` in any case the column definition changes.
    // When the column does not have an explicit `minWidth` set and when the `width` is set explicitly to a % value
    // the logic in `PblNgridColumnDef.updateWidth` will set `minWidth` to the same value in `width`
    // This will cause an overflow unless we apply the border-box model
    if (widths[0] && widths[0].endsWith('%')) {
        el.style.boxSizing = 'border-box';
    }
    else {
        el.style.boxSizing = 'content-box';
    }
}

function findCellDefById(cellDefs, colDef, searchParent) {
    for (const cellDef of cellDefs) {
        if (cellDef.type) {
            if (colDef.type && cellDef.type === colDef.type.name) {
                return cellDef;
            }
        }
        else {
            const id = cellDef.name;
            if (id === colDef.id) {
                return cellDef;
            }
        }
    }
}
function findCellDef(registry, colDef, kind, searchParent) {
    const cellDefs = registry.getMulti(kind);
    if (cellDefs) {
        let type;
        if (isPblColumn(colDef)) {
            switch (kind) {
                case 'headerCell':
                    if (colDef.headerType) {
                        type = { id: colDef.id, type: colDef.headerType };
                    }
                    break;
                case 'footerCell':
                    if (colDef.footerType) {
                        type = { id: colDef.id, type: colDef.footerType };
                    }
                    break;
            }
        }
        if (!type) {
            type = colDef;
        }
        const match = findCellDefById(cellDefs, type);
        if (match) {
            return match;
        }
    }
    if (searchParent && registry.parent) {
        return findCellDef(registry.parent, colDef, kind, searchParent);
    }
}

/**
 * A column width calculator that, based on all of the columns, calculates the default column width
 * and minimum required row width.
 *
 * The default column width is the width for all columns that does not have a width setting defined.
 * In addition, a `minimumRowWidth` is calculated, which represents the minimum width required width of the row, i.e. table.
 *
 * The `StaticColumnWidthLogic` does not take into account real-time DOM measurements (especially box-model metadata), hence "static".
 * It performs the calculation based on "dry" `PblColumn` metadata input from the user.
 *
 * The `StaticColumnWidthLogic` is less accurate and best used as a measurement baseline followed by a more accurate calculation.
 * This is why it outputs a default column width and not a column specific width.
 */
class StaticColumnWidthLogic {
    constructor() {
        this._agg = {
            pct: 0,
            px: 0,
            minRowWidth: 0,
            pctCount: 0,
            pxCount: 0,
            count: 0 // total columns without a fixed value
        };
    }
    get minimumRowWidth() { return this._agg.minRowWidth; }
    /**
     * Returns the calculated default width for a column.
     * This is the width for columns that does not have a specific width, adjusting them to fit the table.
     * It's important to run this method AFTER aggregating all columns through `addColumn()`.
     * The result contains 2 values, pct and px.
     * pct is the total width in percent that the column should spread taking into account columns with fixed % width.
     * px is the total width in pixels that the column should shrink taking into account columns with fixed pixel width.
     *
     * The algorithm is simple:
     *  1) Sum all columns with fixed percent width
     *  2) From the entire row width (100%) deduct the total fixed width (step 1).
     *     This result represents the % left for all columns without a fixed width (percent and pixel).
     *  3) Sum all columns with fixed pixel width.
     *     The result represent the total amount of width in pixel taken by columns with fixed width.
     *  4) Count all the columns without a fixed width.
     *
     *  For 2 & 3 we get values that we need to spread even between all of the columns without fixed width (percent and pixel).
     *  The exact width is the total percent left (2) minus the total width in pixel taken by columns with fixed with.
     *  We now need to divide the result from 2 & 3 by the result from 4.
     *
     * Both values should be used together on the `width` style property using the `calc` function:
     * e.g.: `calc(${pct}% - ${px}px)`
     *
     * This value is calculated every time it is called, use it once all columns are added.
     */
    get defaultColumnWidth() {
        const agg = this._agg;
        const pct = (100 - agg.pct) / agg.count;
        const px = agg.px / agg.count;
        return { pct, px };
    }
    addColumn(column) {
        const agg = this._agg;
        const width = column.parsedWidth;
        let minWidth = column.minWidth || 0;
        if (width) {
            switch (width.type) {
                case '%':
                    agg.pctCount += 1;
                    agg.pct += width.value;
                    break;
                case 'px':
                    agg.pxCount += 1;
                    agg.px += width.value;
                    minWidth = width.value;
                    break;
                default:
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error(`Invalid width "${column.width}" in column ${column.prop}. Valid values are ##% or ##px (50% / 50px)`);
                    }
                    return;
            }
        }
        else if (column.maxWidthLock) {
            agg.pxCount += 1;
            agg.px += column.maxWidth;
        }
        else {
            agg.count += 1;
        }
        agg.minRowWidth += minWidth;
    }
}

/**
 * Updates the column sizes of the columns provided based on the column definition metadata for each column.
 * The final width represent a static width, it is the value as set in the definition (except column without width, where the calculated global width is set).
 */
function resetColumnWidths(rowWidth, tableColumns, metaColumns) {
    const { pct, px } = rowWidth.defaultColumnWidth;
    const defaultWidth = `calc(${pct}% - ${px}px)`;
    for (const c of tableColumns) {
        c.setDefaultWidth(defaultWidth);
        c.updateWidth();
    }
    for (const m of metaColumns) {
        for (const c of [m.header, m.footer]) {
            if (c) {
                c.updateWidth('');
            }
        }
        // We don't handle groups because they are handled by `PblNgridComponent.resizeRows()`
        // which set the width for each.
    }
}

class HiddenColumns {
    constructor() {
        this.hidden = new Set();
        this.allHidden = new Set();
        this.indirect = new Map();
        this.clear(false);
    }
    add(columns, indirect) {
        let collection;
        if (indirect) {
            collection = this.indirect.get(indirect);
            if (!collection) {
                this.indirect.set(indirect, collection = new Set());
            }
        }
        else {
            collection = this.hidden;
        }
        const size = collection.size;
        if (columns[0] instanceof PblColumn) {
            for (const c of columns) {
                collection.add(c.id);
            }
        }
        else {
            for (const c of columns) {
                collection.add(c);
            }
        }
        return collection.size !== size;
    }
    /**
     * Show the column.
     */
    remove(columns, indirect) {
        let collection;
        if (indirect) {
            collection = this.indirect.get(indirect);
            if (!collection) {
                this.indirect.set(indirect, collection = new Set());
            }
        }
        else {
            collection = this.hidden;
        }
        const size = collection.size;
        if (columns[0] instanceof PblColumn) {
            for (const c of columns) {
                collection.delete(c.id);
            }
        }
        else {
            for (const c of columns) {
                collection.delete(c);
            }
        }
        return collection.size !== size;
    }
    clear(onlyHidden) {
        this.hidden.clear();
        if (!onlyHidden) {
            this.indirect.clear();
            this.allHidden.clear();
        }
        else {
            this.syncAllHidden();
        }
    }
    syncAllHidden() {
        this.allHidden.clear();
        for (const id of this.hidden) {
            this.allHidden.add(id);
        }
        for (const indirect of this.indirect.values()) {
            for (const id of indirect) {
                this.allHidden.add(id);
            }
        }
        return this;
    }
}

class MetaRowsStore {
    constructor(differs) {
        this.differs = differs;
        this.visibleChanged$ = new Subject();
        this.hDiffers = [];
        this.fDiffers = [];
    }
    setHeader(value) {
        const index = value.rowDef.rowIndex;
        this.headers[index] = value;
        if (this.hDiffers[index]) {
            const diff = this.hDiffers[index].diff(value.keys);
            if (diff) {
                this.visibleChanged$.next({ metaRow: value, changes: diff });
            }
        }
        else {
            this.hDiffers[index] = this.differs.find([]).create();
            this.hDiffers[index].diff(value.keys);
        }
    }
    setFooter(value) {
        const index = value.rowDef.rowIndex;
        this.footers[index] = value;
        if (this.fDiffers[index]) {
            const diff = this.fDiffers[index].diff(value.keys);
            if (diff) {
                this.visibleChanged$.next({ metaRow: value, changes: diff });
            }
        }
        else {
            this.fDiffers[index] = this.differs.find([]).create();
            this.fDiffers[index].diff(value.keys);
        }
    }
    updateHeader(value) {
        this.setHeader(Object.assign(this.headers[value.rowDef.rowIndex] || {}, value));
    }
    updateFooter(value) {
        this.setFooter(Object.assign(this.footers[value.rowDef.rowIndex] || {}, value));
    }
    clear() {
        this.headers = [];
        this.footers = [];
    }
    dispose() {
        this.visibleChanged$.complete();
    }
}

class PblColumnStore {
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
function moveItemInArray(array, fromIndex, toIndex) {
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
function moveItemInArrayExt(array, fromIndex, toIndex, fn) {
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

class ColumnApi {
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

function initColumnOrMetaRow(element, isFooter) {
    element.classList.add(...(isFooter ? ['cdk-footer-row', 'pbl-ngrid-footer-row'] : ['cdk-header-row', 'pbl-ngrid-header-row']));
}
function setRowVisibility(element, visible) {
    if (visible) {
        element.classList.remove('pbl-ngrid-row-hidden');
    }
    else {
        element.classList.add('pbl-ngrid-row-hidden');
    }
}
function applyMetaRowClass(metaRowsService, metaRows, element, oldMetaRow, newMetaRow) {
    if (oldMetaRow) {
        if (oldMetaRow.rowClassName) {
            element.classList.remove(oldMetaRow.rowClassName);
        }
        metaRowsService.removeMetaRow(metaRows);
    }
    metaRows.meta = newMetaRow;
    if (newMetaRow) {
        if (newMetaRow.rowClassName) {
            element.classList.add(newMetaRow.rowClassName);
        }
        metaRowsService.addMetaRow(metaRows);
    }
}
const FIRST_LAST_ROW_SELECTORS = {
    header: {
        selector: 'pbl-ngrid-header-row',
        first: 'pbl-ngrid-first-header-row',
        last: 'pbl-ngrid-last-header-row',
    },
    footer: {
        selector: 'pbl-ngrid-footer-row',
        first: 'pbl-ngrid-first-footer-row',
        last: 'pbl-ngrid-last-footer-row',
    }
};
function updateMetaRowFirstLastClass(section, root, prev) {
    const sectionCss = FIRST_LAST_ROW_SELECTORS[section];
    const rows = root.querySelectorAll(`.${sectionCss.selector}:not(.pbl-ngrid-row-visually-hidden):not(.pbl-ngrid-row-hidden)`);
    const first = rows[0];
    if (prev.first !== first) {
        prev.first?.classList.remove(sectionCss.first);
        first?.classList.add(sectionCss.first);
    }
    const last = rows[rows.length - 1];
    if (prev.last !== last) {
        prev.last?.classList.remove(sectionCss.last);
        last?.classList.add(sectionCss.last);
    }
    return { first, last };
}

function isPblNgridRowComponent(row) {
    return row.rowType === 'data';
}
class PblRowsApi {
    constructor(extApi, zone, cellFactory) {
        this.extApi = extApi;
        this.zone = zone;
        this.cellFactory = cellFactory;
        this.allByElement = new Map();
        this.allRows = new Set();
        this.rows = new Map();
        this.columnRows = new Set();
        this.metaHeaderRows = new Set();
        this.metaFooterRows = new Set();
        this.firstLast = {
            header: {},
            footer: {},
        };
        this.metaRowService = new PblNgridMetaRowService(extApi);
        extApi.onConstructed(() => this.cdkTable = extApi.cdkTable);
        for (const type of ['header', 'data', 'footer', 'meta-header', 'meta-footer']) {
            this.rows.set(type, new Set());
        }
        /* List to sync events which notify about changes in meta rows and update the first/last rows to have the class marking it is the first/last */
        this.metaRowService.sync
            .pipe(unrx(this))
            .subscribe(() => {
            this.firstLast.header = updateMetaRowFirstLastClass('header', this.extApi.element, this.firstLast.header);
            this.firstLast.footer = updateMetaRowFirstLastClass('footer', this.extApi.element, this.firstLast.footer);
        });
        extApi.columnStore.columnRowChange()
            .pipe(unrx(this))
            .subscribe(event => {
            const gridWidthRow = this.gridWidthRow;
            let requireSizeUpdate = false;
            event.changes.forEachOperation((record, previousIndex, currentIndex) => {
                if (record.previousIndex == null) {
                    for (const r of this.columnRows) {
                        r._createCell(record.item, currentIndex);
                    }
                }
                else if (currentIndex == null) {
                    for (const r of this.columnRows) {
                        r._destroyCell(previousIndex);
                    }
                }
                else {
                    for (const r of this.columnRows) {
                        r._moveCell(previousIndex, currentIndex);
                    }
                    if (!requireSizeUpdate && gridWidthRow) {
                        const lastIndex = gridWidthRow.cellsLength - 1;
                        requireSizeUpdate = currentIndex === lastIndex || previousIndex === lastIndex;
                    }
                }
            });
            if (requireSizeUpdate) {
                this.gridWidthRow.updateSize();
            }
        });
        extApi.columnStore.metaRowChange()
            .pipe(unrx(this))
            .subscribe(event => {
            const rows = event.metaRow.kind === 'header' ? this.metaHeaderRows : this.metaFooterRows;
            for (const r of rows) {
                if (r.row.rowDef.rowIndex === event.metaRow.rowDef.rowIndex) {
                    event.changes.forEachOperation((record, previousIndex, currentIndex) => {
                        if (record.previousIndex == null) {
                            const columns = this.extApi.columnStore.find(record.item);
                            const col = event.metaRow.kind === 'header' ?
                                event.metaRow.isGroup ? columns.headerGroup : columns.header
                                : event.metaRow.isGroup ? columns.footerGroup : columns.footer;
                            r._createCell(col, currentIndex);
                        }
                        else if (currentIndex == null) {
                            r._destroyCell(previousIndex);
                        }
                        else {
                            r._moveCell(previousIndex, currentIndex);
                        }
                    });
                    break;
                }
            }
        });
        extApi.onConstructed(() => {
            this.intersection = extApi.viewport.intersection;
            if (this.intersection.observerMode) {
                this.intersection.intersectionChanged
                    .subscribe(entries => {
                    for (const e of entries) {
                        const row = this.allByElement.get(e.target);
                        if (isPblNgridRowComponent(row)) {
                            row._setOutOfViewState(!e.isIntersecting);
                        }
                    }
                });
            }
            else {
                // only needed for non intersection observer mode
                // TODO: remove when IntersectionObserver is required
                let lastScrollState = extApi.viewport.isScrolling;
                extApi.viewport.scrolling
                    .subscribe(scrolling => {
                    if (scrolling === 0 && lastScrollState) {
                        // TODO: be smarter here, start from edges, stop when both edge hit in view row
                        // use isOutOfView location (top/bottom) to speed up
                        this.forceUpdateOutOfView(...this.dataRows());
                    }
                    lastScrollState = !!scrolling;
                });
            }
        });
        extApi.events
            .pipe(ON_INVALIDATE_HEADERS)
            .subscribe(event => {
            const dataRows = this.dataRows();
            for (const row of dataRows) {
                row._rebuildCells();
            }
            // TODO: reset viewport and virtual scroll state/cache/calculations
        });
        // Handle item moves to update the context with the new index
        extApi.events
            .subscribe(event => {
            if (event.kind === 'onBeforeMoveItem') {
                try {
                    const { fromIndex, toIndex } = event;
                    const main = extApi.grid.rowsApi.findDataRowByDsIndex(fromIndex);
                    if (fromIndex < toIndex) {
                        for (let i = fromIndex + 1; i <= toIndex; i++) {
                            extApi.grid.rowsApi.findDataRowByDsIndex(i).context.dsIndex -= 1;
                        }
                    }
                    else {
                        for (let i = fromIndex - 1; i >= toIndex; i--) {
                            extApi.grid.rowsApi.findDataRowByDsIndex(i).context.dsIndex += 1;
                        }
                    }
                    main.context.dsIndex = toIndex;
                }
                catch (err) {
                }
            }
        });
    }
    forceUpdateOutOfView(...rows) {
        if (this.intersection.observerMode) {
            const entries = this.intersection.snapshot();
            for (const e of entries) {
                const row = this.allByElement.get(e.target);
                if (isPblNgridRowComponent(row)) {
                    row._setOutOfViewState(!e.isIntersecting);
                }
            }
        }
        else {
            const { clientRect } = this.extApi.viewport.getBoundingClientRects;
            for (const row of rows) {
                row._setOutOfViewState(isOutOfView(row, clientRect));
            }
        }
    }
    addRow(row) {
        this.allRows.add(row);
        this.allByElement.set(row.element, row);
        const rows = this.rows.get(row.rowType);
        rows.add(row);
        switch (row.rowType) {
            case 'header':
                if (row.gridWidthRow) {
                    this.gridWidthRow = row;
                }
            case 'data': // tslint:disable-line: no-switch-case-fall-through
                this.intersection.track(row.element);
            case 'footer': // tslint:disable-line: no-switch-case-fall-through
                this.columnRows.add(row);
                break;
            case 'meta-header':
                this.metaHeaderRows.add(row);
                break;
            case 'meta-footer':
                this.metaFooterRows.add(row);
                break;
        }
    }
    removeRow(row) {
        this.allRows.delete(row);
        this.allByElement.delete(row.element);
        const rows = this.rows.get(row.rowType);
        if (rows) {
            rows.delete(row);
        }
        switch (row.rowType) {
            case 'header':
                if (row.gridWidthRow && row === this.gridWidthRow) {
                    this.gridWidthRow = undefined;
                }
            case 'data': // tslint:disable-line: no-switch-case-fall-through
                this.intersection.untrack(row.element);
            case 'footer': // tslint:disable-line: no-switch-case-fall-through
                this.columnRows.delete(row);
                break;
            case 'meta-header':
                this.metaHeaderRows.delete(row);
                break;
            case 'meta-footer':
                this.metaFooterRows.delete(row);
                break;
        }
    }
    dataRows() {
        return Array.from(this.rows.get('data'));
    }
    findRowByElement(element) {
        return this.allByElement.get(element);
    }
    findDataRowByDsIndex(index) {
        for (const r of this.dataRows()) {
            if (r.context?.dsIndex === index) {
                return r;
            }
        }
    }
    findDataRowByIndex(index) {
        for (const r of this.dataRows()) {
            if (r.rowIndex === index) {
                return r;
            }
        }
    }
    findDataRowByIdentity(identity) {
        for (const r of this.dataRows()) {
            if (r.context?.identity === identity) {
                return r;
            }
        }
    }
    findColumnRow(type) {
        return Array.from(this.rows.get(type))
            .find(r => r.gridWidthRow === false);
    }
    syncRows(rowType = false, ...rowsIndex) {
        if (!NgZone.isInAngularZone()) {
            this.zone.run(() => this.syncRows(rowType, ...rowsIndex));
            return;
        }
        const detectChanges = typeof rowType === 'boolean'
            ? rowType
            : typeof rowsIndex[0] === 'boolean'
                ? rowsIndex.shift()
                : false;
        let rows;
        let useSpecificRows = rowsIndex.length > 0;
        switch (rowType) {
            case 'header':
            case 'data':
            case 'footer':
            case 'meta-header':
            case 'meta-footer':
                rows = this.rows.get(rowType);
                break;
            default: // boolean or 'all'
                useSpecificRows = false;
                rows = this.allRows;
                break;
        }
        if (!useSpecificRows) {
            for (const r of Array.from(rows)) {
                r.ngDoCheck();
            }
        }
        else {
            for (const index of rowsIndex) {
                for (const r of Array.from(rows)) {
                    if (r.rowIndex === index) {
                        r.ngDoCheck();
                    }
                }
            }
        }
    }
}
function isOutOfView(row, viewPortRect, location) {
    const elRect = row.element.getBoundingClientRect();
    let isInsideOfView;
    switch (location) {
        case 'top':
            isInsideOfView = elRect.bottom >= viewPortRect.top;
            break;
        case 'bottom':
            isInsideOfView = elRect.top <= viewPortRect.bottom;
            break;
        default:
            isInsideOfView = (elRect.bottom >= viewPortRect.top && elRect.top <= viewPortRect.bottom);
            break;
    }
    return !isInsideOfView;
}

/**
 * Tokens for symboles that will cause cyclic dependencies.
 */
const PBL_NGRID_COMPONENT = new InjectionToken('PblNgridComponent');

/** @internal */
const PLUGIN_STORE = new Map();
function ngridPlugin(metadata, target) {
    if (metadata.runOnce) {
        metadata.runOnce();
    }
    PLUGIN_STORE.set(metadata.id, { ...metadata, target });
    return metadata.id;
}

const NGRID_PLUGIN_CONTEXT = new WeakMap();
const CREATED$ = new Subject();
const REGISTERED_TO_CREATE = new WeakSet();
/** @internal */
class PblNgridPluginContext {
    constructor() {
        this._events = new Subject();
        this.events = this._events.asObservable();
    }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static create(injector, extApi) {
        if (NGRID_PLUGIN_CONTEXT.has(extApi.grid)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Grid instance is already registered for extensions.`);
            }
            return;
        }
        const instance = new PblNgridPluginContext();
        NGRID_PLUGIN_CONTEXT.set(extApi.grid, instance);
        instance.grid = extApi.grid;
        instance.injector = injector;
        instance.extApi = extApi;
        instance.controller = new PblNgridPluginController(instance);
        return {
            plugin: instance,
            init: () => CREATED$.next({ table: instance.grid, controller: instance.controller }),
        };
    }
    emitEvent(event) {
        this._events.next(event);
    }
    destroy() {
        if (!NGRID_PLUGIN_CONTEXT.has(this.grid)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Grid is not registered.`);
            }
            return;
        }
        this._events.complete();
        NGRID_PLUGIN_CONTEXT.delete(this.grid);
    }
}
class PblNgridPluginController {
    constructor(context) {
        this.context = context;
        this.plugins = new Map();
        this.grid = context.grid;
        this.extApi = context.extApi;
        this.events = context.events;
    }
    static onCreatedSafe(token, fn) {
        if (!REGISTERED_TO_CREATE.has(token)) {
            REGISTERED_TO_CREATE.add(token);
            PblNgridPluginController.created.subscribe(event => fn(event.table, event.controller));
        }
    }
    static find(grid) {
        const context = NGRID_PLUGIN_CONTEXT.get(grid);
        if (context) {
            return context.controller;
        }
    }
    static findPlugin(grid, name) {
        return PblNgridPluginController.find(grid)?.getPlugin(name);
    }
    get injector() { return this.context.injector; }
    /**
     * A Simple shortcut to the `onInit` event which is fired once.
     * If the grid has already been init the event will fire immediately, otherwise it will emit once when `onInit`
     * occurs and cleanup the subscription.
     *
     * The boolean value emitted reflects the state it was emitted on.
     * false - grid was already initialized
     * true - grid was just initialized
     *
     * In other words, if you get false, it means you called this method when the grid was already initialized.
     */
    onInit() {
        return this.grid.isInit ? of(false) : this.events.pipe(ON_INIT, mapTo(true));
    }
    hasPlugin(name) {
        return this.plugins.has(name);
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    ensurePlugin(name) {
        return this.getPlugin(name) || this.createPlugin(name);
    }
    /**
     * Registers the `plugin` with the `name` with the `table`
     */
    setPlugin(name, plugin) {
        if (!PLUGIN_STORE.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Unknown plugin ${name}.`);
            }
            return;
        }
        if (this.plugins.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Plugin ${name} is already registered for this grid.`);
            }
            return;
        }
        this.plugins.set(name, plugin);
        return (tbl) => this.grid === tbl && this.plugins.delete(name);
    }
    /**
     * Checks if the grid is declared in a location within the DI that has access to an ancestor token.
     * For example, if we want to use `createPlugin()` only if the grid is defined in a module that has a specific parent module imported into it
     * we will use `hasAncestor(MyParentModule)`
     */
    hasAncestor(token) {
        return !!this.injector.get(token, null, InjectFlags.Optional);
    }
    createPlugin(name) {
        if (!PLUGIN_STORE.has(name)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Unknown plugin ${name}.`);
            }
            return;
        }
        const metadata = PLUGIN_STORE.get(name);
        const methodName = metadata.factory;
        if (!methodName) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid plugin configuration for ${name}, no factory metadata.`);
            }
            return;
        }
        else if (typeof metadata.target[methodName] !== 'function') {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid plugin configuration for ${name}, factory metadata does not point to a function.`);
            }
            return;
        }
        return metadata.target[methodName](this.grid, this.context.injector);
    }
}
PblNgridPluginController.created = CREATED$.asObservable();

const PBL_NGRID_BASE_ROW_TEMPLATE = `<ng-container #viewRef></ng-container>`;
// tslint:disable-next-line: no-conflicting-lifecycle
class PblNgridBaseRowComponent {
    constructor(grid, cdRef, elementRef) {
        this.cdRef = cdRef;
        this._cells = [];
        this._attached = true;
        this.element = elementRef.nativeElement;
        if (grid) {
            this.grid = grid;
        }
        this.onCtor();
    }
    get height() {
        return this.element.getBoundingClientRect().height;
    }
    get cellsLength() { return this._cells.length; }
    /**
     * An attached row will run change detection on it's children.
     * All rows are attached by default.
     */
    get attached() { return this._attached; }
    ngOnInit() {
        if (!this.grid) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`When a grid row is used outside the scope of a grid, you must provide the grid instance.`);
            }
        }
        this.resolveTokens();
        this.element.setAttribute('data-rowtype', this.rowType);
        this._extApi.rowsApi.addRow(this);
    }
    ngAfterViewInit() {
        for (const c of this._extApi.columnStore.getColumnsOf(this)) {
            this._createCell(c);
        }
        this.detectChanges();
    }
    ngDoCheck() {
        if (this._attached && this.grid) {
            this.detectChanges();
        }
    }
    ngOnDestroy() {
        unrx.kill(this);
        this._extApi?.rowsApi.removeRow(this);
    }
    /**
     * Marks the row as attached.
     * Rows are attached by default.
     * An attached row takes part in the change detection process
     */
    _attach() {
        if (!this._attached) {
            this._attached = true;
            return true;
        }
        return false;
    }
    /**
     * Marks the row as detached.
     * A detached row DOWS NOT take part in the change detection process.
     *
     * Usually when the rendering engine cache row elements for performance, these should be detached when cached and re-attached when returned into view.
     */
    _detach() {
        if (this._attached) {
            this._attached = false;
            return true;
        }
        return false;
    }
    _createCell(column, atIndex) {
        if (!this.canCreateCell || this.canCreateCell(column, atIndex)) {
            const cell = this.createComponent(column, atIndex);
            cell.instance.setOwner(this);
            if (this.cellCreated) {
                this.cellCreated(column, cell);
            }
        }
    }
    _destroyCell(cellOrCellIndex) {
        const cell = typeof cellOrCellIndex === 'number' ? this._cells[cellOrCellIndex] : cellOrCellIndex;
        if (cell) {
            const index = this._cells.indexOf(cell);
            if (!this.canDestroyCell || this.canDestroyCell(cell)) {
                const len = this._cells.length;
                this._viewRef.remove(index);
                if (len === this._cells.length) {
                    this._cells.splice(index, 1);
                }
                if (this.cellDestroyed) {
                    this.cellDestroyed(cell, index);
                }
            }
        }
    }
    _moveCell(fromIndex, toIndex) {
        const cmp = this._cells[fromIndex];
        if (cmp) {
            if (!this.canMoveCell || this.canMoveCell(fromIndex, toIndex, cmp)) {
                this._viewRef.move(cmp.hostView, toIndex);
                moveItemInArrayExt(this._cells, fromIndex, toIndex, (previousItem, currentItem, previousIndex, currentIndex) => {
                    if (this.cellMoved) {
                        this.cellMoved(previousItem, currentItem, previousIndex, currentIndex);
                    }
                });
            }
        }
    }
    createComponent(column, atIndex) {
        const viewRefLength = this._viewRef.length;
        if (!atIndex && atIndex !== 0) {
            atIndex = viewRefLength;
        }
        atIndex = Math.min(viewRefLength, atIndex);
        const cell = this._viewRef.createComponent(this._extApi.rowsApi.cellFactory.getComponentFactory(this), atIndex, this.cellInjector);
        this._cells.splice(atIndex, 0, cell);
        cell.onDestroy(() => this._cells.splice(this._cells.indexOf(cell), 1));
        return cell;
    }
    /**
     * Resolves the extensions API and the injector to be used when creating cells.
     */
    resolveTokens() {
        // The cells require the extApi and grid to live on the DI tree.
        // In the case of row it might not be there since the row is defined outside of the grid somewhere
        // Row's are defined view templates so their DI tree depended on their location hence we need to verify
        // that we can get the extApi from the viewRef's injector, if so, great if not we need to extend the injector we use
        // to build cells.
        const injector = this._viewRef?.injector;
        const extApi = injector?.get(EXT_API_TOKEN, null);
        if (!extApi) {
            // _extApi might be here already...
            this._extApi = this._extApi || PblNgridPluginController.find(this.grid).extApi;
            this.cellInjector = Injector.create({
                providers: [
                    { provide: PBL_NGRID_COMPONENT, useValue: this.grid },
                    { provide: this.grid.constructor, useValue: this.grid },
                    { provide: EXT_API_TOKEN, useValue: this._extApi },
                ],
                parent: injector,
            });
        }
        else {
            this._extApi = this._extApi || extApi;
            this.cellInjector = injector;
        }
    }
}
/** @nocollapse */ PblNgridBaseRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseRowComponent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseRowComponent, viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowComponent, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }, {
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }]; }, propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });

let currentItemArgs;
let currentRow;
class RowToRepeaterBridge {
    bridgeRow(row) {
        const itemArgs = currentItemArgs;
        currentItemArgs = undefined;
        currentRow = row;
        return itemArgs;
    }
    bridgeContext(itemArgs, createView) {
        currentRow = undefined;
        currentItemArgs = itemArgs;
        const view = createView();
        if (view.rootNodes[0] !== currentRow.element) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid view state, current row element is not the current rendered element!`);
            }
        }
        currentRow = currentItemArgs = undefined;
        return view;
    }
}
const rowContextBridge = new RowToRepeaterBridge();

const PBL_NGRID_ROW_TEMPLATE = '<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-container #viewRef></ng-container><ng-content select=".pbl-ngrid-row-suffix"></ng-content>';
class PblNgridRowComponent extends PblNgridBaseRowComponent {
    constructor() {
        super(...arguments);
        this.rowType = 'data';
        /** Indicates if intersection observer is on, detecting outOfView state for us */
        this.observerMode = true;
        this.outOfView = false;
    }
    get rowIndex() { return this._rowIndex; }
    ngOnInit() {
        super.ngOnInit();
        this.updateRow();
        // Doing nothing if IntersectionObserver is enable, otherwise updates the initial state
        this.updateOutOfView();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.context?.detachRow(this);
    }
    updateRow() {
        if (this.currRow !== this.context.$implicit) {
            this.prevRow = this.currRow;
            this.currRow = this.context.$implicit;
            if (this.currRow) {
                if (this.grid.rowClassUpdate && this.grid.rowClassUpdateFreq === 'item') {
                    this.updateHostClass();
                }
                this.identityUpdated();
            }
            return true;
        }
        return false;
    }
    getCell(index) {
        return this._cells[index]?.instance;
    }
    getCellById(id) {
        const cellViewIndex = this._extApi.columnApi.renderIndexOf(id);
        return this._cells[cellViewIndex]?.instance;
    }
    /**
     * Rebuild the cells rendered.
     * This should be called when the columns have changed and new columns created in the column store.
     *
     * The new columns are new instances, clones of the previous columns and they DONT have a column definition!
     * This method will iterate over existing cells, updating each cell with the new column now in it's location and creating a column def for it.
     * If there are more cells rendered then in the store, it will remove those extra cells
     * If there are less cells rendered then in the store, it will create new ones.
     * This will ensure we don't create or remove cells unless we need to, saving on DOM operations.
     */
    _rebuildCells() {
        const columns = this._extApi.columnStore.getColumnsOf(this);
        this.context._rebuildCells(this._extApi.columnStore.allColumns);
        const targetLen = columns.length;
        for (let i = 0; i < targetLen; i++) {
            const cellCmpRef = this._cells[i];
            if (!cellCmpRef) {
                this._createCell(columns[i]);
            }
            else {
                this.attachColumn(columns[i], cellCmpRef);
            }
        }
        let currentLen = this.cellsLength;
        while (currentLen > targetLen) {
            this._destroyCell(--currentLen);
        }
        this.detectChanges();
    }
    /**
     * Updates the outOfView state of this row and sync it with the context
     * If the context's state is different from the new outOfView state, will invoke a change detection cycle.
     * @internal
     */
    _setOutOfViewState(outOfView) {
        if (this.outOfView !== outOfView) {
            this.outOfView = outOfView;
            if (this.context?.outOfView !== outOfView) {
                this.context.outOfView = outOfView;
                // TODO: If scrolling, mark the row for check and update only after scroll is done
                this.ngDoCheck();
            }
        }
    }
    /**
     * Updates the `outOfView` flag of the context attached to this row
     *
     * This method is backward compatible to support browser without the IntersectionObservable API.
     *
     * If the browser DOES NOT support IntersectionObserver it will calculate the state using bounding rect APIs (force param has no effect, always true).
     * If the browser support IntersectionObserver it will do nothing when force is not set to true but when * set to true it will use
     * the IntersectionObserver `takeRecords` method to update the outOfView state.
     *
     * > NOTE that this method has a direct impact on performance as it uses DOM apis that trigger layout reflows.
     * Use with caution.
     */
    updateOutOfView(force) {
        if (!this.observerMode || force) {
            this._extApi.rowsApi.forceUpdateOutOfView(this);
        }
    }
    onCtor() {
        const { context, index } = rowContextBridge.bridgeRow(this);
        this.grid = context.grid;
        this._extApi = PblNgridPluginController.find(this.grid).extApi;
        this._rowIndex = index;
        this.context = context;
        this.context.attachRow(this);
    }
    detectChanges() {
        if (this.grid.rowClassUpdate && this.grid.rowClassUpdateFreq === 'ngDoCheck') {
            this.updateHostClass();
        }
        for (const cell of this._cells) {
            // TODO: the cells are created through code which mean's that they don't belong
            // to the CD tree and we need to manually mark them for checking
            // We can customize the diffing, detect context changes internally and only trigger these cells which have changed!
            cell.instance.setContext(this.context);
            cell.changeDetectorRef.detectChanges();
        }
    }
    updateHostClass() {
        const el = this.element;
        // if there is an updater, work with it
        // otherwise, clear previous classes that got applied (assumed a live binding change of the updater function)
        // users should be aware to tear down the updater only when they want to stop this feature, if the goal is just to toggle on/off
        // it's better to set the frequency to `none` and return nothing from the function (replace it) so the differ is not nuked.
        if (this.grid.rowClassUpdate) {
            if (!this._classDiffer) {
                this._classDiffer = new StylingDiffer('NgClass', 1 /* StylingDifferOptions.TrimProperties */ | 2 /* StylingDifferOptions.AllowSubKeys */ | 4 /* StylingDifferOptions.AllowStringValue */ | 16 /* StylingDifferOptions.ForceAsMap */);
                this._lastClass = new Set();
            }
            const newValue = this.grid.rowClassUpdate(this.context);
            this._classDiffer.setInput(newValue);
            if (this._classDiffer.updateValue()) {
                const lastClass = this._lastClass;
                this._lastClass = new Set();
                const value = this._classDiffer.value || {};
                for (const key of Object.keys(value)) {
                    if (value[key]) {
                        el.classList.add(key);
                        this._lastClass.add(key);
                    }
                    else {
                        el.classList.remove(key);
                    }
                    lastClass.delete(key);
                }
                if (lastClass.size > 0) {
                    for (const key of lastClass.values()) {
                        el.classList.remove(key);
                    }
                }
            }
        }
        else if (this._classDiffer) {
            const value = this._classDiffer.value || {};
            this._classDiffer = this._lastClass = undefined;
            for (const key of Object.keys(value)) {
                el.classList.remove(key);
            }
        }
    }
    cellCreated(column, cell) {
        this.attachColumn(column, cell);
    }
    cellDestroyed(cell, previousIndex) {
        unrx.kill(this, cell.instance.column);
    }
    cellMoved(previousItem, currentItem, previousIndex, currentIndex) {
        currentItem.instance.syncColumn();
        this.context.updateCell(previousItem.instance.cellCtx.clone(currentItem.instance.column));
        currentItem.changeDetectorRef.markForCheck();
    }
    identityUpdated() {
        this.element.setAttribute('row-id', this.context.dsIndex);
        this.element.setAttribute('row-key', this.context.identity);
    }
    attachColumn(column, cell) {
        if (!column.columnDef) {
            new PblNgridColumnDef(this._extApi).column = column;
            column.columnDef.name = column.id;
        }
        cell.instance.setColumn(column);
        cell.instance.setContext(this.context);
    }
}
/** @nocollapse */ PblNgridRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowComponent, selector: "pbl-ngrid-row[row]", host: { attributes: { "role": "row" }, classAttribute: "cdk-row pbl-ngrid-row" }, providers: [
        { provide: CdkRow, useExisting: PblNgridRowComponent }
    ], viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["pblNgridRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-row[row]',
                    template: PBL_NGRID_ROW_TEMPLATE,
                    host: {
                        'class': 'cdk-row pbl-ngrid-row',
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkRow, useExisting: PblNgridRowComponent }
                    ],
                    exportAs: 'pblNgridRow',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });

/**
 * The row that represents the columns of the grid.
 * There are only 2 column rows in a grid, the top (header) and bottom (footer), both optional.
 */
class PblNgridColumnRowComponent extends PblNgridBaseRowComponent {
    constructor(grid, cdRef, el, metaRows, isFooter, gridWidthRow) {
        super(grid, cdRef, el);
        this.metaRows = metaRows;
        this.gridWidthRow = gridWidthRow !== null;
        this.isFooter = isFooter !== null;
        this.rowType = this.isFooter ? 'footer' : 'header';
    }
    set row(value) { this.updateRow(value); }
    get rowIndex() { return 0; }
    get meta() { return this._meta; }
    set meta(value) { this._meta = value; } // TODO: remove when removing pblMetaRow
    ngOnInit() {
        super.ngOnInit();
        this.handleVisibility();
    }
    ngOnDestroy() {
        this.metaRows.removeMetaRow(this);
        super.ngOnDestroy();
    }
    updateSize() {
        if (this.gridWidthRow) {
            for (const c of this._cells) {
                c.instance.updateSize();
            }
        }
    }
    onCtor() { }
    detectChanges() {
        for (const cell of this._cells) {
            // TODO: the cells are created through code which mean's that they don't belong
            // to the CD tree and we need to manually mark them for checking
            // We can customize the diffing, detect context changes internally and only trigger these cells which have changed!
            cell.changeDetectorRef.markForCheck();
        }
    }
    updateRow(value) {
        if (value !== this._meta) {
            applyMetaRowClass(this.metaRows, this, this.element, this._meta, value);
        }
    }
    cellCreated(column, cell) {
        if (!column.columnDef) {
            new PblNgridColumnDef(this._extApi).column = column;
            column.columnDef.name = column.id;
        }
        cell.instance.setColumn(column, this.gridWidthRow);
    }
    cellDestroyed(cell, previousIndex) {
        unrx.kill(this, cell.instance.column);
    }
    handleVisibility() {
        initColumnOrMetaRow(this.element, this.isFooter);
        const key = this.isFooter ? 'showFooter' : 'showHeader';
        if (!this._extApi.grid[key]) {
            setRowVisibility(this.element, false);
        }
        this._extApi.propChanged
            .pipe(unrx(this))
            .subscribe(event => {
            if (event.source === this._extApi.grid && event.key === key) {
                setRowVisibility(this.element, event.prev === false);
            }
        });
    }
}
/** @nocollapse */ PblNgridColumnRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: PblNgridMetaRowService }, { token: 'footer', attribute: true }, { token: 'gridWidthRow', attribute: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridColumnRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnRowComponent, selector: "pbl-ngrid-column-row", inputs: { row: "row" }, host: { attributes: { "role": "row" } }, providers: [
        { provide: CdkHeaderRow, useExisting: PblNgridColumnRowComponent }
    ], usesInheritance: true, ngImport: i0, template: "<ng-container #viewRef></ng-container>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-column-row',
                    template: PBL_NGRID_BASE_ROW_TEMPLATE,
                    host: {
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkHeaderRow, useExisting: PblNgridColumnRowComponent }
                    ],
                    changeDetection: ChangeDetectionStrategy.Default,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }, {
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: PblNgridMetaRowService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['footer']
                }] }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['gridWidthRow']
                }] }]; }, propDecorators: { row: [{
                type: Input
            }] } });

class PblNgridMetaRowComponent extends PblNgridBaseRowComponent {
    constructor(grid, cdRef, el, metaRows, isFooter) {
        super(grid, cdRef, el);
        this.metaRows = metaRows;
        this.gridWidthRow = false;
        this.isFooter = isFooter !== null;
        this.rowType = this.isFooter ? 'meta-footer' : 'meta-header';
    }
    get row() { return this._row; }
    set row(value) { this.updateRow(value); }
    get rowIndex() { return this._row.rowDef.rowIndex; }
    get meta() { return this._meta; }
    set meta(value) { this._meta = value; } // TODO: remove when removing pblMetaRow
    ngOnInit() {
        super.ngOnInit();
        this.handleVisibility();
    }
    ngOnDestroy() {
        this.metaRows.removeMetaRow(this);
        super.ngOnDestroy();
    }
    onCtor() { }
    detectChanges() {
        for (const cell of this._cells) {
            // TODO: the cells are created through code which mean's that they don't belong
            // to the CD tree and we need to manually mark them for checking
            // We can customize the diffing, detect context changes internally and only trigger these cells which have changed!
            cell.changeDetectorRef.markForCheck();
        }
    }
    cellCreated(column, cell) {
        cell.instance.setColumn(column, this.isFooter);
    }
    cellDestroyed(cell, previousIndex) {
    }
    cellMoved(previousItem, currentItem, previousIndex, currentIndex) {
    }
    updateRow(value) {
        if (value !== this._row) {
            applyMetaRowClass(this.metaRows, this, this.element, this._meta, value?.rowDef);
            if (this._row?.isGroup) {
                this.element.classList.remove('pbl-meta-group-row');
            }
            if (value?.isGroup) {
                this.element.classList.add('pbl-meta-group-row');
            }
            this._row = value;
        }
    }
    handleVisibility() {
        initColumnOrMetaRow(this.element, this.isFooter);
        // TODO: add row visibility API like in columns and react to changes
        // - Remove showHeader showFooter inputs and move them to directives and inside let them use the API
    }
}
/** @nocollapse */ PblNgridMetaRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: PblNgridMetaRowService }, { token: 'footer', attribute: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridMetaRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMetaRowComponent, selector: "pbl-ngrid-meta-row", inputs: { row: "row" }, host: { attributes: { "role": "row" } }, providers: [
        { provide: CdkHeaderRow, useExisting: PblNgridMetaRowComponent }
    ], usesInheritance: true, ngImport: i0, template: "<ng-container #viewRef></ng-container>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-meta-row',
                    template: PBL_NGRID_BASE_ROW_TEMPLATE,
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkHeaderRow, useExisting: PblNgridMetaRowComponent }
                    ],
                    changeDetection: ChangeDetectionStrategy.Default,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }, {
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: PblNgridMetaRowService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['footer']
                }] }]; }, propDecorators: { row: [{
                type: Input
            }] } });

const NGRID_CELL_FACTORY = new InjectionToken('PblNgridCellFactoryResolver');
class PblNgridCellFactoryResolver {
    constructor(factoryMap) {
        this.factoryMap = factoryMap;
    }
    getComponentFactory(row) {
        return this.factoryMap[row.rowType];
    }
}
/** @nocollapse */ PblNgridCellFactoryResolver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver, deps: [{ token: NGRID_CELL_FACTORY }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridCellFactoryResolver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGRID_CELL_FACTORY]
                }] }]; } });

/**
 * A Registry for templates of table parts.
 *
 * The registry is hierarchical, where each instance of a registry has a parent which allows cascading templates.
 * The hierarchy is manged by angular DI.
 *
 * > The root registry does not have a parent.
 *
 * Each instance of a registry (including root) is a hierarchy by itself, composed of 2 internal levels.
 * The first level (L1 below) is used for fixed templates, the second level (L2 below) is used for dynamic templates.
 *
 * - Root Registry
 *   - Child Registry
 *     - ChildOfChild Registry
 *
 * In the example above there are 3 registries: Root, Child and ChildOfChild.
 *
 * When searching for a template in `ChildOfChild` it will search in the following order (top to bottom):
 *   - ChildOfChild
 *   - Child
 *   - Root
 *
 * If a registry does not contain the template the search will move to the next one.
 */
class PblNgridRegistryService {
    constructor(_parent) {
        this._parent = _parent;
        this._multi = {};
        this._multiDefaults = {};
        this._singles = {};
        this.changes$ = new Subject();
        this.changes = this.changes$.asObservable();
        if (this._parent) {
            this._parent.changes.pipe(unrx(this)).subscribe(this.changes$);
            this.root = this._parent.root;
        }
        else {
            this.root = this;
        }
    }
    get parent() { return this._parent; }
    getRoot() { return this.root; }
    /**
     * Returns the registered value for the single `kind`.
     * If not found will try to search the parent.
     */
    getSingle(kind) {
        return this._singles[kind] || (this._parent && this._parent.getSingle(kind));
    }
    setSingle(kind, value) {
        const previous = this.getSingle(kind);
        if (value !== previous) {
            this._singles[kind] = value;
            this.emitChanges({ op: value ? 'add' : 'remove', type: kind, value });
        }
    }
    /**
     * Returns the registered default value for the multi `kind`.
     * If not found will try to search the parent.
     */
    getMultiDefault(kind) {
        return this._multiDefaults[kind] || (this._parent && this._parent.getMultiDefault(kind));
    }
    setMultiDefault(kind, value) {
        const previous = this.getMultiDefault(kind);
        if (value !== previous) {
            this._multiDefaults[kind] = value;
            this.emitChanges({ op: value ? 'add' : 'remove', type: kind, value });
        }
    }
    /**
     * Returns the registered values for the multi `kind`.
     * If not found WILL NOT search the parent.
     */
    getMulti(kind) {
        return this._multi[kind];
    }
    addMulti(kind, cellDef) {
        const multi = this.getMulti(kind) || (this._multi[kind] = []);
        multi.push(cellDef);
        if (cellDef.name === '*') {
            this.setMultiDefault(kind, cellDef);
        }
        this.emitChanges({ op: 'add', type: kind, value: cellDef });
    }
    removeMulti(kind, cellDef) {
        const multi = this.getMulti(kind);
        if (multi) {
            const idx = multi.indexOf(cellDef);
            if (idx > -1) {
                multi.splice(idx, 1);
            }
            this.emitChanges({ op: 'remove', type: kind, value: cellDef });
        }
    }
    /**
     * Iterate over all multi-registry value of the provided `kind` ascending order, starting from the last ancestor (this registry) up to
     * the root parent.
     *
     * Each time a collection for the `kind` is found the handler is invoked and then repeating the process on the parent.
     * If the `kind` does not exist the handler is not called moving on to the next parent.
     *
     * To bail out (stop the process and don't iterate to the next parent), return true from the handler.
     *
     * @returns The number of times that handler was invoked, i.e 0 means no matches.
     */
    forMulti(kind, handler) {
        let registry = this;
        let hasSome = 0;
        while (registry) {
            const values = registry.getMulti(kind);
            if (values) {
                hasSome++;
                if (handler(values) === true) {
                    return;
                }
            }
            registry = registry.parent;
        }
        return hasSome;
    }
    ngOnDestroy() {
        this.changes$.complete();
        unrx.kill(this);
    }
    /**
     * Delay all notifications sent through `changes` and buffer then until next call to `bufferEnd()`.
     * When `bufferEnd()` is called it will flush all changes.
     *
     * > It's important to note that buffering does not freeze the registry, adding and removing templates will change the
     * registry and will effect queries. Buffering block the `changes` event stream and nothing more.
     */
    bufferStart() {
        if (!this.root.bufferedData) {
            this.root.bufferedData = [];
        }
    }
    bufferEnd() {
        if (this.root.bufferedData) {
            const data = this.root.bufferedData;
            this.root.bufferedData = undefined;
            this.emitChanges(data);
        }
    }
    emitChanges(events) {
        const e = Array.isArray(events) ? events : [events];
        if (this.root.bufferedData) {
            this.root.bufferedData.push(...e);
        }
        else {
            this.changes$.next(e);
        }
    }
}
/** @nocollapse */ PblNgridRegistryService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, deps: [{ token: PblNgridRegistryService, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridRegistryService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRegistryService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: PblNgridRegistryService, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }]; } });

class PblNgridRowDef extends CdkRowDef {
    constructor(template, _differs, registry, _table) {
        super(template, _differs, _table);
        this.registry = registry;
        this._table = _table;
        /**
         * Empty rows.
         * We don't supply column rows to the CdkTable so it will not render them.
         * We render internally.
         */
        this.columns = [];
    }
    getColumnsDiff() {
        return null;
    }
    clone() {
        const clone = Object.create(this);
        // Provide 0 column so CdkTable will not render.
        this.columns = [];
        return clone;
    }
}
/** @nocollapse */ PblNgridRowDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: PblNgridRegistryService }, { token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowDef, selector: "[pblNgridRowDef]", inputs: { columns: ["pblNgridRowDefColumns", "columns"], when: ["pblNgridRowDefWhen", "when"] }, providers: [
        { provide: CdkRowDef, useExisting: PblNgridRowDef },
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowDef]',
                    inputs: ['columns: pblNgridRowDefColumns', 'when: pblNgridRowDefWhen'],
                    providers: [
                        { provide: CdkRowDef, useExisting: PblNgridRowDef },
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }]; } });
/**
 * A directive for quick replacements of the row container component.
 *
 * When used inside the content of the grid:
 *
 * ```html
 * <pbl-ngrid [dataSource]="ds" [columns]="columns">
 *   <pbl-ngrid-row *pblNgridRowOverride="let row;" row></pbl-ngrid-row>
 * </pbl-ngrid>
 * ```
 *
 * However, when used outside of the grid you must provide a reference to the grid so it can register as a template:
 *
 * ```html
 * <pbl-ngrid-row *pblNgridRowOverride="let row; grid: myGrid" row></pbl-ngrid-row>
 * <pbl-ngrid #myGrid [dataSource]="ds" [columns]="columns"></pbl-ngrid>
 * ```
 */
class PblNgridRowOverride extends PblNgridRowDef {
    constructor(template, _differs, registry, extApi) {
        super(template, _differs, registry, extApi?.cdkTable);
        this.extApi = extApi;
        this.when = () => true;
    }
    ngOnInit() {
        if (!this.extApi && this.grid) {
            this.extApi = PblNgridPluginController.find(this.grid).extApi;
        }
        this.extApi?.cdkTable.addRowDef(this);
    }
}
/** @nocollapse */ PblNgridRowOverride.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowOverride, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: PblNgridRegistryService }, { token: EXT_API_TOKEN, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowOverride.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowOverride, selector: "[pblNgridRowOverride]", inputs: { columns: ["pblNgridRowDefColumns", "columns"], when: ["pblNgridRowDefWhen", "when"], grid: ["pblNgridRowDefGrid", "grid"] }, providers: [
        { provide: CdkRowDef, useExisting: PblNgridRowDef },
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowOverride, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowOverride]',
                    inputs: ['columns: pblNgridRowDefColumns', 'when: pblNgridRowDefWhen', 'grid: pblNgridRowDefGrid'],
                    providers: [
                        { provide: CdkRowDef, useExisting: PblNgridRowDef },
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }, {
                    type: Optional
                }] }]; } });

class MetaCellContext {
    constructor() { }
    get $implicit() { return this; }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static create(col, grid) {
        const instance = new MetaCellContext();
        instance.col = col;
        instance.grid = grid;
        return instance;
    }
}
class PblCellContext {
    constructor() {
        this._editing = false;
        this._focused = false;
        this._selected = false;
        this._external = {};
    }
    get $implicit() { return this; }
    get row() { return this.rowContext.$implicit; }
    ;
    get value() { return this.col.getValue(this.row); }
    set value(v) { this.col.setValue(this.row, v); }
    get rowContext() { return this._rowContext; }
    get editing() { return this._editing; }
    get focused() { return this._focused; }
    get selected() { return this._selected; }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static create(rowContext, col, extApi) {
        const instance = new PblCellContext();
        instance._rowContext = rowContext;
        instance.col = col;
        instance.extApi = extApi;
        Object.defineProperties(instance, {
            grid: { value: extApi.grid },
            index: { value: extApi.grid.columnApi.indexOf(col) },
        });
        return instance;
    }
    static defaultState() {
        return { editing: false, focused: false, selected: false, external: {} };
    }
    clone(col) {
        const ctx = PblCellContext.create(this._rowContext, col || this.col, this.extApi);
        ctx.fromState(this.getState(), this._rowContext, true);
        return ctx;
    }
    getExternal(key) {
        return this._external[key];
    }
    setExternal(key, value, saveState = false) {
        this._external[key] = value;
        if (saveState) {
            this._rowContext.saveState();
        }
    }
    getState() {
        return {
            editing: this._editing,
            focused: this._focused,
            selected: this._selected,
            external: this._external,
        };
    }
    fromState(state, rowContext, skipRowUpdate) {
        const requiresReset = !skipRowUpdate && this._editing === state.editing;
        this._rowContext = rowContext;
        this._editing = state.editing;
        this._focused = state.focused;
        this._selected = state.selected;
        this._external = state.external;
        if (requiresReset) {
            rowContext.updateCell(this);
        }
    }
    startEdit(markForCheck) {
        if (this.col.editorTpl && !this.editing) {
            this._editing = true;
            this._rowContext.updateCell(this);
            if (markForCheck) {
                this.grid.rowsApi.syncRows('data', true, this.rowContext.index);
            }
        }
    }
    stopEdit(markForCheck) {
        if (this.editing && !this.grid.viewport.isScrolling) {
            this._editing = false;
            this._rowContext.updateCell(this);
            if (markForCheck) {
                this.grid.rowsApi.syncRows('data', this.rowContext.index);
            }
        }
    }
}

class PblRowContext {
    constructor(_data, dsIndex, extApi) {
        this.extApi = extApi;
        this.external = {};
        this.dsIndex = dsIndex;
        this._$implicit = _data;
        this.identity = this.extApi.contextApi.getRowIdentity(dsIndex, _data);
        this.grid = extApi.grid;
        this._rebuildCells(this.extApi.grid.columnApi.columns);
    }
    /** Data for the row that this cell is located within. */
    get $implicit() { return this._$implicit; }
    set $implicit(value) {
        if (this._$implicit !== value) {
            this._$implicit = value;
            this.updateRowData();
        }
    }
    ;
    /** Index of the data object in the provided data array. */
    get dataIndex() { return this.index; }
    set dataIndex(value) { this.index = value; }
    /**
     * Returns the length of cells context stored in this row
     */
    get length() { return this.cells?.length ?? 0; }
    static defaultState(identity, dsIndex, cellsCount) {
        const cells = [];
        for (let i = 0; i < cellsCount; i++) {
            cells.push(PblCellContext.defaultState());
        }
        return { identity, dsIndex, cells, firstRender: true, external: {} };
    }
    getExternal(key) {
        return this.external[key];
    }
    setExternal(key, value, saveState = false) {
        this.external[key] = value;
        if (saveState) {
            this.saveState();
        }
    }
    getState() {
        return {
            identity: this.identity,
            dsIndex: this.dsIndex,
            firstRender: this.firstRender,
            cells: this.cells.map(c => c.getState()),
            external: this.external,
        };
    }
    fromState(state) {
        this.firstRender = state.firstRender;
        this.dsIndex = state.dsIndex;
        this.external = state.external;
        for (let i = 0, len = this.cells.length; i < len; i++) {
            this.cells[i].fromState(state.cells[i], this);
        }
    }
    saveState() {
        this.extApi.contextApi.saveState(this);
    }
    /**
     * Returns the cell context for the column at the specified position.
     * > The position is relative to ALL columns (NOT RENDERED COLUMNS)
     */
    cell(index) {
        const idx = typeof index === 'number' ? index : this.grid.columnApi.indexOf(index);
        return this.cells[idx];
    }
    getCells() {
        return (this.cells && this.cells.slice()) || [];
    }
    updateCell(cell) {
        this.cells[cell.index] = cell.clone();
    }
    attachRow(row) {
        this.detachRow(this._attachedRow);
        this._attachedRow = row;
        if (this._updatePending) {
            this.updateRowData();
        }
    }
    detachRow(row) {
        if (row && this._attachedRow === row) {
            this.saveState();
            this._attachedRow = undefined;
        }
    }
    _rebuildCells(columns) {
        const cells = this.cells = [];
        const len = columns.length;
        for (let columnIndex = 0; columnIndex < len; columnIndex++) {
            const cellContext = PblCellContext.create(this, columns[columnIndex], this.extApi);
            cells.push(cellContext);
        }
    }
    updateRowData() {
        if (this._attachedRow) {
            this._updatePending = false;
            this.extApi.contextApi._updateRowContext(this, this._attachedRow.rowIndex);
            this._attachedRow.updateRow();
        }
        else {
            this._updatePending = !!this._$implicit;
        }
    }
}

/** IE 11 compatible matches implementation. */
function matches(element, selector) {
    return element.matches ?
        element.matches(selector) :
        element['msMatchesSelector'](selector);
}
/** IE 11 compatible closest implementation. */
function closest(element, selector) {
    if (!(element instanceof Node)) {
        return null;
    }
    let curr = element;
    while (curr != null && !(curr instanceof Element && matches(curr, selector))) {
        curr = curr.parentNode;
    }
    return (curr || null);
}
function findRowRenderedIndex(el) {
    const rows = Array.from(closest(el, 'pbl-cdk-table').querySelectorAll('pbl-ngrid-row'));
    return rows.indexOf(el);
}
function findCellRenderedIndex(el) {
    const rowEl = closest(el, 'pbl-ngrid-row');
    const cells = Array.from(rowEl.querySelectorAll('pbl-ngrid-cell'));
    return [findRowRenderedIndex(rowEl), cells.indexOf(el)];
}
/**
 * Resolves the context from one of the possible types in `CellReference`.
 * If the context is within the view it will return the `PblCellContext instance, otherwise it will
 * return a tuple with the first item being the row context state and the seconds item pointing to the cell index.
 *
 * If no context is found, returns undefined.
 */
function resolveCellReference(cellRef, context) {
    let rowIdent;
    let colIndex;
    if (isGridDataPoint(cellRef)) {
        rowIdent = cellRef.rowIdent;
        colIndex = cellRef.colIndex;
    }
    else if (isCellContext(cellRef)) {
        rowIdent = cellRef.rowContext.identity;
        colIndex = cellRef.index;
    }
    else {
        const [r, c] = findCellRenderedIndex(cellRef);
        const rowContext = context.viewCache.get(r);
        if (rowContext) {
            const column = context.columnApi.findColumnAt(c);
            const columnIndex = context.columnApi.indexOf(column);
            return rowContext.cell(columnIndex);
        }
        else {
            return;
        }
    }
    const rowState = context.cache.get(rowIdent);
    if (rowState) {
        const rowContext = context.extApi.grid.contextApi.findRowInView(rowState.identity);
        if (rowContext) {
            return rowContext.cell(colIndex);
        }
        else {
            const cellState = rowState.cells[colIndex];
            if (cellState) {
                return [rowState, colIndex];
            }
        }
    }
}
function isGridDataPoint(obj) {
    return 'rowIdent' in obj && 'colIndex' in obj;
}
function isCellContext(obj) {
    return 'rowContext' in obj && 'index' in obj;
}

class ContextApi {
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
            .pipe(buffer(this.focusChanged$.pipe(debounceTime(0, asapScheduler))), map(events => ({ prev: events[0]?.prev, curr: events[events.length - 1].curr })));
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

class PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
    ngOnInit() {
        this.registry.addMulti(this.kind, this);
    }
    ngOnDestroy() {
        this.registry.removeMulti(this.kind, this);
    }
}
/** @nocollapse */ PblNgridMultiTemplateRegistry.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMultiTemplateRegistry, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMultiTemplateRegistry.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMultiTemplateRegistry, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMultiTemplateRegistry, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

class PblNgridDataHeaderExtensionContext extends MetaCellContext {
    constructor() { super(); }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static createDateHeaderCtx(headerCell, injector) {
        const instance = new PblNgridDataHeaderExtensionContext();
        instance.col = headerCell.columnDef.column;
        instance.grid = headerCell.grid;
        Object.defineProperty(instance, 'injector', { value: injector });
        return instance;
    }
}
/**
 * A generic, multi-purpose template reference for data header extensions.
 * The template's context is `PblNgridDataHeaderExtensionContext`:
 *
 * ```ts
 * interface PblNgridDataHeaderExtensionContext {
 *   col: PblMetaColumn;
 *   grid: PblNgridComponent<any>;
 *   injector: Injector;
 * }
 * ```
 *
 * By default it will render if registered but it is possible to provide a predicate to conditionally load it.
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="let ctx"></div>
 * ````
 *
 * Or with a `shouldRender` predicate:
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="shouldRender; let ctx"></div>
 * ```
 *
 * And in the component the template is defined on:
 *
 * ```ts
 * class MyComponent {
 *
 *   shouldRender = (context: PblNgridDataHeaderExtensionContext) => {
 *     // Some code returning true or false
 *   }
 * }
 * ```
 *
 * Note that the `shouldRender` predicate is run once when the header initialize.
 */
class PblNgridHeaderExtensionRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'genericHeaderExtension-' + PblNgridHeaderExtensionRefDirective._id++;
        this.kind = 'dataHeaderExtensions';
    }
}
PblNgridHeaderExtensionRefDirective._id = 0;
/** @nocollapse */ PblNgridHeaderExtensionRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderExtensionRefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHeaderExtensionRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderExtensionRefDirective, selector: "[pblNgridHeaderExtensionRef]", inputs: { shouldRender: ["pblNgridHeaderExtensionRef", "shouldRender"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderExtensionRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridHeaderExtensionRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; }, propDecorators: { shouldRender: [{
                type: Input,
                args: ['pblNgridHeaderExtensionRef']
            }] } });

class PblNgridMultiComponentRegistry {
}

class PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
    ngOnInit() {
        this.registry.setSingle(this.kind, this);
    }
    ngOnDestroy() {
        this.registry.setSingle(this.kind, undefined);
    }
}
/** @nocollapse */ PblNgridSingleTemplateRegistry.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridSingleTemplateRegistry, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridSingleTemplateRegistry.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridSingleTemplateRegistry, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridSingleTemplateRegistry, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

/**
 * Marks the element as the display element when grid has no data.
 *
 * @example
 * ```html
 *   <pbl-ngrid>
 *     <div *pblNgridNoDataRef style="height: 100%; display: flex; align-items: center; justify-content: center">
 *       <span>No Data</span>
 *     </div>
 *   </pbl-ngrid>
 * ```
 */
class PblNgridNoDataRefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'noData';
    }
}
/** @nocollapse */ PblNgridNoDataRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridNoDataRefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridNoDataRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridNoDataRefDirective, selector: "[pblNgridNoDataRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridNoDataRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridNoDataRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

/**
 * Marks the element as the display element for pagination
 */
class PblNgridPaginatorRefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'paginator';
    }
}
/** @nocollapse */ PblNgridPaginatorRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorRefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridPaginatorRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridPaginatorRefDirective, selector: "[pblNgridPaginatorRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridPaginatorRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

/*
    We're using `StylingDiffer`, which is an exact copy of the style differ used for `ngStyle` and `ngClass`.
    The class is not exposed so we use a hard-copy.
    `StylingDiffer` is used only when IVY is enabled but here we've adopted it to be used in both modes. (pre IVY and IVY)
*/
/**
 * Bind to the class / style attributes of the container of a cell template.
 * For class bindings use [ngridCellClass] and for style bindings use [ngridCellStyle].
 *
 * This is like [ngClass] or [ngStyle] but not for the host of the directive but to it's parent.
 *
 * - [ngridCellClass] accepts the same type of values that [ngClass] does.
 * - [ngridCellStyle] accepts the same type of values that [ngStyle] does.
 *
 * ## Example
 *
 * We want to create a new cell type called "balance" that represents the balance of a bank account.
 * We also want to have different background color, green if the account balance if positive and red if it's negative.
 *
 * ```html
 * <div *pblNgridCellTypeDef="'balance'; value as value"
 *      [ngClass]="value < 0 ? 'balance-negative' : 'balance-positive'">{{ value  }}
 * </div>
 * ```
 *
 * The example above will work but the background will not fill the entire cell, only the `div` it is applied on.
 * This is because the container of the `div` has internal styling that apply padding (among other styles) to the cell.
 *
 * The container is controlled internally by ngrid, but you can access it's style / class attributes using this directive.
 *
 * ```html
 * <div *pblNgridCellTypeDef="'balance'; value as value"
 *      [ngridCellClass]="value < 0 ? 'balance-negative' : 'balance-positive'">{{ value  }}
 * </div>
 * ```
 *
 * > Because style / class is applied on the parent and the parent can have multiple children it is possible to apply this directive
 * on multiple children, do not do this as it will have unexpected results.
 */
class PblNgridCellStyling {
    constructor(elRef) {
        this.elRef = elRef;
        this._lastStyle = new Set();
        this._lastClass = new Set();
    }
    set style(value) {
        if (!this._styleDiffer) {
            this._styleDiffer = new StylingDiffer('NgStyle', 8 /* StylingDifferOptions.AllowUnits */);
        }
        this._styleDiffer.setInput(value);
    }
    set klass(value) {
        if (!this._classDiffer) {
            this._classDiffer = new StylingDiffer('NgClass', 1 /* StylingDifferOptions.TrimProperties */ | 2 /* StylingDifferOptions.AllowSubKeys */ | 4 /* StylingDifferOptions.AllowStringValue */ | 16 /* StylingDifferOptions.ForceAsMap */);
        }
        this._classDiffer.setInput(value);
    }
    ngAfterViewInit() {
        this._parent = this.elRef.nativeElement.parentElement;
        this.updateParent();
    }
    ngDoCheck() { this, this.updateParent(); }
    updateParent() {
        if (this._parent) {
            if (this._styleDiffer?.updateValue()) {
                const lastStyle = this._lastStyle;
                this._lastStyle = new Set();
                for (const key of Object.keys(this._styleDiffer.value)) {
                    this._parent.style[key] = this._styleDiffer.value[key];
                    lastStyle.delete(key);
                    this._lastStyle.add(key);
                }
                if (lastStyle.size > 0) {
                    for (const key of lastStyle.values()) {
                        this._parent.style[key] = null;
                    }
                }
            }
            if (this._classDiffer?.updateValue()) {
                const lastClass = this._lastClass;
                this._lastClass = new Set();
                for (const key of Object.keys(this._classDiffer.value)) {
                    if (this._classDiffer.value[key]) {
                        this._parent.classList.add(key);
                        this._lastClass.add(key);
                    }
                    else {
                        this._parent.classList.remove(key);
                    }
                    lastClass.delete(key);
                }
                if (lastClass.size > 0) {
                    for (const key of lastClass.values()) {
                        this._parent.classList.remove(key);
                    }
                }
            }
        }
    }
}
/** @nocollapse */ PblNgridCellStyling.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellStyling, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellStyling.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellStyling, selector: "[ngridCellStyle], [ngridCellClass]", inputs: { style: ["ngridCellStyle", "style"], klass: ["ngridCellClass", "klass"] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellStyling, decorators: [{
            type: Directive,
            args: [{ selector: '[ngridCellStyle], [ngridCellClass]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }]; }, propDecorators: { style: [{
                type: Input,
                args: ['ngridCellStyle']
            }], klass: [{
                type: Input,
                args: ['ngridCellClass']
            }] } });

function initCellElement(el, column, prev) {
    if (prev) {
        // If IE 11 is dropped before we switch to setting a single class name, change to multi param
        // with destructuring.
        const classList = el.classList;
        for (const className of prev.columnDef._columnCssClassName) {
            classList.add(className);
        }
        el.classList.remove(uniqueColumnCss(prev.columnDef));
        if (prev.type) {
            el.classList.remove(uniqueColumnTypeCss(prev.type));
        }
        if (prev.css) {
            const css = prev.css.split(' ');
            for (const c of css) {
                el.classList.remove(c);
            }
        }
    }
    // If IE 11 is dropped before we switch to setting a single class name, change to multi param
    // with destructuring.
    const classList = el.classList;
    for (const className of column.columnDef._columnCssClassName) {
        classList.add(className);
    }
    el.classList.add(uniqueColumnCss(column.columnDef));
    if (column.type) {
        el.classList.add(uniqueColumnTypeCss(column.type));
    }
    if (column.css) {
        const css = column.css.split(' ');
        for (const c of css) {
            el.classList.add(c);
        }
    }
}
function initCellHeaderFooter(element, isFooter) {
    element.classList.add(...(isFooter ? ['cdk-footer-cell', 'pbl-ngrid-footer-cell'] : ['cdk-header-cell', 'pbl-ngrid-header-cell']));
}
function applyWidth() {
    this.columnDef.applyWidth(this.el);
}
function applySourceWidth() {
    this.columnDef.applySourceWidth(this.el);
}

class PblNgridBaseCell {
    constructor(extApi, elementRef) {
        this.extApi = extApi;
        this.el = elementRef.nativeElement;
    }
    get owner() { return this._owner; }
    setOwner(owner) {
        this._owner = owner;
    }
    focus() {
        this.el.focus({ preventScroll: true });
        this.extApi.viewport._scrollIntoView(this.el);
    }
    ngOnDestroy() {
        unrx.kill(this);
    }
}
/** @nocollapse */ PblNgridBaseCell.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCell, deps: [{ token: EXT_API_TOKEN }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseCell.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseCell, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCell, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: i0.ElementRef }]; } });

const PBL_NGRID_MAP = new Map();
/**
 * A controller that groups columns of a grid and listens to resize events
 * and will notify the grid once resize occurs
 */
class PblNgridColumnSizeObserverGroup {
    constructor(extApi) {
        this.extApi = extApi;
        this.columns = [];
        this.entries = new WeakMap();
        this.ro = new ResizeObserver(entries => {
            requestAnimationFrame(() => this.onResize(entries));
        });
    }
    static get(extApi) {
        let controller = PBL_NGRID_MAP.get(extApi.grid);
        if (!controller) {
            controller = new PblNgridColumnSizeObserverGroup(extApi);
            PBL_NGRID_MAP.set(extApi.grid, controller);
        }
        return controller;
    }
    has(col) {
        return this.columns.indexOf(col) !== -1;
    }
    hasColumn(column) {
        return this.columns.some(c => c.column === column);
    }
    add(col) {
        this.entries.set(col.target, col);
        this.ro.observe(col.target);
        this.columns.push(col);
    }
    remove(col) {
        this.ro.unobserve(col.target);
        this.entries.delete(col.target);
        const idx = this.columns.indexOf(col);
        if (idx > -1) {
            this.columns.splice(idx, 1);
        }
        if (this.columns.length === 0) {
            this.ro.disconnect();
            PBL_NGRID_MAP.delete(this.extApi.grid);
        }
    }
    onResize(entries) {
        const resized = [];
        for (const entry of entries) {
            const o = this.entries.get(entry.target);
            if (o) {
                resized.push(o);
            }
        }
        if (resized.length > 0) {
            let isDragging = false;
            for (const c of resized) {
                isDragging = isDragging || c.column.columnDef.isDragging;
                c.updateSize();
            }
            if (!isDragging) {
                this.extApi.widthCalc.calcColumnWidth(this.columns.map(c => c.column));
            }
        }
    }
}

/**
 * A wrapper around `ColumnSizeInfo` that listen to size changes from the element of a cell, using the `ResizeObserver` API.
 * When a resize event is triggered it will call `updateSize()` which in turn update the layout and notify the column about the resize event.
 *
 * In other words, all cell element of the grid, attached to a column, which are wrapped with this observer will trigger resize events.
 *
 * Because most of the size changes concern all columns of a row and because ResizeObserver will emit them all in the same event
 * an entire row should emit once, with all columns.
 *
 * > This class can be extended by a Directive class to be used by declarative markup in angular templates.
 */
class PblColumnSizeObserver extends ColumnSizeInfo {
    constructor(element, extApi) {
        super(element);
        this.controller = PblNgridColumnSizeObserverGroup.get(extApi);
    }
    attachColumn(column) {
        super.attachColumn(column);
        if (!column) {
            this.controller.remove(this);
        }
        else if (!this.controller.has(this)) {
            this.updateSize();
            this.controller.add(this);
        }
    }
    destroy() {
        this.controller.remove(this);
        this.detachColumn();
    }
}

// tslint:disable:use-host-property-decorator
const lastDataHeaderExtensions = new Map();
/**
 * Header cell component.
 * The header cell component will render the header cell template and add the proper classes and role.
 *
 * It is also responsible for creating and managing the any `dataHeaderExtensions` registered in the registry.
 * These extensions add features to the cells either as a template instance or as a component instance.
 * Examples: Sorting behavior, drag&drop/resize handlers, menus etc...
 */
class PblNgridHeaderCellComponent extends PblNgridBaseCell {
    constructor(extApi, elementRef, zone) {
        super(extApi, elementRef);
        this.zone = zone;
    }
    get columnDef() { return this.column?.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column, gridWidthRow) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            let predicate;
            let view;
            let widthUpdater;
            widthUpdater = gridWidthRow ? applySourceWidth : applyWidth;
            predicate = event => (!gridWidthRow && event.reason !== 'update') || (gridWidthRow && event.reason !== 'resize');
            view = !gridWidthRow ? this.initMainHeaderColumnView(column) : undefined;
            if (gridWidthRow && !this.resizeObserver) {
                this.resizeObserver = new PblColumnSizeObserver(this.el, this.extApi);
            }
            this.columnDef.widthChange
                .pipe(filter(predicate), unrx(this, column))
                .subscribe(widthUpdater.bind(this));
            if (view) {
                view.detectChanges();
            }
            widthUpdater.call(this);
            initCellElement(this.el, column);
        }
    }
    updateSize() {
        if (this.resizeObserver) {
            this.resizeObserver.updateSize();
        }
    }
    ngAfterViewInit() {
        if (this.resizeObserver) {
            this.resizeObserver.column = this.column;
        }
    }
    ngOnDestroy() {
        this.resizeObserver?.destroy();
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
    initMainHeaderColumnView(col) {
        this.cellCtx = PblNgridDataHeaderExtensionContext.createDateHeaderCtx(this, this.vcRef.injector);
        const context = this.cellCtx;
        const view = this.vcRef.createEmbeddedView(col.headerCellTpl, context);
        this.zone.onStable
            .pipe(first())
            .subscribe(() => {
            this.runHeaderExtensions(context, view);
            const v = this.vcRef.get(0);
            // at this point the view might get destroyed, its possible...
            if (!v.destroyed) {
                v.detectChanges();
            }
        });
        return view;
    }
    runHeaderExtensions(context, view) {
        // we collect the first header extension for each unique name only once per grid instance
        let extensions = lastDataHeaderExtensions.get(this.grid);
        if (!extensions) {
            const dataHeaderExtensions = new Map();
            this.grid.registry.forMulti('dataHeaderExtensions', values => {
                for (const value of values) {
                    if (!dataHeaderExtensions.has(value.name)) {
                        dataHeaderExtensions.set(value.name, value);
                    }
                }
            });
            extensions = Array.from(dataHeaderExtensions.values());
            lastDataHeaderExtensions.set(this.grid, extensions);
            // destroy it on the next turn, we know all cells will render on the same turn.
            this.zone.onStable.pipe(first()).subscribe(() => lastDataHeaderExtensions.delete(this.grid));
        }
        let { rootNodes } = view;
        for (const ext of extensions) {
            if (!ext.shouldRender || ext.shouldRender(context)) {
                if (ext instanceof PblNgridMultiTemplateRegistry) {
                    const extView = this.vcRef.createEmbeddedView(ext.tRef, context);
                    extView.markForCheck();
                }
                else if (ext instanceof PblNgridMultiComponentRegistry) {
                    rootNodes = this.createComponent(ext, context, rootNodes);
                }
            }
        }
    }
    createComponent(ext, context, rootNodes) {
        const factory = ext.getFactory(context);
        const projectedContent = [];
        if (ext.projectContent) {
            projectedContent.push(rootNodes);
        }
        const cmpRef = this.vcRef.createComponent(factory, this.vcRef.length, null, projectedContent);
        if (ext.projectContent) {
            rootNodes = [cmpRef.location.nativeElement];
        }
        if (ext.onCreated) {
            ext.onCreated(context, cmpRef);
        }
        return rootNodes;
    }
}
/** @nocollapse */ PblNgridHeaderCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellComponent, deps: [{ token: EXT_API_TOKEN }, { token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridHeaderCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderCellComponent, selector: "pbl-ngrid-header-cell", host: { attributes: { "role": "columnheader" }, classAttribute: "cdk-header-cell pbl-ngrid-header-cell" }, viewQueries: [{ propertyName: "vcRef", first: true, predicate: ["vcRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["ngridHeaderCell"], usesInheritance: true, ngImport: i0, template: `<ng-container #vcRef></ng-container>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-header-cell',
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        class: 'cdk-header-cell pbl-ngrid-header-cell',
                        role: 'columnheader',
                    },
                    exportAs: 'ngridHeaderCell',
                    template: `<ng-container #vcRef></ng-container>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { vcRef: [{
                type: ViewChild,
                args: ['vcRef', { read: ViewContainerRef, static: true }]
            }] } });

const COLUMN_EDITABLE_CELL_CLASS = 'pbl-ngrid-editable-cell';
function initDataCellElement(el, column, prev) {
    if (prev?.editable && prev.editorTpl) {
        el.classList.remove(COLUMN_EDITABLE_CELL_CLASS);
    }
    if (column.editable && column.editorTpl) {
        el.classList.add(COLUMN_EDITABLE_CELL_CLASS);
    }
}
/** Cell template container that adds the right classes and role. */
class PblNgridCellComponent extends PblNgridBaseCell {
    constructor() {
        super(...arguments);
        this.focused = false;
        this.selected = false;
    }
    syncColumn() {
        if (this.column) {
            this.colIndex = this.column.columnDef.grid.columnApi.indexOf(this.column);
        }
    }
    setContext(context) {
        this._rowCtx = context;
    }
    setColumn(column) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            this.colIndex = this.column.columnDef.grid.columnApi.indexOf(column);
            column.columnDef.applyWidth(this.el);
            initCellElement(this.el, column, prev);
            initDataCellElement(this.el, column, prev);
            /*  Apply width changes to this data cell
                We don't update "update" events because they are followed by a resize event which will update the absolute value (px) */
            column.columnDef.widthChange
                .pipe(filter(event => event.reason !== 'update'), unrx(this, column))
                .subscribe(event => this.column.columnDef.applyWidth(this.el));
        }
    }
    ngDoCheck() {
        if (this._rowCtx) {
            const cellContext = this.cellCtx = this._rowCtx.cell(this.colIndex);
            this.template = cellContext.editing ? this.column.editorTpl : this.column.cellTpl;
            if (cellContext.focused !== this.focused) {
                if (this.focused = cellContext.focused) {
                    this.el.classList.add('pbl-ngrid-cell-focused');
                }
                else {
                    this.el.classList.remove('pbl-ngrid-cell-focused');
                }
            }
            if (this.cellCtx.selected !== this.selected) {
                if (this.selected = cellContext.selected) {
                    this.el.classList.add('pbl-ngrid-cell-selected');
                }
                else {
                    this.el.classList.remove('pbl-ngrid-cell-selected');
                }
            }
        }
    }
}
/** @nocollapse */ PblNgridCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellComponent, selector: "pbl-ngrid-cell", host: { attributes: { "role": "gridcell" }, properties: { "attr.id": "column?.id", "attr.tabindex": "column?.columnDef?.grid.cellFocus" }, classAttribute: "pbl-ngrid-cell" }, exportAs: ["pblNgridCell"], usesInheritance: true, ngImport: i0, template: `<ng-container *ngTemplateOutlet="template; context: cellCtx"></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-cell',
                    template: `<ng-container *ngTemplateOutlet="template; context: cellCtx"></ng-container>`,
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        'class': 'pbl-ngrid-cell',
                        'role': 'gridcell',
                        '[attr.id]': 'column?.id',
                        '[attr.tabindex]': 'column?.columnDef?.grid.cellFocus'
                    },
                    exportAs: 'pblNgridCell',
                }]
        }] });

class PblNgridFooterCellComponent extends PblNgridBaseCell {
    get columnDef() { return this.column?.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            this.cellCtx = MetaCellContext.create(column, this.grid);
            applyWidth.call(this);
            initCellElement(this.el, column);
            this.columnDef.widthChange
                .pipe(filter(event => event.reason !== 'update'), unrx(this, column))
                .subscribe(applyWidth.bind(this));
        }
    }
    ngOnDestroy() {
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
}
/** @nocollapse */ PblNgridFooterCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridFooterCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridFooterCellComponent, selector: "pbl-ngrid-footer-cell", host: { attributes: { "role": "gridcell" }, classAttribute: "cdk-footer-cell pbl-ngrid-footer-cell" }, usesInheritance: true, ngImport: i0, template: `<ng-container *ngTemplateOutlet="column?.footerCellTpl; context: cellCtx"></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-footer-cell',
                    template: `<ng-container *ngTemplateOutlet="column?.footerCellTpl; context: cellCtx"></ng-container>`,
                    host: {
                        class: 'cdk-footer-cell pbl-ngrid-footer-cell',
                        role: 'gridcell',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });

const HEADER_GROUP_CSS = `pbl-header-group-cell`;
const HEADER_GROUP_PLACE_HOLDER_CSS = `pbl-header-group-cell-placeholder`;
/**
 * Header cell component.
 * The header cell component will render the header cell template and add the proper classes and role.
 *
 * It is also responsible for creating and managing the any `dataHeaderExtensions` registered in the registry.
 * These extensions add features to the cells either as a template instance or as a component instance.
 * Examples: Sorting behavior, drag&drop/resize handlers, menus etc...
 */
class PblNgridMetaCellComponent extends PblNgridBaseCell {
    get columnDef() { return this.column.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column, isFooter) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            if (column) {
                if (!column.columnDef) {
                    new PblNgridColumnDef(this.extApi).column = column;
                    column.columnDef.name = column.id;
                }
                this.cellCtx = MetaCellContext.create(column, this.grid);
                if (isPblColumnGroup(column)) {
                    this.el.classList.add(HEADER_GROUP_CSS);
                    if (column.placeholder) {
                        this.el.classList.add(HEADER_GROUP_PLACE_HOLDER_CSS);
                    }
                }
                this.columnDef.widthChange
                    .pipe(filter(event => event.reason !== 'resize'), unrx(this, column))
                    .subscribe(event => this.columnDef.applySourceWidth(this.el));
                applySourceWidth.call(this);
                initCellElement(this.el, column);
                initCellHeaderFooter(this.el, isFooter);
            }
        }
    }
    ngOnDestroy() {
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
}
/** @nocollapse */ PblNgridMetaCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaCellComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridMetaCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMetaCellComponent, selector: "pbl-ngrid-meta-cell", host: { attributes: { "role": "cell" } }, viewQueries: [{ propertyName: "vcRef", first: true, predicate: ["vcRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["ngridMetaCell"], usesInheritance: true, ngImport: i0, template: `<ng-container *ngTemplateOutlet="column?.template; context: cellCtx"></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-meta-cell',
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        role: 'cell',
                    },
                    exportAs: 'ngridMetaCell',
                    template: `<ng-container *ngTemplateOutlet="column?.template; context: cellCtx"></ng-container>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], propDecorators: { vcRef: [{
                type: ViewChild,
                args: ['vcRef', { read: ViewContainerRef, static: true }]
            }] } });

// tslint:disable:use-input-property-decorator
class PblNgridBaseCellDef {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
}
/** @nocollapse */ PblNgridBaseCellDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCellDef, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseCellDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseCellDef, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCellDef, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

// tslint:disable:use-input-property-decorator
/**
 * Header Cell definition for the pbl-ngrid.
 * Captures the template of a column's data row header cell as well as header cell-specific properties.
 *
 * `pblNgridHeaderCellDef` does the same thing that `matHeaderCellDef` and `cdkHeaderCellDef` do with one difference,
 * `pblNgridHeaderCellDef` is independent and does not require a column definition parent, instead it accept the ID of
 * the header cell.
 *
 * NOTE: Defining '*' as id will declare the header cell template as default, replacing the table's default header cell template.
 *
 * Make sure you set the proper id of the property you want to override.
 * When the `id` is set explicitly in the table column definition, this is not a problem but when if it's not set
 * the table generates a unique id based on a logic. If `name` is set the name is used, if no name is set
 * the `prop` is used (full with dot notation).
 */
class PblNgridHeaderCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('headerCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('headerCell', this);
    }
}
/** @nocollapse */ PblNgridHeaderCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHeaderCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderCellDefDirective, selector: "[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]", inputs: { name: ["pblNgridHeaderCellDef", "name"], type: ["pblNgridHeaderCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]',
                    inputs: [
                        'name:pblNgridHeaderCellDef',
                        'type:pblNgridHeaderCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

// tslint:disable:use-input-property-decorator
/**
 * Cell definition for the pbl-ngrid.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 *
 * `pblNgridCellDef` does the same thing that `matCellDef` and `cdkCellDef` do with one difference, `pblNgridCellDef` is
 * independent and does not require a column definition parent, instead it accept the ID of the cell.
 *
 * NOTE: Defining '*' as id will declare the cell template as default, replacing the table's default cell template.
 *
 * Make sure you set the proper id of the property you want to override.
 * When the `id` is set explicitly in the table column definition, this is not a problem but when if it's not set
 * the table generates a unique id based on a logic. If `name` is set the name is used, if no name is set
 * the `prop` is used (full with dot notation).
 */
class PblNgridCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('tableCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('tableCell', this);
    }
}
/** @nocollapse */ PblNgridCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellDefDirective, selector: "[pblNgridCellDef], [pblNgridCellTypeDef]", inputs: { name: ["pblNgridCellDef", "name"], type: ["pblNgridCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridCellDef], [pblNgridCellTypeDef]',
                    inputs: [
                        'name:pblNgridCellDef',
                        'type:pblNgridCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

class PblNgridEditorCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('editorCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('editorCell', this);
    }
}
/** @nocollapse */ PblNgridEditorCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridEditorCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridEditorCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridEditorCellDefDirective, selector: "[pblNgridCellEditorDef], [pblNgridCellEditorTypeDef]", inputs: { name: ["pblNgridCellEditorDef", "name"], type: ["pblNgridCellEditorTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridEditorCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridCellEditorDef], [pblNgridCellEditorTypeDef]',
                    inputs: [
                        'name:pblNgridCellEditorDef',
                        'type:pblNgridCellEditorTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

class PblNgridFooterCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('footerCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('footerCell', this);
    }
}
/** @nocollapse */ PblNgridFooterCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridFooterCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridFooterCellDefDirective, selector: "[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]", inputs: { name: ["pblNgridFooterCellDef", "name"], type: ["pblNgridFooterCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]',
                    inputs: [
                        'name:pblNgridFooterCellDef',
                        'type:pblNgridFooterCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: PblNgridRegistryService }]; } });

class PblNgridCellEditAutoFocusDirective {
    constructor(elRef, ngZone) {
        this.elRef = elRef;
        this.ngZone = ngZone;
    }
    ngAfterViewInit() {
        const doFocus = () => {
            const context = this.context;
            if (context.editing && !context.rowContext.outOfView) {
                this.elRef.nativeElement.focus();
            }
        };
        this.ngZone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
                if (!this._destroyed) {
                    const { viewport } = this.context.grid;
                    if (viewport && viewport.isScrolling) {
                        viewport.scrolling.pipe(take(1)).subscribe(doFocus);
                    }
                    else {
                        doFocus();
                    }
                }
            });
        });
    }
    ngOnDestroy() {
        this._destroyed = true;
    }
}
/** @nocollapse */ PblNgridCellEditAutoFocusDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditAutoFocusDirective, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellEditAutoFocusDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellEditAutoFocusDirective, selector: "[pblCellEditAutoFocus]", inputs: { context: ["pblCellEditAutoFocus", "context"] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditAutoFocusDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblCellEditAutoFocus]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { context: [{
                type: Input,
                args: ['pblCellEditAutoFocus']
            }] } });

class PblNgridBaseRowViewRepeaterStrategy {
    constructor(extApi) {
        this.extApi = extApi;
        this.workaroundEnabled = false;
        this._cachedRenderDefMap = new Map();
        extApi
            .onConstructed(() => {
            const cdkTable = extApi.cdkTable;
            this.renderer = cdkTable;
            this.workaroundEnabled = !cdkTable['_cachedRenderDefMap'] && typeof this.renderer._renderCellTemplateForItem === 'function';
        });
    }
    applyChanges(changes, vcRef, itemContextFactory, itemValueResolver, itemViewChanged) {
        const createEmbeddedView = (record, adjustedPreviousIndex, currentIndex) => {
            const itemArgs = itemContextFactory(record, adjustedPreviousIndex, currentIndex);
            itemArgs.context = this.extApi.contextApi._createRowContext(itemArgs.context.$implicit, itemArgs.index);
            return rowContextBridge.bridgeContext(itemArgs, () => vcRef.createEmbeddedView(itemArgs.templateRef, itemArgs.context, itemArgs.index));
        };
        const baseState = { vcRef, createEmbeddedView, itemValueResolver };
        changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
            const state = Object.create(baseState);
            state.record = record;
            if (record.previousIndex == null) {
                this.addItem(adjustedPreviousIndex, currentIndex, state);
                if (state.op === 1 /* _ViewRepeaterOperation.INSERTED */) {
                }
            }
            else if (currentIndex == null) {
                this.removeItem(adjustedPreviousIndex, state);
            }
            else {
                this.moveItem(adjustedPreviousIndex, currentIndex, state);
            }
            if (this.workaroundEnabled) {
                this.patch20765afterOp(state);
            }
            this.afterOperation(state);
        });
        if (this.workaroundEnabled) {
            this.patch20765(changes, baseState);
        }
    }
    detach() { }
    addItem(adjustedPreviousIndex, currentIndex, state) { }
    removeItem(removeAt, state) { }
    moveItem(moveFrom, moveTo, state) { }
    afterOperation(state) { }
    // See https://github.com/angular/components/pull/20765
    patch20765(changes, baseState) {
        changes.forEachIdentityChange = (fn) => {
            changes.constructor.prototype.forEachIdentityChange.call(changes, (record) => {
                fn(record);
                if (this._cachedRenderDefMap.get(record.currentIndex) !== record.item.rowDef) {
                    baseState.vcRef.remove(record.currentIndex);
                    baseState.createEmbeddedView(record, null, record.currentIndex);
                    this._cachedRenderDefMap.set(record.currentIndex, record.item.rowDef);
                }
            });
        };
    }
    patch20765afterOp(state) {
        switch (state.op) {
            case 0 /* _ViewRepeaterOperation.REPLACED */:
            case 1 /* _ViewRepeaterOperation.INSERTED */:
            case 2 /* _ViewRepeaterOperation.MOVED */:
                this._cachedRenderDefMap.set(state.record.currentIndex, state.record.item.rowDef);
                break;
            case 3 /* _ViewRepeaterOperation.REMOVED */:
                this._cachedRenderDefMap.delete(state.record.previousIndex);
                break;
        }
    }
}
/** @nocollapse */ PblNgridBaseRowViewRepeaterStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowViewRepeaterStrategy, deps: [{ token: EXT_API_TOKEN }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridBaseRowViewRepeaterStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowViewRepeaterStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowViewRepeaterStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }]; } });

/**
 * This is a noop strategy that simply prevents the CDK from rendering cells for each row and instead the logic for it is now
 * handled within the row itself.
 *
 * This is very powerful and eliminate the need to use column declaration in strings.
 * Since we have a column store we can take it directly from there.
 *
 * Additionally, a temp fix for a bug is applied (see `workaroundEnabled`
 * Remove when and if PR https://github.com/angular/components/pull/20765 is accepted and the old version not supporting the solution is not supported by ngrid.
 */
class PblNgridCachedRowViewRepeaterStrategy extends PblNgridBaseRowViewRepeaterStrategy {
    constructor() {
        super(...arguments);
        /**
         * The size of the cache used to store unused views.
         * Setting the cache size to `0` will disable caching. Defaults to 20 views.
         */
        this.viewCacheSize = 20;
        /**
         * View cache that stores embedded view instances that have been previously stamped out,
         * but don't are not currently rendered. The view repeater will reuse these views rather than
         * creating brand new ones.
         */
        this._viewCache = [];
    }
    detach() {
        for (const view of this._viewCache) {
            view.destroy();
        }
    }
    addItem(adjustedPreviousIndex, currentIndex, state) {
        /* Inserts a view for a new item, either from the cache or by creating a new one.
           Returns `undefined` if the item was inserted into a cached view. */
        state.view = this._insertViewFromCache(currentIndex, state.vcRef);
        if (state.view) {
            state.view.context.$implicit = state.itemValueResolver(state.record);
            state.op = 0 /* _ViewRepeaterOperation.REPLACED */;
        }
        else {
            state.view = state.createEmbeddedView(state.record, adjustedPreviousIndex, currentIndex);
            state.op = 1 /* _ViewRepeaterOperation.INSERTED */;
        }
    }
    removeItem(removeAt, state) {
        /** Detaches the view at the given index and inserts into the view cache. */
        const detachedView = this._detachView(removeAt, state.vcRef);
        this._maybeCacheView(detachedView, state.vcRef);
        state.op = 3 /* _ViewRepeaterOperation.REMOVED */;
    }
    moveItem(moveFrom, moveTo, state) {
        state.view = state.vcRef.get(moveFrom);
        state.vcRef.move(state.view, moveTo);
        state.view.context.$implicit = state.itemValueResolver(state.record);
        state.op = 2 /* _ViewRepeaterOperation.MOVED */;
    }
    /**
     * Cache the given detached view. If the cache is full, the view will be
     * destroyed.
     */
    _maybeCacheView(view, viewContainerRef) {
        if (this._viewCache.length < this.viewCacheSize) {
            this._viewCache.push(view);
            this.extApi.rowsApi.findRowByElement(view.rootNodes[0])._detach();
            // Notify this row is not part of the view, its cached (however, the component and any child component is not destroyed)
        }
        else {
            const index = viewContainerRef.indexOf(view);
            // The host component could remove views from the container outside of
            // the view repeater. It's unlikely this will occur, but just in case,
            // destroy the view on its own, otherwise destroy it through the
            // container to ensure that all the references are removed.
            if (index === -1) {
                view.destroy();
            }
            else {
                viewContainerRef.remove(index);
            }
        }
    }
    /** Inserts a recycled view from the cache at the given index. */
    _insertViewFromCache(index, viewContainerRef) {
        const cachedView = this._viewCache.pop();
        if (cachedView) {
            // Notify that the items is not longer cached, now live and playing the game
            this.extApi.rowsApi.findRowByElement(cachedView.rootNodes[0])._attach();
            viewContainerRef.insert(cachedView, index);
        }
        return cachedView || null;
    }
    /** Detaches the embedded view at the given index. */
    _detachView(index, viewContainerRef) {
        return viewContainerRef.detach(index);
    }
}
/** @nocollapse */ PblNgridCachedRowViewRepeaterStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridCachedRowViewRepeaterStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCachedRowViewRepeaterStrategy, decorators: [{
            type: Injectable
        }] });

/**
 * Wrapper for the CdkTable that extends it's functionality to support various table features.
 * This wrapper also applies Material Design table styles (i.e. `MatTable` styles).
 *
 * Most of the extensions are done using mixins, this is mostly for clarity and separation of the features added.
 * This approach will allow easy removal when a feature is no longer required/implemented natively.
 */
class PblCdkTableComponent extends CdkTable {
    constructor(_differs, _changeDetectorRef, _elementRef, role, _dir, injector, grid, extApi, _document, platform, _viewRepeater, _coalescedStyleScheduler, _viewportRuler, _stickyPositioningListener) {
        super(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, platform, _viewRepeater, _coalescedStyleScheduler, _viewportRuler, _stickyPositioningListener);
        this.injector = injector;
        this.grid = grid;
        this.extApi = extApi;
        this.platform = platform;
        this._minWidth = null;
        this.pblStickyColumnStylesNeedReset = false;
        //#endregion CSS-CLASS-CONTROL
        //#region CLEAR-ROW-DEFS
        // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
        this._cachedRowDefs = { header: new Set(), footer: new Set() }; //tslint:disable-line
        this.cdRef = _changeDetectorRef;
        extApi.setCdkTable(this);
        this.trackBy = this.grid.trackBy;
    }
    get _element() { return this._elementRef.nativeElement; }
    get beforeRenderRows() {
        if (!this.beforeRenderRows$) {
            this.beforeRenderRows$ = new Subject();
        }
        return this.beforeRenderRows$.asObservable();
    }
    get onRenderRows() {
        if (!this.onRenderRows$) {
            this.onRenderRows$ = new Subject();
        }
        return this.onRenderRows$.asObservable();
    }
    get minWidth() { return this._minWidth; }
    set minWidth(value) {
        this._minWidth = value || null;
        this._element.style.minWidth = value ? value + 'px' : null;
    }
    ngOnInit() {
        // We implement our own sticky styler because we don't have access to the one at CdkTable (private)
        // We need it because our CdkRowDef classes does not expose columns, it's always an empty array
        // This is to prevent CdkTable from rendering cells, we do that.
        // This is why the styler will not work on columns, cause internall in CdkTable it sees nothing.
        this.pblStickyStyler = new StickyStyler(this._isNativeHtmlTable, this.stickyCssClass, this._dir?.value || 'ltr', this._coalescedStyleScheduler, this.platform.isBrowser, this.needsPositionStickyOnElement, this._stickyPositioningListener);
        // This will also run from CdkTable and `updateStickyColumnStyles()` is invoked multiple times
        // but we don't care, we have a window
        (this._dir?.change ?? of())
            .pipe(unrx(this))
            .subscribe(value => {
            this.pblStickyStyler.direction = value;
            this.pblStickyColumnStylesNeedReset = true;
            this.updateStickyColumnStyles();
        });
        // It's imperative we register to dir changes before super.ngOnInit because it register there as well
        // and it will come first and make sticky state pending, cancelling our pblStickyStyler.
        super.ngOnInit();
    }
    updateStickyColumnStyles() {
        if (this._isStickyPending) {
            return;
        }
        this._isStickyPending = true;
        Promise.resolve()
            .then(() => {
            this._isStickyPending = false;
            this._updateStickyColumnStyles();
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        unrx.kill(this);
        if (this.onRenderRows$) {
            this.onRenderRows$.complete();
        }
    }
    //#region CSS-CLASS-CONTROL
    addClass(cssClassName) {
        this._element.classList.add(cssClassName);
    }
    removeClass(cssClassName) {
        this._element.classList.remove(cssClassName);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    addHeaderRowDef(headerRowDef) {
        super.addHeaderRowDef(headerRowDef);
        this._cachedRowDefs.header.add(headerRowDef);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    clearHeaderRowDefs() {
        const { header } = this._cachedRowDefs;
        for (const rowDef of Array.from(header.values())) {
            this.removeHeaderRowDef(rowDef);
        }
        header.clear();
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    addFooterRowDef(footerRowDef) {
        super.addFooterRowDef(footerRowDef);
        this._cachedRowDefs.footer.add(footerRowDef);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    clearFooterRowDefs() {
        const { footer } = this._cachedRowDefs;
        for (const rowDef of Array.from(footer.values())) {
            this.removeFooterRowDef(rowDef);
        }
        footer.clear();
    }
    //#endregion CLEAR-ROW-DEFS
    /**
     * An alias for `_cacheRowDefs()`
     */
    updateRowDefCache() {
        this._cacheRowDefs();
    }
    renderRows() {
        if (this.beforeRenderRows$) {
            this.beforeRenderRows$.next();
        }
        super.renderRows();
        if (this.onRenderRows$) {
            this.onRenderRows$.next(this._rowOutlet);
        }
    }
    pblForceRenderDataRows() {
        try {
            this._forceRenderDataRows();
        }
        catch (ex) {
            this.multiTemplateDataRows = this.multiTemplateDataRows;
        }
    }
    _updateStickyColumnStyles() {
        // We let the parent do the work on rows, it will see 0 columns so then we act.
        super.updateStickyColumnStyles();
        const stickyStartStates = this.extApi.columnApi.visibleColumns.map(c => c.columnDef?.sticky ?? false);
        const stickyEndStates = this.extApi.columnApi.visibleColumns.map(c => c.columnDef?.stickyEnd ?? false);
        const headerRow = this.extApi.rowsApi.findColumnRow('header');
        const footerRow = this.extApi.rowsApi.findColumnRow('footer');
        const rows = this.extApi.rowsApi.dataRows().map(r => r.element);
        if (headerRow) {
            rows.unshift(headerRow.element);
        }
        if (footerRow) {
            rows.push(footerRow.element);
        }
        // internal reset, coming from Dir change
        // It will probably get added to CDK ask well, remove when addedd
        if (this.pblStickyColumnStylesNeedReset) {
            this.pblStickyStyler.clearStickyPositioning(rows, ['left', 'right']);
            this.pblStickyColumnStylesNeedReset = false;
        }
        this.pblStickyStyler.updateStickyColumns(rows, stickyStartStates, stickyEndStates, true);
        // Reset the dirty state of the sticky input change since it has been used.
        this.extApi.columnApi.columns.forEach(c => c.columnDef?.resetStickyChanged());
    }
}
/** @nocollapse */ PblCdkTableComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkTableComponent, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: 'role', attribute: true }, { token: i1$1.Directionality, optional: true }, { token: i0.Injector }, { token: PBL_NGRID_COMPONENT }, { token: EXT_API_TOKEN }, { token: DOCUMENT }, { token: i2.Platform }, { token: _VIEW_REPEATER_STRATEGY }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i3.ViewportRuler }, { token: STICKY_POSITIONING_LISTENER, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblCdkTableComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkTableComponent, selector: "pbl-cdk-table", host: { classAttribute: "pbl-cdk-table" }, providers: [
        { provide: CDK_TABLE, useExisting: PblCdkTableComponent },
        { provide: _VIEW_REPEATER_STRATEGY, useClass: PblNgridCachedRowViewRepeaterStrategy },
        { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
        // Prevent nested tables from seeing this table's StickyPositioningListener.
        { provide: STICKY_POSITIONING_LISTENER, useValue: null },
    ], exportAs: ["pblCdkTable"], usesInheritance: true, ngImport: i0, template: "\n  <ng-content select=\"caption\"></ng-content>\n  <ng-content select=\"colgroup, col\"></ng-content>\n  <ng-container headerRowOutlet></ng-container>\n  <ng-container rowOutlet></ng-container>\n  <ng-container noDataRowOutlet></ng-container>\n  <ng-container footerRowOutlet></ng-container>\n", isInline: true, dependencies: [{ kind: "directive", type: i4.DataRowOutlet, selector: "[rowOutlet]" }, { kind: "directive", type: i4.HeaderRowOutlet, selector: "[headerRowOutlet]" }, { kind: "directive", type: i4.FooterRowOutlet, selector: "[footerRowOutlet]" }, { kind: "directive", type: i4.NoDataRowOutlet, selector: "[noDataRowOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkTableComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-cdk-table',
                    exportAs: 'pblCdkTable',
                    template: CDK_TABLE_TEMPLATE,
                    host: {
                        'class': 'pbl-cdk-table',
                    },
                    providers: [
                        { provide: CDK_TABLE, useExisting: PblCdkTableComponent },
                        { provide: _VIEW_REPEATER_STRATEGY, useClass: PblNgridCachedRowViewRepeaterStrategy },
                        { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
                        // Prevent nested tables from seeing this table's StickyPositioningListener.
                        { provide: STICKY_POSITIONING_LISTENER, useValue: null },
                    ],
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['role']
                }] }, { type: i1$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.Injector }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.Platform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_VIEW_REPEATER_STRATEGY]
                }] }, { type: i4._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [STICKY_POSITIONING_LISTENER]
                }] }]; } });

class PblNgridColumnWidthCalc {
    constructor(extApi) {
        this.extApi = extApi;
        this.onWidthCalc = new Subject();
        this.columnStore = extApi.columnStore;
        this.dynamicColumnWidth = new DynamicColumnWidthLogic(DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY, extApi.getDirection());
        extApi.directionChange()
            .pipe(takeUntil(extApi.events.pipe(ON_DESTROY)))
            .subscribe(dir => this.dynamicColumnWidth.dir = dir);
        extApi.events.pipe(ON_DESTROY).subscribe(() => this.onWidthCalc.complete());
        extApi.onInit(() => this.listenToResize());
    }
    /**
     * Updates the column sizes for all columns in the grid based on the column definition metadata for each column.
     * The final width represent a static width, it is the value as set in the definition (except column without width, where the calculated global width is set).
     */
    resetColumnsWidth() {
        resetColumnWidths(this.columnStore.getStaticWidth(), this.columnStore.visibleColumns, this.columnStore.metaColumns);
    }
    calcColumnWidth(columns) {
        if (!columns) {
            columns = this.columnStore.visibleColumns;
        }
        // protect from per-mature resize.
        // Will happen on additional header/header-group rows AND ALSO when vScrollNone is set
        // This will cause size not to populate because it takes time to render the rows, since it's not virtual and happens immediately.
        // TODO: find a better protection.
        if (!columns[0]?.sizeInfo) {
            return;
        }
        // stores and calculates width for columns added to it. Aggregate's the total width of all added columns.
        const rowWidth = this.dynamicColumnWidth;
        rowWidth.reset();
        this.syncColumnGroupsSize();
        // if this is a grid without groups
        if (rowWidth.minimumRowWidth === 0) {
            // - We filter at the end because on add column we will have a column that still didn't get the resize event hence not having the size info
            // We will ignore it because once it will get it a new resize event is triggered
            rowWidth.addGroup(columns.map(c => c.sizeInfo).filter(c => !!c));
        }
        // if the max lock state has changed we need to update re-calculate the static width's again.
        if (rowWidth.maxWidthLockChanged) {
            this.resetColumnsWidth();
            this.calcColumnWidth(columns);
            return;
        }
        this.onWidthCalc.next(rowWidth);
    }
    /**
     * Update the size of all group columns in the grid based on the size of their visible children (not hidden).
     * @param dynamicWidthLogic - Optional logic container, if not set a new one is created.
     */
    syncColumnGroupsSize() {
        // From all meta columns (header/footer/headerGroup) we filter only `headerGroup` columns.
        // For each we calculate it's width from all of the columns that the headerGroup "groups".
        // We use the same strategy and the same RowWidthDynamicAggregator instance which will prevent duplicate calculations.
        // Note that we might have multiple header groups, i.e. same columns on multiple groups with different row index.
        for (const g of this.columnStore.getAllHeaderGroup()) {
            // - We go over all columns because g.columns does not represent the current owned columns of the group it is static, representing the initial state.
            // Only columns hold their group owners.
            // - We filter at the end because on add column we will have a column that still didn't get the resize event hence not having the size info
            // We will ignore it because once it will get it a new resize event is triggered
            // TODO: find way to improve iteration
            const colSizeInfos = this.columnStore.visibleColumns.filter(c => !c.hidden && c.isInGroup(g)).map(c => c.sizeInfo).filter(c => !!c);
            if (colSizeInfos.length > 0) {
                const groupWidth = this.dynamicColumnWidth.addGroup(colSizeInfos);
                g.minWidth = groupWidth;
                g.updateWidth(`${groupWidth}px`);
            }
            else {
                g.minWidth = undefined;
                g.updateWidth(`0px`);
            }
        }
    }
    listenToResize() {
        const { element } = this.extApi;
        let resizeObserver;
        const ro$ = fromEventPattern(handler => {
            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(handler);
                resizeObserver.observe(element);
            }
        }, handler => {
            if (resizeObserver) {
                resizeObserver.unobserve(element);
                resizeObserver.disconnect();
                resizeObserver = undefined;
            }
        });
        // Skip the first emission
        // Debounce all resizes until the next complete animation frame without a resize
        // finally maps to the entries collection
        // SKIP:  We should skip the first emission (`skip(1)`) before we debounce, since its called upon calling "observe" on the resizeObserver.
        //        The problem is that some grid might require this because they do change size.
        //        An example is a grid in a mat-tab that is hidden, the grid will hit the resize one when we focus the tab
        //        which will require a resize handling because it's initial size is 0
        //        To workaround this, we only skip elements not yet added to the DOM, which means they will not trigger a resize event.
        let skipValue = document.body.contains(element) ? 1 : 0;
        ro$
            .pipe(skip(skipValue), debounceTime(0, animationFrameScheduler), takeUntil(this.extApi.events.pipe(ON_DESTROY)))
            .subscribe((args) => {
            if (skipValue === 0) {
                skipValue = 1;
                this.extApi.columnStore.visibleColumns.forEach(c => c.sizeInfo.updateSize());
            }
            this.onResize(args[0]);
        });
    }
    onResize(entries) {
        this.extApi.viewport?.checkViewportSize();
        this.calcColumnWidth();
    }
}

function noDataViewLogicap(extApi) {
    let noDateEmbeddedVRef;
    const logicap = (force) => {
        if (noDateEmbeddedVRef) {
            extApi.grid.removeView(noDateEmbeddedVRef, 'beforeContent');
            noDateEmbeddedVRef = undefined;
            logicap.viewActive = false;
        }
        if (force === false) {
            return;
        }
        const noData = extApi.grid.ds && extApi.grid.ds.renderLength === 0;
        if (noData) {
            extApi.grid.addClass('pbl-ngrid-empty');
        }
        else {
            extApi.grid.removeClass('pbl-ngrid-empty');
        }
        if (noData || force === true) {
            const noDataTemplate = extApi.registry.getSingle('noData');
            if (noDataTemplate) {
                noDateEmbeddedVRef = extApi.grid.createView('beforeContent', noDataTemplate.tRef, { $implicit: extApi.grid }, 0);
                logicap.viewActive = true;
            }
        }
    };
    return logicap;
}

/**
 * Listens to registry changes and update the grid
 * Must run when the grid in at content init
 */
function bindRegistryLogicap(extApi) {
    return () => {
        // no need to unsubscribe, the reg service is per grid instance and it will destroy when this grid destroy.
        // Also, at this point initial changes from templates provided in the content are already inside so they will not trigger
        // the order here is very important, because component top of this grid will fire life cycle hooks AFTER this component
        // so if we have a top level component registering a template on top it will not show unless we listen.
        extApi.registry.changes
            .subscribe(changes => {
            let gridCell = false;
            let headerFooterCell = false;
            for (const c of changes) {
                switch (c.type) {
                    case 'tableCell':
                        gridCell = true;
                        break;
                    case 'headerCell':
                    case 'footerCell':
                        headerFooterCell = true;
                        break;
                    case 'noData':
                        extApi.logicaps.noData();
                        break;
                    case 'paginator':
                        extApi.logicaps.pagination();
                        break;
                }
            }
            if (gridCell) {
                extApi.columnStore.attachCustomCellTemplates();
            }
            if (headerFooterCell) {
                extApi.columnStore.attachCustomHeaderCellTemplates();
            }
        });
    };
}

function paginationViewLogicap(extApi) {
    const paginationKillKey = 'pblPaginationKillKey';
    let paginatorEmbeddedVRef;
    return () => {
        const ds = extApi.grid.ds;
        const usePagination = ds && extApi.grid.usePagination;
        if (usePagination) {
            ds.pagination = extApi.grid.usePagination || false;
            if (ds.paginator) {
                ds.paginator.noCacheMode = extApi.grid.noCachePaginator;
            }
        }
        if (extApi.grid.isInit) {
            unrx.kill(extApi.grid, paginationKillKey);
            if (paginatorEmbeddedVRef) {
                extApi.grid.removeView(paginatorEmbeddedVRef, 'beforeContent');
                paginatorEmbeddedVRef = undefined;
            }
            if (usePagination) {
                const paginatorTemplate = extApi.registry.getSingle('paginator');
                if (paginatorTemplate) {
                    paginatorEmbeddedVRef = extApi.grid.createView('beforeContent', paginatorTemplate.tRef, { $implicit: extApi.grid });
                }
            }
        }
    };
}

function logicap(extApi) {
    return {
        bindRegistry: bindRegistryLogicap(extApi),
        noData: noDataViewLogicap(extApi),
        pagination: paginationViewLogicap(extApi),
    };
}

function createApis(grid, tokens) {
    return new InternalExtensionApi(grid, tokens);
}
class InternalExtensionApi {
    constructor(grid, tokens) {
        this.grid = grid;
        this.propChanged = this._propChanged = new Subject();
        this.config = tokens.config;
        this.registry = tokens.registry;
        this.element = tokens.elRef.nativeElement;
        if (tokens.dir) {
            this.dir = tokens.dir;
        }
        const { plugin, init } = this.createPlugin(tokens);
        this._create = init;
        this.plugin = plugin;
        this.events = plugin.events;
        this.columnStore = new PblColumnStore(this, tokens.injector.get(IterableDiffers));
        this.widthCalc = new PblNgridColumnWidthCalc(this);
        const cellFactory = tokens.injector.get(PblNgridCellFactoryResolver);
        this.rowsApi = new PblRowsApi(this, tokens.ngZone, cellFactory);
        this.columnApi = ColumnApi.create(this);
        this._contextApi = new ContextApi(this);
        this.logicaps = logicap(this);
        bindGridToDataSource(this);
        this.events.pipe(ON_DESTROY).subscribe(e => this._propChanged.complete());
        this.widthCalc
            .onWidthCalc
            .subscribe(rowWidth => {
            this._cdkTable.minWidth = rowWidth.minimumRowWidth;
            tokens.ngZone.run(() => {
                this.rowsApi.syncRows('header');
                this.plugin.emitEvent({ source: 'grid', kind: 'onResizeRow' });
            });
        });
    }
    get cdkTable() { return this._cdkTable; }
    get contextApi() { return this._contextApi || (this._contextApi = new ContextApi(this)); }
    get viewport() { return this._viewPort; }
    get pluginCtrl() { return this.plugin.controller; }
    getDirection() {
        return this.dir?.value ?? 'ltr';
    }
    directionChange() {
        return this.dir?.change.asObservable() ?? EMPTY;
    }
    onConstructed(fn) {
        if (!this._create) {
            of(false);
        }
        else {
            this.events.pipe(ON_CONSTRUCTED).subscribe(fn);
        }
    }
    onInit(fn) {
        this.plugin.controller.onInit().subscribe(fn);
    }
    setCdkTable(cdkTable) {
        this._cdkTable = cdkTable;
        const globalCreateEvent = this._create;
        delete this._create;
        this.plugin.emitEvent({ source: 'grid', kind: 'onConstructed' });
        globalCreateEvent();
    }
    setViewport(viewport) {
        this._viewPort = viewport;
    }
    notifyPropChanged(source, key, prev, curr) {
        if (prev !== curr) {
            this._propChanged.next({ source, key, prev, curr });
        }
    }
    createPlugin(tokens) {
        // Create an injector for the extensions/plugins
        // This injector allow plugins (that choose so) to provide a factory function for runtime use.
        // I.E: as if they we're created by angular via template...
        // This allows seamless plugin-to-plugin dependencies without requiring specific template syntax.
        // And also allows auto plugin binding (app wide) without the need for template syntax.
        const pluginInjector = Injector.create({
            providers: [
                { provide: ViewContainerRef, useValue: tokens.vcRef },
                { provide: ElementRef, useValue: tokens.elRef },
                { provide: ChangeDetectorRef, useValue: tokens.cdRef },
            ],
            parent: tokens.injector,
        });
        return PblNgridPluginContext.create(pluginInjector, this);
    }
}

class PblNgridBaseVirtualScrollDirective {
    constructor(grid, type) {
        this.grid = grid;
        this.type = type;
        this._maxBufferPx = 200;
        this._minBufferPx = 100;
    }
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     *
     * Default: 100
     */
    get minBufferPx() { return this._minBufferPx; }
    set minBufferPx(value) { this._minBufferPx = coerceNumberProperty(value); }
    /**
     * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
     *
     * Default: 200
     */
    get maxBufferPx() { return this._maxBufferPx; }
    set maxBufferPx(value) { this._maxBufferPx = coerceNumberProperty(value); }
    get wheelMode() { return this._wheelMode; }
    set wheelMode(value) {
        switch (value) {
            case 'passive':
            case 'blocking':
                this._wheelMode = value;
                break;
            default:
                const wheelMode = coerceNumberProperty(value);
                if (wheelMode && wheelMode >= 1 && wheelMode <= 60) {
                    this._wheelMode = wheelMode;
                }
                break;
        }
    }
    get scrolledIndexChange() { return this._scrollStrategy.scrolledIndexChange; }
    set scrolledIndexChange(value) { this._scrollStrategy.scrolledIndexChange = value; }
    attachExtApi(extApi) { this._scrollStrategy.attachExtApi(extApi); }
    attach(viewport) { this._scrollStrategy.attach(viewport); }
    detach() { this._scrollStrategy.detach(); }
    onContentScrolled() { this._scrollStrategy.onContentScrolled(); }
    onDataLengthChanged() { this._scrollStrategy.onDataLengthChanged(); }
    onContentRendered() { this._scrollStrategy.onContentRendered(); }
    onRenderedOffsetChanged() { this._scrollStrategy.onRenderedOffsetChanged(); }
    scrollToIndex(index, behavior) { this._scrollStrategy.scrollToIndex(index, behavior); }
}

function resolveScrollStrategy(config, scrollStrategy, fallback) {
    if (!scrollStrategy && config.has('virtualScroll')) {
        const virtualScrollConfig = config.get('virtualScroll');
        if (typeof virtualScrollConfig.defaultStrategy === 'function') {
            scrollStrategy = virtualScrollConfig.defaultStrategy();
        }
    }
    return scrollStrategy || fallback();
}
/**
 * Returns the split range from an aggregated range.
 * An aggregated range describes the range of header, data and footer rows currently in view.
 * This function will split the range into core section, each having it's own range.
 *
 * Note that an aggregated range can span over a single section, all sections or just 2 sections.
 * If a section is not part of the aggregated range it's range is invalid, i.e: ListRange.start >= ListRange.end.
 *
 * @param range The aggregated range
 * @param headerLen The total length of header rows in the grid
 * @param dataLen The total length of data rows in the grid
 * @returns A tuple containing the ranges [header, data, footer].
 */
function splitRange(range, headerLen, dataLen) {
    return [
        { start: range.start, end: headerLen },
        { start: Math.max(0, range.start - headerLen), end: Math.max(0, range.end - headerLen) },
        { start: 0, end: Math.max(0, range.end - (dataLen + headerLen)) },
    ];
}
/**
 * Update sticky positioning values to the rows to match virtual scroll content offset.
 * This function should run after `CdkTable` updated the sticky rows.
 *
 * ## Why
 * `CdkTable` applies sticky positioning to rows by setting top/bottom value to `0px`.
 * Virtual scroll use's a container with an offset to simulate the scrolling.
 *
 * The 2 does not work together, the virtual scroll offset will throw the sticky row out of bound, thus the top/bottom value must be compensated
 * based on the offset.
 */
function updateStickyRows(offset, rows, stickyState, type) {
    const coeff = type === 'top' ? -1 : 1;
    let agg = 0;
    if (coeff === 1) {
        rows = rows.slice().reverse();
    }
    for (const i in rows) {
        if (stickyState[i]) {
            const row = rows[i];
            row.style[type] = `${coeff * (offset + (coeff * agg))}px`;
            agg += row.getBoundingClientRect().height; // TODO: cache this and update cache actively (size change)
            row.style.display = null;
        }
    }
}
/**
 * Measures the combined size (width for horizontal orientation, height for vertical) of all items
 * in the specified view within the specified range.
 * Throws an error if the range includes items that are not currently rendered.
 *
 * > This is function is identical to `CdkVirtualForOf.measureRangeSize` with minor adjustments
 */
function measureRangeSize(viewContainer, range, renderedRange, stickyState = []) {
    if (range.start >= range.end) {
        return 0;
    }
    if (range.start < renderedRange.start || range.end > renderedRange.end) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw Error(`Attempt to measure an item that isn't rendered.`);
        }
        return;
    }
    // The index into the list of rendered views for the first item in the range.
    const renderedStartIndex = range.start - renderedRange.start;
    // The length of the range we're measuring.
    const rangeLen = range.end - range.start;
    // Loop over all the views, find the first and land node and compute the size by subtracting
    // the top of the first node from the bottom of the last one.
    let firstNode;
    let lastNode;
    // Find the first node by starting from the beginning and going forwards.
    for (let i = 0; i < rangeLen; i++) {
        const view = viewContainer.get(i + renderedStartIndex);
        if (view && view.rootNodes.length) {
            firstNode = lastNode = view.rootNodes[0];
            break;
        }
    }
    // Find the last node by starting from the end and going backwards.
    for (let i = rangeLen - 1; i > -1; i--) {
        const view = viewContainer.get(i + renderedStartIndex);
        if (view && view.rootNodes.length) {
            lastNode = view.rootNodes[view.rootNodes.length - 1];
            break;
        }
    }
    return firstNode && lastNode ? getOffset('end', lastNode) - getOffset('start', firstNode) : 0;
}
/** Helper to extract the offset of a DOM Node in a certain direction. */
function getOffset(direction, node) {
    const el = node;
    if (!el.getBoundingClientRect) {
        return 0;
    }
    const rect = el.getBoundingClientRect();
    return direction === 'start' ? rect.top : rect.bottom;
}
function calculateBrowserPxLimit() {
    try {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = '9999999999999999px';
        document.body.appendChild(div);
        const size = Math.abs(div.getBoundingClientRect().top) * 0.85;
        document.body.removeChild(div);
        // We return 85% of the limit, rounded down to the closes million.
        // E.G: if the limit is 33,554,428 then 85% is 28,521,263.8 which is rounded down to 28,000,000
        return size - (size % 1000000);
    }
    catch (err) {
        // TODO: Either return null, or return a value based on the browser implementation which we might get as a param.
        return 10000000;
    }
}

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
class MetaRowStickyScroll {
    constructor(viewport, viewPortEl, metaRows) {
        this.viewport = viewport;
        this.viewPortEl = viewPortEl;
        this.metaRows = metaRows;
        this.runningHeader = false;
        this.runningFooter = false;
        this.canMoveHeader = true;
        this.canMoveFooter = true;
        this.movedFooterRows = [];
        this.movedHeaderRows = [];
    }
    canMove() {
        return this.canMoveHeader || this.canMoveFooter;
    }
    isRunning() {
        return this.runningHeader || this.runningFooter;
    }
    move(offset, viewPortElRect) {
        this.moveHeader(offset, viewPortElRect);
        this.moveFooter(offset, viewPortElRect);
        return this.isRunning() && !this.canMoveHeader && !this.canMoveFooter;
    }
    restore(renderedContentOffset) {
        const { header, footer } = this.metaRows;
        if (this.restoreHeader()) {
            updateStickyRows(renderedContentOffset, header.rows, header.sticky, 'top');
        }
        if (this.restoreFooter()) {
            updateStickyRows(renderedContentOffset, footer.rows, footer.sticky, 'bottom');
        }
    }
    moveHeader(offset, viewPortElRect) {
        if (!this.runningHeader || this.canMoveHeader) {
            this.runningHeader = true;
            this.canMoveHeader = false;
            const stickyAndRendered = [];
            const headerRows = this.metaRows.header;
            let mostTopRect;
            for (let i = 0, len = headerRows.rows.length; i < len; i++) {
                const rowEl = headerRows.rows[i];
                if (headerRows.sticky[i]) {
                    const elRect = rowEl.getBoundingClientRect();
                    if (headerRows.rendered[i]) {
                        const calc = elRect.top - viewPortElRect.top - offset;
                        // if after the scroll the element is still in view, return
                        if (calc >= 0 || -calc < viewPortElRect.height) {
                            this.canMoveHeader = true;
                            return;
                        }
                    }
                    if (!mostTopRect) {
                        mostTopRect = elRect;
                    }
                    stickyAndRendered.push(i);
                }
            }
            if (stickyAndRendered.length) {
                this.viewport.stickyRowHeaderContainer.style.top = mostTopRect.top + 'px';
                this.cloneAndMoveRow(this.viewport.stickyRowHeaderContainer, headerRows.rows, stickyAndRendered, this.movedHeaderRows);
            }
        }
    }
    moveFooter(offset, viewPortElRect) {
        if (!this.runningFooter || this.canMoveFooter) {
            this.runningFooter = true;
            this.canMoveFooter = false;
            const stickyAndRendered = [];
            const footerRows = this.metaRows.footer;
            let mostTopRect;
            for (let i = 0, len = footerRows.rows.length; i < len; i++) {
                const rowEl = footerRows.rows[i];
                if (footerRows.sticky[i]) {
                    const elRect = rowEl.getBoundingClientRect();
                    if (footerRows.rendered[i]) {
                        const calc = elRect.bottom - viewPortElRect.bottom + offset;
                        // if after the scroll the element is still in view, return
                        if (calc >= 0 && calc < viewPortElRect.height) {
                            this.canMoveFooter = true;
                            return;
                        }
                    }
                    mostTopRect = elRect;
                    stickyAndRendered.push(i);
                }
            }
            if (stickyAndRendered.length) {
                this.viewport.stickyRowFooterContainer.style.bottom = `calc(100% - ${mostTopRect.bottom}px)`;
                this.cloneAndMoveRow(this.viewport.stickyRowFooterContainer, footerRows.rows, stickyAndRendered, this.movedFooterRows);
            }
        }
    }
    restoreHeader() {
        if (this.runningHeader) {
            const movedHeaderRows = this.movedHeaderRows;
            this.movedHeaderRows = [];
            this.restoreRows(movedHeaderRows, this.metaRows.header.rows);
            this.runningHeader = false;
            this.canMoveHeader = true;
            return true;
        }
        return false;
    }
    restoreFooter() {
        if (this.runningFooter) {
            const movedFooterRows = this.movedFooterRows;
            this.movedFooterRows = [];
            this.restoreRows(movedFooterRows, this.metaRows.footer.rows);
            this.runningFooter = false;
            this.canMoveFooter = true;
            return true;
        }
        return false;
    }
    cloneAndMoveRow(stickyRowContainer, rows, stickyAndRendered, restoreRef) {
        const innerRowContainer = stickyRowContainer.firstElementChild;
        stickyRowContainer.style.width = this.viewport.innerWidth + 'px';
        innerRowContainer.style.transform = `translateX(-${this.viewPortEl.scrollLeft}px)`;
        for (const i of stickyAndRendered) {
            const rowEl = rows[i];
            const clone = rowEl.cloneNode();
            clone.style.width = '0';
            rowEl.style.top = rowEl.style.bottom = rowEl.style.position = '';
            rowEl.parentElement.insertBefore(clone, rowEl);
            innerRowContainer.appendChild(rowEl);
            restoreRef.push([rowEl, clone, i]);
            // Assign the clone to be the sticky row element, this will ensure that stick row updates
            // will set the `top` on an actual element in the viewport, thus updating with each layout reflow.
            // if not set, when we return the original row it's `top` value will be true but will not show because it will not trigger a reflow.
            rows[i] = clone;
        }
    }
    restoreRows(restoreRef, rows) {
        for (const [rowEl, clone, index] of restoreRef) {
            rowEl.style.position = clone.style.position;
            rowEl.style.zIndex = clone.style.zIndex;
            rowEl.style.top = clone.style.top;
            rowEl.style.bottom = clone.style.bottom;
            clone.parentElement.insertBefore(rowEl, clone);
            clone.parentElement.removeChild(clone);
            rows[index] = rowEl;
        }
    }
}

function sortByIndex(a, b) { return a.index - b.index; }
;
class PblVirtualScrollForOf {
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
function createScrollWatcherFn(vScrollViewport) {
    let scrolling = 0;
    let lastOffset = vScrollViewport.measureScrollOffset();
    return () => {
        /*  `scrolling` is a boolean flag that turns on with the first `scroll` events and ends after 2 browser animation frames have passed without a `scroll` event.
            This is an attempt to detect a scroll end event, which does not exist.
    
            `scrollFrameRate` is a number that represent a rough estimation of the frame rate by measuring the time passed between each request animation frame
            while the `scrolling` state is true. The frame rate value is the average frame rate from all measurements since the scrolling began.
            To estimate the frame rate, a significant number of measurements is required so value is emitted every 500 ms.
            This means that a single scroll or short scroll bursts will not result in a `scrollFrameRate` emissions.
    
        */
        if (scrolling === 0) {
            /*  The measure array holds values required for frame rate measurements.
                [0] Storage for last timestamp taken
                [1] The sum of all measurements taken (a measurement is the time between 2 snapshots)
                [2] The count of all measurements
                [3] The sum of all measurements taken WITHIN the current buffer window. This buffer is flushed into [1] every X ms (see buggerWindow const).
            */
            const bufferWindow = 499;
            const measure = [performance.now(), 0, 0, 0];
            const offset = vScrollViewport.measureScrollOffset();
            if (lastOffset === offset) {
                return;
            }
            const delta = lastOffset < offset ? 1 : -1;
            vScrollViewport.scrolling.next(delta);
            const raf = () => {
                const time = -measure[0] + (measure[0] = performance.now());
                if (time > 5) {
                    measure[1] += time;
                    measure[2] += 1;
                }
                if (scrolling === -1) {
                    scrolling = 0;
                    lastOffset = vScrollViewport.measureScrollOffset();
                    vScrollViewport.scrolling.next(0);
                }
                else {
                    if (measure[1] > bufferWindow) {
                        measure[3] += measure[1];
                        measure[1] = 0;
                        vScrollViewport.scrollFrameRate.emit(1000 / (measure[3] / measure[2]));
                    }
                    scrolling = scrolling === 1 ? -1 : 1;
                    requestAnimationFrame(raf);
                }
            };
            requestAnimationFrame(raf);
        }
        scrolling++;
    };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A class that tracks the size of items that have been seen and uses it to estimate the average
 * item size.
 */
class ItemSizeAverager {
    /** @param defaultItemSize The default size to use for items when no data is available. */
    constructor(defaultItemSize = 50) {
        /** The total amount of weight behind the current average. */
        this._totalWeight = 0;
        this._defaultItemSize = defaultItemSize;
        this._averageItemSize = defaultItemSize;
    }
    /** Returns the average item size. */
    getAverageItemSize() {
        return this._averageItemSize;
    }
    /**
     * Adds a measurement sample for the estimator to consider.
     * @param range The measured range.
     * @param size The measured size of the given range in pixels.
     */
    addSample(range, size) {
        const newTotalWeight = this._totalWeight + range.end - range.start;
        if (newTotalWeight) {
            const newAverageItemSize = (size + this._averageItemSize * this._totalWeight) / newTotalWeight;
            if (newAverageItemSize) {
                this._averageItemSize = newAverageItemSize;
                this._totalWeight = newTotalWeight;
            }
        }
    }
    /** Resets the averager. */
    reset() {
        this._averageItemSize = this._defaultItemSize;
        this._totalWeight = 0;
    }
}
/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
class AutoSizeVirtualScrollStrategy {
    /**
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     *     If the amount of buffer dips below this number, more items will be rendered.
     * @param maxBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
     *     If the actual amount turns out to be less it will not necessarily trigger an additional
     *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
     * @param averager The averager used to estimate the size of unseen items.
     */
    constructor(minBufferPx, maxBufferPx, averager = new ItemSizeAverager()) {
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = new Observable(() => {
            // TODO(mmalerba): Implement.
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw Error('cdk-virtual-scroll: scrolledIndexChange is currently not supported for the' +
                    ' autosize scroll strategy');
            }
        });
        /** The attached viewport. */
        this._viewport = null;
        /**
         * The number of consecutive cycles where removing extra items has failed. Failure here means that
         * we estimated how many items we could safely remove, but our estimate turned out to be too much
         * and it wasn't safe to remove that many elements.
         */
        this._removalFailures = 0;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._averager = averager;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport) {
        this._averager.reset();
        this._viewport = viewport;
        this._renderContentForCurrentOffset();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._viewport = null;
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        if (this._viewport) {
            this._updateRenderedContentAfterScroll();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        if (this._viewport) {
            this._renderContentForCurrentOffset();
            this._checkRenderedContentSize();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() {
        if (this._viewport) {
            this._checkRenderedContentSize();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() {
        if (this._viewport) {
            this._checkRenderedContentOffset();
        }
    }
    /** Scroll to the offset for the given index. */
    scrollToIndex() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // TODO(mmalerba): Implement.
            throw Error('cdk-virtual-scroll: scrollToIndex is currently not supported for the autosize'
                + ' scroll strategy');
        }
    }
    /**
     * Update the buffer parameters.
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     * @param maxBufferPx The number of buffer items to render beyond the edge of the viewport (in
     *     pixels).
     */
    updateBufferSize(minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx) {
            throw ('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /** Update the rendered content after the user scrolls. */
    _updateRenderedContentAfterScroll() {
        const viewport = this._viewport;
        // The current scroll offset.
        const scrollOffset = viewport.measureScrollOffset();
        // The delta between the current scroll offset and the previously recorded scroll offset.
        let scrollDelta = scrollOffset - this._lastScrollOffset;
        // The magnitude of the scroll delta.
        let scrollMagnitude = Math.abs(scrollDelta);
        // The currently rendered range.
        const renderedRange = viewport.getRenderedRange();
        // If we're scrolling toward the top, we need to account for the fact that the predicted amount
        // of content and the actual amount of scrollable space may differ. We address this by slowly
        // correcting the difference on each scroll event.
        let offsetCorrection = 0;
        if (scrollDelta < 0) {
            // The content offset we would expect based on the average item size.
            const predictedOffset = renderedRange.start * this._averager.getAverageItemSize();
            // The difference between the predicted size of the unrendered content at the beginning and
            // the actual available space to scroll over. We need to reduce this to zero by the time the
            // user scrolls to the top.
            // - 0 indicates that the predicted size and available space are the same.
            // - A negative number that the predicted size is smaller than the available space.
            // - A positive number indicates the predicted size is larger than the available space
            const offsetDifference = predictedOffset - this._lastRenderedContentOffset;
            // The amount of difference to correct during this scroll event. We calculate this as a
            // percentage of the total difference based on the percentage of the distance toward the top
            // that the user scrolled.
            offsetCorrection = Math.round(offsetDifference *
                Math.max(0, Math.min(1, scrollMagnitude / (scrollOffset + scrollMagnitude))));
            // Based on the offset correction above, we pretend that the scroll delta was bigger or
            // smaller than it actually was, this way we can start to eliminate the difference.
            scrollDelta = scrollDelta - offsetCorrection;
            scrollMagnitude = Math.abs(scrollDelta);
        }
        // The current amount of buffer past the start of the viewport.
        const startBuffer = this._lastScrollOffset - this._lastRenderedContentOffset;
        // The current amount of buffer past the end of the viewport.
        const endBuffer = (this._lastRenderedContentOffset + this._lastRenderedContentSize) -
            (this._lastScrollOffset + viewport.getViewportSize());
        // The amount of unfilled space that should be filled on the side the user is scrolling toward
        // in order to safely absorb the scroll delta.
        const underscan = scrollMagnitude + this._minBufferPx -
            (scrollDelta < 0 ? startBuffer : endBuffer);
        // Check if there's unfilled space that we need to render new elements to fill.
        if (underscan > 0) {
            // Check if the scroll magnitude was larger than the viewport size. In this case the user
            // won't notice a discontinuity if we just jump to the new estimated position in the list.
            // However, if the scroll magnitude is smaller than the viewport the user might notice some
            // jitteriness if we just jump to the estimated position. Instead we make sure to scroll by
            // the same number of pixels as the scroll magnitude.
            if (scrollMagnitude >= viewport.getViewportSize()) {
                this._renderContentForCurrentOffset();
            }
            else {
                // The number of new items to render on the side the user is scrolling towards. Rather than
                // just filling the underscan space, we actually fill enough to have a buffer size of
                // `maxBufferPx`. This gives us a little wiggle room in case our item size estimate is off.
                const addItems = Math.max(0, Math.ceil((underscan - this._minBufferPx + this._maxBufferPx) /
                    this._averager.getAverageItemSize()));
                // The amount of filled space beyond what is necessary on the side the user is scrolling
                // away from.
                const overscan = (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx +
                    scrollMagnitude;
                // The number of currently rendered items to remove on the side the user is scrolling away
                // from. If removal has failed in recent cycles we are less aggressive in how much we try to
                // remove.
                const unboundedRemoveItems = Math.floor(overscan / this._averager.getAverageItemSize() / (this._removalFailures + 1));
                const removeItems = Math.min(renderedRange.end - renderedRange.start, Math.max(0, unboundedRemoveItems));
                // The new range we will tell the viewport to render. We first expand it to include the new
                // items we want rendered, we then contract the opposite side to remove items we no longer
                // want rendered.
                const range = this._expandRange(renderedRange, scrollDelta < 0 ? addItems : 0, scrollDelta > 0 ? addItems : 0);
                if (scrollDelta < 0) {
                    range.end = Math.max(range.start + 1, range.end - removeItems);
                }
                else {
                    range.start = Math.min(range.end - 1, range.start + removeItems);
                }
                // The new offset we want to set on the rendered content. To determine this we measure the
                // number of pixels we removed and then adjust the offset to the start of the rendered
                // content or to the end of the rendered content accordingly (whichever one doesn't require
                // that the newly added items to be rendered to calculate.)
                let contentOffset;
                let contentOffsetTo;
                if (scrollDelta < 0) {
                    let removedSize = viewport.measureRangeSize({
                        start: range.end,
                        end: renderedRange.end,
                    });
                    // Check that we're not removing too much.
                    if (removedSize <= overscan) {
                        contentOffset =
                            this._lastRenderedContentOffset + this._lastRenderedContentSize - removedSize;
                        this._removalFailures = 0;
                    }
                    else {
                        // If the removal is more than the overscan can absorb just undo it and record the fact
                        // that the removal failed so we can be less aggressive next time.
                        range.end = renderedRange.end;
                        contentOffset = this._lastRenderedContentOffset + this._lastRenderedContentSize;
                        this._removalFailures++;
                    }
                    contentOffsetTo = 'to-end';
                }
                else {
                    const removedSize = viewport.measureRangeSize({
                        start: renderedRange.start,
                        end: range.start,
                    });
                    // Check that we're not removing too much.
                    if (removedSize <= overscan) {
                        contentOffset = this._lastRenderedContentOffset + removedSize;
                        this._removalFailures = 0;
                    }
                    else {
                        // If the removal is more than the overscan can absorb just undo it and record the fact
                        // that the removal failed so we can be less aggressive next time.
                        range.start = renderedRange.start;
                        contentOffset = this._lastRenderedContentOffset;
                        this._removalFailures++;
                    }
                    contentOffsetTo = 'to-start';
                }
                // Set the range and offset we calculated above.
                viewport.setRenderedRange(range);
                viewport.setRenderedContentOffset(contentOffset + offsetCorrection, contentOffsetTo);
            }
        }
        else if (offsetCorrection) {
            // Even if the rendered range didn't change, we may still need to adjust the content offset to
            // simulate scrolling slightly slower or faster than the user actually scrolled.
            viewport.setRenderedContentOffset(this._lastRenderedContentOffset + offsetCorrection);
        }
        // Save the scroll offset to be compared to the new value on the next scroll event.
        this._lastScrollOffset = scrollOffset;
    }
    /**
     * Checks the size of the currently rendered content and uses it to update the estimated item size
     * and estimated total content size.
     */
    _checkRenderedContentSize() {
        const viewport = this._viewport;
        this._lastRenderedContentSize = viewport.measureRenderedContentSize();
        this._averager.addSample(viewport.getRenderedRange(), this._lastRenderedContentSize);
        this._updateTotalContentSize(this._lastRenderedContentSize);
    }
    /** Checks the currently rendered content offset and saves the value for later use. */
    _checkRenderedContentOffset() {
        const viewport = this._viewport;
        this._lastRenderedContentOffset = viewport.getOffsetToRenderedContentStart();
    }
    /**
     * Recalculates the rendered content based on our estimate of what should be shown at the current
     * scroll offset.
     */
    _renderContentForCurrentOffset() {
        const viewport = this._viewport;
        const scrollOffset = viewport.measureScrollOffset();
        this._lastScrollOffset = scrollOffset;
        this._removalFailures = 0;
        const itemSize = this._averager.getAverageItemSize();
        const firstVisibleIndex = Math.min(viewport.getDataLength() - 1, Math.floor(scrollOffset / itemSize));
        const bufferSize = Math.ceil(this._maxBufferPx / itemSize);
        const range = this._expandRange(this._getVisibleRangeForIndex(firstVisibleIndex), bufferSize, bufferSize);
        viewport.setRenderedRange(range);
        viewport.setRenderedContentOffset(itemSize * range.start);
    }
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Gets the visible range of data for the given start index. If the start index is too close to
     * the end of the list it may be backed up to ensure the estimated size of the range is enough to
     * fill the viewport.
     * Note: must not be called if `this._viewport` is null
     * @param startIndex The index to start the range at
     * @return a range estimated to be large enough to fill the viewport when rendered.
     */
    _getVisibleRangeForIndex(startIndex) {
        const viewport = this._viewport;
        const range = {
            start: startIndex,
            end: startIndex +
                Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize())
        };
        const extra = range.end - viewport.getDataLength();
        if (extra > 0) {
            range.start = Math.max(0, range.start - extra);
        }
        return range;
    }
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Expand the given range by the given amount in either direction.
     * Note: must not be called if `this._viewport` is null
     * @param range The range to expand
     * @param expandStart The number of items to expand the start of the range by.
     * @param expandEnd The number of items to expand the end of the range by.
     * @return The expanded range.
     */
    _expandRange(range, expandStart, expandEnd) {
        const viewport = this._viewport;
        const start = Math.max(0, range.start - expandStart);
        const end = Math.min(viewport.getDataLength(), range.end + expandEnd);
        return { start, end };
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize(renderedContentSize) {
        const viewport = this._viewport;
        const renderedRange = viewport.getRenderedRange();
        const totalSize = renderedContentSize +
            (viewport.getDataLength() - (renderedRange.end - renderedRange.start)) *
                this._averager.getAverageItemSize();
        viewport.setTotalContentSize(totalSize);
    }
}

class PblNgridAutoSizeVirtualScrollStrategy extends AutoSizeVirtualScrollStrategy {
    constructor(minBufferPx, maxBufferPx, averager = new PblNgridItemSizeAverager()) {
        super(minBufferPx, maxBufferPx, averager);
        this.averager = averager;
    }
    get type() { return 'vScrollAuto'; }
    attachExtApi(extApi) {
        this.extApi = extApi;
    }
    attach(viewport) {
        if (!this.extApi) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid use of attach, you must first attach `PblNgridExtensionApi`');
            }
        }
        super.attach(viewport);
    }
}
class PblNgridItemSizeAverager extends ItemSizeAverager {
    addSample(range, size) {
        if (this.rowInfo && this.rowInfo.rowLength === 0) {
            this.reset();
        }
        else {
            super.addSample(range, size);
        }
    }
    /**
     * A temp workaround to solve the actual vs wanted rendered row issue in `CdkVirtualScrollViewport`
     *
     * `CdkVirtualScrollViewport.getRenderedRange()` return the rows that the virtual container want's the grid to render
     * however, the actual rendered rows might be different. This is a problem especially in init, when the rendered rows are actually 0
     * but `CdkVirtualScrollViewport.getRenderedRange()` return the initial range of rows that should be rendered. This results in a wrong
     * calculation of the average item size in `ItemSizeAverager`
     *
     * SEE: https://github.com/angular/material2/blob/a9e550e5bf93cd68c342d1a50d8576d8f3812ebe/src/cdk/scrolling/virtual-scroll-viewport.ts#L212-L220
     */
    setRowInfo(rowInfo) {
        this.rowInfo = rowInfo;
    }
}

class RowIntersectionTracker {
    constructor(rootElement, forceManual) {
        const intersectionChanged = this.intersectionChanged = new Subject();
        if (!forceManual && !!IntersectionObserver) {
            this.intersectionObserver = new IntersectionObserver(entries => intersectionChanged.next(entries), {
                root: rootElement,
                rootMargin: '0px',
                threshold: 0.0,
            });
        }
    }
    get observerMode() { return !!this.intersectionObserver; }
    snapshot() {
        return this.intersectionObserver?.takeRecords() ?? [];
    }
    track(element) {
        this.intersectionObserver?.observe(element);
    }
    untrack(element) {
        this.intersectionObserver?.unobserve(element);
    }
    destroy() {
        this.intersectionChanged.complete();
        this.intersectionObserver?.disconnect();
    }
}

/**
 * Logic for height paging:
 *
 * The whole logic is here to workaround browser issues with PX limit.
 * With virtual scroll we simulate the height by rendering a small viewport size box that inside
 * we create a fake element that simulate the height of the total items we need to render.
 * When the user scrolls we calculate the items that should be rendered for that scroll position.
 *
 * This is ok, until we reach a limit of maximum height/width a browser can handle which is implementation based.
 * Chrome will break on 34m PX, same for safari but firefox (OSX) it's 17m.
 *
 * What paging does is set a fixed height, which is below the limit of the browser.
 * Then fit the total height required into the fixed height we defined using math.
 *
 * This is done via pages. We split the scroll area into pages, each page we go over will offset the scroll bar a bit
 * to compensate for the gap between the total height and the fixed height.
 *
 * For example, if the total items height is 1000px and the fixed height is 600px, we have a 400px height to compensate while scrolling.
 * If we have 11 pages, that's 10 pages we swap, each swap should compensate 40px so we will in total compensate 400px.
 * When the user scroll's down and reaches the "page" we slightly shift the scroll bar up 40px, giving us 40px more to scroll down, 10 times like this and we get 400px additional scroll area
 * which is what we need for all of our items.
 *
 * This is the theory, in practice this depends on the scroll delta, on large scrolls we can't change the actual scroll position, we just recalculate the current page/offset
 * On small delta's we do calculate and if a fix is required we will do it.
 *
 * This "fix" only happen when the scroll position + delta moves us from a page to the next/prev page.
 * Since we're talking large scale here, the pages are quite big so getting to that point should be rare.
 *
 * The logic here is incomplete, especially when switching from location based calculation where we set the page/offset based on the scroll offset
 * To page based calculation where we calculate the location (scroll offset) based on the page/offset we're in.
 *
 * The 2 methods can't work together because if you do a paged based calc you push the scroll offset which will reflect on the next location based calc.
 *
 * The 2 methods run based on the scroll delta, on large scroll gaps we want to do location based calc because we don't really scroll it might be wheel but also might be dragging the bar.
 * On small incremental wheel events we want to determine when the page shifts.
 *
 * In general, we want to have lower page height which means more offset points.
 * This means more places where the user can "see" these jumps but each jump is minimal.
 * However, if we do large page height, less jumps, we probably be in a situation where the user never see these jumps.
 * The problem is, when the jumps occurs the whole math is useless, and this happens on MOST up scrolls.
 *
 * This is to say, we need to refactor this process to use only one method and find the sweet spot for the page height.
 * Maybe 3 X ViewPort size...
 */
// const LOG = msg => console.log(msg) ;
/* Height limits: Chrome,  Safari: ~34m | FireFox: ~17m
*/
const MAX_SCROLL_HEIGHT = calculateBrowserPxLimit();
class VirtualScrollHightPaging {
    constructor(viewport) {
        this.viewport = viewport;
        this.afterToEnd = false;
        this.active = false;
        this.activeChanged = new Subject();
        const onContentScrolled = viewport.pblScrollStrategy.onContentScrolled;
        viewport.pblScrollStrategy.onContentScrolled = () => {
            if (this.active) {
                const scrollOffset = viewport.element.scrollTop;
                const delta = scrollOffset - this.prevScrollOffset;
                const viewportSize = delta > 0 ? viewport.getViewportSize() : 80;
                if (Math.abs(delta) > viewportSize) {
                    // LOG(`DELTA#BEFORE ${scrollOffset} - ${this.page}`);
                    this.page = Math.floor(scrollOffset * ((this.totalHeight - viewportSize) / (MAX_SCROLL_HEIGHT - viewportSize)) * (1 / this.pageHeight));
                    // LOG(`DELTA ${scrollOffset} - ${this.page}`);
                    this.offset = Math.round(this.page * this.coff);
                    this.prevScrollOffset = scrollOffset;
                }
                else if (this.prevScrollOffset !== scrollOffset) {
                    // next page
                    if (delta > 0 && scrollOffset + this.offset > (this.page + 1) * this.pageHeight) {
                        // LOG(`NEXT ${scrollOffset}`);
                        this.page += 1;
                        this.offset += this.coff;
                        viewport.element.scrollTop = this.prevScrollOffset = Math.floor(scrollOffset - this.coff);
                        // LOG(`NEXT# 2 ${viewport.element.scrollTop}`);
                        return;
                    }
                    // prev page
                    else if (delta < 0 && scrollOffset + this.offset < this.page * this.pageHeight) {
                        // LOG(`PREV ${scrollOffset}`);
                        this.page -= 1;
                        this.offset -= this.coff;
                        viewport.element.scrollTop = this.prevScrollOffset = Math.floor(scrollOffset + this.coff);
                        // LOG(`PREV# 2 ${viewport.element.scrollTop}`);
                        return;
                    }
                    else {
                        // LOG(`SKIP ${scrollOffset}`);
                        this.prevScrollOffset = scrollOffset;
                    }
                }
            }
            onContentScrolled.call(viewport.pblScrollStrategy);
        };
    }
    transformScrollOffset(originalOffset) {
        return originalOffset + (this.active ? this.offset : 0);
    }
    transformOffsetToRenderedContentStart(originalRenderContentStart) {
        return (!originalRenderContentStart || !this.active)
            ? originalRenderContentStart
            : originalRenderContentStart + this.offset;
    }
    transformRenderedContentOffset(offset, to = 'to-start') {
        if (this.active) {
            if (!this.afterToEnd) {
                offset -= this.offset;
            }
            this.afterToEnd = to === 'to-end';
        }
        return offset;
    }
    transformTotalContentSize(totalHeight, scrollOffset) {
        const wasActive = !!this.active;
        if (totalHeight <= MAX_SCROLL_HEIGHT) {
            this.active = false;
        }
        else if (this.totalHeight !== totalHeight) {
            this.active = true;
            this.totalHeight = totalHeight;
            this.pageHeight = MAX_SCROLL_HEIGHT / 100;
            this.pageCount = Math.ceil(totalHeight / this.pageHeight);
            this.coff = Math.floor((totalHeight - MAX_SCROLL_HEIGHT) / (this.pageCount - 1));
            this.prevScrollOffset = scrollOffset;
            this.offset = this.offset || 0;
            this.page = this.page || 0;
            this.afterToEnd = !!this.afterToEnd;
            totalHeight = MAX_SCROLL_HEIGHT;
        }
        if (wasActive !== this.active) {
            this.activeChanged.next();
        }
        return totalHeight;
    }
    shouldTransformTotalContentSize(totalHeight) {
        if (totalHeight <= MAX_SCROLL_HEIGHT) {
            this.active = false;
        }
        else if (this.totalHeight !== totalHeight) {
            return true;
        }
        return false;
    }
    dispose() {
        this.activeChanged.complete();
    }
}

const DISABLE_INTERSECTION_OBSERVABLE = new InjectionToken('When found in the DI tree and resolves to true, disable the use of IntersectionObserver');
const APP_DEFAULT_VIRTUAL_SCROLL_STRATEGY = () => new PblNgridAutoSizeVirtualScrollStrategy(100, 200);
class PblCdkVirtualScrollViewportComponent extends CdkVirtualScrollViewport {
    constructor(elRef, cdr, ngZone, config, pblScrollStrategy, dir, scrollDispatcher, viewportRuler, extApi, disableIntersectionObserver, scrollable) {
        super(elRef, cdr, ngZone, 
        // TODO: Replace with `PblNgridDynamicVirtualScrollStrategy` in v4
        pblScrollStrategy = resolveScrollStrategy(config, pblScrollStrategy, APP_DEFAULT_VIRTUAL_SCROLL_STRATEGY), dir, scrollDispatcher, viewportRuler, scrollable);
        this.cdr = cdr;
        this.pblScrollStrategy = pblScrollStrategy;
        this.extApi = extApi;
        /**
         * Event emitted when the scrolling state of rows in the grid changes.
         * When scrolling starts `true` is emitted and when the scrolling ends `false` is emitted.
         *
         * The grid is in "scrolling" state from the first scroll event and until 2 animation frames
         * have passed without a scroll event.
         *
         * When scrolling, the emitted value is the direction: -1 or 1
         * When not scrolling, the emitted value is 0.
         *
         * NOTE: This event runs outside the angular zone.
         */
        this.scrolling = new EventEmitter();
        /**
         * Emits an estimation of the current frame rate while scrolling, in a 500ms interval.
         *
         * The frame rate value is the average frame rate from all measurements since the scrolling began.
         * To estimate the frame rate, a significant number of measurements is required so value is emitted every 500 ms.
         * This means that a single scroll or short scroll bursts will not result in a `scrollFrameRate` emissions.
         *
         * Valid on when virtual scrolling is enabled.
         *
         * NOTE: This event runs outside the angular zone.
         *
         * In the future the measurement logic might be replaced with the Frame Timing API
         * See:
         * - https://developers.google.com/web/updates/2014/11/frame-timing-api
         * - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
         * - https://github.com/googlearchive/frame-timing-polyfill/wiki/Explainer
         */
        this.scrollFrameRate = new EventEmitter();
        /**
         * The `scrollHeight` of the virtual scroll viewport.
         * The `scrollHeight` is updated by the virtual scroll (update logic and frequency depends on the strategy implementation) through
         * the `setTotalContentSize(size)` method. The input size is used to position a dummy spacer element at a position that mimics the `scrollHeight`.
         *
         * In theory, the size sent to `setTotalContentSize` should equal the `scrollHeight` value, once the browser update's the layout.
         * In reality it does not happen, sometimes they are not equal. Setting a size will result in a different `scrollHeight`.
         * This might be due to changes in measurements when handling sticky meta rows (moving back and forth)
         *
         * Because the position of the dummy spacer element is set through DI the layout will run in the next micro-task after the call to `setTotalContentSize`.
         */
        this.scrollHeight = 0;
        this.ngeRenderedContentSize = 0;
        this.offsetChange$ = new Subject();
        this.offset = 0;
        this._isScrolling = false;
        this.element = elRef.nativeElement;
        this.grid = extApi.grid;
        if (config.has('virtualScroll')) {
            this.wheelModeDefault = config.get('virtualScroll').wheelMode;
        }
        config.onUpdate('virtualScroll').pipe(unrx(this)).subscribe(change => this.wheelModeDefault = change.curr.wheelMode);
        this.enabled = pblScrollStrategy.type && pblScrollStrategy.type !== 'vScrollNone';
        extApi.setViewport(this);
        this.offsetChange = this.offsetChange$.asObservable();
        this._minWidth$ = this.grid.columnApi.totalColumnWidthChange;
        this.intersection = new RowIntersectionTracker(this.element, !!disableIntersectionObserver);
    }
    get isScrolling() { return this._isScrolling; }
    get wheelMode() {
        return this.pblScrollStrategy.wheelMode || this.wheelModeDefault || 'passive';
    }
    /**
     * Get the current bounding client rectangle boxes for the virtual scroll container
     * Since performing these measurements impact performance the values are are cached between request animation frames.
     * I.E 2 subsequent measurements will always return the same value, the next measurement will only take place after
     * the next animation frame (using `requestAnimationFrame` API)
     */
    get getBoundingClientRects() {
        if (!this._boundingClientRects) {
            const innerBox = this._innerBoxHelper.nativeElement.getBoundingClientRect();
            const clientRect = this.element.getBoundingClientRect();
            this._boundingClientRects = {
                clientRect,
                innerWidth: innerBox.width,
                innerHeight: innerBox.height,
                scrollBarWidth: clientRect.width - innerBox.width,
                scrollBarHeight: clientRect.height - innerBox.height,
            };
            const resetCurrentBox = () => this._boundingClientRects = undefined;
            if (this._isScrolling) {
                this.scrolling.pipe(filter(scrolling => scrolling === 0), take(1)).subscribe(resetCurrentBox);
            }
            else {
                requestAnimationFrame(resetCurrentBox);
            }
        }
        return this._boundingClientRects;
    }
    get innerWidth() {
        return this.getBoundingClientRects.innerWidth;
    }
    get outerWidth() {
        return this.getBoundingClientRects.clientRect.width;
    }
    get innerHeight() {
        return this.getBoundingClientRects.innerWidth;
    }
    get outerHeight() {
        return this.getBoundingClientRects.clientRect.height;
    }
    get scrollWidth() {
        return this.element.scrollWidth;
    }
    /**
     * When true, the virtual paging feature is enabled because the virtual content size exceed the supported height of the browser so paging is enable.
     */
    get virtualPagingActive() { return this.heightPaging?.active ?? false; }
    ngOnInit() {
        this.pblScrollStrategy.attachExtApi(this.extApi);
        if (this.enabled) {
            // Enabling virtual scroll event with browser height limit
            // Based on: http://jsfiddle.net/SDa2B/263/
            this.heightPaging = new VirtualScrollHightPaging(this);
        }
        super.ngOnInit();
        // Init the scrolling watcher which track scroll events an emits `scrolling` and `scrollFrameRate` events.
        this.ngZone.runOutsideAngular(() => this.elementScrolled().subscribe(createScrollWatcherFn(this)));
    }
    ngAfterViewInit() {
        // If virtual scroll is disabled (`NoVirtualScrollStrategy`) we need to disable any effect applied
        // by the viewport, wrapping the content injected to it.
        // The main effect is the grid having height 0 at all times, unless the height is explicitly set.
        // This happens because the content taking out of the layout, wrapped in absolute positioning.
        // Additionally, the host itself (viewport) is set to contain: strict.
        const { grid } = this;
        if (this.enabled) {
            this.forOf = new PblVirtualScrollForOf(this.extApi, this.ngZone);
            if (!this.heightPaging.active) {
                this.forOf.wheelControl.wheelListen();
            }
            // `wheel` mode does not work well with the workaround to fix height limit, so we disable it when it's on
            this.heightPaging.activeChanged
                .subscribe(() => {
                if (this.heightPaging.active) {
                    this.forOf.wheelControl.wheelUnListen();
                }
                else {
                    this.forOf.wheelControl.wheelListen();
                }
            });
        }
        this.scrolling
            .pipe(unrx(this))
            .subscribe(isScrolling => {
            this._isScrolling = !!isScrolling;
            if (isScrolling) {
                grid.addClass('pbl-ngrid-scrolling');
            }
            else {
                grid.removeClass('pbl-ngrid-scrolling');
            }
        });
    }
    ngOnDestroy() {
        this.intersection.destroy();
        this.heightPaging?.dispose();
        super.ngOnDestroy();
        this.detachViewPort();
        this.offsetChange$.complete();
        unrx.kill(this);
    }
    reMeasureCurrentRenderedContent() {
        this.pblScrollStrategy.onContentRendered();
    }
    measureScrollOffset(from) {
        const scrollOffset = super.measureScrollOffset(from);
        return (!from || from === 'top') && this.heightPaging ? this.heightPaging.transformScrollOffset(scrollOffset) : scrollOffset;
    }
    getOffsetToRenderedContentStart() {
        const renderedContentStart = super.getOffsetToRenderedContentStart();
        return this.heightPaging?.transformOffsetToRenderedContentStart(renderedContentStart) ?? renderedContentStart;
    }
    setRenderedContentOffset(offset, to = 'to-start') {
        if (this.heightPaging?.active) {
            offset = this.heightPaging.transformRenderedContentOffset(offset, to);
        }
        super.setRenderedContentOffset(offset, to);
        if (this.enabled) {
            if (this.offset !== offset) {
                this.offset = offset;
                if (!this.isCDPending) {
                    this.isCDPending = true;
                    this.ngZone.runOutsideAngular(() => Promise.resolve()
                        .then(() => {
                        this.isCDPending = false;
                        this.offsetChange$.next(this.offset);
                    }));
                }
            }
        }
    }
    setTotalContentSize(size) {
        if (this.heightPaging?.shouldTransformTotalContentSize(size)) {
            size = this.heightPaging.transformTotalContentSize(size, super.measureScrollOffset());
        }
        super.setTotalContentSize(size);
        // TODO(shlomiassaf)[perf, 3]: run this once... (aggregate all calls within the same animation frame)
        requestAnimationFrame(() => {
            this.scrollHeight = this.element.scrollHeight; //size;
            this.updateFiller();
            // We must trigger a change detection cycle because the filler div element is updated through bindings
            this.cdr.markForCheck();
        });
    }
    /** Measure the combined size of all of the rendered items. */
    measureRenderedContentSize() {
        let size = super.measureRenderedContentSize();
        if (this.orientation === 'vertical') {
            size -= this.stickyRowHeaderContainer.offsetHeight + this.stickyRowFooterContainer.offsetHeight;
            // Compensate for hz scroll bar, if exists, only in non virtual scroll mode.
            if (!this.enabled) {
                size += this.outerHeight - this.innerHeight;
            }
        }
        return this.ngeRenderedContentSize = size;
    }
    checkViewportSize() {
        // TODO: Check for changes in `CdkVirtualScrollViewport` source code, when resizing is handled!
        // see https://github.com/angular/material2/blob/28fb3abe77c5336e4739c820584ec99c23f1ae38/src/cdk/scrolling/virtual-scroll-viewport.ts#L341
        const prev = this.getViewportSize();
        super.checkViewportSize();
        if (prev !== this.getViewportSize()) {
            this.updateFiller();
        }
    }
    detachViewPort() {
        if (this.forOf) {
            this.forOf.destroy();
            this.forOf = undefined;
        }
    }
    /**
     * TODO(REFACTOR_REF 1): Move to use rowApi so we can accept rows/cells and not html elements.
     * It will allow us to bring into view rows as well.
     * This will change the methods signature!
     * @internal
     */
    _scrollIntoView(cellElement) {
        const container = this.element;
        const elBox = cellElement.getBoundingClientRect();
        const containerBox = this.getBoundingClientRects.clientRect;
        // Vertical handling.
        // We have vertical virtual scroll, so here we use the virtual scroll API to scroll into the target
        if (elBox.top < containerBox.top) { // out from top
            const offset = elBox.top - containerBox.top;
            this.scrollToOffset(this.measureScrollOffset() + offset);
        }
        else if (elBox.bottom > containerBox.bottom) { // out from bottom
            const offset = elBox.bottom - (containerBox.bottom - this.getScrollBarThickness('horizontal'));
            this.scrollToOffset(this.measureScrollOffset() + offset);
        }
        // Horizontal handling.
        // We DON'T have horizontal virtual scroll, so here we use the DOM API to scroll into the target
        // TODO: When implementing horizontal virtual scroll, refactor this as well.
        if (elBox.left < containerBox.left) { // out from left
            const offset = elBox.left - containerBox.left;
            container.scroll(container.scrollLeft + offset, container.scrollTop);
        }
        else if (elBox.right > containerBox.right) { // out from right
            const offset = elBox.right - (containerBox.right - this.getScrollBarThickness('vertical'));
            container.scroll(container.scrollLeft + offset, container.scrollTop);
        }
    }
    onSourceLengthChange(prev, curr) {
        this.checkViewportSize();
        this.updateFiller();
    }
    attach(forOf) {
        super.attach(forOf);
        const scrollStrategy = this.pblScrollStrategy instanceof PblNgridBaseVirtualScrollDirective
            ? this.pblScrollStrategy._scrollStrategy
            : this.pblScrollStrategy;
        if (scrollStrategy instanceof PblNgridAutoSizeVirtualScrollStrategy) {
            scrollStrategy.averager.setRowInfo(forOf);
        }
    }
    setRenderedRange(range) {
        super.setRenderedRange(range);
    }
    getScrollBarThickness(location) {
        switch (location) {
            case 'horizontal':
                return this.outerHeight - this.innerHeight;
            case 'vertical':
                return this.outerWidth - this.innerWidth;
        }
    }
    updateFiller() {
        this.measureRenderedContentSize();
        if (this.grid.noFiller) {
            this.pblFillerHeight = undefined;
        }
        else {
            this.pblFillerHeight = this.getViewportSize() >= this.ngeRenderedContentSize ?
                `calc(100% - ${this.ngeRenderedContentSize}px)`
                : undefined;
        }
    }
}
/** @nocollapse */ PblCdkVirtualScrollViewportComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollViewportComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i1$2.PblNgridConfigService }, { token: VIRTUAL_SCROLL_STRATEGY, optional: true }, { token: i1$1.Directionality, optional: true }, { token: i3.ScrollDispatcher }, { token: i3.ViewportRuler }, { token: EXT_API_TOKEN }, { token: DISABLE_INTERSECTION_OBSERVABLE, optional: true }, { token: VIRTUAL_SCROLLABLE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblCdkVirtualScrollViewportComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkVirtualScrollViewportComponent, selector: "pbl-cdk-virtual-scroll-viewport", inputs: { stickyRowHeaderContainer: "stickyRowHeaderContainer", stickyRowFooterContainer: "stickyRowFooterContainer" }, outputs: { scrolling: "scrolling", scrollFrameRate: "scrollFrameRate" }, host: { properties: { "class.cdk-virtual-scroll-disabled": "!enabled", "class.cdk-virtual-scroll-orientation-horizontal": "orientation === \"horizontal\"", "class.cdk-virtual-scroll-orientation-vertical": "orientation === \"vertical\"" }, classAttribute: "cdk-virtual-scroll-viewport" }, viewQueries: [{ propertyName: "_innerBoxHelper", first: true, predicate: ["innerBoxHelper"], descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<p #innerBoxHelper class=\"cdk-virtual-scroll-inner-width\"></p>\n<ng-content select=\".cdk-virtual-scroll-before-content-wrapper\"></ng-content>\n<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper [class.cdk-virtual-scroll-content-wrapper]=\"enabled\" style=\"width: 100%\" [style.minWidth.px]=\"_minWidth$ | async\">\n  <ng-content></ng-content>\n</div>\n\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div *ngIf=\"enabled\" class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n<div *ngIf=\"pblFillerHeight && enabled\"\n    class=\"pbl-ngrid-space-fill\"\n    [style.minWidth.px]=\"_minWidth$ | async\"\n    [style.top.px]=\"ngeRenderedContentSize\"\n    [style.height]=\"pblFillerHeight\"></div>\n", styles: ["pbl-cdk-virtual-scroll-viewport{display:block;position:relative;overflow:auto;contain:strict;transform:translateZ(0);will-change:scroll-position;-webkit-overflow-scrolling:touch}pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-inner-width{width:100%;height:100%;position:absolute;margin:0!important;padding:0!important}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{position:absolute;top:0;left:0;height:1px;width:1px;transform-origin:0 0}[dir=rtl] .cdk-virtual-scroll-spacer{right:0;left:auto;transform-origin:100% 0}.pbl-ngrid-space-fill{position:absolute;left:0;width:100%}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "pipe", type: i1.AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollViewportComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-cdk-virtual-scroll-viewport', host: {
                        class: 'cdk-virtual-scroll-viewport',
                        '[class.cdk-virtual-scroll-disabled]': '!enabled',
                        '[class.cdk-virtual-scroll-orientation-horizontal]': 'orientation === "horizontal"',
                        '[class.cdk-virtual-scroll-orientation-vertical]': 'orientation === "vertical"'
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, template: "<p #innerBoxHelper class=\"cdk-virtual-scroll-inner-width\"></p>\n<ng-content select=\".cdk-virtual-scroll-before-content-wrapper\"></ng-content>\n<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper [class.cdk-virtual-scroll-content-wrapper]=\"enabled\" style=\"width: 100%\" [style.minWidth.px]=\"_minWidth$ | async\">\n  <ng-content></ng-content>\n</div>\n\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div *ngIf=\"enabled\" class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n<div *ngIf=\"pblFillerHeight && enabled\"\n    class=\"pbl-ngrid-space-fill\"\n    [style.minWidth.px]=\"_minWidth$ | async\"\n    [style.top.px]=\"ngeRenderedContentSize\"\n    [style.height]=\"pblFillerHeight\"></div>\n", styles: ["pbl-cdk-virtual-scroll-viewport{display:block;position:relative;overflow:auto;contain:strict;transform:translateZ(0);will-change:scroll-position;-webkit-overflow-scrolling:touch}pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] pbl-cdk-virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-inner-width{width:100%;height:100%;position:absolute;margin:0!important;padding:0!important}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{position:absolute;top:0;left:0;height:1px;width:1px;transform-origin:0 0}[dir=rtl] .cdk-virtual-scroll-spacer{right:0;left:auto;transform-origin:100% 0}.pbl-ngrid-space-fill{position:absolute;left:0;width:100%}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i1$2.PblNgridConfigService }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLL_STRATEGY]
                }] }, { type: i1$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i3.ScrollDispatcher }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DISABLE_INTERSECTION_OBSERVABLE]
                }] }, { type: i3.CdkVirtualScrollable, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLLABLE]
                }] }]; }, propDecorators: { _innerBoxHelper: [{
                type: ViewChild,
                args: ['innerBoxHelper', { static: true }]
            }], stickyRowHeaderContainer: [{
                type: Input
            }], stickyRowFooterContainer: [{
                type: Input
            }], scrolling: [{
                type: Output
            }], scrollFrameRate: [{
                type: Output
            }] } });

function internalApiFactory(grid) { return grid._extApi; }
function pluginControllerFactory(grid) { return grid._plugin.controller; }
function metaRowServiceFactory(grid) { return grid._extApi.rowsApi.metaRowService; }
class PblNgridComponent {
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
/** @nocollapse */ PblNgridComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridComponent, deps: [{ token: i0.Injector }, { token: i0.ViewContainerRef }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i1$2.PblNgridConfigService }, { token: PblNgridRegistryService }, { token: 'id', attribute: true }, { token: i1$1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
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
    ], viewQueries: [{ propertyName: "_vcRefBeforeTable", first: true, predicate: ["beforeTable"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_vcRefBeforeContent", first: true, predicate: ["beforeContent"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_vcRefAfterContent", first: true, predicate: ["afterContent"], descendants: true, read: ViewContainerRef, static: true }, { propertyName: "_fbTableCell", first: true, predicate: ["fbTableCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_fbHeaderCell", first: true, predicate: ["fbHeaderCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_fbFooterCell", first: true, predicate: ["fbFooterCell"], descendants: true, read: TemplateRef, static: true }, { propertyName: "_tableRowDef", first: true, predicate: CdkRowDef, descendants: true, static: true }, { propertyName: "_headerRowDefs", predicate: CdkHeaderRowDef, descendants: true }, { propertyName: "_footerRowDefs", predicate: CdkFooterRowDef, descendants: true }], usesOnChanges: true, ngImport: i0, template: "<!-- GRID HEADER ROW DEF - THE MAIN HEADER OF THE GRID -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[]; sticky: columnRowDef.header?.type === 'sticky'\"\n                      [row]=\"columnRowDef.header\"\n                      class=\"pbl-ngrid-header-row-main\"></pbl-ngrid-column-row>\n\n<!-- DUPLICATE HEADER FOR THE MAIN HEADER, NEVER SEEN (NOT VISUAL), USED FOR RESIZING -->\n<pbl-ngrid-column-row *cdkHeaderRowDef=\"[];\"\n                      [row]=\"columnRowDef.header\"\n                      gridWidthRow\n                      style=\"visibility: hidden !important;\"\n                      class=\"pbl-ngrid-row-visually-hidden\"></pbl-ngrid-column-row>\n\n<!-- MULTI-HEADER ROW DEF & MULTI-HEADER GROUP ROW DEFINITION TEMPLATES -->\n<ng-container *ngFor=\"let row of metaHeaderRows;\">\n  <pbl-ngrid-meta-row *cdkHeaderRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<!-- GRID FOOTER ROW DEF -->\n<pbl-ngrid-column-row *cdkFooterRowDef=\"[]; sticky: columnRowDef.footer?.type === 'sticky'\"\n                      footer [row]=\"columnRowDef.footer\"></pbl-ngrid-column-row>\n<!-- GRID FOOTER ROW DEF -->\n<!-- MULTI-FOOTER ROW DEF -->\n<ng-container *ngFor=\"let row of metaFooterRows;\">\n  <pbl-ngrid-meta-row footer *cdkFooterRowDef=\"[]; sticky: row.rowDef.type === 'sticky'\" [row]=\"row\"></pbl-ngrid-meta-row>\n</ng-container>\n\n<div class=\"pbl-ngrid-container\">\n  <ng-container #beforeTable></ng-container>\n  <div pbl-ngrid-fixed-meta-row-container=\"header\"></div>\n  <pbl-cdk-virtual-scroll-viewport class=\"pbl-ngrid-scroll-container\"\n                                   [stickyRowHeaderContainer]=\"stickyRowHeaderContainer\" [stickyRowFooterContainer]=\"stickyRowFooterContainer\">\n    <pbl-cdk-table tabindex=\"-1\">\n      <!-- Row templates. The columns used are set at the row template level -->\n\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n      <!-- We dont need columns because we implement them internally -->\n      <pbl-ngrid-row *pblNgridRowDef=\"let row;\" row></pbl-ngrid-row>\n      <!-- GRID RECORD ROW DEFINITION TEMPLATES -->\n    </pbl-cdk-table>\n  </pbl-cdk-virtual-scroll-viewport>\n  <div pbl-ngrid-fixed-meta-row-container=\"footer\"></div>\n\n  <ng-container #beforeContent>\n    <!-- This dummy row is used to extract an initial row height -->\n    <div role=\"row\" row=\"\" class=\"pbl-ngrid-row cdk-row\" style=\"display: none;\"></div>\n  </ng-container>\n  <ng-content></ng-content>\n  <ng-container #afterContent></ng-container>\n\n  <!-- Placeholder for header/footer scroll containers that will get populated with header/meta roles when the following conditions are met:\n       - Virtual scrolling is enabled\n       - Rows are rendered in the viewport\n       - Container is scrolling\n\n       The placeholder is fixed so the browsers does not use sticky positioning while scrolling, which takes the rows out of view while scrolling.\n       While scrolling the rows are moved into this placeholder and when scrolling ends they return to their original positioning.\n\n       The actual rows are added into the internal div, within the placeholder.\n       The top container get the proper width and the internal header gets the scroll offset (horizontal) that matches the current offset.\n       This has an effect only when scrolling with the wheel within a long scrolling session.\n\n       Implementation is in the virtual scroll viewport (more precisely in `PblVirtualScrollForOf`)\n  -->\n  <div #stickyRowHeaderContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- HEADERS -->\n  <div #stickyRowFooterContainer class=\"pbl-ngrid-sticky-row-scroll-container\"><div [style.minWidth.px]=\"innerTableMinWidth\"></div></div> <!-- FOOTERS -->\n</div>\n\n<ng-template #fbTableCell let-value=\"value\"><div>{{value}}</div></ng-template>\n<ng-template #fbHeaderCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n<ng-template #fbFooterCell let-column=\"col\"><div>{{column.label}}</div></ng-template>\n", dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i4.CdkHeaderRowDef, selector: "[cdkHeaderRowDef]", inputs: ["cdkHeaderRowDef", "cdkHeaderRowDefSticky"] }, { kind: "directive", type: i4.CdkFooterRowDef, selector: "[cdkFooterRowDef]", inputs: ["cdkFooterRowDef", "cdkFooterRowDefSticky"] }, { kind: "component", type: PblNgridMetaRowContainerComponent, selector: "div[pbl-ngrid-fixed-meta-row-container]", inputs: ["pbl-ngrid-fixed-meta-row-container"] }, { kind: "component", type: PblCdkTableComponent, selector: "pbl-cdk-table", exportAs: ["pblCdkTable"] }, { kind: "directive", type: PblNgridRowDef, selector: "[pblNgridRowDef]", inputs: ["pblNgridRowDefColumns", "pblNgridRowDefWhen"] }, { kind: "component", type: PblNgridRowComponent, selector: "pbl-ngrid-row[row]", exportAs: ["pblNgridRow"] }, { kind: "component", type: PblNgridColumnRowComponent, selector: "pbl-ngrid-column-row", inputs: ["row"] }, { kind: "component", type: PblNgridMetaRowComponent, selector: "pbl-ngrid-meta-row", inputs: ["row"] }, { kind: "component", type: PblCdkVirtualScrollViewportComponent, selector: "pbl-cdk-virtual-scroll-viewport", inputs: ["stickyRowHeaderContainer", "stickyRowFooterContainer"], outputs: ["scrolling", "scrollFrameRate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
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
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ViewContainerRef }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i1$2.PblNgridConfigService }, { type: PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['id']
                }] }, { type: i1$1.Directionality, decorators: [{
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

// tslint:disable:use-host-property-decorator
/**
 * A directive that marks the template as a projected section inside the grid.
 * The location of the project content is set by the position input.
 *
 * Note that this directive can only be set as the content inside the grid.
 */
class PblNgridOuterSectionDirective {
    constructor(grid, tRef) {
        this.grid = grid;
        this.tRef = tRef;
    }
    ngAfterViewInit() {
        this.grid.createView(this.position === 'bottom' ? 'beforeContent' : 'beforeTable', this.tRef);
    }
}
/** @nocollapse */ PblNgridOuterSectionDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOuterSectionDirective, deps: [{ token: PblNgridComponent }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridOuterSectionDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridOuterSectionDirective, selector: "[pblNgridOuterSection]", inputs: { position: ["pblNgridOuterSection", "position"] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOuterSectionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridOuterSection]',
                    inputs: ['position:pblNgridOuterSection'] // tslint:disable-line:use-input-property-decorator
                }]
        }], ctorParameters: function () { return [{ type: PblNgridComponent }, { type: i0.TemplateRef }]; } });

const noop = function () { };
class NoVirtualScrollStrategy {
    constructor() {
        this.attachExtApi = noop;
        this.attach = noop;
        this.detach = noop;
        this.onContentScrolled = noop;
        this.onDataLengthChanged = noop;
        this.onContentRendered = noop;
        this.onRenderedOffsetChanged = noop;
        this.scrollToIndex = noop;
    }
    get type() { return 'vScrollNone'; }
}

class SizeGroup {
    constructor(groupIndex, maxItems) {
        this.groupIndex = groupIndex;
        this.maxItems = maxItems;
        this.rawTotal = 0;
        this.length = 0;
        this.items = [];
        this.dsStart = groupIndex * maxItems;
        this.dsEnd = this.dsStart + maxItems - 1;
    }
    set(dsIndex, height) {
        const index = dsIndex - this.dsStart;
        const prev = this.items[index];
        this.items[index] = height;
        this.rawTotal += height - (prev || 0);
        if (!prev && height) {
            this.length += 1;
        }
    }
    remove(dsIndex) {
        const index = dsIndex - this.dsStart;
        const prev = this.items[index];
        if (prev) {
            this.rawTotal -= prev;
            this.items[index] = undefined;
            this.length -= 1;
            return true;
        }
        return false;
    }
    has(dsIndex) {
        const index = dsIndex - this.dsStart;
        return !!this.items[index];
    }
    clear() {
        this.rawTotal = this.length = 0;
        this.items = [];
    }
    getItemSize(dsIndex) {
        const index = dsIndex - this.dsStart;
        return this.items[index];
    }
    getSizeBefore(dsIndex, itemSize) {
        const index = dsIndex - this.dsStart;
        let total = index * itemSize;
        for (let i = 0; i < index; i++) {
            const size = this.items[i];
            if (size) {
                total += size - itemSize;
            }
        }
        return total;
    }
    getSize(itemSize) {
        return (itemSize * (this.maxItems - this.length)) + this.rawTotal;
    }
    getSubSize(dsIndexStart, dsIndexEnd, itemSize) {
        const indexStart = Math.max(dsIndexStart, this.dsStart) - this.dsStart;
        const indexEnd = this.maxItems - (this.dsEnd - Math.min(dsIndexEnd, this.dsEnd)) - 1;
        let total = 0;
        for (let i = indexStart; i <= indexEnd; i++) {
            total += this.items[i] || itemSize;
        }
        return total;
    }
    getSizeAfter(dsIndex, itemSize) {
        const index = this.dsEnd - dsIndex;
        let total = index * itemSize;
        for (let i = (this.maxItems - index); i < this.maxItems; i++) {
            const size = this.items[i];
            if (size) {
                total += size - itemSize;
            }
        }
        return total;
    }
    getRawDiffSize(itemSize) {
        return this.rawTotal - itemSize - this.length;
    }
}

class SizeGroupCollection {
    constructor() {
        this._groups = [];
    }
    get collection() { return this._groups; }
    get length() { return this._groups.length; }
    set(group) {
        const groupIndex = group.groupIndex;
        const index = this.findGroupIndexIndex(groupIndex, true);
        if (index === -1) {
            this._groups.push(group);
        }
        else {
            const closestGroup = this._groups[index];
            if (closestGroup.groupIndex === groupIndex) {
                this._groups[groupIndex] = group;
            }
            else if (closestGroup.groupIndex < groupIndex) {
                this._groups.splice(index + 1, 0, group);
            }
            else {
                this._groups.splice(index, 0, group);
            }
        }
    }
    remove(groupIndex) {
        const index = this.findGroupIndexIndex(groupIndex);
        if (index > -1) {
            this._groups.splice(index, 1);
            return true;
        }
        return false;
    }
    get(groupIndex) {
        return this._groups[this.findGroupIndexIndex(groupIndex)];
    }
    has(groupIndex) {
        return this.findGroupIndexIndex(groupIndex) > -1;
    }
    clear() {
        this._groups = [];
    }
    findGroupIndexIndex(groupIndex, matchClosest) {
        let start = 0;
        let end = this._groups.length - 1;
        let mid = -1;
        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            if (this._groups[mid].groupIndex === groupIndex) {
                return mid;
            }
            else if (this._groups[mid].groupIndex < groupIndex) {
                start = mid + 1;
            }
            else {
                end = mid - 1;
            }
        }
        return matchClosest ? mid : -1;
    }
}

class Sizer {
    constructor(groupSize) {
        this.groupSize = 50;
        this.groups = new SizeGroupCollection();
        if (groupSize > 0) {
            this.groupSize = groupSize;
        }
    }
    clear() {
        this.groups.clear();
    }
    setSize(dsIndex, height) {
        const groupIndex = this.getGroupIndex(dsIndex);
        if (height === this.itemSize) {
            const group = this.groups.get(groupIndex);
            if (group) {
                group.remove(dsIndex);
                if (group.length === 0) {
                    this.groups.remove(groupIndex);
                }
            }
        }
        else {
            let group = this.groups.get(groupIndex);
            if (!group) {
                group = new SizeGroup(groupIndex, this.groupSize);
                this.groups.set(group);
            }
            group.set(dsIndex, height);
        }
    }
    getTotalContentSize() {
        const itemSize = this.itemSize;
        let total = this.itemsLength * itemSize;
        for (const g of this.groups.collection) {
            total += g.getRawDiffSize(itemSize);
        }
        return total;
    }
    getSizeForItem(dsIndex) {
        const groupIndex = this.getGroupIndex(dsIndex);
        return this.groups.get(groupIndex)?.getItemSize(dsIndex) || this.itemSize;
    }
    getSizeBefore(dsIndex) {
        const itemSize = this.itemSize;
        // We want all items before `dsIndex`
        // If dsIndex is 0 we want nothing
        // If dsIndex is 1 we want only 0 so `dsIndex` is also the "count" here.
        let total = dsIndex * itemSize;
        for (const g of this.groups.collection) {
            if (g.dsStart < dsIndex) {
                if (g.dsEnd > dsIndex) {
                    total += g.getSizeBefore(dsIndex, itemSize) - itemSize * (dsIndex - g.dsStart);
                }
                else {
                    total += g.getRawDiffSize(itemSize);
                }
            }
            else {
                break;
            }
        }
        return total;
    }
    getSizeForRange(dsIndexStart, dsIndexEnd) {
        const groupSize = this.groupSize;
        const itemSize = this.itemSize;
        let total = 0;
        const startGroupIndex = this.getGroupIndex(dsIndexStart);
        const endGroupIndex = this.getGroupIndex(dsIndexEnd);
        const startGroup = this.groups.get(startGroupIndex);
        if (startGroupIndex === endGroupIndex) {
            if (startGroup) {
                total += startGroup.getSubSize(dsIndexStart, dsIndexEnd, itemSize);
            }
            else {
                total += (dsIndexEnd - dsIndexStart + 1) * itemSize;
            }
        }
        else {
            for (let i = startGroupIndex + 1; i < endGroupIndex; i++) {
                const g = this.groups.get(i);
                total += g ? g.getSize(itemSize) : itemSize * groupSize;
            }
            if (startGroup) {
                total += startGroup.getSizeAfter(dsIndexStart - 1, itemSize);
            }
            else {
                total += ((startGroupIndex + 1) * groupSize - dsIndexStart + 1) * itemSize;
            }
            const endGroup = this.groups.get(endGroupIndex);
            if (endGroup) {
                total += endGroup.getSizeBefore(dsIndexEnd + 1, itemSize);
            }
            else {
                total += (dsIndexEnd - (endGroupIndex * groupSize) + 1) * itemSize;
            }
        }
        return total;
    }
    getSizeAfter(dsIndex) {
        const itemSize = this.itemSize;
        const groups = this.groups.collection;
        let total = (this.itemsLength - dsIndex - 1) * itemSize;
        for (let i = groups.length - 1; i > -1; i--) {
            const g = groups[i];
            if (g.dsEnd > dsIndex) {
                if (g.dsStart > dsIndex) {
                    total += g.getRawDiffSize(itemSize);
                }
                else {
                    total += g.getSizeAfter(dsIndex, itemSize) - itemSize * (g.dsEnd - dsIndex);
                }
            }
            else {
                break;
            }
        }
        return total;
    }
    findRenderItemAtOffset(offset) {
        const { itemSize, groupSize } = this;
        const maxGroupIndex = this.getGroupIndex(this.itemsLength);
        const firstVisibleIndex = Math.floor(offset / itemSize);
        let groupIndex = this.getGroupIndex(firstVisibleIndex);
        let groupStartPos = this.getSizeBefore(groupSize * groupIndex);
        while (true) {
            if (groupStartPos < offset) {
                if (groupIndex >= maxGroupIndex) {
                    groupIndex = maxGroupIndex;
                    break;
                }
                groupIndex += 1;
                groupStartPos += this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                if (groupStartPos >= offset) {
                    groupStartPos -= this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                    groupIndex -= 1;
                    break;
                }
            }
            else if (groupStartPos > offset) {
                if (groupIndex <= 0) {
                    groupIndex = 0;
                    break;
                }
                groupIndex -= 1;
                groupStartPos -= this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                if (groupStartPos <= offset) {
                    break;
                }
            }
            else {
                break;
            }
        }
        let index = groupSize * groupIndex;
        const group = this.groups.get(groupIndex);
        if (!group) {
            while (groupStartPos < offset) {
                groupStartPos += itemSize;
                index += 1;
            }
        }
        else {
            while (groupStartPos < offset) {
                groupStartPos += group.getItemSize(index) || itemSize;
                index += 1;
            }
        }
        return index;
    }
    getGroupIndex(dsIndex) {
        return Math.floor(dsIndex / this.groupSize);
    }
}

class PblNgridDynamicVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this.type = 'vScrollDynamic';
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._lastExcessHeight = 0;
        this.sizer = new Sizer();
        this.sizer.itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this.sizer.itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    attachExtApi(extApi) {
        this.extApi = extApi;
        this.extApi.events
            .subscribe(event => {
            if (event.kind === 'onDataSource') {
                this.onDatasource(event.curr, event.prev);
            }
        });
        if (this.extApi.grid.ds) {
            this.onDatasource(this.extApi.grid.ds);
        }
    }
    attach(viewport) {
        if (!this.extApi) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid use of attach, you must first attach `PblNgridExtensionApi`');
            }
        }
        this._viewport = viewport;
        this._updateSizeAndRange();
    }
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    onContentScrolled() {
        this._updateRenderedRange();
    }
    onDataLengthChanged() {
        this.sizer.itemsLength = this._viewport.getDataLength();
        this._updateSizeAndRange();
    }
    onContentRendered() {
        this._checkRenderedContentSize();
    }
    onRenderedOffsetChanged() {
        if (this._viewport) {
            this._lastRenderedContentOffset = this._viewport.getOffsetToRenderedContentStart();
        }
    }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(this.sizer.getSizeBefore(index), behavior);
        }
    }
    onDatasource(curr, prev) {
        if (prev) {
            unrx.kill(this, prev);
        }
        if (curr) {
            curr.onSourceChanging
                .pipe(unrx(this, curr))
                .subscribe(() => {
                this.sizer.clear();
            });
        }
    }
    _updateSizeAndRange() {
        this._updateTotalContentSize();
        this._updateRenderedRange(true);
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        for (const row of this.extApi.rowsApi.dataRows()) {
            if (row.context) {
                this.sizer.setSize(row.context.dsIndex, row.height);
            }
        }
        this._viewport.setTotalContentSize(this.sizer.getTotalContentSize());
    }
    _checkRenderedContentSize() {
        this._updateTotalContentSize();
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange(skipSizeSync) {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        // if (!skipSizeSync) {
        //   for (let i = renderedRange.start; i <= renderedRange.end; i++) {
        //     this.sizer.setSize(i, this.extApi.rowsApi.findDataRowByDsIndex(i)?.height ?? this.sizer.itemSize);
        //   }
        // }
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        let firstVisibleIndex = this.sizer.findRenderItemAtOffset(scrollOffset);
        let excessHeight = 0;
        // When user scrolls to the top, rows change context, sometimes new rows are added etc.
        // With dynamic size, rows with additional size payload will cause the scroll offset to change because they are added
        // before the visible rows, this will throw the entire scroll out of sync.
        // To solve this we use a 2 step process.
        // 1) For each `_updateRenderRange` cycle of scrolling to the TOP, we sum up excess all height and save them.
        // 2) If we had excess height it will create a scroll change which will lead us back here. Now we check if we
        // have previously saved access height, if so we reduce the scroll offset back to what it was supposed to be, like adding the height did not effect the offset.
        // Since the first step causes a scroll offset flicker, the grid will jump forward and show rows not in the range we want, if we just move back on the 2nd tick
        // it will cause a flicker in the grid. To prevent it we compensate by pushing in the 1st tick, the rendered content offset forward to match the offset change.
        // In the second tick we revet it and restore the offset.
        if (this._lastExcessHeight) {
            const lastExcessHeight = this._lastExcessHeight;
            this._lastExcessHeight = 0;
            this._viewport.setRenderedContentOffset(this._lastRenderedContentOffset - lastExcessHeight);
            this._viewport.scrollToOffset(scrollOffset - lastExcessHeight);
            return;
        }
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            let spaceToFill = viewportSize;
            let expandEnd = firstVisibleIndex;
            while (spaceToFill > 0) {
                spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
            }
            const maxVisibleItems = expandEnd - firstVisibleIndex;
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex !== newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = this.sizer.getSizeBefore(firstVisibleIndex);
                newRange.start = firstVisibleIndex;
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        let contentOffset = this.sizer.getSizeBefore(newRange.start);
        const currentStartBuffer = scrollOffset - contentOffset;
        if (currentStartBuffer < this._minBufferPx && newRange.start !== 0) {
            let spaceToFill = this._maxBufferPx - currentStartBuffer;
            if (spaceToFill < 0) {
                spaceToFill = Math.abs(spaceToFill) + this._maxBufferPx;
            }
            let expandStart = newRange.start;
            while (spaceToFill > 0) {
                const newSize = this.sizer.getSizeForItem(--expandStart);
                spaceToFill -= newSize;
                excessHeight += newSize - this.sizer.itemSize;
            }
            expandStart = Math.max(0, expandStart);
            if (expandStart !== newRange.start) {
                newRange.start = expandStart;
                contentOffset = this.sizer.getSizeBefore(expandStart);
            }
            spaceToFill = viewportSize + this._minBufferPx;
            let expandEnd = firstVisibleIndex;
            while (spaceToFill > 0) {
                spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
            }
            newRange.end = Math.min(dataLength, expandEnd);
        }
        else {
            const renderDataEnd = contentOffset + this.sizer.getSizeForRange(newRange.start, newRange.end);
            const currentEndBuffer = renderDataEnd - (scrollOffset + viewportSize);
            if (currentEndBuffer < this._minBufferPx && newRange.end !== dataLength) {
                let spaceToFill = this._maxBufferPx - currentEndBuffer;
                if (spaceToFill < 0) {
                    spaceToFill = Math.abs(spaceToFill) + this._maxBufferPx;
                }
                let expandEnd = newRange.end;
                while (spaceToFill > 0) {
                    spaceToFill -= this.sizer.getSizeForItem(++expandEnd);
                }
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, expandEnd);
                    spaceToFill = this._minBufferPx;
                    let expandStart = firstVisibleIndex;
                    while (spaceToFill > 0) {
                        spaceToFill -= this.sizer.getSizeForItem(--expandStart);
                    }
                    expandStart = Math.max(0, expandStart);
                    if (expandStart !== newRange.start) {
                        newRange.start = expandStart;
                        contentOffset = this.sizer.getSizeBefore(expandStart);
                    }
                }
            }
        }
        this._lastExcessHeight = excessHeight;
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(contentOffset + excessHeight);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}

/** A virtual scroll strategy that supports unknown or dynamic size items. */
class PblCdkVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(vScrollDynamic, vScrollNone, grid) {
        super(grid, vScrollDynamic === null ? 'vScrollNone' : 'vScrollDynamic');
        if (vScrollDynamic !== null && vScrollNone !== null) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid vScroll instruction, only one value is allow.`);
            }
        }
    }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     */
    get vScrollDynamic() { return this._vScrollDynamic; }
    set vScrollDynamic(value) { this._vScrollDynamic = coerceNumberProperty(value); }
    ngOnInit() {
        switch (this.type) {
            case 'vScrollDynamic':
                if (!this._vScrollDynamic) {
                    this.vScrollDynamic = this.grid.findInitialRowHeight() || 48;
                }
                this._scrollStrategy = new PblNgridDynamicVirtualScrollStrategy(this._vScrollDynamic, this._minBufferPx, this._maxBufferPx);
                break;
            default:
                this._scrollStrategy = new NoVirtualScrollStrategy();
                break;
        }
    }
    ngOnChanges() {
        if (this._scrollStrategy) {
            switch (this.type) {
                case 'vScrollDynamic':
                    this._scrollStrategy?.updateItemAndBufferSize(this._vScrollDynamic, this._minBufferPx, this._maxBufferPx);
                    break;
                default:
                    break;
            }
        }
    }
}
/** @nocollapse */ PblCdkVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollDirective, deps: [{ token: 'vScrollDynamic', attribute: true }, { token: 'vScrollNone', attribute: true }, { token: PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkVirtualScrollDirective, selector: "pbl-ngrid[vScrollDynamic], pbl-ngrid[vScrollNone]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollDynamic: "vScrollDynamic" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollDynamic], pbl-ngrid[vScrollNone]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['vScrollDynamic']
                }] }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['vScrollNone']
                }] }, { type: PblNgridComponent }]; }, propDecorators: { vScrollDynamic: [{
                type: Input
            }] } });

class PblNgridScrolling {
    constructor(table, pluginCtrl, zone) {
        /**
         * Event emitted when the scrolling state of rows in the table changes.
         * When scrolling starts `true` is emitted and when the scrolling ends `false` is emitted.
         *
         * The table is in "scrolling" state from the first scroll event and until 2 animation frames
         * have passed without a scroll event.
         *
         * When scrolling, the emitted value is the direction: -1 or 1
         * When not scrolling, the emitted value is 0.
         *
         * NOTE: This event runs outside the angular zone.
         */
        this.scrolling = new EventEmitter();
        pluginCtrl.onInit()
            .subscribe(() => {
            const { viewport } = table;
            if (viewport) {
                viewport.scrolling.subscribe(isScrolling => zone.run(() => this.scrolling.next(isScrolling)));
            }
        });
    }
}
/** @nocollapse */ PblNgridScrolling.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridScrolling, deps: [{ token: PblNgridComponent }, { token: PblNgridPluginController }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridScrolling.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridScrolling, selector: "pbl-ngrid[scrolling]", outputs: { scrolling: "scrolling" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridScrolling, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[scrolling]' // tslint:disable-line: directive-selector
                }]
        }], ctorParameters: function () { return [{ type: PblNgridComponent }, { type: PblNgridPluginController }, { type: i0.NgZone }]; }, propDecorators: { scrolling: [{
                type: Output
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Virtual scrolling strategy for lists with items of known fixed size. */
class FixedSizeVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() { }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() { }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(index * this._itemSize, behavior);
        }
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange() {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        let firstVisibleIndex = scrollOffset / this._itemSize;
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex != newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = newVisibleIndex * this._itemSize;
                newRange.start = Math.floor(firstVisibleIndex);
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        const startBuffer = scrollOffset - newRange.start * this._itemSize;
        if (startBuffer < this._minBufferPx && newRange.start != 0) {
            const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
            newRange.start = Math.max(0, newRange.start - expandStart);
            newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
        }
        else {
            const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
            if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
                const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, newRange.end + expandEnd);
                    newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
                }
            }
        }
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}

class PblNgridFixedSizeVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
    constructor(itemSize, minBufferPx, maxBufferPx) {
        super(itemSize, minBufferPx, maxBufferPx);
        this.itemSize = itemSize;
    }
    get type() { return 'vScrollFixed'; }
    attachExtApi(extApi) {
        this.extApi = extApi;
    }
    attach(viewport) {
        if (!this.extApi) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid use of attach, you must first attach `PblNgridExtensionApi`');
            }
        }
        super.attach(this.viewport = viewport);
    }
    onContentScrolled() {
        // https://github.com/shlomiassaf/ngrid/issues/11
        // This is a workaround an issue with FixedSizeVirtualScrollStrategy
        // When:
        //    - The rendered data is changed so the data length is now LOWER then the current range (end - start)
        //    - The rendering direction is towards the top (start > end)
        //
        // For the issue to occur a big gap between the data length and the range length (gap), which does not happen on normal scrolling
        // but only when the data source is replaced (e.g. filtering).
        //
        // In such cases `onDataLengthChanged` is called which will call `_updateRenderedRange` which will calculate a new range
        // that is big, it will give the `start` a new value which creates the big gap.
        // It will then calculate a new "end" and leave the "start" so we have a big gap, larger then the viewport size.
        // After that it will create the new offset which is the itemSize * start, which is a bit lower then the offset but is large and again does not fit the viewport size
        // The scroll change will trigger `onContentScrolled` which will call `_updateRenderedRange` again,
        // with the same outcome, reducing the offset slightly, calling `onContentScrolled` again.
        // It will repeat until reaching the proper offset.
        //
        // The amount of offset reduced each time is approx the size of the buffers. (mix/max Buffer).
        //
        // This strategy is here only because of this error, it will let the initial update run and catch it's subsequent scroll event.
        if (!this.viewport) {
            return;
        }
        let { start, end } = this.viewport.getRenderedRange();
        const rangeLength = end - start;
        const dataLength = this.viewport.getDataLength();
        if (rangeLength < 0 && dataLength < -rangeLength) {
            start = dataLength - end;
            this.viewport.setRenderedRange({ start, end });
            this.viewport.setRenderedContentOffset(this.itemSize * start);
            // this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
        }
        else {
            super.onContentScrolled();
        }
    }
}

class PblNgridHideColumns {
    constructor(pluginCtrl, differs) {
        this.pluginCtrl = pluginCtrl;
        this.differs = differs;
        this.columnStore = pluginCtrl.extApi.columnStore;
    }
    set hideColumns(value) {
        this.hidden = value;
        this.dirty = true;
    }
    ngDoCheck() {
        if (this.dirty) {
            this.dirty = false;
            const value = this.hidden;
            if (!this.differ && value) {
                try {
                    this.differ = this.differs.find(value).create();
                }
                catch (e) {
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error(`Cannot find a differ supporting object '${value}. hideColumns only supports binding to Iterables such as Arrays.`);
                    }
                    return;
                }
            }
        }
        if (this.differ) {
            const hideColumns = this.hidden || [];
            const changes = this.differ.diff(hideColumns);
            if (changes) {
                const hide = [];
                const show = [];
                changes.forEachOperation((record, previousIndex, currentIndex) => {
                    if (record.previousIndex == null) {
                        hide.push(record.item);
                    }
                    else if (currentIndex == null) {
                        show.push(record.item);
                    }
                });
                this.columnStore.updateColumnVisibility(hide, show);
            }
            if (!this.hidden) {
                this.differ = undefined;
            }
        }
    }
}
/** @nocollapse */ PblNgridHideColumns.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHideColumns, deps: [{ token: PblNgridPluginController }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHideColumns.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHideColumns, selector: "pbl-ngrid[hideColumns]", inputs: { hideColumns: "hideColumns" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHideColumns, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[hideColumns]'
                }]
        }], ctorParameters: function () { return [{ type: PblNgridPluginController }, { type: i0.IterableDiffers }]; }, propDecorators: { hideColumns: [{
                type: Input,
                args: ['hideColumns']
            }] } });

/**
 * @deprecated Will be removed in v5
 * `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 * Note that the default virtual scroll strategy will also change from `vScrollAuto` to `vScrollDynamic`
 */
class PblCdkAutoSizeVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(grid) { super(grid, 'vScrollAuto'); }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollAuto() { return this._vScrollAuto; }
    set vScrollAuto(value) { this._vScrollAuto = coerceNumberProperty(value); }
    ngOnInit() {
        if (!this._vScrollAuto) {
            this._vScrollAuto = this.grid.findInitialRowHeight() || 48;
        }
        this._scrollStrategy = new PblNgridAutoSizeVirtualScrollStrategy(this._minBufferPx, this._maxBufferPx, new PblNgridItemSizeAverager(this._vScrollAuto));
    }
    ngOnChanges() {
        this._scrollStrategy?.updateBufferSize(this._minBufferPx, this._maxBufferPx);
    }
}
/** @nocollapse */ PblCdkAutoSizeVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkAutoSizeVirtualScrollDirective, deps: [{ token: PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkAutoSizeVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkAutoSizeVirtualScrollDirective, selector: "pbl-ngrid[vScrollAuto]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollAuto: "vScrollAuto" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkAutoSizeVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkAutoSizeVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollAuto]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkAutoSizeVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: PblNgridComponent }]; }, propDecorators: { vScrollAuto: [{
                type: Input
            }] } });

/**
 * @deprecated Will be removed in v5
 * `vScrollFixed` will move to an independent package in v5.
 * Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 */
class PblCdkFixedSizedVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(grid) { super(grid, 'vScrollFixed'); }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollFixed` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollFixed() { return this._vScrollFixed; }
    set vScrollFixed(value) { this._vScrollFixed = coerceNumberProperty(value); }
    ngOnInit() {
        if (!this._vScrollFixed) {
            this.vScrollFixed = this.grid.findInitialRowHeight() || 48;
        }
        this._scrollStrategy = new PblNgridFixedSizeVirtualScrollStrategy(this._vScrollFixed, this._minBufferPx, this._maxBufferPx);
    }
    ngOnChanges() {
        this._scrollStrategy?.updateItemAndBufferSize(this._vScrollFixed, this._minBufferPx, this._maxBufferPx);
    }
}
/** @nocollapse */ PblCdkFixedSizedVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkFixedSizedVirtualScrollDirective, deps: [{ token: PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkFixedSizedVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkFixedSizedVirtualScrollDirective, selector: "pbl-ngrid[vScrollFixed]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollFixed: "vScrollFixed" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkFixedSizedVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkFixedSizedVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollFixed]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkFixedSizedVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: PblNgridComponent }]; }, propDecorators: { vScrollFixed: [{
                type: Input
            }] } });

function ngridCellFactory(cfr) {
    return {
        'data': cfr.resolveComponentFactory(PblNgridCellComponent),
        'header': cfr.resolveComponentFactory(PblNgridHeaderCellComponent),
        'footer': cfr.resolveComponentFactory(PblNgridFooterCellComponent),
        'meta-header': cfr.resolveComponentFactory(PblNgridMetaCellComponent),
        'meta-footer': cfr.resolveComponentFactory(PblNgridMetaCellComponent),
    };
}
const PROVIDERS = [
    {
        provide: NGRID_CELL_FACTORY,
        useFactory: ngridCellFactory,
        deps: [ComponentFactoryResolver],
    },
    PblNgridCellFactoryResolver,
];

const COMMON_TABLE_TEMPLATE_INIT = new InjectionToken('COMMON TABLE TEMPLATE INIT');
function provideCommon(components) {
    return [
        { provide: COMMON_TABLE_TEMPLATE_INIT, multi: true, useValue: components },
    ];
}
class PblNgridModule {
    constructor(ngRef, registry, components) {
        if (components) {
            for (const multi of components) {
                for (const c of multi) {
                    if (c.root) {
                        registry = registry.getRoot();
                    }
                    PblNgridModule.loadCommonTemplates(ngRef, c.component, { registry, destroy: true });
                }
            }
        }
    }
    static forRoot(config, components) {
        return {
            ngModule: PblNgridModule,
            providers: [
                { provide: PEB_NGRID_CONFIG, useValue: config },
                PblNgridConfigService,
                provideCommon(components),
            ]
        };
    }
    static withCommon(components) {
        return {
            ngModule: PblNgridModule,
            providers: provideCommon(components),
        };
    }
    static loadCommonTemplates(ngRef, component, options) {
        let injector = ngRef.injector;
        const { registry, destroy } = options || {};
        if (registry) {
            injector = Injector.create({
                providers: [{ provide: PblNgridRegistryService, useValue: registry }],
                parent: ngRef.injector
            });
        }
        const cmpRef = ngRef.componentFactoryResolver.resolveComponentFactory(component).create(injector);
        cmpRef.changeDetectorRef.detectChanges();
        if (destroy) {
            ngRef.onDestroy(() => {
                try {
                    cmpRef.destroy();
                }
                catch (err) { }
            });
        }
        return cmpRef;
    }
}
/** @nocollapse */ PblNgridModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, deps: [{ token: i0.NgModuleRef }, { token: PblNgridRegistryService }, { token: COMMON_TABLE_TEMPLATE_INIT, optional: true, self: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, declarations: [PblNgridMetaRowContainerComponent,
        PblCdkTableComponent,
        PblNgridColumnDef,
        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
        PblNgridCellStyling,
        PblNgridOuterSectionDirective,
        PblNgridHeaderExtensionRefDirective,
        PblNgridNoDataRefDirective,
        PblNgridPaginatorRefDirective,
        PblNgridHeaderCellDefDirective,
        PblNgridFooterCellDefDirective,
        PblNgridCellDefDirective, PblNgridEditorCellDefDirective,
        PblNgridHeaderCellComponent,
        PblNgridCellComponent,
        PblNgridFooterCellComponent,
        PblNgridMetaCellComponent,
        PblNgridHideColumns,
        PblCdkVirtualScrollViewportComponent, PblNgridScrolling,
        PblCdkVirtualScrollDirective,
        // TODO: Move to an independent package in v4
        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
        PblNgridCellEditAutoFocusDirective,
        PblNgridComponent], imports: [CommonModule,
        ScrollingModule, ScrollingModule$1,
        CdkTableModule], exports: [PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
        PblNgridCellStyling,
        PblNgridOuterSectionDirective,
        PblNgridHeaderExtensionRefDirective,
        PblNgridNoDataRefDirective,
        PblNgridPaginatorRefDirective,
        PblNgridHeaderCellDefDirective,
        PblNgridFooterCellDefDirective,
        PblNgridCellDefDirective, PblNgridEditorCellDefDirective, PblNgridScrolling,
        PblNgridHeaderCellComponent,
        PblNgridCellComponent,
        PblNgridFooterCellComponent,
        PblNgridMetaCellComponent,
        PblNgridHideColumns,
        PblCdkVirtualScrollDirective,
        // TODO: Move to an independent package in v4
        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
        PblNgridCellEditAutoFocusDirective,
        PblNgridComponent] });
/** @nocollapse */ PblNgridModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, providers: [
        ...PROVIDERS,
    ], imports: [CommonModule,
        ScrollingModule, ScrollingModule$1,
        CdkTableModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        ScrollingModule, ScrollingModule$1,
                        CdkTableModule,
                    ],
                    declarations: [
                        PblNgridMetaRowContainerComponent,
                        PblCdkTableComponent,
                        PblNgridColumnDef,
                        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
                        PblNgridCellStyling,
                        PblNgridOuterSectionDirective,
                        PblNgridHeaderExtensionRefDirective,
                        PblNgridNoDataRefDirective,
                        PblNgridPaginatorRefDirective,
                        PblNgridHeaderCellDefDirective,
                        PblNgridFooterCellDefDirective,
                        PblNgridCellDefDirective, PblNgridEditorCellDefDirective,
                        PblNgridHeaderCellComponent,
                        PblNgridCellComponent,
                        PblNgridFooterCellComponent,
                        PblNgridMetaCellComponent,
                        PblNgridHideColumns,
                        PblCdkVirtualScrollViewportComponent, PblNgridScrolling,
                        PblCdkVirtualScrollDirective,
                        // TODO: Move to an independent package in v4
                        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
                        PblNgridCellEditAutoFocusDirective,
                        PblNgridComponent,
                    ],
                    providers: [
                        ...PROVIDERS,
                    ],
                    exports: [
                        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
                        PblNgridCellStyling,
                        PblNgridOuterSectionDirective,
                        PblNgridHeaderExtensionRefDirective,
                        PblNgridNoDataRefDirective,
                        PblNgridPaginatorRefDirective,
                        PblNgridHeaderCellDefDirective,
                        PblNgridFooterCellDefDirective,
                        PblNgridCellDefDirective, PblNgridEditorCellDefDirective, PblNgridScrolling,
                        PblNgridHeaderCellComponent,
                        PblNgridCellComponent,
                        PblNgridFooterCellComponent,
                        PblNgridMetaCellComponent,
                        PblNgridHideColumns,
                        PblCdkVirtualScrollDirective,
                        // TODO: Move to an independent package in v4
                        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
                        PblNgridCellEditAutoFocusDirective,
                        PblNgridComponent,
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.NgModuleRef }, { type: PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [COMMON_TABLE_TEMPLATE_INIT]
                }, {
                    type: Optional
                }, {
                    type: Self
                }] }]; } });

/* LEAVE THIS, WE NEED IT SO THE AUGMENTATION IN THE FILE WILL LOAD. */
const utils = {
    isPblColumn,
    isPblMetaColumn,
    isPblColumnGroup,
};

/**
 * Generated bundle index. Do not edit.
 */

export { ColumnApi, DISABLE_INTERSECTION_OBSERVABLE, EXT_API_TOKEN, NGRID_CELL_FACTORY, NoVirtualScrollStrategy, PBL_NGRID_ROW_TEMPLATE, PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective, PblCdkVirtualScrollDirective, PblColumn, PblColumnFactory, PblColumnGroup, PblMetaColumn, PblNgridAutoSizeVirtualScrollStrategy, PblNgridBaseVirtualScrollDirective, PblNgridCellComponent, PblNgridCellDefDirective, PblNgridCellEditAutoFocusDirective, PblNgridCellStyling, PblNgridColumnRowComponent, PblNgridComponent, PblNgridDataHeaderExtensionContext, PblNgridDynamicVirtualScrollStrategy, PblNgridEditorCellDefDirective, PblNgridFixedSizeVirtualScrollStrategy, PblNgridFooterCellComponent, PblNgridFooterCellDefDirective, PblNgridHeaderCellComponent, PblNgridHeaderCellDefDirective, PblNgridHeaderExtensionRefDirective, PblNgridHideColumns, PblNgridMetaCellComponent, PblNgridMetaRowComponent, PblNgridModule, PblNgridMultiComponentRegistry, PblNgridMultiTemplateRegistry, PblNgridNoDataRefDirective, PblNgridOuterSectionDirective, PblNgridPaginatorRefDirective, PblNgridPluginController, PblNgridRegistryService, PblNgridRowComponent, PblNgridRowDef, PblNgridRowOverride, PblNgridScrolling, PblNgridSingleTemplateRegistry, PblRowContext, columnFactory, isPblColumn, isPblColumnGroup, isPblMetaColumn, ngridPlugin, provideCommon, utils };
//# sourceMappingURL=pebula-ngrid.mjs.map
