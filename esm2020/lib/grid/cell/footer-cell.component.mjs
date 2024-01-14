import { filter } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, } from '@angular/core';
import { unrx } from '@pebula/ngrid/core';
import { MetaCellContext } from '../context/index';
import { applyWidth, initCellElement } from './utils';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class PblNgridFooterCellComponent extends PblNgridBaseCell {
    get columnDef() { return this.column?.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            this.cellCtx = MetaCellContext.create(column, this.grid);
            applyWidth.call(this);
            initCellElement(this.el, column);
            this.columnDef.widthChange
                .pipe(filter(event => event.reason !== 'update'), unrx(this, column))
                .subscribe(applyWidth.bind(this));
        }
    }
    ngOnDestroy() {
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
}
/** @nocollapse */ PblNgridFooterCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridFooterCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridFooterCellComponent, selector: "pbl-ngrid-footer-cell", host: { attributes: { "role": "gridcell" }, classAttribute: "cdk-footer-cell pbl-ngrid-footer-cell" }, usesInheritance: true, ngImport: i0, template: `<ng-container *ngTemplateOutlet="column?.footerCellTpl; context: cellCtx"></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-footer-cell',
                    template: `<ng-container *ngTemplateOutlet="column?.footerCellTpl; context: cellCtx"></ng-container>`,
                    host: {
                        class: 'cdk-footer-cell pbl-ngrid-footer-cell',
                        role: 'gridcell',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vdGVyLWNlbGwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY2VsbC9mb290ZXItY2VsbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFDTCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFJMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3RELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7O0FBWS9DLE1BQU0sT0FBTywyQkFBNEIsU0FBUSxnQkFBZ0I7SUFJL0QsSUFBSSxTQUFTLEtBQXdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLElBQUksSUFBSSxLQUF5QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUUzRCxTQUFTLENBQUMsTUFBaUI7UUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN6QixJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7WUFDbkIsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkI7WUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUVyQixJQUFJLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRWpDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVztpQkFDekIsSUFBSSxDQUNILE1BQU0sQ0FBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLEVBQzNDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQ25CO2lCQUNBLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OzJJQW5DVSwyQkFBMkI7K0hBQTNCLDJCQUEyQiwyTEFSNUIsMkZBQTJGOzJGQVExRiwyQkFBMkI7a0JBVnRDLFNBQVM7bUJBQUM7b0JBQ1YsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsUUFBUSxFQUFFLDJGQUEyRjtvQkFDckcsSUFBSSxFQUFFO3dCQUNKLEtBQUssRUFBRSx1Q0FBdUM7d0JBQzlDLElBQUksRUFBRSxVQUFVO3FCQUNqQjtvQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi9jb2x1bW4vbW9kZWwnO1xuaW1wb3J0IHsgTWV0YUNlbGxDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9pbmRleCc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbHVtbkRlZiB9IGZyb20gJy4uL2NvbHVtbi9kaXJlY3RpdmVzL2NvbHVtbi1kZWYnO1xuaW1wb3J0IHsgYXBwbHlXaWR0aCwgaW5pdENlbGxFbGVtZW50IH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VDZWxsIH0gZnJvbSAnLi9iYXNlLWNlbGwnO1xuXG4gQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLWZvb3Rlci1jZWxsJyxcbiAgdGVtcGxhdGU6IGA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiY29sdW1uPy5mb290ZXJDZWxsVHBsOyBjb250ZXh0OiBjZWxsQ3R4XCI+PC9uZy1jb250YWluZXI+YCxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnY2RrLWZvb3Rlci1jZWxsIHBibC1uZ3JpZC1mb290ZXItY2VsbCcsXG4gICAgcm9sZTogJ2dyaWRjZWxsJyxcbiAgfSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkRm9vdGVyQ2VsbENvbXBvbmVudCBleHRlbmRzIFBibE5ncmlkQmFzZUNlbGwge1xuXG4gIGNvbHVtbjogUGJsQ29sdW1uO1xuICBjZWxsQ3R4OiBNZXRhQ2VsbENvbnRleHQ8YW55LCBQYmxDb2x1bW4+O1xuICBnZXQgY29sdW1uRGVmKCk6IFBibE5ncmlkQ29sdW1uRGVmIHsgcmV0dXJuIHRoaXMuY29sdW1uPy5jb2x1bW5EZWY7IH1cbiAgZ2V0IGdyaWQoKTogX1BibE5ncmlkQ29tcG9uZW50IHsgcmV0dXJuIHRoaXMuZXh0QXBpLmdyaWQ7IH1cblxuICBzZXRDb2x1bW4oY29sdW1uOiBQYmxDb2x1bW4pIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHByZXYgIT09IGNvbHVtbikge1xuICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgdW5yeC5raWxsKHRoaXMsIHByZXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcblxuICAgICAgdGhpcy5jZWxsQ3R4ID0gTWV0YUNlbGxDb250ZXh0LmNyZWF0ZShjb2x1bW4sIHRoaXMuZ3JpZCk7XG5cbiAgICAgIGFwcGx5V2lkdGguY2FsbCh0aGlzKTtcbiAgICAgIGluaXRDZWxsRWxlbWVudCh0aGlzLmVsLCBjb2x1bW4pO1xuXG4gICAgICB0aGlzLmNvbHVtbkRlZi53aWR0aENoYW5nZVxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlciggZXZlbnQgPT4gZXZlbnQucmVhc29uICE9PSAndXBkYXRlJyksXG4gICAgICAgIHVucngodGhpcywgY29sdW1uKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoYXBwbHlXaWR0aC5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5jb2x1bW4pIHtcbiAgICAgIHVucngodGhpcywgdGhpcy5jb2x1bW4pO1xuICAgIH1cbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=