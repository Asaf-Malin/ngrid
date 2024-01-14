import { IterableDiffers, TemplateRef, OnInit } from '@angular/core';
import { CdkRowDef } from '@angular/cdk/table';
import { _PblNgridComponent } from '../../tokens';
import { PblNgridRegistryService } from '../registry/registry.service';
import { PblNgridRowContext } from '../context/types';
import { PblNgridExtensionApi } from '../../ext/grid-ext-api';
import * as i0 from "@angular/core";
export declare class PblNgridRowDef<T> extends CdkRowDef<T> {
    protected registry: PblNgridRegistryService;
    _table?: any;
    /**
     * Empty rows.
     * We don't supply column rows to the CdkTable so it will not render them.
     * We render internally.
     */
    columns: Iterable<string>;
    constructor(template: TemplateRef<PblNgridRowContext<T>>, _differs: IterableDiffers, registry: PblNgridRegistryService, _table?: any);
    getColumnsDiff(): any;
    clone(): this;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRowDef<any>, [null, null, null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridRowDef<any>, "[pblNgridRowDef]", never, { "columns": "pblNgridRowDefColumns"; "when": "pblNgridRowDefWhen"; }, {}, never, never, false>;
}
/**
 * A directive for quick replacements of the row container component.
 *
 * When used inside the content of the grid:
 *
 * ```html
 * <pbl-ngrid [dataSource]="ds" [columns]="columns">
 *   <pbl-ngrid-row *pblNgridRowOverride="let row;" row></pbl-ngrid-row>
 * </pbl-ngrid>
 * ```
 *
 * However, when used outside of the grid you must provide a reference to the grid so it can register as a template:
 *
 * ```html
 * <pbl-ngrid-row *pblNgridRowOverride="let row; grid: myGrid" row></pbl-ngrid-row>
 * <pbl-ngrid #myGrid [dataSource]="ds" [columns]="columns"></pbl-ngrid>
 * ```
 */
export declare class PblNgridRowOverride<T> extends PblNgridRowDef<T> implements OnInit {
    private extApi?;
    grid: _PblNgridComponent<T>;
    constructor(template: TemplateRef<PblNgridRowContext<T>>, _differs: IterableDiffers, registry: PblNgridRegistryService, extApi?: PblNgridExtensionApi<T>);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridRowOverride<any>, [null, null, null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridRowOverride<any>, "[pblNgridRowOverride]", never, { "columns": "pblNgridRowDefColumns"; "when": "pblNgridRowDefWhen"; "grid": "pblNgridRowDefGrid"; }, {}, never, never, false>;
}
