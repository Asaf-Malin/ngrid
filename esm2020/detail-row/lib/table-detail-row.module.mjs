import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { PblNgridModule, ngridPlugin } from '@asafmalin/ngrid';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PLUGIN_KEY } from './detail-row/tokens';
import { PblNgridDetailRowParentRefDirective, PblNgridDetailRowDefDirective } from './detail-row/directives';
import { PblNgridDetailRowPluginDirective, PblNgridDefaultDetailRowParentComponent } from './detail-row/detail-row-plugin';
import { PblNgridDetailRowComponent } from './detail-row/row';
import * as i0 from "@angular/core";
const DETAIL_ROW = [
    PblNgridDetailRowPluginDirective,
    PblNgridDetailRowComponent,
    PblNgridDetailRowParentRefDirective,
    PblNgridDetailRowDefDirective,
];
export class PblNgridDetailRowModule {
}
PblNgridDetailRowModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridDetailRowPluginDirective);
/** @nocollapse */ PblNgridDetailRowModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridDetailRowModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, declarations: [PblNgridDetailRowPluginDirective,
        PblNgridDetailRowComponent,
        PblNgridDetailRowParentRefDirective,
        PblNgridDetailRowDefDirective, PblNgridDefaultDetailRowParentComponent], imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridDetailRowPluginDirective,
        PblNgridDetailRowComponent,
        PblNgridDetailRowParentRefDirective,
        PblNgridDetailRowDefDirective] });
/** @nocollapse */ PblNgridDetailRowModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [DETAIL_ROW, PblNgridDefaultDetailRowParentComponent],
                    exports: [DETAIL_ROW]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGV0YWlsLXJvdy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RldGFpbC1yb3cvc3JjL2xpYi90YWJsZS1kZXRhaWwtcm93Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFekUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxtQ0FBbUMsRUFBRSw2QkFBNkIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzdHLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSx1Q0FBdUMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNILE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGtCQUFrQixDQUFDOztBQUU5RCxNQUFNLFVBQVUsR0FBRztJQUNqQixnQ0FBZ0M7SUFDaEMsMEJBQTBCO0lBQzFCLG1DQUFtQztJQUNuQyw2QkFBNkI7Q0FDOUIsQ0FBQztBQU9GLE1BQU0sT0FBTyx1QkFBdUI7O0FBQ2xCLG9DQUFZLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7dUlBRHRGLHVCQUF1Qjt3SUFBdkIsdUJBQXVCLGlCQVhsQyxnQ0FBZ0M7UUFDaEMsMEJBQTBCO1FBQzFCLG1DQUFtQztRQUNuQyw2QkFBNkIsRUFLQSx1Q0FBdUMsYUFEeEQsWUFBWSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsMEJBQTBCLGFBUHBGLGdDQUFnQztRQUNoQywwQkFBMEI7UUFDMUIsbUNBQW1DO1FBQ25DLDZCQUE2Qjt3SUFRbEIsdUJBQXVCLFlBSnRCLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLDBCQUEwQjsyRkFJekUsdUJBQXVCO2tCQUxuQyxRQUFRO21CQUFDO29CQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixDQUFDO29CQUNuRixZQUFZLEVBQUUsQ0FBQyxVQUFVLEVBQUUsdUNBQXVDLENBQUM7b0JBQ25FLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgQ2RrVGFibGVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHsgUGJsTmdyaWRNb2R1bGUsIG5ncmlkUGx1Z2luIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxOZ3JpZFRhcmdldEV2ZW50c01vZHVsZSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvdGFyZ2V0LWV2ZW50cyc7XG5cbmltcG9ydCB7IFBMVUdJTl9LRVkgfSBmcm9tICcuL2RldGFpbC1yb3cvdG9rZW5zJztcbmltcG9ydCB7IFBibE5ncmlkRGV0YWlsUm93UGFyZW50UmVmRGlyZWN0aXZlLCBQYmxOZ3JpZERldGFpbFJvd0RlZkRpcmVjdGl2ZSB9IGZyb20gJy4vZGV0YWlsLXJvdy9kaXJlY3RpdmVzJztcbmltcG9ydCB7IFBibE5ncmlkRGV0YWlsUm93UGx1Z2luRGlyZWN0aXZlLCBQYmxOZ3JpZERlZmF1bHREZXRhaWxSb3dQYXJlbnRDb21wb25lbnQgfSBmcm9tICcuL2RldGFpbC1yb3cvZGV0YWlsLXJvdy1wbHVnaW4nO1xuaW1wb3J0IHsgUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQgfSBmcm9tICcuL2RldGFpbC1yb3cvcm93JztcblxuY29uc3QgREVUQUlMX1JPVyA9IFtcbiAgUGJsTmdyaWREZXRhaWxSb3dQbHVnaW5EaXJlY3RpdmUsXG4gIFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50LFxuICBQYmxOZ3JpZERldGFpbFJvd1BhcmVudFJlZkRpcmVjdGl2ZSxcbiAgUGJsTmdyaWREZXRhaWxSb3dEZWZEaXJlY3RpdmUsXG5dO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIENka1RhYmxlTW9kdWxlLCBQYmxOZ3JpZE1vZHVsZSwgUGJsTmdyaWRUYXJnZXRFdmVudHNNb2R1bGVdLFxuICAgIGRlY2xhcmF0aW9uczogW0RFVEFJTF9ST1csIFBibE5ncmlkRGVmYXVsdERldGFpbFJvd1BhcmVudENvbXBvbmVudF0sXG4gICAgZXhwb3J0czogW0RFVEFJTF9ST1ddXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkRGV0YWlsUm93TW9kdWxlIHtcbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVkgfSwgUGJsTmdyaWREZXRhaWxSb3dQbHVnaW5EaXJlY3RpdmUpO1xufVxuIl19