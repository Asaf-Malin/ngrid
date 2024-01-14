import { EmbeddedViewRef, IterableChangeRecord, IterableChanges, ViewContainerRef } from '@angular/core';
import { _ViewRepeater, _ViewRepeaterItemChanged, _ViewRepeaterItemContextFactory, _ViewRepeaterItemValueResolver, _ViewRepeaterOperation } from '@angular/cdk/collections';
import { CdkRowDef, RenderRow, BaseRowDef, RowContext } from '@angular/cdk/table';
import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
import { PblRowContext } from '../context/row';
import * as i0 from "@angular/core";
export interface BaseChangeOperationState<T, R extends RenderRow<T>, C extends PblRowContext<T>> {
    vcRef: ViewContainerRef;
    createEmbeddedView: (record: IterableChangeRecord<R>, adjustedPreviousIndex: number | null, currentIndex: number | null) => EmbeddedViewRef<C>;
    itemValueResolver: _ViewRepeaterItemValueResolver<T, R>;
}
export interface ChangeOperationState<T, R extends RenderRow<T>, C extends PblRowContext<T>> extends BaseChangeOperationState<T, R, C> {
    record: IterableChangeRecord<R>;
    view?: EmbeddedViewRef<C> | undefined;
    op?: _ViewRepeaterOperation;
}
export declare class PblNgridBaseRowViewRepeaterStrategy<T, R extends RenderRow<T>, C extends PblRowContext<T>> implements _ViewRepeater<T, R, C> {
    protected extApi: PblNgridInternalExtensionApi<T>;
    protected workaroundEnabled: boolean;
    protected renderer: {
        _renderCellTemplateForItem: (rowDef: BaseRowDef, context: RowContext<T>) => void;
    };
    protected _cachedRenderDefMap: Map<number, CdkRowDef<T>>;
    constructor(extApi: PblNgridInternalExtensionApi<T>);
    applyChanges(changes: IterableChanges<R>, vcRef: ViewContainerRef, itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>, itemValueResolver: _ViewRepeaterItemValueResolver<T, R>, itemViewChanged?: _ViewRepeaterItemChanged<R, C>): void;
    detach(): void;
    protected addItem(adjustedPreviousIndex: number | null, currentIndex: number | null, state: ChangeOperationState<T, R, C>): void;
    protected removeItem(removeAt: number, state: ChangeOperationState<T, R, C>): void;
    protected moveItem(moveFrom: number, moveTo: number, state: ChangeOperationState<T, R, C>): void;
    protected afterOperation(state: ChangeOperationState<T, R, C>): void;
    protected patch20765(changes: IterableChanges<R>, baseState: BaseChangeOperationState<T, R, C>): void;
    protected patch20765afterOp(state: ChangeOperationState<T, R, C>): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBaseRowViewRepeaterStrategy<any, any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridBaseRowViewRepeaterStrategy<any, any, any>>;
}
