import { EventEmitter } from '@angular/core';
import { COLUMN } from '@asafmalin/ngrid';
import { CdkLazyDropList } from '../core/index';
import { PblNgridColumnDragContainerDirective } from './column-drag-container';
import { PblColumnDragDropContainerDrop, PblColumnDragDropContainerEnter, PblColumnDragDropContainerExit } from './column-drop-container.events';
import * as i0 from "@angular/core";
export declare class PblNgridColumnDropContainerDirective<T = any> extends CdkLazyDropList<T> {
    id: string;
    orientation: 'horizontal' | 'vertical';
    columnEntered: EventEmitter<PblColumnDragDropContainerEnter<T>>;
    columnExited: EventEmitter<PblColumnDragDropContainerExit<T>>;
    columnDropped: EventEmitter<PblColumnDragDropContainerDrop<T>>;
    get columnContainer(): PblNgridColumnDragContainerDirective;
    private _columnContainer;
    canDrag(column: COLUMN): boolean;
    ngOnDestroy(): void;
    protected gridChanged(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridColumnDropContainerDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridColumnDropContainerDirective<any>, "[pblColumnDropContainer]", ["pblColumnDropContainer"], { "grid": "pblColumnDropContainer"; }, { "columnEntered": "columnEntered"; "columnExited": "columnExited"; "columnDropped": "columnDropped"; }, never, never, false>;
}
