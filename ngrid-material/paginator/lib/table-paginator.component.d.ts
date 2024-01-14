import { ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PblNgridComponent, PblPaginator } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
export declare class PblPaginatorComponent implements OnDestroy {
    _intl: MatPaginatorIntl;
    private cdr;
    pages: number[];
    pageSizes: number[];
    get pageSizeOptions(): number[];
    set pageSizeOptions(value: number[]);
    get paginator(): PblPaginator<number>;
    set paginator(value: PblPaginator<number>);
    /**
     * @deprecated Will be removed in v5, Use `grid` instead
     */
    get table(): PblNgridComponent<any>;
    /**
     * @deprecated Will be removed in v5, Use `grid` instead
     */
    set table(value: PblNgridComponent<any>);
    grid: PblNgridComponent<any>;
    get hidePageSize(): boolean;
    set hidePageSize(value: boolean);
    get hideRangeSelect(): boolean;
    set hideRangeSelect(value: boolean);
    private _pageSizeOptions;
    private _paginator;
    private _hidePageSize;
    private _hideRangeSelect;
    constructor(grid: PblNgridComponent<any>, _intl: MatPaginatorIntl, cdr: ChangeDetectorRef);
    ngOnDestroy(): void;
    private updatePageSizes;
    private handlePageChange;
    static ngAcceptInputType_hidePageSize: BooleanInput;
    static ngAcceptInputType_hideRangeSelect: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblPaginatorComponent, [{ optional: true; }, null, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblPaginatorComponent, "pbl-ngrid-paginator", never, { "pageSizeOptions": "pageSizeOptions"; "paginator": "paginator"; "table": "table"; "grid": "grid"; "hidePageSize": "hidePageSize"; "hideRangeSelect": "hideRangeSelect"; }, {}, never, never, false>;
}
