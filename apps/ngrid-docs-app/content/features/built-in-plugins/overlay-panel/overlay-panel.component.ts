import { ChangeDetectionStrategy, Component, ViewEncapsulation, ViewChild } from '@angular/core';

import { createDS, columnFactory, PblNgridComponent } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelFactory } from '@asafmalin/ngrid/overlay-panel';

import { Seller, DynamicClientApi } from '@pebula/apps/docs-app-lib/client-api';
import { Example } from '@pebula/apps/docs-app-lib';

@Component({
  selector: 'pbl-overlay-panel-example',
  templateUrl: './overlay-panel.component.html',
  styleUrls: ['./overlay-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Example('pbl-overlay-panel-example', { title: 'Overlay Panel' })
export class OverlayPanelExample {
  columns = columnFactory()
  .table(
    { prop: 'id', sort: true, width: '40px', wontBudge: true },
    { prop: 'name', sort: true },
    { prop: 'email', minWidth: 250, width: '250px' },
    { prop: 'address' },
    { prop: 'rating', type: 'starRatings', width: '120px' }
  )
  .build();

  ds = createDS<Seller>().onTrigger( () => this.datasource.getSellers(0, 100) ).create();

  @ViewChild(PblNgridComponent, { static: true }) ngrid: PblNgridComponent;

  constructor(private datasource: DynamicClientApi,
              private overlayPanelFactory: PblNgridOverlayPanelFactory) { }

  show(): void {
    const overlayPanel = this.overlayPanelFactory.create(this.ngrid);
    overlayPanel.openGridCell(
      'myUniquePanelName',
      'name',
      'header',
      {
        hasBackdrop: true,
        xPos: 'after',
        yPos: 'below',
      }
    );
  }
}
