import { EmbeddedViewRef } from '@angular/core';
import { _ViewRepeaterItemInsertArgs } from '@angular/cdk/collections';
import { PblRowContext } from '../context/row';
import { PblNgridRowComponent } from './row.component';
declare class RowToRepeaterBridge {
    bridgeRow(row: PblNgridRowComponent): Omit<_ViewRepeaterItemInsertArgs<PblRowContext<any>>, 'templateRef'>;
    bridgeContext<C extends PblRowContext<any>>(itemArgs: _ViewRepeaterItemInsertArgs<PblRowContext<any>>, createView: () => EmbeddedViewRef<C>): EmbeddedViewRef<C>;
}
export declare const rowContextBridge: RowToRepeaterBridge;
export {};
