import { PblDropListRef } from '../core/drop-list-ref';
import { PblDragRef } from '../core/drag-ref';
import { PblNgridColumnReorderPluginDirective } from './column-reorder-plugin';
import { PblNgridColumnDragDirective } from './column-drag';
export declare class PblColumnDropListRef<T = any> extends PblDropListRef<PblNgridColumnReorderPluginDirective<T>> {
    private lastSwap;
    _sortPredicate(newIndex: number, drag: PblDragRef<PblNgridColumnDragDirective<T>>, drop: PblColumnDropListRef<T>): boolean;
    _sortItem(item: PblDragRef, pointerX: number, pointerY: number, pointerDelta: {
        x: number;
        y: number;
    }): void;
}
export declare function patchDropListRef<T = any>(dropListRef: PblDropListRef<PblNgridColumnReorderPluginDirective<T>>): void;
