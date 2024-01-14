import { PblNgridColumnDefinitionSet } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController, PblDataSource, PblColumn } from '@asafmalin/ngrid';
export declare const LOCAL_COLUMN_DEF: unique symbol;
export declare const VIRTUAL_REFRESH: {};
export declare class TransposeTableSession {
    private grid;
    private pluginCtrl;
    private updateColumns;
    private sourceFactoryWrapper;
    dsSourceFactory: any;
    ds: PblDataSource<any>;
    columnsInput: PblNgridColumnDefinitionSet;
    storeColumns: PblColumn[];
    headerRow: boolean;
    private destroyed;
    private rawSource;
    constructor(grid: PblNgridComponent<any>, pluginCtrl: PblNgridPluginController, updateColumns: () => void, sourceFactoryWrapper: (results: any[]) => any[]);
    destroy(updateTable: boolean): void;
    private init;
    private onInvalidateHeaders;
    private onDataSource;
    private unPatchDataSource;
}
