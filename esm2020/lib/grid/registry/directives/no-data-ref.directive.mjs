import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService } from '../registry.service';
import { PblNgridSingleTemplateRegistry } from './single-template.directives';
import * as i0 from "@angular/core";
import * as i1 from "../registry.service";
/**
 * Marks the element as the display element when grid has no data.
 *
 * @example
 * ```html
 *   <pbl-ngrid>
 *     <div *pblNgridNoDataRef style="height: 100%; display: flex; align-items: center; justify-content: center">
 *       <span>No Data</span>
 *     </div>
 *   </pbl-ngrid>
 * ```
 */
export class PblNgridNoDataRefDirective extends PblNgridSingleTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'noData';
    }
}
/** @nocollapse */ PblNgridNoDataRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridNoDataRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridNoDataRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridNoDataRefDirective, selector: "[pblNgridNoDataRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridNoDataRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridNoDataRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8tZGF0YS1yZWYuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvcmVnaXN0cnkvZGlyZWN0aXZlcy9uby1kYXRhLXJlZi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHdkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDOUQsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sOEJBQThCLENBQUM7OztBQUU5RTs7Ozs7Ozs7Ozs7R0FXRztBQUVILE1BQU0sT0FBTywwQkFBMkIsU0FBUSw4QkFBZ0Y7SUFFOUgsWUFBWSxJQUF5RCxFQUFFLFFBQWlDO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUR6SCxTQUFJLEdBQWEsUUFBUSxDQUFDO0lBQ2dHLENBQUM7OzBJQUZ6SCwwQkFBMEI7OEhBQTFCLDBCQUEwQjsyRkFBMUIsMEJBQTBCO2tCQUR0QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBfUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi90b2tlbnMnO1xuaW1wb3J0IHsgUGJsTmdyaWRSZWdpc3RyeVNlcnZpY2UgfSBmcm9tICcuLi9yZWdpc3RyeS5zZXJ2aWNlJztcbmltcG9ydCB7IFBibE5ncmlkU2luZ2xlVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gJy4vc2luZ2xlLXRlbXBsYXRlLmRpcmVjdGl2ZXMnO1xuXG4vKipcbiAqIE1hcmtzIHRoZSBlbGVtZW50IGFzIHRoZSBkaXNwbGF5IGVsZW1lbnQgd2hlbiBncmlkIGhhcyBubyBkYXRhLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBodG1sXG4gKiAgIDxwYmwtbmdyaWQ+XG4gKiAgICAgPGRpdiAqcGJsTmdyaWROb0RhdGFSZWYgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyXCI+XG4gKiAgICAgICA8c3Bhbj5ObyBEYXRhPC9zcGFuPlxuICogICAgIDwvZGl2PlxuICogICA8L3BibC1uZ3JpZD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbcGJsTmdyaWROb0RhdGFSZWZdJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkTm9EYXRhUmVmRGlyZWN0aXZlIGV4dGVuZHMgUGJsTmdyaWRTaW5nbGVUZW1wbGF0ZVJlZ2lzdHJ5PHsgJGltcGxpY2l0OiBfUGJsTmdyaWRDb21wb25lbnQ8YW55PiB9LCAnbm9EYXRhJz4ge1xuICByZWFkb25seSBraW5kOiAnbm9EYXRhJyA9ICdub0RhdGEnO1xuICBjb25zdHJ1Y3Rvcih0UmVmOiBUZW1wbGF0ZVJlZjx7ICRpbXBsaWNpdDogX1BibE5ncmlkQ29tcG9uZW50PGFueT4gfT4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkU2luZ2xlUmVnaXN0cnlNYXAge1xuICAgIG5vRGF0YT86IFBibE5ncmlkTm9EYXRhUmVmRGlyZWN0aXZlO1xuICB9XG59XG4iXX0=