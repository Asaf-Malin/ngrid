import * as i1 from '@asafmalin/ngrid';
import { PblNgridPluginController, utils, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import { Subject } from 'rxjs';
import { filter, mapTo, map, take, skip, debounceTime } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { Directive, Input, NgModule } from '@angular/core';
import * as i1$1 from '@asafmalin/ngrid/core';
import { ON_INVALIDATE_HEADERS, ON_RESIZE_ROW, ON_DESTROY } from '@asafmalin/ngrid/core';
import { CommonModule } from '@angular/common';

let _instance;
class StateVisor {
    constructor() {
        this.rootChunkSections = new Map();
        this.chunkHandlers = new Map();
    }
    static get() { return _instance || (_instance = new StateVisor()); }
    registerRootChunkSection(chunkId, config) {
        if (!this.rootChunkSections.has(chunkId)) {
            this.rootChunkSections.set(chunkId, config);
        }
    }
    registerChunkHandlerDefinition(chunkHandlerDefs) {
        const { chunkId } = chunkHandlerDefs;
        const handlersForGroup = this.chunkHandlers.get(chunkId) || [];
        handlersForGroup.push(chunkHandlerDefs);
        this.chunkHandlers.set(chunkId, handlersForGroup);
    }
    getRootSections() {
        return Array.from(this.rootChunkSections.entries());
    }
    getDefinitionsForSection(chunkId) {
        return this.chunkHandlers.get(chunkId) || [];
    }
}
const stateVisor = StateVisor.get();

class PblNgridLocalStoragePersistAdapter {
    save(id, state) {
        try {
            const store = this.loadGlobalStateStore();
            store[id] = state;
            if (!state.__metadata__) {
                state.__metadata__ = {};
            }
            state.__metadata__.updatedAt = new Date().toISOString();
            this.saveGlobalStateStore(store);
            return Promise.resolve();
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    load(id) {
        return Promise.resolve(this.loadGlobalStateStore()[id] || {});
    }
    exists(id) {
        const store = this.loadGlobalStateStore() || {};
        return Promise.resolve(id in store);
    }
    loadGlobalStateStore() {
        const raw = localStorage.getItem(PblNgridLocalStoragePersistAdapter.globalStateKey);
        return raw ? JSON.parse(raw) : {};
    }
    saveGlobalStateStore(store) {
        localStorage.setItem(PblNgridLocalStoragePersistAdapter.globalStateKey, JSON.stringify(store));
    }
}
PblNgridLocalStoragePersistAdapter.globalStateKey = 'pebulaNgridState';

/* ======================= Global State Object */

class PblNgridStateChunkHandlerHost {
    constructor(chunkId) {
        this.chunkId = chunkId;
        this.keys = new Set();
        this.rKeys = new Set();
    }
    handleKeys(...keys) {
        for (const k of keys) {
            this.keys.add(k);
        }
        return this;
    }
    /**
     * Required keys are keys that cannot get excluded.
     * Either by adding the to the `exclude` option or by omitting them from the `include` option.
     */
    requiredKeys(...keys) {
        for (const k of keys) {
            this.keys.add(k);
            this.rKeys.add(k);
        }
        return this;
    }
    serialize(fn) {
        this.sFn = fn;
        return this;
    }
    deserialize(fn) {
        this.dFn = fn;
        return this;
    }
    register() {
        if (this.keys.size === 0) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid state chunk handler, no keys defined.');
            }
            return;
        }
        if (!this.sFn) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid state chunk handler, missing serialize handler.');
            }
            return;
        }
        if (!this.dFn) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid state chunk handler, missing deserialize handler.');
            }
            return;
        }
        stateVisor.registerChunkHandlerDefinition({
            chunkId: this.chunkId,
            keys: Array.from(this.keys.values()),
            rKeys: Array.from(this.rKeys.values()),
            serialize: this.sFn,
            deserialize: this.dFn,
        });
    }
}
function createStateChunkHandler(section) {
    return new PblNgridStateChunkHandlerHost(section);
}

class PblNgridIdAttributeIdentResolver {
    resolveId(ctx) {
        return ctx.grid.id;
    }
}

function resolveId(grid, options) {
    const id = options.identResolver.resolveId(createChunkSectionContext(grid, options));
    if (!id) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw new Error('Could not resolve a unique id for an ngrid instance, state is disabled');
        }
    }
    return id;
}
function serialize(def, state, ctx) {
    const keyPredicate = stateKeyPredicateFactory(def.chunkId, ctx.options);
    for (const key of def.keys) {
        if (!keyPredicate || def.rKeys.indexOf(key) > -1 || keyPredicate(key)) {
            state[key] = def.serialize(key, ctx);
        }
    }
}
function deserialize(def, state, ctx) {
    const keyPredicate = stateKeyPredicateFactory(def.chunkId, ctx.options);
    for (const key of def.keys) {
        if (key in state) {
            if (!keyPredicate || def.rKeys.indexOf(key) > -1 || keyPredicate(key)) {
                def.deserialize(key, state[key], ctx);
            }
        }
    }
}
function normalizeOptions(mode, options) {
    if (!options) {
        options = {};
    }
    if (!options.persistenceAdapter) {
        options.persistenceAdapter = new PblNgridLocalStoragePersistAdapter();
    }
    if (!options.identResolver) {
        options.identResolver = new PblNgridIdAttributeIdentResolver();
    }
    if (mode === 'load') {
        const opt = options;
        if (!opt.strategy) {
            opt.strategy = 'overwrite';
        }
    }
    return options;
}
function getExtApi(grid) {
    const controller = PblNgridPluginController.find(grid);
    if (controller) {
        return controller.extApi;
    }
}
function createChunkSectionContext(grid, options) {
    return { grid, extApi: getExtApi(grid), options };
}
function createChunkContext(sectionContext, chunkConfig, mode) {
    return {
        ...sectionContext,
        source: chunkConfig.sourceMatcher(sectionContext),
        runChildChunk(childChunkId, state, source, data) {
            const childContext = { ...sectionContext, source, data };
            const defs = stateVisor.getDefinitionsForSection(childChunkId);
            const action = mode === 'serialize' ? serialize : deserialize;
            for (const def of defs) {
                action(def, state, childContext);
            }
        }
    };
}
function stateKeyPredicateFactory(chunkId, options, rootPredicate = false) {
    // TODO: chunkId ans options include/exclude combination does not change
    // we need to cache it... e.g. each column def will create a new predicate if we don't cache.
    const filter = options.include || options.exclude;
    if (filter) {
        // -1: Exclude, 1: Include
        const mode = filter === options.include ? 1 : -1;
        const chunkFilter = filter[chunkId];
        if (typeof chunkFilter === 'boolean') {
            return mode === 1
                ? (key) => chunkFilter
                : (key) => !chunkFilter;
        }
        else if (Array.isArray(chunkFilter)) {
            if (rootPredicate) {
                // root predicate is for RootStateChunks and when set to true
                // the key itself has no impact on the predicate. If the filter is boolean nothing changes
                // but if it's an array, the array is ignored and considered as true ignoring the key because a key does not existing when checking the root
                return k => true;
            }
            else {
                return mode === 1
                    ? (key) => chunkFilter.indexOf(key) > -1
                    : (key) => chunkFilter.indexOf(key) === -1;
            }
        }
        else if (mode === 1) {
            return (key) => false;
        }
    }
}

function hasState(grid, options) {
    return Promise.resolve()
        .then(() => {
        options = normalizeOptions('save', options);
        const id = resolveId(grid, options);
        return options.persistenceAdapter.exists(id);
    });
}
function saveState(grid, options) {
    return Promise.resolve()
        .then(() => {
        options = normalizeOptions('save', options);
        const id = resolveId(grid, options);
        const state = {};
        const context = createChunkSectionContext(grid, options);
        for (const [chunkId, chunkConfig] of stateVisor.getRootSections()) {
            const keyPredicate = stateKeyPredicateFactory(chunkId, options, true);
            if (!keyPredicate || keyPredicate(chunkId)) {
                const sectionState = chunkConfig.stateMatcher(state);
                const chunkContext = createChunkContext(context, chunkConfig, 'serialize');
                const defs = stateVisor.getDefinitionsForSection(chunkId);
                for (const def of defs) {
                    serialize(def, sectionState, chunkContext);
                }
            }
        }
        return options.persistenceAdapter.save(id, state);
    });
}
function loadState(grid, options) {
    return Promise.resolve()
        .then(() => {
        options = normalizeOptions('load', options);
        const id = resolveId(grid, options);
        return options.persistenceAdapter.load(id)
            .then(state => {
            const context = createChunkSectionContext(grid, options);
            for (const [chunkId, chunkConfig] of stateVisor.getRootSections()) {
                const keyPredicate = stateKeyPredicateFactory(chunkId, options, true);
                if (!keyPredicate || keyPredicate(chunkId)) {
                    const sectionState = chunkConfig.stateMatcher(state);
                    const chunkContext = createChunkContext(context, chunkConfig, 'deserialize');
                    const defs = stateVisor.getDefinitionsForSection(chunkId);
                    for (const def of defs) {
                        deserialize(def, sectionState, chunkContext);
                    }
                }
            }
            return state;
        });
    });
}

function registerGridHandlers() {
    stateVisor.registerRootChunkSection('grid', {
        sourceMatcher: ctx => ctx.grid,
        stateMatcher: state => state.grid || (state.grid = {})
    });
    createStateChunkHandler('grid')
        .handleKeys('showHeader', 'showFooter', 'focusMode', 'usePagination', 'minDataViewHeight')
        .serialize((key, ctx) => {
        switch (key) {
            default:
                return ctx.source[key];
        }
    })
        .deserialize((key, stateValue, ctx) => {
        // We must assert the type starting from 3.5 onwards
        // See "Fixes to unsound writes to indexed access types" in https://devblogs.microsoft.com/typescript/announcing-typescript-3-5
        ctx.source[key] = stateValue;
    })
        .register();
}

function registerColumnDefChildHandlers() {
    /* ====================================================================================================================================================== */
    createStateChunkHandler('dataColumn')
        .requiredKeys('id', 'prop')
        .handleKeys('label', 'css', 'type', 'width', 'minWidth', 'maxWidth', // PblNgridBaseColumnState (all optional)
    'headerType', 'footerType', 'sort', 'alias', 'editable', 'pin')
        .serialize((key, ctx) => {
        const c = ctx.data.activeColumn || ctx.data.pblColumn;
        if (c) {
            switch (key) {
                case 'prop':
                    return c.orgProp;
                default:
                    break;
            }
        }
        const value = c ? c[key] : ctx.source[key];
        switch (key) {
            case 'sort':
                if (typeof value === 'boolean') {
                    return value;
                }
                else {
                    return;
                }
            default:
                break;
        }
        return value;
    })
        .deserialize((key, stateValue, ctx) => {
        const { activeColumn } = ctx.data;
        if (activeColumn) {
            switch (key) {
                case 'width':
                    activeColumn.updateWidth(stateValue);
                    break;
            }
        }
        if (ctx.source) {
            switch (key) {
                case 'prop':
                    return;
                case 'type':
                case 'headerType':
                case 'footerType':
                    const typeValue = ctx.source[key];
                    const stateTypeDef = stateValue;
                    if (stateTypeDef && typeof stateTypeDef !== 'string' && typeValue && typeof typeValue !== 'string') {
                        typeValue.name = stateTypeDef.name;
                        if (stateTypeDef.data) {
                            typeValue.data = Object.assign(typeValue.data || {}, stateTypeDef.data);
                        }
                        return;
                    }
                    break;
            }
            // We must assert the type starting from 3.5 onwards
            // See "Fixes to unsound writes to indexed access types" in https://devblogs.microsoft.com/typescript/announcing-typescript-3-5
            ctx.source[key] = stateValue;
        }
    })
        .register();
    /* ====================================================================================================================================================== */
    createStateChunkHandler('dataMetaRow')
        .handleKeys('rowClassName', 'type') // All Optional
        .serialize((key, ctx) => {
        const active = ctx.data.active || ctx.source;
        if (active) {
            return active[key];
        }
    })
        .deserialize((key, stateValue, ctx) => {
        // We must assert the type starting from 3.5 onwards
        // See "Fixes to unsound writes to indexed access types" in https://devblogs.microsoft.com/typescript/announcing-typescript-3-5
        ctx.source[key] = stateValue;
    })
        .register();
    /* ====================================================================================================================================================== */
    createStateChunkHandler('metaRow')
        // Note that we are not handling `cols`, this should be called from the parent, as a different child chunk handling process for each column
        .handleKeys('rowClassName', 'type', // All Optional like dataMetaRow
    'rowIndex')
        .serialize((key, ctx) => {
        return ctx.source[key];
    })
        .deserialize((key, stateValue, ctx) => {
    })
        .register();
    /* ====================================================================================================================================================== */
    createStateChunkHandler('metaGroupRow')
        // Note that we are not handling `cols`, this should be called from the parent, as a different child chunk handling process for each column
        .handleKeys('rowClassName', 'type', // All Optional like dataMetaRow
    'rowIndex')
        .serialize((key, ctx) => {
        return ctx.source[key];
    })
        .deserialize((key, stateValue, ctx) => {
    })
        .register();
    /* ====================================================================================================================================================== */
    createStateChunkHandler('metaColumn')
        .requiredKeys('kind', 'rowIndex')
        .handleKeys('id', 'label', 'css', 'type', 'width', 'minWidth', 'maxWidth')
        .serialize((key, ctx) => {
        return ctx.source[key];
    })
        .deserialize((key, stateValue, ctx) => {
    })
        .register();
    /* ====================================================================================================================================================== */
    createStateChunkHandler('metaGroupColumn')
        .requiredKeys('columnIds', 'rowIndex')
        .handleKeys('id', 'label', 'css', 'type', 'width', 'minWidth', 'maxWidth')
        .serialize((key, ctx) => {
        return ctx.source[key];
    })
        .deserialize((key, stateValue, ctx) => {
    })
        .register();
}

function runChildChunksForRowMetaColumns(childChunkId, ctx, columns) {
    const stateColumns = [];
    for (const col of columns) {
        const c = {};
        ctx.runChildChunk(childChunkId, c, col);
        stateColumns.push(c);
    }
    return stateColumns;
}
/** Runs the process for the `header` and `footer` sections in the `table` section (if they exist) */
function runChildChunkForDataMetaRows(mode, state, ctx) {
    const { columnStore } = ctx.extApi;
    const { table } = ctx.source;
    for (const kind of ['header', 'footer']) {
        // This is a mapping of the from->to relationship (i.e serializing or deserializing)
        const src = mode === 's' ? table : state;
        const dest = src === table ? state : table;
        // we need to have a source
        if (src[kind]) {
            const active = kind === 'header' ? columnStore.headerColumnDef : columnStore.footerColumnDef;
            if (!dest[kind]) {
                dest[kind] = {};
            }
            ctx.runChildChunk('dataMetaRow', state[kind], table[kind], { kind, active });
        }
    }
}
function runChildChunksForRowDataColumns(mode, state, ctx) {
    const { table } = ctx.source;
    const src = mode === 's' ? table : state;
    const resolve = src === state
        ? col => ({ colState: col, pblColumn: table.cols.find(tCol => (utils.isPblColumn(tCol) && tCol.orgProp === col.prop) || (tCol.id === col.id || tCol.prop === col.prop)) })
        : col => ({ colState: state.cols[state.cols.push({}) - 1], pblColumn: utils.isPblColumn(col) && col });
    if (src.cols && src.cols.length > 0) {
        for (const col of src.cols) {
            const { colState, pblColumn } = resolve(col);
            const data = {
                pblColumn: utils.isPblColumn(pblColumn) && pblColumn,
                activeColumn: ctx.grid.columnApi.findColumn(col.id || col.prop),
            };
            ctx.runChildChunk('dataColumn', colState, pblColumn, data);
        }
    }
}
function registerColumnDefHandlers() {
    stateVisor.registerRootChunkSection('columns', {
        sourceMatcher: ctx => ctx.grid.columns,
        stateMatcher: state => state.columns || (state.columns = {
            table: {
                cols: [],
            },
            header: [],
            footer: [],
            headerGroup: [],
        })
    });
    createStateChunkHandler('columns')
        .handleKeys('table', 'header', 'headerGroup', 'footer')
        .serialize((key, ctx) => {
        switch (key) {
            case 'table':
                const state = { cols: [] };
                runChildChunkForDataMetaRows('s', state, ctx);
                runChildChunksForRowDataColumns('s', state, ctx);
                return state;
            case 'header':
            case 'footer':
                const source = ctx.source[key];
                if (source && source.length > 0) {
                    const rows = [];
                    for (const row of source) {
                        const r = {};
                        ctx.runChildChunk('metaRow', r, row);
                        r.cols = runChildChunksForRowMetaColumns('metaColumn', ctx, row.cols);
                        rows.push(r);
                    }
                    return rows;
                }
                break;
            case 'headerGroup':
                const headerGroupSource = ctx.source.headerGroup;
                if (headerGroupSource && headerGroupSource.length > 0) {
                    const rows = [];
                    for (const row of headerGroupSource) {
                        const r = {};
                        ctx.runChildChunk('metaGroupRow', r, row);
                        r.cols = runChildChunksForRowMetaColumns('metaColumn', ctx, row.cols);
                        rows.push(r);
                    }
                    return rows;
                }
                break;
        }
    })
        .deserialize((key, stateValue, ctx) => {
        switch (key) {
            case 'table':
                const state = stateValue;
                runChildChunkForDataMetaRows('d', state, ctx);
                runChildChunksForRowDataColumns('d', state, ctx);
                break;
            case 'header':
            case 'footer':
                const source = ctx.source[key];
                const metaRowsState = stateValue;
                if (metaRowsState && metaRowsState.length > 0) {
                    for (const rowState of metaRowsState) {
                        const row = source.find(r => r.rowIndex === rowState.rowIndex);
                        if (row) {
                            ctx.runChildChunk('metaRow', rowState, row);
                            for (const colState of rowState.cols) {
                                const col = row.cols.find(r => r.id === colState.id);
                                if (col) {
                                    const activeColStore = ctx.extApi.columnStore.find(colState.id);
                                    ctx.runChildChunk('metaColumn', colState, col);
                                }
                            }
                        }
                    }
                }
                break;
            case 'headerGroup':
                break;
        }
    })
        .register();
    registerColumnDefChildHandlers();
}

function registerColumnOrderHandlers() {
    stateVisor.registerRootChunkSection('columnOrder', {
        sourceMatcher: ctx => ctx.grid.columnApi,
        stateMatcher: state => {
            if (!state.columnOrder) {
                state.columnOrder = [];
            }
            return state;
        }
    });
    createStateChunkHandler('columnOrder')
        .handleKeys('columnOrder')
        .serialize((key, ctx) => ctx.source.visibleColumnIds.slice())
        .deserialize((key, columnOrder, ctx) => {
        const { extApi, grid } = ctx;
        let lastMove;
        if (columnOrder?.length === grid.columnApi.visibleColumns.length) {
            for (let i = 0, len = columnOrder.length; i < len; i++) {
                const anchor = grid.columnApi.visibleColumns[i];
                if (columnOrder[i] !== anchor.id) {
                    const column = grid.columnApi.findColumn(columnOrder[i]);
                    if (!column) {
                        return;
                    }
                    lastMove = [column, anchor];
                    grid.columnApi.moveColumn(column, anchor);
                }
            }
        }
        // With this revert/redo of the last move we just trigger a redraw.
        if (lastMove) {
            grid.columnApi.moveColumn(lastMove[1], lastMove[0]);
            grid.columnApi.moveColumn(lastMove[0], lastMove[1]);
        }
    })
        .register();
}

/**
 * Return's the `User Preferences` preset which focuses on saving and restoring state that the user
 * can define and would want to restore between sessions.
 *
 * For example, saving column width's which the user might have changed using the mouse or any other custom way provided to him (through API).
 * Saving the column order, so if the user re-ordered the table the order can be loaded back again...
 */
function userSessionPref(...basedOn) {
    const resultFilter = {
        grid: [
            'showFooter',
            'showHeader',
        ],
        columnVisibility: true,
        columnOrder: true,
        columns: ['table'],
        dataColumn: [
            'width',
        ]
    };
    if (basedOn.length > 0) {
        for (const b of basedOn)
            mergeStateChunkKeyFilter(resultFilter, b);
    }
    return resultFilter;
}
/**
 * Merge a head and tail chunk filters so keys from tail will be merged into head if:
 *
 * - The key does not exist in head
 * - The key exist in head but the value of it is an Array and the value of tail is an Array as well.
 *   In such case, both array's are merged into a single unique array.
 */
function mergeStateChunkKeyFilter(mergeHead, mergeTail) {
    for (const k of Object.keys(mergeTail)) {
        const tailValue = mergeTail[k];
        if (k in mergeHead) {
            const tailHead = mergeHead[k];
            if (Array.isArray(tailHead) && Array.isArray(tailValue)) {
                const s = new Set([...tailHead, ...tailValue]);
                mergeHead[k] = Array.from(s.values());
            }
        }
        else {
            mergeHead[k] = mergeTail[k];
        }
    }
}

const PLUGIN_KEY = 'state';
class PblNgridStatePlugin {
    constructor(grid, injector, pluginCtrl) {
        this.grid = grid;
        this.injector = injector;
        this.pluginCtrl = pluginCtrl;
        this._events = new Subject();
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        this.afterLoadState = this._events.pipe(filter(e => e.phase === 'load' && e.position === 'after'), mapTo(undefined));
        this.afterSaveState = this._events.pipe(filter(e => e.phase === 'save' && e.position === 'after'), mapTo(undefined));
        this.onError = this._events.pipe(filter(e => !!e.error), map(e => ({ phase: e.phase, error: e.error })));
        pluginCtrl.events
            .pipe(ON_INVALIDATE_HEADERS, take(1))
            .subscribe(event => {
            const initialLoadOptions = { ...(this.loadOptions || {}), avoidRedraw: true };
            hasState(grid, initialLoadOptions)
                .then(value => {
                if (value) {
                    return this._load(initialLoadOptions);
                }
            })
                .then(() => {
                pluginCtrl.events
                    .pipe(ON_RESIZE_ROW, skip(1), debounceTime(500))
                    .subscribe(event => this.save());
            });
        });
        pluginCtrl.events
            .pipe(ON_DESTROY)
            .subscribe(event => {
            event.wait(this.save());
            this._events.complete();
        });
    }
    static create(table, injector) {
        const pluginCtrl = PblNgridPluginController.find(table);
        return new PblNgridStatePlugin(table, injector, pluginCtrl);
    }
    load() {
        return this._load(this.loadOptions);
    }
    save() {
        return saveState(this.grid, this.saveOptions)
            .then(() => this._events.next({ phase: 'save', position: 'after' }))
            .catch(error => this._events.next({ phase: 'save', position: 'after', error }));
    }
    destroy() {
        this._removePlugin(this.grid);
    }
    _load(loadOptions) {
        return loadState(this.grid, loadOptions)
            .then(() => this._events.next({ phase: 'load', position: 'after' }))
            .catch(error => this._events.next({ phase: 'load', position: 'after', error }));
    }
}
class PblNgridStatePluginDirective extends PblNgridStatePlugin {
    constructor(grid, injector, pluginCtrl) {
        super(grid, injector, pluginCtrl);
        this.loadOptions = { include: userSessionPref() };
        this.saveOptions = { include: userSessionPref() };
    }
    ngOnDestroy() {
        this.destroy();
    }
}
/** @nocollapse */ PblNgridStatePluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridStatePluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridStatePluginDirective, selector: "pbl-ngrid[persistState]", inputs: { loadOptions: "loadOptions", saveOptions: "saveOptions" }, outputs: { afterLoadState: "afterLoadState", afterSaveState: "afterSaveState", onError: "onError" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[persistState]',
                    outputs: ['afterLoadState', 'afterSaveState', 'onError'],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { loadOptions: [{
                type: Input
            }], saveOptions: [{
                type: Input
            }] } });

function registerColumnVisibilityHandlers() {
    stateVisor.registerRootChunkSection('columnVisibility', {
        sourceMatcher: ctx => ctx.grid.columnApi,
        stateMatcher: state => {
            if (!state.columnVisibility) {
                state.columnVisibility = [];
            }
            return state;
        }
    });
    createStateChunkHandler('columnVisibility')
        .handleKeys('columnVisibility')
        .serialize((key, ctx) => ctx.source.hiddenColumnIds)
        .deserialize((key, columnVisibility, ctx) => {
        ctx.extApi.columnStore.updateColumnVisibility(columnVisibility);
    })
        .register();
}

function registerBuiltInHandlers() {
    registerGridHandlers();
    registerColumnDefHandlers();
    registerColumnVisibilityHandlers(); // order is important, we want visibility set before ordering
    registerColumnOrderHandlers();
}

class PblNgridStatePluginModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridStatePluginModule, (grid, controller) => {
            const targetEventsConfig = configService.get(PLUGIN_KEY);
            if (targetEventsConfig && targetEventsConfig.autoEnable === true) {
                controller.onInit()
                    .subscribe(() => {
                    if (!controller.hasPlugin(PLUGIN_KEY)) {
                        const instance = controller.createPlugin(PLUGIN_KEY);
                        if (targetEventsConfig.autoEnableOptions) {
                            instance.loadOptions = targetEventsConfig.autoEnableOptions.loadOptions;
                            instance.saveOptions = targetEventsConfig.autoEnableOptions.saveOptions;
                        }
                    }
                });
            }
        });
    }
}
PblNgridStatePluginModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create', runOnce: registerBuiltInHandlers }, PblNgridStatePlugin);
/** @nocollapse */ PblNgridStatePluginModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, deps: [{ token: i1$1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridStatePluginModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, declarations: [PblNgridStatePluginDirective], imports: [CommonModule,
        PblNgridModule], exports: [PblNgridStatePluginDirective] });
/** @nocollapse */ PblNgridStatePluginModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, imports: [CommonModule,
        PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        PblNgridModule,
                    ],
                    declarations: [
                        PblNgridStatePluginDirective,
                    ],
                    exports: [
                        PblNgridStatePluginDirective,
                    ],
                    providers: [],
                }]
        }], ctorParameters: function () { return [{ type: i1$1.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridLocalStoragePersistAdapter, PblNgridStatePlugin, PblNgridStatePluginDirective, PblNgridStatePluginModule, StateVisor, createStateChunkHandler, hasState, loadState, registerColumnDefHandlers, registerColumnOrderHandlers, registerGridHandlers, saveState, stateVisor, userSessionPref };
//# sourceMappingURL=pebula-ngrid-state.mjs.map
