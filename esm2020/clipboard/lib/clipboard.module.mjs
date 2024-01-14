import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PblNgridModule, PblNgridConfigService, PblNgridPluginController, ngridPlugin } from '@asafmalin/ngrid';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PLUGIN_KEY, PblNgridClipboardPlugin } from './clipboard.plugin';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export class PblNgridClipboardPluginModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridClipboardPluginModule, (grid, controller) => {
            const config = configService.get(PLUGIN_KEY, {});
            if (config.autoEnable === true) {
                controller.onInit()
                    .subscribe(() => {
                    if (!controller.hasPlugin(PLUGIN_KEY)) {
                        controller.createPlugin(PLUGIN_KEY);
                    }
                });
            }
        });
    }
}
PblNgridClipboardPluginModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create' }, PblNgridClipboardPlugin);
/** @nocollapse */ PblNgridClipboardPluginModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, deps: [{ token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridClipboardPluginModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, declarations: [PblNgridClipboardPlugin], imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridClipboardPlugin] });
/** @nocollapse */ PblNgridClipboardPluginModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridClipboardPluginModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [PblNgridClipboardPlugin],
                    exports: [PblNgridClipboardPlugin],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvY2xpcGJvYXJkL3NyYy9saWIvY2xpcGJvYXJkLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUV6RSxPQUFPLEVBQUUsVUFBVSxFQUFFLHVCQUF1QixFQUFFLE1BQU0sb0JBQW9CLENBQUM7OztBQU96RSxNQUFNLE9BQU8sNkJBQTZCO0lBSXhDLFlBQVksYUFBb0M7UUFDOUMsd0JBQXdCLENBQUMsYUFBYSxDQUNwQyw2QkFBNkIsRUFDN0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7WUFDbkIsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDOUIsVUFBVSxDQUFDLE1BQU0sRUFBRTtxQkFDaEIsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDckMsVUFBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDckM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNILENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQzs7QUFqQmUsMENBQVksR0FBRyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDOzZJQUZoRyw2QkFBNkI7OElBQTdCLDZCQUE2QixpQkFIeEIsdUJBQXVCLGFBRDVCLFlBQVksRUFBRSxjQUFjLEVBQUUsMEJBQTBCLGFBRXhELHVCQUF1Qjs4SUFFdkIsNkJBQTZCLFlBSjdCLFlBQVksRUFBRSxjQUFjLEVBQUUsMEJBQTBCOzJGQUl4RCw2QkFBNkI7a0JBTHpDLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsQ0FBRTtvQkFDckUsWUFBWSxFQUFFLENBQUUsdUJBQXVCLENBQUU7b0JBQ3pDLE9BQU8sRUFBRSxDQUFFLHVCQUF1QixDQUFFO2lCQUNyQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZE1vZHVsZSwgUGJsTmdyaWRDb25maWdTZXJ2aWNlLCBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIG5ncmlkUGx1Z2luIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxOZ3JpZFRhcmdldEV2ZW50c01vZHVsZSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvdGFyZ2V0LWV2ZW50cyc7XG5cbmltcG9ydCB7IFBMVUdJTl9LRVksIFBibE5ncmlkQ2xpcGJvYXJkUGx1Z2luIH0gZnJvbSAnLi9jbGlwYm9hcmQucGx1Z2luJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogWyBDb21tb25Nb2R1bGUsIFBibE5ncmlkTW9kdWxlLCBQYmxOZ3JpZFRhcmdldEV2ZW50c01vZHVsZSBdLFxuICBkZWNsYXJhdGlvbnM6IFsgUGJsTmdyaWRDbGlwYm9hcmRQbHVnaW4gXSxcbiAgZXhwb3J0czogWyBQYmxOZ3JpZENsaXBib2FyZFBsdWdpbiBdLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENsaXBib2FyZFBsdWdpbk1vZHVsZSB7XG5cbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVksIGZhY3Rvcnk6ICdjcmVhdGUnIH0sIFBibE5ncmlkQ2xpcGJvYXJkUGx1Z2luKTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWdTZXJ2aWNlOiBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UpIHtcbiAgICBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIub25DcmVhdGVkU2FmZShcbiAgICAgIFBibE5ncmlkQ2xpcGJvYXJkUGx1Z2luTW9kdWxlLFxuICAgICAgKGdyaWQsIGNvbnRyb2xsZXIpID0+IHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnU2VydmljZS5nZXQoUExVR0lOX0tFWSwge30pO1xuICAgICAgICBpZiAoY29uZmlnLmF1dG9FbmFibGUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb250cm9sbGVyLm9uSW5pdCgpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFjb250cm9sbGVyLmhhc1BsdWdpbihQTFVHSU5fS0VZKSkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuY3JlYXRlUGx1Z2luKFBMVUdJTl9LRVkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXX0=