import { OnDestroy, ElementRef } from '@angular/core';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { PblNgridBaseRowComponent } from '../row/base-row.component';
import { GridRowType } from '../row/types';
import * as i0 from "@angular/core";
export declare class PblNgridBaseCell<TRow extends PblNgridBaseRowComponent<GridRowType> = PblNgridBaseRowComponent<GridRowType>> implements OnDestroy {
    protected extApi: PblNgridInternalExtensionApi;
    el: HTMLElement;
    get owner(): TRow;
    private _owner;
    constructor(extApi: PblNgridInternalExtensionApi, elementRef: ElementRef<HTMLElement>);
    setOwner(owner: TRow): void;
    focus(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBaseCell<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridBaseCell<any>, never, never, {}, {}, never, never, false>;
}
