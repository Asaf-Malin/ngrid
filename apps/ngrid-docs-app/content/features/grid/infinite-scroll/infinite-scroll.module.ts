import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PblNgridInfiniteScrollModule } from '@asafmalin/ngrid/infinite-scroll';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { InfiniteScrollExample } from './infinite-scroll.component';
import { InfiniteScrollDataSourceExample } from './infinite-scroll-data-source.component';
import { IndexBasedPagingExample } from './index-based-paging.component';
import { CustomTriggersExample } from './custom-triggers.component';

@NgModule({
    declarations: [InfiniteScrollExample, InfiniteScrollDataSourceExample, IndexBasedPagingExample, CustomTriggersExample],
    imports: [
        CommonModule,
        ExampleCommonModule,
        MatProgressBarModule,
        PblNgridModule, PblNgridTargetEventsModule, PblNgridInfiniteScrollModule,
    ],
    exports: [InfiniteScrollExample, InfiniteScrollDataSourceExample, IndexBasedPagingExample, CustomTriggersExample]
})
@BindNgModule(InfiniteScrollExample, InfiniteScrollDataSourceExample, IndexBasedPagingExample, CustomTriggersExample)
export class InfiniteScrollExampleModule { }
