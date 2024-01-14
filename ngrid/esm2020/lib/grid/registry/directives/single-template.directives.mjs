import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../registry.service';
import * as i0 from "@angular/core";
import * as i1 from "../registry.service";
export class PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
    ngOnInit() {
        this.registry.setSingle(this.kind, this);
    }
    ngOnDestroy() {
        this.registry.setSingle(this.kind, undefined);
    }
}
/** @nocollapse */ PblNgridSingleTemplateRegistry.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridSingleTemplateRegistry, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridSingleTemplateRegistry.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridSingleTemplateRegistry, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridSingleTemplateRegistry, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXRlbXBsYXRlLmRpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9yZWdpc3RyeS9kaXJlY3RpdmVzL3NpbmdsZS10ZW1wbGF0ZS5kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUcxRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBRzlELE1BQU0sT0FBZ0IsOEJBQThCO0lBR2xELFlBQW1CLElBQW9CLEVBQVksUUFBaUM7UUFBakUsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFBWSxhQUFRLEdBQVIsUUFBUSxDQUF5QjtJQUFJLENBQUM7SUFFekYsUUFBUTtRQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFHLFNBQVMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OzhJQVhtQiw4QkFBOEI7a0lBQTlCLDhCQUE4QjsyRkFBOUIsOEJBQThCO2tCQURuRCxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiwgT25Jbml0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBibE5ncmlkU2luZ2xlUmVnaXN0cnlNYXAgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uL3JlZ2lzdHJ5LnNlcnZpY2UnO1xuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQYmxOZ3JpZFNpbmdsZVRlbXBsYXRlUmVnaXN0cnk8VCwgVEtpbmQgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZFNpbmdsZVJlZ2lzdHJ5TWFwPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgYWJzdHJhY3QgcmVhZG9ubHkga2luZDogVEtpbmQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRSZWY6IFRlbXBsYXRlUmVmPFQ+LCBwcm90ZWN0ZWQgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdHJ5LnNldFNpbmdsZSh0aGlzLmtpbmQsIHRoaXMgYXMgYW55KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0cnkuc2V0U2luZ2xlKHRoaXMua2luZCwgIHVuZGVmaW5lZCk7XG4gIH1cbn1cbiJdfQ==