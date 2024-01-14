import { Inject, InjectionToken, Injector, Optional, NgModule, NgModuleRef, Self, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule as ScrollingModuleExp } from '@angular/cdk-experimental/scrolling';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { PEB_NGRID_CONFIG, PblNgridConfigService } from '@asafmalin/ngrid/core';
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
import { PblCdkTableComponent } from './grid/pbl-cdk-table/pbl-cdk-table.component';
import { PblNgridRowDef, PblNgridRowOverride } from './grid/row/row-def.directive';
import { PblNgridRowComponent } from './grid/row/row.component';
import { PblNgridColumnRowComponent } from './grid/row/columns-row.component';
import { PblNgridMetaRowComponent } from './grid/row/meta-row.component';
import { PblNgridMetaRowContainerComponent } from './grid/meta-rows/meta-row-container';
import { PblNgridColumnDef } from './grid/column/directives/column-def';
import { PblNgridHeaderCellDefDirective } from './grid/cell/cell-def/header-cell-def.directive';
import { PblNgridFooterCellDefDirective } from './grid/cell/cell-def/footer-cell-def.directive';
import { PblNgridCellDefDirective } from './grid/cell/cell-def/cell-def.directive';
import { PblNgridEditorCellDefDirective } from './grid/cell/cell-def/edit-cell-def.directive';
import { PblNgridHeaderCellComponent } from './grid/cell/header-cell.component';
import { PblNgridCellComponent } from './grid/cell/cell.component';
import { PblNgridFooterCellComponent } from './grid/cell/footer-cell.component';
import { PblNgridMetaCellComponent } from './grid/cell/meta-cell.component';
import { PblNgridCellEditAutoFocusDirective } from './grid/cell/cell-edit-auto-focus.directive';
import { PblNgridCellStyling } from './grid/cell/cell-styling.directive';
import { PblNgridOuterSectionDirective } from './grid/directives/directives';
import { PblNgridHeaderExtensionRefDirective } from './grid/registry/directives/data-header-extensions';
import { PblNgridNoDataRefDirective } from './grid/registry/directives/no-data-ref.directive';
import { PblNgridPaginatorRefDirective } from './grid/registry/directives/paginator-ref.directive';
import { PblNgridHideColumns } from './grid/features/hide-columns.directive';
import { PblCdkVirtualScrollViewportComponent } from './grid/features/virtual-scroll/virtual-scroll-viewport.component';
import { PblCdkVirtualScrollDirective } from './grid/features/virtual-scroll/strategies/v-scroll.directive';
// TODO: Move to an independent package in v4
import { PblCdkAutoSizeVirtualScrollDirective } from './grid/features/virtual-scroll/strategies/cdk-wrappers/v-scroll-auto.directive';
import { PblCdkFixedSizedVirtualScrollDirective } from './grid/features/virtual-scroll/strategies/cdk-wrappers/v-scroll-fixed.directive';
import { PblNgridScrolling } from './grid/features/virtual-scroll/scrolling-plugin.directive';
import { PblNgridComponent } from './grid/ngrid.component';
import { PROVIDERS } from './di-factories';
import * as i0 from "@angular/core";
import * as i1 from "./grid/registry/registry.service";
export const COMMON_TABLE_TEMPLATE_INIT = new InjectionToken('COMMON TABLE TEMPLATE INIT');
export function provideCommon(components) {
    return [
        { provide: COMMON_TABLE_TEMPLATE_INIT, multi: true, useValue: components },
    ];
}
export class PblNgridModule {
    constructor(ngRef, registry, components) {
        if (components) {
            for (const multi of components) {
                for (const c of multi) {
                    if (c.root) {
                        registry = registry.getRoot();
                    }
                    PblNgridModule.loadCommonTemplates(ngRef, c.component, { registry, destroy: true });
                }
            }
        }
    }
    static forRoot(config, components) {
        return {
            ngModule: PblNgridModule,
            providers: [
                { provide: PEB_NGRID_CONFIG, useValue: config },
                PblNgridConfigService,
                provideCommon(components),
            ]
        };
    }
    static withCommon(components) {
        return {
            ngModule: PblNgridModule,
            providers: provideCommon(components),
        };
    }
    static loadCommonTemplates(ngRef, component, options) {
        let injector = ngRef.injector;
        const { registry, destroy } = options || {};
        if (registry) {
            injector = Injector.create({
                providers: [{ provide: PblNgridRegistryService, useValue: registry }],
                parent: ngRef.injector
            });
        }
        const cmpRef = ngRef.componentFactoryResolver.resolveComponentFactory(component).create(injector);
        cmpRef.changeDetectorRef.detectChanges();
        if (destroy) {
            ngRef.onDestroy(() => {
                try {
                    cmpRef.destroy();
                }
                catch (err) { }
            });
        }
        return cmpRef;
    }
}
/** @nocollapse */ PblNgridModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, deps: [{ token: i0.NgModuleRef }, { token: i1.PblNgridRegistryService }, { token: COMMON_TABLE_TEMPLATE_INIT, optional: true, self: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, declarations: [PblNgridMetaRowContainerComponent,
        PblCdkTableComponent,
        PblNgridColumnDef,
        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
        PblNgridCellStyling,
        PblNgridOuterSectionDirective,
        PblNgridHeaderExtensionRefDirective,
        PblNgridNoDataRefDirective,
        PblNgridPaginatorRefDirective,
        PblNgridHeaderCellDefDirective,
        PblNgridFooterCellDefDirective,
        PblNgridCellDefDirective, PblNgridEditorCellDefDirective,
        PblNgridHeaderCellComponent,
        PblNgridCellComponent,
        PblNgridFooterCellComponent,
        PblNgridMetaCellComponent,
        PblNgridHideColumns,
        PblCdkVirtualScrollViewportComponent, PblNgridScrolling,
        PblCdkVirtualScrollDirective,
        // TODO: Move to an independent package in v4
        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
        PblNgridCellEditAutoFocusDirective,
        PblNgridComponent], imports: [CommonModule,
        ScrollingModule, ScrollingModuleExp,
        CdkTableModule], exports: [PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
        PblNgridCellStyling,
        PblNgridOuterSectionDirective,
        PblNgridHeaderExtensionRefDirective,
        PblNgridNoDataRefDirective,
        PblNgridPaginatorRefDirective,
        PblNgridHeaderCellDefDirective,
        PblNgridFooterCellDefDirective,
        PblNgridCellDefDirective, PblNgridEditorCellDefDirective, PblNgridScrolling,
        PblNgridHeaderCellComponent,
        PblNgridCellComponent,
        PblNgridFooterCellComponent,
        PblNgridMetaCellComponent,
        PblNgridHideColumns,
        PblCdkVirtualScrollDirective,
        // TODO: Move to an independent package in v4
        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
        PblNgridCellEditAutoFocusDirective,
        PblNgridComponent] });
/** @nocollapse */ PblNgridModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, providers: [
        ...PROVIDERS,
    ], imports: [CommonModule,
        ScrollingModule, ScrollingModuleExp,
        CdkTableModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        ScrollingModule, ScrollingModuleExp,
                        CdkTableModule,
                    ],
                    declarations: [
                        PblNgridMetaRowContainerComponent,
                        PblCdkTableComponent,
                        PblNgridColumnDef,
                        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
                        PblNgridCellStyling,
                        PblNgridOuterSectionDirective,
                        PblNgridHeaderExtensionRefDirective,
                        PblNgridNoDataRefDirective,
                        PblNgridPaginatorRefDirective,
                        PblNgridHeaderCellDefDirective,
                        PblNgridFooterCellDefDirective,
                        PblNgridCellDefDirective, PblNgridEditorCellDefDirective,
                        PblNgridHeaderCellComponent,
                        PblNgridCellComponent,
                        PblNgridFooterCellComponent,
                        PblNgridMetaCellComponent,
                        PblNgridHideColumns,
                        PblCdkVirtualScrollViewportComponent, PblNgridScrolling,
                        PblCdkVirtualScrollDirective,
                        // TODO: Move to an independent package in v4
                        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
                        PblNgridCellEditAutoFocusDirective,
                        PblNgridComponent,
                    ],
                    providers: [
                        ...PROVIDERS,
                    ],
                    exports: [
                        PblNgridRowDef, PblNgridRowOverride, PblNgridRowComponent, PblNgridColumnRowComponent, PblNgridMetaRowComponent,
                        PblNgridCellStyling,
                        PblNgridOuterSectionDirective,
                        PblNgridHeaderExtensionRefDirective,
                        PblNgridNoDataRefDirective,
                        PblNgridPaginatorRefDirective,
                        PblNgridHeaderCellDefDirective,
                        PblNgridFooterCellDefDirective,
                        PblNgridCellDefDirective, PblNgridEditorCellDefDirective, PblNgridScrolling,
                        PblNgridHeaderCellComponent,
                        PblNgridCellComponent,
                        PblNgridFooterCellComponent,
                        PblNgridMetaCellComponent,
                        PblNgridHideColumns,
                        PblCdkVirtualScrollDirective,
                        // TODO: Move to an independent package in v4
                        PblCdkAutoSizeVirtualScrollDirective, PblCdkFixedSizedVirtualScrollDirective,
                        PblNgridCellEditAutoFocusDirective,
                        PblNgridComponent,
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.NgModuleRef }, { type: i1.PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [COMMON_TABLE_TEMPLATE_INIT]
                }, {
                    type: Optional
                }, {
                    type: Self
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyaWQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL25ncmlkLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBRVIsUUFBUSxFQUNSLFFBQVEsRUFDUixXQUFXLEVBRVgsSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsZUFBZSxJQUFJLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDNUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQWtCLHFCQUFxQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHN0Y7Ozs7Ozs7O0dBUUc7QUFDSCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTyw4Q0FBOEMsQ0FBQztBQUNyRixPQUFPLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDbkYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDekUsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDeEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDeEUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1B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b0IsRUFBRSwwQkFBMEIsRUFBRSx3QkFBd0I7d0JBQy9HLG1CQUFtQjt3QkFDbkIsNkJBQTZCO3dCQUM3QixtQ0FBbUM7d0JBQ25DLDBCQUEwQjt3QkFDMUIsNkJBQTZCO3dCQUM3Qiw4QkFBOEI7d0JBQzlCLDhCQUE4Qjt3QkFDOUIsd0JBQXdCLEVBQUUsOEJBQThCO3dCQUN4RCwyQkFBMkI7d0JBQzNCLHFCQUFxQjt3QkFDckIsMkJBQTJCO3dCQUMzQix5QkFBeUI7d0JBQ3pCLG1CQUFtQjt3QkFDbkIsb0NBQW9DLEVBQUUsaUJBQWlCO3dCQUN2RCw0QkFBNEI7d0JBQzVCLDZDQUE2Qzt3QkFDN0Msb0NBQW9DLEVBQUUsc0NBQXNDO3dCQUM1RSxrQ0FBa0M7d0JBQ2xDLGlCQUFpQjtxQkFDcEI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLEdBQUcsU0FBUztxQkFDZjtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsY0FBYyxFQUFFLG1CQUFtQixFQUFFLG9CQUFvQixFQUFFLDBCQUEwQixFQUFFLHdCQUF3Qjt3QkFDL0csbUJBQW1CO3dCQUNuQiw2QkFBNkI7d0JBQzdCLG1DQUFtQzt3QkFDbkMsMEJBQTBCO3dCQUMxQiw2QkFBNkI7d0JBQzdCLDhCQUE4Qjt3QkFDOUIsOEJBQThCO3dCQUM5Qix3QkFBd0IsRUFBRSw4QkFBOEIsRUFBRSxpQkFBaUI7d0JBQzNFLDJCQUEyQjt3QkFDM0IscUJBQXFCO3dCQUNyQiwyQkFBMkI7d0JBQzNCLHlCQUF5Qjt3QkFDekIsbUJBQW1CO3dCQUNuQiw0QkFBNEI7d0JBQzVCLDZDQUE2Qzt3QkFDN0Msb0NBQW9DLEVBQUUsc0NBQXNDO3dCQUM1RSxrQ0FBa0M7d0JBQ2xDLGlCQUFpQjtxQkFDcEI7aUJBQ0o7OzBCQUtjLE1BQU07MkJBQUMsMEJBQTBCOzswQkFBRyxRQUFROzswQkFBSSxJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVmLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3RvcixcbiAgVHlwZSxcbiAgT3B0aW9uYWwsXG4gIE5nTW9kdWxlLFxuICBOZ01vZHVsZVJlZixcbiAgTW9kdWxlV2l0aFByb3ZpZGVycyxcbiAgU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBTY3JvbGxpbmdNb2R1bGUgYXMgU2Nyb2xsaW5nTW9kdWxlRXhwIH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9zY3JvbGxpbmcnO1xuaW1wb3J0IHsgU2Nyb2xsaW5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQgeyBDZGtUYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQgeyBQRUJfTkdSSURfQ09ORklHLCBQYmxOZ3JpZENvbmZpZywgUGJsTmdyaWRDb25maWdTZXJ2aWNlIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuXG4vKipcbiAqIE5PVEUgQUJPVVQgSU1QT1JUU1xuICpcbiAqIERPIE5PVCBJTVBPUlQgRlJPTSBCQVJSRUwgTU9EVUxFUyBPUiBBTlkgTU9EVUxFIFRIQVQgQUdHUkVHQVRFIEFORCBFWFBPUlQgU1lNQk9MU1xuICogVEhFIEFOR1VMQVIgTkdDIENPTVBJTEVSIERPRVMgTk9UIEhBTkRMRSBJVCBXRUxMIEFORCBUSEUgRVhQT1JURUQgQ09ERSBNSUdIVCBOT1QgV09SSyAoTUVUQURBVEEgSVNTVUUpXG4gKlxuICogVEhFIENJUkNVTEFSIFJVTlRJTUUgREVURUNUSU9OIERPRVMgTk9UIFdPUksgSU4gVEhJUyBDQVNFIEJFQ0FVU0UgVEhFUkUgSVMgTk8gQUNUVUFMIENJUkNVTEFSIFJFRkVSRU5DRVxuICogSVQgSEFQUEVOUyBCRUNBVVNFIE9GIFRIRSBXQVkgQU5HVUxBUiBSRS1CVUlMRFMgVEhFIEQuVFMgRklMRVMgQU5EIE1FVEFEQVRBIEZJTEVTXG4gKi9cbmltcG9ydCB7IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlIH0gZnJvbSAnLi9ncmlkL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsQ2RrVGFibGVDb21wb25lbnQgfSAgZnJvbSAnLi9ncmlkL3BibC1jZGstdGFibGUvcGJsLWNkay10YWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRSb3dEZWYsIFBibE5ncmlkUm93T3ZlcnJpZGUgfSBmcm9tICcuL2dyaWQvcm93L3Jvdy1kZWYuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibE5ncmlkUm93Q29tcG9uZW50IH0gZnJvbSAnLi9ncmlkL3Jvdy9yb3cuY29tcG9uZW50JztcbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uUm93Q29tcG9uZW50IH0gZnJvbSAnLi9ncmlkL3Jvdy9jb2x1bW5zLXJvdy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRNZXRhUm93Q29tcG9uZW50IH0gZnJvbSAnLi9ncmlkL3Jvdy9tZXRhLXJvdy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRNZXRhUm93Q29udGFpbmVyQ29tcG9uZW50IH0gZnJvbSAnLi9ncmlkL21ldGEtcm93cy9tZXRhLXJvdy1jb250YWluZXInO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EZWYgfSBmcm9tICcuL2dyaWQvY29sdW1uL2RpcmVjdGl2ZXMvY29sdW1uLWRlZic7XG5pbXBvcnQgeyBQYmxOZ3JpZEhlYWRlckNlbGxEZWZEaXJlY3RpdmUgfSBmcm9tICcuL2dyaWQvY2VsbC9jZWxsLWRlZi9oZWFkZXItY2VsbC1kZWYuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibE5ncmlkRm9vdGVyQ2VsbERlZkRpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZC9jZWxsL2NlbGwtZGVmL2Zvb3Rlci1jZWxsLWRlZi5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsRGVmRGlyZWN0aXZlIH0gZnJvbSAnLi9ncmlkL2NlbGwvY2VsbC1kZWYvY2VsbC1kZWYuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibE5ncmlkRWRpdG9yQ2VsbERlZkRpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZC9jZWxsL2NlbGwtZGVmL2VkaXQtY2VsbC1kZWYuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibE5ncmlkSGVhZGVyQ2VsbENvbXBvbmVudCB9IGZyb20gJy4vZ3JpZC9jZWxsL2hlYWRlci1jZWxsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxOZ3JpZENlbGxDb21wb25lbnQgfSBmcm9tICcuL2dyaWQvY2VsbC9jZWxsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxOZ3JpZEZvb3RlckNlbGxDb21wb25lbnQgfSBmcm9tICcuL2dyaWQvY2VsbC9mb290ZXItY2VsbC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRNZXRhQ2VsbENvbXBvbmVudCB9IGZyb20gJy4vZ3JpZC9jZWxsL21ldGEtY2VsbC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsRWRpdEF1dG9Gb2N1c0RpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZC9jZWxsL2NlbGwtZWRpdC1hdXRvLWZvY3VzLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENlbGxTdHlsaW5nIH0gZnJvbSAnLi9ncmlkL2NlbGwvY2VsbC1zdHlsaW5nLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZE91dGVyU2VjdGlvbkRpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZC9kaXJlY3RpdmVzL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHsgUGJsTmdyaWRIZWFkZXJFeHRlbnNpb25SZWZEaXJlY3RpdmUgfSBmcm9tICcuL2dyaWQvcmVnaXN0cnkvZGlyZWN0aXZlcy9kYXRhLWhlYWRlci1leHRlbnNpb25zJztcbmltcG9ydCB7IFBibE5ncmlkTm9EYXRhUmVmRGlyZWN0aXZlIH0gZnJvbSAnLi9ncmlkL3JlZ2lzdHJ5L2RpcmVjdGl2ZXMvbm8tZGF0YS1yZWYuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibE5ncmlkUGFnaW5hdG9yUmVmRGlyZWN0aXZlIH0gZnJvbSAnLi9ncmlkL3JlZ2lzdHJ5L2RpcmVjdGl2ZXMvcGFnaW5hdG9yLXJlZi5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRIaWRlQ29sdW1ucyB9IGZyb20gJy4vZ3JpZC9mZWF0dXJlcy9oaWRlLWNvbHVtbnMuZGlyZWN0aXZlJztcbmltcG9ydCB7IFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4vZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC92aXJ0dWFsLXNjcm9sbC12aWV3cG9ydC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsQ2RrVmlydHVhbFNjcm9sbERpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC9zdHJhdGVnaWVzL3Ytc2Nyb2xsLmRpcmVjdGl2ZSc7XG4vLyBUT0RPOiBNb3ZlIHRvIGFuIGluZGVwZW5kZW50IHBhY2thZ2UgaW4gdjRcbmltcG9ydCB7IFBibENka0F1dG9TaXplVmlydHVhbFNjcm9sbERpcmVjdGl2ZSB9ICBmcm9tICcuL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvc3RyYXRlZ2llcy9jZGstd3JhcHBlcnMvdi1zY3JvbGwtYXV0by5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGJsQ2RrRml4ZWRTaXplZFZpcnR1YWxTY3JvbGxEaXJlY3RpdmUgfSAgZnJvbSAnLi9ncmlkL2ZlYXR1cmVzL3ZpcnR1YWwtc2Nyb2xsL3N0cmF0ZWdpZXMvY2RrLXdyYXBwZXJzL3Ytc2Nyb2xsLWZpeGVkLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFNjcm9sbGluZyB9IGZyb20gJy4vZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC9zY3JvbGxpbmctcGx1Z2luLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4vZ3JpZC9uZ3JpZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUFJPVklERVJTIH0gZnJvbSAnLi9kaS1mYWN0b3JpZXMnO1xuXG5leHBvcnQgY29uc3QgQ09NTU9OX1RBQkxFX1RFTVBMQVRFX0lOSVQgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0NPTU1PTiBUQUJMRSBURU1QTEFURSBJTklUJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbW9uVGVtcGxhdGVJbml0IHtcbiAgY29tcG9uZW50OiBUeXBlPGFueT47XG4gIC8qKlxuICAgKiBXaGVuIHRydWUgd2lsbCB1c2UgdGhlIHJvb3QgcmVnaXN0cnkgc2VydmljZSAoZm9yIHRlbXBsYXRlcykuXG4gICAqIE90aGVyd2lzZSwgdXNlcyB0aGUgcHJvdmlkZWQgcmVnaXN0cnkgZnJvbSB0aGUgZGVwZW5kZW5jeSB0cmVlLlxuICAgKi9cbiAgcm9vdD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQ29tbW9uKGNvbXBvbmVudHM6IENvbW1vblRlbXBsYXRlSW5pdFtdKTogYW55IHtcbiAgcmV0dXJuIFtcbiAgICB7IHByb3ZpZGU6IENPTU1PTl9UQUJMRV9URU1QTEFURV9JTklULCBtdWx0aTogdHJ1ZSwgdXNlVmFsdWU6IGNvbXBvbmVudHMgfSxcbiAgXTtcbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgU2Nyb2xsaW5nTW9kdWxlLCBTY3JvbGxpbmdNb2R1bGVFeHAsXG4gICAgICAgIENka1RhYmxlTW9kdWxlLFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIFBibE5ncmlkTWV0YVJvd0NvbnRhaW5lckNvbXBvbmVudCxcbiAgICAgICAgUGJsQ2RrVGFibGVDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkQ29sdW1uRGVmLFxuICAgICAgICBQYmxOZ3JpZFJvd0RlZiwgUGJsTmdyaWRSb3dPdmVycmlkZSwgUGJsTmdyaWRSb3dDb21wb25lbnQsIFBibE5ncmlkQ29sdW1uUm93Q29tcG9uZW50LCBQYmxOZ3JpZE1ldGFSb3dDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkQ2VsbFN0eWxpbmcsXG4gICAgICAgIFBibE5ncmlkT3V0ZXJTZWN0aW9uRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZEhlYWRlckV4dGVuc2lvblJlZkRpcmVjdGl2ZSxcbiAgICAgICAgUGJsTmdyaWROb0RhdGFSZWZEaXJlY3RpdmUsXG4gICAgICAgIFBibE5ncmlkUGFnaW5hdG9yUmVmRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZEhlYWRlckNlbGxEZWZEaXJlY3RpdmUsXG4gICAgICAgIFBibE5ncmlkRm9vdGVyQ2VsbERlZkRpcmVjdGl2ZSxcbiAgICAgICAgUGJsTmdyaWRDZWxsRGVmRGlyZWN0aXZlLCBQYmxOZ3JpZEVkaXRvckNlbGxEZWZEaXJlY3RpdmUsXG4gICAgICAgIFBibE5ncmlkSGVhZGVyQ2VsbENvbXBvbmVudCxcbiAgICAgICAgUGJsTmdyaWRDZWxsQ29tcG9uZW50LFxuICAgICAgICBQYmxOZ3JpZEZvb3RlckNlbGxDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkTWV0YUNlbGxDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkSGlkZUNvbHVtbnMsXG4gICAgICAgIFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudCwgUGJsTmdyaWRTY3JvbGxpbmcsXG4gICAgICAgIFBibENka1ZpcnR1YWxTY3JvbGxEaXJlY3RpdmUsXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gYW4gaW5kZXBlbmRlbnQgcGFja2FnZSBpbiB2NFxuICAgICAgICBQYmxDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGxEaXJlY3RpdmUsIFBibENka0ZpeGVkU2l6ZWRWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZENlbGxFZGl0QXV0b0ZvY3VzRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZENvbXBvbmVudCxcbiAgICBdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICAuLi5QUk9WSURFUlMsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIFBibE5ncmlkUm93RGVmLCBQYmxOZ3JpZFJvd092ZXJyaWRlLCBQYmxOZ3JpZFJvd0NvbXBvbmVudCwgUGJsTmdyaWRDb2x1bW5Sb3dDb21wb25lbnQsIFBibE5ncmlkTWV0YVJvd0NvbXBvbmVudCxcbiAgICAgICAgUGJsTmdyaWRDZWxsU3R5bGluZyxcbiAgICAgICAgUGJsTmdyaWRPdXRlclNlY3Rpb25EaXJlY3RpdmUsXG4gICAgICAgIFBibE5ncmlkSGVhZGVyRXh0ZW5zaW9uUmVmRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZE5vRGF0YVJlZkRpcmVjdGl2ZSxcbiAgICAgICAgUGJsTmdyaWRQYWdpbmF0b3JSZWZEaXJlY3RpdmUsXG4gICAgICAgIFBibE5ncmlkSGVhZGVyQ2VsbERlZkRpcmVjdGl2ZSxcbiAgICAgICAgUGJsTmdyaWRGb290ZXJDZWxsRGVmRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZENlbGxEZWZEaXJlY3RpdmUsIFBibE5ncmlkRWRpdG9yQ2VsbERlZkRpcmVjdGl2ZSwgUGJsTmdyaWRTY3JvbGxpbmcsXG4gICAgICAgIFBibE5ncmlkSGVhZGVyQ2VsbENvbXBvbmVudCxcbiAgICAgICAgUGJsTmdyaWRDZWxsQ29tcG9uZW50LFxuICAgICAgICBQYmxOZ3JpZEZvb3RlckNlbGxDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkTWV0YUNlbGxDb21wb25lbnQsXG4gICAgICAgIFBibE5ncmlkSGlkZUNvbHVtbnMsXG4gICAgICAgIFBibENka1ZpcnR1YWxTY3JvbGxEaXJlY3RpdmUsXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gYW4gaW5kZXBlbmRlbnQgcGFja2FnZSBpbiB2NFxuICAgICAgICBQYmxDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGxEaXJlY3RpdmUsIFBibENka0ZpeGVkU2l6ZWRWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZENlbGxFZGl0QXV0b0ZvY3VzRGlyZWN0aXZlLFxuICAgICAgICBQYmxOZ3JpZENvbXBvbmVudCxcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkTW9kdWxlIHtcblxuICBjb25zdHJ1Y3RvcihuZ1JlZjogTmdNb2R1bGVSZWY8YW55PixcbiAgICAgICAgICAgICAgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLFxuICAgICAgICAgICAgICBASW5qZWN0KENPTU1PTl9UQUJMRV9URU1QTEFURV9JTklUKSBAT3B0aW9uYWwoKSBAU2VsZigpIGNvbXBvbmVudHM6IENvbW1vblRlbXBsYXRlSW5pdFtdW10pIHtcblxuICAgIGlmIChjb21wb25lbnRzKSB7XG4gICAgICBmb3IgKGNvbnN0IG11bHRpIG9mIGNvbXBvbmVudHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIG11bHRpKSB7XG4gICAgICAgICAgaWYgKGMucm9vdCkge1xuICAgICAgICAgICAgcmVnaXN0cnkgPSByZWdpc3RyeS5nZXRSb290KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFBibE5ncmlkTW9kdWxlLmxvYWRDb21tb25UZW1wbGF0ZXMobmdSZWYsIGMuY29tcG9uZW50LCB7IHJlZ2lzdHJ5LCBkZXN0cm95OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGZvclJvb3QoY29uZmlnOiBQYmxOZ3JpZENvbmZpZywgY29tcG9uZW50czogQ29tbW9uVGVtcGxhdGVJbml0W10pOiBNb2R1bGVXaXRoUHJvdmlkZXJzPFBibE5ncmlkTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBQYmxOZ3JpZE1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IFBFQl9OR1JJRF9DT05GSUcsIHVzZVZhbHVlOiBjb25maWcgfSxcbiAgICAgICAgUGJsTmdyaWRDb25maWdTZXJ2aWNlLFxuICAgICAgICBwcm92aWRlQ29tbW9uKGNvbXBvbmVudHMpLFxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgd2l0aENvbW1vbihjb21wb25lbnRzOiBDb21tb25UZW1wbGF0ZUluaXRbXSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8UGJsTmdyaWRNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFBibE5ncmlkTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlQ29tbW9uKGNvbXBvbmVudHMpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgbG9hZENvbW1vblRlbXBsYXRlczxUPihuZ1JlZjogTmdNb2R1bGVSZWY8YW55PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBUeXBlPFQ+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zPzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqIFdoZW4gc2V0IHdpbGwgdXNlIGl0IGFzIGZpcnN0IHJlZ2lzdHJ5IGluIHRoZSBESSB0cmVlICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeT86IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqIFdoZW4gc2V0IHdpbGwgZGVzdHJveSB0aGUgY29tcG9uZW50IHdoZW4gdGhlIG1vZHVsZSBpcyBkZXN0cm95ZWQuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0cm95PzogYm9vbGVhbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgbGV0IGluamVjdG9yOiBJbmplY3RvciA9IG5nUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IHsgcmVnaXN0cnksIGRlc3Ryb3kgfSA9IG9wdGlvbnMgfHwgKHt9IGFzIGFueSk7XG5cbiAgICBpZiAocmVnaXN0cnkpIHtcbiAgICAgIGluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgICAgcHJvdmlkZXJzOiBbIHsgcHJvdmlkZTogUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UsIHVzZVZhbHVlOiByZWdpc3RyeSB9IF0sXG4gICAgICAgIHBhcmVudDogbmdSZWYuaW5qZWN0b3JcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGNtcFJlZiA9IG5nUmVmLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeTxUPihjb21wb25lbnQpLmNyZWF0ZShpbmplY3Rvcik7XG4gICAgY21wUmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICBpZiAoZGVzdHJveSkge1xuICAgICAgbmdSZWYub25EZXN0cm95KCAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY21wUmVmLmRlc3Ryb3koKTtcbiAgICAgICAgfSBjYXRjaCggZXJyKSB7fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNtcFJlZjtcbiAgfVxufVxuIl19