import { Injector } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        infiniteScroll?: PblNgridInfiniteScrollPlugin;
    }
    interface PblNgridPluginExtensionFactories {
        infiniteScroll: keyof typeof PblNgridInfiniteScrollPlugin;
    }
}
export declare const PLUGIN_KEY: "infiniteScroll";
export declare class PblNgridInfiniteScrollPlugin<T = any> {
    private grid;
    private pluginCtrl;
    private injector;
    static create(grid: PblNgridComponent, injector: Injector): PblNgridInfiniteScrollPlugin;
    private _enabled;
    private _infiniteVirtualRowDef;
    private _infiniteVirtualRowRef;
    private _removePlugin;
    constructor(grid: PblNgridComponent<any>, pluginCtrl: PblNgridPluginController<T>, injector: Injector);
    private setupInfiniteVirtualRow;
    private resetTableRowDefs;
    /**
     * Update the grid with detail row infor.
     * Instead of calling for a change detection cycle we can assign the new predicates directly to the pblNgridRowDef instances.
     */
    private updateTable;
}
