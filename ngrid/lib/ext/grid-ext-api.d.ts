import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { PblNgridConfigService, PblNgridEvents } from '@asafmalin/ngrid/core';
import { _PblNgridComponent } from '../tokens';
import { PblCdkTableComponent } from '../grid/pbl-cdk-table/pbl-cdk-table.component';
import { ContextApi } from '../grid/context/api';
import { PblNgridRegistryService } from '../grid/registry/registry.service';
import { ColumnApi, PblColumnStore } from '../grid/column/management';
import { PblNgridColumnWidthCalc } from '../grid/column/width-logic/column-width-calc';
import { PblCdkVirtualScrollViewportComponent } from '../grid/features/virtual-scroll/virtual-scroll-viewport.component';
import { NotifyPropChangeMethod, OnPropChangedEvent } from './types';
import { RowsApi, PblRowsApi } from '../grid/row';
import { PblNgridPluginContext, PblNgridPluginController } from './plugin-control';
import { Logicaps } from '../grid/logicap/index';
export declare const EXT_API_TOKEN: InjectionToken<unknown>;
export interface PblNgridExtensionApi<T = any> {
    grid: _PblNgridComponent<T>;
    element: HTMLElement;
    config: PblNgridConfigService;
    /**
     * The registry instance bound to the current instance.
     * This registry instance lifespan is similar to the grid's component, it will get destroyed when the grid gets destroyed.
     */
    registry: PblNgridRegistryService;
    propChanged: Observable<OnPropChangedEvent>;
    cdkTable: PblCdkTableComponent<T>;
    columnStore: PblColumnStore;
    contextApi: ContextApi<T>;
    columnApi: ColumnApi<T>;
    rowsApi: RowsApi<T>;
    events: Observable<PblNgridEvents>;
    pluginCtrl: PblNgridPluginController<T>;
    widthCalc: PblNgridColumnWidthCalc;
    onConstructed(fn: () => void): void;
    onInit(fn: () => void): void;
    getDirection(): Direction;
    directionChange(): Observable<Direction>;
}
export interface PblNgridInternalExtensionApi<T = any> extends PblNgridExtensionApi<T> {
    viewport: PblCdkVirtualScrollViewportComponent;
    plugin: PblNgridPluginContext;
    rowsApi: PblRowsApi<T>;
    setViewport(viewport: PblCdkVirtualScrollViewportComponent): void;
    setCdkTable(cdkTable: PblCdkTableComponent<T>): void;
    notifyPropChanged: NotifyPropChangeMethod;
    logicaps: Logicaps;
}
