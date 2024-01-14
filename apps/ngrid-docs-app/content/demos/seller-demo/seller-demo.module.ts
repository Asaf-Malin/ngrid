import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { PblNgridRegistryService, PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridDragModule } from '@asafmalin/ngrid/drag';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';
import { PblNgridStickyModule } from '@asafmalin/ngrid/sticky';
import { PblNgridStatePluginModule } from '@asafmalin/ngrid/state';
import { PblNgridOverlayPanelModule } from '@asafmalin/ngrid/overlay-panel';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';
import { PblNgridPaginatorModule } from '@asafmalin/ngrid-material/paginator';
import { PblNgridContextMenuModule } from '@asafmalin/ngrid-material/context-menu';
import { PblNgridCellTooltipModule } from '@asafmalin/ngrid-material/cell-tooltip';
import { PblNgridCheckboxModule } from '@asafmalin/ngrid-material/selection-column';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { CommonGridTemplatesModule, CommonGridTemplatesComponent } from '../common-grid-templates';
import { SellerDemoExample } from './seller-demo.component';

@NgModule({
  declarations: [ SellerDemoExample ],
  imports: [
    CommonModule,
    MatIconModule, MatChipsModule,
    ExampleCommonModule,
    CommonGridTemplatesModule,
    PblNgridModule.withCommon([ { component: CommonGridTemplatesComponent } ]),
    PblNgridDragModule.withDefaultTemplates(),
    PblNgridTargetEventsModule,
    PblNgridBlockUiModule,
    PblNgridStickyModule,
    PblNgridStatePluginModule,
    PblNgridOverlayPanelModule,
    PblNgridMatSortModule,
    PblNgridPaginatorModule,
    PblNgridContextMenuModule,
    PblNgridCellTooltipModule,
    PblNgridCheckboxModule,
  ],
  exports: [ SellerDemoExample ],
  providers: [ PblNgridRegistryService ],
})
@BindNgModule(SellerDemoExample)
export class SellerDemoExampleModule { }
