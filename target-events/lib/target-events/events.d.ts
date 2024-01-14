import { PblColumn, PblMetaColumn, PblColumnGroup, PblNgridCellContext, PblNgridRowContext } from '@asafmalin/ngrid';
export declare type ROW_TYPE = 'header' | 'data' | 'footer';
export interface ROW_META_TYPE {
    data: PblColumn;
    meta: PblMetaColumn;
    'meta-group': PblColumnGroup;
}
export interface PblNgridMatrixRow<RType extends ROW_TYPE, RMetaType extends keyof ROW_META_TYPE = 'data'> {
    type: RType;
    subType: RMetaType;
    rowIndex: number;
}
export interface PblNgridMatrixPoint<RType extends ROW_TYPE, RMetaType extends keyof ROW_META_TYPE = 'data'> extends PblNgridMatrixRow<RType, RMetaType> {
    /** The RENDER column index */
    colIndex: number;
}
export interface PblNgridDataMatrixRow<T = any> extends PblNgridMatrixRow<'data'> {
    row: T;
    context: PblNgridRowContext<T>;
}
export interface PblNgridColumnMatrixPoint<RType extends ROW_TYPE, RMetaType extends keyof ROW_META_TYPE = 'data'> extends PblNgridMatrixPoint<RType, RMetaType> {
    column: ROW_META_TYPE[RMetaType];
    /**
     * The context of the cell.
     * Only applicable when the event is coming from a data cell or a column header of a data cell.
     */
    context?: PblNgridCellContext;
}
export interface PblNgridDataMatrixPoint<T = any> extends PblNgridColumnMatrixPoint<'data'> {
    row: T;
}
export declare type PblNgridBaseCellEvent<TEvent extends Event = MouseEvent | KeyboardEvent> = {
    source: TEvent;
    cellTarget: HTMLElement;
    rowTarget: HTMLElement;
};
export declare type PblNgridDataCellEvent<T = any, TEvent extends Event = MouseEvent | KeyboardEvent> = PblNgridBaseCellEvent<TEvent> & PblNgridDataMatrixPoint<T>;
export declare type PblNgridMetaCellEvent<TEvent extends Event = MouseEvent | KeyboardEvent> = PblNgridBaseCellEvent<TEvent> & (PblNgridColumnMatrixPoint<'header' | 'footer'> | PblNgridColumnMatrixPoint<'header' | 'footer', 'meta'> | PblNgridColumnMatrixPoint<'header' | 'footer', 'meta-group'>);
export declare type PblNgridCellEvent<T = any, TEvent extends Event = MouseEvent | KeyboardEvent> = PblNgridBaseCellEvent<TEvent> & (PblNgridDataCellEvent<T, TEvent> | PblNgridMetaCellEvent<TEvent>);
export declare type PblNgridRowEvent<T = any> = {
    source: MouseEvent | KeyboardEvent;
    rowTarget: HTMLElement;
    root?: PblNgridCellEvent<T>;
} & (PblNgridDataMatrixRow<T> | PblNgridMatrixRow<'header' | 'footer'> | PblNgridMatrixRow<'header' | 'footer', 'meta'> | PblNgridMatrixRow<'header' | 'footer', 'meta-group'>);
