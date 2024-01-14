import * as i0 from '@angular/core';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Input, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i2 from '@angular/material/paginator';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { unrx, deprecatedWarning } from '@asafmalin/ngrid/core';
import * as i1 from '@asafmalin/ngrid';
import { PblNgridModule } from '@asafmalin/ngrid';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i4 from '@angular/material/form-field';
import * as i5 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i6 from '@angular/material/core';
import * as i7 from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as i8 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];
class PblPaginatorComponent {
    constructor(grid, _intl, cdr) {
        this._intl = _intl;
        this.cdr = cdr;
        this.pages = [];
        this.pageSizes = DEFAULT_PAGE_SIZE_OPTIONS.slice();
        this._hidePageSize = false;
        this._hideRangeSelect = false;
        if (grid) {
            this.grid = grid;
        }
        _intl.changes
            .pipe(unrx(this))
            .subscribe(() => this.cdr.markForCheck());
    }
    get pageSizeOptions() { return this._pageSizeOptions; }
    set pageSizeOptions(value) {
        this._pageSizeOptions = value;
        this.pageSizes = (value || DEFAULT_PAGE_SIZE_OPTIONS).slice();
        this.updatePageSizes();
    }
    get paginator() { return this._paginator; }
    set paginator(value) {
        if (this._paginator === value) {
            return;
        }
        if (this._paginator) {
            unrx.kill(this, this._paginator);
        }
        this._paginator = value;
        if (value) {
            // pagination.onChange is BehaviorSubject so handlePageChange will trigger
            value.onChange
                .pipe(unrx(this, value))
                .subscribe(event => this.handlePageChange(event));
            this.updatePageSizes();
        }
    }
    /**
     * @deprecated Will be removed in v5, Use `grid` instead
     */
    get table() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            deprecatedWarning('PblPaginatorComponent.table', '4', 'PblPaginatorComponent.grid');
        }
        return this.grid;
    }
    /**
     * @deprecated Will be removed in v5, Use `grid` instead
     */
    set table(value) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            console.warn(`"PblPaginatorComponent.table" is deprecated and will be removed in version 5, use "grid" instead.`);
        }
        this.grid = value;
    }
    get hidePageSize() { return this._hidePageSize; }
    set hidePageSize(value) { this._hidePageSize = coerceBooleanProperty(value); }
    get hideRangeSelect() { return this._hideRangeSelect; }
    set hideRangeSelect(value) { this._hideRangeSelect = coerceBooleanProperty(value); }
    ngOnDestroy() {
        unrx.kill(this);
    }
    updatePageSizes() {
        if (this.paginator && this.pageSizes.indexOf(this.paginator.perPage) === -1) {
            this.pageSizes.push(this.paginator.perPage);
        }
        this.pageSizes.sort((a, b) => a - b);
    }
    handlePageChange(event) {
        if (this.pages.length !== this.paginator.totalPages) {
            const pages = this.pages = [];
            for (let i = 1, len = this.paginator.totalPages + 1; i < len; i++) {
                pages.push(i);
            }
        }
        // this is required here to prevent `ExpressionChangedAfterItHasBeenCheckedError` when the component has or wrapped
        // by an ngIf
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }
}
/** @nocollapse */ PblPaginatorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblPaginatorComponent, deps: [{ token: i1.PblNgridComponent, optional: true }, { token: i2.MatPaginatorIntl }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblPaginatorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblPaginatorComponent, selector: "pbl-ngrid-paginator", inputs: { pageSizeOptions: "pageSizeOptions", paginator: "paginator", table: "table", grid: "grid", hidePageSize: "hidePageSize", hideRangeSelect: "hideRangeSelect" }, host: { classAttribute: "mat-paginator" }, ngImport: i0, template: "<div class=\"mat-paginator-outer-container\">\n  <div class=\"mat-paginator-container\">\n    <div *ngIf=\"!hidePageSize\" class=\"mat-paginator-page-size\">\n      <div class=\"mat-paginator-page-size-label\">\n        {{_intl.itemsPerPageLabel}}\n      </div>\n\n      <mat-form-field *ngIf=\"pageSizes.length > 1\"\n                      class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"paginator.perPage\"\n          [aria-label]=\"_intl.itemsPerPageLabel\"\n          [disabled]=\"pageSizes[0] >= paginator.total && (!paginator.hasPrev() && !paginator.hasNext())\"\n          (selectionChange)=\"paginator.perPage = $event.value\">\n          <mat-option *ngFor=\"let pageSizeOption of pageSizes\" [value]=\"pageSizeOption\">\n            {{pageSizeOption}}\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n      <div *ngIf=\"pageSizes.length <= 1\">{{paginator?.perPage}}</div>\n    </div>\n\n    <div class=\"mat-paginator-range-actions\">\n      <div *ngIf=\"paginator.kind ==='pageNumber'\" class=\"mat-paginator-range-label\">\n        {{_intl.getRangeLabel(paginator.page - 1, paginator.perPage, paginator.total)}}\n      </div>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-previous\"\n              (click)=\"paginator.prevPage()\"\n              [attr.aria-label]=\"_intl.previousPageLabel\"\n              [matTooltip]=\"_intl.previousPageLabel\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"!paginator.hasPrev()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/>\n        </svg>\n      </button>\n\n      <mat-form-field *ngIf=\"!hideRangeSelect && paginator.kind ==='pageNumber' && pageSizes.length >= 1\"\n                      class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"paginator.page\"\n          [disabled]=\"paginator.totalPages === 1\"\n          (selectionChange)=\"paginator.page = $event.value\">\n          <mat-option *ngFor=\"let p of pages\" [value]=\"p\">{{p}}</mat-option>\n        </mat-select>\n      </mat-form-field>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-next\"\n              (click)=\"paginator.nextPage()\"\n              [attr.aria-label]=\"_intl.nextPageLabel\"\n              [matTooltip]=\"_intl.nextPageLabel\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"!paginator.hasNext()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/>\n        </svg>\n      </button>\n    </div>\n  </div>\n</div>\n", styles: [".mat-paginator-range-label{flex-grow:1}.mat-paginator-container{box-sizing:border-box}\n"], dependencies: [{ kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i4.MatFormField, selector: "mat-form-field", inputs: ["color", "appearance", "hideRequiredMarker", "hintLabel", "floatLabel"], exportAs: ["matFormField"] }, { kind: "component", type: i5.MatSelect, selector: "mat-select", inputs: ["disabled", "disableRipple", "tabIndex"], exportAs: ["matSelect"] }, { kind: "component", type: i6.MatOption, selector: "mat-option", exportAs: ["matOption"] }, { kind: "directive", type: i7.MatTooltip, selector: "[matTooltip]", exportAs: ["matTooltip"] }, { kind: "component", type: i8.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblPaginatorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-paginator', host: {
                        'class': 'mat-paginator',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<div class=\"mat-paginator-outer-container\">\n  <div class=\"mat-paginator-container\">\n    <div *ngIf=\"!hidePageSize\" class=\"mat-paginator-page-size\">\n      <div class=\"mat-paginator-page-size-label\">\n        {{_intl.itemsPerPageLabel}}\n      </div>\n\n      <mat-form-field *ngIf=\"pageSizes.length > 1\"\n                      class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"paginator.perPage\"\n          [aria-label]=\"_intl.itemsPerPageLabel\"\n          [disabled]=\"pageSizes[0] >= paginator.total && (!paginator.hasPrev() && !paginator.hasNext())\"\n          (selectionChange)=\"paginator.perPage = $event.value\">\n          <mat-option *ngFor=\"let pageSizeOption of pageSizes\" [value]=\"pageSizeOption\">\n            {{pageSizeOption}}\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n      <div *ngIf=\"pageSizes.length <= 1\">{{paginator?.perPage}}</div>\n    </div>\n\n    <div class=\"mat-paginator-range-actions\">\n      <div *ngIf=\"paginator.kind ==='pageNumber'\" class=\"mat-paginator-range-label\">\n        {{_intl.getRangeLabel(paginator.page - 1, paginator.perPage, paginator.total)}}\n      </div>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-previous\"\n              (click)=\"paginator.prevPage()\"\n              [attr.aria-label]=\"_intl.previousPageLabel\"\n              [matTooltip]=\"_intl.previousPageLabel\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"!paginator.hasPrev()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/>\n        </svg>\n      </button>\n\n      <mat-form-field *ngIf=\"!hideRangeSelect && paginator.kind ==='pageNumber' && pageSizes.length >= 1\"\n                      class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"paginator.page\"\n          [disabled]=\"paginator.totalPages === 1\"\n          (selectionChange)=\"paginator.page = $event.value\">\n          <mat-option *ngFor=\"let p of pages\" [value]=\"p\">{{p}}</mat-option>\n        </mat-select>\n      </mat-form-field>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-next\"\n              (click)=\"paginator.nextPage()\"\n              [attr.aria-label]=\"_intl.nextPageLabel\"\n              [matTooltip]=\"_intl.nextPageLabel\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"!paginator.hasNext()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/>\n        </svg>\n      </button>\n    </div>\n  </div>\n</div>\n", styles: [".mat-paginator-range-label{flex-grow:1}.mat-paginator-container{box-sizing:border-box}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent, decorators: [{
                    type: Optional
                }] }, { type: i2.MatPaginatorIntl }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { pageSizeOptions: [{
                type: Input
            }], paginator: [{
                type: Input
            }], table: [{
                type: Input
            }], grid: [{
                type: Input
            }], hidePageSize: [{
                type: Input
            }], hideRangeSelect: [{
                type: Input
            }] } });

// TODO: Remove MatPaginatorModule and the initial code in the constructor
// set the styles in the SCSS.
class PblNgridPaginatorModule {
    constructor(cf, injector) {
        // this is a workaround to ensure CSS from mat slider is loaded, otherwise it is omitted.
        cf.resolveComponentFactory(MatPaginator).create(injector);
    }
}
/** @nocollapse */ PblNgridPaginatorModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridPaginatorModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, declarations: [PblPaginatorComponent], imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule], exports: [PblPaginatorComponent] });
/** @nocollapse */ PblNgridPaginatorModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule],
                    declarations: [PblPaginatorComponent],
                    exports: [PblPaginatorComponent]
                }]
        }], ctorParameters: function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.Injector }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridPaginatorModule, PblPaginatorComponent };
//# sourceMappingURL=pebula-ngrid-material-paginator.mjs.map
