import { Observable } from 'rxjs';
import { OnDestroy, Injector } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import { PblNgridStateLoadOptions, PblNgridStateSaveOptions } from './core/index';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        state?: {
            /** When set to true will enable the state plugin on all table instances by default. */
            autoEnable?: boolean;
            /**
             * Options to use when auto-loading the plugin
             */
            autoEnableOptions?: {
                loadOptions?: PblNgridStateLoadOptions;
                saveOptions?: PblNgridStateSaveOptions;
            };
        };
    }
}
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        state?: PblNgridStatePlugin;
    }
    interface PblNgridPluginExtensionFactories {
        state: keyof typeof PblNgridStatePlugin;
    }
}
export declare const PLUGIN_KEY: 'state';
export declare class PblNgridStatePlugin {
    grid: PblNgridComponent<any>;
    protected injector: Injector;
    protected pluginCtrl: PblNgridPluginController;
    loadOptions?: PblNgridStateLoadOptions;
    saveOptions?: PblNgridStateSaveOptions;
    afterLoadState: Observable<void>;
    afterSaveState: Observable<void>;
    onError: Observable<{
        phase: 'save' | 'load';
        error: Error;
    }>;
    private _removePlugin;
    private _events;
    constructor(grid: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    static create(table: PblNgridComponent<any>, injector: Injector): PblNgridStatePlugin;
    load(): Promise<void>;
    save(): Promise<void>;
    destroy(): void;
    private _load;
}
export declare class PblNgridStatePluginDirective extends PblNgridStatePlugin implements OnDestroy {
    loadOptions: PblNgridStateLoadOptions;
    saveOptions: PblNgridStateSaveOptions;
    constructor(grid: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridStatePluginDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridStatePluginDirective, "pbl-ngrid[persistState]", never, { "loadOptions": "loadOptions"; "saveOptions": "saveOptions"; }, { "afterLoadState": "afterLoadState"; "afterSaveState": "afterSaveState"; "onError": "onError"; }, never, never, false>;
}
