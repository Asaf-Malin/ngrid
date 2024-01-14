import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { OverlayModule } from '@angular/cdk/overlay';
import { PblNgridOverlayPanelFactory } from './overlay-panel.service';
import { PblNgridOverlayPanelDef } from './overlay-panel-def';
import * as i0 from "@angular/core";
export class PblNgridOverlayPanelModule {
}
/** @nocollapse */ PblNgridOverlayPanelModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridOverlayPanelModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, declarations: [PblNgridOverlayPanelDef], imports: [CommonModule,
        OverlayModule,
        BidiModule], exports: [PblNgridOverlayPanelDef] });
/** @nocollapse */ PblNgridOverlayPanelModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, providers: [
        PblNgridOverlayPanelFactory,
    ], imports: [CommonModule,
        OverlayModule,
        BidiModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        OverlayModule,
                        BidiModule,
                    ],
                    declarations: [
                        PblNgridOverlayPanelDef,
                    ],
                    exports: [
                        PblNgridOverlayPanelDef,
                    ],
                    providers: [
                        PblNgridOverlayPanelFactory,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1wYW5lbC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL292ZXJsYXktcGFuZWwvc3JjL2xpYi9vdmVybGF5LXBhbmVsLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXJELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDOztBQWtCOUQsTUFBTSxPQUFPLDBCQUEwQjs7MElBQTFCLDBCQUEwQjsySUFBMUIsMEJBQTBCLGlCQVRuQyx1QkFBdUIsYUFMdkIsWUFBWTtRQUNaLGFBQWE7UUFDYixVQUFVLGFBTVYsdUJBQXVCOzJJQU1kLDBCQUEwQixhQUoxQjtRQUNULDJCQUEyQjtLQUM1QixZQVpDLFlBQVk7UUFDWixhQUFhO1FBQ2IsVUFBVTsyRkFZRCwwQkFBMEI7a0JBaEJ0QyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLGFBQWE7d0JBQ2IsVUFBVTtxQkFDWDtvQkFDRCxZQUFZLEVBQUU7d0JBQ1osdUJBQXVCO3FCQUN4QjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AsdUJBQXVCO3FCQUN4QjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsMkJBQTJCO3FCQUM1QjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQmlkaU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IE92ZXJsYXlNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5cbmltcG9ydCB7IFBibE5ncmlkT3ZlcmxheVBhbmVsRmFjdG9yeSB9IGZyb20gJy4vb3ZlcmxheS1wYW5lbC5zZXJ2aWNlJztcbmltcG9ydCB7IFBibE5ncmlkT3ZlcmxheVBhbmVsRGVmIH0gZnJvbSAnLi9vdmVybGF5LXBhbmVsLWRlZic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBCaWRpTW9kdWxlLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBQYmxOZ3JpZE92ZXJsYXlQYW5lbERlZixcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBibE5ncmlkT3ZlcmxheVBhbmVsRGVmLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBQYmxOZ3JpZE92ZXJsYXlQYW5lbEZhY3RvcnksXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkT3ZlcmxheVBhbmVsTW9kdWxlIHtcblxufVxuIl19