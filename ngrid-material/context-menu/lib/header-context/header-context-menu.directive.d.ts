import { PblNgridPluginController } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelFactory, PblNgridOverlayPanel, PblNgridOverlayPanelConfig } from '@asafmalin/ngrid/overlay-panel';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        matHeaderContextMenu?: PblNgridMatHeaderContextMenuPlugin;
    }
}
export declare const PLUGIN_KEY: 'matHeaderContextMenu';
export declare class PblNgridMatHeaderContextMenuPlugin {
    readonly pluginCtrl: PblNgridPluginController;
    style: any;
    config: PblNgridOverlayPanelConfig;
    readonly overlayPanel: PblNgridOverlayPanel;
    constructor(overlayPanelFactory: PblNgridOverlayPanelFactory, pluginCtrl: PblNgridPluginController);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMatHeaderContextMenuPlugin, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridMatHeaderContextMenuPlugin, "pbl-ngrid[matHeaderContextMenu]", never, { "style": "matHeaderContextMenu"; "config": "config"; }, {}, never, never, false>;
}
