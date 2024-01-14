import { Component, Input, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { unrx } from '@pebula/ngrid/core';
import { PblNgridComponent, PblNgridHeaderCellDefDirective, PblNgridCellDefDirective, PblNgridFooterCellDefDirective, PblNgridPluginController, } from '@pebula/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
import * as i2 from "@angular/common";
import * as i3 from "@angular/material/checkbox";
const ALWAYS_FALSE_FN = () => false;
export class PblNgridCheckboxComponent {
    constructor(table, cdr) {
        this.table = table;
        this.cdr = cdr;
        this.allSelected = false;
        this._isCheckboxDisabled = ALWAYS_FALSE_FN;
        const pluginCtrl = PblNgridPluginController.find(table);
        pluginCtrl.events
            .pipe(unrx(this))
            .subscribe(e => {
            if (e.kind === 'onDataSource') {
                this.selection = e.curr.selection;
            }
        });
    }
    /**
     * Defines the behavior when clicking on the bulk select checkbox (header).
     * There are 2 options:
     *
     * - all: Will select all items in the current collection
     * - view: Will select only the rendered items in the view
     *
     * The default value is `all`
     */
    get bulkSelectMode() { return this._bulkSelectMode; }
    set bulkSelectMode(value) {
        if (value !== this._bulkSelectMode) {
            this._bulkSelectMode = value;
            this.setupSelection();
        }
    }
    /**
     * A Custom selection model, optional.
     * If not set, the selection model from the DataSource is used.
     */
    get selection() {
        return this._selection;
    }
    set selection(value) {
        if (value !== this._selection) {
            this._selection = value;
            this.setupSelection();
        }
    }
    get isCheckboxDisabled() { return this._isCheckboxDisabled; }
    set isCheckboxDisabled(value) {
        if (value !== this._isCheckboxDisabled) {
            this._isCheckboxDisabled = value;
            if (!this._isCheckboxDisabled || typeof this._isCheckboxDisabled !== 'function') {
                this._isCheckboxDisabled = ALWAYS_FALSE_FN;
            }
        }
    }
    get color() { return this._color; }
    set color(value) {
        if (value !== this._color) {
            this._color = value;
            if (this.table.isInit) {
                this.markAndDetect();
            }
        }
    }
    ngAfterViewInit() {
        if (!this.selection && this.table.ds) {
            this.selection = this.table.ds.selection;
        }
        const registry = this.table.registry;
        registry.addMulti('headerCell', this.headerDef);
        registry.addMulti('tableCell', this.cellDef);
        registry.addMulti('footerCell', this.footerDef);
    }
    ngOnDestroy() {
        unrx.kill(this);
    }
    masterToggle() {
        if (this.allSelected) {
            this.selection.clear();
        }
        else {
            const selected = this.getCollection().filter(data => !this._isCheckboxDisabled(data));
            this.selection.select(...selected);
        }
    }
    rowItemChange(row) {
        this.selection.toggle(row);
        this.markAndDetect();
    }
    getCollection() {
        const { ds } = this.table;
        return this.bulkSelectMode === 'view' ? ds.renderedData : ds.source;
    }
    setupSelection() {
        unrx.kill(this, this.table);
        if (this._selection) {
            this.length = this.selection.selected.length;
            this.selection.changed
                .pipe(unrx(this, this.table))
                .subscribe(() => this.handleSelectionChanged());
            const changeSource = this.bulkSelectMode === 'view' ? this.table.ds.onRenderedDataChanged : this.table.ds.onSourceChanged;
            changeSource
                .pipe(unrx(this, this.table))
                .subscribe(() => this.handleSelectionChanged());
        }
        else {
            this.length = 0;
        }
    }
    handleSelectionChanged() {
        const { length } = this.getCollection().filter(data => !this._isCheckboxDisabled(data));
        this.allSelected = !this.selection.isEmpty() && this.selection.selected.length === length;
        this.length = this.selection.selected.length;
        this.markAndDetect();
    }
    markAndDetect() {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }
}
/** @nocollapse */ PblNgridCheckboxComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCheckboxComponent, deps: [{ token: i1.PblNgridComponent }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridCheckboxComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCheckboxComponent, selector: "pbl-ngrid-checkbox", inputs: { name: "name", bulkSelectMode: "bulkSelectMode", selection: "selection", isCheckboxDisabled: "isCheckboxDisabled", color: "color" }, viewQueries: [{ propertyName: "headerDef", first: true, predicate: PblNgridHeaderCellDefDirective, descendants: true, static: true }, { propertyName: "cellDef", first: true, predicate: PblNgridCellDefDirective, descendants: true, static: true }, { propertyName: "footerDef", first: true, predicate: PblNgridFooterCellDefDirective, descendants: true, static: true }], ngImport: i0, template: "<ng-container *pblNgridHeaderCellDef=\"name; col as col;\">\n  <mat-checkbox *ngIf=\"bulkSelectMode !== 'none'\"\n                style=\"overflow: initial\"\n                [color]=\"color\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"$event ? masterToggle() : null\"\n                [checked]=\"allSelected\"\n                [indeterminate]=\"length > 0 && !allSelected\">\n  </mat-checkbox>\n</ng-container>\n<mat-checkbox *pblNgridCellDef=\"name; row as row;\"\n              style=\"overflow: initial\"\n              class=\"pbl-ngrid-selection-checkbox\"\n              [color]=\"color\"\n              [disabled]=isCheckboxDisabled(row)\n              (click)=\"$event.stopPropagation()\"\n              (change)=\"rowItemChange(row)\"\n              [checked]=\"selection.isSelected(row)\">\n</mat-checkbox>\n<span *pblNgridFooterCellDef=\"name; col as col;\">{{ length ? length : '' }}</span>\n", styles: [".mat-header-cell.pbl-ngrid-checkbox,.mat-cell.pbl-ngrid-checkbox{box-sizing:content-box;flex:0 0 24px;overflow:visible}.pbl-ngrid-selection-checkbox .mat-checkbox-background{transition:none}\n"], dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.MatCheckbox, selector: "mat-checkbox", inputs: ["disableRipple", "color", "tabIndex"], exportAs: ["matCheckbox"] }, { kind: "directive", type: i1.PblNgridHeaderCellDefDirective, selector: "[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]", inputs: ["pblNgridHeaderCellDef", "pblNgridHeaderCellTypeDef"] }, { kind: "directive", type: i1.PblNgridFooterCellDefDirective, selector: "[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]", inputs: ["pblNgridFooterCellDef", "pblNgridFooterCellTypeDef"] }, { kind: "directive", type: i1.PblNgridCellDefDirective, selector: "[pblNgridCellDef], [pblNgridCellTypeDef]", inputs: ["pblNgridCellDef", "pblNgridCellTypeDef"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCheckboxComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-checkbox', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<ng-container *pblNgridHeaderCellDef=\"name; col as col;\">\n  <mat-checkbox *ngIf=\"bulkSelectMode !== 'none'\"\n                style=\"overflow: initial\"\n                [color]=\"color\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"$event ? masterToggle() : null\"\n                [checked]=\"allSelected\"\n                [indeterminate]=\"length > 0 && !allSelected\">\n  </mat-checkbox>\n</ng-container>\n<mat-checkbox *pblNgridCellDef=\"name; row as row;\"\n              style=\"overflow: initial\"\n              class=\"pbl-ngrid-selection-checkbox\"\n              [color]=\"color\"\n              [disabled]=isCheckboxDisabled(row)\n              (click)=\"$event.stopPropagation()\"\n              (change)=\"rowItemChange(row)\"\n              [checked]=\"selection.isSelected(row)\">\n</mat-checkbox>\n<span *pblNgridFooterCellDef=\"name; col as col;\">{{ length ? length : '' }}</span>\n", styles: [".mat-header-cell.pbl-ngrid-checkbox,.mat-cell.pbl-ngrid-checkbox{box-sizing:content-box;flex:0 0 24px;overflow:visible}.pbl-ngrid-selection-checkbox .mat-checkbox-background{transition:none}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { name: [{
                type: Input
            }], bulkSelectMode: [{
                type: Input
            }], selection: [{
                type: Input
            }], isCheckboxDisabled: [{
                type: Input
            }], color: [{
                type: Input
            }], headerDef: [{
                type: ViewChild,
                args: [PblNgridHeaderCellDefDirective, { static: true }]
            }], cellDef: [{
                type: ViewChild,
                args: [PblNgridCellDefDirective, { static: true }]
            }], footerDef: [{
                type: ViewChild,
                args: [PblNgridFooterCellDefDirective, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY2hlY2tib3guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC1tYXRlcmlhbC9zZWxlY3Rpb24tY29sdW1uL3NyYy9saWIvdGFibGUtY2hlY2tib3guY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC1tYXRlcmlhbC9zZWxlY3Rpb24tY29sdW1uL3NyYy9saWIvdGFibGUtY2hlY2tib3guY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUE0Qix1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNySixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHMUQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsOEJBQThCLEVBQzlCLHdCQUF3QixFQUN4Qiw4QkFBOEIsRUFDOUIsd0JBQXdCLEdBQ3pCLE1BQU0sZUFBZSxDQUFDOzs7OztBQUV2QixNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFTcEMsTUFBTSxPQUFPLHlCQUF5QjtJQXNFcEMsWUFBbUIsS0FBNkIsRUFBVSxHQUFzQjtRQUE3RCxVQUFLLEdBQUwsS0FBSyxDQUF3QjtRQUFVLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBUmhGLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBS1osd0JBQW1CLEdBQTBCLGVBQWUsQ0FBQztRQUluRSxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsVUFBVSxDQUFDLE1BQU07YUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FB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QUFLO2dCQVVPLEtBQUs7c0JBQWpCLEtBQUs7Z0JBVXVELFNBQVM7c0JBQXJFLFNBQVM7dUJBQUMsOEJBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUNKLE9BQU87c0JBQTdELFNBQVM7dUJBQUMsd0JBQXdCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUNRLFNBQVM7c0JBQXJFLFNBQVM7dUJBQUMsOEJBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgVmlld0NoaWxkLCBWaWV3RW5jYXBzdWxhdGlvbiwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNlbGVjdGlvbk1vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFRoZW1lUGFsZXR0ZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7XG4gIFBibE5ncmlkQ29tcG9uZW50LFxuICBQYmxOZ3JpZEhlYWRlckNlbGxEZWZEaXJlY3RpdmUsXG4gIFBibE5ncmlkQ2VsbERlZkRpcmVjdGl2ZSxcbiAgUGJsTmdyaWRGb290ZXJDZWxsRGVmRGlyZWN0aXZlLFxuICBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsXG59IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5jb25zdCBBTFdBWVNfRkFMU0VfRk4gPSAoKSA9PiBmYWxzZTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLWNoZWNrYm94JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3RhYmxlLWNoZWNrYm94LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdGFibGUtY2hlY2tib3guY29tcG9uZW50LnNjc3MnXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ2hlY2tib3hDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogVW5pcXVlIG5hbWUgZm9yIHRoZSBjaGVja2JveCBjb2x1bW4uXG4gICAqIFdoZW4gbm90IHNldCwgdGhlIG5hbWUgJ2NoZWNrYm94JyBpcyB1c2VkLlxuICAgKlxuICAgKiovXG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgYmVoYXZpb3Igd2hlbiBjbGlja2luZyBvbiB0aGUgYnVsayBzZWxlY3QgY2hlY2tib3ggKGhlYWRlcikuXG4gICAqIFRoZXJlIGFyZSAyIG9wdGlvbnM6XG4gICAqXG4gICAqIC0gYWxsOiBXaWxsIHNlbGVjdCBhbGwgaXRlbXMgaW4gdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuICAgKiAtIHZpZXc6IFdpbGwgc2VsZWN0IG9ubHkgdGhlIHJlbmRlcmVkIGl0ZW1zIGluIHRoZSB2aWV3XG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIGBhbGxgXG4gICAqL1xuICBASW5wdXQoKSBnZXQgYnVsa1NlbGVjdE1vZGUoKTogJ2FsbCcgfCAndmlldycgfCAnbm9uZScgeyByZXR1cm4gdGhpcy5fYnVsa1NlbGVjdE1vZGU7IH1cbiAgc2V0IGJ1bGtTZWxlY3RNb2RlKHZhbHVlOiAnYWxsJyB8ICd2aWV3JyB8ICdub25lJykge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fYnVsa1NlbGVjdE1vZGUpIHtcbiAgICAgIHRoaXMuX2J1bGtTZWxlY3RNb2RlID0gdmFsdWU7XG4gICAgICB0aGlzLnNldHVwU2VsZWN0aW9uKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBBIEN1c3RvbSBzZWxlY3Rpb24gbW9kZWwsIG9wdGlvbmFsLlxuICAgKiBJZiBub3Qgc2V0LCB0aGUgc2VsZWN0aW9uIG1vZGVsIGZyb20gdGhlIERhdGFTb3VyY2UgaXMgdXNlZC5cbiAgICovXG4gIEBJbnB1dCgpIGdldCBzZWxlY3Rpb24oKTogU2VsZWN0aW9uTW9kZWw8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbjtcbiAgfVxuICBzZXQgc2VsZWN0aW9uKHZhbHVlOiBTZWxlY3Rpb25Nb2RlbDxhbnk+KSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9zZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbiA9IHZhbHVlO1xuICAgICAgdGhpcy5zZXR1cFNlbGVjdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgpIGdldCBpc0NoZWNrYm94RGlzYWJsZWQoKSB7IHJldHVybiB0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQ7IH1cbiAgc2V0IGlzQ2hlY2tib3hEaXNhYmxlZCh2YWx1ZTogKHJvdzogYW55KSA9PiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2lzQ2hlY2tib3hEaXNhYmxlZCA9IHZhbHVlO1xuICAgICAgaWYgKCF0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQgfHwgdHlwZW9mIHRoaXMuX2lzQ2hlY2tib3hEaXNhYmxlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQgPSBBTFdBWVNfRkFMU0VfRk47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQElucHV0KCkgZ2V0IGNvbG9yKCk6IFRoZW1lUGFsZXR0ZSB7IHJldHVybiB0aGlzLl9jb2xvcjsgfVxuICBzZXQgY29sb3IodmFsdWU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fY29sb3IpIHtcbiAgICAgIHRoaXMuX2NvbG9yID0gdmFsdWU7XG4gICAgICBpZiAodGhpcy50YWJsZS5pc0luaXQpIHtcbiAgICAgICAgdGhpcy5tYXJrQW5kRGV0ZWN0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQFZpZXdDaGlsZChQYmxOZ3JpZEhlYWRlckNlbGxEZWZEaXJlY3RpdmUsIHsgc3RhdGljOiB0cnVlIH0pIGhlYWRlckRlZjogUGJsTmdyaWRIZWFkZXJDZWxsRGVmRGlyZWN0aXZlPGFueT47XG4gIEBWaWV3Q2hpbGQoUGJsTmdyaWRDZWxsRGVmRGlyZWN0aXZlLCB7IHN0YXRpYzogdHJ1ZSB9KSBjZWxsRGVmOiBQYmxOZ3JpZENlbGxEZWZEaXJlY3RpdmU8YW55PjtcbiAgQFZpZXdDaGlsZChQYmxOZ3JpZEZvb3RlckNlbGxEZWZEaXJlY3RpdmUsIHsgc3RhdGljOiB0cnVlIH0pIGZvb3RlckRlZjogUGJsTmdyaWRGb290ZXJDZWxsRGVmRGlyZWN0aXZlPGFueT47XG5cbiAgYWxsU2VsZWN0ZWQgPSBmYWxzZTtcbiAgbGVuZ3RoOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBfc2VsZWN0aW9uOiBTZWxlY3Rpb25Nb2RlbDxhbnk+O1xuICBwcml2YXRlIF9idWxrU2VsZWN0TW9kZTogJ2FsbCcgfCAndmlldycgfCAnbm9uZSc7XG4gIHByaXZhdGUgX2lzQ2hlY2tib3hEaXNhYmxlZDogKHJvdzogYW55KSA9PiBib29sZWFuID0gQUxXQVlTX0ZBTFNFX0ZOO1xuICBwcml2YXRlIF9jb2xvcjogVGhlbWVQYWxldHRlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0YWJsZTogUGJsTmdyaWRDb21wb25lbnQ8YW55PiwgcHJpdmF0ZSBjZHI6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgY29uc3QgcGx1Z2luQ3RybCA9IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKHRhYmxlKTtcbiAgICBwbHVnaW5DdHJsLmV2ZW50c1xuICAgICAgLnBpcGUodW5yeCh0aGlzKSlcbiAgICAgIC5zdWJzY3JpYmUoIGUgPT4ge1xuICAgICAgICBpZiAoZS5raW5kID09PSAnb25EYXRhU291cmNlJykge1xuICAgICAgICAgIHRoaXMuc2VsZWN0aW9uID0gZS5jdXJyLnNlbGVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0aW9uICYmIHRoaXMudGFibGUuZHMpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uID0gdGhpcy50YWJsZS5kcy5zZWxlY3Rpb247XG4gICAgfVxuXG4gICAgY29uc3QgcmVnaXN0cnkgPSB0aGlzLnRhYmxlLnJlZ2lzdHJ5O1xuICAgIHJlZ2lzdHJ5LmFkZE11bHRpKCdoZWFkZXJDZWxsJywgdGhpcy5oZWFkZXJEZWYpO1xuICAgIHJlZ2lzdHJ5LmFkZE11bHRpKCd0YWJsZUNlbGwnLCB0aGlzLmNlbGxEZWYpO1xuICAgIHJlZ2lzdHJ5LmFkZE11bHRpKCdmb290ZXJDZWxsJywgdGhpcy5mb290ZXJEZWYpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdW5yeC5raWxsKHRoaXMpO1xuICB9XG5cbiAgbWFzdGVyVG9nZ2xlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFsbFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbi5jbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuZ2V0Q29sbGVjdGlvbigpLmZpbHRlcihkYXRhID0+ICF0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQoZGF0YSkpO1xuICAgICAgdGhpcy5zZWxlY3Rpb24uc2VsZWN0KC4uLnNlbGVjdGVkKTtcbiAgICB9XG4gIH1cblxuICByb3dJdGVtQ2hhbmdlKHJvdzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3Rpb24udG9nZ2xlKHJvdyk7XG4gICAgdGhpcy5tYXJrQW5kRGV0ZWN0KCk7XG4gIH1cblxuICBwcml2YXRlIGdldENvbGxlY3Rpb24oKSB7XG4gICAgY29uc3QgeyBkcyB9ID0gdGhpcy50YWJsZTtcbiAgICByZXR1cm4gdGhpcy5idWxrU2VsZWN0TW9kZSA9PT0gJ3ZpZXcnID8gZHMucmVuZGVyZWREYXRhIDogZHMuc291cmNlO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cFNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICB1bnJ4LmtpbGwodGhpcywgdGhpcy50YWJsZSk7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGlvbikge1xuICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLnNlbGVjdGlvbi5zZWxlY3RlZC5sZW5ndGg7XG4gICAgICB0aGlzLnNlbGVjdGlvbi5jaGFuZ2VkXG4gICAgICAgIC5waXBlKHVucngodGhpcywgdGhpcy50YWJsZSkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5oYW5kbGVTZWxlY3Rpb25DaGFuZ2VkKCkpO1xuICAgICAgY29uc3QgY2hhbmdlU291cmNlID0gdGhpcy5idWxrU2VsZWN0TW9kZSA9PT0gJ3ZpZXcnID8gdGhpcy50YWJsZS5kcy5vblJlbmRlcmVkRGF0YUNoYW5nZWQgOiB0aGlzLnRhYmxlLmRzLm9uU291cmNlQ2hhbmdlZDtcbiAgICAgIGNoYW5nZVNvdXJjZVxuICAgICAgICAucGlwZSh1bnJ4KHRoaXMsIHRoaXMudGFibGUpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlZCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlZCgpIHtcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gdGhpcy5nZXRDb2xsZWN0aW9uKCkuZmlsdGVyKGRhdGEgPT4gIXRoaXMuX2lzQ2hlY2tib3hEaXNhYmxlZChkYXRhKSk7XG4gICAgdGhpcy5hbGxTZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGlvbi5pc0VtcHR5KCkgJiYgdGhpcy5zZWxlY3Rpb24uc2VsZWN0ZWQubGVuZ3RoID09PSBsZW5ndGg7XG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLnNlbGVjdGlvbi5zZWxlY3RlZC5sZW5ndGg7XG4gICAgdGhpcy5tYXJrQW5kRGV0ZWN0KCk7XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbmREZXRlY3QoKSB7XG4gICAgdGhpcy5jZHIubWFya0ZvckNoZWNrKCk7XG4gICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG59XG4iLCI8bmctY29udGFpbmVyICpwYmxOZ3JpZEhlYWRlckNlbGxEZWY9XCJuYW1lOyBjb2wgYXMgY29sO1wiPlxuICA8bWF0LWNoZWNrYm94ICpuZ0lmPVwiYnVsa1NlbGVjdE1vZGUgIT09ICdub25lJ1wiXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJvdmVyZmxvdzogaW5pdGlhbFwiXG4gICAgICAgICAgICAgICAgW2NvbG9yXT1cImNvbG9yXCJcbiAgICAgICAgICAgICAgICAoY2xpY2spPVwiJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCJcbiAgICAgICAgICAgICAgICAoY2hhbmdlKT1cIiRldmVudCA/IG1hc3RlclRvZ2dsZSgpIDogbnVsbFwiXG4gICAgICAgICAgICAgICAgW2NoZWNrZWRdPVwiYWxsU2VsZWN0ZWRcIlxuICAgICAgICAgICAgICAgIFtpbmRldGVybWluYXRlXT1cImxlbmd0aCA+IDAgJiYgIWFsbFNlbGVjdGVkXCI+XG4gIDwvbWF0LWNoZWNrYm94PlxuPC9uZy1jb250YWluZXI+XG48bWF0LWNoZWNrYm94ICpwYmxOZ3JpZENlbGxEZWY9XCJuYW1lOyByb3cgYXMgcm93O1wiXG4gICAgICAgICAgICAgIHN0eWxlPVwib3ZlcmZsb3c6IGluaXRpYWxcIlxuICAgICAgICAgICAgICBjbGFzcz1cInBibC1uZ3JpZC1zZWxlY3Rpb24tY2hlY2tib3hcIlxuICAgICAgICAgICAgICBbY29sb3JdPVwiY29sb3JcIlxuICAgICAgICAgICAgICBbZGlzYWJsZWRdPWlzQ2hlY2tib3hEaXNhYmxlZChyb3cpXG4gICAgICAgICAgICAgIChjbGljayk9XCIkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIlxuICAgICAgICAgICAgICAoY2hhbmdlKT1cInJvd0l0ZW1DaGFuZ2Uocm93KVwiXG4gICAgICAgICAgICAgIFtjaGVja2VkXT1cInNlbGVjdGlvbi5pc1NlbGVjdGVkKHJvdylcIj5cbjwvbWF0LWNoZWNrYm94PlxuPHNwYW4gKnBibE5ncmlkRm9vdGVyQ2VsbERlZj1cIm5hbWU7IGNvbCBhcyBjb2w7XCI+e3sgbGVuZ3RoID8gbGVuZ3RoIDogJycgfX08L3NwYW4+XG4iXX0=