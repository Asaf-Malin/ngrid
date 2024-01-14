import { RenderRow } from '@angular/cdk/table';
import { ChangeOperationState, PblNgridBaseRowViewRepeaterStrategy } from './ngrid-base-row-view-repeater-strategy';
import { PblRowContext } from '../context/row';
import * as i0 from "@angular/core";
export declare class PblNgridDisposedRowViewRepeaterStrategy<T, R extends RenderRow<T>, C extends PblRowContext<T>> extends PblNgridBaseRowViewRepeaterStrategy<T, R, C> {
    protected addItem(adjustedPreviousIndex: number | null, currentIndex: number | null, state: ChangeOperationState<T, R, C>): void;
    protected removeItem(removeAt: number, state: ChangeOperationState<T, R, C>): void;
    protected moveItem(moveFrom: number, moveTo: number, state: ChangeOperationState<T, R, C>): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridDisposedRowViewRepeaterStrategy<any, any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridDisposedRowViewRepeaterStrategy<any, any, any>>;
}
