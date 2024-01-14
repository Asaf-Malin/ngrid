import { PblColumn } from '@pebula/ngrid';
import { CdkLazyDrag } from '../core/index';
import { PblNgridColumnDragContainerDirective } from './column-drag-container';
import * as i0 from "@angular/core";
export declare class PblNgridColumnDragDirective<T = any> extends CdkLazyDrag<T, PblNgridColumnDragContainerDirective<T>, PblNgridColumnDragDirective<T>> {
    rootElementSelector: string;
    get column(): PblColumn;
    set column(value: PblColumn);
    private _column;
    private cache;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    getCells(): HTMLElement[];
    reset(): void;
    protected dropContainerChanged(prev: PblNgridColumnDragContainerDirective<T>): void;
    private updateDisabledState;
    private updateBoundaryElement;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridColumnDragDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridColumnDragDirective<any>, "[pblNgridColumnDrag]", ["pblNgridColumnDrag"], { "column": "pblNgridColumnDrag"; }, {}, never, never, false>;
}
