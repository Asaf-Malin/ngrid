import { NgModule, ComponentFactoryResolver, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { PblNgridModule } from '@pebula/ngrid';
import { PblPaginatorComponent } from './table-paginator.component';
import * as i0 from "@angular/core";
// TODO: Remove MatPaginatorModule and the initial code in the constructor
// set the styles in the SCSS.
export class PblNgridPaginatorModule {
    constructor(cf, injector) {
        // this is a workaround to ensure CSS from mat slider is loaded, otherwise it is omitted.
        cf.resolveComponentFactory(MatPaginator).create(injector);
    }
}
/** @nocollapse */ PblNgridPaginatorModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridPaginatorModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, declarations: [PblPaginatorComponent], imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule], exports: [PblPaginatorComponent] });
/** @nocollapse */ PblNgridPaginatorModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatPaginatorModule, MatSelectModule, MatTooltipModule, MatButtonModule, PblNgridModule],
                    declarations: [PblPaginatorComponent],
                    exports: [PblPaginatorComponent]
                }]
        }], ctorParameters: function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcGFnaW5hdG9yLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQtbWF0ZXJpYWwvcGFnaW5hdG9yL3NyYy9saWIvdGFibGUtcGFnaW5hdG9yLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLHdCQUF3QixFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7QUFDcEUsMEVBQTBFO0FBQzFFLDhCQUE4QjtBQU85QixNQUFNLE9BQU8sdUJBQXVCO0lBQ2xDLFlBQVksRUFBNEIsRUFBRSxRQUFrQjtRQUMxRCx5RkFBeUY7UUFDekYsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDOzt1SUFKVSx1QkFBdUI7d0lBQXZCLHVCQUF1QixpQkFIakIscUJBQXFCLGFBRDFCLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGNBQWMsYUFFcEcscUJBQXFCO3dJQUV0Qix1QkFBdUIsWUFKdEIsWUFBWSxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsY0FBYzsyRkFJckcsdUJBQXVCO2tCQUxuQyxRQUFRO21CQUFDO29CQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQztvQkFDL0csWUFBWSxFQUFFLENBQUMscUJBQXFCLENBQUM7b0JBQ3JDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixDQUFDO2lCQUNuQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTWF0UGFnaW5hdG9yLCBNYXRQYWdpbmF0b3JNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9wYWdpbmF0b3InO1xuaW1wb3J0IHsgTWF0U2VsZWN0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7IE1hdFRvb2x0aXBNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90b29sdGlwJztcbmltcG9ydCB7IE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5cbmltcG9ydCB7IFBibE5ncmlkTW9kdWxlIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxQYWdpbmF0b3JDb21wb25lbnQgfSBmcm9tICcuL3RhYmxlLXBhZ2luYXRvci5jb21wb25lbnQnO1xuLy8gVE9ETzogUmVtb3ZlIE1hdFBhZ2luYXRvck1vZHVsZSBhbmQgdGhlIGluaXRpYWwgY29kZSBpbiB0aGUgY29uc3RydWN0b3Jcbi8vIHNldCB0aGUgc3R5bGVzIGluIHRoZSBTQ1NTLlxuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIE1hdFBhZ2luYXRvck1vZHVsZSwgTWF0U2VsZWN0TW9kdWxlLCBNYXRUb29sdGlwTW9kdWxlLCBNYXRCdXR0b25Nb2R1bGUsIFBibE5ncmlkTW9kdWxlXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtQYmxQYWdpbmF0b3JDb21wb25lbnRdLFxuICAgIGV4cG9ydHM6IFtQYmxQYWdpbmF0b3JDb21wb25lbnRdXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkUGFnaW5hdG9yTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoY2Y6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgLy8gdGhpcyBpcyBhIHdvcmthcm91bmQgdG8gZW5zdXJlIENTUyBmcm9tIG1hdCBzbGlkZXIgaXMgbG9hZGVkLCBvdGhlcndpc2UgaXQgaXMgb21pdHRlZC5cbiAgICBjZi5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShNYXRQYWdpbmF0b3IpLmNyZWF0ZShpbmplY3Rvcik7XG4gIH1cbn1cbiJdfQ==