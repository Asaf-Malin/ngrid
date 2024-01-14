import { Observable } from 'rxjs';
import { ChangeDetectorRef, ElementRef, IterableDiffers, OnDestroy, Injector } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { _ViewRepeater } from '@angular/cdk/collections';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { CdkTable, DataRowOutlet, CdkHeaderRowDef, CdkFooterRowDef, RowContext, _CoalescedStyleScheduler, RenderRow, StickyPositioningListener } from '@angular/cdk/table';
import { Directionality } from '@angular/cdk/bidi';
import { _PblNgridComponent } from '../../tokens';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import * as i0 from "@angular/core";
/**
 * Wrapper for the CdkTable that extends it's functionality to support various table features.
 * This wrapper also applies Material Design table styles (i.e. `MatTable` styles).
 *
 * Most of the extensions are done using mixins, this is mostly for clarity and separation of the features added.
 * This approach will allow easy removal when a feature is no longer required/implemented natively.
 */
export declare class PblCdkTableComponent<T> extends CdkTable<T> implements OnDestroy {
    protected injector: Injector;
    protected grid: _PblNgridComponent<T>;
    protected extApi: PblNgridInternalExtensionApi<T>;
    protected platform: Platform;
    get _element(): HTMLElement;
    get beforeRenderRows(): Observable<void>;
    get onRenderRows(): Observable<DataRowOutlet>;
    get minWidth(): number | null;
    set minWidth(value: number | null);
    readonly cdRef: ChangeDetectorRef;
    private _minWidth;
    private beforeRenderRows$;
    private onRenderRows$;
    private _isStickyPending;
    private pblStickyStyler;
    private pblStickyColumnStylesNeedReset;
    constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, role: string, _dir: Directionality, injector: Injector, grid: _PblNgridComponent<T>, extApi: PblNgridInternalExtensionApi<T>, _document: any, platform: Platform, _viewRepeater: _ViewRepeater<T, RenderRow<T>, RowContext<T>>, _coalescedStyleScheduler: _CoalescedStyleScheduler, _viewportRuler: ViewportRuler, _stickyPositioningListener?: StickyPositioningListener);
    ngOnInit(): void;
    updateStickyColumnStyles(): void;
    ngOnDestroy(): void;
    addClass(cssClassName: string): void;
    removeClass(cssClassName: string): void;
    private _cachedRowDefs;
    addHeaderRowDef(headerRowDef: CdkHeaderRowDef): void;
    clearHeaderRowDefs(): void;
    addFooterRowDef(footerRowDef: CdkFooterRowDef): void;
    clearFooterRowDefs(): void;
    /**
     * An alias for `_cacheRowDefs()`
     */
    updateRowDefCache(): void;
    renderRows(): void;
    pblForceRenderDataRows(): void;
    private _updateStickyColumnStyles;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblCdkTableComponent<any>, [null, null, null, { attribute: "role"; }, { optional: true; }, null, null, null, null, null, null, null, null, { optional: true; skipSelf: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblCdkTableComponent<any>, "pbl-cdk-table", ["pblCdkTable"], {}, {}, never, ["caption", "colgroup, col"], false>;
}
