import { RenderRow } from '@angular/cdk/table';
import { ChangeOperationState, PblNgridBaseRowViewRepeaterStrategy } from './ngrid-base-row-view-repeater-strategy';
import { PblRowContext } from '../context/row';
import * as i0 from "@angular/core";
/**
 * This is a noop strategy that simply prevents the CDK from rendering cells for each row and instead the logic for it is now
 * handled within the row itself.
 *
 * This is very powerful and eliminate the need to use column declaration in strings.
 * Since we have a column store we can take it directly from there.
 *
 * Additionally, a temp fix for a bug is applied (see `workaroundEnabled`
 * Remove when and if PR https://github.com/angular/components/pull/20765 is accepted and the old version not supporting the solution is not supported by ngrid.
 */
export declare class PblNgridCachedRowViewRepeaterStrategy<T, R extends RenderRow<T>, C extends PblRowContext<T>> extends PblNgridBaseRowViewRepeaterStrategy<T, R, C> {
    /**
     * The size of the cache used to store unused views.
     * Setting the cache size to `0` will disable caching. Defaults to 20 views.
     */
    viewCacheSize: number;
    /**
     * View cache that stores embedded view instances that have been previously stamped out,
     * but don't are not currently rendered. The view repeater will reuse these views rather than
     * creating brand new ones.
     */
    private _viewCache;
    detach(): void;
    protected addItem(adjustedPreviousIndex: number | null, currentIndex: number | null, state: ChangeOperationState<T, R, C>): void;
    protected removeItem(removeAt: number, state: ChangeOperationState<T, R, C>): void;
    protected moveItem(moveFrom: number, moveTo: number, state: ChangeOperationState<T, R, C>): void;
    /**
     * Cache the given detached view. If the cache is full, the view will be
     * destroyed.
     */
    private _maybeCacheView;
    /** Inserts a recycled view from the cache at the given index. */
    private _insertViewFromCache;
    /** Detaches the embedded view at the given index. */
    private _detachView;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridCachedRowViewRepeaterStrategy<any, any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridCachedRowViewRepeaterStrategy<any, any, any>>;
}
