// tslint:disable:use-input-property-decorator
import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
/**
 * Header Cell definition for the pbl-ngrid.
 * Captures the template of a column's data row header cell as well as header cell-specific properties.
 *
 * `pblNgridHeaderCellDef` does the same thing that `matHeaderCellDef` and `cdkHeaderCellDef` do with one difference,
 * `pblNgridHeaderCellDef` is independent and does not require a column definition parent, instead it accept the ID of
 * the header cell.
 *
 * NOTE: Defining '*' as id will declare the header cell template as default, replacing the table's default header cell template.
 *
 * Make sure you set the proper id of the property you want to override.
 * When the `id` is set explicitly in the table column definition, this is not a problem but when if it's not set
 * the table generates a unique id based on a logic. If `name` is set the name is used, if no name is set
 * the `prop` is used (full with dot notation).
 */
export class PblNgridHeaderCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('headerCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('headerCell', this);
    }
}
/** @nocollapse */ PblNgridHeaderCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHeaderCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderCellDefDirective, selector: "[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]", inputs: { name: ["pblNgridHeaderCellDef", "name"], type: ["pblNgridHeaderCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridHeaderCellDef], [pblNgridHeaderCellTypeDef]',
                    inputs: [
                        'name:pblNgridHeaderCellDef',
                        'type:pblNgridHeaderCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLWNlbGwtZGVmLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NlbGwvY2VsbC1kZWYvaGVhZGVyLWNlbGwtZGVmLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw4Q0FBOEM7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7OztBQUVoRTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQVFILE1BQU0sT0FBTyw4QkFBa0MsU0FBUSxtQkFBK0M7SUFDcEcsWUFBWSxJQUE2QyxFQUFFLFFBQWlDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEgsUUFBUTtRQUNOLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7OElBVlUsOEJBQThCO2tJQUE5Qiw4QkFBOEI7MkZBQTlCLDhCQUE4QjtrQkFQMUMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsc0RBQXNEO29CQUNoRSxNQUFNLEVBQUU7d0JBQ04sNEJBQTRCO3dCQUM1QixnQ0FBZ0M7cUJBQ2pDO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6dXNlLWlucHV0LXByb3BlcnR5LWRlY29yYXRvclxuaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uLy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRNZXRhQ2VsbENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0L2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQmFzZUNlbGxEZWYgfSBmcm9tICcuL2Jhc2UtY2VsbC1kZWYuZGlyZWN0aXZlJztcblxuLyoqXG4gKiBIZWFkZXIgQ2VsbCBkZWZpbml0aW9uIGZvciB0aGUgcGJsLW5ncmlkLlxuICogQ2FwdHVyZXMgdGhlIHRlbXBsYXRlIG9mIGEgY29sdW1uJ3MgZGF0YSByb3cgaGVhZGVyIGNlbGwgYXMgd2VsbCBhcyBoZWFkZXIgY2VsbC1zcGVjaWZpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIGBwYmxOZ3JpZEhlYWRlckNlbGxEZWZgIGRvZXMgdGhlIHNhbWUgdGhpbmcgdGhhdCBgbWF0SGVhZGVyQ2VsbERlZmAgYW5kIGBjZGtIZWFkZXJDZWxsRGVmYCBkbyB3aXRoIG9uZSBkaWZmZXJlbmNlLFxuICogYHBibE5ncmlkSGVhZGVyQ2VsbERlZmAgaXMgaW5kZXBlbmRlbnQgYW5kIGRvZXMgbm90IHJlcXVpcmUgYSBjb2x1bW4gZGVmaW5pdGlvbiBwYXJlbnQsIGluc3RlYWQgaXQgYWNjZXB0IHRoZSBJRCBvZlxuICogdGhlIGhlYWRlciBjZWxsLlxuICpcbiAqIE5PVEU6IERlZmluaW5nICcqJyBhcyBpZCB3aWxsIGRlY2xhcmUgdGhlIGhlYWRlciBjZWxsIHRlbXBsYXRlIGFzIGRlZmF1bHQsIHJlcGxhY2luZyB0aGUgdGFibGUncyBkZWZhdWx0IGhlYWRlciBjZWxsIHRlbXBsYXRlLlxuICpcbiAqIE1ha2Ugc3VyZSB5b3Ugc2V0IHRoZSBwcm9wZXIgaWQgb2YgdGhlIHByb3BlcnR5IHlvdSB3YW50IHRvIG92ZXJyaWRlLlxuICogV2hlbiB0aGUgYGlkYCBpcyBzZXQgZXhwbGljaXRseSBpbiB0aGUgdGFibGUgY29sdW1uIGRlZmluaXRpb24sIHRoaXMgaXMgbm90IGEgcHJvYmxlbSBidXQgd2hlbiBpZiBpdCdzIG5vdCBzZXRcbiAqIHRoZSB0YWJsZSBnZW5lcmF0ZXMgYSB1bmlxdWUgaWQgYmFzZWQgb24gYSBsb2dpYy4gSWYgYG5hbWVgIGlzIHNldCB0aGUgbmFtZSBpcyB1c2VkLCBpZiBubyBuYW1lIGlzIHNldFxuICogdGhlIGBwcm9wYCBpcyB1c2VkIChmdWxsIHdpdGggZG90IG5vdGF0aW9uKS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkSGVhZGVyQ2VsbERlZl0sIFtwYmxOZ3JpZEhlYWRlckNlbGxUeXBlRGVmXScsXG4gIGlucHV0czogW1xuICAgICduYW1lOnBibE5ncmlkSGVhZGVyQ2VsbERlZicsXG4gICAgJ3R5cGU6cGJsTmdyaWRIZWFkZXJDZWxsVHlwZURlZicsXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRIZWFkZXJDZWxsRGVmRGlyZWN0aXZlPFQ+IGV4dGVuZHMgUGJsTmdyaWRCYXNlQ2VsbERlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxUPj4ge1xuICBjb25zdHJ1Y3Rvcih0UmVmOiBUZW1wbGF0ZVJlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxUPj4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBsaXN0ZW4gdG8gcHJvcGVydHkgY2hhbmdlcyAobmFtZSkgYW5kIHJlLXJlZ2lzdGVyIGNlbGxcbiAgICB0aGlzLnJlZ2lzdHJ5LmFkZE11bHRpKCdoZWFkZXJDZWxsJywgdGhpcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdHJ5LnJlbW92ZU11bHRpKCdoZWFkZXJDZWxsJywgdGhpcyk7XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCB7XG4gICAgaGVhZGVyQ2VsbD86IFBibE5ncmlkSGVhZGVyQ2VsbERlZkRpcmVjdGl2ZTxhbnk+O1xuICB9XG59XG4iXX0=