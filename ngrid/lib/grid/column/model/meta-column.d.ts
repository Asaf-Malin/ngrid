import { TemplateRef } from '@angular/core';
import { PblMetaColumnDefinition, PblColumnTypeDefinition } from '@asafmalin/ngrid/core';
import { PblNgridColumnDef } from '../directives/column-def';
import { PblNgridMetaCellContext } from '../../context/types';
export declare function isPblMetaColumn(def: any): def is PblMetaColumn;
export declare class PblMetaColumn implements PblMetaColumnDefinition {
    /**
    * A Unique ID for the column.
    * The ID must be unique across all columns, regardless of the type.
    * Columns with identical ID will share result in identical template.
    *
    * For example, having a header column and a footer column with the same id will result in the same cell presentation for both.
    */
    id: string;
    label?: string;
    /**
     * The type of the values in this column.
     * This is an additional level for matching columns to templates, grouping templates for a type.
     */
    type?: PblColumnTypeDefinition;
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
    kind: 'header' | 'footer';
    /**
     * The index (zero based) of the header row this column is attached to, used for multi-header setup.
     * When not set (undefined) the index is considered the LAST index.
     *
     * If you want to setup a multi header grid with 2 header rows, set this to 0 for the first header row and for the 2nd header
     * row do not set a rowIndex.
     */
    rowIndex: number;
    get parsedWidth(): {
        value: number;
        type: 'px' | '%';
    } | undefined;
    /**
     * Used by pbl-ngrid to apply a custom header/footer cell template, or the default when not set.
     * @internal
     */
    template: TemplateRef<PblNgridMetaCellContext<any>>;
    /**
     * When true indicates that the width is set with type pixels.
     * @internal
     */
    readonly isFixedWidth?: boolean;
    /**
     * The column def for this column.
     */
    get columnDef(): PblNgridColumnDef<PblMetaColumn>;
    private _width?;
    private _parsedWidth;
    private _columnDef;
    private defaultWidth;
    constructor(def: PblMetaColumnDefinition);
    static extendProperty(name: keyof PblMetaColumn): void;
    attach(columnDef: PblNgridColumnDef<PblMetaColumn>): void;
    detach(): void;
    updateWidth(fallbackDefault: string): void;
}
