import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../registry.service';
import * as i0 from "@angular/core";
import * as i1 from "../registry.service";
export class PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
    ngOnInit() {
        this.registry.addMulti(this.kind, this);
    }
    ngOnDestroy() {
        this.registry.removeMulti(this.kind, this);
    }
}
/** @nocollapse */ PblNgridMultiTemplateRegistry.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMultiTemplateRegistry, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMultiTemplateRegistry.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMultiTemplateRegistry, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMultiTemplateRegistry, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktdGVtcGxhdGUuZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL3JlZ2lzdHJ5L2RpcmVjdGl2ZXMvbXVsdGktdGVtcGxhdGUuZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHMUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUJBQXFCLENBQUM7OztBQUc5RCxNQUFNLE9BQWdCLDZCQUE2QjtJQUlqRCxZQUFtQixJQUFvQixFQUFZLFFBQWlDO1FBQWpFLFNBQUksR0FBSixJQUFJLENBQWdCO1FBQVksYUFBUSxHQUFSLFFBQVEsQ0FBeUI7SUFBSSxDQUFDO0lBRXpGLFFBQVE7UUFDTixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFXLENBQUMsQ0FBQztJQUNwRCxDQUFDOzs2SUFabUIsNkJBQTZCO2lJQUE3Qiw2QkFBNkI7MkZBQTdCLDZCQUE2QjtrQkFEbEQsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgVGVtcGxhdGVSZWYsIE9uSW5pdCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXAgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uL3JlZ2lzdHJ5LnNlcnZpY2UnO1xuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQYmxOZ3JpZE11bHRpVGVtcGxhdGVSZWdpc3RyeTxULCBUS2luZCBleHRlbmRzIGtleW9mIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcD4gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIGFic3RyYWN0IHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgYWJzdHJhY3QgcmVhZG9ubHkga2luZDogVEtpbmQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRSZWY6IFRlbXBsYXRlUmVmPFQ+LCBwcm90ZWN0ZWQgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdHJ5LmFkZE11bHRpKHRoaXMua2luZCwgdGhpcyBhcyBhbnkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RyeS5yZW1vdmVNdWx0aSh0aGlzLmtpbmQsIHRoaXMgYXMgYW55KTtcbiAgfVxufVxuIl19