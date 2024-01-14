import { ElementRef, ComponentRef, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { _PblNgridComponent } from '../../tokens';
import { PblNgridBaseRowComponent } from './base-row.component';
import { PblColumn } from '../column/model';
import { PblNgridMetaRowService, PblMetaRow } from '../meta-rows/meta-row.service';
import { PblNgridHeaderCellComponent } from '../cell/header-cell.component';
import * as i0 from "@angular/core";
/**
 * The row that represents the columns of the grid.
 * There are only 2 column rows in a grid, the top (header) and bottom (footer), both optional.
 */
export declare class PblNgridColumnRowComponent extends PblNgridBaseRowComponent<'header' | 'footer', PblMetaRowDefinitions> implements PblMetaRow, OnInit, OnDestroy {
    private readonly metaRows;
    set row(value: PblMetaRowDefinitions);
    get rowIndex(): number;
    get meta(): PblMetaRowDefinitions;
    set meta(value: PblMetaRowDefinitions);
    readonly rowType: 'header' | 'footer';
    readonly element: HTMLElement;
    readonly isFooter: boolean;
    readonly gridWidthRow: boolean;
    private _meta;
    constructor(grid: _PblNgridComponent, cdRef: ChangeDetectorRef, el: ElementRef<HTMLElement>, metaRows: PblNgridMetaRowService, isFooter: any, gridWidthRow: any);
    ngOnInit(): void;
    ngOnDestroy(): void;
    updateSize(): void;
    protected onCtor(): void;
    protected detectChanges(): void;
    protected updateRow(value: PblMetaRowDefinitions): void;
    protected cellCreated(column: PblColumn, cell: ComponentRef<PblNgridHeaderCellComponent>): void;
    protected cellDestroyed(cell: ComponentRef<PblNgridHeaderCellComponent>, previousIndex: number): void;
    private handleVisibility;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridColumnRowComponent, [{ optional: true; }, null, null, null, { attribute: "footer"; }, { attribute: "gridWidthRow"; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridColumnRowComponent, "pbl-ngrid-column-row", never, { "row": "row"; }, {}, never, never, false>;
}
