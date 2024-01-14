import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridPaginatorModule } from '@asafmalin/ngrid-material/paginator';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { ReuseExample } from './reuse.component';

@NgModule({
  declarations: [ ReuseExample ],
  imports: [
    CommonModule,
    ExampleCommonModule,
    PblNgridModule, PblNgridPaginatorModule, PblNgridBlockUiModule,
  ],
  exports: [ ReuseExample ],
})
@BindNgModule(ReuseExample)
export class ReuseExampleModule { }
