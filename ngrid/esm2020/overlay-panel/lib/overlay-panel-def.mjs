import { Directive, TemplateRef, Input } from '@angular/core';
import { PblNgridRegistryService, PblNgridMultiTemplateRegistry } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export class PblNgridOverlayPanelDef extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'overlayPanels';
    }
}
/** @nocollapse */ PblNgridOverlayPanelDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelDef, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridOverlayPanelDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridOverlayPanelDef, selector: "[pblNgridOverlayPanelDef]", inputs: { name: ["pblNgridOverlayPanelDef", "name"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelDef, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridOverlayPanelDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; }, propDecorators: { name: [{
                type: Input,
                args: ['pblNgridOverlayPanelDef']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1wYW5lbC1kZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL292ZXJsYXktcGFuZWwvc3JjL2xpYi9vdmVybGF5LXBhbmVsLWRlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFxQix1QkFBdUIsRUFBRSw2QkFBNkIsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBUzFHLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSw2QkFBaUU7SUFLNUcsWUFBWSxJQUFvQyxFQUFFLFFBQWlDO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUhwRyxTQUFJLEdBQW9CLGVBQWUsQ0FBQztJQUc2RCxDQUFDOzt1SUFMcEcsdUJBQXVCOzJIQUF2Qix1QkFBdUI7MkZBQXZCLHVCQUF1QjtrQkFEbkMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSwyQkFBMkIsRUFBRTt3SUFJaEIsSUFBSTtzQkFBckMsS0FBSzt1QkFBQyx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIFRlbXBsYXRlUmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLCBQYmxOZ3JpZE11bHRpVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgUGJsTmdyaWRPdmVybGF5UGFuZWxSZWYgfSBmcm9tICcuL292ZXJsYXktcGFuZWwtcmVmJztcblxuZXhwb3J0IGludGVyZmFjZSBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbnRleHQ8VCA9IGFueT4ge1xuICBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxUPjtcbiAgcmVmOiBQYmxOZ3JpZE92ZXJsYXlQYW5lbFJlZjtcbn1cblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW3BibE5ncmlkT3ZlcmxheVBhbmVsRGVmXScgfSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZE92ZXJsYXlQYW5lbERlZiBleHRlbmRzIFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5PFBibE5ncmlkQ29tcG9uZW50LCAnb3ZlcmxheVBhbmVscyc+IHtcblxuICByZWFkb25seSBraW5kOiAnb3ZlcmxheVBhbmVscycgPSAnb3ZlcmxheVBhbmVscyc7XG4gIEBJbnB1dCgncGJsTmdyaWRPdmVybGF5UGFuZWxEZWYnKSBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWRDb21wb25lbnQ+LCByZWdpc3RyeTogUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UpIHsgc3VwZXIodFJlZiwgcmVnaXN0cnkpOyB9XG59XG4iXX0=