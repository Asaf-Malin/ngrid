import { Injector, OnDestroy } from '@angular/core';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { TooltipPosition } from '@angular/material/tooltip';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import { PblNgridCellEvent } from '@asafmalin/ngrid/target-events';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        cellTooltip?: CellTooltipOptions & {
            /** When set to true will apply the default cell tooltip to ALL tables */
            autoSetAll?: boolean;
        };
    }
}
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        cellTooltip?: PblNgridCellTooltipDirective<any>;
    }
    interface PblNgridPluginExtensionFactories {
        cellTooltip: keyof typeof PblNgridCellTooltipDirective;
    }
}
export declare const PLUGIN_KEY: 'cellTooltip';
export interface CellTooltipOptions {
    canShow?: boolean | ((event: PblNgridCellEvent<any>) => boolean);
    message?: (event: PblNgridCellEvent<any>) => string;
}
export declare class PblNgridCellTooltipDirective<T> implements CellTooltipOptions, OnDestroy {
    private table;
    private injector;
    static readonly PLUGIN_KEY: 'cellTooltip';
    set canShow(value: boolean | ((event: PblNgridCellEvent<T>) => boolean));
    message: (event: PblNgridCellEvent<T>) => string;
    /** See Material docs for MatTooltip */
    position: TooltipPosition;
    /** See Material docs for MatTooltip */
    tooltipClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    /** See Material docs for MatTooltip */
    showDelay: number;
    /** See Material docs for MatTooltip */
    hideDelay: number;
    private initArgs;
    private toolTip;
    private lastConfig;
    private _removePlugin;
    private _canShow;
    constructor(table: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    static create<T = any>(table: PblNgridComponent<any>, injector: Injector): PblNgridCellTooltipDirective<T>;
    ngOnDestroy(): void;
    private init;
    private cellEnter;
    private cellLeave;
    private killTooltip;
    static ngAcceptInputType_canShow: BooleanInput;
    static ngAcceptInputType_showDelay: NumberInput;
    static ngAcceptInputType_hideDelay: NumberInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellTooltipDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellTooltipDirective<any>, "[cellTooltip]", ["pblOverflowTooltip"], { "canShow": "cellTooltip"; "message": "message"; "position": "position"; "tooltipClass": "tooltipClass"; "showDelay": "showDelay"; "hideDelay": "hideDelay"; }, {}, never, never, false>;
}
