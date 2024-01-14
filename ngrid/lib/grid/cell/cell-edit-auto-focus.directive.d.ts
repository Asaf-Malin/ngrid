import { AfterViewInit, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { PblNgridCellContext } from '../context/index';
import * as i0 from "@angular/core";
export declare class PblNgridCellEditAutoFocusDirective implements AfterViewInit, OnDestroy {
    private elRef;
    private ngZone;
    context: PblNgridCellContext<any>;
    private _destroyed;
    constructor(elRef: ElementRef<HTMLElement>, ngZone: NgZone);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellEditAutoFocusDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridCellEditAutoFocusDirective, "[pblCellEditAutoFocus]", never, { "context": "pblCellEditAutoFocus"; }, {}, never, never, false>;
}
