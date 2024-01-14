import { AfterViewInit, ChangeDetectorRef, Injector, OnInit, ElementRef, DoCheck, OnDestroy, ViewContainerRef, ComponentRef } from '@angular/core';
import { _PblNgridComponent } from '../../tokens';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { GridRowType, PblRowTypeToCellTypeMap } from './types';
import { PblRowTypeToColumnTypeMap } from '../column/management';
import * as i0 from "@angular/core";
export declare const PBL_NGRID_BASE_ROW_TEMPLATE = "<ng-container #viewRef></ng-container>";
export declare abstract class PblNgridBaseRowComponent<TRowType extends GridRowType, T = any> implements OnInit, DoCheck, AfterViewInit, OnDestroy {
    readonly cdRef: ChangeDetectorRef;
    grid: _PblNgridComponent<T>;
    _viewRef: ViewContainerRef;
    readonly element: HTMLElement;
    get height(): number;
    get cellsLength(): number;
    /**
     * An attached row will run change detection on it's children.
     * All rows are attached by default.
     */
    get attached(): boolean;
    abstract readonly rowType: TRowType;
    abstract get rowIndex(): number;
    protected _extApi: PblNgridInternalExtensionApi<T>;
    protected _cells: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>[];
    protected cellInjector: Injector;
    private _attached;
    constructor(grid: _PblNgridComponent<T>, cdRef: ChangeDetectorRef, elementRef: ElementRef<HTMLElement>);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    /**
     * Marks the row as attached.
     * Rows are attached by default.
     * An attached row takes part in the change detection process
     */
    _attach(): boolean;
    /**
     * Marks the row as detached.
     * A detached row DOWS NOT take part in the change detection process.
     *
     * Usually when the rendering engine cache row elements for performance, these should be detached when cached and re-attached when returned into view.
     */
    _detach(): boolean;
    _createCell(column: PblRowTypeToColumnTypeMap<TRowType>, atIndex?: number): void;
    _destroyCell(cellOrCellIndex: number | ComponentRef<PblRowTypeToCellTypeMap<TRowType>>): void;
    _moveCell(fromIndex: number, toIndex: number): void;
    protected abstract detectChanges(): any;
    protected abstract onCtor(): any;
    protected canCreateCell?(column: PblRowTypeToColumnTypeMap<TRowType>, atIndex?: number): boolean;
    protected canDestroyCell?(cell: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>): boolean;
    protected canMoveCell?(fromIndex: number, toIndex: number, cell: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>): boolean;
    protected cellCreated?(column: PblRowTypeToColumnTypeMap<TRowType>, cell: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>): any;
    protected cellDestroyed?(cell: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>, previousIndex: number): any;
    protected cellMoved?(previousItem: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>, currentItem: ComponentRef<PblRowTypeToCellTypeMap<TRowType>>, previousIndex: number, currentIndex: number): any;
    protected createComponent(column: PblRowTypeToColumnTypeMap<TRowType>, atIndex?: number): ComponentRef<PblRowTypeToCellTypeMap<TRowType>>;
    /**
     * Resolves the extensions API and the injector to be used when creating cells.
     */
    protected resolveTokens(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBaseRowComponent<any, any>, [{ optional: true; }, null, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridBaseRowComponent<any, any>, never, never, {}, {}, never, never, false>;
}
