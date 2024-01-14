import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { PblNgridRegistryService, PblNgridModule, ngridPlugin } from '@asafmalin/ngrid';
import { PblNgridMatSortDirective, PLUGIN_KEY } from './mat-sort.directive';
import { MatSortExtension } from './mat-sort-component-extension';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export class PblNgridMatSortModule {
    constructor(registry, cfr) {
        this.registry = registry;
        registry.addMulti('dataHeaderExtensions', new MatSortExtension(cfr));
    }
}
PblNgridMatSortModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridMatSortDirective);
/** @nocollapse */ PblNgridMatSortModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, deps: [{ token: i1.PblNgridRegistryService }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridMatSortModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, declarations: [PblNgridMatSortDirective], imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule], exports: [PblNgridMatSortDirective, MatSortModule] });
/** @nocollapse */ PblNgridMatSortModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule, MatSortModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule],
                    declarations: [PblNgridMatSortDirective],
                    exports: [PblNgridMatSortDirective, MatSortModule]
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridRegistryService }, { type: i0.ComponentFactoryResolver }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNvcnQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC1tYXRlcmlhbC9zb3J0L3NyYy9saWIvbWF0LXNvcnQubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQWlCLE1BQU0sd0JBQXdCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRTNELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQzs7O0FBT2xFLE1BQU0sT0FBTyxxQkFBcUI7SUFHaEMsWUFBb0IsUUFBaUMsRUFBRSxHQUE2QjtRQUFoRSxhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUNuRCxRQUFRLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDOztBQUplLGtDQUFZLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLHdCQUF3QixDQUFDLENBQUM7cUlBRDlFLHFCQUFxQjtzSUFBckIscUJBQXFCLGlCQUhmLHdCQUF3QixhQUQ3QixZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxjQUFjLGFBRTVELHdCQUF3QixFQUFFLGFBQWE7c0lBRXhDLHFCQUFxQixZQUpwQixZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBRWxDLGFBQWE7MkZBRXhDLHFCQUFxQjtrQkFMakMsUUFBUTttQkFBQztvQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUM7b0JBQ3ZFLFlBQVksRUFBRSxDQUFDLHdCQUF3QixDQUFDO29CQUN4QyxPQUFPLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxhQUFhLENBQUM7aUJBQ3JEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE1hdFNvcnRNb2R1bGUsIE1hdFNvcnRIZWFkZXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zb3J0JztcbmltcG9ydCB7IE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5cbmltcG9ydCB7IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLCBQYmxOZ3JpZE1vZHVsZSwgbmdyaWRQbHVnaW4gfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibE5ncmlkTWF0U29ydERpcmVjdGl2ZSwgUExVR0lOX0tFWSB9IGZyb20gJy4vbWF0LXNvcnQuZGlyZWN0aXZlJztcbmltcG9ydCB7IE1hdFNvcnRFeHRlbnNpb24gfSBmcm9tICcuL21hdC1zb3J0LWNvbXBvbmVudC1leHRlbnNpb24nO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIE1hdEJ1dHRvbk1vZHVsZSwgTWF0U29ydE1vZHVsZSwgUGJsTmdyaWRNb2R1bGVdLFxuICAgIGRlY2xhcmF0aW9uczogW1BibE5ncmlkTWF0U29ydERpcmVjdGl2ZV0sXG4gICAgZXhwb3J0czogW1BibE5ncmlkTWF0U29ydERpcmVjdGl2ZSwgTWF0U29ydE1vZHVsZV1cbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRNYXRTb3J0TW9kdWxlIHtcbiAgc3RhdGljIHJlYWRvbmx5IE5HUklEX1BMVUdJTiA9IG5ncmlkUGx1Z2luKHsgaWQ6IFBMVUdJTl9LRVkgfSwgUGJsTmdyaWRNYXRTb3J0RGlyZWN0aXZlKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSwgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICByZWdpc3RyeS5hZGRNdWx0aSgnZGF0YUhlYWRlckV4dGVuc2lvbnMnLCBuZXcgTWF0U29ydEV4dGVuc2lvbihjZnIpKTtcbiAgfVxufVxuIl19