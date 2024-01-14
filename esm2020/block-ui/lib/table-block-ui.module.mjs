import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { PblNgridModule, ngridPlugin } from '@pebula/ngrid';
import { PblNgridBlockUiDefDirective } from './block-ui/directives';
import { PblNgridBlockUiPluginDirective, PLUGIN_KEY } from './block-ui/block-ui-plugin';
import * as i0 from "@angular/core";
export class PblNgridBlockUiModule {
}
PblNgridBlockUiModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridBlockUiPluginDirective);
/** @nocollapse */ PblNgridBlockUiModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridBlockUiModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, declarations: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective] });
/** @nocollapse */ PblNgridBlockUiModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective],
                    exports: [PblNgridBlockUiDefDirective, PblNgridBlockUiPluginDirective]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtYmxvY2stdWkubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9ibG9jay11aS9zcmMvbGliL3RhYmxlLWJsb2NrLXVpLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLFVBQVUsRUFBRSxNQUFNLDRCQUE0QixDQUFDOztBQU94RixNQUFNLE9BQU8scUJBQXFCOztBQUNoQixrQ0FBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO3FJQURwRixxQkFBcUI7c0lBQXJCLHFCQUFxQixpQkFIaEIsMkJBQTJCLEVBQUUsOEJBQThCLGFBRGhFLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxhQUUzQywyQkFBMkIsRUFBRSw4QkFBOEI7c0lBRTVELHFCQUFxQixZQUpyQixZQUFZLEVBQUUsY0FBYyxFQUFFLGNBQWM7MkZBSTVDLHFCQUFxQjtrQkFMakMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBRTtvQkFDekQsWUFBWSxFQUFFLENBQUUsMkJBQTJCLEVBQUUsOEJBQThCLENBQUU7b0JBQzdFLE9BQU8sRUFBRSxDQUFHLDJCQUEyQixFQUFFLDhCQUE4QixDQUFHO2lCQUMzRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBDZGtUYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZE1vZHVsZSwgbmdyaWRQbHVnaW4gfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibE5ncmlkQmxvY2tVaURlZkRpcmVjdGl2ZSB9IGZyb20gJy4vYmxvY2stdWkvZGlyZWN0aXZlcyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJsb2NrVWlQbHVnaW5EaXJlY3RpdmUsIFBMVUdJTl9LRVkgfSBmcm9tICcuL2Jsb2NrLXVpL2Jsb2NrLXVpLXBsdWdpbic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFsgQ29tbW9uTW9kdWxlLCBDZGtUYWJsZU1vZHVsZSwgUGJsTmdyaWRNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiBbIFBibE5ncmlkQmxvY2tVaURlZkRpcmVjdGl2ZSwgUGJsTmdyaWRCbG9ja1VpUGx1Z2luRGlyZWN0aXZlIF0sXG4gIGV4cG9ydHM6IFsgIFBibE5ncmlkQmxvY2tVaURlZkRpcmVjdGl2ZSwgUGJsTmdyaWRCbG9ja1VpUGx1Z2luRGlyZWN0aXZlICBdXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQmxvY2tVaU1vZHVsZSB7XG4gIHN0YXRpYyByZWFkb25seSBOR1JJRF9QTFVHSU4gPSBuZ3JpZFBsdWdpbih7IGlkOiBQTFVHSU5fS0VZIH0sIFBibE5ncmlkQmxvY2tVaVBsdWdpbkRpcmVjdGl2ZSk7XG59XG4iXX0=