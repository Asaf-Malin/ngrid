import { animationFrameScheduler, fromEventPattern, Subject } from 'rxjs';
import { debounceTime, skip, takeUntil } from 'rxjs/operators';
import { ON_DESTROY } from '@pebula/ngrid/core';
import { resetColumnWidths } from '../../utils/width';
import { DynamicColumnWidthLogic, DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY } from './dynamic-column-width';
export class PblNgridColumnWidthCalc {
    constructor(extApi) {
        this.extApi = extApi;
        this.onWidthCalc = new Subject();
        this.columnStore = extApi.columnStore;
        this.dynamicColumnWidth = new DynamicColumnWidthLogic(DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY, extApi.getDirection());
        extApi.directionChange()
            .pipe(takeUntil(extApi.events.pipe(ON_DESTROY)))
            .subscribe(dir => this.dynamicColumnWidth.dir = dir);
        extApi.events.pipe(ON_DESTROY).subscribe(() => this.onWidthCalc.complete());
        extApi.onInit(() => this.listenToResize());
    }
    /**
     * Updates the column sizes for all columns in the grid based on the column definition metadata for each column.
     * The final width represent a static width, it is the value as set in the definition (except column without width, where the calculated global width is set).
     */
    resetColumnsWidth() {
        resetColumnWidths(this.columnStore.getStaticWidth(), this.columnStore.visibleColumns, this.columnStore.metaColumns);
    }
    calcColumnWidth(columns) {
        if (!columns) {
            columns = this.columnStore.visibleColumns;
        }
        // protect from per-mature resize.
        // Will happen on additional header/header-group rows AND ALSO when vScrollNone is set
        // This will cause size not to populate because it takes time to render the rows, since it's not virtual and happens immediately.
        // TODO: find a better protection.
        if (!columns[0]?.sizeInfo) {
            return;
        }
        // stores and calculates width for columns added to it. Aggregate's the total width of all added columns.
        const rowWidth = this.dynamicColumnWidth;
        rowWidth.reset();
        this.syncColumnGroupsSize();
        // if this is a grid without groups
        if (rowWidth.minimumRowWidth === 0) {
            // - We filter at the end because on add column we will have a column that still didn't get the resize event hence not having the size info
            // We will ignore it because once it will get it a new resize event is triggered
            rowWidth.addGroup(columns.map(c => c.sizeInfo).filter(c => !!c));
        }
        // if the max lock state has changed we need to update re-calculate the static width's again.
        if (rowWidth.maxWidthLockChanged) {
            this.resetColumnsWidth();
            this.calcColumnWidth(columns);
            return;
        }
        this.onWidthCalc.next(rowWidth);
    }
    /**
     * Update the size of all group columns in the grid based on the size of their visible children (not hidden).
     * @param dynamicWidthLogic - Optional logic container, if not set a new one is created.
     */
    syncColumnGroupsSize() {
        // From all meta columns (header/footer/headerGroup) we filter only `headerGroup` columns.
        // For each we calculate it's width from all of the columns that the headerGroup "groups".
        // We use the same strategy and the same RowWidthDynamicAggregator instance which will prevent duplicate calculations.
        // Note that we might have multiple header groups, i.e. same columns on multiple groups with different row index.
        for (const g of this.columnStore.getAllHeaderGroup()) {
            // - We go over all columns because g.columns does not represent the current owned columns of the group it is static, representing the initial state.
            // Only columns hold their group owners.
            // - We filter at the end because on add column we will have a column that still didn't get the resize event hence not having the size info
            // We will ignore it because once it will get it a new resize event is triggered
            // TODO: find way to improve iteration
            const colSizeInfos = this.columnStore.visibleColumns.filter(c => !c.hidden && c.isInGroup(g)).map(c => c.sizeInfo).filter(c => !!c);
            if (colSizeInfos.length > 0) {
                const groupWidth = this.dynamicColumnWidth.addGroup(colSizeInfos);
                g.minWidth = groupWidth;
                g.updateWidth(`${groupWidth}px`);
            }
            else {
                g.minWidth = undefined;
                g.updateWidth(`0px`);
            }
        }
    }
    listenToResize() {
        const { element } = this.extApi;
        let resizeObserver;
        const ro$ = fromEventPattern(handler => {
            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(handler);
                resizeObserver.observe(element);
            }
        }, handler => {
            if (resizeObserver) {
                resizeObserver.unobserve(element);
                resizeObserver.disconnect();
                resizeObserver = undefined;
            }
        });
        // Skip the first emission
        // Debounce all resizes until the next complete animation frame without a resize
        // finally maps to the entries collection
        // SKIP:  We should skip the first emission (`skip(1)`) before we debounce, since its called upon calling "observe" on the resizeObserver.
        //        The problem is that some grid might require this because they do change size.
        //        An example is a grid in a mat-tab that is hidden, the grid will hit the resize one when we focus the tab
        //        which will require a resize handling because it's initial size is 0
        //        To workaround this, we only skip elements not yet added to the DOM, which means they will not trigger a resize event.
        let skipValue = document.body.contains(element) ? 1 : 0;
        ro$
            .pipe(skip(skipValue), debounceTime(0, animationFrameScheduler), takeUntil(this.extApi.events.pipe(ON_DESTROY)))
            .subscribe((args) => {
            if (skipValue === 0) {
                skipValue = 1;
                this.extApi.columnStore.visibleColumns.forEach(c => c.sizeInfo.updateSize());
            }
            this.onResize(args[0]);
        });
    }
    onResize(entries) {
        this.extApi.viewport?.checkViewportSize();
        this.calcColumnWidth();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXdpZHRoLWNhbGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jb2x1bW4vd2lkdGgtbG9naWMvY29sdW1uLXdpZHRoLWNhbGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMxRSxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHdEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLHdDQUF3QyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFM0csTUFBTSxPQUFPLHVCQUF1QjtJQU1sQyxZQUE2QixNQUFvQztRQUFwQyxXQUFNLEdBQU4sTUFBTSxDQUE4QjtRQUh4RCxnQkFBVyxHQUFHLElBQUksT0FBTyxFQUEyQixDQUFDO1FBSTVELElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN0QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyx3Q0FBd0MsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN2SCxNQUFNLENBQUMsZUFBZSxFQUFFO2FBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUMvQyxTQUFTLENBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBRSxDQUFDO1FBRXpELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFFLENBQUM7UUFFN0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsaUJBQWlCO1FBQ2YsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RILENBQUM7SUFFRCxlQUFlLENBQUMsT0FBcUI7UUFDbkMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztTQUMzQztRQUVELGtDQUFrQztRQUNsQyxzRkFBc0Y7UUFDdEYsaUlBQWlJO1FBQ2pJLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRTtZQUN6QixPQUFPO1NBQ1I7UUFFRCx5R0FBeUc7UUFDekcsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ3pDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUU1QixtQ0FBbUM7UUFDbkMsSUFBSSxRQUFRLENBQUMsZUFBZSxLQUFLLENBQUMsRUFBRTtZQUNsQywySUFBMkk7WUFDM0ksZ0ZBQWdGO1lBQ2hGLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQztTQUN0RTtRQUVELDZGQUE2RjtRQUM3RixJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtZQUNoQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSyxvQkFBb0I7UUFDMUIsMEZBQTBGO1FBQzFGLDBGQUEwRjtRQUMxRixzSEFBc0g7UUFDdEgsaUhBQWlIO1FBQ2pILEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQ3BELHFKQUFxSjtZQUNySix3Q0FBd0M7WUFDeEMsMklBQTJJO1lBQzNJLGdGQUFnRjtZQUNoRixzQ0FBc0M7WUFDdEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO1lBQ3pJLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xFLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO2dCQUN4QixDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQzthQUNsQztpQkFBTTtnQkFDTCxDQUFDLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN0QjtTQUNGO0lBQ0gsQ0FBQztJQUVPLGNBQWM7UUFDcEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDaEMsSUFBSSxjQUE4QixDQUFDO1FBQ25DLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUMxQixPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ25CLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0MsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztRQUNILENBQUMsRUFDRCxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksY0FBYyxFQUFFO2dCQUNsQixjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNsQyxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzVCLGNBQWMsR0FBRyxTQUFTLENBQUM7YUFDNUI7UUFDSCxDQUFDLENBQ0YsQ0FBQztRQUVGLDBCQUEwQjtRQUMxQixnRkFBZ0Y7UUFDaEYseUNBQXlDO1FBQ3pDLDBJQUEwSTtRQUMxSSx1RkFBdUY7UUFDdkYsa0hBQWtIO1FBQ2xILDZFQUE2RTtRQUM3RSwrSEFBK0g7UUFDL0gsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXhELEdBQUc7YUFDQSxJQUFJLENBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsRUFDeEMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUMvQzthQUNBLFNBQVMsQ0FBRSxDQUFDLElBQTZDLEVBQUUsRUFBRTtZQUM1RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25CLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUUsQ0FBQzthQUNoRjtZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sUUFBUSxDQUFDLE9BQThCO1FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyLCBmcm9tRXZlbnRQYXR0ZXJuLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIHNraXAsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE9OX0RFU1RST1kgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgcmVzZXRDb2x1bW5XaWR0aHMgfSBmcm9tICcuLi8uLi91dGlscy93aWR0aCc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi9tb2RlbC9jb2x1bW4nO1xuaW1wb3J0IHsgUGJsQ29sdW1uU3RvcmUgfSBmcm9tICcuLi9tYW5hZ2VtZW50L2NvbHVtbi1zdG9yZSc7XG5pbXBvcnQgeyBEeW5hbWljQ29sdW1uV2lkdGhMb2dpYywgRFlOQU1JQ19QQURESU5HX0JPWF9NT0RFTF9TUEFDRV9TVFJBVEVHWSB9IGZyb20gJy4vZHluYW1pYy1jb2x1bW4td2lkdGgnO1xuXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRDb2x1bW5XaWR0aENhbGMge1xuXG4gIHJlYWRvbmx5IGR5bmFtaWNDb2x1bW5XaWR0aDogRHluYW1pY0NvbHVtbldpZHRoTG9naWM7XG4gIHJlYWRvbmx5IG9uV2lkdGhDYWxjID0gbmV3IFN1YmplY3Q8RHluYW1pY0NvbHVtbldpZHRoTG9naWM+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29sdW1uU3RvcmU6IFBibENvbHVtblN0b3JlXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBleHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGkpIHtcbiAgICB0aGlzLmNvbHVtblN0b3JlID0gZXh0QXBpLmNvbHVtblN0b3JlO1xuICAgIHRoaXMuZHluYW1pY0NvbHVtbldpZHRoID0gbmV3IER5bmFtaWNDb2x1bW5XaWR0aExvZ2ljKERZTkFNSUNfUEFERElOR19CT1hfTU9ERUxfU1BBQ0VfU1RSQVRFR1ksIGV4dEFwaS5nZXREaXJlY3Rpb24oKSk7XG4gICAgZXh0QXBpLmRpcmVjdGlvbkNoYW5nZSgpXG4gICAgICAucGlwZSh0YWtlVW50aWwoZXh0QXBpLmV2ZW50cy5waXBlKE9OX0RFU1RST1kpKSlcbiAgICAgIC5zdWJzY3JpYmUoIGRpciA9PiB0aGlzLmR5bmFtaWNDb2x1bW5XaWR0aC5kaXIgPSBkaXIgKTtcblxuICAgIGV4dEFwaS5ldmVudHMucGlwZShPTl9ERVNUUk9ZKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5vbldpZHRoQ2FsYy5jb21wbGV0ZSgpICk7XG5cbiAgICBleHRBcGkub25Jbml0KCgpID0+IHRoaXMubGlzdGVuVG9SZXNpemUoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNvbHVtbiBzaXplcyBmb3IgYWxsIGNvbHVtbnMgaW4gdGhlIGdyaWQgYmFzZWQgb24gdGhlIGNvbHVtbiBkZWZpbml0aW9uIG1ldGFkYXRhIGZvciBlYWNoIGNvbHVtbi5cbiAgICogVGhlIGZpbmFsIHdpZHRoIHJlcHJlc2VudCBhIHN0YXRpYyB3aWR0aCwgaXQgaXMgdGhlIHZhbHVlIGFzIHNldCBpbiB0aGUgZGVmaW5pdGlvbiAoZXhjZXB0IGNvbHVtbiB3aXRob3V0IHdpZHRoLCB3aGVyZSB0aGUgY2FsY3VsYXRlZCBnbG9iYWwgd2lkdGggaXMgc2V0KS5cbiAgICovXG4gIHJlc2V0Q29sdW1uc1dpZHRoKCk6IHZvaWQge1xuICAgIHJlc2V0Q29sdW1uV2lkdGhzKHRoaXMuY29sdW1uU3RvcmUuZ2V0U3RhdGljV2lkdGgoKSwgdGhpcy5jb2x1bW5TdG9yZS52aXNpYmxlQ29sdW1ucywgdGhpcy5jb2x1bW5TdG9yZS5tZXRhQ29sdW1ucyk7XG4gIH1cblxuICBjYWxjQ29sdW1uV2lkdGgoY29sdW1ucz86IFBibENvbHVtbltdKTogdm9pZCB7XG4gICAgaWYgKCFjb2x1bW5zKSB7XG4gICAgICBjb2x1bW5zID0gdGhpcy5jb2x1bW5TdG9yZS52aXNpYmxlQ29sdW1ucztcbiAgICB9XG5cbiAgICAvLyBwcm90ZWN0IGZyb20gcGVyLW1hdHVyZSByZXNpemUuXG4gICAgLy8gV2lsbCBoYXBwZW4gb24gYWRkaXRpb25hbCBoZWFkZXIvaGVhZGVyLWdyb3VwIHJvd3MgQU5EIEFMU08gd2hlbiB2U2Nyb2xsTm9uZSBpcyBzZXRcbiAgICAvLyBUaGlzIHdpbGwgY2F1c2Ugc2l6ZSBub3QgdG8gcG9wdWxhdGUgYmVjYXVzZSBpdCB0YWtlcyB0aW1lIHRvIHJlbmRlciB0aGUgcm93cywgc2luY2UgaXQncyBub3QgdmlydHVhbCBhbmQgaGFwcGVucyBpbW1lZGlhdGVseS5cbiAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHByb3RlY3Rpb24uXG4gICAgaWYgKCFjb2x1bW5zWzBdPy5zaXplSW5mbykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHN0b3JlcyBhbmQgY2FsY3VsYXRlcyB3aWR0aCBmb3IgY29sdW1ucyBhZGRlZCB0byBpdC4gQWdncmVnYXRlJ3MgdGhlIHRvdGFsIHdpZHRoIG9mIGFsbCBhZGRlZCBjb2x1bW5zLlxuICAgIGNvbnN0IHJvd1dpZHRoID0gdGhpcy5keW5hbWljQ29sdW1uV2lkdGg7XG4gICAgcm93V2lkdGgucmVzZXQoKTtcbiAgICB0aGlzLnN5bmNDb2x1bW5Hcm91cHNTaXplKCk7XG5cbiAgICAvLyBpZiB0aGlzIGlzIGEgZ3JpZCB3aXRob3V0IGdyb3Vwc1xuICAgIGlmIChyb3dXaWR0aC5taW5pbXVtUm93V2lkdGggPT09IDApIHtcbiAgICAgIC8vIC0gV2UgZmlsdGVyIGF0IHRoZSBlbmQgYmVjYXVzZSBvbiBhZGQgY29sdW1uIHdlIHdpbGwgaGF2ZSBhIGNvbHVtbiB0aGF0IHN0aWxsIGRpZG4ndCBnZXQgdGhlIHJlc2l6ZSBldmVudCBoZW5jZSBub3QgaGF2aW5nIHRoZSBzaXplIGluZm9cbiAgICAgIC8vIFdlIHdpbGwgaWdub3JlIGl0IGJlY2F1c2Ugb25jZSBpdCB3aWxsIGdldCBpdCBhIG5ldyByZXNpemUgZXZlbnQgaXMgdHJpZ2dlcmVkXG4gICAgICByb3dXaWR0aC5hZGRHcm91cChjb2x1bW5zLm1hcCggYyA9PiBjLnNpemVJbmZvICkuZmlsdGVyKCBjID0+ICEhYyApKTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgbWF4IGxvY2sgc3RhdGUgaGFzIGNoYW5nZWQgd2UgbmVlZCB0byB1cGRhdGUgcmUtY2FsY3VsYXRlIHRoZSBzdGF0aWMgd2lkdGgncyBhZ2Fpbi5cbiAgICBpZiAocm93V2lkdGgubWF4V2lkdGhMb2NrQ2hhbmdlZCkge1xuICAgICAgdGhpcy5yZXNldENvbHVtbnNXaWR0aCgpO1xuICAgICAgdGhpcy5jYWxjQ29sdW1uV2lkdGgoY29sdW1ucyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vbldpZHRoQ2FsYy5uZXh0KHJvd1dpZHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHNpemUgb2YgYWxsIGdyb3VwIGNvbHVtbnMgaW4gdGhlIGdyaWQgYmFzZWQgb24gdGhlIHNpemUgb2YgdGhlaXIgdmlzaWJsZSBjaGlsZHJlbiAobm90IGhpZGRlbikuXG4gICAqIEBwYXJhbSBkeW5hbWljV2lkdGhMb2dpYyAtIE9wdGlvbmFsIGxvZ2ljIGNvbnRhaW5lciwgaWYgbm90IHNldCBhIG5ldyBvbmUgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByaXZhdGUgc3luY0NvbHVtbkdyb3Vwc1NpemUoKTogdm9pZCB7XG4gICAgLy8gRnJvbSBhbGwgbWV0YSBjb2x1bW5zIChoZWFkZXIvZm9vdGVyL2hlYWRlckdyb3VwKSB3ZSBmaWx0ZXIgb25seSBgaGVhZGVyR3JvdXBgIGNvbHVtbnMuXG4gICAgLy8gRm9yIGVhY2ggd2UgY2FsY3VsYXRlIGl0J3Mgd2lkdGggZnJvbSBhbGwgb2YgdGhlIGNvbHVtbnMgdGhhdCB0aGUgaGVhZGVyR3JvdXAgXCJncm91cHNcIi5cbiAgICAvLyBXZSB1c2UgdGhlIHNhbWUgc3RyYXRlZ3kgYW5kIHRoZSBzYW1lIFJvd1dpZHRoRHluYW1pY0FnZ3JlZ2F0b3IgaW5zdGFuY2Ugd2hpY2ggd2lsbCBwcmV2ZW50IGR1cGxpY2F0ZSBjYWxjdWxhdGlvbnMuXG4gICAgLy8gTm90ZSB0aGF0IHdlIG1pZ2h0IGhhdmUgbXVsdGlwbGUgaGVhZGVyIGdyb3VwcywgaS5lLiBzYW1lIGNvbHVtbnMgb24gbXVsdGlwbGUgZ3JvdXBzIHdpdGggZGlmZmVyZW50IHJvdyBpbmRleC5cbiAgICBmb3IgKGNvbnN0IGcgb2YgdGhpcy5jb2x1bW5TdG9yZS5nZXRBbGxIZWFkZXJHcm91cCgpKSB7XG4gICAgICAvLyAtIFdlIGdvIG92ZXIgYWxsIGNvbHVtbnMgYmVjYXVzZSBnLmNvbHVtbnMgZG9lcyBub3QgcmVwcmVzZW50IHRoZSBjdXJyZW50IG93bmVkIGNvbHVtbnMgb2YgdGhlIGdyb3VwIGl0IGlzIHN0YXRpYywgcmVwcmVzZW50aW5nIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgICAgLy8gT25seSBjb2x1bW5zIGhvbGQgdGhlaXIgZ3JvdXAgb3duZXJzLlxuICAgICAgLy8gLSBXZSBmaWx0ZXIgYXQgdGhlIGVuZCBiZWNhdXNlIG9uIGFkZCBjb2x1bW4gd2Ugd2lsbCBoYXZlIGEgY29sdW1uIHRoYXQgc3RpbGwgZGlkbid0IGdldCB0aGUgcmVzaXplIGV2ZW50IGhlbmNlIG5vdCBoYXZpbmcgdGhlIHNpemUgaW5mb1xuICAgICAgLy8gV2Ugd2lsbCBpZ25vcmUgaXQgYmVjYXVzZSBvbmNlIGl0IHdpbGwgZ2V0IGl0IGEgbmV3IHJlc2l6ZSBldmVudCBpcyB0cmlnZ2VyZWRcbiAgICAgIC8vIFRPRE86IGZpbmQgd2F5IHRvIGltcHJvdmUgaXRlcmF0aW9uXG4gICAgICBjb25zdCBjb2xTaXplSW5mb3MgPSB0aGlzLmNvbHVtblN0b3JlLnZpc2libGVDb2x1bW5zLmZpbHRlciggYyA9PiAhYy5oaWRkZW4gJiYgYy5pc0luR3JvdXAoZykpLm1hcCggYyA9PiBjLnNpemVJbmZvICkuZmlsdGVyKCBjID0+ICEhYyApO1xuICAgICAgaWYgKGNvbFNpemVJbmZvcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGdyb3VwV2lkdGggPSB0aGlzLmR5bmFtaWNDb2x1bW5XaWR0aC5hZGRHcm91cChjb2xTaXplSW5mb3MpO1xuICAgICAgICBnLm1pbldpZHRoID0gZ3JvdXBXaWR0aDtcbiAgICAgICAgZy51cGRhdGVXaWR0aChgJHtncm91cFdpZHRofXB4YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnLm1pbldpZHRoID0gdW5kZWZpbmVkO1xuICAgICAgICBnLnVwZGF0ZVdpZHRoKGAwcHhgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGxpc3RlblRvUmVzaXplKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgZWxlbWVudCB9ID0gdGhpcy5leHRBcGk7XG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlcjtcbiAgICBjb25zdCBybyQgPSBmcm9tRXZlbnRQYXR0ZXJuPFtSZXNpemVPYnNlcnZlckVudHJ5W10sIFJlc2l6ZU9ic2VydmVyXT4oXG4gICAgICBoYW5kbGVyID0+IHtcbiAgICAgICAgaWYgKCFyZXNpemVPYnNlcnZlcikge1xuICAgICAgICAgIHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKGhhbmRsZXIpO1xuICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBoYW5kbGVyID0+IHtcbiAgICAgICAgaWYgKHJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICAgICAgcmVzaXplT2JzZXJ2ZXIudW5vYnNlcnZlKGVsZW1lbnQpO1xuICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZXNpemVPYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBTa2lwIHRoZSBmaXJzdCBlbWlzc2lvblxuICAgIC8vIERlYm91bmNlIGFsbCByZXNpemVzIHVudGlsIHRoZSBuZXh0IGNvbXBsZXRlIGFuaW1hdGlvbiBmcmFtZSB3aXRob3V0IGEgcmVzaXplXG4gICAgLy8gZmluYWxseSBtYXBzIHRvIHRoZSBlbnRyaWVzIGNvbGxlY3Rpb25cbiAgICAvLyBTS0lQOiAgV2Ugc2hvdWxkIHNraXAgdGhlIGZpcnN0IGVtaXNzaW9uIChgc2tpcCgxKWApIGJlZm9yZSB3ZSBkZWJvdW5jZSwgc2luY2UgaXRzIGNhbGxlZCB1cG9uIGNhbGxpbmcgXCJvYnNlcnZlXCIgb24gdGhlIHJlc2l6ZU9ic2VydmVyLlxuICAgIC8vICAgICAgICBUaGUgcHJvYmxlbSBpcyB0aGF0IHNvbWUgZ3JpZCBtaWdodCByZXF1aXJlIHRoaXMgYmVjYXVzZSB0aGV5IGRvIGNoYW5nZSBzaXplLlxuICAgIC8vICAgICAgICBBbiBleGFtcGxlIGlzIGEgZ3JpZCBpbiBhIG1hdC10YWIgdGhhdCBpcyBoaWRkZW4sIHRoZSBncmlkIHdpbGwgaGl0IHRoZSByZXNpemUgb25lIHdoZW4gd2UgZm9jdXMgdGhlIHRhYlxuICAgIC8vICAgICAgICB3aGljaCB3aWxsIHJlcXVpcmUgYSByZXNpemUgaGFuZGxpbmcgYmVjYXVzZSBpdCdzIGluaXRpYWwgc2l6ZSBpcyAwXG4gICAgLy8gICAgICAgIFRvIHdvcmthcm91bmQgdGhpcywgd2Ugb25seSBza2lwIGVsZW1lbnRzIG5vdCB5ZXQgYWRkZWQgdG8gdGhlIERPTSwgd2hpY2ggbWVhbnMgdGhleSB3aWxsIG5vdCB0cmlnZ2VyIGEgcmVzaXplIGV2ZW50LlxuICAgIGxldCBza2lwVmFsdWUgPSBkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsZW1lbnQpID8gMSA6IDA7XG5cbiAgICBybyRcbiAgICAgIC5waXBlKFxuICAgICAgICBza2lwKHNraXBWYWx1ZSksXG4gICAgICAgIGRlYm91bmNlVGltZSgwLCBhbmltYXRpb25GcmFtZVNjaGVkdWxlciksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmV4dEFwaS5ldmVudHMucGlwZShPTl9ERVNUUk9ZKSksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCAoYXJnczogW1Jlc2l6ZU9ic2VydmVyRW50cnlbXSwgUmVzaXplT2JzZXJ2ZXJdKSA9PiB7XG4gICAgICAgIGlmIChza2lwVmFsdWUgPT09IDApIHtcbiAgICAgICAgICBza2lwVmFsdWUgPSAxO1xuICAgICAgICAgIHRoaXMuZXh0QXBpLmNvbHVtblN0b3JlLnZpc2libGVDb2x1bW5zLmZvckVhY2goIGMgPT4gYy5zaXplSW5mby51cGRhdGVTaXplKCkgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uUmVzaXplKGFyZ3NbMF0pO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uUmVzaXplKGVudHJpZXM6IFJlc2l6ZU9ic2VydmVyRW50cnlbXSk6IHZvaWQge1xuICAgIHRoaXMuZXh0QXBpLnZpZXdwb3J0Py5jaGVja1ZpZXdwb3J0U2l6ZSgpO1xuICAgIHRoaXMuY2FsY0NvbHVtbldpZHRoKCk7XG4gIH1cbn1cbiJdfQ==