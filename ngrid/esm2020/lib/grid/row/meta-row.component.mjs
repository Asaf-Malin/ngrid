import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, ViewEncapsulation, Optional, Attribute, ChangeDetectorRef, } from '@angular/core';
import { CdkHeaderRow } from '@angular/cdk/table';
import { PBL_NGRID_COMPONENT } from '../../tokens';
import { PblNgridBaseRowComponent, PBL_NGRID_BASE_ROW_TEMPLATE } from './base-row.component';
import { PblNgridMetaRowService } from '../meta-rows/meta-row.service';
import { applyMetaRowClass, initColumnOrMetaRow } from './utils';
import * as i0 from "@angular/core";
import * as i1 from "../meta-rows/meta-row.service";
export class PblNgridMetaRowComponent extends PblNgridBaseRowComponent {
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
/** @nocollapse */ PblNgridMetaRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.PblNgridMetaRowService }, { token: 'footer', attribute: true }], target: i0.ɵɵFactoryTarget.Component });
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
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.PblNgridMetaRowService }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['footer']
                }] }]; }, propDecorators: { row: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS1yb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvcm93L21ldGEtcm93LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxpQkFBaUIsRUFDakIsUUFBUSxFQUNSLFNBQVMsRUFFVCxpQkFBaUIsR0FHbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR2xELE9BQU8sRUFBc0IsbUJBQW1CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdkUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLDJCQUEyQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFN0YsT0FBTyxFQUFFLHNCQUFzQixFQUFjLE1BQU0sK0JBQStCLENBQUM7QUFFbkYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLE1BQU0sU0FBUyxDQUFDOzs7QUFlakUsTUFBTSxPQUFPLHdCQUF5QixTQUFRLHdCQUF1RDtJQWlCbkcsWUFBcUQsSUFBd0IsRUFDakUsS0FBd0IsRUFDdkIsRUFBMkIsRUFDWCxRQUFnQyxFQUM1QixRQUFhO1FBQzVDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRkksYUFBUSxHQUFSLFFBQVEsQ0FBd0I7UUFQcEQsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFVckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLEtBQUssSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7SUFDL0QsQ0FBQztJQXZCRCxJQUFJ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O29CQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO29CQUNoRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtpQkFDdEM7OzBCQWtCYyxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQUcsUUFBUTs7MEJBSXJDLFNBQVM7MkJBQUMsUUFBUTs0Q0FsQmxCLEdBQUc7c0JBQWYsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBPcHRpb25hbCxcbiAgQXR0cmlidXRlLFxuICBDb21wb25lbnRSZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkluaXQsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDZGtIZWFkZXJSb3cgfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHsgUGJsTWV0YVJvd0RlZmluaXRpb25zIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgX1BibE5ncmlkQ29tcG9uZW50LCBQQkxfTkdSSURfQ09NUE9ORU5UIH0gZnJvbSAnLi4vLi4vdG9rZW5zJztcbmltcG9ydCB7IFBibE5ncmlkTWV0YUNlbGxDb21wb25lbnQgfSBmcm9tICcuLi9jZWxsL21ldGEtY2VsbC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50LCBQQkxfTkdSSURfQkFTRV9ST1dfVEVNUExBVEUgfSBmcm9tICcuL2Jhc2Utcm93LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxDb2x1bW5Hcm91cCwgUGJsTWV0YUNvbHVtbiB9IGZyb20gJy4uL2NvbHVtbi9tb2RlbCc7XG5pbXBvcnQgeyBQYmxOZ3JpZE1ldGFSb3dTZXJ2aWNlLCBQYmxNZXRhUm93IH0gZnJvbSAnLi4vbWV0YS1yb3dzL21ldGEtcm93LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsQ29sdW1uU3RvcmVNZXRhUm93IH0gZnJvbSAnLi4vY29sdW1uL21hbmFnZW1lbnQnO1xuaW1wb3J0IHsgYXBwbHlNZXRhUm93Q2xhc3MsIGluaXRDb2x1bW5Pck1ldGFSb3cgfSBmcm9tICcuL3V0aWxzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLW1ldGEtcm93JyxcbiAgdGVtcGxhdGU6IFBCTF9OR1JJRF9CQVNFX1JPV19URU1QTEFURSxcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1ob3N0LW1ldGFkYXRhLXByb3BlcnR5XG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdyb3cnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IENka0hlYWRlclJvdywgdXNlRXhpc3Rpbmc6IFBibE5ncmlkTWV0YVJvd0NvbXBvbmVudCB9XG4gIF0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRNZXRhUm93Q29tcG9uZW50IGV4dGVuZHMgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50PCdtZXRhLWhlYWRlcicgfCAnbWV0YS1mb290ZXInPiBpbXBsZW1lbnRzIFBibE1ldGFSb3csIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICBnZXQgcm93KCkgeyByZXR1cm4gdGhpcy5fcm93OyB9XG4gIEBJbnB1dCgpIHNldCByb3codmFsdWU6IFBibENvbHVtblN0b3JlTWV0YVJvdykgeyB0aGlzLnVwZGF0ZVJvdyh2YWx1ZSk7IH1cblxuICBnZXQgcm93SW5kZXgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3Jvdy5yb3dEZWYucm93SW5kZXg7IH1cblxuICBnZXQgbWV0YSgpOiBQYmxNZXRhUm93RGVmaW5pdGlvbnMgeyByZXR1cm4gdGhpcy5fbWV0YTsgfVxuICBzZXQgbWV0YSh2YWx1ZTogUGJsTWV0YVJvd0RlZmluaXRpb25zKSB7IHRoaXMuX21ldGEgPSB2YWx1ZTsgfSAvLyBUT0RPOiByZW1vdmUgd2hlbiByZW1vdmluZyBwYmxNZXRhUm93XG5cbiAgcmVhZG9ubHkgcm93VHlwZTogJ21ldGEtaGVhZGVyJyB8ICdtZXRhLWZvb3Rlcic7XG4gIHJlYWRvbmx5IGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICByZWFkb25seSBpc0Zvb3RlcjogYm9vbGVhbjtcbiAgcmVhZG9ubHkgZ3JpZFdpZHRoUm93OiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX21ldGE6IFBibE1ldGFSb3dEZWZpbml0aW9ucztcbiAgcHJpdmF0ZSBfcm93OiBQYmxDb2x1bW5TdG9yZU1ldGFSb3c7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChQQkxfTkdSSURfQ09NUE9ORU5UKSBAT3B0aW9uYWwoKSBncmlkOiBfUGJsTmdyaWRDb21wb25lbnQsXG4gICAgICAgICAgICAgIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgIGVsOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBtZXRhUm93czogUGJsTmdyaWRNZXRhUm93U2VydmljZSxcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgnZm9vdGVyJykgaXNGb290ZXI6IGFueSkge1xuICAgIHN1cGVyKGdyaWQsIGNkUmVmLCBlbCk7XG4gICAgdGhpcy5pc0Zvb3RlciA9IGlzRm9vdGVyICE9PSBudWxsO1xuICAgIHRoaXMucm93VHlwZSA9IHRoaXMuaXNGb290ZXIgPyAnbWV0YS1mb290ZXInIDogJ21ldGEtaGVhZGVyJztcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgdGhpcy5oYW5kbGVWaXNpYmlsaXR5KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm1ldGFSb3dzLnJlbW92ZU1ldGFSb3codGhpcyk7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvbkN0b3IoKSB7IH1cblxuICBwcm90ZWN0ZWQgZGV0ZWN0Q2hhbmdlcygpIHtcbiAgICBmb3IgKGNvbnN0IGNlbGwgb2YgdGhpcy5fY2VsbHMpIHtcbiAgICAgIC8vIFRPRE86IHRoZSBjZWxscyBhcmUgY3JlYXRlZCB0aHJvdWdoIGNvZGUgd2hpY2ggbWVhbidzIHRoYXQgdGhleSBkb24ndCBiZWxvbmdcbiAgICAgIC8vIHRvIHRoZSBDRCB0cmVlIGFuZCB3ZSBuZWVkIHRvIG1hbnVhbGx5IG1hcmsgdGhlbSBmb3IgY2hlY2tpbmdcbiAgICAgIC8vIFdlIGNhbiBjdXN0b21pemUgdGhlIGRpZmZpbmcsIGRldGVjdCBjb250ZXh0IGNoYW5nZXMgaW50ZXJuYWxseSBhbmQgb25seSB0cmlnZ2VyIHRoZXNlIGNlbGxzIHdoaWNoIGhhdmUgY2hhbmdlZCFcbiAgICAgIGNlbGwuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNlbGxDcmVhdGVkKGNvbHVtbjogUGJsTWV0YUNvbHVtbiB8IFBibENvbHVtbkdyb3VwLCBjZWxsOiBDb21wb25lbnRSZWY8UGJsTmdyaWRNZXRhQ2VsbENvbXBvbmVudD4pIHtcbiAgICBjZWxsLmluc3RhbmNlLnNldENvbHVtbihjb2x1bW4sIHRoaXMuaXNGb290ZXIpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNlbGxEZXN0cm95ZWQ/KGNlbGw6IENvbXBvbmVudFJlZjxQYmxOZ3JpZE1ldGFDZWxsQ29tcG9uZW50PiwgcHJldmlvdXNJbmRleDogbnVtYmVyKSB7XG5cbiAgfVxuXG4gIHByb3RlY3RlZCBjZWxsTW92ZWQ/KHByZXZpb3VzSXRlbTogQ29tcG9uZW50UmVmPFBibE5ncmlkTWV0YUNlbGxDb21wb25lbnQ+LCBjdXJyZW50SXRlbTogQ29tcG9uZW50UmVmPFBibE5ncmlkTWV0YUNlbGxDb21wb25lbnQ+LCBwcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSB7XG5cbiAgfVxuXG4gIHByb3RlY3RlZCB1cGRhdGVSb3codmFsdWU6IFBibENvbHVtblN0b3JlTWV0YVJvdykge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fcm93KSB7XG4gICAgICBhcHBseU1ldGFSb3dDbGFzcyh0aGlzLm1ldGFSb3dzLCB0aGlzLCB0aGlzLmVsZW1lbnQsIHRoaXMuX21ldGEsIHZhbHVlPy5yb3dEZWYpO1xuICAgICAgaWYgKHRoaXMuX3Jvdz8uaXNHcm91cCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncGJsLW1ldGEtZ3JvdXAtcm93Jyk7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWU/LmlzR3JvdXApIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3BibC1tZXRhLWdyb3VwLXJvdycpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcm93ID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVWaXNpYmlsaXR5KCkge1xuICAgIGluaXRDb2x1bW5Pck1ldGFSb3codGhpcy5lbGVtZW50LCB0aGlzLmlzRm9vdGVyKTtcbiAgICAvLyBUT0RPOiBhZGQgcm93IHZpc2liaWxpdHkgQVBJIGxpa2UgaW4gY29sdW1ucyBhbmQgcmVhY3QgdG8gY2hhbmdlc1xuICAgIC8vIC0gUmVtb3ZlIHNob3dIZWFkZXIgc2hvd0Zvb3RlciBpbnB1dHMgYW5kIG1vdmUgdGhlbSB0byBkaXJlY3RpdmVzIGFuZCBpbnNpZGUgbGV0IHRoZW0gdXNlIHRoZSBBUElcbiAgfVxufVxuIl19