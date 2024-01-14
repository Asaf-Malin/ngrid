import { filter } from 'rxjs/operators';
import { Component } from '@angular/core';
import { unrx } from '@asafmalin/ngrid/core';
import { initCellElement } from './utils';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
export class PblNgridCellComponent extends PblNgridBaseCell {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jZWxsL2NlbGwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsU0FBUyxFQUF3QixNQUFNLGVBQWUsQ0FBQztBQUNoRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFJMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7OztBQUUvQyxNQUFNLDBCQUEwQixHQUFHLHlCQUF5QixDQUFDO0FBRTdELFNBQVMsbUJBQW1CLENBQUMsRUFBZSxFQUFFLE1BQWlCLEVBQUUsSUFBZ0I7SUFDL0UsSUFBSSxJQUFJLEVBQUUsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDcEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUNqRDtJQUNELElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ3ZDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDOUM7QUFDSCxDQUFDO0FBRUQsb0VBQW9FO0FBYXBFLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxnQkFBZ0I7SUFaM0Q7O1FBd0JVLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsYUFBUSxHQUFHLEtBQUssQ0FBQztLQTREMUI7SUExREMsVUFBVTtRQUNSLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFB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Z0JBQWdCO29CQUMxQixRQUFRLEVBQUUsOEVBQThFO29CQUN4RixzREFBc0Q7b0JBQ3RELElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsZ0JBQWdCO3dCQUN6QixNQUFNLEVBQUUsVUFBVTt3QkFDbEIsV0FBVyxFQUFFLFlBQVk7d0JBQ3pCLGlCQUFpQixFQUFFLG1DQUFtQztxQkFDdkQ7b0JBQ0QsUUFBUSxFQUFFLGNBQWM7aUJBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBEb0NoZWNrLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IFBibFJvd0NvbnRleHQsIFBibENlbGxDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9pbmRleCc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi9jb2x1bW4vbW9kZWwnO1xuaW1wb3J0IHsgaW5pdENlbGxFbGVtZW50IH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VDZWxsIH0gZnJvbSAnLi9iYXNlLWNlbGwnO1xuXG5jb25zdCBDT0xVTU5fRURJVEFCTEVfQ0VMTF9DTEFTUyA9ICdwYmwtbmdyaWQtZWRpdGFibGUtY2VsbCc7XG5cbmZ1bmN0aW9uIGluaXREYXRhQ2VsbEVsZW1lbnQoZWw6IEhUTUxFbGVtZW50LCBjb2x1bW46IFBibENvbHVtbiwgcHJldj86IFBibENvbHVtbik6IHZvaWQge1xuICBpZiAocHJldj8uZWRpdGFibGUgJiYgcHJldi5lZGl0b3JUcGwpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKENPTFVNTl9FRElUQUJMRV9DRUxMX0NMQVNTKTtcbiAgfVxuICBpZiAoY29sdW1uLmVkaXRhYmxlICYmIGNvbHVtbi5lZGl0b3JUcGwpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKENPTFVNTl9FRElUQUJMRV9DRUxMX0NMQVNTKTtcbiAgfVxufVxuXG4vKiogQ2VsbCB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBhZGRzIHRoZSByaWdodCBjbGFzc2VzIGFuZCByb2xlLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLWNlbGwnLFxuICB0ZW1wbGF0ZTogYDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJ0ZW1wbGF0ZTsgY29udGV4dDogY2VsbEN0eFwiPjwvbmctY29udGFpbmVyPmAsXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ3BibC1uZ3JpZC1jZWxsJyxcbiAgICAncm9sZSc6ICdncmlkY2VsbCcsXG4gICAgJ1thdHRyLmlkXSc6ICdjb2x1bW4/LmlkJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ2NvbHVtbj8uY29sdW1uRGVmPy5ncmlkLmNlbGxGb2N1cydcbiAgfSxcbiAgZXhwb3J0QXM6ICdwYmxOZ3JpZENlbGwnLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENlbGxDb21wb25lbnQgZXh0ZW5kcyBQYmxOZ3JpZEJhc2VDZWxsIGltcGxlbWVudHMgRG9DaGVjayB7XG5cbiAgY29sdW1uOiBQYmxDb2x1bW47XG4gIGNlbGxDdHg6IFBibENlbGxDb250ZXh0IHwgdW5kZWZpbmVkO1xuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBwcml2YXRlIF9yb3dDdHg6IFBibFJvd0NvbnRleHQ8YW55PjtcblxuICAvKipcbiAgICogVGhlIHBvc2l0aW9uIG9mIHRoZSBjb2x1bW4gZGVmIGFtb25nIGFsbCBjb2x1bW5zIHJlZ2FyZGxlc3Mgb2YgdmlzaWJpbGl0eS5cbiAgICovXG4gIHByaXZhdGUgY29sSW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSBmb2N1c2VkID0gZmFsc2U7XG4gIHByaXZhdGUgc2VsZWN0ZWQgPSBmYWxzZTtcblxuICBzeW5jQ29sdW1uKCkge1xuICAgIGlmICh0aGlzLmNvbHVtbikge1xuICAgICAgdGhpcy5jb2xJbmRleCA9IHRoaXMuY29sdW1uLmNvbHVtbkRlZi5ncmlkLmNvbHVtbkFwaS5pbmRleE9mKHRoaXMuY29sdW1uKTtcbiAgICB9XG4gIH1cblxuICBzZXRDb250ZXh0KGNvbnRleHQ6IFBibFJvd0NvbnRleHQ8YW55Pikge1xuICAgIHRoaXMuX3Jvd0N0eCA9IGNvbnRleHQ7XG4gIH1cblxuICBzZXRDb2x1bW4oY29sdW1uOiBQYmxDb2x1bW4pIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHByZXYgIT09IGNvbHVtbikge1xuICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgdW5yeC5raWxsKHRoaXMsIHByZXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIHRoaXMuY29sSW5kZXggPSB0aGlzLmNvbHVtbi5jb2x1bW5EZWYuZ3JpZC5jb2x1bW5BcGkuaW5kZXhPZihjb2x1bW4pO1xuXG4gICAgICBjb2x1bW4uY29sdW1uRGVmLmFwcGx5V2lkdGgodGhpcy5lbCk7XG4gICAgICBpbml0Q2VsbEVsZW1lbnQodGhpcy5lbCwgY29sdW1uLCBwcmV2KTtcbiAgICAgIGluaXREYXRhQ2VsbEVsZW1lbnQodGhpcy5lbCwgY29sdW1uLCBwcmV2KTtcblxuICAgICAgLyogIEFwcGx5IHdpZHRoIGNoYW5nZXMgdG8gdGhpcyBkYXRhIGNlbGxcbiAgICAgICAgICBXZSBkb24ndCB1cGRhdGUgXCJ1cGRhdGVcIiBldmVudHMgYmVjYXVzZSB0aGV5IGFyZSBmb2xsb3dlZCBieSBhIHJlc2l6ZSBldmVudCB3aGljaCB3aWxsIHVwZGF0ZSB0aGUgYWJzb2x1dGUgdmFsdWUgKHB4KSAqL1xuICAgICAgY29sdW1uLmNvbHVtbkRlZi53aWR0aENoYW5nZVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoIGV2ZW50ID0+IGV2ZW50LnJlYXNvbiAhPT0gJ3VwZGF0ZScpLFxuICAgICAgICAgIHVucngodGhpcywgY29sdW1uKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHRoaXMuY29sdW1uLmNvbHVtbkRlZi5hcHBseVdpZHRoKHRoaXMuZWwpKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Jvd0N0eCkge1xuICAgICAgY29uc3QgY2VsbENvbnRleHQgPSB0aGlzLmNlbGxDdHggPSB0aGlzLl9yb3dDdHguY2VsbCh0aGlzLmNvbEluZGV4KTtcblxuICAgICAgdGhpcy50ZW1wbGF0ZSA9IGNlbGxDb250ZXh0LmVkaXRpbmcgPyB0aGlzLmNvbHVtbi5lZGl0b3JUcGwgOiB0aGlzLmNvbHVtbi5jZWxsVHBsO1xuXG4gICAgICBpZiAoY2VsbENvbnRleHQuZm9jdXNlZCAhPT0gdGhpcy5mb2N1c2VkKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9jdXNlZCA9IGNlbGxDb250ZXh0LmZvY3VzZWQpIHtcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3BibC1uZ3JpZC1jZWxsLWZvY3VzZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3BibC1uZ3JpZC1jZWxsLWZvY3VzZWQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY2VsbEN0eC5zZWxlY3RlZCAhPT0gdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA9IGNlbGxDb250ZXh0LnNlbGVjdGVkKSB7XG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdwYmwtbmdyaWQtY2VsbC1zZWxlY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncGJsLW5ncmlkLWNlbGwtc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19