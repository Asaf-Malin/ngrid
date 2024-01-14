import { ComponentRef, InjectionToken, Type, NgModuleRef, ModuleWithProviders } from '@angular/core';
import { PblNgridConfig } from '@asafmalin/ngrid/core';
/**
 * NOTE ABOUT IMPORTS
 *
 * DO NOT IMPORT FROM BARREL MODULES OR ANY MODULE THAT AGGREGATE AND EXPORT SYMBOLS
 * THE ANGULAR NGC COMPILER DOES NOT HANDLE IT WELL AND THE EXPORTED CODE MIGHT NOT WORK (METADATA ISSUE)
 *
 * THE CIRCULAR RUNTIME DETECTION DOES NOT WORK IN THIS CASE BECAUSE THERE IS NO ACTUAL CIRCULAR REFERENCE
 * IT HAPPENS BECAUSE OF THE WAY ANGULAR RE-BUILDS THE D.TS FILES AND METADATA FILES
 */
import { PblNgridRegistryService } from './grid/registry/registry.service';
import * as i0 from "@angular/core";
import * as i1 from "./grid/meta-rows/meta-row-container";
import * as i2 from "./grid/pbl-cdk-table/pbl-cdk-table.component";
import * as i3 from "./grid/column/directives/column-def";
import * as i4 from "./grid/row/row-def.directive";
import * as i5 from "./grid/row/row.component";
import * as i6 from "./grid/row/columns-row.component";
import * as i7 from "./grid/row/meta-row.component";
import * as i8 from "./grid/cell/cell-styling.directive";
import * as i9 from "./grid/directives/directives";
import * as i10 from "./grid/registry/directives/data-header-extensions";
import * as i11 from "./grid/registry/directives/no-data-ref.directive";
import * as i12 from "./grid/registry/directives/paginator-ref.directive";
import * as i13 from "./grid/cell/cell-def/header-cell-def.directive";
import * as i14 from "./grid/cell/cell-def/footer-cell-def.directive";
import * as i15 from "./grid/cell/cell-def/cell-def.directive";
import * as i16 from "./grid/cell/cell-def/edit-cell-def.directive";
import * as i17 from "./grid/cell/header-cell.component";
import * as i18 from "./grid/cell/cell.component";
import * as i19 from "./grid/cell/footer-cell.component";
import * as i20 from "./grid/cell/meta-cell.component";
import * as i21 from "./grid/features/hide-columns.directive";
import * as i22 from "./grid/features/virtual-scroll/virtual-scroll-viewport.component";
import * as i23 from "./grid/features/virtual-scroll/scrolling-plugin.directive";
import * as i24 from "./grid/features/virtual-scroll/strategies/v-scroll.directive";
import * as i25 from "./grid/features/virtual-scroll/strategies/cdk-wrappers/v-scroll-auto.directive";
import * as i26 from "./grid/features/virtual-scroll/strategies/cdk-wrappers/v-scroll-fixed.directive";
import * as i27 from "./grid/cell/cell-edit-auto-focus.directive";
import * as i28 from "./grid/ngrid.component";
import * as i29 from "@angular/common";
import * as i30 from "@angular/cdk/scrolling";
import * as i31 from "@angular/cdk-experimental/scrolling";
import * as i32 from "@angular/cdk/table";
export declare const COMMON_TABLE_TEMPLATE_INIT: InjectionToken<unknown>;
export interface CommonTemplateInit {
    component: Type<any>;
    /**
     * When true will use the root registry service (for templates).
     * Otherwise, uses the provided registry from the dependency tree.
     */
    root?: boolean;
}
export declare function provideCommon(components: CommonTemplateInit[]): any;
export declare class PblNgridModule {
    constructor(ngRef: NgModuleRef<any>, registry: PblNgridRegistryService, components: CommonTemplateInit[][]);
    static forRoot(config: PblNgridConfig, components: CommonTemplateInit[]): ModuleWithProviders<PblNgridModule>;
    static withCommon(components: CommonTemplateInit[]): ModuleWithProviders<PblNgridModule>;
    static loadCommonTemplates<T>(ngRef: NgModuleRef<any>, component: Type<T>, options?: {
        /** When set will use it as first registry in the DI tree */
        registry?: PblNgridRegistryService;
        /** When set will destroy the component when the module is destroyed. */
        destroy?: boolean;
    }): ComponentRef<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridModule, [null, null, { optional: true; self: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridModule, [typeof i1.PblNgridMetaRowContainerComponent, typeof i2.PblCdkTableComponent, typeof i3.PblNgridColumnDef, typeof i4.PblNgridRowDef, typeof i4.PblNgridRowOverride, typeof i5.PblNgridRowComponent, typeof i6.PblNgridColumnRowComponent, typeof i7.PblNgridMetaRowComponent, typeof i8.PblNgridCellStyling, typeof i9.PblNgridOuterSectionDirective, typeof i10.PblNgridHeaderExtensionRefDirective, typeof i11.PblNgridNoDataRefDirective, typeof i12.PblNgridPaginatorRefDirective, typeof i13.PblNgridHeaderCellDefDirective, typeof i14.PblNgridFooterCellDefDirective, typeof i15.PblNgridCellDefDirective, typeof i16.PblNgridEditorCellDefDirective, typeof i17.PblNgridHeaderCellComponent, typeof i18.PblNgridCellComponent, typeof i19.PblNgridFooterCellComponent, typeof i20.PblNgridMetaCellComponent, typeof i21.PblNgridHideColumns, typeof i22.PblCdkVirtualScrollViewportComponent, typeof i23.PblNgridScrolling, typeof i24.PblCdkVirtualScrollDirective, typeof i25.PblCdkAutoSizeVirtualScrollDirective, typeof i26.PblCdkFixedSizedVirtualScrollDirective, typeof i27.PblNgridCellEditAutoFocusDirective, typeof i28.PblNgridComponent], [typeof i29.CommonModule, typeof i30.ScrollingModule, typeof i31.ScrollingModule, typeof i32.CdkTableModule], [typeof i4.PblNgridRowDef, typeof i4.PblNgridRowOverride, typeof i5.PblNgridRowComponent, typeof i6.PblNgridColumnRowComponent, typeof i7.PblNgridMetaRowComponent, typeof i8.PblNgridCellStyling, typeof i9.PblNgridOuterSectionDirective, typeof i10.PblNgridHeaderExtensionRefDirective, typeof i11.PblNgridNoDataRefDirective, typeof i12.PblNgridPaginatorRefDirective, typeof i13.PblNgridHeaderCellDefDirective, typeof i14.PblNgridFooterCellDefDirective, typeof i15.PblNgridCellDefDirective, typeof i16.PblNgridEditorCellDefDirective, typeof i23.PblNgridScrolling, typeof i17.PblNgridHeaderCellComponent, typeof i18.PblNgridCellComponent, typeof i19.PblNgridFooterCellComponent, typeof i20.PblNgridMetaCellComponent, typeof i21.PblNgridHideColumns, typeof i24.PblCdkVirtualScrollDirective, typeof i25.PblCdkAutoSizeVirtualScrollDirective, typeof i26.PblCdkFixedSizedVirtualScrollDirective, typeof i27.PblNgridCellEditAutoFocusDirective, typeof i28.PblNgridComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridModule>;
}
