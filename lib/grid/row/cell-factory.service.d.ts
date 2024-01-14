import { ComponentFactory, InjectionToken } from '@angular/core';
import { PblNgridBaseRowComponent } from './base-row.component';
import { GridRowType, PblRowTypeToCellTypeMap } from './types';
import * as i0 from "@angular/core";
export declare const NGRID_CELL_FACTORY: InjectionToken<PblNgridCellFactoryResolver<any>>;
export declare type PblNgridCellFactoryMap = {
    [P in GridRowType]: ComponentFactory<PblRowTypeToCellTypeMap<P>>;
};
export declare class PblNgridCellFactoryResolver<T = any> {
    private readonly factoryMap;
    constructor(factoryMap: any);
    getComponentFactory<TRowType extends GridRowType>(row: PblNgridBaseRowComponent<TRowType, T>): ComponentFactory<PblRowTypeToCellTypeMap<TRowType>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCellFactoryResolver<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridCellFactoryResolver<any>>;
}
