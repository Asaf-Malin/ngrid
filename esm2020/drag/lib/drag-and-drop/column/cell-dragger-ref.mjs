import { Directive, TemplateRef } from '@angular/core';
import { PblNgridRegistryService, PblNgridMultiTemplateRegistry, PblNgridPluginController } from '@pebula/ngrid';
import { COL_DRAG_CONTAINER_PLUGIN_KEY } from './column-drag-container';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
/**
 * Marks the element as the resizer template for cells.
 */
export class PblNgridCellDraggerRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'cellDragger';
        this.kind = 'dataHeaderExtensions';
    }
    shouldRender(context) {
        // We dont check for `context.col.reorder` because even if a specific column does not "reorder" we still need to render the cdk-drag
        // so the cdk-drop-list will be aware of this item, so if another item does reorder it will be able to move while taking this element into consideration.
        // I.E: It doesn't reorder but it's part of the playground.
        //
        // However, when the plugin does not exists for this table we don't need to render...
        const pluginCtrl = PblNgridPluginController.find(context.grid);
        return pluginCtrl.hasPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY);
    }
}
/** @nocollapse */ PblNgridCellDraggerRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDraggerRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellDraggerRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellDraggerRefDirective, selector: "[pblNgridCellDraggerRef]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellDraggerRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridCellDraggerRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1kcmFnZ2VyLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvZHJhZy9zcmMvbGliL2RyYWctYW5kLWRyb3AvY29sdW1uL2NlbGwtZHJhZ2dlci1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUNMLHVCQUF1QixFQUN2Qiw2QkFBNkIsRUFHN0Isd0JBQXdCLEVBQ3pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7QUFFeEU7O0dBRUc7QUFFSCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsNkJBQXlGO0lBRzVJLFlBQVksSUFBcUQsRUFBRSxRQUFpQztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFGckgsU0FBSSxHQUFrQixhQUFhLENBQUM7UUFDcEMsU0FBSSxHQUEyQixzQkFBc0IsQ0FBQztJQUNnRSxDQUFDO0lBRWhJLFlBQVksQ0FBQyxPQUEyQztRQUN0RCxvSUFBb0k7UUFDcEkseUpBQXlKO1FBQ3pKLDJEQUEyRDtRQUMzRCxFQUFFO1FBQ0YscUZBQXFGO1FBRXJGLE1BQU0sVUFBVSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsT0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDN0QsQ0FBQzs7K0lBZFUsK0JBQStCO21JQUEvQiwrQkFBK0I7MkZBQS9CLCtCQUErQjtrQkFEM0MsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgVGVtcGxhdGVSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlLFxuICBQYmxOZ3JpZE11bHRpVGVtcGxhdGVSZWdpc3RyeSxcbiAgUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uUmVmLFxuICBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0LFxuICBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXJcbn0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmltcG9ydCB7IENPTF9EUkFHX0NPTlRBSU5FUl9QTFVHSU5fS0VZIH0gZnJvbSAnLi9jb2x1bW4tZHJhZy1jb250YWluZXInO1xuXG4vKipcbiAqIE1hcmtzIHRoZSBlbGVtZW50IGFzIHRoZSByZXNpemVyIHRlbXBsYXRlIGZvciBjZWxscy5cbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW3BibE5ncmlkQ2VsbERyYWdnZXJSZWZdJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ2VsbERyYWdnZXJSZWZEaXJlY3RpdmUgZXh0ZW5kcyBQYmxOZ3JpZE11bHRpVGVtcGxhdGVSZWdpc3RyeTxQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0LCAnZGF0YUhlYWRlckV4dGVuc2lvbnMnPiBpbXBsZW1lbnRzIFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvblJlZiB7XG4gIHJlYWRvbmx5IG5hbWU6ICdjZWxsRHJhZ2dlcicgPSAnY2VsbERyYWdnZXInO1xuICByZWFkb25seSBraW5kOiAnZGF0YUhlYWRlckV4dGVuc2lvbnMnID0gJ2RhdGFIZWFkZXJFeHRlbnNpb25zJztcbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dD4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cblxuICBzaG91bGRSZW5kZXIoY29udGV4dDogUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dCk6IGJvb2xlYW4ge1xuICAgIC8vIFdlIGRvbnQgY2hlY2sgZm9yIGBjb250ZXh0LmNvbC5yZW9yZGVyYCBiZWNhdXNlIGV2ZW4gaWYgYSBzcGVjaWZpYyBjb2x1bW4gZG9lcyBub3QgXCJyZW9yZGVyXCIgd2Ugc3RpbGwgbmVlZCB0byByZW5kZXIgdGhlIGNkay1kcmFnXG4gICAgLy8gc28gdGhlIGNkay1kcm9wLWxpc3Qgd2lsbCBiZSBhd2FyZSBvZiB0aGlzIGl0ZW0sIHNvIGlmIGFub3RoZXIgaXRlbSBkb2VzIHJlb3JkZXIgaXQgd2lsbCBiZSBhYmxlIHRvIG1vdmUgd2hpbGUgdGFraW5nIHRoaXMgZWxlbWVudCBpbnRvIGNvbnNpZGVyYXRpb24uXG4gICAgLy8gSS5FOiBJdCBkb2Vzbid0IHJlb3JkZXIgYnV0IGl0J3MgcGFydCBvZiB0aGUgcGxheWdyb3VuZC5cbiAgICAvL1xuICAgIC8vIEhvd2V2ZXIsIHdoZW4gdGhlIHBsdWdpbiBkb2VzIG5vdCBleGlzdHMgZm9yIHRoaXMgdGFibGUgd2UgZG9uJ3QgbmVlZCB0byByZW5kZXIuLi5cblxuICAgIGNvbnN0IHBsdWdpbkN0cmwgPSBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZChjb250ZXh0LmdyaWQpO1xuICAgIHJldHVybiBwbHVnaW5DdHJsLmhhc1BsdWdpbihDT0xfRFJBR19DT05UQUlORVJfUExVR0lOX0tFWSk7XG4gIH1cbn1cbiJdfQ==