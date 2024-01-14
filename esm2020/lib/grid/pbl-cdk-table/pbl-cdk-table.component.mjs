import { Subject, of as observableOf, } from 'rxjs';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ElementRef, IterableDiffers, Optional, ViewEncapsulation, Injector, SkipSelf, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { _VIEW_REPEATER_STRATEGY } from '@angular/cdk/collections';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { CDK_TABLE_TEMPLATE, CdkTable, CDK_TABLE, _COALESCED_STYLE_SCHEDULER, _CoalescedStyleScheduler, STICKY_POSITIONING_LISTENER, StickyStyler, } from '@angular/cdk/table';
import { Directionality } from '@angular/cdk/bidi';
import { unrx } from '@pebula/ngrid/core';
import { PBL_NGRID_COMPONENT } from '../../tokens';
import { EXT_API_TOKEN } from '../../ext/grid-ext-api';
import { PblNgridCachedRowViewRepeaterStrategy } from './ngrid-cached-row-view-repeater-strategy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/cdk/platform";
import * as i3 from "@angular/cdk/scrolling";
import * as i4 from "@angular/cdk/table";
/**
 * Wrapper for the CdkTable that extends it's functionality to support various table features.
 * This wrapper also applies Material Design table styles (i.e. `MatTable` styles).
 *
 * Most of the extensions are done using mixins, this is mostly for clarity and separation of the features added.
 * This approach will allow easy removal when a feature is no longer required/implemented natively.
 */
export class PblCdkTableComponent extends CdkTable {
    constructor(_differs, _changeDetectorRef, _elementRef, role, _dir, injector, grid, extApi, _document, platform, _viewRepeater, _coalescedStyleScheduler, _viewportRuler, _stickyPositioningListener) {
        super(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, platform, _viewRepeater, _coalescedStyleScheduler, _viewportRuler, _stickyPositioningListener);
        this.injector = injector;
        this.grid = grid;
        this.extApi = extApi;
        this.platform = platform;
        this._minWidth = null;
        this.pblStickyColumnStylesNeedReset = false;
        //#endregion CSS-CLASS-CONTROL
        //#region CLEAR-ROW-DEFS
        // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
        this._cachedRowDefs = { header: new Set(), footer: new Set() }; //tslint:disable-line
        this.cdRef = _changeDetectorRef;
        extApi.setCdkTable(this);
        this.trackBy = this.grid.trackBy;
    }
    get _element() { return this._elementRef.nativeElement; }
    get beforeRenderRows() {
        if (!this.beforeRenderRows$) {
            this.beforeRenderRows$ = new Subject();
        }
        return this.beforeRenderRows$.asObservable();
    }
    get onRenderRows() {
        if (!this.onRenderRows$) {
            this.onRenderRows$ = new Subject();
        }
        return this.onRenderRows$.asObservable();
    }
    get minWidth() { return this._minWidth; }
    set minWidth(value) {
        this._minWidth = value || null;
        this._element.style.minWidth = value ? value + 'px' : null;
    }
    ngOnInit() {
        // We implement our own sticky styler because we don't have access to the one at CdkTable (private)
        // We need it because our CdkRowDef classes does not expose columns, it's always an empty array
        // This is to prevent CdkTable from rendering cells, we do that.
        // This is why the styler will not work on columns, cause internall in CdkTable it sees nothing.
        this.pblStickyStyler = new StickyStyler(this._isNativeHtmlTable, this.stickyCssClass, this._dir?.value || 'ltr', this._coalescedStyleScheduler, this.platform.isBrowser, this.needsPositionStickyOnElement, this._stickyPositioningListener);
        // This will also run from CdkTable and `updateStickyColumnStyles()` is invoked multiple times
        // but we don't care, we have a window
        (this._dir?.change ?? observableOf())
            .pipe(unrx(this))
            .subscribe(value => {
            this.pblStickyStyler.direction = value;
            this.pblStickyColumnStylesNeedReset = true;
            this.updateStickyColumnStyles();
        });
        // It's imperative we register to dir changes before super.ngOnInit because it register there as well
        // and it will come first and make sticky state pending, cancelling our pblStickyStyler.
        super.ngOnInit();
    }
    updateStickyColumnStyles() {
        if (this._isStickyPending) {
            return;
        }
        this._isStickyPending = true;
        Promise.resolve()
            .then(() => {
            this._isStickyPending = false;
            this._updateStickyColumnStyles();
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        unrx.kill(this);
        if (this.onRenderRows$) {
            this.onRenderRows$.complete();
        }
    }
    //#region CSS-CLASS-CONTROL
    addClass(cssClassName) {
        this._element.classList.add(cssClassName);
    }
    removeClass(cssClassName) {
        this._element.classList.remove(cssClassName);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    addHeaderRowDef(headerRowDef) {
        super.addHeaderRowDef(headerRowDef);
        this._cachedRowDefs.header.add(headerRowDef);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    clearHeaderRowDefs() {
        const { header } = this._cachedRowDefs;
        for (const rowDef of Array.from(header.values())) {
            this.removeHeaderRowDef(rowDef);
        }
        header.clear();
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    addFooterRowDef(footerRowDef) {
        super.addFooterRowDef(footerRowDef);
        this._cachedRowDefs.footer.add(footerRowDef);
    }
    // TODO: remove if https://github.com/angular/material2/pull/13000 is pushed
    clearFooterRowDefs() {
        const { footer } = this._cachedRowDefs;
        for (const rowDef of Array.from(footer.values())) {
            this.removeFooterRowDef(rowDef);
        }
        footer.clear();
    }
    //#endregion CLEAR-ROW-DEFS
    /**
     * An alias for `_cacheRowDefs()`
     */
    updateRowDefCache() {
        this._cacheRowDefs();
    }
    renderRows() {
        if (this.beforeRenderRows$) {
            this.beforeRenderRows$.next();
        }
        super.renderRows();
        if (this.onRenderRows$) {
            this.onRenderRows$.next(this._rowOutlet);
        }
    }
    pblForceRenderDataRows() {
        try {
            this._forceRenderDataRows();
        }
        catch (ex) {
            this.multiTemplateDataRows = this.multiTemplateDataRows;
        }
    }
    _updateStickyColumnStyles() {
        // We let the parent do the work on rows, it will see 0 columns so then we act.
        super.updateStickyColumnStyles();
        const stickyStartStates = this.extApi.columnApi.visibleColumns.map(c => c.columnDef?.sticky ?? false);
        const stickyEndStates = this.extApi.columnApi.visibleColumns.map(c => c.columnDef?.stickyEnd ?? false);
        const headerRow = this.extApi.rowsApi.findColumnRow('header');
        const footerRow = this.extApi.rowsApi.findColumnRow('footer');
        const rows = this.extApi.rowsApi.dataRows().map(r => r.element);
        if (headerRow) {
            rows.unshift(headerRow.element);
        }
        if (footerRow) {
            rows.push(footerRow.element);
        }
        // internal reset, coming from Dir change
        // It will probably get added to CDK ask well, remove when addedd
        if (this.pblStickyColumnStylesNeedReset) {
            this.pblStickyStyler.clearStickyPositioning(rows, ['left', 'right']);
            this.pblStickyColumnStylesNeedReset = false;
        }
        this.pblStickyStyler.updateStickyColumns(rows, stickyStartStates, stickyEndStates, true);
        // Reset the dirty state of the sticky input change since it has been used.
        this.extApi.columnApi.columns.forEach(c => c.columnDef?.resetStickyChanged());
    }
}
/** @nocollapse */ PblCdkTableComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkTableComponent, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: 'role', attribute: true }, { token: i1.Directionality, optional: true }, { token: i0.Injector }, { token: PBL_NGRID_COMPONENT }, { token: EXT_API_TOKEN }, { token: DOCUMENT }, { token: i2.Platform }, { token: _VIEW_REPEATER_STRATEGY }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i3.ViewportRuler }, { token: STICKY_POSITIONING_LISTENER, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblCdkTableComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkTableComponent, selector: "pbl-cdk-table", host: { classAttribute: "pbl-cdk-table" }, providers: [
        { provide: CDK_TABLE, useExisting: PblCdkTableComponent },
        { provide: _VIEW_REPEATER_STRATEGY, useClass: PblNgridCachedRowViewRepeaterStrategy },
        { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
        // Prevent nested tables from seeing this table's StickyPositioningListener.
        { provide: STICKY_POSITIONING_LISTENER, useValue: null },
    ], exportAs: ["pblCdkTable"], usesInheritance: true, ngImport: i0, template: "\n  <ng-content select=\"caption\"></ng-content>\n  <ng-content select=\"colgroup, col\"></ng-content>\n  <ng-container headerRowOutlet></ng-container>\n  <ng-container rowOutlet></ng-container>\n  <ng-container noDataRowOutlet></ng-container>\n  <ng-container footerRowOutlet></ng-container>\n", isInline: true, dependencies: [{ kind: "directive", type: i4.DataRowOutlet, selector: "[rowOutlet]" }, { kind: "directive", type: i4.HeaderRowOutlet, selector: "[headerRowOutlet]" }, { kind: "directive", type: i4.FooterRowOutlet, selector: "[footerRowOutlet]" }, { kind: "directive", type: i4.NoDataRowOutlet, selector: "[noDataRowOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkTableComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-cdk-table',
                    exportAs: 'pblCdkTable',
                    template: CDK_TABLE_TEMPLATE,
                    host: {
                        'class': 'pbl-cdk-table',
                    },
                    providers: [
                        { provide: CDK_TABLE, useExisting: PblCdkTableComponent },
                        { provide: _VIEW_REPEATER_STRATEGY, useClass: PblNgridCachedRowViewRepeaterStrategy },
                        { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
                        // Prevent nested tables from seeing this table's StickyPositioningListener.
                        { provide: STICKY_POSITIONING_LISTENER, useValue: null },
                    ],
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['role']
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.Injector }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.Platform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_VIEW_REPEATER_STRATEGY]
                }] }, { type: i4._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [STICKY_POSITIONING_LISTENER]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGJsLWNkay10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9wYmwtY2RrLXRhYmxlL3BibC1jZGstdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxPQUFPLEVBQUUsRUFBRSxJQUFJLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQztBQUNoRSxPQUFPLEVBQ0wsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULE1BQU0sRUFDTixVQUFVLEVBQ1YsZUFBZSxFQUVmLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsUUFBUSxFQUNSLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBK0MsdUJBQXVCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoSCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixRQUFRLEVBS1IsU0FBUyxFQUNULDBCQUEwQixFQUMxQix3QkFBd0IsRUFFeEIsMkJBQTJCLEVBRTNCLFlBQVksR0FDYixNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxFQUFFLG1CQUFtQixFQUFzQixNQUFNLGNBQWMsQ0FBQztBQUN2RSxPQUFPLEVBQUUsYUFBYSxFQUFnQyxNQUFNLHdCQUF3QixDQUFDO0FBR3JGLE9BQU8sRUFBRSxxQ0FBcUMsRUFBRSxNQUFNLDJDQUEyQyxDQUFDOzs7Ozs7QUFFbEc7Ozs7OztHQU1HO0FBa0JILE1BQU0sT0FBTyxvQkFBd0IsU0FBUSxRQUFXO0lBaUN0RCxZQUFZLFFBQXlCLEVBQ3pCLGtCQUFxQyxFQUNyQyxXQUFvQyxFQUNqQixJQUFZLEVBQ25CLElBQW9CLEVBQ3RCLFFBQWtCLEVBQ1csSUFBMkIsRUFDakMsTUFBdUMsRUFDdEQsU0FBYyxFQUN0QixRQUFrQixFQUNLLGFBQTRELEVBQ3pELHdCQUFrRCxFQUN0RixjQUE2QixFQUNnQywwQkFBc0Q7UUFDN0gsS0FBSyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQVRuSixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQ1csU0FBSSxHQUFKLElBQUksQ0FBdUI7UUFDakMsV0FBTSxHQUFOLE1BQU0sQ0FBaUM7UUFFOUQsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQWhCaEMsY0FBUyxHQUFrQixJQUFJLENBQUM7UUFLaEMsbUNBQThCLEdBQUcsS0FBSyxDQUFDO1FBZ0YvQyw4QkFBOEI7UUFFOUIsd0JBQXdCO1FBRXhCLDRFQUE0RTtRQUNwRSxtQkFBYyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksR0FBRyxFQUFtQixFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBbUIsRUFBRSxDQUFDLENBQUMscUJBQXFCO1FBbkV4SCxJQUFJLENBQUMsS0FBSyxHQUFHLGtCQUFrQixDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNuQyxDQUFDO0lBbERELElBQUksUUFBUSxLQUFrQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUV0RSxJQUFJLGdCQUFnQjtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1NBQzlDO1FBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7U0FDbkQ7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQUksUUFBUSxLQUFvQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3hELElBQUksUUFBUSxDQUFDLEtBQW9CO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQWdDRCxRQUFRO1FBQ04sbUdBQW1HO1FBQ25HLCtGQUErRjtRQUMvRixnRUFBZ0U7UUFDaEUsZ0dBQWdHO1FBQ2hHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUN2QixJQUFJLENBQUMsY0FBYyxFQUNuQixJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssSUFBSSxLQUFLLEVBQ3pCLElBQUksQ0FBQyx3QkFBd0IsRUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQ3ZCLElBQUksQ0FBQyw0QkFBNEIsRUFDakMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFekUsOEZBQThGO1FBQzlGLHNDQUFzQztRQUN0QyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksRUFBYSxDQUFDO2FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QyxJQUFJLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDO1lBQzNDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUwscUdBQXFHO1FBQ3JHLHdGQUF3RjtRQUN4RixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELHdCQUF3QjtRQUN0QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN6QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUU7YUFDZCxJQUFJLENBQUUsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUM5QixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFFBQVEsQ0FBQyxZQUFvQjtRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFvQjtRQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQVFELDRFQUE0RTtJQUM1RSxlQUFlLENBQUMsWUFBNkI7UUFDM0MsS0FBSyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELDRFQUE0RTtJQUM1RSxrQkFBa0I7UUFDaEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDdkMsS0FBSyxNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBQ2hELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQztRQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLGVBQWUsQ0FBQyxZQUE2QjtRQUMzQyxLQUFLLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLGtCQUFrQjtRQUNoQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN2QyxLQUFLLE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFDaEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDRCwyQkFBMkI7SUFFM0I7O09BRUc7SUFDSCxpQkFBaUI7UUFDZCxJQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDL0I7UUFDRCxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUMxQztJQUNILENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsSUFBRztZQUNBLElBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQ3RDO1FBQUMsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1NBQ3pEO0lBQ0gsQ0FBQztJQUVPLHlCQUF5QjtRQUMvQiwrRUFBK0U7UUFDL0UsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFFakMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFFLENBQUM7UUFDeEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxJQUFJLEtBQUssQ0FBRSxDQUFDO1FBQ3pHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakM7UUFDRCxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlCO1FBRUQseUNBQXlDO1FBQ3pDLGlFQUFpRTtRQUNqRSxJQUFJLElBQUksQ0FBQyw4QkFBOEIsRUFBRTtZQUN2QyxJQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxLQUFLLENBQUM7U0FDN0M7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekYsMkVBQTJFO1FBQzNFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDOztvSUF6TVUsb0JBQW9CLDRHQW9DUixNQUFNLG9HQUdULG1CQUFtQixhQUNuQixhQUFhLGFBQ2IsUUFBUSxxQ0FFUix1QkFBdUIsYUFDdkIsMEJBQTBCLDBDQUVGLDJCQUEyQjt3SEE5QzVELG9CQUFvQixtRkFWcEI7UUFDVCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFDO1FBQ3ZELEVBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxxQ0FBcUMsRUFBQztRQUNuRixFQUFDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUM7UUFDekUsNEVBQTRFO1FBQzVFLEVBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7S0FDdkQ7MkZBSVUsb0JBQW9CO2tCQWpCaEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsZUFBZTtxQkFDekI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLHNCQUFzQixFQUFDO3dCQUN2RCxFQUFDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUscUNBQXFDLEVBQUM7d0JBQ25GLEVBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFFLFFBQVEsRUFBRSx3QkFBd0IsRUFBQzt3QkFDekUsNEVBQTRFO3dCQUM1RSxFQUFDLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO3FCQUN2RDtvQkFDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtvQkFDckMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2hEOzswQkFxQ2MsU0FBUzsyQkFBQyxNQUFNOzswQkFDaEIsUUFBUTs7MEJBRVIsTUFBTTsyQkFBQyxtQkFBbUI7OzBCQUMxQixNQUFNOzJCQUFDLGFBQWE7OzBCQUNwQixNQUFNOzJCQUFDLFFBQVE7OzBCQUVmLE1BQU07MkJBQUMsdUJBQXVCOzswQkFDOUIsTUFBTTsyQkFBQywwQkFBMEI7OzBCQUVqQyxRQUFROzswQkFBSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLDJCQUEyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIG9mIGFzIG9ic2VydmFibGVPZiwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEluamVjdCxcbiAgRWxlbWVudFJlZixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgSW5qZWN0b3IsXG4gIFNraXBTZWxmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IFBsYXRmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7IF9EaXNwb3NlVmlld1JlcGVhdGVyU3RyYXRlZ3ksIF9WaWV3UmVwZWF0ZXIsIF9WSUVXX1JFUEVBVEVSX1NUUkFURUdZIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFZpZXdwb3J0UnVsZXIgfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7XG4gIENES19UQUJMRV9URU1QTEFURSxcbiAgQ2RrVGFibGUsXG4gIERhdGFSb3dPdXRsZXQsXG4gIENka0hlYWRlclJvd0RlZixcbiAgQ2RrRm9vdGVyUm93RGVmLFxuICBSb3dDb250ZXh0LFxuICBDREtfVEFCTEUsXG4gIF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSLFxuICBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsXG4gIFJlbmRlclJvdyxcbiAgU1RJQ0tZX1BPU0lUSU9OSU5HX0xJU1RFTkVSLFxuICBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICBTdGlja3lTdHlsZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQgeyBEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuXG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBCTF9OR1JJRF9DT01QT05FTlQsIF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBFWFRfQVBJX1RPS0VOLCBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5cbmltcG9ydCB7IFBibE5ncmlkRGlzcG9zZWRSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneSB9IGZyb20gJy4vbmdyaWQtZGlzcG9zZWQtcm93LXZpZXctcmVwZWF0ZXItc3RyYXRlZ3knO1xuaW1wb3J0IHsgUGJsTmdyaWRDYWNoZWRSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneSB9IGZyb20gJy4vbmdyaWQtY2FjaGVkLXJvdy12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5JztcblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVGFibGUgdGhhdCBleHRlbmRzIGl0J3MgZnVuY3Rpb25hbGl0eSB0byBzdXBwb3J0IHZhcmlvdXMgdGFibGUgZmVhdHVyZXMuXG4gKiBUaGlzIHdyYXBwZXIgYWxzbyBhcHBsaWVzIE1hdGVyaWFsIERlc2lnbiB0YWJsZSBzdHlsZXMgKGkuZS4gYE1hdFRhYmxlYCBzdHlsZXMpLlxuICpcbiAqIE1vc3Qgb2YgdGhlIGV4dGVuc2lvbnMgYXJlIGRvbmUgdXNpbmcgbWl4aW5zLCB0aGlzIGlzIG1vc3RseSBmb3IgY2xhcml0eSBhbmQgc2VwYXJhdGlvbiBvZiB0aGUgZmVhdHVyZXMgYWRkZWQuXG4gKiBUaGlzIGFwcHJvYWNoIHdpbGwgYWxsb3cgZWFzeSByZW1vdmFsIHdoZW4gYSBmZWF0dXJlIGlzIG5vIGxvbmdlciByZXF1aXJlZC9pbXBsZW1lbnRlZCBuYXRpdmVseS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLWNkay10YWJsZScsXG4gIGV4cG9ydEFzOiAncGJsQ2RrVGFibGUnLFxuICB0ZW1wbGF0ZTogQ0RLX1RBQkxFX1RFTVBMQVRFLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IG5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICAnY2xhc3MnOiAncGJsLWNkay10YWJsZScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDREtfVEFCTEUsIHVzZUV4aXN0aW5nOiBQYmxDZGtUYWJsZUNvbXBvbmVudH0sXG4gICAge3Byb3ZpZGU6IF9WSUVXX1JFUEVBVEVSX1NUUkFURUdZLCB1c2VDbGFzczogUGJsTmdyaWRDYWNoZWRSb3dWaWV3UmVwZWF0ZXJTdHJhdGVneX0sXG4gICAge3Byb3ZpZGU6IF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSLCB1c2VDbGFzczogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyfSxcbiAgICAvLyBQcmV2ZW50IG5lc3RlZCB0YWJsZXMgZnJvbSBzZWVpbmcgdGhpcyB0YWJsZSdzIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIuXG4gICAge3Byb3ZpZGU6IFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUiwgdXNlVmFsdWU6IG51bGx9LFxuICBdLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgUGJsQ2RrVGFibGVDb21wb25lbnQ8VD4gZXh0ZW5kcyBDZGtUYWJsZTxUPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG5cbiAgZ2V0IF9lbGVtZW50KCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDsgfVxuXG4gIGdldCBiZWZvcmVSZW5kZXJSb3dzKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGlmICghdGhpcy5iZWZvcmVSZW5kZXJSb3dzJCkge1xuICAgICAgdGhpcy5iZWZvcmVSZW5kZXJSb3dzJCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJlZm9yZVJlbmRlclJvd3MkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZ2V0IG9uUmVuZGVyUm93cygpOiBPYnNlcnZhYmxlPERhdGFSb3dPdXRsZXQ+IHtcbiAgICBpZiAoIXRoaXMub25SZW5kZXJSb3dzJCkge1xuICAgICAgdGhpcy5vblJlbmRlclJvd3MkID0gbmV3IFN1YmplY3Q8RGF0YVJvd091dGxldD4oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub25SZW5kZXJSb3dzJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGdldCBtaW5XaWR0aCgpOiBudW1iZXIgfCBudWxsIHsgcmV0dXJuIHRoaXMuX21pbldpZHRoOyB9XG4gIHNldCBtaW5XaWR0aCh2YWx1ZTogbnVtYmVyIHwgbnVsbCkge1xuICAgIHRoaXMuX21pbldpZHRoID0gdmFsdWUgfHwgbnVsbDtcbiAgICB0aGlzLl9lbGVtZW50LnN0eWxlLm1pbldpZHRoID0gdmFsdWUgPyB2YWx1ZSArICdweCcgOiBudWxsO1xuICB9XG5cbiAgcmVhZG9ubHkgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIHByaXZhdGUgX21pbldpZHRoOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBiZWZvcmVSZW5kZXJSb3dzJDogU3ViamVjdDx2b2lkPjtcbiAgcHJpdmF0ZSBvblJlbmRlclJvd3MkOiBTdWJqZWN0PERhdGFSb3dPdXRsZXQ+O1xuICBwcml2YXRlIF9pc1N0aWNreVBlbmRpbmc6IGJvb2xlYW47XG4gIHByaXZhdGUgcGJsU3RpY2t5U3R5bGVyOiBTdGlja3lTdHlsZXI7XG4gIHByaXZhdGUgcGJsU3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICAgICAgICAgICAgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBAQXR0cmlidXRlKCdyb2xlJykgcm9sZTogc3RyaW5nLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBfZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgQEluamVjdChQQkxfTkdSSURfQ09NUE9ORU5UKSBwcm90ZWN0ZWQgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PFQ+LFxuICAgICAgICAgICAgICBASW5qZWN0KEVYVF9BUElfVE9LRU4pIHByb3RlY3RlZCBleHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGk8VD4sXG4gICAgICAgICAgICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgICAgICAgICAgICBASW5qZWN0KF9WSUVXX1JFUEVBVEVSX1NUUkFURUdZKSBfdmlld1JlcGVhdGVyOiBfVmlld1JlcGVhdGVyPFQsIFJlbmRlclJvdzxUPiwgUm93Q29udGV4dDxUPj4sXG4gICAgICAgICAgICAgIEBJbmplY3QoX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIpIF9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxuICAgICAgICAgICAgICBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgQEluamVjdChTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIpIF9zdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyPzogU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcikge1xuICAgIHN1cGVyKF9kaWZmZXJzLCBfY2hhbmdlRGV0ZWN0b3JSZWYsIF9lbGVtZW50UmVmLCByb2xlLCBfZGlyLCBfZG9jdW1lbnQsIHBsYXRmb3JtLCBfdmlld1JlcGVhdGVyLCBfY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsIF92aWV3cG9ydFJ1bGVyLCBfc3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmNkUmVmID0gX2NoYW5nZURldGVjdG9yUmVmO1xuICAgIGV4dEFwaS5zZXRDZGtUYWJsZSh0aGlzKTtcbiAgICB0aGlzLnRyYWNrQnkgPSB0aGlzLmdyaWQudHJhY2tCeTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIFdlIGltcGxlbWVudCBvdXIgb3duIHN0aWNreSBzdHlsZXIgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGFjY2VzcyB0byB0aGUgb25lIGF0IENka1RhYmxlIChwcml2YXRlKVxuICAgIC8vIFdlIG5lZWQgaXQgYmVjYXVzZSBvdXIgQ2RrUm93RGVmIGNsYXNzZXMgZG9lcyBub3QgZXhwb3NlIGNvbHVtbnMsIGl0J3MgYWx3YXlzIGFuIGVtcHR5IGFycmF5XG4gICAgLy8gVGhpcyBpcyB0byBwcmV2ZW50IENka1RhYmxlIGZyb20gcmVuZGVyaW5nIGNlbGxzLCB3ZSBkbyB0aGF0LlxuICAgIC8vIFRoaXMgaXMgd2h5IHRoZSBzdHlsZXIgd2lsbCBub3Qgd29yayBvbiBjb2x1bW5zLCBjYXVzZSBpbnRlcm5hbGwgaW4gQ2RrVGFibGUgaXQgc2VlcyBub3RoaW5nLlxuICAgIHRoaXMucGJsU3RpY2t5U3R5bGVyID0gbmV3IFN0aWNreVN0eWxlcih0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGlja3lDc3NDbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxhdGZvcm0uaXNCcm93c2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5lZWRzUG9zaXRpb25TdGlja3lPbkVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIpO1xuXG4gICAgLy8gVGhpcyB3aWxsIGFsc28gcnVuIGZyb20gQ2RrVGFibGUgYW5kIGB1cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKWAgaXMgaW52b2tlZCBtdWx0aXBsZSB0aW1lc1xuICAgIC8vIGJ1dCB3ZSBkb24ndCBjYXJlLCB3ZSBoYXZlIGEgd2luZG93XG4gICAgKHRoaXMuX2Rpcj8uY2hhbmdlID8/IG9ic2VydmFibGVPZjxEaXJlY3Rpb24+KCkpXG4gICAgICAucGlwZSh1bnJ4KHRoaXMpKVxuICAgICAgLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMucGJsU3RpY2t5U3R5bGVyLmRpcmVjdGlvbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLnBibFN0aWNreUNvbHVtblN0eWxlc05lZWRSZXNldCA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgICB9KTtcblxuICAgIC8vIEl0J3MgaW1wZXJhdGl2ZSB3ZSByZWdpc3RlciB0byBkaXIgY2hhbmdlcyBiZWZvcmUgc3VwZXIubmdPbkluaXQgYmVjYXVzZSBpdCByZWdpc3RlciB0aGVyZSBhcyB3ZWxsXG4gICAgLy8gYW5kIGl0IHdpbGwgY29tZSBmaXJzdCBhbmQgbWFrZSBzdGlja3kgc3RhdGUgcGVuZGluZywgY2FuY2VsbGluZyBvdXIgcGJsU3RpY2t5U3R5bGVyLlxuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuICB1cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKSB7XG4gICAgaWYgKHRoaXMuX2lzU3RpY2t5UGVuZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzU3RpY2t5UGVuZGluZyA9IHRydWU7XG4gICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2lzU3RpY2t5UGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl91cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB1bnJ4LmtpbGwodGhpcyk7XG4gICAgaWYgKHRoaXMub25SZW5kZXJSb3dzJCkge1xuICAgICAgdGhpcy5vblJlbmRlclJvd3MkLmNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLy8jcmVnaW9uIENTUy1DTEFTUy1DT05UUk9MXG4gIGFkZENsYXNzKGNzc0NsYXNzTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNzc0NsYXNzTmFtZSk7XG4gIH1cblxuICByZW1vdmVDbGFzcyhjc3NDbGFzc05hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzc05hbWUpO1xuICB9XG4gIC8vI2VuZHJlZ2lvbiBDU1MtQ0xBU1MtQ09OVFJPTFxuXG4gIC8vI3JlZ2lvbiBDTEVBUi1ST1ctREVGU1xuXG4gIC8vIFRPRE86IHJlbW92ZSBpZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDIvcHVsbC8xMzAwMCBpcyBwdXNoZWRcbiAgcHJpdmF0ZSBfY2FjaGVkUm93RGVmcyA9IHsgaGVhZGVyOiBuZXcgU2V0PENka0hlYWRlclJvd0RlZj4oKSwgZm9vdGVyOiBuZXcgU2V0PENka0Zvb3RlclJvd0RlZj4oKSB9OyAvL3RzbGludDpkaXNhYmxlLWxpbmVcblxuICAvLyBUT0RPOiByZW1vdmUgaWYgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyL3B1bGwvMTMwMDAgaXMgcHVzaGVkXG4gIGFkZEhlYWRlclJvd0RlZihoZWFkZXJSb3dEZWY6IENka0hlYWRlclJvd0RlZik6IHZvaWQge1xuICAgIHN1cGVyLmFkZEhlYWRlclJvd0RlZihoZWFkZXJSb3dEZWYpO1xuICAgIHRoaXMuX2NhY2hlZFJvd0RlZnMuaGVhZGVyLmFkZChoZWFkZXJSb3dEZWYpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVtb3ZlIGlmIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMi9wdWxsLzEzMDAwIGlzIHB1c2hlZFxuICBjbGVhckhlYWRlclJvd0RlZnMoKTogdm9pZCB7XG4gICAgY29uc3QgeyBoZWFkZXIgfSA9IHRoaXMuX2NhY2hlZFJvd0RlZnM7XG4gICAgZm9yIChjb25zdCByb3dEZWYgb2YgQXJyYXkuZnJvbShoZWFkZXIudmFsdWVzKCkpKSB7XG4gICAgICB0aGlzLnJlbW92ZUhlYWRlclJvd0RlZihyb3dEZWYpO1xuICAgIH1cbiAgICBoZWFkZXIuY2xlYXIoKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbW92ZSBpZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDIvcHVsbC8xMzAwMCBpcyBwdXNoZWRcbiAgYWRkRm9vdGVyUm93RGVmKGZvb3RlclJvd0RlZjogQ2RrRm9vdGVyUm93RGVmKTogdm9pZCB7XG4gICAgc3VwZXIuYWRkRm9vdGVyUm93RGVmKGZvb3RlclJvd0RlZik7XG4gICAgdGhpcy5fY2FjaGVkUm93RGVmcy5mb290ZXIuYWRkKGZvb3RlclJvd0RlZik7XG4gIH1cblxuICAvLyBUT0RPOiByZW1vdmUgaWYgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyL3B1bGwvMTMwMDAgaXMgcHVzaGVkXG4gIGNsZWFyRm9vdGVyUm93RGVmcygpOiB2b2lkIHtcbiAgICBjb25zdCB7IGZvb3RlciB9ID0gdGhpcy5fY2FjaGVkUm93RGVmcztcbiAgICBmb3IgKGNvbnN0IHJvd0RlZiBvZiBBcnJheS5mcm9tKGZvb3Rlci52YWx1ZXMoKSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlRm9vdGVyUm93RGVmKHJvd0RlZik7XG4gICAgfVxuICAgIGZvb3Rlci5jbGVhcigpO1xuICB9XG4gIC8vI2VuZHJlZ2lvbiBDTEVBUi1ST1ctREVGU1xuXG4gIC8qKlxuICAgKiBBbiBhbGlhcyBmb3IgYF9jYWNoZVJvd0RlZnMoKWBcbiAgICovXG4gIHVwZGF0ZVJvd0RlZkNhY2hlKCk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuX2NhY2hlUm93RGVmcygpO1xuICB9XG5cbiAgcmVuZGVyUm93cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5iZWZvcmVSZW5kZXJSb3dzJCkge1xuICAgICAgdGhpcy5iZWZvcmVSZW5kZXJSb3dzJC5uZXh0KCk7XG4gICAgfVxuICAgIHN1cGVyLnJlbmRlclJvd3MoKTtcbiAgICBpZiAodGhpcy5vblJlbmRlclJvd3MkKSB7XG4gICAgICB0aGlzLm9uUmVuZGVyUm93cyQubmV4dCh0aGlzLl9yb3dPdXRsZXQpO1xuICAgIH1cbiAgfVxuXG4gIHBibEZvcmNlUmVuZGVyRGF0YVJvd3MoKTogdm9pZCB7XG4gICAgdHJ5e1xuICAgICAgKHRoaXMgYXMgYW55KS5fZm9yY2VSZW5kZXJEYXRhUm93cygpO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICB0aGlzLm11bHRpVGVtcGxhdGVEYXRhUm93cyA9IHRoaXMubXVsdGlUZW1wbGF0ZURhdGFSb3dzO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpIHtcbiAgICAvLyBXZSBsZXQgdGhlIHBhcmVudCBkbyB0aGUgd29yayBvbiByb3dzLCBpdCB3aWxsIHNlZSAwIGNvbHVtbnMgc28gdGhlbiB3ZSBhY3QuXG4gICAgc3VwZXIudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG5cbiAgICBjb25zdCBzdGlja3lTdGFydFN0YXRlcyA9IHRoaXMuZXh0QXBpLmNvbHVtbkFwaS52aXNpYmxlQ29sdW1ucy5tYXAoIGMgPT4gYy5jb2x1bW5EZWY/LnN0aWNreSA/PyBmYWxzZSApO1xuICAgIGNvbnN0IHN0aWNreUVuZFN0YXRlcyA9IHRoaXMuZXh0QXBpLmNvbHVtbkFwaS52aXNpYmxlQ29sdW1ucy5tYXAoIGMgPT4gYy5jb2x1bW5EZWY/LnN0aWNreUVuZCA/PyBmYWxzZSApO1xuICAgIGNvbnN0IGhlYWRlclJvdyA9IHRoaXMuZXh0QXBpLnJvd3NBcGkuZmluZENvbHVtblJvdygnaGVhZGVyJyk7XG4gICAgY29uc3QgZm9vdGVyUm93ID0gdGhpcy5leHRBcGkucm93c0FwaS5maW5kQ29sdW1uUm93KCdmb290ZXInKTtcbiAgICBjb25zdCByb3dzID0gdGhpcy5leHRBcGkucm93c0FwaS5kYXRhUm93cygpLm1hcChyID0+IHIuZWxlbWVudCk7XG4gICAgaWYgKGhlYWRlclJvdykge1xuICAgICAgcm93cy51bnNoaWZ0KGhlYWRlclJvdy5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGZvb3RlclJvdykge1xuICAgICAgcm93cy5wdXNoKGZvb3RlclJvdy5lbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBpbnRlcm5hbCByZXNldCwgY29taW5nIGZyb20gRGlyIGNoYW5nZVxuICAgIC8vIEl0IHdpbGwgcHJvYmFibHkgZ2V0IGFkZGVkIHRvIENESyBhc2sgd2VsbCwgcmVtb3ZlIHdoZW4gYWRkZWRkXG4gICAgaWYgKHRoaXMucGJsU3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0KSB7XG4gICAgICB0aGlzLnBibFN0aWNreVN0eWxlci5jbGVhclN0aWNreVBvc2l0aW9uaW5nKHJvd3MsIFsnbGVmdCcsICdyaWdodCddKTtcbiAgICAgIHRoaXMucGJsU3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5wYmxTdGlja3lTdHlsZXIudXBkYXRlU3RpY2t5Q29sdW1ucyhyb3dzLCBzdGlja3lTdGFydFN0YXRlcywgc3RpY2t5RW5kU3RhdGVzLCB0cnVlKTtcblxuICAgIC8vIFJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSBvZiB0aGUgc3RpY2t5IGlucHV0IGNoYW5nZSBzaW5jZSBpdCBoYXMgYmVlbiB1c2VkLlxuICAgIHRoaXMuZXh0QXBpLmNvbHVtbkFwaS5jb2x1bW5zLmZvckVhY2goYyA9PiBjLmNvbHVtbkRlZj8ucmVzZXRTdGlja3lDaGFuZ2VkKCkpO1xuICB9XG5cbn1cbiJdfQ==