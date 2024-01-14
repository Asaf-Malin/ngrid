import { OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { PblNgridConfigService, PblColumnDefinition } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/configuration/type' {
    interface PblNgridConfig {
        transposePlugin?: {
            header?: Partial<PblColumnDefinition>;
            defaultCol?: Partial<PblColumnDefinition>;
            matchTemplates?: boolean;
        };
    }
}
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        transpose?: PblNgridTransposePluginDirective;
    }
}
export declare const PLUGIN_KEY: 'transpose';
/**
 * Transpose plugin.
 *
 * This plugin will swaps around the rows and columns of the grid.
 *
 * A **regular grid** (not transposed) represents rows horizontally:
 *
 * - Each horizontal row represents an item in the collection.
 * - Each vertical column represents the same property of all rows in the collection.
 *
 * A **transposed** grid represents row vertically:
 *
 * - Each horizontal row represents the same property of all rows in the collection.
 * - Each vertical row represents an item in the collection.
 *
 * > Note that transposing a grid might not play nice with other plugins and/or features.
 * For example, using pagination with transpose make no sense.
 */
export declare class PblNgridTransposePluginDirective implements OnDestroy {
    private grid;
    private pluginCtrl;
    get transpose(): boolean;
    set transpose(value: boolean);
    /**
     * Column definitions for the new header column, this is the column the first column that
     * will display all the headers.
     *
     * This is an optional value, when not set a default column settings is used:
     *
     * ```js
     * {
     *  prop: '__transpose__',
     *  css: 'pbl-ngrid-header-cell pbl-ngrid-transposed-header-cell',
     * }
     * ```
     *
     * When set, the new column values will merge into the default definitions, overriding existing properties
     * set on the default column settings.
     *
     * > The header column behave like any other column and you can also provide define it in the `column` property on the grid.
     * When using this approach the column defined on the grid is used as is (no merging). Just make sure you use the right `prop` value for it.
     * e.g. if `header` is not set here its `__transpose__` otherwise, the actual `prop` value.
     */
    set header(value: Partial<PblColumnDefinition>);
    /**
     * Column definitions to be used as the base default definitions for the new transposed columns.
     * This is an optional value, when not set no default's are applied.
     */
    defaultCol: Partial<PblColumnDefinition>;
    /**
     * When true, will try to use the original template of the cell, i.e. the template that would have been used
     * if we did not transpose at all.
     *
     * Defaults to false.
     */
    matchTemplates: boolean;
    private enabled;
    private _header;
    private gridState;
    private columns;
    private selfColumn;
    private _removePlugin;
    constructor(grid: PblNgridComponent<any>, pluginCtrl: PblNgridPluginController, config: PblNgridConfigService);
    ngOnDestroy(): void;
    disable(updateTable: boolean): void;
    enable(refreshDataSource?: boolean): void;
    private updateState;
    private updateColumns;
    static ngAcceptInputType_transpose: BooleanInput;
    static ngAcceptInputType_matchTemplates: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridTransposePluginDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridTransposePluginDirective, "pbl-ngrid[transpose]", never, { "transpose": "transpose"; "header": "transposeHeaderCol"; "defaultCol": "transposeDefaultCol"; "matchTemplates": "matchTemplates"; }, {}, never, never, false>;
}
