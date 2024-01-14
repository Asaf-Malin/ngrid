import { ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DragDrop, CdkDropListGroup, CdkDropList, CdkDrag, DragDropConfig } from '@angular/cdk/drag-drop';
import { PblNgridComponent, PblNgridExtensionApi } from '@pebula/ngrid';
import { PblDropListRef } from './drop-list-ref';
import * as i0 from "@angular/core";
export declare class CdkLazyDropList<T = any, DRef = any> extends CdkDropList<T> implements OnInit {
    get pblDropListRef(): PblDropListRef<DRef>;
    get grid(): PblNgridComponent<T>;
    set grid(value: PblNgridComponent<T>);
    get dir(): Direction | null;
    /**
     * Selector that will be used to determine the direct container element, starting from
     * the `cdkDropList` element and going down the DOM. Passing an alternate direct container element
     * is useful when the `cdkDropList` is not the direct parent (i.e. ancestor but not father)
     * of the draggable elements.
     */
    directContainerElement: string;
    protected get gridApi(): PblNgridExtensionApi<T>;
    protected readonly originalElement: ElementRef<HTMLElement>;
    private _gridApi;
    constructor(grid: PblNgridComponent<T>, element: ElementRef<HTMLElement>, dragDrop: DragDrop, changeDetectorRef: ChangeDetectorRef, _scrollDispatcher?: ScrollDispatcher, dir?: Directionality, group?: CdkDropListGroup<CdkDropList>, config?: DragDropConfig);
    ngOnInit(): void;
    addDrag(drag: CdkDrag): void;
    removeDrag(drag: CdkDrag): void;
    /**
     * A chance for inheriting implementations to change/modify the drop list ref instance
     *
     * We can't do this via a DragDrop service replacement as we might have multiple drop-lists on the same
     * element which mean they must share the same DragDrop factory...
     */
    protected initDropListRef(): void;
    protected beforeStarted(): void;
    protected gridChanged(prev?: PblNgridExtensionApi<T>): void;
    private updateGrid;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkLazyDropList<any, any>, [{ optional: true; }, null, null, null, null, { optional: true; }, { optional: true; skipSelf: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkLazyDropList<any, any>, "[cdkLazyDropList]", ["cdkLazyDropList"], { "directContainerElement": "cdkDropListDirectContainerElement"; }, {}, never, never, false>;
}
