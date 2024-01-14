import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridBaseCellDef } from './base-cell-def.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
export class PblNgridEditorCellDefDirective extends PblNgridBaseCellDef {
    constructor(tRef, registry) { super(tRef, registry); }
    ngOnInit() {
        // TODO: listen to property changes (name) and re-register cell
        this.registry.addMulti('editorCell', this);
    }
    ngOnDestroy() {
        this.registry.removeMulti('editorCell', this);
    }
}
/** @nocollapse */ PblNgridEditorCellDefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridEditorCellDefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridEditorCellDefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridEditorCellDefDirective, selector: "[pblNgridCellEditorDef], [pblNgridCellEditorTypeDef]", inputs: { name: ["pblNgridCellEditorDef", "name"], type: ["pblNgridCellEditorTypeDef", "type"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridEditorCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridCellEditorDef], [pblNgridCellEditorTypeDef]',
                    inputs: [
                        'name:pblNgridCellEditorDef',
                        'type:pblNgridCellEditorTypeDef',
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1jZWxsLWRlZi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jZWxsL2NlbGwtZGVmL2VkaXQtY2VsbC1kZWYuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3ZELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRTFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDOzs7QUFTaEUsTUFBTSxPQUFPLDhCQUF3RixTQUFRLG1CQUE4QztJQUV6SixZQUFZLElBQThDLEVBQUUsUUFBaUMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6SCxRQUFRO1FBQ04sK0RBQStEO1FBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDOzs4SUFYVSw4QkFBOEI7a0lBQTlCLDhCQUE4QjsyRkFBOUIsOEJBQThCO2tCQVAxQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxzREFBc0Q7b0JBQ2hFLE1BQU0sRUFBRTt3QkFDTiw0QkFBNEI7d0JBQzVCLGdDQUFnQztxQkFDakM7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIFRlbXBsYXRlUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYmxDb2x1bW5UeXBlRGVmaW5pdGlvbkRhdGFNYXAgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uLy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsQ29udGV4dCB9IGZyb20gJy4uLy4uL2NvbnRleHQvaW5kZXgnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlQ2VsbERlZiB9IGZyb20gJy4vYmFzZS1jZWxsLWRlZi5kaXJlY3RpdmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGJsTmdyaWRDZWxsRWRpdG9yRGVmXSwgW3BibE5ncmlkQ2VsbEVkaXRvclR5cGVEZWZdJyxcbiAgaW5wdXRzOiBbXG4gICAgJ25hbWU6cGJsTmdyaWRDZWxsRWRpdG9yRGVmJyxcbiAgICAndHlwZTpwYmxOZ3JpZENlbGxFZGl0b3JUeXBlRGVmJyxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZEVkaXRvckNlbGxEZWZEaXJlY3RpdmU8VCwgUCBleHRlbmRzIGtleW9mIFBibENvbHVtblR5cGVEZWZpbml0aW9uRGF0YU1hcCA9IGFueT4gZXh0ZW5kcyBQYmxOZ3JpZEJhc2VDZWxsRGVmPFBibE5ncmlkQ2VsbENvbnRleHQ8VCwgUD4+IHtcbiAgdHlwZTogUDtcbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWRDZWxsQ29udGV4dDxhbnksIFA+PiwgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IHN1cGVyKHRSZWYsIHJlZ2lzdHJ5KTsgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIFRPRE86IGxpc3RlbiB0byBwcm9wZXJ0eSBjaGFuZ2VzIChuYW1lKSBhbmQgcmUtcmVnaXN0ZXIgY2VsbFxuICAgIHRoaXMucmVnaXN0cnkuYWRkTXVsdGkoJ2VkaXRvckNlbGwnLCB0aGlzKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0cnkucmVtb3ZlTXVsdGkoJ2VkaXRvckNlbGwnLCB0aGlzKTtcbiAgfVxufVxuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9jb3JlL2xpYi9yZWdpc3RyeS90eXBlcycge1xuICBpbnRlcmZhY2UgUGJsTmdyaWRNdWx0aVJlZ2lzdHJ5TWFwIHtcbiAgICBlZGl0b3JDZWxsPzogUGJsTmdyaWRFZGl0b3JDZWxsRGVmRGlyZWN0aXZlPGFueT47XG4gIH1cbn1cbiJdfQ==