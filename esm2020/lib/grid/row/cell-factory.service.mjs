import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as i0 from "@angular/core";
export const NGRID_CELL_FACTORY = new InjectionToken('PblNgridCellFactoryResolver');
export class PblNgridCellFactoryResolver {
    constructor(factoryMap) {
        this.factoryMap = factoryMap;
    }
    getComponentFactory(row) {
        return this.factoryMap[row.rowType];
    }
}
/** @nocollapse */ PblNgridCellFactoryResolver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver, deps: [{ token: NGRID_CELL_FACTORY }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridCellFactoryResolver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellFactoryResolver, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGRID_CELL_FACTORY]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1mYWN0b3J5LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9yb3cvY2VsbC1mYWN0b3J5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFvQixVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJckYsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQThCLDZCQUE2QixDQUFDLENBQUM7QUFLakgsTUFBTSxPQUFPLDJCQUEyQjtJQUd0QyxZQUF3QyxVQUFlO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRCxtQkFBbUIsQ0FBK0IsR0FBMEM7UUFDMUYsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQVEsQ0FBQztJQUM3QyxDQUFDOzsySUFUVSwyQkFBMkIsa0JBR2xCLGtCQUFrQjsrSUFIM0IsMkJBQTJCOzJGQUEzQiwyQkFBMkI7a0JBRHZDLFVBQVU7OzBCQUlJLE1BQU07MkJBQUMsa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50RmFjdG9yeSwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50IH0gZnJvbSAnLi9iYXNlLXJvdy5jb21wb25lbnQnO1xuaW1wb3J0IHsgR3JpZFJvd1R5cGUsIFBibFJvd1R5cGVUb0NlbGxUeXBlTWFwIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBOR1JJRF9DRUxMX0ZBQ1RPUlkgPSBuZXcgSW5qZWN0aW9uVG9rZW48UGJsTmdyaWRDZWxsRmFjdG9yeVJlc29sdmVyPignUGJsTmdyaWRDZWxsRmFjdG9yeVJlc29sdmVyJyk7XG5cbmV4cG9ydCB0eXBlIFBibE5ncmlkQ2VsbEZhY3RvcnlNYXAgPSB7IFtQIGluIEdyaWRSb3dUeXBlXTogQ29tcG9uZW50RmFjdG9yeTxQYmxSb3dUeXBlVG9DZWxsVHlwZU1hcDxQPj47IH07XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENlbGxGYWN0b3J5UmVzb2x2ZXI8VCA9IGFueT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGZhY3RvcnlNYXA6IFBibE5ncmlkQ2VsbEZhY3RvcnlNYXA7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChOR1JJRF9DRUxMX0ZBQ1RPUlkpIGZhY3RvcnlNYXA6IGFueSkge1xuICAgIHRoaXMuZmFjdG9yeU1hcCA9IGZhY3RvcnlNYXA7XG4gIH1cblxuICBnZXRDb21wb25lbnRGYWN0b3J5PFRSb3dUeXBlIGV4dGVuZHMgR3JpZFJvd1R5cGU+KHJvdzogUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50PFRSb3dUeXBlLCBUPik6IENvbXBvbmVudEZhY3Rvcnk8UGJsUm93VHlwZVRvQ2VsbFR5cGVNYXA8VFJvd1R5cGU+PiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeU1hcFtyb3cucm93VHlwZV0gYXMgYW55O1xuICB9XG59XG4iXX0=