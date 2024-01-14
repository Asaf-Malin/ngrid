import { ComponentHarness, ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing';
import { ColumnCellHarnessFilters, ColumnHeaderCellHarnessFilters, DataCellHarnessFilters } from '../ngrid-harness-filters';
/**
 * Harness for interacting with cells that belong to a column.
 * This can be a column header cell, data cell or a column footer cell
 */
export declare class PblNgridColumnCellHarness extends ComponentHarness {
    static hostSelector: string;
    static with(options?: ColumnCellHarnessFilters): HarnessPredicate<PblNgridColumnCellHarness>;
    getText(): Promise<string>;
    getColumnId(): Promise<string>;
}
export declare class PblNgridColumnHeaderCellHarness extends PblNgridColumnCellHarness {
    static hostSelector: string;
    static with(options?: ColumnHeaderCellHarnessFilters): HarnessPredicate<PblNgridColumnHeaderCellHarness>;
}
export declare class PblNgridDataCellHarness extends PblNgridColumnCellHarness {
    static hostSelector: string;
    static with(options?: DataCellHarnessFilters): HarnessPredicate<PblNgridDataCellHarness>;
}
export declare function getColumnCellPredicate<T extends PblNgridColumnCellHarness>(type: ComponentHarnessConstructor<T>, options: ColumnCellHarnessFilters): HarnessPredicate<T>;
