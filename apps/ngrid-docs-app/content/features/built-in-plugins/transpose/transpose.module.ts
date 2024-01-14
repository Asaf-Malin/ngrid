import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridTransposeModule } from '@asafmalin/ngrid/transpose';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { TransposeExample } from './transpose.component';
import { OriginalTemplatesExample } from './original-templates.component';
import { WithColumnStylesExample } from './with-column-styles.component';

@NgModule({
  declarations: [ TransposeExample, OriginalTemplatesExample, WithColumnStylesExample ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ExampleCommonModule,
    PblNgridModule, PblNgridTransposeModule, PblNgridBlockUiModule,
  ],
  exports: [ TransposeExample, OriginalTemplatesExample, WithColumnStylesExample ],
})
@BindNgModule(TransposeExample, OriginalTemplatesExample, WithColumnStylesExample)
export class TransposeExampleModule { }
