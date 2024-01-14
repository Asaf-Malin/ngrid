import { NgModule } from '@angular/core';
import { PblNgridModule } from '@asafmalin/ngrid';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { PblNgridPaginatorModule } from '@asafmalin/ngrid-material/paginator';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';
import { ContextExampleExample } from './context-example.component';
import { ContextObjectExample } from './context-object.component';

@NgModule({
  declarations: [ ContextExampleExample, ContextObjectExample ],
  imports: [
    ExampleCommonModule,
    PblNgridModule, PblNgridTargetEventsModule, PblNgridPaginatorModule, PblNgridMatSortModule,
  ],
  exports: [ ContextExampleExample, ContextObjectExample ],
})
@BindNgModule(ContextExampleExample, ContextObjectExample)
export class ContextExampleExampleModule { }
