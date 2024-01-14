import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { createDS, columnFactory } from '@asafmalin/ngrid';

import { Person, DynamicClientApi } from '@pebula/apps/docs-app-lib/client-api';
import { Example } from '@pebula/apps/docs-app-lib';

@Component({
  selector: 'pbl-grid-filler-fixed-virtual-scroll-example',
  templateUrl: './grid-filler-fixed-virtual-scroll.component.html',
  styleUrls: ['./grid-filler-fixed-virtual-scroll.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Example('pbl-grid-filler-fixed-virtual-scroll-example', { title: 'Grid Filler (Virtual Scroll Fixed)' })
export class GridFillerFixedVirtualScrollExample {
  columns = columnFactory()
    .table(
      { prop: 'id', sort: true, width: '40px' },
      { prop: 'name', sort: true },
      { prop: 'gender', width: '50px' },
      { prop: 'birthdate', type: 'date' },
      { prop: 'email', minWidth: 250, width: '250px' },
      { prop: 'language', headerType: 'language' },
    )
    .build();

  ds = createDS<Person>().onTrigger( () => this.datasource.getPeople(0, 3) ).create();

  constructor(private datasource: DynamicClientApi) { }
}
