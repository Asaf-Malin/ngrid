import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
import { PblColumn } from '../../column/model/column';
import { PblColumnSizeObserver } from './column-size-observer';
/**
 * A controller that groups columns of a grid and listens to resize events
 * and will notify the grid once resize occurs
 */
export declare class PblNgridColumnSizeObserverGroup {
    private extApi;
    private entries;
    private ro;
    private columns;
    constructor(extApi: PblNgridInternalExtensionApi);
    static get(extApi: PblNgridInternalExtensionApi): PblNgridColumnSizeObserverGroup;
    has(col: PblColumnSizeObserver): boolean;
    hasColumn(column: PblColumn): boolean;
    add(col: PblColumnSizeObserver): void;
    remove(col: PblColumnSizeObserver): void;
    private onResize;
}
