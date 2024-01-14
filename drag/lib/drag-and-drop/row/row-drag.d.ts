import { OnInit } from '@angular/core';
import { PblNgridCellContext } from '@asafmalin/ngrid';
import { CdkLazyDrag } from '../core/index';
import { PblNgridRowReorderPluginDirective } from './row-reorder-plugin';
import * as i0 from "@angular/core";
export declare class PblNgridRowDragDirective<T = any> extends CdkLazyDrag<T, PblNgridRowReorderPluginDirective<T>> implements OnInit {
    rootElementSelector: string;
    get context(): PblNgridCellContext<T>;
    set context(value: PblNgridCellContext<T>);
    /**
     * Reference to the last dragged context.
     *
     * This context is not similar to the `context` property.
     * The `context` property holds the current context which is shared and updated on scroll so if a user start a drag and then scrolled
     * the context will point to the row in view and not the original cell.
     */
    get draggedContext(): Pick<PblNgridCellContext<T>, 'col' | 'grid'> & Partial<Pick<PblNgridCellContext<T>, 'row' | 'value'>>;
    private _context;
    private _draggedContext;
    private pluginCtrl;
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRowDragDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridRowDragDirective<any>, "[pblNgridRowDrag]", ["pblNgridRowDrag"], { "context": "pblNgridRowDrag"; }, {}, never, never, false>;
}
