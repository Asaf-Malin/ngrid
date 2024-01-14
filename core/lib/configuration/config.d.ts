import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { PblNgridConfig } from './type';
import * as i0 from "@angular/core";
export declare const PEB_NGRID_CONFIG: InjectionToken<PblNgridConfig>;
export declare class PblNgridConfigService {
    private config;
    private configNotify;
    constructor(_config: PblNgridConfig);
    has(section: keyof PblNgridConfig): boolean;
    get<T extends keyof PblNgridConfig>(section: T, fallback?: Partial<PblNgridConfig[T]>): PblNgridConfig[T] | undefined;
    set<T extends keyof PblNgridConfig>(section: T, value: PblNgridConfig[T]): void;
    onUpdate<T extends keyof PblNgridConfig>(section: T): Observable<{
        curr: PblNgridConfig[T];
        prev: PblNgridConfig[T] | undefined;
    }>;
    private getGetNotifier;
    private notify;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridConfigService, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridConfigService>;
}
