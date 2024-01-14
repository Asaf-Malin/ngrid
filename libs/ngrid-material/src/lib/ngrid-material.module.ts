import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PblNgridCheckboxModule } from '@asafmalin/ngrid-material/selection-column';
import { PblNgridPaginatorModule } from '@asafmalin/ngrid-material/paginator';
import { PblNgridMatSortModule } from '@asafmalin/ngrid-material/sort';
import { PblNgridCellTooltipModule } from '@asafmalin/ngrid-material/cell-tooltip';
import { PblNgridContextMenuModule } from '@asafmalin/ngrid-material/context-menu';

@NgModule({
  imports: [
    CommonModule,
    PblNgridCheckboxModule,
    PblNgridPaginatorModule,
    PblNgridMatSortModule,
    PblNgridCellTooltipModule,
    PblNgridContextMenuModule,
  ],
  exports: [
    PblNgridCheckboxModule,
    PblNgridPaginatorModule,
    PblNgridMatSortModule,
    PblNgridCellTooltipModule,
    PblNgridContextMenuModule,
  ]
})
export class PblNgridMaterialModule { }
