import { PblNgridExtensionApi } from '@asafmalin/ngrid';
import { PblDropListRef } from '../core/drop-list-ref';
import { PblNgridRowReorderPluginDirective } from './row-reorder-plugin';
import { Type } from '@angular/core';
export declare type _PblDropListRef = Omit<PblDropListRef<PblNgridRowReorderPluginDirective<any>>, '_getItemIndexFromPointerPosition' | 'start'> & {
    start(): void;
    _getItemIndexFromPointerPosition(item: PblRowDropListRef, pointerX: number, pointerY: number, delta?: {
        x: number;
        y: number;
    }): number;
};
export declare const _PblDropListRef: () => Type<_PblDropListRef>;
declare const PblRowDropListRef_base: Type<_PblDropListRef>;
export declare class PblRowDropListRef<T = any> extends PblRowDropListRef_base {
    gridApi: PblNgridExtensionApi<T>;
    private scrollDif;
    _getItemIndexFromPointerPosition(item: PblRowDropListRef, pointerX: number, pointerY: number, delta?: {
        x: number;
        y: number;
    }): number;
    start(): void;
}
export declare function patchDropListRef<T = any>(dropListRef: PblDropListRef<PblNgridRowReorderPluginDirective<T>>, gridApi: PblNgridExtensionApi<T>): void;
export {};
