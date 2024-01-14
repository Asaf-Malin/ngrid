// tslint:disable:use-input-property-decorator
import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
/**
 * Cell definition for the pbl-ngrid.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 *
 * `pblNgridCellDef` does the same thing that `matCellDef` and `cdkCellDef` do with one difference, `pblNgridCellDef` is
 * independent and does not require a column definition parent, instead it accept the ID of the cell.
 *
 * NOTE: Defining '*' as id will declare the cell template as default, replacing the table's default cell template.
 *
 * Make sure you set the proper id of the property you want to override.
 * When the `id` is set explicitly in the table column definition, this is not a problem but when if it's not set
 * the table generates a unique id based on a logic. If `name` is set the name is used, if no name is set
 * the `prop` is used (full with dot notation).
 */
export class PblNgridCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('tableCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('tableCell', this);
    }
}
/** @nocollapse */ PblNgridCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellDefDirective, selector: "[pblNgridCellDef], [pblNgridCellTypeDef]", inputs: { name: ["pblNgridCellDef", "name"], type: ["pblNgridCellTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridCellDef], [pblNgridCellTypeDef]',
                    inputs: [
                        'name:pblNgridCellDef',
                        'type:pblNgridCellTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1kZWYuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY2VsbC9jZWxsLWRlZi9jZWxsLWRlZi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOENBQThDO0FBQzlDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3ZELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRTFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDOzs7QUFFaEU7Ozs7Ozs7Ozs7Ozs7R0FhRztBQVFILE1BQU0sT0FBTyx3QkFBa0YsU0FBUSxtQkFBOEM7SUFFbkosWUFBWSxJQUE4QyxFQUFFLFFBQWlDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFekgsUUFBUTtRQUNOLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQzs7d0lBWFUsd0JBQXdCOzRIQUF4Qix3QkFBd0I7MkZBQXhCLHdCQUF3QjtrQkFQcEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsMENBQTBDO29CQUNwRCxNQUFNLEVBQUU7d0JBQ04sc0JBQXNCO3dCQUN0QiwwQkFBMEI7cUJBQzNCO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6dXNlLWlucHV0LXByb3BlcnR5LWRlY29yYXRvclxuaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsQ29sdW1uVHlwZURlZmluaXRpb25EYXRhTWFwIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgfSBmcm9tICcuLi8uLi9yZWdpc3RyeS9yZWdpc3RyeS5zZXJ2aWNlJztcbmltcG9ydCB7IFBibE5ncmlkQ2VsbENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0L2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQmFzZUNlbGxEZWYgfSBmcm9tICcuL2Jhc2UtY2VsbC1kZWYuZGlyZWN0aXZlJztcblxuLyoqXG4gKiBDZWxsIGRlZmluaXRpb24gZm9yIHRoZSBwYmwtbmdyaWQuXG4gKiBDYXB0dXJlcyB0aGUgdGVtcGxhdGUgb2YgYSBjb2x1bW4ncyBkYXRhIHJvdyBjZWxsIGFzIHdlbGwgYXMgY2VsbC1zcGVjaWZpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIGBwYmxOZ3JpZENlbGxEZWZgIGRvZXMgdGhlIHNhbWUgdGhpbmcgdGhhdCBgbWF0Q2VsbERlZmAgYW5kIGBjZGtDZWxsRGVmYCBkbyB3aXRoIG9uZSBkaWZmZXJlbmNlLCBgcGJsTmdyaWRDZWxsRGVmYCBpc1xuICogaW5kZXBlbmRlbnQgYW5kIGRvZXMgbm90IHJlcXVpcmUgYSBjb2x1bW4gZGVmaW5pdGlvbiBwYXJlbnQsIGluc3RlYWQgaXQgYWNjZXB0IHRoZSBJRCBvZiB0aGUgY2VsbC5cbiAqXG4gKiBOT1RFOiBEZWZpbmluZyAnKicgYXMgaWQgd2lsbCBkZWNsYXJlIHRoZSBjZWxsIHRlbXBsYXRlIGFzIGRlZmF1bHQsIHJlcGxhY2luZyB0aGUgdGFibGUncyBkZWZhdWx0IGNlbGwgdGVtcGxhdGUuXG4gKlxuICogTWFrZSBzdXJlIHlvdSBzZXQgdGhlIHByb3BlciBpZCBvZiB0aGUgcHJvcGVydHkgeW91IHdhbnQgdG8gb3ZlcnJpZGUuXG4gKiBXaGVuIHRoZSBgaWRgIGlzIHNldCBleHBsaWNpdGx5IGluIHRoZSB0YWJsZSBjb2x1bW4gZGVmaW5pdGlvbiwgdGhpcyBpcyBub3QgYSBwcm9ibGVtIGJ1dCB3aGVuIGlmIGl0J3Mgbm90IHNldFxuICogdGhlIHRhYmxlIGdlbmVyYXRlcyBhIHVuaXF1ZSBpZCBiYXNlZCBvbiBhIGxvZ2ljLiBJZiBgbmFtZWAgaXMgc2V0IHRoZSBuYW1lIGlzIHVzZWQsIGlmIG5vIG5hbWUgaXMgc2V0XG4gKiB0aGUgYHByb3BgIGlzIHVzZWQgKGZ1bGwgd2l0aCBkb3Qgbm90YXRpb24pLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGJsTmdyaWRDZWxsRGVmXSwgW3BibE5ncmlkQ2VsbFR5cGVEZWZdJyxcbiAgaW5wdXRzOiBbXG4gICAgJ25hbWU6cGJsTmdyaWRDZWxsRGVmJyxcbiAgICAndHlwZTpwYmxOZ3JpZENlbGxUeXBlRGVmJyxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENlbGxEZWZEaXJlY3RpdmU8VCwgUCBleHRlbmRzIGtleW9mIFBibENvbHVtblR5cGVEZWZpbml0aW9uRGF0YU1hcCA9IGFueT4gZXh0ZW5kcyBQYmxOZ3JpZEJhc2VDZWxsRGVmPFBibE5ncmlkQ2VsbENvbnRleHQ8VCwgUD4+IHtcbiAgdHlwZTogUDtcbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWRDZWxsQ29udGV4dDxhbnksIFA+PiwgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IHN1cGVyKHRSZWYsIHJlZ2lzdHJ5KTsgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIFRPRE86IGxpc3RlbiB0byBwcm9wZXJ0eSBjaGFuZ2VzIChuYW1lKSBhbmQgcmUtcmVnaXN0ZXIgY2VsbFxuICAgIHRoaXMucmVnaXN0cnkuYWRkTXVsdGkoJ3RhYmxlQ2VsbCcsIHRoaXMpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RyeS5yZW1vdmVNdWx0aSgndGFibGVDZWxsJywgdGhpcyk7XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCB7XG4gICAgdGFibGVDZWxsPzogUGJsTmdyaWRDZWxsRGVmRGlyZWN0aXZlPGFueT47XG4gIH1cbn1cbiJdfQ==