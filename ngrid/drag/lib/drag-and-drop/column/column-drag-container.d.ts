import { BehaviorSubject, Subject } from 'rxjs';
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { COLUMN } from '@asafmalin/ngrid';
import { CdkLazyDropList } from '../core/index';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        columnDrag?: PblNgridColumnDragContainerDirective;
    }
}
export declare const COL_DRAG_CONTAINER_PLUGIN_KEY: 'columnDrag';
export declare class PblNgridColumnDragContainerDirective<T = any> extends CdkLazyDropList<T, PblNgridColumnDragContainerDirective<T>> {
    id: string;
    orientation: 'horizontal' | 'vertical';
    get columnDrag(): boolean;
    set columnDrag(value: boolean);
    dragging: BehaviorSubject<boolean>;
    connectionsChanged: Subject<void>;
    private _columnDrag;
    private _removePlugin;
    private connections;
    hasConnections(): boolean;
    canDrag(column: COLUMN): boolean;
    connectTo(dropList: CdkDropList): void;
    disconnectFrom(dropList: CdkDropList): void;
    ngOnDestroy(): void;
    protected initDropListRef(): void;
    protected beforeStarted(): void;
    protected gridChanged(): void;
    static ngAcceptInputType_columnDrag: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridColumnDragContainerDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridColumnDragContainerDirective<any>, "pbl-ngrid[columnDrag]:not([columnReorder])", ["pblNgridColumnDragContainer"], { "columnDrag": "columnDrag"; }, { "dragging": "cdkDropDragging"; "connectionsChanged": "cdkDropConnectionsChanged"; }, never, never, false>;
}
