import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { PblNgridModule } from '@asafmalin/ngrid';
import { PblNgridBlockUiModule } from '@asafmalin/ngrid/block-ui';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';

import { BindNgModule } from '@pebula/apps/docs-app-lib';
import { ExampleCommonModule } from '@pebula/apps/docs-app-lib/example-common.module';
import { ColumnHeaderMenuExample } from './column-header-menu.component';

const COMPONENTS = [ ColumnHeaderMenuExample ];

@NgModule({
    declarations: COMPONENTS,
    imports: [
        CommonModule,
        MatIconModule, MatMenuModule,
        ExampleCommonModule,
        PblNgridModule, PblNgridBlockUiModule, PblNgridMatSortModule,
    ],
    exports: COMPONENTS
})
@BindNgModule(ColumnHeaderMenuExample)
export class ColumnHeaderMenuExampleModule { }
