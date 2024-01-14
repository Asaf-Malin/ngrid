import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./drag-and-drop/column/column-drag";
import * as i2 from "./drag-and-drop/column/cell-dragger-ref";
import * as i3 from "./column-resize/column-resize.component";
import * as i4 from "./column-resize/cell-resizer-ref";
export class DragPluginDefaultTemplatesComponent {
}
/** @nocollapse */ DragPluginDefaultTemplatesComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: DragPluginDefaultTemplatesComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ DragPluginDefaultTemplatesComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: DragPluginDefaultTemplatesComponent, selector: "pbl-drag-plugin-default-templates", ngImport: i0, template: `<pbl-ngrid-drag-resize *pblNgridCellResizerRef="let ctx" [context]="ctx"></pbl-ngrid-drag-resize>
<span *pblNgridCellDraggerRef="let ctx" [pblNgridColumnDrag]="ctx.col" cdkDragRootElementClass="cdk-drag"></span>`, isInline: true, dependencies: [{ kind: "directive", type: i1.PblNgridColumnDragDirective, selector: "[pblNgridColumnDrag]", inputs: ["pblNgridColumnDrag"], exportAs: ["pblNgridColumnDrag"] }, { kind: "directive", type: i2.PblNgridCellDraggerRefDirective, selector: "[pblNgridCellDraggerRef]" }, { kind: "component", type: i3.PblNgridDragResizeComponent, selector: "pbl-ngrid-drag-resize", inputs: ["context", "grabAreaWidth"] }, { kind: "directive", type: i4.PblNgridCellResizerRefDirective, selector: "[pblNgridCellResizerRef]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: DragPluginDefaultTemplatesComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-drag-plugin-default-templates',
                    template: `<pbl-ngrid-drag-resize *pblNgridCellResizerRef="let ctx" [context]="ctx"></pbl-ngrid-drag-resize>
<span *pblNgridCellDraggerRef="let ctx" [pblNgridColumnDrag]="ctx.col" cdkDragRootElementClass="cdk-drag"></span>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1zZXR0aW5ncy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9kZWZhdWx0LXNldHRpbmdzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7QUFVdEYsTUFBTSxPQUFPLG1DQUFtQzs7bUpBQW5DLG1DQUFtQzt1SUFBbkMsbUNBQW1DLHlFQUxoRDtrSEFDa0g7MkZBSXJHLG1DQUFtQztrQkFSL0MsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsbUNBQW1DO29CQUM3QyxRQUFRLEVBQ1Y7a0hBQ2tIO29CQUNoSCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLWRyYWctcGx1Z2luLWRlZmF1bHQtdGVtcGxhdGVzJyxcbiAgdGVtcGxhdGU6XG5gPHBibC1uZ3JpZC1kcmFnLXJlc2l6ZSAqcGJsTmdyaWRDZWxsUmVzaXplclJlZj1cImxldCBjdHhcIiBbY29udGV4dF09XCJjdHhcIj48L3BibC1uZ3JpZC1kcmFnLXJlc2l6ZT5cbjxzcGFuICpwYmxOZ3JpZENlbGxEcmFnZ2VyUmVmPVwibGV0IGN0eFwiIFtwYmxOZ3JpZENvbHVtbkRyYWddPVwiY3R4LmNvbFwiIGNka0RyYWdSb290RWxlbWVudENsYXNzPVwiY2RrLWRyYWdcIj48L3NwYW4+YCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIERyYWdQbHVnaW5EZWZhdWx0VGVtcGxhdGVzQ29tcG9uZW50IHt9XG4iXX0=