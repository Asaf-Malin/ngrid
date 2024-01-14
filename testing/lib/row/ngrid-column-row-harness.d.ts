import { ComponentHarness, ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing';
import { ColumnCellHarnessFilters, DataCellHarnessFilters, ColumnHeaderCellHarnessFilters, PblNgridDataRowHarnessFilters } from '../ngrid-harness-filters';
import { PblNgridColumnCellHarness, PblNgridDataCellHarness, PblNgridColumnHeaderCellHarness } from '../cell/ngrid-column-cell-harness';
/**
 * Harness for interacting with rows that are structured based on a column
 */
export declare class PblNgridColumnRowHarness extends ComponentHarness {
    getCells(filter: ColumnHeaderCellHarnessFilters, type: typeof PblNgridColumnHeaderCellHarness): Promise<PblNgridColumnHeaderCellHarness[]>;
    getCells(filter: DataCellHarnessFilters, type: typeof PblNgridDataCellHarness): Promise<PblNgridDataCellHarness[]>;
    getCells(filter: ColumnCellHarnessFilters): Promise<PblNgridColumnCellHarness[]>;
}
export declare class PblNgridColumnHeaderRowHarness extends PblNgridColumnRowHarness {
    static hostSelector: string;
    getCellByColumnId(columnId: string): Promise<PblNgridColumnCellHarness>;
    getCells(filter?: ColumnHeaderCellHarnessFilters): Promise<PblNgridColumnHeaderCellHarness[]>;
}
export declare class PblNgridDataRowHarness extends PblNgridColumnRowHarness {
    static hostSelector: string;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nGrid data row with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options?: PblNgridDataRowHarnessFilters): HarnessPredicate<PblNgridDataRowHarness>;
    getRowIndex(): Promise<number | undefined>;
    getRowIdentity(): Promise<string | undefined>;
    getCells(filter?: DataCellHarnessFilters): Promise<PblNgridColumnHeaderCellHarness[]>;
}
export declare function getDataRowPredicate<T extends PblNgridDataRowHarness>(type: ComponentHarnessConstructor<T>, options: PblNgridDataRowHarnessFilters): HarnessPredicate<T>;
