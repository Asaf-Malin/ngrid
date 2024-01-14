import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation, Optional, Attribute, ChangeDetectorRef, Inject } from '@angular/core';
import { CdkHeaderRow } from '@angular/cdk/table';
import { unrx } from '@pebula/ngrid/core';
import { PBL_NGRID_COMPONENT } from '../../tokens';
import { PblNgridBaseRowComponent, PBL_NGRID_BASE_ROW_TEMPLATE } from './base-row.component';
import { PblNgridMetaRowService } from '../meta-rows/meta-row.service';
import { applyMetaRowClass, initColumnOrMetaRow, setRowVisibility } from './utils';
import { PblNgridColumnDef } from '../column/directives/column-def';
import * as i0 from "@angular/core";
import * as i1 from "../meta-rows/meta-row.service";
/**
 * The row that represents the columns of the grid.
 * There are only 2 column rows in a grid, the top (header) and bottom (footer), both optional.
 */
export class PblNgridColumnRowComponent extends PblNgridBaseRowComponent {
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
/** @nocollapse */ PblNgridColumnRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.PblNgridMetaRowService }, { token: 'footer', attribute: true }, { token: 'gridWidthRow', attribute: true }], target: i0.ɵɵFactoryTarget.Component });
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
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.PblNgridMetaRowService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['footer']
                }] }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['gridWidthRow']
                }] }]; }, propDecorators: { row: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1ucy1yb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvcm93L2NvbHVtbnMtcm93LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFnQixTQUFTLEVBQUUsaUJBQWlCLEVBQXFCLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxTCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUF5QixJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVqRSxPQUFPLEVBQXNCLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdGLE9BQU8sRUFBRSxzQkFBc0IsRUFBYyxNQUFNLCtCQUErQixDQUFDO0FBRW5GLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7O0FBRXBFOzs7R0FHRztBQWFILE1BQU0sT0FBTywwQkFBMkIsU0FBUSx3QkFBb0U7SUFlbEgsWUFBcUQsSUFBd0IsRUFDakUsS0FBd0IsRUFDeEIsRUFBMkIsRUFDVixRQUFnQyxFQUM1QixRQUFhLEVBQ1AsWUFBaUI7UUFDdEQsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFISSxhQUFRLEdBQVIsUUFBUSxDQUF3QjtRQUkzRCxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksS0FBSyxJQUFJLENBQUM7UUFDMUMs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QUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hCLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUNsQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUU7Z0JBQzNELGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQTthQUNyRDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7MElBeEZVLDBCQUEwQixrQkFlakIsbUJBQW1CLDhIQUloQixRQUFRLDhCQUNSLGNBQWM7OEhBcEIxQiwwQkFBMEIsZ0hBTjFCO1FBQ1QsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSwwQkFBMEIsRUFBRTtLQUNuRTsyRkFJVSwwQkFBMEI7a0JBWnRDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxLQUFLO3FCQUNkO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyw0QkFBNEIsRUFBRTtxQkFDbkU7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87b0JBQ2hELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN0Qzs7MEJBZ0JjLE1BQU07MkJBQUMsbUJBQW1COzswQkFBRyxRQUFROzswQkFJckMsU0FBUzsyQkFBQyxRQUFROzswQkFDbEIsU0FBUzsyQkFBQyxjQUFjOzRDQWxCeEIsR0FBRztzQkFBZixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIFZpZXdFbmNhcHN1bGF0aW9uLCBPcHRpb25hbCwgQ29tcG9uZW50UmVmLCBBdHRyaWJ1dGUsIENoYW5nZURldGVjdG9yUmVmLCBPbkRlc3Ryb3ksIE9uSW5pdCwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDZGtIZWFkZXJSb3cgfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHsgUGJsTWV0YVJvd0RlZmluaXRpb25zLCB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgX1BibE5ncmlkQ29tcG9uZW50LCBQQkxfTkdSSURfQ09NUE9ORU5UIH0gZnJvbSAnLi4vLi4vdG9rZW5zJztcbmltcG9ydCB7IFBibE5ncmlkQmFzZVJvd0NvbXBvbmVudCwgUEJMX05HUklEX0JBU0VfUk9XX1RFTVBMQVRFIH0gZnJvbSAnLi9iYXNlLXJvdy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsQ29sdW1uIH0gZnJvbSAnLi4vY29sdW1uL21vZGVsJztcbmltcG9ydCB7IFBibE5ncmlkTWV0YVJvd1NlcnZpY2UsIFBibE1ldGFSb3cgfSBmcm9tICcuLi9tZXRhLXJvd3MvbWV0YS1yb3cuc2VydmljZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQgfSBmcm9tICcuLi9jZWxsL2hlYWRlci1jZWxsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBhcHBseU1ldGFSb3dDbGFzcywgaW5pdENvbHVtbk9yTWV0YVJvdywgc2V0Um93VmlzaWJpbGl0eSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EZWYgfSBmcm9tICcuLi9jb2x1bW4vZGlyZWN0aXZlcy9jb2x1bW4tZGVmJztcblxuLyoqXG4gKiBUaGUgcm93IHRoYXQgcmVwcmVzZW50cyB0aGUgY29sdW1ucyBvZiB0aGUgZ3JpZC5cbiAqIFRoZXJlIGFyZSBvbmx5IDIgY29sdW1uIHJvd3MgaW4gYSBncmlkLCB0aGUgdG9wIChoZWFkZXIpIGFuZCBib3R0b20gKGZvb3RlciksIGJvdGggb3B0aW9uYWwuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZC1jb2x1bW4tcm93JyxcbiAgdGVtcGxhdGU6IFBCTF9OR1JJRF9CQVNFX1JPV19URU1QTEFURSxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICAncm9sZSc6ICdyb3cnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IENka0hlYWRlclJvdywgdXNlRXhpc3Rpbmc6IFBibE5ncmlkQ29sdW1uUm93Q29tcG9uZW50IH1cbiAgXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENvbHVtblJvd0NvbXBvbmVudCBleHRlbmRzIFBibE5ncmlkQmFzZVJvd0NvbXBvbmVudDwnaGVhZGVyJyB8ICdmb290ZXInLCBQYmxNZXRhUm93RGVmaW5pdGlvbnM+IGltcGxlbWVudHMgUGJsTWV0YVJvdywgT25Jbml0LCBPbkRlc3Ryb3kge1xuXG4gIEBJbnB1dCgpIHNldCByb3codmFsdWU6IFBibE1ldGFSb3dEZWZpbml0aW9ucykgeyB0aGlzLnVwZGF0ZVJvdyh2YWx1ZSk7IH1cblxuICBnZXQgcm93SW5kZXgoKTogbnVtYmVyIHsgcmV0dXJuIDA7IH1cblxuICBnZXQgbWV0YSgpOiBQYmxNZXRhUm93RGVmaW5pdGlvbnMgeyByZXR1cm4gdGhpcy5fbWV0YTsgfVxuICBzZXQgbWV0YSh2YWx1ZTogUGJsTWV0YVJvd0RlZmluaXRpb25zKSB7IHRoaXMuX21ldGEgPSB2YWx1ZTsgfSAvLyBUT0RPOiByZW1vdmUgd2hlbiByZW1vdmluZyBwYmxNZXRhUm93XG5cbiAgcmVhZG9ubHkgcm93VHlwZTogJ2hlYWRlcicgfCAnZm9vdGVyJztcbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHJlYWRvbmx5IGlzRm9vdGVyOiBib29sZWFuO1xuICByZWFkb25seSBncmlkV2lkdGhSb3c6IGJvb2xlYW47XG4gIHByaXZhdGUgX21ldGE6IFBibE1ldGFSb3dEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBCTF9OR1JJRF9DT01QT05FTlQpIEBPcHRpb25hbCgpIGdyaWQ6IF9QYmxOZ3JpZENvbXBvbmVudCxcbiAgICAgICAgICAgICAgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICAgICAgICBlbDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgbWV0YVJvd3M6IFBibE5ncmlkTWV0YVJvd1NlcnZpY2UsXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ2Zvb3RlcicpIGlzRm9vdGVyOiBhbnksXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ2dyaWRXaWR0aFJvdycpIGdyaWRXaWR0aFJvdzogYW55KSB7XG4gICAgc3VwZXIoZ3JpZCwgY2RSZWYsIGVsKTtcbiAgICB0aGlzLmdyaWRXaWR0aFJvdyA9IGdyaWRXaWR0aFJvdyAhPT0gbnVsbDtcbiAgICB0aGlzLmlzRm9vdGVyID0gaXNGb290ZXIgIT09IG51bGw7XG4gICAgdGhpcy5yb3dUeXBlID0gdGhpcy5pc0Zvb3RlciA/ICdmb290ZXInIDogJ2hlYWRlcic7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIHRoaXMuaGFuZGxlVmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5tZXRhUm93cy5yZW1vdmVNZXRhUm93KHRoaXMpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICB1cGRhdGVTaXplKCkge1xuICAgIGlmICh0aGlzLmdyaWRXaWR0aFJvdykge1xuICAgICAgZm9yIChjb25zdCBjIG9mIHRoaXMuX2NlbGxzIGFzIENvbXBvbmVudFJlZjxQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQ+W10pIHtcbiAgICAgICAgYy5pbnN0YW5jZS51cGRhdGVTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG9uQ3RvcigpIHsgfVxuXG4gIHByb3RlY3RlZCBkZXRlY3RDaGFuZ2VzKCkge1xuICAgIGZvciAoY29uc3QgY2VsbCBvZiB0aGlzLl9jZWxscykge1xuICAgICAgLy8gVE9ETzogdGhlIGNlbGxzIGFyZSBjcmVhdGVkIHRocm91Z2ggY29kZSB3aGljaCBtZWFuJ3MgdGhhdCB0aGV5IGRvbid0IGJlbG9uZ1xuICAgICAgLy8gdG8gdGhlIENEIHRyZWUgYW5kIHdlIG5lZWQgdG8gbWFudWFsbHkgbWFyayB0aGVtIGZvciBjaGVja2luZ1xuICAgICAgLy8gV2UgY2FuIGN1c3RvbWl6ZSB0aGUgZGlmZmluZywgZGV0ZWN0IGNvbnRleHQgY2hhbmdlcyBpbnRlcm5hbGx5IGFuZCBvbmx5IHRyaWdnZXIgdGhlc2UgY2VsbHMgd2hpY2ggaGF2ZSBjaGFuZ2VkIVxuICAgICAgY2VsbC5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlUm93KHZhbHVlOiBQYmxNZXRhUm93RGVmaW5pdGlvbnMpIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX21ldGEpIHtcbiAgICAgIGFwcGx5TWV0YVJvd0NsYXNzKHRoaXMubWV0YVJvd3MsIHRoaXMsIHRoaXMuZWxlbWVudCwgdGhpcy5fbWV0YSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjZWxsQ3JlYXRlZChjb2x1bW46IFBibENvbHVtbiwgY2VsbDogQ29tcG9uZW50UmVmPFBibE5ncmlkSGVhZGVyQ2VsbENvbXBvbmVudD4pIHtcbiAgICBpZiAoIWNvbHVtbi5jb2x1bW5EZWYpIHtcbiAgICAgIG5ldyBQYmxOZ3JpZENvbHVtbkRlZih0aGlzLl9leHRBcGkpLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIGNvbHVtbi5jb2x1bW5EZWYubmFtZSA9IGNvbHVtbi5pZDtcbiAgICB9XG4gICAgY2VsbC5pbnN0YW5jZS5zZXRDb2x1bW4oY29sdW1uLCB0aGlzLmdyaWRXaWR0aFJvdyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2VsbERlc3Ryb3llZChjZWxsOiBDb21wb25lbnRSZWY8UGJsTmdyaWRIZWFkZXJDZWxsQ29tcG9uZW50PiwgcHJldmlvdXNJbmRleDogbnVtYmVyKSB7XG4gICAgdW5yeC5raWxsKHRoaXMsIGNlbGwuaW5zdGFuY2UuY29sdW1uKTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlVmlzaWJpbGl0eSgpIHtcbiAgICBpbml0Q29sdW1uT3JNZXRhUm93KHRoaXMuZWxlbWVudCwgdGhpcy5pc0Zvb3Rlcik7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5pc0Zvb3RlciA/ICdzaG93Rm9vdGVyJyA6ICdzaG93SGVhZGVyJztcbiAgICBpZiAoIXRoaXMuX2V4dEFwaS5ncmlkW2tleV0pIHtcbiAgICAgIHNldFJvd1Zpc2liaWxpdHkodGhpcy5lbGVtZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXh0QXBpLnByb3BDaGFuZ2VkXG4gICAgICAucGlwZSh1bnJ4KHRoaXMpKVxuICAgICAgLnN1YnNjcmliZSggZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSB0aGlzLl9leHRBcGkuZ3JpZCAmJiBldmVudC5rZXkgPT09IGtleSkge1xuICAgICAgICAgIHNldFJvd1Zpc2liaWxpdHkodGhpcy5lbGVtZW50LCBldmVudC5wcmV2ID09PSBmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cbiJdfQ==