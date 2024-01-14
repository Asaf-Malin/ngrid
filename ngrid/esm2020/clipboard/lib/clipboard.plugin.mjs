import { filter } from 'rxjs/operators';
import { Directive, Injector, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { unrx } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController, PblNgridConfigService } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
const IS_OSX = /^mac/.test(navigator.platform.toLowerCase());
const DEFAULT_CELL_SEP = '\t';
const DEFAULT_ROW_SEP = '\n';
export const PLUGIN_KEY = 'clipboard';
export class PblNgridClipboardPlugin {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkLnBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvY2xpcGJvYXJkL3NyYy9saWIvY2xpcGJvYXJkLnBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQWEsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLHdCQUF3QixFQUFFLHFCQUFxQixFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUE4Qm5HLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0FBQzVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQztBQUU3QixNQUFNLENBQUMsTUFBTSxVQUFVLEdBQWdCLFdBQVcsQ0FBQztBQUduRCxNQUFNLE9BQU8sdUJBQXVCO0lBeUJsQyxZQUFtQixJQUE0QixFQUFZLFFBQWtCLEVBQVksVUFBb0M7UUFBMUcsU0FBSSxHQUFKLElBQUksQ0FBd0I7UUFBWSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVksZUFBVSxHQUFWLFVBQVUsQ0FBMEI7UUFDM0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxJQUFJLEVBQUUs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YyxDQUFDLENBQUM7UUFDL0QsWUFBWSxDQUFDLE9BQU87YUFDakIsSUFBSSxDQUNILE1BQU0sQ0FBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFFLEVBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDWDthQUNBLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBRSxDQUFDO0lBQ3pDLENBQUM7O3VJQXBIVSx1QkFBdUI7MkhBQXZCLHVCQUF1QjsyRkFBdkIsdUJBQXVCO2tCQURuQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTtzS0FhbkUsVUFBVTtzQkFBbEIsS0FBSztnQkFPRyxTQUFTO3NCQUFqQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciwgT25EZXN0cm95LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDbGlwYm9hcmQgfSBmcm9tICdAYW5ndWxhci9jZGsvY2xpcGJvYXJkJztcblxuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLCBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAcGVidWxhL25ncmlkJztcblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvbGliL2V4dC90eXBlcycge1xuICBpbnRlcmZhY2UgUGJsTmdyaWRQbHVnaW5FeHRlbnNpb24ge1xuICAgIGNsaXBib2FyZD86IFBibE5ncmlkQ2xpcGJvYXJkUGx1Z2luO1xuICB9XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbkZhY3RvcmllcyB7XG4gICAgY2xpcGJvYXJkOiBrZXlvZiB0eXBlb2YgUGJsTmdyaWRDbGlwYm9hcmRQbHVnaW47XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvY29uZmlndXJhdGlvbi90eXBlJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZENvbmZpZyB7XG4gICAgY2xpcGJvYXJkPzoge1xuICAgICAgLyoqIFdoZW4gc2V0IHRvIHRydWUgd2lsbCBlbmFibGUgdGhlIGNsaXBib2FyZCBwbHVnaW4gb24gYWxsIGdyaWQgaW5zdGFuY2VzIGJ5IGRlZmF1bHQuICovXG4gICAgICBhdXRvRW5hYmxlPzogYm9vbGVhbjtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHNlcGFyYXRvciB0byB1c2Ugd2hlbiBtdWx0aXBsZSBjZWxscyBhcmUgY29waWVkXG4gICAgICAgKiBAZGVmYXVsdCBcXHRcbiAgICAgICAqL1xuICAgICAgY2VsbFNlcGFyYXRvcj86IHN0cmluZztcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHNlcGFyYXRvciB0byB1c2Ugd2hlbiBtdWx0aXBsZSByb3dzIGFyZSBjb3BpZWRcbiAgICAgICAqIEBkZWZhdWx0IFxcblxuICAgICAgICovXG4gICAgICByb3dTZXBhcmF0b3I/OiBzdHJpbmc7XG4gICAgfTtcbiAgfVxufVxuXG5jb25zdCBJU19PU1ggPSAvXm1hYy8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0udG9Mb3dlckNhc2UoKSlcbmNvbnN0IERFRkFVTFRfQ0VMTF9TRVAgPSAnXFx0JztcbmNvbnN0IERFRkFVTFRfUk9XX1NFUCA9ICdcXG4nO1xuXG5leHBvcnQgY29uc3QgUExVR0lOX0tFWTogJ2NsaXBib2FyZCcgPSAnY2xpcGJvYXJkJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAncGJsLW5ncmlkW2NsaXBib2FyZF0nLCBleHBvcnRBczogJ3BibE5ncmlkQ2xpcGJvYXJkJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ2xpcGJvYXJkUGx1Z2luIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICBzdGF0aWMgY3JlYXRlKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50LCBpbmplY3RvcjogSW5qZWN0b3IpOiBQYmxOZ3JpZENsaXBib2FyZFBsdWdpbiB7XG4gICAgY29uc3QgcGx1Z2luQ3RybCA9IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKGdyaWQpO1xuICAgIHJldHVybiBuZXcgUGJsTmdyaWRDbGlwYm9hcmRQbHVnaW4oZ3JpZCwgaW5qZWN0b3IsIHBsdWdpbkN0cmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZXBhcmF0b3IgdG8gdXNlIHdoZW4gbXVsdGlwbGUgY2VsbHMgYXJlIGNvcGllZC5cbiAgICogSWYgbm90IHNldCwgdGFrZW4gZnJvbSBgUGJsTmdyaWRDb25maWcuY2xpcGJvYXJkLmNlbGxTZXBhcmF0b3JgXG4gICAqIEBkZWZhdWx0IFxcdFxuICAgKi9cbiAgQElucHV0KCkgY2xwQ2VsbFNlcDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgc2VwYXJhdG9yIHRvIHVzZSB3aGVuIG11bHRpcGxlIHJvd3MgYXJlIGNvcGllZFxuICAgKiBJZiBub3Qgc2V0LCB0YWtlbiBmcm9tIGBQYmxOZ3JpZENvbmZpZy5jbGlwYm9hcmQucm93U2VwYXJhdG9yYFxuICAgKiBAZGVmYXVsdCBcXG5cbiAgICovXG4gIEBJbnB1dCgpIGNscFJvd1NlcDogc3RyaW5nO1xuXG4gIHByaXZhdGUgY29uZmlnOiBQYmxOZ3JpZENvbmZpZ1NlcnZpY2U7XG4gIHByaXZhdGUgY2xpcGJvYXJkOiBDbGlwYm9hcmQ7XG4gIHByaXZhdGUgX3JlbW92ZVBsdWdpbjogKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+LCBwcm90ZWN0ZWQgaW5qZWN0b3I6IEluamVjdG9yLCBwcm90ZWN0ZWQgcGx1Z2luQ3RybDogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyKSB7XG4gICAgdGhpcy5jb25maWcgPSBpbmplY3Rvci5nZXQoUGJsTmdyaWRDb25maWdTZXJ2aWNlKVxuICAgIHRoaXMuY2xpcGJvYXJkID0gaW5qZWN0b3IuZ2V0KENsaXBib2FyZCk7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB1bnJ4LmtpbGwodGhpcyk7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luKHRoaXMuZ3JpZCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaXNDb3B5RXZlbnQoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCAmJiBldmVudC5rZXkgPT09ICdjJykge1xuICAgICAgaWYgKCghSVNfT1NYICYmIGV2ZW50LmN0cmxLZXkpIHx8IChJU19PU1ggJiYgZXZlbnQubWV0YUtleSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCBkb0NvcHkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjZWxsU2VwYXJhdG9yLCByb3dTZXBhcmF0b3IgfSA9IHRoaXMuY29uZmlnLmdldCgnY2xpcGJvYXJkJywge30pO1xuICAgIGNvbnN0IHsgcm93cywgbWluSW5kZXggfSA9IHRoaXMuZ2V0U2VsZWN0ZWRSb3dEYXRhKHRoaXMuZ3JpZCk7XG4gICAgY29uc3QgY3JlYXRlUm93ID0gKHJvdzogYW55W10pID0+IHJvdy5zbGljZShtaW5JbmRleCkuam9pbih0aGlzLmNscENlbGxTZXAgfHwgY2VsbFNlcGFyYXRvciB8fCBERUZBVUxUX0NFTExfU0VQKTtcbiAgICAvLyBGb3IgZWFjaCByb3cgKGNvbGxlY3Rpb24gb2YgaXRlbXMpLCBzbGljZSB0aGUgaW5pdGlhbCBpdGVtcyB0aGF0IGFyZSBub3QgY29waWVkIGFjcm9zcyBhbGwgc2VsZWN0aW9uc1xuXG4gICAgdGhpcy5jbGlwYm9hcmQuY29weShyb3dzLm1hcChjcmVhdGVSb3cpLmpvaW4odGhpcy5jbHBSb3dTZXAgfHwgcm93U2VwYXJhdG9yIHx8IERFRkFVTFRfUk9XX1NFUCkpO1xuICAgIC8vIFRPRE86IENvbnNpZGVyIHVzaW5nIGBiZWdpbkNvcHlgIHRvIHN1cHBvcnQgbGFyZ2UgY29weSBvcGVyYXRpb25zXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2VsZWN0ZWRSb3dEYXRhKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50KSB7XG4gICAgY29uc3QgeyBjb2x1bW5BcGksIGNvbnRleHRBcGkgfSA9IGdyaWQ7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBNYXA8YW55LCBhbnlbXT4oKTtcblxuICAgIC8vIFRoZSBtaW5JbmRleCByZXByZXNlbnRzIHRoZSBmaXJzdCBjb2x1bW4gYmVpbmcgY29waWVkIG91dCBvZiBhbGwgdmlzaWJsZSBjb2x1bW5zICgwIGJlaW5nIHRoZSBmaXJzdCB2aXNpYmxlIGNvbHVtbikuXG4gICAgLy8gRm9yIGV2ZXJ5IHNlbGVjdGVkIGNlbGwsIHRoZSBjb2x1bW4gaXMgdHJhY2tlZCBhbmQgaXQncyBpbmRleCBpcyBiZWluZyBzZXQgdG8gYG1pbkluZGV4YCBpZiBpdCBpcyBsb3dlciB0aGVuIHRoZSBjdXJyZW50IGBtaW5JbmRleGAgKE1hdGguTWluKS5cbiAgICAvLyBXZSBzdGFydCB3aXRoIHRoZSBiaWdnZXN0IGludCBidXQgcmlnaHQgYXdheSBnZXQgYSB2YWxpZCBjb2x1bW4gaW5kZXguLi5cbiAgICAvLyBMYXRlciBvbiwgZWFjaCByb3cgaXMgc2xpY2VkIHRvIHJlbW92ZSB0aGUgaXRlbXMgaW4gaW5kaWNlcyBsb3dlciB0aGVuIHRoZSBgbWluSW5kZXhgLlxuICAgIC8vXG4gICAgLy8gQWxsIG9mIHRoaXMgaXMgdG8gbWFrZSB0aGUgcGFzdGUgc3RhcnQgd2l0aG91dCBsZWFkaW5nIGNlbGwgc2VwYXJhdG9ycy5cbiAgICBsZXQgbWluSW5kZXggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgY29udGV4dEFwaS5zZWxlY3RlZENlbGxzKSB7XG4gICAgICBjb25zdCBjb2wgPSBjb2x1bW5BcGkuY29sdW1uc1twb2ludC5jb2xJbmRleF07XG4gICAgICBpZiAoY29sKSB7XG4gICAgICAgIGNvbnN0IGNvbEluZGV4ID0gY29sdW1uQXBpLnJlbmRlckluZGV4T2YoY29sKTtcbiAgICAgICAgaWYgKGNvbEluZGV4ID4gLTEpIHtcbiAgICAgICAgICBjb25zdCByb3dJbmRleCA9IGNvbnRleHRBcGkuZmluZFJvd0luQ2FjaGUocG9pbnQucm93SWRlbnQpLmRzSW5kZXg7XG4gICAgICAgICAgY29uc3QgZGF0YUl0ZW0gPSBjb2wuZ2V0VmFsdWUoZ3JpZC5kcy5zb3VyY2Vbcm93SW5kZXhdKTtcbiAgICAgICAgICBjb25zdCByb3cgPSBkYXRhLmdldChwb2ludC5yb3dJZGVudCkgfHwgW107XG4gICAgICAgICAgcm93W2NvbEluZGV4XSA9IGRhdGFJdGVtO1xuICAgICAgICAgIGRhdGEuc2V0KHBvaW50LnJvd0lkZW50LCByb3cpO1xuICAgICAgICAgIG1pbkluZGV4ID0gTWF0aC5taW4obWluSW5kZXgsIGNvbEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbnRleHRBcGkuc2VsZWN0ZWRDZWxscyBhcmUgdW4tb3JkZXJlZCwgdGhlaXIgb3JkZXIgaXMgYmFzZWQgb24gdGhlIG9yZGVyIGluIHdoaWNoIHVzZXIgaGF2ZSBzZWxlY3RlZCBjZWxscy5cbiAgICAvLyBJdCBtZWFucyB0aGF0IHRoZSByb3cncyB3aWxsIG5vdCBwYXN0ZSBpbiB0aGUgcHJvcGVyIG9yZGVyIHVubGVzcyB3ZSByZS1vcmRlciB0aGVtIGJhc2VkIG9uIHRoZSBkYXRhIGluZGV4LlxuICAgIC8vIFRoaXMgaXMgYSB2ZXJ5IG5hdGl2ZSBhbmQgc2ltcGxlIGltcGxlbWVudGF0aW9uIHRoYXQgd2lsbCBob2xkIG1vc3QgY29weSBhY3Rpb25zIDFrICstXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYSBiZXR0ZXIgbG9naWMsIHRha2luZyBwZXJmb3JtYW5jZSBpbnRvIGNvbnNpZGVyYXRpb24uXG5cbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuZnJvbShkYXRhLmVudHJpZXMoKSk7XG4gICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBjb25zdCBhSW5kZXggPSBjb250ZXh0QXBpLmZpbmRSb3dJbkNhY2hlKGFbMF0pLmRzSW5kZXg7XG4gICAgICBjb25zdCBiSW5kZXggPSBjb250ZXh0QXBpLmZpbmRSb3dJbkNhY2hlKGJbMF0pLmRzSW5kZXg7XG4gICAgICBpZiAoYUluZGV4IDwgYkluZGV4KSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbkluZGV4LFxuICAgICAgcm93czogZW50cmllcy5tYXAoIGUgPT4gZVsxXSApLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luID0gdGhpcy5wbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcblxuICAgIHRoaXMucGx1Z2luQ3RybC5lbnN1cmVQbHVnaW4oJ3RhcmdldEV2ZW50cycpO1xuXG4gICAgY29uc3QgdGFyZ2V0RXZlbnRzID0gdGhpcy5wbHVnaW5DdHJsLmdldFBsdWdpbigndGFyZ2V0RXZlbnRzJyk7XG4gICAgdGFyZ2V0RXZlbnRzLmtleURvd25cbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoIGV2ZW50ID0+IHRoaXMuaXNDb3B5RXZlbnQoZXZlbnQuc291cmNlKSApLFxuICAgICAgICB1bnJ4KHRoaXMpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB0aGlzLmRvQ29weSgpICk7XG4gIH1cbn1cbiJdfQ==