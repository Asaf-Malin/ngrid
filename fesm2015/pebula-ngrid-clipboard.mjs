import { filter } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { Directive, Input, NgModule } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { unrx } from '@pebula/ngrid/core';
import * as i1 from '@pebula/ngrid';
import { PblNgridConfigService, PblNgridPluginController, ngridPlugin, PblNgridModule } from '@pebula/ngrid';
import { CommonModule } from '@angular/common';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';

const IS_OSX = /^mac/.test(navigator.platform.toLowerCase());
const DEFAULT_CELL_SEP = '\t';
const DEFAULT_ROW_SEP = '\n';
const PLUGIN_KEY = 'clipboard';
class PblNgridClipboardPlugin {
    constructor(grid, injector, pluginCtrl) {
        this.grid = grid;
        this.injector = injector;
        this.pluginCtrl = pluginCtrl;
        this.config = injector.get(PblNgridConfigService);
        this.clipboard = injector.get(Clipboard);
        this.init();
    }
    static create(grid, injector) {
        const pluginCtrl = PblNgridPluginController.find(grid);
        return new PblNgridClipboardPlugin(grid, injector, pluginCtrl);
    }
    ngOnDestroy() {
        unrx.kill(this);
        this._removePlugin(this.grid);
    }
    isCopyEvent(event) {
        if (event instanceof KeyboardEvent && event.key === 'c') {
            if ((!IS_OSX && event.ctrlKey) || (IS_OSX && event.metaKey)) {
                return true;
            }
        }
        return false;
    }
    doCopy() {
        const { cellSeparator, rowSeparator } = this.config.get('clipboard', {});
        const { rows, minIndex } = this.getSelectedRowData(this.grid);
        const createRow = (row) => row.slice(minIndex).join(this.clpCellSep || cellSeparator || DEFAULT_CELL_SEP);
        // For each row (collection of items), slice the initial items that are not copied across all selections
        this.clipboard.copy(rows.map(createRow).join(this.clpRowSep || rowSeparator || DEFAULT_ROW_SEP));
        // TODO: Consider using `beginCopy` to support large copy operations
    }
    getSelectedRowData(grid) {
        const { columnApi, contextApi } = grid;
        const data = new Map();
        // The minIndex represents the first column being copied out of all visible columns (0 being the first visible column).
        // For every selected cell, the column is tracked and it's index is being set to `minIndex` if it is lower then the current `minIndex` (Math.Min).
        // We start with the biggest int but right away get a valid column index...
        // Later on, each row is sliced to remove the items in indices lower then the `minIndex`.
        //
        // All of this is to make the paste start without leading cell separators.
        let minIndex = Number.MAX_SAFE_INTEGER;
        for (const point of contextApi.selectedCells) {
            const col = columnApi.columns[point.colIndex];
            if (col) {
                const colIndex = columnApi.renderIndexOf(col);
                if (colIndex > -1) {
                    const rowIndex = contextApi.findRowInCache(point.rowIdent).dsIndex;
                    const dataItem = col.getValue(grid.ds.source[rowIndex]);
                    const row = data.get(point.rowIdent) || [];
                    row[colIndex] = dataItem;
                    data.set(point.rowIdent, row);
                    minIndex = Math.min(minIndex, colIndex);
                }
            }
        }
        // contextApi.selectedCells are un-ordered, their order is based on the order in which user have selected cells.
        // It means that the row's will not paste in the proper order unless we re-order them based on the data index.
        // This is a very native and simple implementation that will hold most copy actions 1k +-
        // TODO: Consider a better logic, taking performance into consideration.
        const entries = Array.from(data.entries());
        entries.sort((a, b) => {
            const aIndex = contextApi.findRowInCache(a[0]).dsIndex;
            const bIndex = contextApi.findRowInCache(b[0]).dsIndex;
            if (aIndex < bIndex) {
                return -1;
            }
            else {
                return 1;
            }
        });
        return {
            minIndex,
            rows: entries.map(e => e[1]),
        };
    }
    init() {
        this._removePlugin = this.pluginCtrl.setPlugin(PLUGIN_KEY, this);
        this.pluginCtrl.ensurePlugin('targetEvents');
        const targetEvents = this.pluginCtrl.getPlugin('targetEvents');
        targetEvents.keyDown
            .pipe(filter(event => this.isCopyEvent(event.source)), unrx(this))
            .subscribe(event => this.doCopy());
    }
}
/** @nocollapse */ PblNgridClipboardPlugin.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPlugin, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridClipboardPlugin.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridClipboardPlugin, selector: "pbl-ngrid[clipboard]", inputs: { clpCellSep: "clpCellSep", clpRowSep: "clpRowSep" }, exportAs: ["pblNgridClipboard"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPlugin, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[clipboard]', exportAs: 'pblNgridClipboard' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { clpCellSep: [{
                type: Input
            }], clpRowSep: [{
                type: Input
            }] } });

class PblNgridClipboardPluginModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridClipboardPluginModule, (grid, controller) => {
            const config = configService.get(PLUGIN_KEY, {});
            if (config.autoEnable === true) {
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
PblNgridClipboardPluginModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create' }, PblNgridClipboardPlugin);
/** @nocollapse */ PblNgridClipboardPluginModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, deps: [{ token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridClipboardPluginModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, declarations: [PblNgridClipboardPlugin], imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridClipboardPlugin] });
/** @nocollapse */ PblNgridClipboardPluginModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [PblNgridClipboardPlugin],
                    exports: [PblNgridClipboardPlugin],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PLUGIN_KEY, PblNgridClipboardPlugin, PblNgridClipboardPluginModule };
//# sourceMappingURL=pebula-ngrid-clipboard.mjs.map
