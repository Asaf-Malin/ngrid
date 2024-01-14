import { ViewContainerRef } from '@angular/core';
import { PblNgridExtensionApi } from '@asafmalin/ngrid';
import { PblNgridDetailRowComponent } from './row';
/**
 * In charge of handling the lifecycle of detail row instances.
 * The whole lifecycle: Create, update, move, destroy, etc...
 *
 * This controller also sync's the rendering process to make sure we reuse detail rom elements within
 * a single rendering cycle (i.e. not long term caching but a short term one).
 * This is done for performance and to prevent flickering when a row is moved into a different element due to virtual scroll.
 * When this happen we just want to move all dom elements properly, swap the context and trigger change detection.
 * If we have left over rows to render we create new elements or if we have left over rows to clear, we remove them.
 * The logic for this relay on the fact that the row's context.$implicit is updated in a sync iteration by the cdk table
 * and afterwards we will have the onRenderRows event fired, allowing us to sync changes.
 * We also relay on the fact that the event run immediately after the iterations and everything is sync.
 *
 * > In the future, this is where we can support detail row caching
 */
export declare class DetailRowController {
    private readonly vcRef;
    private readonly extApi;
    private viewMap;
    private pendingOps;
    private deferOps;
    private detailRowDef;
    private runMeasure;
    constructor(vcRef: ViewContainerRef, extApi: PblNgridExtensionApi);
    render(parent: PblNgridDetailRowComponent, fromRender: boolean): boolean;
    clearDetailRow(parent: PblNgridDetailRowComponent, fromRender: boolean): void;
    updateDetailRow(parent: PblNgridDetailRowComponent): void;
    getDetailRowHeight(parent: PblNgridDetailRowComponent): number;
    detectChanges(parent: PblNgridDetailRowComponent): void;
    private createDetailRowContext;
    private flushPendingOps;
    private _render;
    private _clearDetailRow;
    private insertElementsToRow;
    private checkHasAnimation;
}
