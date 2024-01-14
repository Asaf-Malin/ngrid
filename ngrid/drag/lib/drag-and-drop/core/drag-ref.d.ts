import { ElementRef, EventEmitter } from '@angular/core';
import { DragRef } from '@angular/cdk/drag-drop';
export declare class PblDragRef<T = any> extends DragRef<T> {
    /**
     * Fires when the root element changes
     *
     * > Does not emit on the initial setup.
     */
    rootElementChanged: EventEmitter<{
        prev: HTMLElement;
        curr: HTMLElement;
    }>;
    constructor(...args: ConstructorParameters<typeof DragRef>);
    /**
     * Sets an alternate drag root element. The root element is the element that will be moved as
     * the user is dragging. Passing an alternate root element is useful when trying to enable
     * dragging on an element that you might not have access to.
     */
    withRootElement(rootElement: ElementRef<HTMLElement> | HTMLElement): this;
    dispose(): void;
}
