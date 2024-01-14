import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PblNgridConfigService } from '@asafmalin/ngrid/core';
import { PblNgridModule, PblNgridPluginController, ngridPlugin } from '@asafmalin/ngrid';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PblNgridCellTooltipDirective, PLUGIN_KEY } from './cell-tooltip.directive';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid/core";
export class PblNgridCellTooltipModule {
    constructor(parentModule, configService) {
        if (parentModule) {
            return;
        }
        PblNgridPluginController.created
            .subscribe(event => {
            // Do not remove the explicit reference to `PblNgridCellTooltipDirective`
            // We use `PblNgridCellTooltipDirective.PLUGIN_KEY` to create a direct reference to `PblNgridCellTooltipDirective`
            // which will disable dead code elimination for the `PblNgridCellTooltipDirective` plugin.
            // If it is not set, using the plugin will only work when it is used in templates, other wise, if used programmatically (`autoSetAll`)
            // CLI prod builds will remove the plugin's code.
            const cellTooltipConfig = configService.get(PblNgridCellTooltipDirective.PLUGIN_KEY);
            if (cellTooltipConfig && cellTooltipConfig.autoSetAll === true) {
                const pluginCtrl = event.controller;
                pluginCtrl.onInit()
                    .subscribe(evt => pluginCtrl.ensurePlugin(PblNgridCellTooltipDirective.PLUGIN_KEY));
            }
        });
    }
}
PblNgridCellTooltipModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create' }, PblNgridCellTooltipDirective);
/** @nocollapse */ PblNgridCellTooltipModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, deps: [{ token: PblNgridCellTooltipModule, optional: true, skipSelf: true }, { token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridCellTooltipModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, declarations: [PblNgridCellTooltipDirective], imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridCellTooltipDirective, MatTooltipModule] });
/** @nocollapse */ PblNgridCellTooltipModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule, MatTooltipModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [PblNgridCellTooltipDirective],
                    exports: [PblNgridCellTooltipDirective, MatTooltipModule],
                }]
        }], ctorParameters: function () { return [{ type: PblNgridCellTooltipModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC10b29sdGlwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQtbWF0ZXJpYWwvY2VsbC10b29sdGlwL3NyYy9saWIvY2VsbC10b29sdGlwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUU3RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUV6RSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7OztBQU9wRixNQUFNLE9BQU8seUJBQXlCO0lBR3BDLFlBQW9DLFlBQXVDLEVBQy9ELGFBQW9DO1FBQzlDLElBQUksWUFBWSxFQUFFO1lBQ2hCLE9BQU87U0FDUjtRQUVELHdCQUF3QixDQUFDLE9BQU87YUFDN0IsU0FBUyxDQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ2xCLHlFQUF5RTtZQUN6RSxrSEFBa0g7WUFDbEgsMEZBQTBGO1lBQzFGLHNJQUFzSTtZQUN0SSxpREFBaUQ7WUFDakQsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JGLElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDOUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFDcEMsVUFBVSxDQUFDLE1BQU0sRUFBRTtxQkFDbEIsU0FBUyxDQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsQ0FBRSxDQUFDO2FBQ3ZGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOztBQXRCZSxzQ0FBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLDRCQUE0QixDQUFDLENBQUM7eUlBRHJHLHlCQUF5QjswSUFBekIseUJBQXlCLGlCQUhwQiw0QkFBNEIsYUFEakMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsMEJBQTBCLGFBRXpGLDRCQUE0QixFQUFFLGdCQUFnQjswSUFFOUMseUJBQXlCLFlBSnpCLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixFQUUzRCxnQkFBZ0I7MkZBRTlDLHlCQUF5QjtrQkFMckMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsQ0FBRTtvQkFDdEcsWUFBWSxFQUFFLENBQUUsNEJBQTRCLENBQUU7b0JBQzlDLE9BQU8sRUFBRSxDQUFFLDRCQUE0QixFQUFFLGdCQUFnQixDQUFFO2lCQUM1RDs7MEJBSWMsUUFBUTs7MEJBQUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBPcHRpb25hbCwgU2tpcFNlbGYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBPdmVybGF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgTWF0VG9vbHRpcE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2x0aXAnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRNb2R1bGUsIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciwgbmdyaWRQbHVnaW4gfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibE5ncmlkVGFyZ2V0RXZlbnRzTW9kdWxlIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC90YXJnZXQtZXZlbnRzJztcblxuaW1wb3J0IHsgUGJsTmdyaWRDZWxsVG9vbHRpcERpcmVjdGl2ZSwgUExVR0lOX0tFWSB9IGZyb20gJy4vY2VsbC10b29sdGlwLmRpcmVjdGl2ZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFsgQ29tbW9uTW9kdWxlLCBNYXRUb29sdGlwTW9kdWxlLCBPdmVybGF5TW9kdWxlLCBQYmxOZ3JpZE1vZHVsZSwgUGJsTmdyaWRUYXJnZXRFdmVudHNNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiBbIFBibE5ncmlkQ2VsbFRvb2x0aXBEaXJlY3RpdmUgXSxcbiAgZXhwb3J0czogWyBQYmxOZ3JpZENlbGxUb29sdGlwRGlyZWN0aXZlLCBNYXRUb29sdGlwTW9kdWxlIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ2VsbFRvb2x0aXBNb2R1bGUge1xuICBzdGF0aWMgcmVhZG9ubHkgTkdSSURfUExVR0lOID0gbmdyaWRQbHVnaW4oeyBpZDogUExVR0lOX0tFWSwgZmFjdG9yeTogJ2NyZWF0ZScgfSwgUGJsTmdyaWRDZWxsVG9vbHRpcERpcmVjdGl2ZSk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcGFyZW50TW9kdWxlOiBQYmxOZ3JpZENlbGxUb29sdGlwTW9kdWxlLFxuICAgICAgICAgICAgICBjb25maWdTZXJ2aWNlOiBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UpIHtcbiAgICBpZiAocGFyZW50TW9kdWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmNyZWF0ZWRcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgICAgLy8gRG8gbm90IHJlbW92ZSB0aGUgZXhwbGljaXQgcmVmZXJlbmNlIHRvIGBQYmxOZ3JpZENlbGxUb29sdGlwRGlyZWN0aXZlYFxuICAgICAgICAvLyBXZSB1c2UgYFBibE5ncmlkQ2VsbFRvb2x0aXBEaXJlY3RpdmUuUExVR0lOX0tFWWAgdG8gY3JlYXRlIGEgZGlyZWN0IHJlZmVyZW5jZSB0byBgUGJsTmdyaWRDZWxsVG9vbHRpcERpcmVjdGl2ZWBcbiAgICAgICAgLy8gd2hpY2ggd2lsbCBkaXNhYmxlIGRlYWQgY29kZSBlbGltaW5hdGlvbiBmb3IgdGhlIGBQYmxOZ3JpZENlbGxUb29sdGlwRGlyZWN0aXZlYCBwbHVnaW4uXG4gICAgICAgIC8vIElmIGl0IGlzIG5vdCBzZXQsIHVzaW5nIHRoZSBwbHVnaW4gd2lsbCBvbmx5IHdvcmsgd2hlbiBpdCBpcyB1c2VkIGluIHRlbXBsYXRlcywgb3RoZXIgd2lzZSwgaWYgdXNlZCBwcm9ncmFtbWF0aWNhbGx5IChgYXV0b1NldEFsbGApXG4gICAgICAgIC8vIENMSSBwcm9kIGJ1aWxkcyB3aWxsIHJlbW92ZSB0aGUgcGx1Z2luJ3MgY29kZS5cbiAgICAgICAgY29uc3QgY2VsbFRvb2x0aXBDb25maWcgPSBjb25maWdTZXJ2aWNlLmdldChQYmxOZ3JpZENlbGxUb29sdGlwRGlyZWN0aXZlLlBMVUdJTl9LRVkpO1xuICAgICAgICBpZiAoY2VsbFRvb2x0aXBDb25maWcgJiYgY2VsbFRvb2x0aXBDb25maWcuYXV0b1NldEFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHBsdWdpbkN0cmwgPSBldmVudC5jb250cm9sbGVyO1xuICAgICAgICAgIHBsdWdpbkN0cmwub25Jbml0KClcbiAgICAgICAgICAuc3Vic2NyaWJlKCBldnQgPT4gcGx1Z2luQ3RybC5lbnN1cmVQbHVnaW4oUGJsTmdyaWRDZWxsVG9vbHRpcERpcmVjdGl2ZS5QTFVHSU5fS0VZKSApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuIl19