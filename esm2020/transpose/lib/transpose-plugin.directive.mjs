import { Directive, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { PblNgridConfigService, unrx } from '@asafmalin/ngrid/core';
import { columnFactory, PblNgridComponent, PblNgridPluginController, PblColumn, } from '@asafmalin/ngrid';
import { TransposeTableSession, LOCAL_COLUMN_DEF, VIRTUAL_REFRESH } from './transpose-table-session';
import { getCellValueTransformed, createTransformedColumn } from './utils';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
import * as i2 from "@asafmalin/ngrid/core";
const DEFAULT_HEADER_COLUMN = { prop: '__transpose__', css: 'pbl-ngrid-header-cell pbl-ngrid-transposed-header-cell' };
export const PLUGIN_KEY = 'transpose';
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
export class PblNgridTransposePluginDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNwb3NlLXBsdWdpbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3RyYW5zcG9zZS9zcmMvbGliL3RyYW5zcG9zZS1wbHVnaW4uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUscUJBQXFCLEVBQW9ELElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ25ILE9BQU8sRUFDTCxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLHdCQUF3QixFQUN4QixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3JHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLFNBQVMsQ0FBQzs7OztBQUUzRSxNQUFNLHFCQUFxQixHQUFHLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsd0RBQXdELEVBQUUsQ0FBQztBQWlCdkgsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFnQixXQUFXLENBQUM7QUFFbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBR0gsTUFBTSxPQUFPLGdDQUFnQztJQXdEM0MsWUFBb0IsSUFBNEIsRUFBVSxVQUFvQyxFQUFFLE1BQTZCO1FBQXpHLFNBQUksR0FBSixJQUFJLENBQXdCO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBMEI7UUFOdEYsWUFBTyxHQUF3QixxQkFBcUIsQ0FBQztRQU8zRCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FB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QUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2FBQ3JCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM5RjtJQUNILENBQUM7O2dKQWxNVSxnQ0FBZ0M7b0lBQWhDLGdDQUFnQzsyRkFBaEMsZ0NBQWdDO2tCQUQ1QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFO21MQUdoQyxTQUFTO3NCQUFyQixLQUFLO2dCQTZCMkIsTUFBTTtzQkFBdEMsS0FBSzt1QkFBQyxvQkFBb0I7Z0JBUUcsVUFBVTtzQkFBdkMsS0FBSzt1QkFBQyxxQkFBcUI7Z0JBUW5CLGNBQWM7c0JBQXRCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuaW1wb3J0IHsgUGJsTmdyaWRDb25maWdTZXJ2aWNlLCBQYmxDb2x1bW5EZWZpbml0aW9uLCBQYmxOZ3JpZENvbHVtbkRlZmluaXRpb25TZXQsIHVucnggfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHtcbiAgY29sdW1uRmFjdG9yeSxcbiAgUGJsTmdyaWRDb21wb25lbnQsXG4gIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlcixcbiAgUGJsQ29sdW1uLFxufSBmcm9tICdAcGVidWxhL25ncmlkJztcblxuaW1wb3J0IHsgVHJhbnNwb3NlVGFibGVTZXNzaW9uLCBMT0NBTF9DT0xVTU5fREVGLCBWSVJUVUFMX1JFRlJFU0ggfSBmcm9tICcuL3RyYW5zcG9zZS10YWJsZS1zZXNzaW9uJztcbmltcG9ydCB7IGdldENlbGxWYWx1ZVRyYW5zZm9ybWVkLCBjcmVhdGVUcmFuc2Zvcm1lZENvbHVtbiB9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0hFQURFUl9DT0xVTU4gPSB7IHByb3A6ICdfX3RyYW5zcG9zZV9fJywgY3NzOiAncGJsLW5ncmlkLWhlYWRlci1jZWxsIHBibC1uZ3JpZC10cmFuc3Bvc2VkLWhlYWRlci1jZWxsJyB9O1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9jb3JlL2xpYi9jb25maWd1cmF0aW9uL3R5cGUnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkQ29uZmlnIHtcbiAgICB0cmFuc3Bvc2VQbHVnaW4/OiB7XG4gICAgICBoZWFkZXI/OiBQYXJ0aWFsPFBibENvbHVtbkRlZmluaXRpb24+O1xuICAgICAgZGVmYXVsdENvbD86IFBhcnRpYWw8UGJsQ29sdW1uRGVmaW5pdGlvbj47XG4gICAgICBtYXRjaFRlbXBsYXRlcz86IGJvb2xlYW47XG4gICAgfVxuICB9XG59XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICB0cmFuc3Bvc2U/OiBQYmxOZ3JpZFRyYW5zcG9zZVBsdWdpbkRpcmVjdGl2ZTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IFBMVUdJTl9LRVk6ICd0cmFuc3Bvc2UnID0gJ3RyYW5zcG9zZSc7XG5cbi8qKlxuICogVHJhbnNwb3NlIHBsdWdpbi5cbiAqXG4gKiBUaGlzIHBsdWdpbiB3aWxsIHN3YXBzIGFyb3VuZCB0aGUgcm93cyBhbmQgY29sdW1ucyBvZiB0aGUgZ3JpZC5cbiAqXG4gKiBBICoqcmVndWxhciBncmlkKiogKG5vdCB0cmFuc3Bvc2VkKSByZXByZXNlbnRzIHJvd3MgaG9yaXpvbnRhbGx5OlxuICpcbiAqIC0gRWFjaCBob3Jpem9udGFsIHJvdyByZXByZXNlbnRzIGFuIGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb24uXG4gKiAtIEVhY2ggdmVydGljYWwgY29sdW1uIHJlcHJlc2VudHMgdGhlIHNhbWUgcHJvcGVydHkgb2YgYWxsIHJvd3MgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQSAqKnRyYW5zcG9zZWQqKiBncmlkIHJlcHJlc2VudHMgcm93IHZlcnRpY2FsbHk6XG4gKlxuICogLSBFYWNoIGhvcml6b250YWwgcm93IHJlcHJlc2VudHMgdGhlIHNhbWUgcHJvcGVydHkgb2YgYWxsIHJvd3MgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKiAtIEVhY2ggdmVydGljYWwgcm93IHJlcHJlc2VudHMgYW4gaXRlbSBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiA+IE5vdGUgdGhhdCB0cmFuc3Bvc2luZyBhIGdyaWQgbWlnaHQgbm90IHBsYXkgbmljZSB3aXRoIG90aGVyIHBsdWdpbnMgYW5kL29yIGZlYXR1cmVzLlxuICogRm9yIGV4YW1wbGUsIHVzaW5nIHBhZ2luYXRpb24gd2l0aCB0cmFuc3Bvc2UgbWFrZSBubyBzZW5zZS5cbiAqL1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdwYmwtbmdyaWRbdHJhbnNwb3NlXScgfSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFRyYW5zcG9zZVBsdWdpbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG5cbiAgQElucHV0KCkgZ2V0IHRyYW5zcG9zZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZW5hYmxlZDsgfTtcbiAgc2V0IHRyYW5zcG9zZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIHZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuZW5hYmxlZCAmJiB0aGlzLmdyaWQuaXNJbml0KSB7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKHRoaXMuZW5hYmxlZCwgdmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLmVuYWJsZWQgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHRoZSBuZXcgaGVhZGVyIGNvbHVtbiwgdGhpcyBpcyB0aGUgY29sdW1uIHRoZSBmaXJzdCBjb2x1bW4gdGhhdFxuICAgKiB3aWxsIGRpc3BsYXkgYWxsIHRoZSBoZWFkZXJzLlxuICAgKlxuICAgKiBUaGlzIGlzIGFuIG9wdGlvbmFsIHZhbHVlLCB3aGVuIG5vdCBzZXQgYSBkZWZhdWx0IGNvbHVtbiBzZXR0aW5ncyBpcyB1c2VkOlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiB7XG4gICAqICBwcm9wOiAnX190cmFuc3Bvc2VfXycsXG4gICAqICBjc3M6ICdwYmwtbmdyaWQtaGVhZGVyLWNlbGwgcGJsLW5ncmlkLXRyYW5zcG9zZWQtaGVhZGVyLWNlbGwnLFxuICAgKiB9XG4gICAqIGBgYFxuICAgKlxuICAgKiBXaGVuIHNldCwgdGhlIG5ldyBjb2x1bW4gdmFsdWVzIHdpbGwgbWVyZ2UgaW50byB0aGUgZGVmYXVsdCBkZWZpbml0aW9ucywgb3ZlcnJpZGluZyBleGlzdGluZyBwcm9wZXJ0aWVzXG4gICAqIHNldCBvbiB0aGUgZGVmYXVsdCBjb2x1bW4gc2V0dGluZ3MuXG4gICAqXG4gICAqID4gVGhlIGhlYWRlciBjb2x1bW4gYmVoYXZlIGxpa2UgYW55IG90aGVyIGNvbHVtbiBhbmQgeW91IGNhbiBhbHNvIHByb3ZpZGUgZGVmaW5lIGl0IGluIHRoZSBgY29sdW1uYCBwcm9wZXJ0eSBvbiB0aGUgZ3JpZC5cbiAgICogV2hlbiB1c2luZyB0aGlzIGFwcHJvYWNoIHRoZSBjb2x1bW4gZGVmaW5lZCBvbiB0aGUgZ3JpZCBpcyB1c2VkIGFzIGlzIChubyBtZXJnaW5nKS4gSnVzdCBtYWtlIHN1cmUgeW91IHVzZSB0aGUgcmlnaHQgYHByb3BgIHZhbHVlIGZvciBpdC5cbiAgICogZS5nLiBpZiBgaGVhZGVyYCBpcyBub3Qgc2V0IGhlcmUgaXRzIGBfX3RyYW5zcG9zZV9fYCBvdGhlcndpc2UsIHRoZSBhY3R1YWwgYHByb3BgIHZhbHVlLlxuICAgKi9cbiAgQElucHV0KCd0cmFuc3Bvc2VIZWFkZXJDb2wnKSBzZXQgaGVhZGVyKHZhbHVlOiBQYXJ0aWFsPFBibENvbHVtbkRlZmluaXRpb24+KSB7XG4gICAgdGhpcy5faGVhZGVyID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9IRUFERVJfQ09MVU1OLCB2YWx1ZSB8fCB7fSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgdG8gYmUgdXNlZCBhcyB0aGUgYmFzZSBkZWZhdWx0IGRlZmluaXRpb25zIGZvciB0aGUgbmV3IHRyYW5zcG9zZWQgY29sdW1ucy5cbiAgICogVGhpcyBpcyBhbiBvcHRpb25hbCB2YWx1ZSwgd2hlbiBub3Qgc2V0IG5vIGRlZmF1bHQncyBhcmUgYXBwbGllZC5cbiAgICovXG4gIEBJbnB1dCgndHJhbnNwb3NlRGVmYXVsdENvbCcpIGRlZmF1bHRDb2w6IFBhcnRpYWw8UGJsQ29sdW1uRGVmaW5pdGlvbj47XG5cbiAgLyoqXG4gICAqIFdoZW4gdHJ1ZSwgd2lsbCB0cnkgdG8gdXNlIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBvZiB0aGUgY2VsbCwgaS5lLiB0aGUgdGVtcGxhdGUgdGhhdCB3b3VsZCBoYXZlIGJlZW4gdXNlZFxuICAgKiBpZiB3ZSBkaWQgbm90IHRyYW5zcG9zZSBhdCBhbGwuXG4gICAqXG4gICAqIERlZmF1bHRzIHRvIGZhbHNlLlxuICAgKi9cbiAgQElucHV0KCkgbWF0Y2hUZW1wbGF0ZXM6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBlbmFibGVkOiBib29sZWFuO1xuICBwcml2YXRlIF9oZWFkZXI6IFBibENvbHVtbkRlZmluaXRpb24gPSBERUZBVUxUX0hFQURFUl9DT0xVTU47XG4gIHByaXZhdGUgZ3JpZFN0YXRlOiBUcmFuc3Bvc2VUYWJsZVNlc3Npb247XG4gIHByaXZhdGUgY29sdW1uczogUGJsQ29sdW1uW107XG4gIHByaXZhdGUgc2VsZkNvbHVtbjogUGJsQ29sdW1uO1xuICBwcml2YXRlIF9yZW1vdmVQbHVnaW46IChncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgcHJpdmF0ZSBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIGNvbmZpZzogUGJsTmdyaWRDb25maWdTZXJ2aWNlKSB7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luID0gcGx1Z2luQ3RybC5zZXRQbHVnaW4oUExVR0lOX0tFWSwgdGhpcyk7XG4gICAgY29uc3QgdHJhbnNwb3NlUGx1Z2luID0gY29uZmlnLmdldCgndHJhbnNwb3NlUGx1Z2luJyk7XG4gICAgaWYgKHRyYW5zcG9zZVBsdWdpbikge1xuICAgICAgdGhpcy5oZWFkZXIgPSB0cmFuc3Bvc2VQbHVnaW4uaGVhZGVyO1xuICAgICAgdGhpcy5kZWZhdWx0Q29sID0gdHJhbnNwb3NlUGx1Z2luLmRlZmF1bHRDb2wgfHwge307XG4gICAgICB0aGlzLm1hdGNoVGVtcGxhdGVzID0gdHJhbnNwb3NlUGx1Z2luLm1hdGNoVGVtcGxhdGVzIHx8IGZhbHNlO1xuICAgIH1cblxuICAgIHBsdWdpbkN0cmwub25Jbml0KClcbiAgICAgIC5zdWJzY3JpYmUoICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSh1bmRlZmluZWQsIHRoaXMuZW5hYmxlZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luKHRoaXMuZ3JpZCk7XG4gICAgdGhpcy5kaXNhYmxlKGZhbHNlKTtcbiAgICB1bnJ4LmtpbGwodGhpcyk7XG4gIH1cblxuICBkaXNhYmxlKHVwZGF0ZVRhYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZ3JpZFN0YXRlKSB7XG4gICAgICBjb25zdCB7IGdyaWRTdGF0ZSB9ID0gdGhpcztcbiAgICAgIHRoaXMuY29sdW1ucyA9IHRoaXMuc2VsZkNvbHVtbiA9IHRoaXMuZ3JpZFN0YXRlID0gdGhpcy5jb2x1bW5zID0gdGhpcy5zZWxmQ29sdW1uID0gdW5kZWZpbmVkO1xuICAgICAgZ3JpZFN0YXRlLmRlc3Ryb3kodXBkYXRlVGFibGUpO1xuICAgIH1cbiAgfVxuXG4gIGVuYWJsZShyZWZyZXNoRGF0YVNvdXJjZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZ3JpZFN0YXRlKSB7XG4gICAgICB0aGlzLmRpc2FibGUoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZUZhY3RvcnlXcmFwcGVyID0gKHJlc3VsdHM6IGFueVtdKSA9PiB7XG4gICAgICBpZiAocmVzdWx0cykge1xuICAgICAgICBjb25zdCBsb2NhbDogUGJsTmdyaWRDb2x1bW5EZWZpbml0aW9uU2V0ID0gdGhpcy5ncmlkLmNvbHVtbnMgPSBjb2x1bW5GYWN0b3J5KClcbiAgICAgICAgICAuZGVmYXVsdCh0aGlzLmRlZmF1bHRDb2wgfHwge30pXG4gICAgICAgICAgLnRhYmxlKFxuICAgICAgICAgICAgdGhpcy5zZWxmQ29sdW1uLFxuICAgICAgICAgICAgLi4ucmVzdWx0cy5tYXAoY3JlYXRlVHJhbnNmb3JtZWRDb2x1bW4pLFxuICAgICAgICAgIClcbiAgICAgICAgICAuYnVpbGQoKTtcblxuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5ncmlkU3RhdGUuY29sdW1uc0lucHV0O1xuICAgICAgICBsb2NhbC5oZWFkZXIgPSBwcmV2LmhlYWRlcjtcbiAgICAgICAgbG9jYWwuaGVhZGVyR3JvdXAgPSBwcmV2LmhlYWRlckdyb3VwO1xuICAgICAgICBsb2NhbC5mb290ZXIgPSBwcmV2LmZvb3RlcjtcbiAgICAgICAgbG9jYWxbTE9DQUxfQ09MVU1OX0RFRl0gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZ3JpZC5pbnZhbGlkYXRlQ29sdW1ucygpO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoVGVtcGxhdGVzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHRoaXMubWF0Y2hUZW1wbGF0ZXMpO1xuICAgICAgICBjb25zdCB7IHByb3AgfSA9IHRoaXMuX2hlYWRlcjtcbiAgICAgICAgY29uc3QgY29sdW1uS2V5c1RvUHJveHk6IEFycmF5PGtleW9mIFBibENvbHVtbj4gPSBbJ3R5cGUnXTtcblxuICAgICAgICBpZiAobWF0Y2hUZW1wbGF0ZXMpIHtcbiAgICAgICAgICBjb2x1bW5LZXlzVG9Qcm94eS5wdXNoKCdjZWxsVHBsJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUaGUgZm9sbG93aW5nIGxvZ2ljIGlzIG5vdCBmb3IgdGhlIGZhaW50IG9mIGhlYXJ0LlxuICAgICAgICAgICBCYXNpY2FsbHksIHRoZSB0cmFuc3Bvc2UgcGx1Z2luIGRvZXMgbm90IHN3YXAgdGhlIGFjdHVhbCBkYXRhIGJ1dCB0aGUgY29sdW1ucy5cbiAgICAgICAgICAgV2hlbiB0cmFuc3Bvc2luZywgYWxsIHJvd3Mgd2lsbCBzd2FwIHRvIGNvbHVtbnMgc28sIEEgbmV3IGNvbHVtbiBkZWZpbml0aW9uIGlzIGNyZWF0ZWQsXG4gICAgICAgICAgIHdpdGggY29sdW1ucyBlcXVhbCB0byB0aGUgdG90YWwgbnVtYmVyIG9yIGl0ZW1zIGluIHRoZSBkYXRhc291cmNlLlxuICAgICAgICAgICBFYWNoIGNvbHVtbiAobmV3IG9uZSkgcmVwcmVzZW50cyBhIHJvdyBzbyB3ZSBzYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBhY3R1YWwgcm93IGluIHRoZSBuZXcgY29sdW1uLlxuXG4gICAgICAgICAgIFRoZSBuZXh0IHN0ZXAgaXMgdG8gY3JlYXRlIGEgbmV3IGRhdGFzb3VyY2UsIHRoZSBuZXcgZGF0YXNvdXJjZSBpcyBzaW1wbHkgYSBjb2xsZWN0aW9uIG9mIGFsbCBvZiB0aGUgb3JpZ2luYWwgY29sdW1ucy5cblxuICAgICAgICAgICBOb3cgd2hlbiBgZ2V0VmFsdWVgIGlzIGNhbGxlZCBvbiB0aGUgbmV3IGNvbHVtbiBpdCBpcyBjYWxsZWQgd2l0aCBhIFwicm93XCIgd2hpY2ggaXMgdGhlIG9yaWdpbmFsIGNvbHVtbi5cbiAgICAgICAgICAgQmVjYXVzZSB0aGUgbmV3IGNvbHVtbiBoYXMgYSByZWZlcmVuY2UgdG8gdGhlIGFjdHVhbCAob3JpZ2luYWwpIHJvdyB3ZSBjYW4gY2FsbCB0aGUgYGdldFZhbHVlYCBvbiB0aGUgb2xkIGNvbHVtbiB3aXRoIHRoZSBhY3R1YWwgcm93LlxuXG4gICAgICAgICAgIEluIHRoaXMgcHJvY2VzcywgYWxsIG9mIHRoZSBjb2x1bW4gbWV0YWRhdGEgcmVsYXRlZCB0byB0aGUgcHJlc2VudGF0aW9uIGxheWVyIGlzIGxvc3QuIEZvciBleGFtcGxlLCBpZiBDU1MgY2xhc3NlcyB3aWxsXG4gICAgICAgICAgIG5vdCBiZSB0aGUgc2FtZSwgdGVtcGxhdGVzLCB0eXBlcyBldGMuLi4gVGhpcyBpcyBiZWNhdXNlIHdoZW4gdGhlIGdyaWQgcmVuZGVycyBhIGNlbGwgdGhhdCBjZWxsIGhhcyBhIHNpbmdsZSB0ZW1wbGF0ZSBhY3Jvc3NcbiAgICAgICAgICAgYWxsIHJvd3MgYnV0IG5vdyB3ZSBuZWVkIGEgZGlmZmVyZW50IHRlbXBsYXRlIGZvciBldmVyeSByb3cuXG5cbiAgICAgICAgICAgV2UgY2FuIHByb3h5IGEgKFZFUlkpIGxpbWl0ZWQgc2V0IG9mIG1ldGFkYXRhIHByb3BlcnRpZXMgcmVsYXRlZCB0byB0aGUgcHJlc2VudGF0aW9uIGxheWVyLCB2YWxpZCBvbmx5IG9uIHJlbmRlciB0aW1lLlxuICAgICAgICAgICBUaGlzIHJlbGF5cyBvbiB0aGUgZmFjdCB0aGF0IGVhY2ggcm93IGlzIHJlbmRlcmVkIGNvbXBsZXRlLCBzdGFydGluZyBmcm9tIHRoZSBmaXJzdCBjZWxsIHRvIHRoZSBsYXN0IHNvXG4gICAgICAgICAgIHdpdGggdGhhdCB3ZSBjYW4gZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBvcmlnaW5hbCBjb2x1bW4gdGhhIHRoYXQgbm93IHJlcHJlc2VudHMgdGhlIHdob2xlIHJvdy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBjdXJyZW50Q29sdW1uOiBQYmxDb2x1bW47XG4gICAgICAgIGZvciAoY29uc3QgYyBvZiB0aGlzLmdyaWQuY29sdW1uQXBpLnZpc2libGVDb2x1bW5zKSB7XG4gICAgICAgICAgaWYgKGMub3JnUHJvcCA9PT0gcHJvcCkge1xuICAgICAgICAgICAgYy5nZXRWYWx1ZSA9IChyb3c6IFBibENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uID0gcm93O1xuICAgICAgICAgICAgICByZXR1cm4gcm93LmxhYmVsIGFzIGFueTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMuZ2V0VmFsdWUgPSBnZXRDZWxsVmFsdWVUcmFuc2Zvcm1lZDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbHVtbktleXNUb1Byb3h5KSB7XG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjLCBrZXksIHsgY29uZmlndXJhYmxlOiB0cnVlLCBnZXQ6ICgpID0+IGN1cnJlbnRDb2x1bW4gJiYgY3VycmVudENvbHVtbltrZXldLCBzZXQ6IHZhbHVlID0+IHt9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW5zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIHRoaXMuZ3JpZFN0YXRlID0gbmV3IFRyYW5zcG9zZVRhYmxlU2Vzc2lvbihcbiAgICAgIHRoaXMuZ3JpZCxcbiAgICAgIHRoaXMucGx1Z2luQ3RybCxcbiAgICAgICgpID0+IHRoaXMudXBkYXRlQ29sdW1ucyh0aGlzLmdyaWQuY29sdW1uQXBpLnZpc2libGVDb2x1bW5zKSxcbiAgICAgIHNvdXJjZUZhY3RvcnlXcmFwcGVyLFxuICAgICk7XG5cbiAgICBpZiAocmVmcmVzaERhdGFTb3VyY2UpIHtcbiAgICAgIHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY29udGV4dEFwaS5jbGVhcigpO1xuICAgICAgdGhpcy5ncmlkLmRzLnJlZnJlc2goKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZC5kcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmdyaWQuZHMucmVmcmVzaChWSVJUVUFMX1JFRlJFU0gpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU3RhdGUocHJldjogYm9vbGVhbiB8IHVuZGVmaW5lZCwgY3VycjogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGlzRmlyc3QgPSBwcmV2ID09PSB1bmRlZmluZWQ7XG4gICAgaWYgKCFjdXJyKSB7XG4gICAgICB0aGlzLmRpc2FibGUodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5hYmxlKCFpc0ZpcnN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUNvbHVtbnMoY29sdW1uczogUGJsQ29sdW1uW10pOiB2b2lkIHtcbiAgICBjb25zdCB7IHByb3AgfSA9IHRoaXMuX2hlYWRlcjtcbiAgICB0aGlzLmNvbHVtbnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29sdW1ucykge1xuICAgICAgaWYgKGMub3JnUHJvcCA9PT0gcHJvcCkge1xuICAgICAgICB0aGlzLnNlbGZDb2x1bW4gPSBjO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb2x1bW5zLnB1c2goYyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdGhpcy5zZWxmQ29sdW1uKSB7XG4gICAgICAvLyBUT0RPOiBkb24ndCBhc3N1bWUgY29sdW1uc1swXVxuICAgICAgdGhpcy5zZWxmQ29sdW1uID0gbmV3IFBibENvbHVtbih0aGlzLl9oZWFkZXIsIHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY29sdW1uU3RvcmUuZ3JvdXBTdG9yZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3RyYW5zcG9zZTogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWF0Y2hUZW1wbGF0ZXM6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==