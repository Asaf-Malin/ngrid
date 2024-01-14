import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PblNgridRegistryService, PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridDragModule } from '@asafmalin/ngrid/drag';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';
import { PblNgridStatePluginModule } from '@asafmalin/ngrid/state';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';
import { PblNgridCellTooltipModule } from '@asafmalin/ngrid-material/cell-tooltip';
import { PblNgridCheckboxModule } from '@asafmalin/ngrid-material/selection-column';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { CommonGridTemplatesModule, CommonGridTemplatesComponent } from '../common-grid-templates';
import { VirtualScrollPerformanceDemoExample } from './virtual-scroll-performance-demo.component';

@NgModule({
  declarations: [ VirtualScrollPerformanceDemoExample ],
  imports: [
    CommonModule,
    MatFormFieldModule, MatSelectModule, MatSliderModule, MatRadioModule, MatCheckboxModule,

    ExampleCommonModule,
    CommonGridTemplatesModule,

    PblNgridModule.withCommon([ { component: CommonGridTemplatesComponent } ]),
    PblNgridDragModule.withDefaultTemplates(),
    PblNgridTargetEventsModule,
    PblNgridBlockUiModule,
    PblNgridStatePluginModule,
    PblNgridMatSortModule,
    PblNgridCellTooltipModule,
    PblNgridCheckboxModule,
  ],
  exports: [ VirtualScrollPerformanceDemoExample ],
  providers: [ PblNgridRegistryService ],
})
@BindNgModule(VirtualScrollPerformanceDemoExample)
export class VirtualScrollPerformanceDemoExampleModule { }
