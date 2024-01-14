import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService, PblNgridMultiTemplateRegistry } from '@pebula/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
/**
 * Marks the element as the resizer template for cells.
 */
export class PblNgridCellResizerRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'cellResizer';
        this.kind = 'dataHeaderExtensions';
    }
    shouldRender(context) {
        return !!context.col.resize;
    }
}
/** @nocollapse */ PblNgridCellResizerRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellResizerRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellResizerRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellResizerRefDirective, selector: "[pblNgridCellResizerRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellResizerRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridCellResizerRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1yZXNpemVyLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvZHJhZy9zcmMvbGliL2NvbHVtbi1yZXNpemUvY2VsbC1yZXNpemVyLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsNkJBQTZCLEVBQXNFLE1BQU0sZUFBZSxDQUFDOzs7QUFFM0o7O0dBRUc7QUFFSCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsNkJBQXlGO0lBSTVJLFlBQVksSUFBcUQsRUFBRSxRQUFpQztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFIckgsU0FBSSxHQUFrQixhQUFhLENBQUM7UUFDcEMsU0FBSSxHQUEyQixzQkFBc0IsQ0FBQztJQUVnRSxDQUFDO0lBRWhJLFlBQVksQ0FBQyxPQUEyQztRQUN0RCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDOzsrSUFSVSwrQkFBK0I7bUlBQS9CLCtCQUErQjsyRkFBL0IsK0JBQStCO2tCQUQzQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UsIFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5LCBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25SZWYsIFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQgfSBmcm9tICdAcGVidWxhL25ncmlkJztcblxuLyoqXG4gKiBNYXJrcyB0aGUgZWxlbWVudCBhcyB0aGUgcmVzaXplciB0ZW1wbGF0ZSBmb3IgY2VsbHMuXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1twYmxOZ3JpZENlbGxSZXNpemVyUmVmXScgfSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENlbGxSZXNpemVyUmVmRGlyZWN0aXZlIGV4dGVuZHMgUGJsTmdyaWRNdWx0aVRlbXBsYXRlUmVnaXN0cnk8UGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dCwgJ2RhdGFIZWFkZXJFeHRlbnNpb25zJz4gaW1wbGVtZW50cyBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25SZWYge1xuICByZWFkb25seSBuYW1lOiAnY2VsbFJlc2l6ZXInID0gJ2NlbGxSZXNpemVyJztcbiAgcmVhZG9ubHkga2luZDogJ2RhdGFIZWFkZXJFeHRlbnNpb25zJyA9ICdkYXRhSGVhZGVyRXh0ZW5zaW9ucyc7XG5cbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dD4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cblxuICBzaG91bGRSZW5kZXIoY29udGV4dDogUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIWNvbnRleHQuY29sLnJlc2l6ZTtcbiAgfVxufVxuIl19