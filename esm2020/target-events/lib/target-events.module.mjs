import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { PblNgridConfigService } from '@pebula/ngrid/core';
import { PblNgridModule, PblNgridPluginController, ngridPlugin } from '@pebula/ngrid';
import { PblNgridTargetEventsPlugin, PblNgridTargetEventsPluginDirective, PLUGIN_KEY, runOnce } from './target-events/target-events-plugin';
import { PblNgridCellEditDirective } from './target-events/cell-edit.directive';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid/core";
export class PblNgridTargetEventsModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridTargetEventsModule, (grid, controller) => {
            const targetEventsConfig = configService.get(PLUGIN_KEY);
            if (targetEventsConfig && targetEventsConfig.autoEnable === true) {
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
PblNgridTargetEventsModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create', runOnce }, PblNgridTargetEventsPlugin);
/** @nocollapse */ PblNgridTargetEventsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, deps: [{ token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridTargetEventsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, declarations: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective] });
/** @nocollapse */ PblNgridTargetEventsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridTargetEventsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective],
                    exports: [PblNgridTargetEventsPluginDirective, PblNgridCellEditDirective]
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWV2ZW50cy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3RhcmdldC1ldmVudHMvc3JjL2xpYi90YXJnZXQtZXZlbnRzLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLG1DQUFtQyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUM1SSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQzs7O0FBT2hGLE1BQU0sT0FBTywwQkFBMEI7SUFJckMsWUFBWSxhQUFvQztRQUM5Qyx3QkFBd0IsQ0FBQyxhQUFhLENBQ3BDLDBCQUEwQixFQUMxQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRTtZQUNuQixNQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUNoRSxVQUFVLENBQUMsTUFBTSxFQUFFO3FCQUNoQixTQUFTLENBQUMsR0FBRyxFQUFFO29CQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUNyQyxVQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUNyQztnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0gsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDOztBQWpCZSx1Q0FBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSwwQkFBMEIsQ0FBRSxDQUFDOzBJQUY3RywwQkFBMEI7MklBQTFCLDBCQUEwQixpQkFIckIsbUNBQW1DLEVBQUUseUJBQXlCLGFBRG5FLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxhQUU1QyxtQ0FBbUMsRUFBRSx5QkFBeUI7MklBRTlELDBCQUEwQixZQUoxQixZQUFZLEVBQUUsY0FBYyxFQUFFLGNBQWM7MkZBSTVDLDBCQUEwQjtrQkFMdEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBRTtvQkFDekQsWUFBWSxFQUFFLENBQUUsbUNBQW1DLEVBQUUseUJBQXlCLENBQUU7b0JBQ2hGLE9BQU8sRUFBRSxDQUFFLG1DQUFtQyxFQUFFLHlCQUF5QixDQUFHO2lCQUM3RSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQ2RrVGFibGVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb25maWdTZXJ2aWNlIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBibE5ncmlkTW9kdWxlLCBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIG5ncmlkUGx1Z2luIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbiwgUGJsTmdyaWRUYXJnZXRFdmVudHNQbHVnaW5EaXJlY3RpdmUsIFBMVUdJTl9LRVksIHJ1bk9uY2UgfSBmcm9tICcuL3RhcmdldC1ldmVudHMvdGFyZ2V0LWV2ZW50cy1wbHVnaW4nO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsRWRpdERpcmVjdGl2ZSB9IGZyb20gJy4vdGFyZ2V0LWV2ZW50cy9jZWxsLWVkaXQuZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogWyBDb21tb25Nb2R1bGUsIENka1RhYmxlTW9kdWxlLCBQYmxOZ3JpZE1vZHVsZSBdLFxuICBkZWNsYXJhdGlvbnM6IFsgUGJsTmdyaWRUYXJnZXRFdmVudHNQbHVnaW5EaXJlY3RpdmUsIFBibE5ncmlkQ2VsbEVkaXREaXJlY3RpdmUgXSxcbiAgZXhwb3J0czogWyBQYmxOZ3JpZFRhcmdldEV2ZW50c1BsdWdpbkRpcmVjdGl2ZSwgUGJsTmdyaWRDZWxsRWRpdERpcmVjdGl2ZSAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFRhcmdldEV2ZW50c01vZHVsZSB7XG5cbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVksIGZhY3Rvcnk6ICdjcmVhdGUnLCBydW5PbmNlIH0sIFBibE5ncmlkVGFyZ2V0RXZlbnRzUGx1Z2luICk7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnU2VydmljZTogUGJsTmdyaWRDb25maWdTZXJ2aWNlKSB7XG4gICAgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLm9uQ3JlYXRlZFNhZmUoXG4gICAgICBQYmxOZ3JpZFRhcmdldEV2ZW50c01vZHVsZSxcbiAgICAgIChncmlkLCBjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldEV2ZW50c0NvbmZpZyA9IGNvbmZpZ1NlcnZpY2UuZ2V0KFBMVUdJTl9LRVkpO1xuICAgICAgICBpZiAodGFyZ2V0RXZlbnRzQ29uZmlnICYmIHRhcmdldEV2ZW50c0NvbmZpZy5hdXRvRW5hYmxlID09PSB0cnVlKSB7XG4gICAgICAgICAgY29udHJvbGxlci5vbkluaXQoKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghY29udHJvbGxlci5oYXNQbHVnaW4oUExVR0lOX0tFWSkpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmNyZWF0ZVBsdWdpbihQTFVHSU5fS0VZKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuIl19