import { ViewContainerRef } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { PblNgridComponent, PblColumn, PblNgridDataHeaderExtensionContext } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelRef } from '@asafmalin/ngrid/overlay-panel';
import * as i0 from "@angular/core";
export declare class MatExcelStyleHeaderMenu {
    private ref;
    column: PblColumn;
    grid: PblNgridComponent;
    matMenu: MatMenu;
    menuViewLocation: ViewContainerRef;
    currentSort: 'asc' | 'desc' | undefined;
    currentPin: 'start' | 'end' | undefined;
    currentFilter: any;
    constructor(ref: PblNgridOverlayPanelRef<PblNgridDataHeaderExtensionContext>);
    ngAfterViewInit(): void;
    hide(): void;
    onSortToggle(sort: 'asc' | 'desc'): void;
    onPinToggle(pin: 'start' | 'end'): void;
    filterColumn(filterValue: string): void;
    clickTrap(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatExcelStyleHeaderMenu, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatExcelStyleHeaderMenu, "mat-excel-style-header-menu", never, {}, {}, never, never, false>;
}
