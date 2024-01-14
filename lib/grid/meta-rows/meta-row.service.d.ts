import { Observable } from 'rxjs';
import { PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { PblNgridExtensionApi } from '../../ext/grid-ext-api';
import * as i0 from "@angular/core";
export interface PblMetaRow {
    element: HTMLElement;
    meta: PblMetaRowDefinitions;
    gridWidthRow: any;
}
export interface MetaRowSection {
    fixed: Array<{
        index: number;
        rowDef: PblMetaRowDefinitions;
        el?: HTMLElement;
    }>;
    row: Array<{
        index: number;
        rowDef: PblMetaRowDefinitions;
        el?: HTMLElement;
    }>;
    sticky: Array<{
        index: number;
        rowDef: PblMetaRowDefinitions;
        el?: HTMLElement;
    }>;
    all: PblMetaRowDefinitions[];
}
export declare class PblNgridMetaRowService<T = any> {
    readonly extApi: PblNgridExtensionApi<T>;
    gridWidthRow: {
        rowDef: PblMetaRowDefinitions;
        el: HTMLElement;
    };
    header: MetaRowSection;
    footer: MetaRowSection;
    /**
     * Notifies that changes occured in one or more meta rows (added/removed)
     * Multiple changes are aggregated (using asapScheduler)
     */
    readonly sync: Observable<void>;
    readonly hzScroll: Observable<number>;
    private sync$;
    private hzScroll$;
    constructor(extApi: PblNgridExtensionApi<T>);
    addMetaRow(metaRow: PblMetaRow): void;
    removeMetaRow(metaRow: PblMetaRow): void;
    private addToSection;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridMetaRowService<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridMetaRowService<any>>;
}
