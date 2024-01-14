import { _PblNgridComponent } from '../../tokens';
import { PblNgridExtensionApi } from '../../ext/grid-ext-api';
import { CellContextState, ExternalCellContextState, PblNgridCellContext, PblNgridMetaCellContext, PblNgridRowContext } from './types';
import { PblColumn, PblMetaColumn } from '../column/model';
import { PblRowContext } from './row';
export declare class MetaCellContext<T = any, TCol extends PblMetaColumn | PblColumn = PblMetaColumn> implements PblNgridMetaCellContext<T, TCol> {
    col: TCol;
    grid: _PblNgridComponent<any>;
    get $implicit(): MetaCellContext<T, TCol>;
    protected constructor();
    static create<T = any, TCol extends PblMetaColumn | PblColumn = PblMetaColumn>(col: TCol, grid: _PblNgridComponent<T>): MetaCellContext<T, TCol>;
}
export declare class PblCellContext<T = any> implements PblNgridCellContext<T> {
    get $implicit(): PblCellContext<T>;
    get row(): T;
    get value(): any;
    set value(v: any);
    get rowContext(): PblNgridRowContext<T>;
    get editing(): boolean;
    get focused(): boolean;
    get selected(): boolean;
    readonly grid: _PblNgridComponent<any>;
    readonly index: number;
    private _editing;
    private _focused;
    private _selected;
    private _external;
    private _rowContext;
    col: PblColumn;
    private extApi;
    protected constructor();
    static create<T = any>(rowContext: PblRowContext<T>, col: PblColumn, extApi: PblNgridExtensionApi<T>): PblCellContext<T>;
    static defaultState<T = any>(): CellContextState<T>;
    clone(col?: PblColumn): PblCellContext<T>;
    getExternal<P extends keyof ExternalCellContextState>(key: P): ExternalCellContextState[P];
    setExternal<P extends keyof ExternalCellContextState>(key: P, value: ExternalCellContextState[P], saveState?: boolean): void;
    getState(): CellContextState<T>;
    fromState(state: CellContextState<T>, rowContext: PblRowContext<T>, skipRowUpdate?: boolean): void;
    startEdit(markForCheck?: boolean): void;
    stopEdit(markForCheck?: boolean): void;
}
