import { ReplaySubject } from 'rxjs';
import { EventEmitter, OnDestroy, Injector } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as Events from './events';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        targetEvents?: {
            /** When set to true will enable the target events plugin on all table instances by default. */
            autoEnable?: boolean;
        };
    }
}
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        targetEvents?: PblNgridTargetEventsPlugin;
    }
    interface PblNgridPluginExtensionFactories {
        targetEvents: keyof typeof PblNgridTargetEventsPlugin;
    }
}
export declare const PLUGIN_KEY: 'targetEvents';
export declare function runOnce(): void;
export declare class PblNgridTargetEventsPlugin<T = any> {
    readonly grid: PblNgridComponent<any>;
    protected injector: Injector;
    protected pluginCtrl: PblNgridPluginController;
    rowClick: EventEmitter<Events.PblNgridRowEvent<T>>;
    rowDblClick: EventEmitter<Events.PblNgridRowEvent<T>>;
    rowEnter: EventEmitter<Events.PblNgridRowEvent<T>>;
    rowLeave: EventEmitter<Events.PblNgridRowEvent<T>>;
    cellClick: EventEmitter<Events.PblNgridCellEvent<T, MouseEvent>>;
    cellDblClick: EventEmitter<Events.PblNgridCellEvent<T, MouseEvent>>;
    cellEnter: EventEmitter<Events.PblNgridCellEvent<T, MouseEvent>>;
    cellLeave: EventEmitter<Events.PblNgridCellEvent<T, MouseEvent>>;
    mouseDown: EventEmitter<Events.PblNgridRowEvent<T> | Events.PblNgridCellEvent<T, MouseEvent>>;
    mouseUp: EventEmitter<Events.PblNgridRowEvent<T> | Events.PblNgridCellEvent<T, MouseEvent>>;
    keyUp: EventEmitter<Events.PblNgridCellEvent<T, KeyboardEvent> | Events.PblNgridRowEvent<T>>;
    keyDown: EventEmitter<Events.PblNgridCellEvent<T, KeyboardEvent> | Events.PblNgridRowEvent<T>>;
    protected readonly destroyed: ReplaySubject<void>;
    private _removePlugin;
    constructor(grid: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    static create<T = any>(table: PblNgridComponent<any>, injector: Injector): PblNgridTargetEventsPlugin<T>;
    private init;
    private setupDomEvents;
    destroy(): void;
    private syncRow;
}
export declare class PblNgridTargetEventsPluginDirective<T> extends PblNgridTargetEventsPlugin<T> implements OnDestroy {
    constructor(table: PblNgridComponent<any>, injector: Injector, pluginCtrl: PblNgridPluginController);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridTargetEventsPluginDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridTargetEventsPluginDirective<any>, "pbl-ngrid[targetEvents], pbl-ngrid[mouseDown], pbl-ngrid[mouseUp], pbl-ngrid[rowClick], pbl-ngrid[rowDblClick], pbl-ngrid[rowEnter], pbl-ngrid[rowLeave], pbl-ngrid[cellClick], pbl-ngrid[cellDblClick], pbl-ngrid[cellEnter], pbl-ngrid[cellLeave], pbl-ngrid[keyDown], pbl-ngrid[keyUp]", never, {}, { "mouseDown": "mouseDown"; "mouseUp": "mouseUp"; "rowClick": "rowClick"; "rowDblClick": "rowDblClick"; "rowEnter": "rowEnter"; "rowLeave": "rowLeave"; "cellClick": "cellClick"; "cellDblClick": "cellDblClick"; "cellEnter": "cellEnter"; "cellLeave": "cellLeave"; "keyDown": "keyDown"; "keyUp": "keyUp"; }, never, never, false>;
}
