import { ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CdkRow } from '@angular/cdk/table';
import { StylingDiffer, unrx } from '@pebula/ngrid/core';
import { PblNgridBaseRowComponent } from './base-row.component';
import { PblNgridColumnDef } from '../column/directives/column-def';
import { rowContextBridge } from './row-to-repeater-bridge';
import { PblNgridPluginController } from '../../ext/plugin-control';
import * as i0 from "@angular/core";
export const PBL_NGRID_ROW_TEMPLATE = '<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-container #viewRef></ng-container><ng-content select=".pbl-ngrid-row-suffix"></ng-content>';
export class PblNgridRowComponent extends PblNgridBaseRowComponent {
    constructor() {
        super(...arguments);
        this.rowType = 'data';
        /** Indicates if intersection observer is on, detecting outOfView state for us */
        this.observerMode = true;
        this.outOfView = false;
    }
    get rowIndex() { return this._rowIndex; }
    ngOnInit() {
        super.ngOnInit();
        this.updateRow();
        // Doing nothing if IntersectionObserver is enable, otherwise updates the initial state
        this.updateOutOfView();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.context?.detachRow(this);
    }
    updateRow() {
        if (this.currRow !== this.context.$implicit) {
            this.prevRow = this.currRow;
            this.currRow = this.context.$implicit;
            if (this.currRow) {
                if (this.grid.rowClassUpdate && this.grid.rowClassUpdateFreq === 'item') {
                    this.updateHostClass();
                }
                this.identityUpdated();
            }
            return true;
        }
        return false;
    }
    getCell(index) {
        return this._cells[index]?.instance;
    }
    getCellById(id) {
        const cellViewIndex = this._extApi.columnApi.renderIndexOf(id);
        return this._cells[cellViewIndex]?.instance;
    }
    /**
     * Rebuild the cells rendered.
     * This should be called when the columns have changed and new columns created in the column store.
     *
     * The new columns are new instances, clones of the previous columns and they DONT have a column definition!
     * This method will iterate over existing cells, updating each cell with the new column now in it's location and creating a column def for it.
     * If there are more cells rendered then in the store, it will remove those extra cells
     * If there are less cells rendered then in the store, it will create new ones.
     * This will ensure we don't create or remove cells unless we need to, saving on DOM operations.
     */
    _rebuildCells() {
        const columns = this._extApi.columnStore.getColumnsOf(this);
        this.context._rebuildCells(this._extApi.columnStore.allColumns);
        const targetLen = columns.length;
        for (let i = 0; i < targetLen; i++) {
            const cellCmpRef = this._cells[i];
            if (!cellCmpRef) {
                this._createCell(columns[i]);
            }
            else {
                this.attachColumn(columns[i], cellCmpRef);
            }
        }
        let currentLen = this.cellsLength;
        while (currentLen > targetLen) {
            this._destroyCell(--currentLen);
        }
        this.detectChanges();
    }
    /**
     * Updates the outOfView state of this row and sync it with the context
     * If the context's state is different from the new outOfView state, will invoke a change detection cycle.
     * @internal
     */
    _setOutOfViewState(outOfView) {
        if (this.outOfView !== outOfView) {
            this.outOfView = outOfView;
            if (this.context?.outOfView !== outOfView) {
                this.context.outOfView = outOfView;
                // TODO: If scrolling, mark the row for check and update only after scroll is done
                this.ngDoCheck();
            }
        }
    }
    /**
     * Updates the `outOfView` flag of the context attached to this row
     *
     * This method is backward compatible to support browser without the IntersectionObservable API.
     *
     * If the browser DOES NOT support IntersectionObserver it will calculate the state using bounding rect APIs (force param has no effect, always true).
     * If the browser support IntersectionObserver it will do nothing when force is not set to true but when * set to true it will use
     * the IntersectionObserver `takeRecords` method to update the outOfView state.
     *
     * > NOTE that this method has a direct impact on performance as it uses DOM apis that trigger layout reflows.
     * Use with caution.
     */
    updateOutOfView(force) {
        if (!this.observerMode || force) {
            this._extApi.rowsApi.forceUpdateOutOfView(this);
        }
    }
    onCtor() {
        const { context, index } = rowContextBridge.bridgeRow(this);
        this.grid = context.grid;
        this._extApi = PblNgridPluginController.find(this.grid).extApi;
        this._rowIndex = index;
        this.context = context;
        this.context.attachRow(this);
    }
    detectChanges() {
        if (this.grid.rowClassUpdate && this.grid.rowClassUpdateFreq === 'ngDoCheck') {
            this.updateHostClass();
        }
        for (const cell of this._cells) {
            // TODO: the cells are created through code which mean's that they don't belong
            // to the CD tree and we need to manually mark them for checking
            // We can customize the diffing, detect context changes internally and only trigger these cells which have changed!
            cell.instance.setContext(this.context);
            cell.changeDetectorRef.detectChanges();
        }
    }
    updateHostClass() {
        const el = this.element;
        // if there is an updater, work with it
        // otherwise, clear previous classes that got applied (assumed a live binding change of the updater function)
        // users should be aware to tear down the updater only when they want to stop this feature, if the goal is just to toggle on/off
        // it's better to set the frequency to `none` and return nothing from the function (replace it) so the differ is not nuked.
        if (this.grid.rowClassUpdate) {
            if (!this._classDiffer) {
                this._classDiffer = new StylingDiffer('NgClass', 1 /* StylingDifferOptions.TrimProperties */ | 2 /* StylingDifferOptions.AllowSubKeys */ | 4 /* StylingDifferOptions.AllowStringValue */ | 16 /* StylingDifferOptions.ForceAsMap */);
                this._lastClass = new Set();
            }
            const newValue = this.grid.rowClassUpdate(this.context);
            this._classDiffer.setInput(newValue);
            if (this._classDiffer.updateValue()) {
                const lastClass = this._lastClass;
                this._lastClass = new Set();
                const value = this._classDiffer.value || {};
                for (const key of Object.keys(value)) {
                    if (value[key]) {
                        el.classList.add(key);
                        this._lastClass.add(key);
                    }
                    else {
                        el.classList.remove(key);
                    }
                    lastClass.delete(key);
                }
                if (lastClass.size > 0) {
                    for (const key of lastClass.values()) {
                        el.classList.remove(key);
                    }
                }
            }
        }
        else if (this._classDiffer) {
            const value = this._classDiffer.value || {};
            this._classDiffer = this._lastClass = undefined;
            for (const key of Object.keys(value)) {
                el.classList.remove(key);
            }
        }
    }
    cellCreated(column, cell) {
        this.attachColumn(column, cell);
    }
    cellDestroyed(cell, previousIndex) {
        unrx.kill(this, cell.instance.column);
    }
    cellMoved(previousItem, currentItem, previousIndex, currentIndex) {
        currentItem.instance.syncColumn();
        this.context.updateCell(previousItem.instance.cellCtx.clone(currentItem.instance.column));
        currentItem.changeDetectorRef.markForCheck();
    }
    identityUpdated() {
        this.element.setAttribute('row-id', this.context.dsIndex);
        this.element.setAttribute('row-key', this.context.identity);
    }
    attachColumn(column, cell) {
        if (!column.columnDef) {
            new PblNgridColumnDef(this._extApi).column = column;
            column.columnDef.name = column.id;
        }
        cell.instance.setColumn(column);
        cell.instance.setContext(this.context);
    }
}
/** @nocollapse */ PblNgridRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowComponent, selector: "pbl-ngrid-row[row]", host: { attributes: { "role": "row" }, classAttribute: "cdk-row pbl-ngrid-row" }, providers: [
        { provide: CdkRow, useExisting: PblNgridRowComponent }
    ], viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["pblNgridRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-row[row]',
                    template: PBL_NGRID_ROW_TEMPLATE,
                    host: {
                        'class': 'cdk-row pbl-ngrid-row',
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkRow, useExisting: PblNgridRowComponent }
                    ],
                    exportAs: 'pblNgridRow',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL3Jvdy9yb3cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQWdCLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDcEosT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxhQUFhLEVBQXdCLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBSy9FLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzVELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOztBQUdwRSxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyx3SkFBd0osQ0FBQztBQWdCL0wsTUFBTSxPQUFPLG9CQUE4QixTQUFRLHdCQUFtQztJQWR0Rjs7UUFrQlcsWUFBTyxHQUFHLE1BQWUsQ0FBQztRQUduQyxpRkFBaUY7UUFDekUsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFVcEIsY0FBUyxHQUFHLEtBQUssQ0FBQztLQTRNM0I7SUF4TkMsSUFBSSxRQUFRLEtBQWEsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQWNqRCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQix1RkFBdUY7UUFDdkYsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxX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QkFBdkUsU0FBUzt1QkFBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIENvbXBvbmVudFJlZiwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmLCBWaWV3RW5jYXBzdWxhdGlvbiwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENka1JvdyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmltcG9ydCB7IFN0eWxpbmdEaWZmZXIsIFN0eWxpbmdEaWZmZXJPcHRpb25zLCB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgUGJsUm93Q29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvaW5kZXgnO1xuaW1wb3J0IHsgUGJsTmdyaWRDZWxsQ29tcG9uZW50IH0gZnJvbSAnLi4vY2VsbC9jZWxsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi9jb2x1bW4vbW9kZWwnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50IH0gZnJvbSAnLi9iYXNlLXJvdy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EZWYgfSBmcm9tICcuLi9jb2x1bW4vZGlyZWN0aXZlcy9jb2x1bW4tZGVmJztcbmltcG9ydCB7IHJvd0NvbnRleHRCcmlkZ2UgfSBmcm9tICcuL3Jvdy10by1yZXBlYXRlci1icmlkZ2UnO1xuaW1wb3J0IHsgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnLi4vLi4vZXh0L3BsdWdpbi1jb250cm9sJztcbmltcG9ydCB7IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGkgfSBmcm9tICcuLi8uLi9leHQvZ3JpZC1leHQtYXBpJztcblxuZXhwb3J0IGNvbnN0IFBCTF9OR1JJRF9ST1dfVEVNUExBVEUgPSAnPG5nLWNvbnRlbnQgc2VsZWN0PVwiLnBibC1uZ3JpZC1yb3ctcHJlZml4XCI+PC9uZy1jb250ZW50PjxuZy1jb250YWluZXIgI3ZpZXdSZWY+PC9uZy1jb250YWluZXI+PG5nLWNvbnRlbnQgc2VsZWN0PVwiLnBibC1uZ3JpZC1yb3ctc3VmZml4XCI+PC9uZy1jb250ZW50Pic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZC1yb3dbcm93XScsXG4gIHRlbXBsYXRlOiBQQkxfTkdSSURfUk9XX1RFTVBMQVRFLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICAgICdjbGFzcyc6ICdjZGstcm93IHBibC1uZ3JpZC1yb3cnLFxuICAgICdyb2xlJzogJ3JvdycsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogQ2RrUm93LCB1c2VFeGlzdGluZzogUGJsTmdyaWRSb3dDb21wb25lbnQgfVxuICBdLFxuICBleHBvcnRBczogJ3BibE5ncmlkUm93JyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkUm93Q29tcG9uZW50PFQgPSBhbnk+IGV4dGVuZHMgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50PCdkYXRhJywgVD4gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgQFZpZXdDaGlsZCgndmlld1JlZicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0pIF92aWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gIHJlYWRvbmx5IHJvd1R5cGUgPSAnZGF0YScgYXMgY29uc3Q7XG5cbiAgZ2V0IHJvd0luZGV4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yb3dJbmRleDsgfVxuICAvKiogSW5kaWNhdGVzIGlmIGludGVyc2VjdGlvbiBvYnNlcnZlciBpcyBvbiwgZGV0ZWN0aW5nIG91dE9mVmlldyBzdGF0ZSBmb3IgdXMgKi9cbiAgcHJpdmF0ZSBvYnNlcnZlck1vZGUgPSB0cnVlO1xuXG4gIGNvbnRleHQ6IFBibFJvd0NvbnRleHQ8VD47XG5cbiAgcHJvdGVjdGVkIHByZXZSb3c6IFQgfCB1bmRlZmluZWQ7XG4gIHByb3RlY3RlZCBjdXJyUm93OiBUIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgX2NsYXNzRGlmZmVyOiBTdHlsaW5nRGlmZmVyPHsgW2tsYXNzOiBzdHJpbmddOiB0cnVlIH0+O1xuICBwcml2YXRlIF9sYXN0Q2xhc3M6IFNldDxzdHJpbmc+O1xuICBwcml2YXRlIF9yb3dJbmRleDogbnVtYmVyO1xuICBwcml2YXRlIG91dE9mVmlldyA9IGZhbHNlO1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgdGhpcy51cGRhdGVSb3coKTtcbiAgICAvLyBEb2luZyBub3RoaW5nIGlmIEludGVyc2VjdGlvbk9ic2VydmVyIGlzIGVuYWJsZSwgb3RoZXJ3aXNlIHVwZGF0ZXMgdGhlIGluaXRpYWwgc3RhdGVcbiAgICB0aGlzLnVwZGF0ZU91dE9mVmlldygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLmNvbnRleHQ/LmRldGFjaFJvdyh0aGlzKTtcbiAgfVxuXG4gIHVwZGF0ZVJvdygpIHtcbiAgICBpZiAodGhpcy5jdXJyUm93ICE9PSB0aGlzLmNvbnRleHQuJGltcGxpY2l0KSB7XG4gICAgICB0aGlzLnByZXZSb3cgPSB0aGlzLmN1cnJSb3c7XG4gICAgICB0aGlzLmN1cnJSb3cgPSB0aGlzLmNvbnRleHQuJGltcGxpY2l0O1xuXG4gICAgICBpZiAodGhpcy5jdXJyUm93KSB7XG4gICAgICAgIGlmICh0aGlzLmdyaWQucm93Q2xhc3NVcGRhdGUgJiYgdGhpcy5ncmlkLnJvd0NsYXNzVXBkYXRlRnJlcSA9PT0gJ2l0ZW0nKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVIb3N0Q2xhc3MoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlkZW50aXR5VXBkYXRlZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldENlbGwoaW5kZXg6IG51bWJlcik6IFBibE5ncmlkQ2VsbENvbXBvbmVudCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2NlbGxzW2luZGV4XT8uaW5zdGFuY2U7XG4gIH1cblxuICBnZXRDZWxsQnlJZChpZDogc3RyaW5nKTogUGJsTmdyaWRDZWxsQ29tcG9uZW50IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjZWxsVmlld0luZGV4ID0gdGhpcy5fZXh0QXBpLmNvbHVtbkFwaS5yZW5kZXJJbmRleE9mKGlkKTtcbiAgICByZXR1cm4gdGhpcy5fY2VsbHNbY2VsbFZpZXdJbmRleF0/Lmluc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYnVpbGQgdGhlIGNlbGxzIHJlbmRlcmVkLlxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgd2hlbiB0aGUgY29sdW1ucyBoYXZlIGNoYW5nZWQgYW5kIG5ldyBjb2x1bW5zIGNyZWF0ZWQgaW4gdGhlIGNvbHVtbiBzdG9yZS5cbiAgICpcbiAgICogVGhlIG5ldyBjb2x1bW5zIGFyZSBuZXcgaW5zdGFuY2VzLCBjbG9uZXMgb2YgdGhlIHByZXZpb3VzIGNvbHVtbnMgYW5kIHRoZXkgRE9OVCBoYXZlIGEgY29sdW1uIGRlZmluaXRpb24hXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgaXRlcmF0ZSBvdmVyIGV4aXN0aW5nIGNlbGxzLCB1cGRhdGluZyBlYWNoIGNlbGwgd2l0aCB0aGUgbmV3IGNvbHVtbiBub3cgaW4gaXQncyBsb2NhdGlvbiBhbmQgY3JlYXRpbmcgYSBjb2x1bW4gZGVmIGZvciBpdC5cbiAgICogSWYgdGhlcmUgYXJlIG1vcmUgY2VsbHMgcmVuZGVyZWQgdGhlbiBpbiB0aGUgc3RvcmUsIGl0IHdpbGwgcmVtb3ZlIHRob3NlIGV4dHJhIGNlbGxzXG4gICAqIElmIHRoZXJlIGFyZSBsZXNzIGNlbGxzIHJlbmRlcmVkIHRoZW4gaW4gdGhlIHN0b3JlLCBpdCB3aWxsIGNyZWF0ZSBuZXcgb25lcy5cbiAgICogVGhpcyB3aWxsIGVuc3VyZSB3ZSBkb24ndCBjcmVhdGUgb3IgcmVtb3ZlIGNlbGxzIHVubGVzcyB3ZSBuZWVkIHRvLCBzYXZpbmcgb24gRE9NIG9wZXJhdGlvbnMuXG4gICAqL1xuICBfcmVidWlsZENlbGxzKCkge1xuICAgIGNvbnN0IGNvbHVtbnMgPSB0aGlzLl9leHRBcGkuY29sdW1uU3RvcmUuZ2V0Q29sdW1uc09mKHRoaXMpO1xuICAgIHRoaXMuY29udGV4dC5fcmVidWlsZENlbGxzKHRoaXMuX2V4dEFwaS5jb2x1bW5TdG9yZS5hbGxDb2x1bW5zKTtcbiAgICBjb25zdCB0YXJnZXRMZW4gPSBjb2x1bW5zLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldExlbjsgaSsrKSB7XG4gICAgICBjb25zdCBjZWxsQ21wUmVmID0gdGhpcy5fY2VsbHNbaV07XG4gICAgICBpZiAoIWNlbGxDbXBSZWYpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2VsbChjb2x1bW5zW2ldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXR0YWNoQ29sdW1uKGNvbHVtbnNbaV0sIGNlbGxDbXBSZWYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjdXJyZW50TGVuID0gdGhpcy5jZWxsc0xlbmd0aDtcbiAgICB3aGlsZSAoY3VycmVudExlbiA+IHRhcmdldExlbikge1xuICAgICAgdGhpcy5fZGVzdHJveUNlbGwoLS1jdXJyZW50TGVuKTtcbiAgICB9XG5cbiAgICB0aGlzLmRldGVjdENoYW5nZXMoKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIG91dE9mVmlldyBzdGF0ZSBvZiB0aGlzIHJvdyBhbmQgc3luYyBpdCB3aXRoIHRoZSBjb250ZXh0XG4gICAqIElmIHRoZSBjb250ZXh0J3Mgc3RhdGUgaXMgZGlmZmVyZW50IGZyb20gdGhlIG5ldyBvdXRPZlZpZXcgc3RhdGUsIHdpbGwgaW52b2tlIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZS5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfc2V0T3V0T2ZWaWV3U3RhdGUob3V0T2ZWaWV3OiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMub3V0T2ZWaWV3ICE9PSBvdXRPZlZpZXcpIHtcbiAgICAgIHRoaXMub3V0T2ZWaWV3ID0gb3V0T2ZWaWV3O1xuICAgICAgaWYgKHRoaXMuY29udGV4dD8ub3V0T2ZWaWV3ICE9PSBvdXRPZlZpZXcpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm91dE9mVmlldyA9IG91dE9mVmlldztcbiAgICAgICAgLy8gVE9ETzogSWYgc2Nyb2xsaW5nLCBtYXJrIHRoZSByb3cgZm9yIGNoZWNrIGFuZCB1cGRhdGUgb25seSBhZnRlciBzY3JvbGwgaXMgZG9uZVxuICAgICAgICB0aGlzLm5nRG9DaGVjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBgb3V0T2ZWaWV3YCBmbGFnIG9mIHRoZSBjb250ZXh0IGF0dGFjaGVkIHRvIHRoaXMgcm93XG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGJhY2t3YXJkIGNvbXBhdGlibGUgdG8gc3VwcG9ydCBicm93c2VyIHdpdGhvdXQgdGhlIEludGVyc2VjdGlvbk9ic2VydmFibGUgQVBJLlxuICAgKlxuICAgKiBJZiB0aGUgYnJvd3NlciBET0VTIE5PVCBzdXBwb3J0IEludGVyc2VjdGlvbk9ic2VydmVyIGl0IHdpbGwgY2FsY3VsYXRlIHRoZSBzdGF0ZSB1c2luZyBib3VuZGluZyByZWN0IEFQSXMgKGZvcmNlIHBhcmFtIGhhcyBubyBlZmZlY3QsIGFsd2F5cyB0cnVlKS5cbiAgICogSWYgdGhlIGJyb3dzZXIgc3VwcG9ydCBJbnRlcnNlY3Rpb25PYnNlcnZlciBpdCB3aWxsIGRvIG5vdGhpbmcgd2hlbiBmb3JjZSBpcyBub3Qgc2V0IHRvIHRydWUgYnV0IHdoZW4gKiBzZXQgdG8gdHJ1ZSBpdCB3aWxsIHVzZVxuICAgKiB0aGUgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgYHRha2VSZWNvcmRzYCBtZXRob2QgdG8gdXBkYXRlIHRoZSBvdXRPZlZpZXcgc3RhdGUuXG4gICAqXG4gICAqID4gTk9URSB0aGF0IHRoaXMgbWV0aG9kIGhhcyBhIGRpcmVjdCBpbXBhY3Qgb24gcGVyZm9ybWFuY2UgYXMgaXQgdXNlcyBET00gYXBpcyB0aGF0IHRyaWdnZXIgbGF5b3V0IHJlZmxvd3MuXG4gICAqIFVzZSB3aXRoIGNhdXRpb24uXG4gICAqL1xuICB1cGRhdGVPdXRPZlZpZXcoZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyTW9kZSB8fCBmb3JjZSkge1xuICAgICAgdGhpcy5fZXh0QXBpLnJvd3NBcGkuZm9yY2VVcGRhdGVPdXRPZlZpZXcodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG9uQ3RvcigpIHtcbiAgICBjb25zdCB7IGNvbnRleHQsIGluZGV4IH0gPSByb3dDb250ZXh0QnJpZGdlLmJyaWRnZVJvdyh0aGlzKTtcbiAgICB0aGlzLmdyaWQgPSBjb250ZXh0LmdyaWQ7XG4gICAgdGhpcy5fZXh0QXBpID0gUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmQodGhpcy5ncmlkKS5leHRBcGkgYXMgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaTxUPjtcbiAgICB0aGlzLl9yb3dJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5jb250ZXh0LmF0dGFjaFJvdyh0aGlzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBkZXRlY3RDaGFuZ2VzKCkge1xuICAgIGlmICh0aGlzLmdyaWQucm93Q2xhc3NVcGRhdGUgJiYgdGhpcy5ncmlkLnJvd0NsYXNzVXBkYXRlRnJlcSA9PT0gJ25nRG9DaGVjaycpIHtcbiAgICAgIHRoaXMudXBkYXRlSG9zdENsYXNzKCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2VsbCBvZiB0aGlzLl9jZWxscykge1xuICAgICAgLy8gVE9ETzogdGhlIGNlbGxzIGFyZSBjcmVhdGVkIHRocm91Z2ggY29kZSB3aGljaCBtZWFuJ3MgdGhhdCB0aGV5IGRvbid0IGJlbG9uZ1xuICAgICAgLy8gdG8gdGhlIENEIHRyZWUgYW5kIHdlIG5lZWQgdG8gbWFudWFsbHkgbWFyayB0aGVtIGZvciBjaGVja2luZ1xuICAgICAgLy8gV2UgY2FuIGN1c3RvbWl6ZSB0aGUgZGlmZmluZywgZGV0ZWN0IGNvbnRleHQgY2hhbmdlcyBpbnRlcm5hbGx5IGFuZCBvbmx5IHRyaWdnZXIgdGhlc2UgY2VsbHMgd2hpY2ggaGF2ZSBjaGFuZ2VkIVxuICAgICAgY2VsbC5pbnN0YW5jZS5zZXRDb250ZXh0KHRoaXMuY29udGV4dCk7XG4gICAgICBjZWxsLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlSG9zdENsYXNzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbGVtZW50O1xuXG4gICAgLy8gaWYgdGhlcmUgaXMgYW4gdXBkYXRlciwgd29yayB3aXRoIGl0XG4gICAgLy8gb3RoZXJ3aXNlLCBjbGVhciBwcmV2aW91cyBjbGFzc2VzIHRoYXQgZ290IGFwcGxpZWQgKGFzc3VtZWQgYSBsaXZlIGJpbmRpbmcgY2hhbmdlIG9mIHRoZSB1cGRhdGVyIGZ1bmN0aW9uKVxuICAgIC8vIHVzZXJzIHNob3VsZCBiZSBhd2FyZSB0byB0ZWFyIGRvd24gdGhlIHVwZGF0ZXIgb25seSB3aGVuIHRoZXkgd2FudCB0byBzdG9wIHRoaXMgZmVhdHVyZSwgaWYgdGhlIGdvYWwgaXMganVzdCB0byB0b2dnbGUgb24vb2ZmXG4gICAgLy8gaXQncyBiZXR0ZXIgdG8gc2V0IHRoZSBmcmVxdWVuY3kgdG8gYG5vbmVgIGFuZCByZXR1cm4gbm90aGluZyBmcm9tIHRoZSBmdW5jdGlvbiAocmVwbGFjZSBpdCkgc28gdGhlIGRpZmZlciBpcyBub3QgbnVrZWQuXG4gICAgaWYgKHRoaXMuZ3JpZC5yb3dDbGFzc1VwZGF0ZSkge1xuICAgICAgaWYgKCF0aGlzLl9jbGFzc0RpZmZlcikge1xuICAgICAgICB0aGlzLl9jbGFzc0RpZmZlciA9IG5ldyBTdHlsaW5nRGlmZmVyPHsgW2tsYXNzOiBzdHJpbmddOiB0cnVlIH0+KFxuICAgICAgICAgICdOZ0NsYXNzJyxcbiAgICAgICAgICBTdHlsaW5nRGlmZmVyT3B0aW9ucy5UcmltUHJvcGVydGllcyB8IFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3ViS2V5cyB8IFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWUgfCBTdHlsaW5nRGlmZmVyT3B0aW9ucy5Gb3JjZUFzTWFwLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9sYXN0Q2xhc3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmdyaWQucm93Q2xhc3NVcGRhdGUodGhpcy5jb250ZXh0KTtcbiAgICAgIHRoaXMuX2NsYXNzRGlmZmVyLnNldElucHV0KG5ld1ZhbHVlKTtcblxuICAgICAgaWYgKHRoaXMuX2NsYXNzRGlmZmVyLnVwZGF0ZVZhbHVlKCkpIHtcbiAgICAgICAgY29uc3QgbGFzdENsYXNzID0gdGhpcy5fbGFzdENsYXNzO1xuICAgICAgICB0aGlzLl9sYXN0Q2xhc3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2NsYXNzRGlmZmVyLnZhbHVlIHx8IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuICAgICAgICAgIGlmICh2YWx1ZVtrZXldKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGtleSk7XG4gICAgICAgICAgICB0aGlzLl9sYXN0Q2xhc3MuYWRkKGtleSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFzdENsYXNzLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXN0Q2xhc3Muc2l6ZSA+IDApIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBsYXN0Q2xhc3MudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2NsYXNzRGlmZmVyKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2NsYXNzRGlmZmVyLnZhbHVlIHx8IHt9O1xuICAgICAgdGhpcy5fY2xhc3NEaWZmZXIgPSB0aGlzLl9sYXN0Q2xhc3MgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNlbGxDcmVhdGVkKGNvbHVtbjogUGJsQ29sdW1uLCBjZWxsOiBDb21wb25lbnRSZWY8UGJsTmdyaWRDZWxsQ29tcG9uZW50Pikge1xuICAgIHRoaXMuYXR0YWNoQ29sdW1uKGNvbHVtbiwgY2VsbCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2VsbERlc3Ryb3llZChjZWxsOiBDb21wb25lbnRSZWY8UGJsTmdyaWRDZWxsQ29tcG9uZW50PiwgcHJldmlvdXNJbmRleDogbnVtYmVyKSB7XG4gICAgdW5yeC5raWxsKHRoaXMsIGNlbGwuaW5zdGFuY2UuY29sdW1uKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjZWxsTW92ZWQocHJldmlvdXNJdGVtOiBDb21wb25lbnRSZWY8UGJsTmdyaWRDZWxsQ29tcG9uZW50PiwgY3VycmVudEl0ZW06IENvbXBvbmVudFJlZjxQYmxOZ3JpZENlbGxDb21wb25lbnQ+LCBwcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSB7XG4gICAgY3VycmVudEl0ZW0uaW5zdGFuY2Uuc3luY0NvbHVtbigpO1xuICAgIHRoaXMuY29udGV4dC51cGRhdGVDZWxsKHByZXZpb3VzSXRlbS5pbnN0YW5jZS5jZWxsQ3R4LmNsb25lKGN1cnJlbnRJdGVtLmluc3RhbmNlLmNvbHVtbikpO1xuICAgIGN1cnJlbnRJdGVtLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGlkZW50aXR5VXBkYXRlZCgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdyb3ctaWQnLCB0aGlzLmNvbnRleHQuZHNJbmRleCBhcyBhbnkpO1xuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Jvdy1rZXknLCB0aGlzLmNvbnRleHQuaWRlbnRpdHkpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaENvbHVtbihjb2x1bW46IFBibENvbHVtbiwgY2VsbDogQ29tcG9uZW50UmVmPFBibE5ncmlkQ2VsbENvbXBvbmVudD4pIHtcbiAgICBpZiAoIWNvbHVtbi5jb2x1bW5EZWYpIHtcbiAgICAgIG5ldyBQYmxOZ3JpZENvbHVtbkRlZih0aGlzLl9leHRBcGkpLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIGNvbHVtbi5jb2x1bW5EZWYubmFtZSA9IGNvbHVtbi5pZDtcbiAgICB9XG4gICAgY2VsbC5pbnN0YW5jZS5zZXRDb2x1bW4oY29sdW1uKTtcbiAgICBjZWxsLmluc3RhbmNlLnNldENvbnRleHQodGhpcy5jb250ZXh0KTtcbiAgfVxufVxuIl19