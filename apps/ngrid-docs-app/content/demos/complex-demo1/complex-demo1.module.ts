import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { PblNgridRegistryService, PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridDragModule } from '@asafmalin/ngrid/drag';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';
import { PblNgridStickyModule } from '@asafmalin/ngrid/sticky';
import { PblNgridStatePluginModule } from '@asafmalin/ngrid/state';
import { PblNgridTransposeModule } from '@asafmalin/ngrid/transpose';
import { PblNgridDetailRowModule } from '@asafmalin/ngrid/detail-row';
import { PblNgridOverlayPanelModule } from '@asafmalin/ngrid/overlay-panel';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';
import { PblNgridPaginatorModule } from '@asafmalin/ngrid-material/paginator';
import { PblNgridContextMenuModule } from '@asafmalin/ngrid-material/context-menu';
import { PblNgridCellTooltipModule } from '@asafmalin/ngrid-material/cell-tooltip';
import { PblNgridCheckboxModule } from '@asafmalin/ngrid-material/selection-column';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { CommonGridTemplatesModule, CommonGridTemplatesComponent } from '../common-grid-templates';
import { ComplexDemo1Example } from './complex-demo1.component';

@NgModule({
  declarations: [ ComplexDemo1Example ],
  imports: [
    CommonModule,
    MatFormFieldModule, MatSelectModule, MatProgressBarModule, MatSlideToggleModule, MatCheckboxModule, MatRadioModule,

    ExampleCommonModule,
    CommonGridTemplatesModule,

    PblNgridModule.withCommon([ { component: CommonGridTemplatesComponent } ]),
    PblNgridDragModule.withDefaultTemplates(),
    PblNgridTargetEventsModule,
    PblNgridBlockUiModule,
    PblNgridStickyModule,
    PblNgridStatePluginModule,
    PblNgridTransposeModule,
    PblNgridDetailRowModule,
    PblNgridOverlayPanelModule,
    PblNgridMatSortModule,
    PblNgridPaginatorModule,
    PblNgridContextMenuModule,
    PblNgridCellTooltipModule,
    PblNgridCheckboxModule,
  ],
  exports: [ ComplexDemo1Example ],
  providers: [ PblNgridRegistryService ],
})
@BindNgModule(ComplexDemo1Example)
export class ComplexDemo1ExampleModule { }
