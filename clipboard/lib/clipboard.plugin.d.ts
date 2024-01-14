import { Injector, OnDestroy } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        clipboard?: PblNgridClipboardPlugin;
    }
    interface PblNgridPluginExtensionFactories {
        clipboard: keyof typeof PblNgridClipboardPlugin;
    }
}
declare module '@pebula/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        clipboard?: {
            /** When set to true will enable the clipboard plugin on all grid instances by default. */
            autoEnable?: boolean;
            /**
             * The separator to use when multiple cells are copied
             * @default \t
             */
            cellSeparator?: string;
            /**
             * The separator to use when multiple rows are copied
             * @default \n
             */
            rowSeparator?: string;
        };
    }
}
export declare const PLUGIN_KEY: 'clipboard';
export declare class PblNgridClipboardPlugin implements OnDestroy {
    grid: PblNgridComponent<any>;
    protected injector: Injector;
    protected pluginCtrl: PblNgridPluginController;
    static create(grid: PblNgridComponent, injector: Injector): PblNgridClipboardPlugin;
    /**
     * The separator to use when multiple cells are copied.
     * If not set, taken from `PblNgridConfig.clipboard.cellSeparator`
     * @default \t
     */
    clpCellSep: string;
    /**
     * The separator to use when multiple rows are copied
     * If not set, taken from `PblNgridConfig.clipboard.rowSeparator`
     * @default \n
     */
    clpRowSep: string;
    private config;
    private clipboard;
    private _removePlugin;
    constructor(grid: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    ngOnDestroy(): void;
    protected isCopyEvent(event: Event): boolean;
    protected doCopy(): void;
    protected getSelectedRowData(grid: PblNgridComponent): {
        minIndex: number;
        rows: any[][];
    };
    private init;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridClipboardPlugin, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridClipboardPlugin, "pbl-ngrid[clipboard]", ["pblNgridClipboard"], { "clpCellSep": "clpCellSep"; "clpRowSep": "clpRowSep"; }, {}, never, never, false>;
}
