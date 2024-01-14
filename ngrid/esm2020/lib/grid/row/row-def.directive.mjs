import { Directive, Inject, IterableDiffers, Optional, TemplateRef } from '@angular/core';
import { CdkRowDef, CDK_TABLE } from '@angular/cdk/table';
import { PblNgridRegistryService } from '../registry/registry.service';
import { PblNgridPluginController } from '../../ext/plugin-control';
import { EXT_API_TOKEN } from '../../ext/grid-ext-api';
import * as i0 from "@angular/core";
import * as i1 from "../registry/registry.service";
export class PblNgridRowDef extends CdkRowDef {
    constructor(template, _differs, registry, _table) {
        super(template, _differs, _table);
        this.registry = registry;
        this._table = _table;
        /**
         * Empty rows.
         * We don't supply column rows to the CdkTable so it will not render them.
         * We render internally.
         */
        this.columns = [];
    }
    getColumnsDiff() {
        return null;
    }
    clone() {
        const clone = Object.create(this);
        // Provide 0 column so CdkTable will not render.
        this.columns = [];
        return clone;
    }
}
/** @nocollapse */ PblNgridRowDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: i1.PblNgridRegistryService }, { token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowDef, selector: "[pblNgridRowDef]", inputs: { columns: ["pblNgridRowDefColumns", "columns"], when: ["pblNgridRowDefWhen", "when"] }, providers: [
        { provide: CdkRowDef, useExisting: PblNgridRowDef },
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowDef]',
                    inputs: ['columns: pblNgridRowDefColumns', 'when: pblNgridRowDefWhen'],
                    providers: [
                        { provide: CdkRowDef, useExisting: PblNgridRowDef },
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: i1.PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }]; } });
/**
 * A directive for quick replacements of the row container component.
 *
 * When used inside the content of the grid:
 *
 * ```html
 * <pbl-ngrid [dataSource]="ds" [columns]="columns">
 *   <pbl-ngrid-row *pblNgridRowOverride="let row;" row></pbl-ngrid-row>
 * </pbl-ngrid>
 * ```
 *
 * However, when used outside of the grid you must provide a reference to the grid so it can register as a template:
 *
 * ```html
 * <pbl-ngrid-row *pblNgridRowOverride="let row; grid: myGrid" row></pbl-ngrid-row>
 * <pbl-ngrid #myGrid [dataSource]="ds" [columns]="columns"></pbl-ngrid>
 * ```
 */
export class PblNgridRowOverride extends PblNgridRowDef {
    constructor(template, _differs, registry, extApi) {
        super(template, _differs, registry, extApi?.cdkTable);
        this.extApi = extApi;
        this.when = () => true;
    }
    ngOnInit() {
        if (!this.extApi && this.grid) {
            this.extApi = PblNgridPluginController.find(this.grid).extApi;
        }
        this.extApi?.cdkTable.addRowDef(this);
    }
}
/** @nocollapse */ PblNgridRowOverride.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowOverride, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: i1.PblNgridRegistryService }, { token: EXT_API_TOKEN, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowOverride.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowOverride, selector: "[pblNgridRowOverride]", inputs: { columns: ["pblNgridRowDefColumns", "columns"], when: ["pblNgridRowDefWhen", "when"], grid: ["pblNgridRowDefGrid", "grid"] }, providers: [
        { provide: CdkRowDef, useExisting: PblNgridRowDef },
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowOverride, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowOverride]',
                    inputs: ['columns: pblNgridRowDefColumns', 'when: pblNgridRowDefWhen', 'grid: pblNgridRowDefGrid'],
                    providers: [
                        { provide: CdkRowDef, useExisting: PblNgridRowDef },
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: i1.PblNgridRegistryService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }, {
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LWRlZi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9yb3cvcm93LWRlZi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDbEcsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUcxRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUV2RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUF3QixNQUFNLHdCQUF3QixDQUFDOzs7QUFTN0UsTUFBTSxPQUFPLGNBQWtCLFNBQVEsU0FBWTtJQVNqRCxZQUFZLFFBQTRDLEVBQzVDLFFBQXlCLEVBQ2YsUUFBaUMsRUFDTCxNQUFZO1FBQzVELEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRmQsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFDTCxXQUFNLEdBQU4sTUFBTSxDQUFNO1FBVjlEOzs7O1dBSUc7UUFDSCxZQUFPLEdBQXFCLEVBQUUsQ0FBQztJQU8vQixDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUs7UUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLGdEQUFnRDtRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7OzhIQXpCVSxjQUFjLG1IQVlMLFNBQVM7a0hBWmxCLGNBQWMsNElBSmQ7UUFDVCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQztLQUNsRDsyRkFFVSxjQUFjO2tCQVAxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLE1BQU0sRUFBRSxDQUFDLGdDQUFnQyxFQUFFLDBCQUEwQixDQUFDO29CQUN0RSxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsZ0JBQWdCLEVBQUM7cUJBQ2xEO2lCQUNGOzswQkFhYyxNQUFNOzJCQUFDLFNBQVM7OzBCQUFHLFFBQVE7O0FBZ0IxQzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFRSCxNQUFNLE9BQU8sbUJBQXVCLFNBQVEsY0FBaUI7SUFJM0QsWUFBWSxRQUE0QyxFQUM1QyxRQUF5QixFQUN6QixRQUFpQyxFQUNVLE1BQWdDO1FBQ3JGLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFERCxXQUFNLEdBQU4sTUFBTSxDQUEwQjtRQUVyRixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUMvRDtRQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDOzttSUFqQlUsbUJBQW1CLG1IQU9WLGFBQWE7dUhBUHRCLG1CQUFtQix1TEFKbkI7UUFDVCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQztLQUNsRDsyRkFFVSxtQkFBbUI7a0JBUC9CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsTUFBTSxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsMEJBQTBCLEVBQUUsMEJBQTBCLENBQUM7b0JBQ2xHLFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQztxQkFDbEQ7aUJBQ0Y7OzBCQVFjLE1BQU07MkJBQUMsYUFBYTs7MEJBQUcsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBJdGVyYWJsZURpZmZlcnMsIE9wdGlvbmFsLCBUZW1wbGF0ZVJlZiwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDZGtSb3dEZWYsIENES19UQUJMRSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRSb3dDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC90eXBlcyc7XG5pbXBvcnQgeyBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIgfSBmcm9tICcuLi8uLi9leHQvcGx1Z2luLWNvbnRyb2wnO1xuaW1wb3J0IHsgRVhUX0FQSV9UT0tFTiwgUGJsTmdyaWRFeHRlbnNpb25BcGkgfSBmcm9tICcuLi8uLi9leHQvZ3JpZC1leHQtYXBpJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkUm93RGVmXScsXG4gIGlucHV0czogWydjb2x1bW5zOiBwYmxOZ3JpZFJvd0RlZkNvbHVtbnMnLCAnd2hlbjogcGJsTmdyaWRSb3dEZWZXaGVuJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtSb3dEZWYsIHVzZUV4aXN0aW5nOiBQYmxOZ3JpZFJvd0RlZn0sXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRSb3dEZWY8VD4gZXh0ZW5kcyBDZGtSb3dEZWY8VD4ge1xuXG4gIC8qKlxuICAgKiBFbXB0eSByb3dzLlxuICAgKiBXZSBkb24ndCBzdXBwbHkgY29sdW1uIHJvd3MgdG8gdGhlIENka1RhYmxlIHNvIGl0IHdpbGwgbm90IHJlbmRlciB0aGVtLlxuICAgKiBXZSByZW5kZXIgaW50ZXJuYWxseS5cbiAgICovXG4gIGNvbHVtbnM6IEl0ZXJhYmxlPHN0cmluZz4gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8UGJsTmdyaWRSb3dDb250ZXh0PFQ+PixcbiAgICAgICAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSxcbiAgICAgICAgICAgICAgQEluamVjdChDREtfVEFCTEUpIEBPcHRpb25hbCgpIHB1YmxpYyBfdGFibGU/OiBhbnkpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgX2RpZmZlcnMsIF90YWJsZSk7XG4gIH1cblxuICBnZXRDb2x1bW5zRGlmZigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IGNsb25lID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAvLyBQcm92aWRlIDAgY29sdW1uIHNvIENka1RhYmxlIHdpbGwgbm90IHJlbmRlci5cbiAgICB0aGlzLmNvbHVtbnMgPSBbXTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBmb3IgcXVpY2sgcmVwbGFjZW1lbnRzIG9mIHRoZSByb3cgY29udGFpbmVyIGNvbXBvbmVudC5cbiAqXG4gKiBXaGVuIHVzZWQgaW5zaWRlIHRoZSBjb250ZW50IG9mIHRoZSBncmlkOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxwYmwtbmdyaWQgW2RhdGFTb3VyY2VdPVwiZHNcIiBbY29sdW1uc109XCJjb2x1bW5zXCI+XG4gKiAgIDxwYmwtbmdyaWQtcm93ICpwYmxOZ3JpZFJvd092ZXJyaWRlPVwibGV0IHJvdztcIiByb3c+PC9wYmwtbmdyaWQtcm93PlxuICogPC9wYmwtbmdyaWQ+XG4gKiBgYGBcbiAqXG4gKiBIb3dldmVyLCB3aGVuIHVzZWQgb3V0c2lkZSBvZiB0aGUgZ3JpZCB5b3UgbXVzdCBwcm92aWRlIGEgcmVmZXJlbmNlIHRvIHRoZSBncmlkIHNvIGl0IGNhbiByZWdpc3RlciBhcyBhIHRlbXBsYXRlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxwYmwtbmdyaWQtcm93ICpwYmxOZ3JpZFJvd092ZXJyaWRlPVwibGV0IHJvdzsgZ3JpZDogbXlHcmlkXCIgcm93PjwvcGJsLW5ncmlkLXJvdz5cbiAqIDxwYmwtbmdyaWQgI215R3JpZCBbZGF0YVNvdXJjZV09XCJkc1wiIFtjb2x1bW5zXT1cImNvbHVtbnNcIj48L3BibC1uZ3JpZD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGJsTmdyaWRSb3dPdmVycmlkZV0nLFxuICBpbnB1dHM6IFsnY29sdW1uczogcGJsTmdyaWRSb3dEZWZDb2x1bW5zJywgJ3doZW46IHBibE5ncmlkUm93RGVmV2hlbicsICdncmlkOiBwYmxOZ3JpZFJvd0RlZkdyaWQnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka1Jvd0RlZiwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkUm93RGVmfSxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZFJvd092ZXJyaWRlPFQ+IGV4dGVuZHMgUGJsTmdyaWRSb3dEZWY8VD4gaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIGdyaWQ6IF9QYmxOZ3JpZENvbXBvbmVudDxUPjtcblxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8UGJsTmdyaWRSb3dDb250ZXh0PFQ+PixcbiAgICAgICAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICAgICAgICAgICAgcmVnaXN0cnk6IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLFxuICAgICAgICAgICAgICBASW5qZWN0KEVYVF9BUElfVE9LRU4pIEBPcHRpb25hbCgpIHByaXZhdGUgZXh0QXBpPzogUGJsTmdyaWRFeHRlbnNpb25BcGk8VD4pIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgX2RpZmZlcnMsIHJlZ2lzdHJ5LCBleHRBcGk/LmNka1RhYmxlKTtcbiAgICB0aGlzLndoZW4gPSAoKSA9PiB0cnVlO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLmV4dEFwaSAmJiB0aGlzLmdyaWQpIHtcbiAgICAgIHRoaXMuZXh0QXBpID0gUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmQodGhpcy5ncmlkKS5leHRBcGk7XG4gICAgfVxuICAgIHRoaXMuZXh0QXBpPy5jZGtUYWJsZS5hZGRSb3dEZWYodGhpcyk7XG4gIH1cbn1cbiJdfQ==