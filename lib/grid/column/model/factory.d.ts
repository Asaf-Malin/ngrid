import { PblBaseColumnDefinition, PblColumnDefinition, PblColumnGroupDefinition, PblMetaColumnDefinition, PblNgridColumnDefinitionSet, PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { PblNgridColumnSet } from './types';
import { PblMetaColumn } from './meta-column';
import { PblColumn } from './column';
import { PblColumnGroup } from './group-column';
export declare type COLUMN = PblMetaColumn | PblColumn | PblColumnGroup;
export declare class PblColumnFactory {
    private _raw;
    private _defaults;
    private _currentHeaderRow;
    private _currentFooterRow;
    get currentHeaderRow(): number;
    get currentFooterRow(): number;
    static fromDefinitionSet(defs: PblNgridColumnDefinitionSet): PblColumnFactory;
    build(): PblNgridColumnSet;
    /**
     * Set the default column definition for header/footer columns.
     */
    default(def: Partial<PblMetaColumnDefinition>, type: 'header' | 'footer'): this;
    /**
     * Set the default column definition for table columns.
     */
    default(def: Partial<PblColumnDefinition>, type?: 'table'): this;
    /**
     * Add grid columns.
     *
     * Table columns are mandatory, they are the columns that define the structure of the data source.
     *
     * Each column will usually point to property on the row, although you can create columns that does not
     * exist on the row and handle their rendering with a cell template.
     *
     * Each grid column is also a header column and a footer column that display.
     * The header and footer are automatically created, If you wish not to show them set headerRow/footerRow to false in PblTable.
     *
     */
    table(rowOptions: {
        header?: PblMetaRowDefinitions;
        footer?: PblMetaRowDefinitions;
    }, ...defs: PblColumnDefinition[]): this;
    table(...defs: PblColumnDefinition[]): this;
    /**
     * Add a new header row with header columns.
     * Creates an additional header row in position `currentHeaderRow` using the provided header column definitions.
     * Each definition represent a cell, the cell's does not have to align with the layout of grid columns.
     *
     * All header row will position BEFORE the grid column header row.
     * Header columns are optional.
     * Each call to `header()` will create a new row, incrementing the `currentHeaderRow`.
     *
     * @remarks
     * Example:
     * ```js
     *   factory.table(1, 2, 3)
     *     .header(a, b, c).header(d, e, f);
     * ```
     *
     * will result in:
     *   header1 -\>  a b c
     *   header2 -\>  d e f
     *   table   -\>  1 2 3
     */
    header(rowOptions: PblMetaRowDefinitions, ...defs: Array<Pick<PblMetaColumnDefinition, 'id'> & Partial<PblMetaColumnDefinition> & PblBaseColumnDefinition>): this;
    header(...defs: Array<Pick<PblMetaColumnDefinition, 'id'> & Partial<PblMetaColumnDefinition> & PblBaseColumnDefinition>): this;
    /**
     * Add a new footer row with footer columns.
     * Creates an additional footer row in position `currentFooterRow` using the provided footer column definitions.
     * Each definition represent a cell, the cell's does not have to align with the layout of grid columns.
     *
     * All footer row will position AFTER the grid column footer row.
     * Footer columns are optional.
     * Each call to `footer()` will create a new row, incrementing the `currentFooterRow`.
     *
     * @remarks
     * Example:
     * ```js
     *   factory.table(1, 2, 3)
     *     .footer(a, b, c).footer(d, e, f);
     * ```
     *
     * will result in:
     *   table   -\>  1 2 3
     *   footer1 -\>  a b c
     *   footer2 -\>  d e f
     */
    footer(rowOptions: PblMetaRowDefinitions, ...defs: Array<Pick<PblMetaColumnDefinition, 'id'> & Partial<PblMetaColumnDefinition> & PblBaseColumnDefinition>): this;
    footer(...defs: Array<Pick<PblMetaColumnDefinition, 'id'> & Partial<PblMetaColumnDefinition> & PblBaseColumnDefinition>): this;
    /**
     * Add a new header row with header group columns.
     * A header group column is a columns is a header columns that spans one or more columns.
     *
     * Create an additional header row in position `currentHeaderRow` using the provided header column definitions.
     * Each definition represent a cell, the cell's does not have to align with the layout of grid columns.
     *
     * All header row will position BEFORE the grid column header row.
     * Header columns are optional.
     * Each call to `header()` will create a new row, incrementing the `currentHeaderRow`.
     *
     * @remarks
     * Example:
     * ```js
     *   factory.table(1, 2, 3)
     *     .header(a, b, c).header(d, e, f);
     * ```
     *
     * will result in:
     *   header1 -\>  a b c
     *   header2 -\>  d e f
     *   table   -\>  1 2 3
     */
    headerGroup(rowOptions: PblMetaRowDefinitions, ...defs: Array<Partial<Omit<PblColumnGroupDefinition, 'rowIndex' | 'kind'>>>): this;
    headerGroup(...defs: Array<Partial<Omit<PblColumnGroupDefinition, 'rowIndex' | 'kind'>>>): this;
    private processRowOptions;
    private genRowClass;
    private buildHeaderGroups;
}
export declare function columnFactory(): PblColumnFactory;
