import { IterableDiffers, IterableDiffer, OnDestroy, AfterViewInit } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        sticky?: PblNgridStickyPluginDirective;
    }
}
export declare const PLUGIN_KEY: 'sticky';
export declare function setStickyRow(grid: PblNgridComponent<any>, type: 'header' | 'footer', bulk: Array<['table' | number, boolean]>): void;
export declare function setStickyRow(grid: PblNgridComponent<any>, type: 'header' | 'footer', value: 'table' | number, state: boolean): void;
export declare function setStickyColumns(grid: PblNgridComponent<any>, type: 'start' | 'end', bulk: Array<[string | number, boolean]>): void;
export declare function setStickyColumns(grid: PblNgridComponent<any>, type: 'start' | 'end', value: string | number, state: boolean): void;
export declare class PblNgridStickyPluginDirective implements AfterViewInit, OnDestroy {
    protected readonly grid: PblNgridComponent<any>;
    protected readonly _differs: IterableDiffers;
    protected readonly pluginCtrl: PblNgridPluginController;
    /**
     * Set the header rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main header row.
     *   - number  - The index of the row, for multi-header row. The index refers to the order you defined the header/headerGroup rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyColumnStart(value: Array<string | number>);
    /**
     * Set the footer rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main footer row.
     *   - number  - The index of the row, for multi-footer row. The index refers to the order you defined the footer rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyColumnEnd(value: Array<string | number>);
    /**
   * Set the header rows you want to apply sticky positioning to.
   * Valid values are:
   *   - `grid` - Literal string `grid` that will set the grid's main header row.
   *   - number  - The index of the row, for multi-header row. The index refers to the order you defined the header/headerGroup rows (base 0);
   *
   * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
   * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
   */
    set stickyHeader(value: Array<'table' | number>);
    /**
     * Set the footer rows you want to apply sticky positioning to.
     * Valid values are:
     *   - `grid` - Literal string `grid` that will set the grid's main footer row.
     *   - number  - The index of the row, for multi-footer row. The index refers to the order you defined the footer rows (base 0);
     *
     * For performance considerations only new values will trigger a change (i.e. the array should be treated as immutable).
     * Manipulating the array will not trigger a change (the sticky state will not change) unless sending a copy of it (replacing it, e.g. Array.slice())
     */
    set stickyFooter(value: Array<'table' | number>);
    private _startDiffer;
    private _endDiffer;
    private _headerDiffer;
    private _footerDiffer;
    private _columnCache;
    private _removePlugin;
    private viewInitialized;
    constructor(grid: PblNgridComponent<any>, _differs: IterableDiffers, pluginCtrl: PblNgridPluginController);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected applyColumnDiff(type: 'start' | 'end', value: Array<string | number>, differ: IterableDiffer<string | number>): void;
    protected applyRowDiff(type: 'header' | 'footer', value: Array<'table' | number>, differ: IterableDiffer<'table' | number>): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridStickyPluginDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridStickyPluginDirective, "pbl-ngrid[stickyColumnStart], pbl-ngrid[stickyColumnEnd], pbl-ngrid[stickyHeader], pbl-ngrid[stickyFooter]", never, { "stickyColumnStart": "stickyColumnStart"; "stickyColumnEnd": "stickyColumnEnd"; "stickyHeader": "stickyHeader"; "stickyFooter": "stickyFooter"; }, {}, never, never, false>;
}
