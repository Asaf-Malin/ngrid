import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { PblNgridColumnHeaderRowHarness, PblNgridDataRowHarness } from '../row/ngrid-column-row-harness';
import { PblNgridHarnessFilters } from '../ngrid-harness-filters';
export declare class PblNgridHarness extends ContentContainerComponentHarness {
    static hostSelector: string;
    static register<P extends keyof PblNgridHarness>(key: P, method: PblNgridHarness[P]): void;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nGrid with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options?: PblNgridHarnessFilters): HarnessPredicate<PblNgridHarness>;
    getColumnHeaderRow(): Promise<PblNgridColumnHeaderRowHarness>;
    getDataRow(rowIdentity: string): Promise<PblNgridDataRowHarness | undefined>;
    getDataRow(rowIndex: number): Promise<PblNgridDataRowHarness | undefined>;
    getDataRows(): Promise<PblNgridDataRowHarness[]>;
}
