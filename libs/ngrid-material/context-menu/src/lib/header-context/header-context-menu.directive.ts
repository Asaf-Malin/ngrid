import { Directive, Input } from '@angular/core';
import { PblNgridPluginController } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelFactory, PblNgridOverlayPanel, PblNgridOverlayPanelConfig } from '@asafmalin/ngrid/overlay-panel';

declare module '@asafmalin/ngrid/lib/ext/types' {
  interface PblNgridPluginExtension {
    matHeaderContextMenu?: PblNgridMatHeaderContextMenuPlugin;
  }
}

export const PLUGIN_KEY: 'matHeaderContextMenu' = 'matHeaderContextMenu';

@Directive({ selector: 'pbl-ngrid[matHeaderContextMenu]', providers: [ PblNgridOverlayPanelFactory ] })
export class PblNgridMatHeaderContextMenuPlugin {

  @Input('matHeaderContextMenu') style: any;
  @Input() config: PblNgridOverlayPanelConfig;

  readonly overlayPanel: PblNgridOverlayPanel;

  constructor(overlayPanelFactory: PblNgridOverlayPanelFactory,
              public readonly pluginCtrl: PblNgridPluginController) {
    this.overlayPanel = overlayPanelFactory.create(pluginCtrl.extApi.grid);
  }

}
