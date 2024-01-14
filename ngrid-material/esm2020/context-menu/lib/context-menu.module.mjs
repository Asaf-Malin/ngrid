import { NgModule, Optional, SkipSelf, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PblNgridConfigService } from '@pebula/ngrid/core';
import { PblNgridRegistryService, PblNgridModule, ngridPlugin } from '@pebula/ngrid';
import { PblNgridOverlayPanelModule, PblNgridOverlayPanelComponentExtension } from '@pebula/ngrid/overlay-panel';
import { MatHeaderContextMenuTrigger } from './header-context/header-context-menu-trigger';
import { MatHeaderContextMenuExtension } from './header-context/header-context-menu-extension';
import { PblNgridMatHeaderContextMenuPlugin, PLUGIN_KEY } from './header-context/header-context-menu.directive';
import { MatExcelStyleHeaderMenu } from './header-context/styles/excel-style-header-menu';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
import * as i2 from "@pebula/ngrid/core";
export class PblNgridContextMenuModule {
    constructor(parentModule, registry, cfr, configService) {
        if (parentModule) {
            return;
        }
        registry.addMulti('dataHeaderExtensions', new MatHeaderContextMenuExtension(cfr));
        registry.addMulti('overlayPanels', new PblNgridOverlayPanelComponentExtension('excelMenu', MatExcelStyleHeaderMenu, cfr));
    }
}
PblNgridContextMenuModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridMatHeaderContextMenuPlugin);
/** @nocollapse */ PblNgridContextMenuModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, deps: [{ token: PblNgridContextMenuModule, optional: true, skipSelf: true }, { token: i1.PblNgridRegistryService }, { token: i0.ComponentFactoryResolver }, { token: i2.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridContextMenuModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, declarations: [MatHeaderContextMenuTrigger,
        PblNgridMatHeaderContextMenuPlugin,
        MatExcelStyleHeaderMenu], imports: [CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        PblNgridModule,
        PblNgridOverlayPanelModule], exports: [PblNgridMatHeaderContextMenuPlugin] });
/** @nocollapse */ PblNgridContextMenuModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, imports: [CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        PblNgridModule,
        PblNgridOverlayPanelModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        MatIconModule,
                        MatButtonModule,
                        MatMenuModule,
                        MatFormFieldModule,
                        MatInputModule,
                        PblNgridModule,
                        PblNgridOverlayPanelModule,
                    ],
                    declarations: [
                        MatHeaderContextMenuTrigger,
                        PblNgridMatHeaderContextMenuPlugin,
                        MatExcelStyleHeaderMenu,
                    ],
                    exports: [
                        PblNgridMatHeaderContextMenuPlugin,
                    ]
                }]
        }], ctorParameters: function () { return [{ type: PblNgridContextMenuModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1.PblNgridRegistryService }, { type: i0.ComponentFactoryResolver }, { type: i2.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51Lm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQtbWF0ZXJpYWwvY29udGV4dC1tZW51L3NyYy9saWIvY29udGV4dC1tZW51Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsc0NBQXNDLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqSCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUMzRixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUMvRixPQUFPLEVBQUUsa0NBQWtDLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDaEgsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saURBQWlELENBQUM7Ozs7QUFzQjFGLE1BQU0sT0FBTyx5QkFBeUI7SUFHcEMsWUFBb0MsWUFBdUMsRUFDL0QsUUFBaUMsRUFDakMsR0FBNkIsRUFDN0IsYUFBb0M7UUFDOUMsSUFBSSxZQUFZLEVBQUU7WUFDaEIsT0FBTztTQUNSO1FBQ0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLDZCQUE2QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEYsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxzQ0FBc0MsQ0FBQyxXQUFXLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1SCxDQUFDOztBQVhlLHNDQUFZLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7eUlBRHhGLHlCQUF5QjswSUFBekIseUJBQXlCLGlCQVI5QiwyQkFBMkI7UUFDM0Isa0NBQWtDO1FBQ2xDLHVCQUF1QixhQVp2QixZQUFZO1FBQ1osYUFBYTtRQUNiLGVBQWU7UUFDZixhQUFhO1FBQ2Isa0JBQWtCO1FBQ2xCLGNBQWM7UUFDZCxjQUFjO1FBQ2QsMEJBQTBCLGFBUTFCLGtDQUFrQzswSUFHN0IseUJBQXlCLFlBbEI5QixZQUFZO1FBQ1osYUFBYTtRQUNiLGVBQWU7UUFDZixhQUFhO1FBQ2Isa0JBQWtCO1FBQ2xCLGNBQWM7UUFDZCxjQUFjO1FBQ2QsMEJBQTBCOzJGQVdyQix5QkFBeUI7a0JBcEJyQyxRQUFRO21CQUFDO29CQUNOLE9BQU8sRUFBRTt3QkFDTCxZQUFZO3dCQUNaLGFBQWE7d0JBQ2IsZUFBZTt3QkFDZixhQUFhO3dCQUNiLGtCQUFrQjt3QkFDbEIsY0FBYzt3QkFDZCxjQUFjO3dCQUNkLDBCQUEwQjtxQkFDN0I7b0JBQ0QsWUFBWSxFQUFFO3dCQUNWLDJCQUEyQjt3QkFDM0Isa0NBQWtDO3dCQUNsQyx1QkFBdUI7cUJBQzFCO29CQUNELE9BQU8sRUFBRTt3QkFDTCxrQ0FBa0M7cUJBQ3JDO2lCQUNKOzswQkFJYyxRQUFROzswQkFBSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE9wdGlvbmFsLCBTa2lwU2VsZiwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xuaW1wb3J0IHsgTWF0QnV0dG9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7IE1hdE1lbnVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9tZW51JztcbmltcG9ydCB7IE1hdEZvcm1GaWVsZE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHsgTWF0SW5wdXRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5cbmltcG9ydCB7IFBibE5ncmlkQ29uZmlnU2VydmljZSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSwgUGJsTmdyaWRNb2R1bGUsIG5ncmlkUGx1Z2luIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxOZ3JpZE92ZXJsYXlQYW5lbE1vZHVsZSwgUGJsTmdyaWRPdmVybGF5UGFuZWxDb21wb25lbnRFeHRlbnNpb24gfSBmcm9tICdAcGVidWxhL25ncmlkL292ZXJsYXktcGFuZWwnO1xuXG5pbXBvcnQgeyBNYXRIZWFkZXJDb250ZXh0TWVudVRyaWdnZXIgfSBmcm9tICcuL2hlYWRlci1jb250ZXh0L2hlYWRlci1jb250ZXh0LW1lbnUtdHJpZ2dlcic7XG5pbXBvcnQgeyBNYXRIZWFkZXJDb250ZXh0TWVudUV4dGVuc2lvbiB9IGZyb20gJy4vaGVhZGVyLWNvbnRleHQvaGVhZGVyLWNvbnRleHQtbWVudS1leHRlbnNpb24nO1xuaW1wb3J0IHsgUGJsTmdyaWRNYXRIZWFkZXJDb250ZXh0TWVudVBsdWdpbiwgUExVR0lOX0tFWSB9IGZyb20gJy4vaGVhZGVyLWNvbnRleHQvaGVhZGVyLWNvbnRleHQtbWVudS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgTWF0RXhjZWxTdHlsZUhlYWRlck1lbnUgfSBmcm9tICcuL2hlYWRlci1jb250ZXh0L3N0eWxlcy9leGNlbC1zdHlsZS1oZWFkZXItbWVudSc7XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIE1hdEljb25Nb2R1bGUsXG4gICAgICAgIE1hdEJ1dHRvbk1vZHVsZSxcbiAgICAgICAgTWF0TWVudU1vZHVsZSxcbiAgICAgICAgTWF0Rm9ybUZpZWxkTW9kdWxlLFxuICAgICAgICBNYXRJbnB1dE1vZHVsZSxcbiAgICAgICAgUGJsTmdyaWRNb2R1bGUsXG4gICAgICAgIFBibE5ncmlkT3ZlcmxheVBhbmVsTW9kdWxlLFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIE1hdEhlYWRlckNvbnRleHRNZW51VHJpZ2dlcixcbiAgICAgICAgUGJsTmdyaWRNYXRIZWFkZXJDb250ZXh0TWVudVBsdWdpbixcbiAgICAgICAgTWF0RXhjZWxTdHlsZUhlYWRlck1lbnUsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIFBibE5ncmlkTWF0SGVhZGVyQ29udGV4dE1lbnVQbHVnaW4sXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENvbnRleHRNZW51TW9kdWxlIHtcbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVkgfSwgUGJsTmdyaWRNYXRIZWFkZXJDb250ZXh0TWVudVBsdWdpbik7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcGFyZW50TW9kdWxlOiBQYmxOZ3JpZENvbnRleHRNZW51TW9kdWxlLFxuICAgICAgICAgICAgICByZWdpc3RyeTogUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UsXG4gICAgICAgICAgICAgIGNmcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgICAgICAgICBjb25maWdTZXJ2aWNlOiBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UpIHtcbiAgICBpZiAocGFyZW50TW9kdWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlZ2lzdHJ5LmFkZE11bHRpKCdkYXRhSGVhZGVyRXh0ZW5zaW9ucycsIG5ldyBNYXRIZWFkZXJDb250ZXh0TWVudUV4dGVuc2lvbihjZnIpKTtcbiAgICByZWdpc3RyeS5hZGRNdWx0aSgnb3ZlcmxheVBhbmVscycsIG5ldyBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbXBvbmVudEV4dGVuc2lvbignZXhjZWxNZW51JywgTWF0RXhjZWxTdHlsZUhlYWRlck1lbnUsIGNmcikpO1xuICB9XG59XG4iXX0=