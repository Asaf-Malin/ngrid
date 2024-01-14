import { Directive, Input, IterableDiffers } from '@angular/core';
import { ON_INVALIDATE_HEADERS, ON_RESIZE_ROW } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export const PLUGIN_KEY = 'sticky';
export function setStickyRow(grid, type, valueOrBulk, state) {
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
export function setStickyColumns(grid, type, valueOrBulk, state) {
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
export class PblNgridStickyPluginDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3RpY2t5L3NyYy9saWIvc3RpY2t5L3N0aWNreS1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFrRSxNQUFNLGVBQWUsQ0FBQztBQUVsSSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLHdCQUF3QixFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFTNUUsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFhLFFBQVEsQ0FBQztBQUk3QyxNQUFNLFVBQVUsWUFBWSxDQUFDLElBQTRCLEVBQUUsSUFBeUIsRUFBRSxXQUFrRSxFQUFFLEtBQWU7SUFDdkssTUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLFFBQVEsQ0FBQztJQUNuQyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDdkUsTUFBTSxJQUFJLEdBQXVDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBRSxDQUFDO0lBRXJILE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVuRyxJQUFJLE9BQWdCLENBQUM7SUFDckIsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFF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LENBQUMsRUFBRTtZQUNuQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckM7SUFDSCxDQUFDOzs2SUExSlUsNkJBQTZCO2lJQUE3Qiw2QkFBNkI7MkZBQTdCLDZCQUE2QjtrQkFEekMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSw0R0FBNEcsRUFBRTs2S0FXdEgsaUJBQWlCO3NCQUE3QixLQUFLO2dCQWdCTyxlQUFlO3NCQUEzQixLQUFLO2dCQWdCTyxZQUFZO3NCQUF4QixLQUFLO2dCQWdCTyxZQUFZO3NCQUF4QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgSXRlcmFibGVEaWZmZXJzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVDaGFuZ2VSZWNvcmQsIE9uRGVzdHJveSwgQWZ0ZXJWaWV3SW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBPTl9JTlZBTElEQVRFX0hFQURFUlMsIE9OX1JFU0laRV9ST1cgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBzdGlja3k/OiBQYmxOZ3JpZFN0aWNreVBsdWdpbkRpcmVjdGl2ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUExVR0lOX0tFWTogJ3N0aWNreScgPSAnc3RpY2t5JztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0aWNreVJvdyhncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+LCB0eXBlOiAnaGVhZGVyJyB8ICdmb290ZXInLCBidWxrOiBBcnJheTxbJ3RhYmxlJyB8IG51bWJlciwgYm9vbGVhbl0+KTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGlja3lSb3coZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgdHlwZTogJ2hlYWRlcicgfCAnZm9vdGVyJywgdmFsdWU6ICd0YWJsZScgfCBudW1iZXIsIHN0YXRlOiBib29sZWFuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGlja3lSb3coZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgdHlwZTogJ2hlYWRlcicgfCAnZm9vdGVyJywgdmFsdWVPckJ1bGs6IEFycmF5PFsndGFibGUnIHwgbnVtYmVyLCBib29sZWFuXT4gfCAndGFibGUnIHwgbnVtYmVyLCBzdGF0ZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgaXNIZWFkZXIgPSB0eXBlID09PSAnaGVhZGVyJztcbiAgY29uc3QgcXVlcnlMaXN0ID0gaXNIZWFkZXIgPyBncmlkLl9oZWFkZXJSb3dEZWZzIDogZ3JpZC5fZm9vdGVyUm93RGVmcztcbiAgY29uc3QgYnVsazogQXJyYXk8Wyd0YWJsZScgfCBudW1iZXIsIGJvb2xlYW5dPiA9IEFycmF5LmlzQXJyYXkodmFsdWVPckJ1bGspID8gdmFsdWVPckJ1bGsgOiBbIFt2YWx1ZU9yQnVsaywgc3RhdGVdIF07XG5cbiAgY29uc3QgYWRkT25lSWZNYWluRXhpc3RzID0gKGlzSGVhZGVyICYmIGdyaWQuc2hvd0hlYWRlcikgfHwgKCFpc0hlYWRlciAmJiBncmlkLnNob3dGb290ZXIpID8gMSA6IDA7XG5cbiAgbGV0IGNoYW5nZWQ6IGJvb2xlYW47XG4gIGZvciAoY29uc3QgW3ZhbHVlLCBzdGF0ZV0gb2YgYnVsaykge1xuICAgIC8vIHRoZSBpbmRleCBmcm9tIHRoZSB1c2VyIGlzIDAgYmFzZWQgb3IgdGhlIGdyaWQgaGVhZGVyL2Zvb3RlciByb3cuXG4gICAgLy8gd2Ugc3RvcmUgdGhlbSBib3RoLCBzbyB3ZSBuZWVkIHRvIGNvbnZlcnQuLi4gb3VyIGZpcnN0IGlzIGFsd2F5cyB0aGUgZ3JpZCBoZWFkZXIvZm9vdGVyIGFuZCB0aGVuIHdlIGhhdmUgdGhlIHNhbWUgb3JkZXIgYXMgdGhlIHVzZXIncy5cbiAgICBsZXQgaWR4ID0gdmFsdWUgPT09ICd0YWJsZScgPyAwIDogdmFsdWUgKyBhZGRPbmVJZk1haW5FeGlzdHM7XG4gICAgaWYgKCFpc0hlYWRlcikge1xuICAgICAgLy8gc3RpY2t5LXN0eWxlciBzdGlja1Jvd3MoKSBtZXRob2RzIHdpbGwgcmV2ZXJzZSB0aGUgb3JkZXIgb2YgZm9vdGVyIGNvbHVtbnNcbiAgICAgIC8vIHNvIHdlIGFjdHVhbGx5IG5lZWQgdG8gc2V0IGFub3RoZXIgcm93IHRvIG1ha2UgdGhlIHJvdyB3ZSB3YW50IHN0aWNreS5cbiAgICAgIC8vIHdlIGNvdWxkIHJldmVyc2UgdGhlIGNvbGxlY3Rpb24sIGJ1dCBjaG9vc2luZyB0aGUgb3Bwb3NpdGUgc2lkZSBpcyBiZXR0ZXIuXG4gICAgICAvLyB0aGluayBbMCwgMSwgMiwgMywgNF0gYW5kIHdlIHdhbnQgMS4gc3RpY2t5LXN0eWxlciB3aWxsIHJldmVyc2UgdG8gWzQsIDMsIDIsIDEsIDBdIHNvIGRvaW5nIG5vdGhpbmcgd2lsbCBzdGljayAzLlxuICAgICAgLy8gdGhlIG9wcG9zaXRlIGlzIGxlbmd0aCBNSU5VUyAxIE1JTlVTIGluZGV4IHdoaWNoIGlzIDUgLSAxIC0gMSB3aGljaCBpcyAzLCBpbiB0aGUgcmV2ZXJlZCBhcnJheSBpdHMgdGhlIHJvdyAxIHdoaWNoIGlzIHdoYXQgd2Ugd2FudGVkLlxuICAgICAgaWR4ID0gKHF1ZXJ5TGlzdC5sZW5ndGggLSAxKSAtIGlkeDtcbiAgICB9XG5cbiAgICBjb25zdCByb3dEZWYgPSBxdWVyeUxpc3QudG9BcnJheSgpW2lkeF07XG4gICAgaWYgKHJvd0RlZiAmJiByb3dEZWYuc3RpY2t5ICE9PSBzdGF0ZSkge1xuICAgICAgcm93RGVmLnN0aWNreSA9IHN0YXRlO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNoYW5nZWQpIHtcbiAgICBjb25zdCBjZGtUYWJsZSA9IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKGdyaWQpLmV4dEFwaS5jZGtUYWJsZTtcbiAgICBpZiAoaXNIZWFkZXIpIHtcbiAgICAgIGNka1RhYmxlLnVwZGF0ZVN0aWNreUhlYWRlclJvd1N0eWxlcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZGtUYWJsZS51cGRhdGVTdGlja3lGb290ZXJSb3dTdHlsZXMoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0aWNreUNvbHVtbnMoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgdHlwZTogJ3N0YXJ0JyB8ICdlbmQnLCBidWxrOiBBcnJheTxbc3RyaW5nIHwgbnVtYmVyLCBib29sZWFuXT4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFN0aWNreUNvbHVtbnMoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgdHlwZTogJ3N0YXJ0JyB8ICdlbmQnLCB2YWx1ZTogc3RyaW5nICB8IG51bWJlciwgc3RhdGU6IGJvb2xlYW4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFN0aWNreUNvbHVtbnMoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgdHlwZTogJ3N0YXJ0JyB8ICdlbmQnLCB2YWx1ZU9yQnVsazogQXJyYXk8W3N0cmluZyAgfCBudW1iZXIsIGJvb2xlYW5dPiB8IHN0cmluZyAgfCBudW1iZXIsIHN0YXRlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBidWxrOiBBcnJheTxbc3RyaW5nIHwgbnVtYmVyLCBib29sZWFuXT4gPSBBcnJheS5pc0FycmF5KHZhbHVlT3JCdWxrKSA/IHZhbHVlT3JCdWxrIDogWyBbdmFsdWVPckJ1bGssIHN0YXRlXSBdO1xuICBsZXQgY2hhbmdlZDogYm9vbGVhbjtcbiAgZm9yIChsZXQgW2NvbHVtbklkLCBzdGF0ZV0gb2YgYnVsaykge1xuICAgIGlmICh0eXBlb2YgY29sdW1uSWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb2x1bW5JZCA9IGdyaWQuY29sdW1uQXBpLnZpc2libGVDb2x1bW5zLmZpbmRJbmRleCggYyA9PiBjLm9yZ1Byb3AgPT09IGNvbHVtbklkICk7XG4gICAgfVxuICAgIGNvbnN0IGMgPSBncmlkLmNvbHVtbkFwaS52aXNpYmxlQ29sdW1uc1tjb2x1bW5JZF07XG4gICAgaWYgKGMpIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgYy5waW4gPSBzdGF0ZSA/IHR5cGUgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAodHlwZSA9PT0gJ2VuZCcpIHtcbiAgICAgICAgYy5jb2x1bW5EZWYuc3RpY2t5RW5kID0gc3RhdGU7XG4gICAgICAgIGMuY29sdW1uRGVmLnN0aWNreSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYy5jb2x1bW5EZWYuc3RpY2t5ID0gc3RhdGU7XG4gICAgICAgIGMuY29sdW1uRGVmLnN0aWNreUVuZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoY2hhbmdlZCkge1xuICAgIGNvbnN0IGNka1RhYmxlID0gUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmQoZ3JpZCkuZXh0QXBpLmNka1RhYmxlO1xuICAgIGNka1RhYmxlLnVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ3BibC1uZ3JpZFtzdGlja3lDb2x1bW5TdGFydF0sIHBibC1uZ3JpZFtzdGlja3lDb2x1bW5FbmRdLCBwYmwtbmdyaWRbc3RpY2t5SGVhZGVyXSwgcGJsLW5ncmlkW3N0aWNreUZvb3Rlcl0nIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRTdGlja3lQbHVnaW5EaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0IHRoZSBoZWFkZXIgcm93cyB5b3Ugd2FudCB0byBhcHBseSBzdGlja3kgcG9zaXRpb25pbmcgdG8uXG4gICAqIFZhbGlkIHZhbHVlcyBhcmU6XG4gICAqICAgLSBgZ3JpZGAgLSBMaXRlcmFsIHN0cmluZyBgZ3JpZGAgdGhhdCB3aWxsIHNldCB0aGUgZ3JpZCdzIG1haW4gaGVhZGVyIHJvdy5cbiAgICogICAtIG51bWJlciAgLSBUaGUgaW5kZXggb2YgdGhlIHJvdywgZm9yIG11bHRpLWhlYWRlciByb3cuIFRoZSBpbmRleCByZWZlcnMgdG8gdGhlIG9yZGVyIHlvdSBkZWZpbmVkIHRoZSBoZWFkZXIvaGVhZGVyR3JvdXAgcm93cyAoYmFzZSAwKTtcbiAgICpcbiAgICogRm9yIHBlcmZvcm1hbmNlIGNvbnNpZGVyYXRpb25zIG9ubHkgbmV3IHZhbHVlcyB3aWxsIHRyaWdnZXIgYSBjaGFuZ2UgKGkuZS4gdGhlIGFycmF5IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZSkuXG4gICAqIE1hbmlwdWxhdGluZyB0aGUgYXJyYXkgd2lsbCBub3QgdHJpZ2dlciBhIGNoYW5nZSAodGhlIHN0aWNreSBzdGF0ZSB3aWxsIG5vdCBjaGFuZ2UpIHVubGVzcyBzZW5kaW5nIGEgY29weSBvZiBpdCAocmVwbGFjaW5nIGl0LCBlLmcuIEFycmF5LnNsaWNlKCkpXG4gICAqL1xuICBASW5wdXQoKSBzZXQgc3RpY2t5Q29sdW1uU3RhcnQodmFsdWU6IEFycmF5PHN0cmluZyB8IG51bWJlcj4pIHtcbiAgICBpZiAoIXRoaXMuX3N0YXJ0RGlmZmVyKSB7XG4gICAgICB0aGlzLl9zdGFydERpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZChbXSkuY3JlYXRlKCk7XG4gICAgfVxuICAgIHRoaXMuYXBwbHlDb2x1bW5EaWZmKCdzdGFydCcsIHZhbHVlLCB0aGlzLl9zdGFydERpZmZlcik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBmb290ZXIgcm93cyB5b3Ugd2FudCB0byBhcHBseSBzdGlja3kgcG9zaXRpb25pbmcgdG8uXG4gICAqIFZhbGlkIHZhbHVlcyBhcmU6XG4gICAqICAgLSBgZ3JpZGAgLSBMaXRlcmFsIHN0cmluZyBgZ3JpZGAgdGhhdCB3aWxsIHNldCB0aGUgZ3JpZCdzIG1haW4gZm9vdGVyIHJvdy5cbiAgICogICAtIG51bWJlciAgLSBUaGUgaW5kZXggb2YgdGhlIHJvdywgZm9yIG11bHRpLWZvb3RlciByb3cuIFRoZSBpbmRleCByZWZlcnMgdG8gdGhlIG9yZGVyIHlvdSBkZWZpbmVkIHRoZSBmb290ZXIgcm93cyAoYmFzZSAwKTtcbiAgICpcbiAgICogRm9yIHBlcmZvcm1hbmNlIGNvbnNpZGVyYXRpb25zIG9ubHkgbmV3IHZhbHVlcyB3aWxsIHRyaWdnZXIgYSBjaGFuZ2UgKGkuZS4gdGhlIGFycmF5IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZSkuXG4gICAqIE1hbmlwdWxhdGluZyB0aGUgYXJyYXkgd2lsbCBub3QgdHJpZ2dlciBhIGNoYW5nZSAodGhlIHN0aWNreSBzdGF0ZSB3aWxsIG5vdCBjaGFuZ2UpIHVubGVzcyBzZW5kaW5nIGEgY29weSBvZiBpdCAocmVwbGFjaW5nIGl0LCBlLmcuIEFycmF5LnNsaWNlKCkpXG4gICAqL1xuICBASW5wdXQoKSBzZXQgc3RpY2t5Q29sdW1uRW5kKHZhbHVlOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+KSB7XG4gICAgaWYgKCF0aGlzLl9lbmREaWZmZXIpIHtcbiAgICAgIHRoaXMuX2VuZERpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZChbXSkuY3JlYXRlKCk7XG4gICAgfVxuICAgIHRoaXMuYXBwbHlDb2x1bW5EaWZmKCdlbmQnLCB2YWx1ZSwgdGhpcy5fZW5kRGlmZmVyKTtcbiAgfVxuXG4gICAgLyoqXG4gICAqIFNldCB0aGUgaGVhZGVyIHJvd3MgeW91IHdhbnQgdG8gYXBwbHkgc3RpY2t5IHBvc2l0aW9uaW5nIHRvLlxuICAgKiBWYWxpZCB2YWx1ZXMgYXJlOlxuICAgKiAgIC0gYGdyaWRgIC0gTGl0ZXJhbCBzdHJpbmcgYGdyaWRgIHRoYXQgd2lsbCBzZXQgdGhlIGdyaWQncyBtYWluIGhlYWRlciByb3cuXG4gICAqICAgLSBudW1iZXIgIC0gVGhlIGluZGV4IG9mIHRoZSByb3csIGZvciBtdWx0aS1oZWFkZXIgcm93LiBUaGUgaW5kZXggcmVmZXJzIHRvIHRoZSBvcmRlciB5b3UgZGVmaW5lZCB0aGUgaGVhZGVyL2hlYWRlckdyb3VwIHJvd3MgKGJhc2UgMCk7XG4gICAqXG4gICAqIEZvciBwZXJmb3JtYW5jZSBjb25zaWRlcmF0aW9ucyBvbmx5IG5ldyB2YWx1ZXMgd2lsbCB0cmlnZ2VyIGEgY2hhbmdlIChpLmUuIHRoZSBhcnJheSBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUpLlxuICAgKiBNYW5pcHVsYXRpbmcgdGhlIGFycmF5IHdpbGwgbm90IHRyaWdnZXIgYSBjaGFuZ2UgKHRoZSBzdGlja3kgc3RhdGUgd2lsbCBub3QgY2hhbmdlKSB1bmxlc3Mgc2VuZGluZyBhIGNvcHkgb2YgaXQgKHJlcGxhY2luZyBpdCwgZS5nLiBBcnJheS5zbGljZSgpKVxuICAgKi9cbiAgQElucHV0KCkgc2V0IHN0aWNreUhlYWRlcih2YWx1ZTogQXJyYXk8J3RhYmxlJyB8IG51bWJlcj4pIHtcbiAgICBpZiAoIXRoaXMuX2hlYWRlckRpZmZlcikge1xuICAgICAgdGhpcy5faGVhZGVyRGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKFtdKS5jcmVhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5hcHBseVJvd0RpZmYoJ2hlYWRlcicsIHZhbHVlLCB0aGlzLl9oZWFkZXJEaWZmZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgZm9vdGVyIHJvd3MgeW91IHdhbnQgdG8gYXBwbHkgc3RpY2t5IHBvc2l0aW9uaW5nIHRvLlxuICAgKiBWYWxpZCB2YWx1ZXMgYXJlOlxuICAgKiAgIC0gYGdyaWRgIC0gTGl0ZXJhbCBzdHJpbmcgYGdyaWRgIHRoYXQgd2lsbCBzZXQgdGhlIGdyaWQncyBtYWluIGZvb3RlciByb3cuXG4gICAqICAgLSBudW1iZXIgIC0gVGhlIGluZGV4IG9mIHRoZSByb3csIGZvciBtdWx0aS1mb290ZXIgcm93LiBUaGUgaW5kZXggcmVmZXJzIHRvIHRoZSBvcmRlciB5b3UgZGVmaW5lZCB0aGUgZm9vdGVyIHJvd3MgKGJhc2UgMCk7XG4gICAqXG4gICAqIEZvciBwZXJmb3JtYW5jZSBjb25zaWRlcmF0aW9ucyBvbmx5IG5ldyB2YWx1ZXMgd2lsbCB0cmlnZ2VyIGEgY2hhbmdlIChpLmUuIHRoZSBhcnJheSBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUpLlxuICAgKiBNYW5pcHVsYXRpbmcgdGhlIGFycmF5IHdpbGwgbm90IHRyaWdnZXIgYSBjaGFuZ2UgKHRoZSBzdGlja3kgc3RhdGUgd2lsbCBub3QgY2hhbmdlKSB1bmxlc3Mgc2VuZGluZyBhIGNvcHkgb2YgaXQgKHJlcGxhY2luZyBpdCwgZS5nLiBBcnJheS5zbGljZSgpKVxuICAgKi9cbiAgQElucHV0KCkgc2V0IHN0aWNreUZvb3Rlcih2YWx1ZTogQXJyYXk8J3RhYmxlJyB8IG51bWJlcj4pIHtcbiAgICBpZiAoIXRoaXMuX2Zvb3RlckRpZmZlcikge1xuICAgICAgdGhpcy5fZm9vdGVyRGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKFtdKS5jcmVhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5hcHBseVJvd0RpZmYoJ2Zvb3RlcicsIHZhbHVlLCB0aGlzLl9mb290ZXJEaWZmZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RhcnREaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPHN0cmluZyB8IG51bWJlcj47XG4gIHByaXZhdGUgX2VuZERpZmZlcjogSXRlcmFibGVEaWZmZXI8c3RyaW5nIHwgbnVtYmVyPjtcbiAgcHJpdmF0ZSBfaGVhZGVyRGlmZmVyOiBJdGVyYWJsZURpZmZlcjwndGFibGUnIHwgbnVtYmVyPjtcbiAgcHJpdmF0ZSBfZm9vdGVyRGlmZmVyOiBJdGVyYWJsZURpZmZlcjwndGFibGUnIHwgbnVtYmVyPjtcblxuICBwcml2YXRlIF9jb2x1bW5DYWNoZTogeyBzdGFydDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPjsgZW5kOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+OyB9ID0geyBzdGFydDogW10sIGVuZDogW10gfTtcbiAgcHJpdmF0ZSBfcmVtb3ZlUGx1Z2luOiAoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PikgPT4gdm9pZDtcbiAgcHJpdmF0ZSB2aWV3SW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvciAocHJvdGVjdGVkIHJlYWRvbmx5IGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PGFueT4sXG4gICAgICAgICAgICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICAgICAgICAgICAgIHByb3RlY3RlZCByZWFkb25seSBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4gPSBwbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcblxuICAgIHBsdWdpbkN0cmwuZXZlbnRzXG4gICAgICAucGlwZShPTl9SRVNJWkVfUk9XKVxuICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICBjb25zdCBjZGtUYWJsZSA9IHBsdWdpbkN0cmwuZXh0QXBpLmNka1RhYmxlO1xuICAgICAgICBjZGtUYWJsZS51cGRhdGVTdGlja3lIZWFkZXJSb3dTdHlsZXMoKTtcbiAgICAgICAgY2RrVGFibGUudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgICAgIGNka1RhYmxlLnVwZGF0ZVN0aWNreUZvb3RlclJvd1N0eWxlcygpO1xuICAgICAgfSk7XG5cbiAgICAgIHBsdWdpbkN0cmwuZXZlbnRzXG4gICAgICAgIC5waXBlKE9OX0lOVkFMSURBVEVfSEVBREVSUylcbiAgICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLl9zdGFydERpZmZlciAmJiB0aGlzLmdyaWQuaXNJbml0KSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydERpZmZlci5kaWZmKFtdKTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5EaWZmKCdzdGFydCcsIHRoaXMuX2NvbHVtbkNhY2hlLnN0YXJ0LCB0aGlzLl9zdGFydERpZmZlcilcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5fZW5kRGlmZmVyICYmIHRoaXMuZ3JpZC5pc0luaXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuZERpZmZlci5kaWZmKFtdKTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5EaWZmKCdlbmQnLCB0aGlzLl9jb2x1bW5DYWNoZS5lbmQsIHRoaXMuX2VuZERpZmZlcilcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMudmlld0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbW92ZVBsdWdpbih0aGlzLmdyaWQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFwcGx5Q29sdW1uRGlmZih0eXBlOiAnc3RhcnQnIHwgJ2VuZCcsIHZhbHVlOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+LCBkaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPHN0cmluZyB8IG51bWJlcj4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hcHBseUNvbHVtbkRpZmYodHlwZSwgdmFsdWUsIGRpZmZlcikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbHVtbkNhY2hlW3R5cGVdID0gdmFsdWUgfHwgW107XG5cbiAgICBjb25zdCBjaGFuZ2VzID0gZGlmZmVyLmRpZmYodmFsdWUgfHwgW10pO1xuICAgIGNvbnN0IGJ1bGs6IEFycmF5PFtzdHJpbmcgfCBudW1iZXIsIGJvb2xlYW5dPiA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxzdHJpbmcgfCBudW1iZXI+LCBwcmV2SW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgIGJ1bGsucHVzaChbcmVjb3JkLml0ZW0sIHRydWVdKTtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgYnVsay5wdXNoKFtyZWNvcmQuaXRlbSwgZmFsc2VdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYnVsay5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTdGlja3lDb2x1bW5zKHRoaXMuZ3JpZCwgdHlwZSwgYnVsayk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFwcGx5Um93RGlmZih0eXBlOiAnaGVhZGVyJyB8ICdmb290ZXInLCB2YWx1ZTogQXJyYXk8J3RhYmxlJyB8IG51bWJlcj4sIGRpZmZlcjogSXRlcmFibGVEaWZmZXI8J3RhYmxlJyB8IG51bWJlcj4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZ3JpZC5pc0luaXQpIHtcbiAgICAgIHRoaXMucGx1Z2luQ3RybC5vbkluaXQoKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmFwcGx5Um93RGlmZih0eXBlLCB2YWx1ZSwgZGlmZmVyKTtcbiAgICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbmdlcyA9IGRpZmZlci5kaWZmKHZhbHVlIHx8IFtdKTtcbiAgICBjb25zdCBidWxrOiBBcnJheTxbJ3RhYmxlJyB8IG51bWJlciwgYm9vbGVhbl0+ID0gW107XG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPCd0YWJsZScgfCBudW1iZXI+LCBwcmV2SW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgIGJ1bGsucHVzaChbcmVjb3JkLml0ZW0sIHRydWVdKTtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgYnVsay5wdXNoKFtyZWNvcmQuaXRlbSwgZmFsc2VdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYnVsay5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTdGlja3lSb3codGhpcy5ncmlkLCB0eXBlLCBidWxrKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==