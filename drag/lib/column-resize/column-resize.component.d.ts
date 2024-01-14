import { AfterViewInit, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DragDropConfig, DragDropRegistry } from '@angular/cdk/drag-drop';
import { PblNgridComponent, PblColumn, PblNgridMetaCellContext } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        columnResize?: PblNgridDragResizeComponent;
    }
}
export declare const COL_RESIZE_PLUGIN_KEY: 'columnResize';
export declare class PblNgridDragResizeComponent implements AfterViewInit, OnDestroy {
    element: ElementRef<HTMLElement>;
    private _ngZone;
    private _viewportRuler;
    private _dragDropRegistry;
    private _config;
    set context(value: PblNgridMetaCellContext<any>);
    /**
     * The area (in pixels) in which the handle can be grabbed and resize the cell.
     * Default: 6
     */
    grabAreaWidth: number;
    column: PblColumn;
    grid: PblNgridComponent<any>;
    _hasStartedDragging: boolean;
    private _hasMoved;
    private _rootElement;
    private _pointerMoveSubscription;
    private _pointerUpSubscription;
    private _scrollPosition;
    private _pickupPositionOnPage;
    private _initialWidth;
    private _lastWidth;
    private _extApi;
    private _rootElementInitSubscription;
    constructor(element: ElementRef<HTMLElement>, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<PblNgridDragResizeComponent, any>, _config: DragDropConfig);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    onDoubleClick(event: MouseEvent): void;
    _pointerDown: (event: MouseEvent | TouchEvent) => void;
    /**
   * Sets up the different variables and subscriptions
   * that will be necessary for the dragging sequence.
   * @param referenceElement Element that started the drag sequence.
   * @param event Browser event object that started the sequence.
   */
    private _initializeDragSequence;
    /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
    private _pointerMove;
    /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
    private _pointerUp;
    private _getPointerPositionOnPage;
    private _isTouchEvent;
    /**
     *
     * @deprecated Will be removed in v5, use `isDragging()` instead
     */
    _isDragging(): boolean;
    isDragging(): boolean;
    private _getRootElement;
    private _removeSubscriptions;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDragResizeComponent, [null, null, null, null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridDragResizeComponent, "pbl-ngrid-drag-resize", never, { "context": "context"; "grabAreaWidth": "grabAreaWidth"; }, {}, never, ["*"], false>;
}
