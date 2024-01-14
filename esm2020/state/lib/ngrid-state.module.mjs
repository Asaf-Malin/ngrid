import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PblNgridConfigService } from '@asafmalin/ngrid/core';
import { PblNgridPluginController, PblNgridModule, ngridPlugin } from '@asafmalin/ngrid';
import { registerBuiltInHandlers } from './core/built-in-handlers/_register';
import { PblNgridStatePlugin, PblNgridStatePluginDirective, PLUGIN_KEY } from './state-plugin';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid/core";
export class PblNgridStatePluginModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridStatePluginModule, (grid, controller) => {
            const targetEventsConfig = configService.get(PLUGIN_KEY);
            if (targetEventsConfig && targetEventsConfig.autoEnable === true) {
                controller.onInit()
                    .subscribe(() => {
                    if (!controller.hasPlugin(PLUGIN_KEY)) {
                        const instance = controller.createPlugin(PLUGIN_KEY);
                        if (targetEventsConfig.autoEnableOptions) {
                            instance.loadOptions = targetEventsConfig.autoEnableOptions.loadOptions;
                            instance.saveOptions = targetEventsConfig.autoEnableOptions.saveOptions;
                        }
                    }
                });
            }
        });
    }
}
PblNgridStatePluginModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create', runOnce: registerBuiltInHandlers }, PblNgridStatePlugin);
/** @nocollapse */ PblNgridStatePluginModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, deps: [{ token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridStatePluginModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, declarations: [PblNgridStatePluginDirective], imports: [CommonModule,
        PblNgridModule], exports: [PblNgridStatePluginDirective] });
/** @nocollapse */ PblNgridStatePluginModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, imports: [CommonModule,
        PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStatePluginModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        PblNgridModule,
                    ],
                    declarations: [
                        PblNgridStatePluginDirective,
                    ],
                    exports: [
                        PblNgridStatePluginDirective,
                    ],
                    providers: [],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyaWQtc3RhdGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zdGF0ZS9zcmMvbGliL25ncmlkLXN0YXRlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV0RixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsNEJBQTRCLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7OztBQWUvRixNQUFNLE9BQU8seUJBQXlCO0lBSXBDLFlBQVksYUFBb0M7UUFDOUMsd0JBQXdCLENBQUMsYUFBYSxDQUNwQyx5QkFBeUIsRUFDekIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7WUFDbkIsTUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDaEUsVUFBVSxDQUFDLE1BQU0sRUFBRTtxQkFDaEIsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDckMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDckQsSUFBSSxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRTs0QkFDeEMsUUFBUSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7NEJBQ3hFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDO3lCQUN6RTtxQkFDRjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0gsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDOztBQXJCZSxzQ0FBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO3lJQUY5SCx5QkFBeUI7MElBQXpCLHlCQUF5QixpQkFQbEMsNEJBQTRCLGFBSjVCLFlBQVk7UUFDWixjQUFjLGFBTWQsNEJBQTRCOzBJQUluQix5QkFBeUIsWUFYbEMsWUFBWTtRQUNaLGNBQWM7MkZBVUwseUJBQXlCO2tCQWJyQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLGNBQWM7cUJBQ2Y7b0JBQ0QsWUFBWSxFQUFFO3dCQUNaLDRCQUE0QjtxQkFDN0I7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLDRCQUE0QjtxQkFDN0I7b0JBQ0QsU0FBUyxFQUFFLEVBQUc7aUJBQ2YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IFBibE5ncmlkQ29uZmlnU2VydmljZSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIFBibE5ncmlkTW9kdWxlLCBuZ3JpZFBsdWdpbiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5pbXBvcnQgeyByZWdpc3RlckJ1aWx0SW5IYW5kbGVycyB9IGZyb20gJy4vY29yZS9idWlsdC1pbi1oYW5kbGVycy9fcmVnaXN0ZXInO1xuaW1wb3J0IHsgUGJsTmdyaWRTdGF0ZVBsdWdpbiwgUGJsTmdyaWRTdGF0ZVBsdWdpbkRpcmVjdGl2ZSwgUExVR0lOX0tFWSB9IGZyb20gJy4vc3RhdGUtcGx1Z2luJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBQYmxOZ3JpZE1vZHVsZSxcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgUGJsTmdyaWRTdGF0ZVBsdWdpbkRpcmVjdGl2ZSxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBibE5ncmlkU3RhdGVQbHVnaW5EaXJlY3RpdmUsXG4gIF0sXG4gIHByb3ZpZGVyczogWyBdLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFN0YXRlUGx1Z2luTW9kdWxlIHtcblxuICBzdGF0aWMgcmVhZG9ubHkgTkdSSURfUExVR0lOID0gbmdyaWRQbHVnaW4oeyBpZDogUExVR0lOX0tFWSwgZmFjdG9yeTogJ2NyZWF0ZScsIHJ1bk9uY2U6IHJlZ2lzdGVyQnVpbHRJbkhhbmRsZXJzIH0sIFBibE5ncmlkU3RhdGVQbHVnaW4pO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZ1NlcnZpY2U6IFBibE5ncmlkQ29uZmlnU2VydmljZSkge1xuICAgIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5vbkNyZWF0ZWRTYWZlKFxuICAgICAgUGJsTmdyaWRTdGF0ZVBsdWdpbk1vZHVsZSxcbiAgICAgIChncmlkLCBjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldEV2ZW50c0NvbmZpZyA9IGNvbmZpZ1NlcnZpY2UuZ2V0KFBMVUdJTl9LRVkpO1xuICAgICAgICBpZiAodGFyZ2V0RXZlbnRzQ29uZmlnICYmIHRhcmdldEV2ZW50c0NvbmZpZy5hdXRvRW5hYmxlID09PSB0cnVlKSB7XG4gICAgICAgICAgY29udHJvbGxlci5vbkluaXQoKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghY29udHJvbGxlci5oYXNQbHVnaW4oUExVR0lOX0tFWSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGNvbnRyb2xsZXIuY3JlYXRlUGx1Z2luKFBMVUdJTl9LRVkpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRFdmVudHNDb25maWcuYXV0b0VuYWJsZU9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmxvYWRPcHRpb25zID0gdGFyZ2V0RXZlbnRzQ29uZmlnLmF1dG9FbmFibGVPcHRpb25zLmxvYWRPcHRpb25zO1xuICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2F2ZU9wdGlvbnMgPSB0YXJnZXRFdmVudHNDb25maWcuYXV0b0VuYWJsZU9wdGlvbnMuc2F2ZU9wdGlvbnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXX0=