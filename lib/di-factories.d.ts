import { ComponentFactoryResolver } from '@angular/core';
import { PblNgridCellFactoryMap, PblNgridCellFactoryResolver } from './grid/row/cell-factory.service';
export declare function ngridCellFactory(cfr: ComponentFactoryResolver): PblNgridCellFactoryMap;
export declare const PROVIDERS: (typeof PblNgridCellFactoryResolver | {
    provide: import("@angular/core").InjectionToken<PblNgridCellFactoryResolver<any>>;
    useFactory: typeof ngridCellFactory;
    deps: (typeof ComponentFactoryResolver)[];
})[];
