// tslint:disable:use-input-property-decorator
import { Directive, TemplateRef, } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
export class PblNgridBaseCellDef {
    constructor(tRef, registry) {
        this.tRef = tRef;
        this.registry = registry;
    }
}
/** @nocollapse */ PblNgridBaseCellDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCellDef, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseCellDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseCellDef, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCellDef, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1jZWxsLWRlZi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jZWxsL2NlbGwtZGVmL2Jhc2UtY2VsbC1kZWYuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDhDQUE4QztBQUM5QyxPQUFPLEVBQ0wsU0FBUyxFQUNULFdBQVcsR0FHWixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7O0FBSTFFLE1BQU0sT0FBZ0IsbUJBQW1CO0lBSXZDLFlBQW1CLElBQW9CLEVBQ2pCLFFBQWlDO1FBRHBDLFNBQUksR0FBSixJQUFJLENBQWdCO1FBQ2pCLGFBQVEsR0FBUixRQUFRLENBQXlCO0lBQUksQ0FBQzs7bUlBTHhDLG1CQUFtQjt1SEFBbkIsbUJBQW1COzJGQUFuQixtQkFBbUI7a0JBRHhDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0c2xpbnQ6ZGlzYWJsZTp1c2UtaW5wdXQtcHJvcGVydHktZGVjb3JhdG9yXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIFRlbXBsYXRlUmVmLFxuICBPbkluaXQsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYmxDb2x1bW5UeXBlRGVmaW5pdGlvbkRhdGFNYXAgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgfSBmcm9tICcuLi8uLi9yZWdpc3RyeS9yZWdpc3RyeS5zZXJ2aWNlJztcbmltcG9ydCB7IFBibE5ncmlkQ2VsbERlZkRpcmVjdGl2ZUJhc2UgfSBmcm9tICcuL3R5cGVzJztcblxuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGJsTmdyaWRCYXNlQ2VsbERlZjxaPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95LCBQYmxOZ3JpZENlbGxEZWZEaXJlY3RpdmVCYXNlIHtcbiAgbmFtZTogc3RyaW5nO1xuICB0eXBlOiBrZXlvZiBQYmxDb2x1bW5UeXBlRGVmaW5pdGlvbkRhdGFNYXA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRSZWY6IFRlbXBsYXRlUmVmPFo+LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlKSB7IH1cblxuICBhYnN0cmFjdCBuZ09uSW5pdCgpOiB2b2lkO1xuICBhYnN0cmFjdCBuZ09uRGVzdHJveSgpOiB2b2lkO1xufVxuIl19