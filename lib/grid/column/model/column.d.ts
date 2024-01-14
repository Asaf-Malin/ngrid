import { TemplateRef } from '@angular/core';
import { DataSourceColumnPredicate, PblNgridSorter, PblColumnDefinition, PblColumnTypeDefinition } from '@asafmalin/ngrid/core';
import { PblNgridMetaCellContext, PblNgridCellContext } from '../../context/types';
import { PblNgridColumnDef } from '../directives/column-def';
import { PblColumnSizeInfo } from './types';
import { PblColumnGroup, PblColumnGroupStore } from './group-column';
export declare function isPblColumn(def: any): def is PblColumn;
export declare class PblColumn implements PblColumnDefinition {
    id: string;
    /**
     * When set, defines this column as the primary index of the data-set with all values in this column being unique.
     */
    pIndex?: boolean;
    label?: string;
    /**
     * CSS class that get applied on the header and cell.
     * You can apply unique header/cell styles using the element name.
     */
    css?: string;
    /**
     * The width in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     */
    get width(): string;
    set width(value: string);
    /**
     * This minimum width in pixels
     * This is an absolute value, thus a number.
     */
    minWidth?: number;
    /**
     * This maximum width in pixels
     * This is an absolute value, thus a number.
     */
    maxWidth?: number;
    /**
     * A place to store things...
     * This must be an object, values are shadow-copied so persist data between multiple plugins.
     */
    data: any;
    get parsedWidth(): {
        value: number;
        type: 'px' | '%';
    } | undefined;
    /**
     * The property to display (from the row element)
     * You can use dot notation to display deep paths.
     */
    prop: string;
    /**
     * A path to a nested object, relative to the row element.
     * The table will display `prop` from the object referenced by `path`.
     *
     * You can also use dot notation directly from `prop`.
     *
     * Example:
     * prop: "street"
     * path: [ "myInstance", "user", "address"
     *
     * is identical to:
     * prop: "myInstance.user.address.street"
     *
     */
    path?: string[];
    /**
     * The type of the values in this column.
     * This is an additional level for matching columns to templates, grouping templates for a type.
     */
    type?: PblColumnTypeDefinition;
    headerType?: PblColumnTypeDefinition;
    footerType?: PblColumnTypeDefinition;
    sort?: boolean | PblNgridSorter;
    /**
     * A custom predicate function to filter rows using the current column.
     *
     * Valid only when filtering by value.
     * See `PblDataSource.setFilter` for more information.
     */
    filter?: DataSourceColumnPredicate;
    /**
     * Marks the table as editable. An editable column also requires an edit template to qualify as editable, this flag alone is not enough.
     *
     * Note that this flag only effect the CSS class added to the cell.
     */
    editable: boolean;
    pin: 'start' | 'end' | undefined;
    /**
     * An alias used to identify the column.
     * Useful when the server provides sort/filter metadata that does not have a 1:1 match with the column names.
     * e.g. Deep path props, property name convention mismatch, etc...
     */
    alias?: string;
    /**
     * Optional transformer that control the value output from the combination of a column and a row.
     * The value returned from this transformer will be returned from `PblColumn.getValue`
     */
    transform?: (value: any, row?: any, col?: PblColumnDefinition) => any;
    /**
     * The original value of `prop`.
     * @internal
     */
    orgProp: string;
    /**
     * Used by pbl-ngrid to apply custom cell template, or the default when not set.
     * @internal
     */
    cellTpl: TemplateRef<PblNgridCellContext<any>>;
    /**
   * Used by pbl-ngrid to apply custom cell template, or the default when not set.
   * @internal
   */
    editorTpl: TemplateRef<PblNgridCellContext<any>>;
    /**
     * Used by pbl-ngrid to apply a custom header cell template, or the default when not set.
     * @internal
     */
    headerCellTpl: TemplateRef<PblNgridMetaCellContext<any>>;
    /**
     * Used by pbl-ngrid to apply a custom footer cell template, or the default when not set.
     * @internal
     */
    footerCellTpl: TemplateRef<PblNgridMetaCellContext<any>>;
    /**
     * Used by the library as a logical flag representing the column hidden state.
     * This flag does not effect the UI, changing it will not change he hidden state in the UI.
     * Do not set this value manually.
     * @internal
     */
    hidden: boolean;
    /**
     * When true indicates that the width is set with type pixels.
     * @internal
     */
    readonly isFixedWidth?: boolean;
    /**
     * An on-demand size info object, populated by `PblColumnSizeObserver`
     * @internal
     */
    sizeInfo?: PblColumnSizeInfo;
    /** @internal */
    maxWidthLock: boolean;
    /**
     * The column def for this column.
     */
    get columnDef(): PblNgridColumnDef<PblColumn>;
    get groups(): string[];
    /** @internal */
    readonly groupStore: PblColumnGroupStore;
    private _width?;
    private _parsedWidth;
    private _columnDef;
    private defaultWidth;
    /**
     * Groups that this column belongs to.
     * WARNING: DO NOT ADD/REMOVE GROUPS DIRECTLY, USE markInGroup/markNotInGroup.
     */
    private _groups;
    constructor(def: PblColumn | PblColumnDefinition, groupStore?: PblColumnGroupStore);
    static extendProperty(name: keyof PblColumn): void;
    attach(columnDef: PblNgridColumnDef<PblColumn>): void;
    detach(): void;
    setDefaultWidth(defaultWidth: string): void;
    updateWidth(width?: string): void;
    /**
     * Get the value this column points to in the provided row
     */
    getValue<T = any>(row: any): T;
    /**
     * Set a value in the provided row where this column points to
     */
    setValue(row: any, value: any): void;
    /**
     * Mark's that this column belong to the provided group.
     * \> Note that this internal to the column and does not effect the group in any way.
     */
    markInGroup(g: PblColumnGroup): void;
    /**
     * Mark's that this column does not belong to the provided group.
     * \> Note that this internal to the column and does not effect the group in any way.
     */
    markNotInGroup(g: PblColumnGroup): boolean;
    isInGroup(g: PblColumnGroup): boolean;
    getGroupOfRow(rowIndex: number): PblColumnGroup | undefined;
    groupLogic(columnGroups: [PblColumnGroup, PblColumnGroup, PblColumnGroup], groupExists: boolean): PblColumnGroup;
    /**
     * Calculates if the column width is locked by a maximum by checking if the given width is equal to the max width.
     * If the result of the calculation (true/false) does not equal the previous lock state it will set the new lock state
     * and return true.
     * Otherwise return false.
     * @internal
     */
    checkMaxWidthLock(actualWidth: number): boolean;
}
