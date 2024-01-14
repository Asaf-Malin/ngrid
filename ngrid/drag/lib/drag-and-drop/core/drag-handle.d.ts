import { ElementRef } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import * as i0 from "@angular/core";
/** Handle that can be used to drag and CdkDrag instance. */
export declare class PblDragHandle extends CdkDragHandle {
    element: ElementRef<HTMLElement>;
    constructor(element: ElementRef<HTMLElement>, parentDrag?: any);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblDragHandle, [null, { optional: true; skipSelf: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblDragHandle, "[pblDragHandle]", never, {}, {}, never, never, false>;
}
