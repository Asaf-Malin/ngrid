import { NgZone, ElementRef } from '@angular/core';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DragRef, DragRefConfig, DropListRef, DragDropRegistry } from '@angular/cdk/drag-drop';
import { PblDragRef } from './drag-ref';
import { PblDropListRef } from './drop-list-ref';
import * as i0 from "@angular/core";
/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
export declare class PblDragDrop {
    protected _document: any;
    protected _ngZone: NgZone;
    protected _viewportRuler: ViewportRuler;
    protected _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>;
    constructor(_document: any, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>);
    /**
     * Turns an element into a draggable item.
     * @param element Element to which to attach the dragging functionality.
     * @param config Object used to configure the dragging behavior.
     */
    createDrag<T = any>(element: ElementRef<HTMLElement> | HTMLElement, config?: DragRefConfig): PblDragRef<T>;
    /**
     * Turns an element into a drop list.
     * @param element Element to which to attach the drop list functionality.
     */
    createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): PblDropListRef<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblDragDrop, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblDragDrop>;
}
