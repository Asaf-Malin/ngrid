// tslint:disable:use-host-property-decorator
import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService, PblNgridSingleTemplateRegistry } from '@pebula/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
/**
 * Marks the element as the display element when the form is busy.
 */
export class PblNgridBlockUiDefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'blocker';
    }
}
/** @nocollapse */ PblNgridBlockUiDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBlockUiDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBlockUiDefDirective, selector: "[pblNgridBlockUiDef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBlockUiDefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridBlockUiDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvYmxvY2stdWkvc3JjL2xpYi9ibG9jay11aS9kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDZDQUE2QztBQUM3QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLEVBQXFCLHVCQUF1QixFQUFFLDhCQUE4QixFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFRM0c7O0dBRUc7QUFFSCxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsOEJBQWdGO0lBRS9ILFlBQVksSUFBd0QsRUFBRSxRQUFpQztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFEeEgsU0FBSSxHQUFHLFNBQVMsQ0FBQztJQUN3RyxDQUFDOzsySUFGeEgsMkJBQTJCOytIQUEzQiwyQkFBMkI7MkZBQTNCLDJCQUEyQjtrQkFEdkMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOnVzZS1ob3N0LXByb3BlcnR5LWRlY29yYXRvclxuaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLCBQYmxOZ3JpZFNpbmdsZVRlbXBsYXRlUmVnaXN0cnkgfSBmcm9tICdAcGVidWxhL25ncmlkJztcblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkU2luZ2xlUmVnaXN0cnlNYXAge1xuICAgIGJsb2NrZXI/OiBQYmxOZ3JpZEJsb2NrVWlEZWZEaXJlY3RpdmU7XG4gIH1cbn1cblxuLyoqXG4gKiBNYXJrcyB0aGUgZWxlbWVudCBhcyB0aGUgZGlzcGxheSBlbGVtZW50IHdoZW4gdGhlIGZvcm0gaXMgYnVzeS5cbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW3BibE5ncmlkQmxvY2tVaURlZl0nIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRCbG9ja1VpRGVmRGlyZWN0aXZlIGV4dGVuZHMgUGJsTmdyaWRTaW5nbGVUZW1wbGF0ZVJlZ2lzdHJ5PHsgJGltcGxpY2l0OiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+IH0sICdibG9ja2VyJz4ge1xuICByZWFkb25seSBraW5kID0gJ2Jsb2NrZXInO1xuICBjb25zdHJ1Y3Rvcih0UmVmOiBUZW1wbGF0ZVJlZjx7ICRpbXBsaWNpdDogUGJsTmdyaWRDb21wb25lbnQ8YW55PiB9PiwgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IHN1cGVyKHRSZWYsIHJlZ2lzdHJ5KTsgfVxufVxuIl19