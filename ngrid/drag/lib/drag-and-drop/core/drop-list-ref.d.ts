import { Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { DropListRef } from '@angular/cdk/drag-drop';
export declare class PblDropListRef<T = any> extends DropListRef<T> {
    /** Emits right before dragging has started. */
    beforeExit: Subject<{
        item: import('./drag-ref').PblDragRef<T>;
    }>;
    withElement(element: ElementRef<HTMLElement> | HTMLElement): this;
    dispose(): void;
}
