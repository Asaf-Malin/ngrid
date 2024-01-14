import * as i0 from '@angular/core';
import { Directive, Input, NgModule } from '@angular/core';
import * as i1$1 from '@pebula/ngrid/core';
import { ON_RESIZE_ROW, ON_INVALIDATE_HEADERS } from '@pebula/ngrid/core';
import * as i1 from '@pebula/ngrid';
import { PblNgridPluginController, ngridPlugin, PblNgridModule } from '@pebula/ngrid';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

const PLUGIN_KEY = 'sticky';
function setStickyRow(grid, type, valueOrBulk, state) {
    const isHeader = type === 'header';
    const queryList = isHeader ? grid._headerRowDefs : grid._footerRowDefs;
    const bulk = Array.isArray(valueOrBulk) ? valueOrBulk : [[valueOrBulk, state]];
    const addOneIfMainExists = (isHeader && grid.showHeader) || (!isHeader && grid.showFooter) ? 1 : 0;
    let changed;
    for (const [value, state] of bulk) {
        // the index from the user is 0 based or the grid header/footer row.
        // we store them both, so we need to convert... our first is always the grid header/footer and then we have the same order as the user's.
        let idx = value === 'table' ? 0 : value + addOneIfMainExists;
        if (!isHeader) {
            // sticky-styler stickRows() methods will reverse the order of footer columns
            // so we actually need to set another row to make the row we want sticky.
            // we could reverse the collection, but choosing the opposite side is better.
            // think [0, 1, 2, 3, 4] and we want 1. sticky-styler will reverse to [4, 3, 2, 1, 0] so doing nothing will stick 3.
            // the opposite is length MINUS 1 MINUS index which is 5 - 1 - 1 which is 3, in the revered array its the row 1 which is what we wanted.
            idx = (queryList.length - 1) - idx;
        }
        const rowDef = queryList.toArray()[idx];
        if (rowDef && rowDef.sticky !== state) {
            rowDef.sticky = state;
            changed = true;
        }
    }
    if (changed) {
        const cdkTable = PblNgridPluginController.find(grid).extApi.cdkTable;
        if (isHeader) {
            cdkTable.updateStickyHeaderRowStyles();
        }
        else {
            cdkTable.updateStickyFooterRowStyles();
        }
    }
}
function setStickyColumns(grid, type, valueOrBulk, state) {
    const bulk = Array.isArray(valueOrBulk) ? valueOrBulk : [[valueOrBulk, state]];
    let changed;
    for (let [columnId, state] of bulk) {
        if (typeof columnId === 'string') {
            columnId = grid.columnApi.visibleColumns.findIndex(c => c.orgProp === columnId);
        }
        const c = grid.columnApi.visibleColumns[columnId];
        if (c) {
            changed = true;
            c.pin = state ? type : undefined;
            if (type === 'end') {
                c.columnDef.stickyEnd = state;
                c.columnDef.sticky = false;
            }
            else {
                c.columnDef.sticky = state;
                c.columnDef.stickyEnd = false;
            }
        }
    }
    if (changed) {
        const cdkTable = PblNgridPluginController.find(grid).extApi.cdkTable;
        cdkTable.updateStickyColumnStyles();
    }
}
class PblNgridStickyPluginDirective {
    constructor(grid, _differs, pluginCtrl) {
        this.grid = grid;
        this._differs = _differs;
        this.pluginCtrl = pluginCtrl;
        this._columnCache = { start: [], end: [] };
        this.viewInitialized = false;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        pluginCtrl.events
            .pipe(ON_RESIZE_ROW)
            .subscribe(() => {
            const cdkTable = pluginCtrl.extApi.cdkTable;
            cdkTable.updateStickyHeaderRowStyles();
            cdkTable.updateStickyColumnStyles();
            cdkTable.updateStickyFooterRowStyles();
        });
        pluginCtrl.events
            .pipe(ON_INVALIDATE_HEADERS)
            .subscribe(() => {
            if (this._startDiffer && this.grid.isInit) {
                this._startDiffer.diff([]);
                this.applyColumnDiff('start', this._columnCache.start, this._startDiffer);
            }
            if (this._endDiffer && this.grid.isInit) {
                this._endDiffer.diff([]);
                this.applyColumnDiff('end', this._columnCache.end, this._endDiffer);
            }
        });
    }
    /**
     * Set the header rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main header row.
     *   - number  - The index of the row, for multi-header row. The index refers to the order you defined the header/headerGroup rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyColumnStart(value) {
        if (!this._startDiffer) {
            this._startDiffer = this._differs.find([]).create();
        }
        this.applyColumnDiff('start', value, this._startDiffer);
    }
    /**
     * Set the footer rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main footer row.
     *   - number  - The index of the row, for multi-footer row. The index refers to the order you defined the footer rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyColumnEnd(value) {
        if (!this._endDiffer) {
            this._endDiffer = this._differs.find([]).create();
        }
        this.applyColumnDiff('end', value, this._endDiffer);
    }
    /**
   * Set the header rows you want to apply sticky positioning to.
   * Valid values are:
   *   - `grid` - Literal string `grid` that will set the grid's main header row.
   *   - number  - The index of the row, for multi-header row. The index refers to the order you defined the header/headerGroup rows (base 0);
   *
   * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
   * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
   */
    set stickyHeader(value) {
        if (!this._headerDiffer) {
            this._headerDiffer = this._differs.find([]).create();
        }
        this.applyRowDiff('header', value, this._headerDiffer);
    }
    /**
     * Set the footer rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main footer row.
     *   - number  - The index of the row, for multi-footer row. The index refers to the order you defined the footer rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyFooter(value) {
        if (!this._footerDiffer) {
            this._footerDiffer = this._differs.find([]).create();
        }
        this.applyRowDiff('footer', value, this._footerDiffer);
    }
    ngAfterViewInit() {
        this.viewInitialized = true;
    }
    ngOnDestroy() {
        this._removePlugin(this.grid);
    }
    applyColumnDiff(type, value, differ) {
        if (!this.viewInitialized) {
            requestAnimationFrame(() => this.applyColumnDiff(type, value, differ));
            return;
        }
        this._columnCache[type] = value || [];
        const changes = differ.diff(value || []);
        const bulk = [];
        changes.forEachOperation((record, prevIndex, currentIndex) => {
            if (record.previousIndex == null) {
                bulk.push([record.item, true]);
            }
            else if (currentIndex == null) {
                bulk.push([record.item, false]);
            }
        });
        if (bulk.length > 0) {
            setStickyColumns(this.grid, type, bulk);
        }
    }
    applyRowDiff(type, value, differ) {
        if (!this.grid.isInit) {
            this.pluginCtrl.onInit()
                .subscribe(() => {
                this.applyRowDiff(type, value, differ);
            });
            return;
        }
        const changes = differ.diff(value || []);
        const bulk = [];
        changes.forEachOperation((record, prevIndex, currentIndex) => {
            if (record.previousIndex == null) {
                bulk.push([record.item, true]);
            }
            else if (currentIndex == null) {
                bulk.push([record.item, false]);
            }
        });
        if (bulk.length > 0) {
            setStickyRow(this.grid, type, bulk);
        }
    }
}
/** @nocollapse */ PblNgridStickyPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyPluginDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.IterableDiffers }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridStickyPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridStickyPluginDirective, selector: "pbl-ngrid[stickyColumnStart], pbl-ngrid[stickyColumnEnd], pbl-ngrid[stickyHeader], pbl-ngrid[stickyFooter]", inputs: { stickyColumnStart: "stickyColumnStart", stickyColumnEnd: "stickyColumnEnd", stickyHeader: "stickyHeader", stickyFooter: "stickyFooter" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyPluginDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[stickyColumnStart], pbl-ngrid[stickyColumnEnd], pbl-ngrid[stickyHeader], pbl-ngrid[stickyFooter]' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.IterableDiffers }, { type: i1.PblNgridPluginController }]; }, propDecorators: { stickyColumnStart: [{
                type: Input
            }], stickyColumnEnd: [{
                type: Input
            }], stickyHeader: [{
                type: Input
            }], stickyFooter: [{
                type: Input
            }] } });

const MAPPER = (v) => [v, true];
class PblNgridStickyModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridStickyModule, (grid, controller) => {
            if (controller && !controller.hasPlugin('sticky')) {
                controller.onInit()
                    .subscribe(() => {
                    const stickyPluginConfig = configService.get('stickyPlugin');
                    if (stickyPluginConfig) {
                        if (stickyPluginConfig.headers) {
                            setStickyRow(grid, 'header', stickyPluginConfig.headers.map(MAPPER));
                        }
                        if (stickyPluginConfig.footers) {
                            setStickyRow(grid, 'footer', stickyPluginConfig.footers.map(MAPPER));
                        }
                        if (stickyPluginConfig.columnStart) {
                            setStickyColumns(grid, 'start', stickyPluginConfig.columnStart.map(MAPPER));
                        }
                        if (stickyPluginConfig.columnEnd) {
                            setStickyColumns(grid, 'end', stickyPluginConfig.columnEnd.map(MAPPER));
                        }
                    }
                });
            }
        });
    }
}
PblNgridStickyModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridStickyPluginDirective);
/** @nocollapse */ PblNgridStickyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, deps: [{ token: i1$1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridStickyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, declarations: [PblNgridStickyPluginDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridStickyPluginDirective] });
/** @nocollapse */ PblNgridStickyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridStickyPluginDirective],
                    exports: [PblNgridStickyPluginDirective],
                }]
        }], ctorParameters: function () { return [{ type: i1$1.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridStickyModule, PblNgridStickyPluginDirective, setStickyColumns, setStickyRow };
//# sourceMappingURL=pebula-ngrid-sticky.mjs.map
