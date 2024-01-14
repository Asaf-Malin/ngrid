import * as i0 from '@angular/core';
import { Directive, Input, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i2 from '@asafmalin/ngrid/core';
import { unrx, ON_INVALIDATE_HEADERS, getValue } from '@asafmalin/ngrid/core';
import * as i1 from '@asafmalin/ngrid';
import { columnFactory, PblColumn, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import { isObservable, of, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

const LOCAL_COLUMN_DEF = Symbol('LOCAL_COLUMN_DEF');
const VIRTUAL_REFRESH = {};
class TransposeTableSession {
    constructor(grid, pluginCtrl, updateColumns, sourceFactoryWrapper) {
        this.grid = grid;
        this.pluginCtrl = pluginCtrl;
        this.updateColumns = updateColumns;
        this.sourceFactoryWrapper = sourceFactoryWrapper;
        this.init();
        if (grid.columns && grid.columnApi.visibleColumns.length > 0) {
            this.onInvalidateHeaders();
        }
        this.onDataSource(this.grid.ds);
    }
    destroy(updateTable) {
        if (!this.destroyed) {
            this.destroyed = true;
            unrx.kill(this, this.grid);
            this.grid.showHeader = this.headerRow;
            this.grid.columns = this.columnsInput;
            if (updateTable) {
                this.grid.invalidateColumns();
                this.grid.ds.refresh(VIRTUAL_REFRESH);
            }
        }
    }
    init() {
        this.headerRow = this.grid.showHeader;
        this.grid.showHeader = false;
        this.pluginCtrl.events
            .pipe(ON_INVALIDATE_HEADERS, unrx(this, this.grid))
            .subscribe(e => this.onInvalidateHeaders());
        this.pluginCtrl.events
            .pipe(unrx(this, this.grid))
            .subscribe(e => e.kind === 'onDataSource' && this.onDataSource(e.curr));
    }
    onInvalidateHeaders() {
        if (!this.grid.columns[LOCAL_COLUMN_DEF]) {
            this.columnsInput = this.grid.columns;
            this.storeColumns = this.grid.columnApi.visibleColumns;
            this.updateColumns();
        }
    }
    onDataSource(ds) {
        this.unPatchDataSource();
        if (ds) {
            this.ds = ds;
            this.dsSourceFactory = ds.adapter.sourceFactory;
            this.ds.adapter.sourceFactory = (event) => {
                const rawSource = event.data.changed && event.data.curr === VIRTUAL_REFRESH
                    ? this.ds.source
                    : this.dsSourceFactory(event);
                if (rawSource === false) {
                    return rawSource;
                }
                else if (this.destroyed) {
                    this.unPatchDataSource();
                    return this.rawSource;
                }
                const obs = isObservable(rawSource)
                    ? rawSource
                    : Array.isArray(rawSource) ? of(rawSource) : from(rawSource) // promise...
                ;
                return obs
                    .pipe(tap(source => this.rawSource = source), map(this.sourceFactoryWrapper));
            };
        }
    }
    unPatchDataSource() {
        if (this.ds) {
            this.ds.adapter.sourceFactory = this.dsSourceFactory;
            this.ds = this.dsSourceFactory = undefined;
        }
    }
}

const TRANSFORM_ROW_REF = Symbol('TRANSFORM_ROW_REF');
function getCellValueAsHeader(row) {
    return row.label;
}
function getCellValueTransformed(colAsRow) {
    return getValue(colAsRow, this.data[TRANSFORM_ROW_REF]);
}
function createTransformedColumn(row, index) {
    return { prop: `__transform_item_${index}__`, data: { [TRANSFORM_ROW_REF]: row } };
}

const DEFAULT_HEADER_COLUMN = { prop: '__transpose__', css: 'pbl-ngrid-header-cell pbl-ngrid-transposed-header-cell' };
const PLUGIN_KEY = 'transpose';
/**
 * Transpose plugin.
 *
 * This plugin will swaps around the rows and columns of the grid.
 *
 * A **regular grid** (not transposed) represents rows horizontally:
 *
 * - Each horizontal row represents an item in the collection.
 * - Each vertical column represents the same property of all rows in the collection.
 *
 * A **transposed** grid represents row vertically:
 *
 * - Each horizontal row represents the same property of all rows in the collection.
 * - Each vertical row represents an item in the collection.
 *
 * > Note that transposing a grid might not play nice with other plugins and/or features.
 * For example, using pagination with transpose make no sense.
 */
class PblNgridTransposePluginDirective {
    constructor(grid, pluginCtrl, config) {
        this.grid = grid;
        this.pluginCtrl = pluginCtrl;
        this._header = DEFAULT_HEADER_COLUMN;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        const transposePlugin = config.get('transposePlugin');
        if (transposePlugin) {
            this.header = transposePlugin.header;
            this.defaultCol = transposePlugin.defaultCol || {};
            this.matchTemplates = transposePlugin.matchTemplates || false;
        }
        pluginCtrl.onInit()
            .subscribe(() => {
            if (this.enabled !== undefined) {
                this.updateState(undefined, this.enabled);
            }
        });
    }
    get transpose() { return this.enabled; }
    ;
    set transpose(value) {
        value = coerceBooleanProperty(value);
        if (value !== this.enabled && this.grid.isInit) {
            this.updateState(this.enabled, value);
        }
        this.enabled = value;
    }
    /**
     * Column definitions for the new header column, this is the column the first column that
     * will display all the headers.
     *
     * This is an optional value, when not set a default column settings is used:
     *
     * ```js
     * {
     *  prop: '__transpose__',
     *  css: 'pbl-ngrid-header-cell pbl-ngrid-transposed-header-cell',
     * }
     * ```
     *
     * When set, the new column values will merge into the default definitions, overriding existing properties
     * set on the default column settings.
     *
     * > The header column behave like any other column and you can also provide define it in the `column` property on the grid.
     * When using this approach the column defined on the grid is used as is (no merging). Just make sure you use the right `prop` value for it.
     * e.g. if `header` is not set here its `__transpose__` otherwise, the actual `prop` value.
     */
    set header(value) {
        this._header = Object.assign({}, DEFAULT_HEADER_COLUMN, value || {});
    }
    ngOnDestroy() {
        this._removePlugin(this.grid);
        this.disable(false);
        unrx.kill(this);
    }
    disable(updateTable) {
        if (this.gridState) {
            const { gridState } = this;
            this.columns = this.selfColumn = this.gridState = this.columns = this.selfColumn = undefined;
            gridState.destroy(updateTable);
        }
    }
    enable(refreshDataSource = false) {
        if (this.gridState) {
            this.disable(false);
        }
        const sourceFactoryWrapper = (results) => {
            if (results) {
                const local = this.grid.columns = columnFactory()
                    .default(this.defaultCol || {})
                    .table(this.selfColumn, ...results.map(createTransformedColumn))
                    .build();
                const prev = this.gridState.columnsInput;
                local.header = prev.header;
                local.headerGroup = prev.headerGroup;
                local.footer = prev.footer;
                local[LOCAL_COLUMN_DEF] = true;
                this.grid.invalidateColumns();
                const matchTemplates = coerceBooleanProperty(this.matchTemplates);
                const { prop } = this._header;
                const columnKeysToProxy = ['type'];
                if (matchTemplates) {
                    columnKeysToProxy.push('cellTpl');
                }
                /* The following logic is not for the faint of heart.
                   Basically, the transpose plugin does not swap the actual data but the columns.
                   When transposing, all rows will swap to columns so, A new column definition is created,
                   with columns equal to the total number or items in the datasource.
                   Each column (new one) represents a row so we save a reference to the actual row in the new column.
        
                   The next step is to create a new datasource, the new datasource is simply a collection of all of the original columns.
        
                   Now when `getValue` is called on the new column it is called with a "row" which is the original column.
                   Because the new column has a reference to the actual (original) row we can call the `getValue` on the old column with the actual row.
        
                   In this process, all of the column metadata related to the presentation layer is lost. For example, if CSS classes will
                   not be the same, templates, types etc... This is because when the grid renders a cell that cell has a single template across
                   all rows but now we need a different template for every row.
        
                   We can proxy a (VERY) limited set of metadata properties related to the presentation layer, valid only on render time.
                   This relays on the fact that each row is rendered complete, starting from the first cell to the last so
                   with that we can get a reference to the original column tha that now represents the whole row.
                 */
                let currentColumn;
                for (const c of this.grid.columnApi.visibleColumns) {
                    if (c.orgProp === prop) {
                        c.getValue = (row) => {
                            currentColumn = row;
                            return row.label;
                        };
                    }
                    else {
                        c.getValue = getCellValueTransformed;
                        for (const key of columnKeysToProxy) {
                            Object.defineProperty(c, key, { configurable: true, get: () => currentColumn && currentColumn[key], set: value => { } });
                        }
                    }
                }
                return this.columns;
            }
            return results;
        };
        this.gridState = new TransposeTableSession(this.grid, this.pluginCtrl, () => this.updateColumns(this.grid.columnApi.visibleColumns), sourceFactoryWrapper);
        if (refreshDataSource) {
            this.pluginCtrl.extApi.contextApi.clear();
            this.grid.ds.refresh();
        }
        else if (this.grid.ds.length > 0) {
            this.grid.ds.refresh(VIRTUAL_REFRESH);
        }
    }
    updateState(prev, curr) {
        const isFirst = prev === undefined;
        if (!curr) {
            this.disable(true);
        }
        else {
            this.enable(!isFirst);
        }
    }
    updateColumns(columns) {
        const { prop } = this._header;
        this.columns = [];
        for (const c of columns) {
            if (c.orgProp === prop) {
                this.selfColumn = c;
            }
            else {
                this.columns.push(c);
            }
        }
        if (!this.selfColumn) {
            // TODO: don't assume columns[0]
            this.selfColumn = new PblColumn(this._header, this.pluginCtrl.extApi.columnStore.groupStore);
        }
    }
}
/** @nocollapse */ PblNgridTransposePluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposePluginDirective, deps: [{ token: i1.PblNgridComponent }, { token: i1.PblNgridPluginController }, { token: i2.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridTransposePluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridTransposePluginDirective, selector: "pbl-ngrid[transpose]", inputs: { transpose: "transpose", header: ["transposeHeaderCol", "header"], defaultCol: ["transposeDefaultCol", "defaultCol"], matchTemplates: "matchTemplates" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposePluginDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[transpose]' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i1.PblNgridPluginController }, { type: i2.PblNgridConfigService }]; }, propDecorators: { transpose: [{
                type: Input
            }], header: [{
                type: Input,
                args: ['transposeHeaderCol']
            }], defaultCol: [{
                type: Input,
                args: ['transposeDefaultCol']
            }], matchTemplates: [{
                type: Input
            }] } });

class PblNgridTransposeModule {
}
PblNgridTransposeModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridTransposePluginDirective);
/** @nocollapse */ PblNgridTransposeModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridTransposeModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, declarations: [PblNgridTransposePluginDirective], imports: [CommonModule, PblNgridModule], exports: [PblNgridTransposePluginDirective] });
/** @nocollapse */ PblNgridTransposeModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, imports: [CommonModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, PblNgridModule],
                    declarations: [PblNgridTransposePluginDirective],
                    exports: [PblNgridTransposePluginDirective],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridTransposeModule, PblNgridTransposePluginDirective };
//# sourceMappingURL=pebula-ngrid-transpose.mjs.map
