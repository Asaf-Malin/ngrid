import { OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { PblDragRef } from './drag-ref';
import { CdkLazyDropList } from './drop-list';
import * as i0 from "@angular/core";
export declare class CdkLazyDrag<T = any, Z extends CdkLazyDropList<T> = CdkLazyDropList<T>, DRef = any> extends CdkDrag<T> implements OnInit, AfterViewInit, OnDestroy {
    /**
     * A class to set when the root element is not the host element. (i.e. when `cdkDragRootElement` is used).
     */
    set rootElementSelectorClass(value: string);
    get pblDragRef(): PblDragRef<DRef>;
    get cdkDropList(): Z;
    set cdkDropList(dropList: Z);
    private _rootClass;
    private _hostNotRoot;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected dropContainerChanged(prev: Z): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkLazyDrag<any, any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkLazyDrag<any, any, any>, "[cdkLazyDrag]", ["cdkLazyDrag"], { "rootElementSelectorClass": "cdkDragRootElementClass"; "cdkDropList": "cdkDropList"; }, {}, never, never, false>;
}
