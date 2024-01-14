import { AfterViewInit, ElementRef, Injector, QueryList, AfterContentInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef, TemplateRef, ViewContainerRef, EmbeddedViewRef, NgZone } from '@angular/core';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkHeaderRowDef, CdkFooterRowDef, CdkRowDef } from '@angular/cdk/table';
import { PblNgridConfigService, PblNgridPaginatorKind, DataSourcePredicate, PblNgridSortDefinition, PblDataSource, DataSourceOf, PblNgridColumnDefinitionSet, PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { PblNgridExtensionApi } from '../ext/grid-ext-api';
import { PblNgridPluginController, PblNgridPluginContext } from '../ext/plugin-control';
import { PblNgridRegistryService } from './registry/registry.service';
import { PblColumn, PblNgridColumnSet } from './column/model';
import { PblColumnStore, ColumnApi, AutoSizeToFitOptions } from './column/management';
import { PblNgridCellContext, PblNgridMetaCellContext, PblNgridContextApi, PblNgridRowContext } from './context/index';
import { PblCdkVirtualScrollViewportComponent } from './features/virtual-scroll/virtual-scroll-viewport.component';
import { PblNgridMetaRowService } from './meta-rows/meta-row.service';
import { RowsApi } from './row';
import * as i0 from "@angular/core";
export declare function internalApiFactory(grid: {
    _extApi: PblNgridExtensionApi;
}): PblNgridExtensionApi<any>;
export declare function pluginControllerFactory(grid: {
    _plugin: PblNgridPluginContext;
}): PblNgridPluginController<any>;
export declare function metaRowServiceFactory(grid: {
    _extApi: PblNgridExtensionApi;
}): PblNgridMetaRowService<any>;
declare module '../ext/types' {
    interface OnPropChangedSources {
        grid: PblNgridComponent;
    }
    interface OnPropChangedProperties {
        grid: Pick<PblNgridComponent, 'showFooter' | 'showHeader' | 'rowClassUpdate' | 'rowClassUpdateFreq'>;
    }
}
export declare class PblNgridComponent<T = any> implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy {
    private elRef;
    private ngZone;
    private cdr;
    private config;
    /** @deprecated Will be removed in v5 */
    registry: PblNgridRegistryService;
    readonly id: string;
    /**
     * Show/Hide the header row.
     * Default: true
     */
    get showHeader(): boolean;
    set showHeader(value: boolean);
    _showHeader: boolean;
    /**
     * Show/Hide the footer row.
     * Default: false
     */
    get showFooter(): boolean;
    set showFooter(value: boolean);
    _showFooter: boolean;
    /**
     * When true, the filler is disabled.
     */
    get noFiller(): boolean;
    set noFiller(value: boolean);
    _noFiller: boolean;
    /**
     * Set's the behavior of the grid when tabbing.
     * The default behavior is none (rows and cells are not focusable)
     *
     * Note that the focus mode has an effect on other functions, for example a detail row will toggle (open/close) using
     * ENTER / SPACE only when focusMode is set to `row`.
     */
    focusMode: 'row' | 'cell' | 'none' | '' | false | undefined;
    /**
     * The grid's source of data
     *
     * @remarks
     * The grid's source of data, which can be provided in 2 ways:
     *
     * - DataSourceOf<T>
     * - PblDataSource<T>
     *
     * The grid only works with `PblDataSource<T>`, `DataSourceOf<T>` is a shortcut for providing
     * the data array directly.
     *
     * `DataSourceOf<T>` can be:
     *
     * - Simple data array (each object represents one grid row)
     * - Promise for a data array
     * - Stream that emits a data array each time the array changes
     *
     * When a `DataSourceOf<T>` is provided it is converted into an instance of `PblDataSource<T>`.
     *
     * To access the `PblDataSource<T>` instance use the `ds` property (readonly).
     *
     * It is highly recommended to use `PblDataSource<T>` directly, the datasource factory makes it easy.
     * For example, when an array is provided the factory is used to convert it to a datasource:
     *
     * ```typescript
     * const collection: T[] = [];
     * const pblDataSource = createDS<T>().onTrigger( () => collection ).create();
     * ```
     *
     * > This is a write-only (setter) property that triggers the `setDataSource` method.
     */
    set dataSource(value: PblDataSource<T> | DataSourceOf<T>);
    get ds(): PblDataSource<T>;
    get usePagination(): PblNgridPaginatorKind | false | '';
    set usePagination(value: PblNgridPaginatorKind | false | '');
    get noCachePaginator(): boolean;
    set noCachePaginator(value: boolean);
    /**
     * The column definitions for this grid.
     */
    columns: PblNgridColumnSet | PblNgridColumnDefinitionSet;
    rowClassUpdate: undefined | ((context: PblNgridRowContext<T>) => (string | string[] | Set<string> | {
        [klass: string]: any;
    }));
    rowClassUpdateFreq: 'item' | 'ngDoCheck' | 'none';
    rowFocus: 0 | '';
    cellFocus: 0 | '';
    /**
     * The minimum height to assign to the data viewport (where data rows are shown)
     *
     * The data viewport is the scrollable area where all data rows are visible, and some metadata rows might also be there
     * depending on their type (fixed/row/sticky) as well as outer section items.
     *
     * By default, the data viewport has no size and it will grow based on the available space it has left within the container.
     * The container will first assign height to any fixed rows and dynamic content (before/after) provided.
     *
     * If the container height is fixed (e.g. `<pbl-ngrid style="height: 500px"></pbl-ngrid>`) and there is no height left
     * for the data viewport then it will get no height (0 height).
     *
     * To deal with this issue there are 2 options:
     *
     * 1. Do not limit the height of the container
     * 2. Provide a default minimum height for the data viewport
     *
     * Option number 1 is not practical, it will disable all scrolling in the table, making it a long box scrollable by the host container.
     *
     * This is where we use option number 2.
     * By defining a default minimum height we ensure visibility and since there's a scroll there, the user can view all of the data.
     *
     * There are 2 types of inputs:
     *
     * A. Default minimum height in PX
     * B. Default minimum height in ROW COUNT
     *
     * For A, provide a positive value, for B provide a negative value.
     *
     * For example:
     *
     *  - Minimum data viewport of 100 pixels: `<pbl-ngrid minDataViewHeight="100"></pbl-ngrid>`
     *  - Minimum data viewport of 2 ros: `<pbl-ngrid minDataViewHeight="-2"></pbl-ngrid>`
     *
     * Notes when using rows:
     *  - The row height is calculated based on an initial row pre-loaded by the grid, this row will get it's height from the CSS theme defined.
     *  - The ROW COUNT is the lower value between the actual row count provided and the total rows to render.
     *
     * ## Container Overflow:
     *
     * Note that when using a default minimum height, if the minimum height of the data viewport PLUS the height of all other elements in the container EXCEEDS any fixed
     * height assigned to the container, the container will render a scrollbar which results in the possibility of 2 scrollbars, 1 for the container and the seconds
     * for the data viewport, if it has enough data rows.
     */
    get minDataViewHeight(): number;
    set minDataViewHeight(value: number);
    /**
     * @deprecated Will be removed in v5, see `minDataViewHeight`
     */
    get fallbackMinHeight(): number;
    set fallbackMinHeight(value: number);
    get dir(): Direction;
    private _dir;
    private _minDataViewHeight;
    private _dataSource;
    _vcRefBeforeTable: ViewContainerRef;
    _vcRefBeforeContent: ViewContainerRef;
    _vcRefAfterContent: ViewContainerRef;
    _fbTableCell: TemplateRef<PblNgridCellContext<T>>;
    _fbHeaderCell: TemplateRef<PblNgridMetaCellContext<T>>;
    _fbFooterCell: TemplateRef<PblNgridMetaCellContext<T>>;
    _tableRowDef: CdkRowDef<T>;
    _headerRowDefs: QueryList<CdkHeaderRowDef>;
    _footerRowDefs: QueryList<CdkFooterRowDef>;
    /**
     * When true, the virtual paging feature is enabled because the virtual content size exceed the supported height of the browser so paging is enable.
     */
    get virtualPagingActive(): boolean;
    get metaHeaderRows(): (import("./column/management").PblColumnStoreMetaRow & {
        allKeys?: string[];
    })[];
    get metaFooterRows(): (import("./column/management").PblColumnStoreMetaRow & {
        allKeys?: string[];
    })[];
    get metaColumns(): PblColumnStore['metaColumns'];
    get columnRowDef(): {
        header: PblMetaRowDefinitions;
        footer: PblMetaRowDefinitions;
    };
    /**
     * True when the component is initialized (after AfterViewInit)
     */
    readonly isInit: boolean;
    readonly columnApi: ColumnApi<T>;
    readonly rowsApi: RowsApi<T>;
    readonly contextApi: PblNgridContextApi<T>;
    get viewport(): PblCdkVirtualScrollViewportComponent;
    get innerTableMinWidth(): number;
    private _store;
    private _pagination;
    private _noCachePaginator;
    private _plugin;
    private _extApi;
    private _cdkTable;
    private _viewport;
    constructor(injector: Injector, vcRef: ViewContainerRef, elRef: ElementRef<HTMLElement>, ngZone: NgZone, cdr: ChangeDetectorRef, config: PblNgridConfigService, 
    /** @deprecated Will be removed in v5 */
    registry: PblNgridRegistryService, id: string, dir?: Directionality);
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    trackBy(index: number, item: T): any;
    /**
     * Clear the current sort definitions.
     * This method is a proxy to `PblDataSource.setSort`, For more information see `PblDataSource.setSort`
     *
     * @param skipUpdate When true will not update the datasource, use this when the data comes sorted and you want to sync the definitions with the current data set.
     * default to false.
     */
    setSort(skipUpdate?: boolean): void;
    /**
     * Set the sorting definition for the current data set.
     *
     * This method is a proxy to `PblDataSource.setSort` with the added sugar of providing column by string that match the `id` or `alias` properties.
     * For more information see `PblDataSource.setSort`
     *
     * @param columnOrAlias A column instance or a string matching `PblColumn.alias` or `PblColumn.id`.
     * @param skipUpdate When true will not update the datasource, use this when the data comes sorted and you want to sync the definitions with the current data set.
     * default to false.
     */
    setSort(columnOrAlias: PblColumn | string, sort: PblNgridSortDefinition, skipUpdate?: boolean): void;
    /**
     * Clear the filter definition for the current data set.
     *
     * This method is a proxy to `PblDataSource.setFilter`, For more information see `PblDataSource.setFilter`.
     */
    setFilter(): void;
    /**
     * Set the filter definition for the current data set using a function predicate.
     *
    * This method is a proxy to `PblDataSource.setFilter` with the added sugar of providing column by string that match the `id` property.
     * For more information see `PblDataSource.setFilter`
     */
    setFilter(value: DataSourcePredicate, columns?: PblColumn[] | string[]): void;
    /**
     * Set the filter definition for the current data set using a value to compare with and a list of columns with the values to compare to.
     *
     * This method is a proxy to `PblDataSource.setFilter` with the added sugar of providing column by string that match the `id` property.
     * For more information see `PblDataSource.setFilter`
     */
    setFilter(value: any, columns: PblColumn[] | string[]): void;
    setDataSource(value: PblDataSource<T>): void;
    /**
     * Invalidates the header, including a full rebuild of column headers
     */
    invalidateColumns(): void;
    /**
     * Create an embedded view before or after the user projected content.
     */
    createView<C>(location: 'beforeTable' | 'beforeContent' | 'afterContent', templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    /**
     * Remove an already created embedded view.
     * @param view - The view to remove
     * @param location - The location, if not set defaults to `before`
     * @returns true when a view was removed, false when not. (did not exist in the view container for the provided location)
     */
    removeView(view: EmbeddedViewRef<any>, location: 'beforeTable' | 'beforeContent' | 'afterContent'): boolean;
    /**
     * Resize all visible columns to fit content of the grid.
     * @param forceFixedWidth - When true will resize all columns with absolute pixel values, otherwise will keep the same format as originally set (% or none)
     */
    autoSizeColumnToFit(options?: AutoSizeToFitOptions): void;
    findInitialRowHeight(): number;
    addClass(...cls: string[]): void;
    removeClass(...cls: string[]): void;
    private getInternalVcRef;
    private resetHeaderRowDefs;
    private resetFooterRowDefs;
    static ngAcceptInputType_showHeader: BooleanInput;
    static ngAcceptInputType_showFooter: BooleanInput;
    static ngAcceptInputType_noFiller: BooleanInput;
    static ngAcceptInputType_noCachePaginator: BooleanInput;
    static ngAcceptInputType_minDataViewHeight: NumberInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridComponent<any>, [null, null, null, null, null, null, null, { attribute: "id"; }, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PblNgridComponent<any>, "pbl-ngrid", never, { "showHeader": "showHeader"; "showFooter": "showFooter"; "noFiller": "noFiller"; "focusMode": "focusMode"; "dataSource": "dataSource"; "usePagination": "usePagination"; "noCachePaginator": "noCachePaginator"; "columns": "columns"; "rowClassUpdate": "rowClassUpdate"; "rowClassUpdateFreq": "rowClassUpdateFreq"; "minDataViewHeight": "minDataViewHeight"; "fallbackMinHeight": "fallbackMinHeight"; }, {}, never, ["*"], false>;
}
