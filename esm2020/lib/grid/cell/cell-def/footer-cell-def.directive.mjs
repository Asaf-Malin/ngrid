import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
export class PblNgridFooterCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('footerCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('footerCell', this);
    }
}
/** @nocollapse */ PblNgridFooterCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridFooterCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridFooterCellDefDirective, selector: "[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]", inputs: { name: ["pblNgridFooterCellDef", "name"], type: ["pblNgridFooterCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridFooterCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridFooterCellDef], [pblNgridFooterCellTypeDef]',
                    inputs: [
                        'name:pblNgridFooterCellDef',
                        'type:pblNgridFooterCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vdGVyLWNlbGwtZGVmLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NlbGwvY2VsbC1kZWYvZm9vdGVyLWNlbGwtZGVmLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV2RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUUxRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQzs7O0FBU2hFLE1BQU0sT0FBTyw4QkFBa0MsU0FBUSxtQkFBK0M7SUFDcEcsWUFBWSxJQUE2QyxFQUFFLFFBQWlDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEgsUUFBUTtRQUNOLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7OElBVlUsOEJBQThCO2tJQUE5Qiw4QkFBOEI7MkZBQTlCLDhCQUE4QjtrQkFQMUMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsc0RBQXNEO29CQUNoRSxNQUFNLEVBQUU7d0JBQ04sNEJBQTRCO3dCQUM1QixnQ0FBZ0M7cUJBQ2pDO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uLy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRNZXRhQ2VsbENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0L2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQmFzZUNlbGxEZWYgfSBmcm9tICcuL2Jhc2UtY2VsbC1kZWYuZGlyZWN0aXZlJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkRm9vdGVyQ2VsbERlZl0sIFtwYmxOZ3JpZEZvb3RlckNlbGxUeXBlRGVmXScsXG4gIGlucHV0czogW1xuICAgICduYW1lOnBibE5ncmlkRm9vdGVyQ2VsbERlZicsXG4gICAgJ3R5cGU6cGJsTmdyaWRGb290ZXJDZWxsVHlwZURlZicsXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRGb290ZXJDZWxsRGVmRGlyZWN0aXZlPFQ+IGV4dGVuZHMgUGJsTmdyaWRCYXNlQ2VsbERlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxUPj4ge1xuICBjb25zdHJ1Y3Rvcih0UmVmOiBUZW1wbGF0ZVJlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxUPj4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBsaXN0ZW4gdG8gcHJvcGVydHkgY2hhbmdlcyAobmFtZSkgYW5kIHJlLXJlZ2lzdGVyIGNlbGxcbiAgICB0aGlzLnJlZ2lzdHJ5LmFkZE11bHRpKCdmb290ZXJDZWxsJywgdGhpcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdHJ5LnJlbW92ZU11bHRpKCdmb290ZXJDZWxsJywgdGhpcyk7XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCB7XG4gICAgZm9vdGVyQ2VsbD86IFBibE5ncmlkRm9vdGVyQ2VsbERlZkRpcmVjdGl2ZTxhbnk+O1xuICB9XG59XG4iXX0=