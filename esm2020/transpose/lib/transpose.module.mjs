import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PblNgridModule, ngridPlugin } from '@asafmalin/ngrid';
import { PblNgridTransposePluginDirective, PLUGIN_KEY } from './transpose-plugin.directive';
import * as i0 from "@angular/core";
export class PblNgridTransposeModule {
}
PblNgridTransposeModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridTransposePluginDirective);
/** @nocollapse */ PblNgridTransposeModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridTransposeModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, declarations: [PblNgridTransposePluginDirective], imports: [CommonModule, PblNgridModule], exports: [PblNgridTransposePluginDirective] });
/** @nocollapse */ PblNgridTransposeModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, imports: [CommonModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTransposeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, PblNgridModule],
                    declarations: [PblNgridTransposePluginDirective],
                    exports: [PblNgridTransposePluginDirective],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNwb3NlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvdHJhbnNwb3NlL3NyYy9saWIvdHJhbnNwb3NlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7O0FBTzVGLE1BQU0sT0FBTyx1QkFBdUI7O0FBQ2xCLG9DQUFZLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7dUlBRHRGLHVCQUF1Qjt3SUFBdkIsdUJBQXVCLGlCQUhsQixnQ0FBZ0MsYUFEckMsWUFBWSxFQUFFLGNBQWMsYUFFNUIsZ0NBQWdDO3dJQUVoQyx1QkFBdUIsWUFKdkIsWUFBWSxFQUFFLGNBQWM7MkZBSTVCLHVCQUF1QjtrQkFMbkMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBRSxZQUFZLEVBQUUsY0FBYyxDQUFFO29CQUN6QyxZQUFZLEVBQUUsQ0FBRSxnQ0FBZ0MsQ0FBRTtvQkFDbEQsT0FBTyxFQUFFLENBQUUsZ0NBQWdDLENBQUU7aUJBQzlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IFBibE5ncmlkTW9kdWxlLCBuZ3JpZFBsdWdpbiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgUGJsTmdyaWRUcmFuc3Bvc2VQbHVnaW5EaXJlY3RpdmUsIFBMVUdJTl9LRVkgfSBmcm9tICcuL3RyYW5zcG9zZS1wbHVnaW4uZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogWyBDb21tb25Nb2R1bGUsIFBibE5ncmlkTW9kdWxlIF0sXG4gIGRlY2xhcmF0aW9uczogWyBQYmxOZ3JpZFRyYW5zcG9zZVBsdWdpbkRpcmVjdGl2ZSBdLFxuICBleHBvcnRzOiBbIFBibE5ncmlkVHJhbnNwb3NlUGx1Z2luRGlyZWN0aXZlIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkVHJhbnNwb3NlTW9kdWxlIHtcbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVkgfSwgUGJsTmdyaWRUcmFuc3Bvc2VQbHVnaW5EaXJlY3RpdmUpO1xufVxuIl19