import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../registry.service';
import { PblNgridSingleTemplateRegistry } from './single-template.directives';
import * as i0 from "@angular/core";
import * as i1 from "../registry.service";
/**
 * Marks the element as the display element for pagination
 */
export class PblNgridPaginatorRefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'paginator';
    }
}
/** @nocollapse */ PblNgridPaginatorRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridPaginatorRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridPaginatorRefDirective, selector: "[pblNgridPaginatorRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridPaginatorRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridPaginatorRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLXJlZi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9yZWdpc3RyeS9kaXJlY3RpdmVzL3BhZ2luYXRvci1yZWYuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3ZELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzlELE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7QUFFOUU7O0dBRUc7QUFFSCxNQUFNLE9BQU8sNkJBQThCLFNBQVEsOEJBQW1GO0lBRXBJLFlBQVksSUFBeUQsRUFBRSxRQUFpQztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFEekgsU0FBSSxHQUFnQixXQUFXLENBQUM7SUFDMEYsQ0FBQzs7NklBRnpILDZCQUE2QjtpSUFBN0IsNkJBQTZCOzJGQUE3Qiw2QkFBNkI7a0JBRHpDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIFRlbXBsYXRlUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uL3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRTaW5nbGVUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnLi9zaW5nbGUtdGVtcGxhdGUuZGlyZWN0aXZlcyc7XG5cbi8qKlxuICogTWFya3MgdGhlIGVsZW1lbnQgYXMgdGhlIGRpc3BsYXkgZWxlbWVudCBmb3IgcGFnaW5hdGlvblxuICovXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbcGJsTmdyaWRQYWdpbmF0b3JSZWZdJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkUGFnaW5hdG9yUmVmRGlyZWN0aXZlIGV4dGVuZHMgUGJsTmdyaWRTaW5nbGVUZW1wbGF0ZVJlZ2lzdHJ5PHsgJGltcGxpY2l0OiBfUGJsTmdyaWRDb21wb25lbnQ8YW55PiB9LCAncGFnaW5hdG9yJz4ge1xuICByZWFkb25seSBraW5kOiAncGFnaW5hdG9yJyA9ICdwYWdpbmF0b3InO1xuICBjb25zdHJ1Y3Rvcih0UmVmOiBUZW1wbGF0ZVJlZjx7ICRpbXBsaWNpdDogX1BibE5ncmlkQ29tcG9uZW50PGFueT4gfT4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkU2luZ2xlUmVnaXN0cnlNYXAge1xuICAgIHBhZ2luYXRvcj86IFBibE5ncmlkUGFnaW5hdG9yUmVmRGlyZWN0aXZlO1xuICB9XG59XG4iXX0=