import { Subject } from 'rxjs';
import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
import { PblColumn } from '../model/column';
import { DynamicColumnWidthLogic } from './dynamic-column-width';
export declare class PblNgridColumnWidthCalc {
    private readonly extApi;
    readonly dynamicColumnWidth: DynamicColumnWidthLogic;
    readonly onWidthCalc: Subject<DynamicColumnWidthLogic>;
    private readonly columnStore;
    constructor(extApi: PblNgridInternalExtensionApi);
    /**
     * Updates the column sizes for all columns in the grid based on the column definition metadata for each column.
     * The final width represent a static width, it is the value as set in the definition (except column without width, where the calculated global width is set).
     */
    resetColumnsWidth(): void;
    calcColumnWidth(columns?: PblColumn[]): void;
    /**
     * Update the size of all group columns in the grid based on the size of their visible children (not hidden).
     * @param dynamicWidthLogic - Optional logic container, if not set a new one is created.
     */
    private syncColumnGroupsSize;
    private listenToResize;
    private onResize;
}
