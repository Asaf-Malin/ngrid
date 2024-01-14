import { ModuleWithProviders } from '@angular/core';
import './drag-and-drop/column/extend-grid';
import './column-resize/extend-grid';
import * as i0 from "@angular/core";
import * as i1 from "./default-settings.component";
import * as i2 from "./drag-and-drop/core/drop-list";
import * as i3 from "./drag-and-drop/core/drag";
import * as i4 from "./drag-and-drop/core/drag-handle";
import * as i5 from "./drag-and-drop/row/row-reorder-plugin";
import * as i6 from "./drag-and-drop/row/row-drag";
import * as i7 from "./drag-and-drop/column/column-drag-container";
import * as i8 from "./drag-and-drop/column/column-drop-container";
import * as i9 from "./drag-and-drop/column/column-reorder-plugin";
import * as i10 from "./drag-and-drop/column/column-drag";
import * as i11 from "./drag-and-drop/column/cell-dragger-ref";
import * as i12 from "./drag-and-drop/column/aggregation-column";
import * as i13 from "./column-resize/column-resize.component";
import * as i14 from "./column-resize/cell-resizer-ref";
import * as i15 from "@angular/common";
import * as i16 from "@asafmalin/ngrid";
import * as i17 from "@angular/cdk/drag-drop";
export declare function ngridPlugins(): never[];
export declare class PblNgridDragModule {
    static readonly NGRID_PLUGIN: never[];
    static withDefaultTemplates(): ModuleWithProviders<PblNgridDragModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDragModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PblNgridDragModule, [typeof i1.DragPluginDefaultTemplatesComponent, typeof i2.CdkLazyDropList, typeof i3.CdkLazyDrag, typeof i4.PblDragHandle, typeof i5.PblNgridRowReorderPluginDirective, typeof i6.PblNgridRowDragDirective, typeof i7.PblNgridColumnDragContainerDirective, typeof i8.PblNgridColumnDropContainerDirective, typeof i9.PblNgridColumnReorderPluginDirective, typeof i10.PblNgridColumnDragDirective, typeof i11.PblNgridCellDraggerRefDirective, typeof i12.PblNgridAggregationContainerDirective, typeof i13.PblNgridDragResizeComponent, typeof i14.PblNgridCellResizerRefDirective], [typeof i15.CommonModule, typeof i16.PblNgridModule, typeof i17.DragDropModule], [typeof i17.DragDropModule, typeof i2.CdkLazyDropList, typeof i3.CdkLazyDrag, typeof i4.PblDragHandle, typeof i5.PblNgridRowReorderPluginDirective, typeof i6.PblNgridRowDragDirective, typeof i7.PblNgridColumnDragContainerDirective, typeof i8.PblNgridColumnDropContainerDirective, typeof i9.PblNgridColumnReorderPluginDirective, typeof i10.PblNgridColumnDragDirective, typeof i11.PblNgridCellDraggerRefDirective, typeof i12.PblNgridAggregationContainerDirective, typeof i13.PblNgridDragResizeComponent, typeof i14.PblNgridCellResizerRefDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PblNgridDragModule>;
}
