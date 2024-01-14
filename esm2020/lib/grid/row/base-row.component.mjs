import { ChangeDetectorRef, Injector, Directive, ElementRef, Optional, ViewContainerRef, ViewChild, Inject, } from '@angular/core';
import { unrx } from '@asafmalin/ngrid/core';
import { PBL_NGRID_COMPONENT } from '../../tokens';
import { PblNgridPluginController } from '../../ext/plugin-control';
import { EXT_API_TOKEN } from '../../ext/grid-ext-api';
import { moveItemInArrayExt } from '../column/management/column-store';
import * as i0 from "@angular/core";
export const PBL_NGRID_BASE_ROW_TEMPLATE = `<ng-container #viewRef></ng-container>`;
// tslint:disable-next-line: no-conflicting-lifecycle
export class PblNgridBaseRowComponent {
    constructor(grid, cdRef, elementRef) {
        this.cdRef = cdRef;
        this._cells = [];
        this._attached = true;
        this.element = elementRef.nativeElement;
        if (grid) {
            this.grid = grid;
        }
        this.onCtor();
    }
    get height() {
        return this.element.getBoundingClientRect().height;
    }
    get cellsLength() { return this._cells.length; }
    /**
     * An attached row will run change detection on it's children.
     * All rows are attached by default.
     */
    get attached() { return this._attached; }
    ngOnInit() {
        if (!this.grid) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`When a grid row is used outside the scope of a grid, you must provide the grid instance.`);
            }
        }
        this.resolveTokens();
        this.element.setAttribute('data-rowtype', this.rowType);
        this._extApi.rowsApi.addRow(this);
    }
    ngAfterViewInit() {
        for (const c of this._extApi.columnStore.getColumnsOf(this)) {
            this._createCell(c);
        }
        this.detectChanges();
    }
    ngDoCheck() {
        if (this._attached && this.grid) {
            this.detectChanges();
        }
    }
    ngOnDestroy() {
        unrx.kill(this);
        this._extApi?.rowsApi.removeRow(this);
    }
    /**
     * Marks the row as attached.
     * Rows are attached by default.
     * An attached row takes part in the change detection process
     */
    _attach() {
        if (!this._attached) {
            this._attached = true;
            return true;
        }
        return false;
    }
    /**
     * Marks the row as detached.
     * A detached row DOWS NOT take part in the change detection process.
     *
     * Usually when the rendering engine cache row elements for performance, these should be detached when cached and re-attached when returned into view.
     */
    _detach() {
        if (this._attached) {
            this._attached = false;
            return true;
        }
        return false;
    }
    _createCell(column, atIndex) {
        if (!this.canCreateCell || this.canCreateCell(column, atIndex)) {
            const cell = this.createComponent(column, atIndex);
            cell.instance.setOwner(this);
            if (this.cellCreated) {
                this.cellCreated(column, cell);
            }
        }
    }
    _destroyCell(cellOrCellIndex) {
        const cell = typeof cellOrCellIndex === 'number' ? this._cells[cellOrCellIndex] : cellOrCellIndex;
        if (cell) {
            const index = this._cells.indexOf(cell);
            if (!this.canDestroyCell || this.canDestroyCell(cell)) {
                const len = this._cells.length;
                this._viewRef.remove(index);
                if (len === this._cells.length) {
                    this._cells.splice(index, 1);
                }
                if (this.cellDestroyed) {
                    this.cellDestroyed(cell, index);
                }
            }
        }
    }
    _moveCell(fromIndex, toIndex) {
        const cmp = this._cells[fromIndex];
        if (cmp) {
            if (!this.canMoveCell || this.canMoveCell(fromIndex, toIndex, cmp)) {
                this._viewRef.move(cmp.hostView, toIndex);
                moveItemInArrayExt(this._cells, fromIndex, toIndex, (previousItem, currentItem, previousIndex, currentIndex) => {
                    if (this.cellMoved) {
                        this.cellMoved(previousItem, currentItem, previousIndex, currentIndex);
                    }
                });
            }
        }
    }
    createComponent(column, atIndex) {
        const viewRefLength = this._viewRef.length;
        if (!atIndex && atIndex !== 0) {
            atIndex = viewRefLength;
        }
        atIndex = Math.min(viewRefLength, atIndex);
        const cell = this._viewRef.createComponent(this._extApi.rowsApi.cellFactory.getComponentFactory(this), atIndex, this.cellInjector);
        this._cells.splice(atIndex, 0, cell);
        cell.onDestroy(() => this._cells.splice(this._cells.indexOf(cell), 1));
        return cell;
    }
    /**
     * Resolves the extensions API and the injector to be used when creating cells.
     */
    resolveTokens() {
        // The cells require the extApi and grid to live on the DI tree.
        // In the case of row it might not be there since the row is defined outside of the grid somewhere
        // Row's are defined view templates so their DI tree depended on their location hence we need to verify
        // that we can get the extApi from the viewRef's injector, if so, great if not we need to extend the injector we use
        // to build cells.
        const injector = this._viewRef?.injector;
        const extApi = injector?.get(EXT_API_TOKEN, null);
        if (!extApi) {
            // _extApi might be here already...
            this._extApi = this._extApi || PblNgridPluginController.find(this.grid).extApi;
            this.cellInjector = Injector.create({
                providers: [
                    { provide: PBL_NGRID_COMPONENT, useValue: this.grid },
                    { provide: this.grid.constructor, useValue: this.grid },
                    { provide: EXT_API_TOKEN, useValue: this._extApi },
                ],
                parent: injector,
            });
        }
        else {
            this._extApi = this._extApi || extApi;
            this.cellInjector = injector;
        }
    }
}
/** @nocollapse */ PblNgridBaseRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowComponent, deps: [{ token: PBL_NGRID_COMPONENT, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseRowComponent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseRowComponent, viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseRowComponent, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PBL_NGRID_COMPONENT]
                }, {
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }]; }, propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1yb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvcm93L2Jhc2Utcm93LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ1UsaUJBQWlCLEVBQUUsUUFBUSxFQUMxQyxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFHUixnQkFBZ0IsRUFDaEIsU0FBUyxFQUVULE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsT0FBTyxFQUFzQixtQkFBbUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN2RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFnQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDOztBQUl2RSxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBSSx3Q0FBd0MsQ0FBQztBQUVyRixxREFBcUQ7QUFFckQsTUFBTSxPQUFnQix3QkFBd0I7SUErQjVDLFlBQXFELElBQTJCLEVBQzNELEtBQXdCLEVBQ2pDLFVBQW1DO1FBRDFCLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBUG5DLFdBQU0sR0FBc0QsRUFBRSxDQUFDO1FBSWpFLGNBQVMsR0FBRyxJQUFJLENBQUM7UUFLdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ3hDLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDbEI7UUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQS9CRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxPQUFP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LElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBeUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLFNBQVMsRUFBRTtvQkFDVCxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDckQsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ3ZELEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtpQkFDbkQ7Z0JBQ0QsTUFBTSxFQUFFLFFBQVE7YUFDakIsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUM7WUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7U0FDOUI7SUFDSCxDQUFDOzt3SUEzTG1CLHdCQUF3QixrQkErQnhCLG1CQUFtQjs0SEEvQm5CLHdCQUF3QiwwR0FJZCxnQkFBZ0I7MkZBSjFCLHdCQUF3QjtrQkFEN0MsU0FBUzs7MEJBZ0NLLE1BQU07MkJBQUMsbUJBQW1COzswQkFBRyxRQUFRO3FHQTNCYyxRQUFRO3NCQUF2RSxTQUFTO3VCQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCwgQ2hhbmdlRGV0ZWN0b3JSZWYsIEluamVjdG9yLCBPbkluaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgT3B0aW9uYWwsXG4gIERvQ2hlY2ssXG4gIE9uRGVzdHJveSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0NoaWxkLFxuICBDb21wb25lbnRSZWYsXG4gIEluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgX1BibE5ncmlkQ29tcG9uZW50LCBQQkxfTkdSSURfQ09NUE9ORU5UIH0gZnJvbSAnLi4vLi4vdG9rZW5zJztcbmltcG9ydCB7IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciB9IGZyb20gJy4uLy4uL2V4dC9wbHVnaW4tY29udHJvbCc7XG5pbXBvcnQgeyBFWFRfQVBJX1RPS0VOLCBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBtb3ZlSXRlbUluQXJyYXlFeHQgfSBmcm9tICcuLi9jb2x1bW4vbWFuYWdlbWVudC9jb2x1bW4tc3RvcmUnO1xuaW1wb3J0IHsgR3JpZFJvd1R5cGUsIFBibFJvd1R5cGVUb0NlbGxUeXBlTWFwIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBQYmxSb3dUeXBlVG9Db2x1bW5UeXBlTWFwIH0gZnJvbSAnLi4vY29sdW1uL21hbmFnZW1lbnQnO1xuXG5leHBvcnQgY29uc3QgUEJMX05HUklEX0JBU0VfUk9XX1RFTVBMQVRFICA9IGA8bmctY29udGFpbmVyICN2aWV3UmVmPjwvbmctY29udGFpbmVyPmA7XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZmxpY3RpbmctbGlmZWN5Y2xlXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQYmxOZ3JpZEJhc2VSb3dDb21wb25lbnQ8VFJvd1R5cGUgZXh0ZW5kcyBHcmlkUm93VHlwZSwgVCA9IGFueT4gaW1wbGVtZW50cyBPbkluaXQsIERvQ2hlY2ssIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PFQ+O1xuXG4gIEBWaWV3Q2hpbGQoJ3ZpZXdSZWYnLCB7IHJlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZSB9KSBfdmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICB9XG5cbiAgZ2V0IGNlbGxzTGVuZ3RoKCkgeyByZXR1cm4gdGhpcy5fY2VsbHMubGVuZ3RoOyB9XG5cbiAgLyoqXG4gICAqIEFuIGF0dGFjaGVkIHJvdyB3aWxsIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGl0J3MgY2hpbGRyZW4uXG4gICAqIEFsbCByb3dzIGFyZSBhdHRhY2hlZCBieSBkZWZhdWx0LlxuICAgKi9cbiAgZ2V0IGF0dGFjaGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fYXR0YWNoZWQ7IH1cblxuICBhYnN0cmFjdCByZWFkb25seSByb3dUeXBlOiBUUm93VHlwZTtcblxuICBhYnN0cmFjdCBnZXQgcm93SW5kZXgoKTogbnVtYmVyO1xuXG4gIHByb3RlY3RlZCBfZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpPFQ+O1xuICBwcm90ZWN0ZWQgX2NlbGxzOiBDb21wb25lbnRSZWY8UGJsUm93VHlwZVRvQ2VsbFR5cGVNYXA8VFJvd1R5cGU+PltdID0gW107XG5cbiAgcHJvdGVjdGVkIGNlbGxJbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgcHJpdmF0ZSBfYXR0YWNoZWQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoUEJMX05HUklEX0NPTVBPTkVOVCkgQE9wdGlvbmFsKCkgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PFQ+LFxuICAgICAgICAgICAgICByZWFkb25seSBjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGlmIChncmlkKSB7XG4gICAgICB0aGlzLmdyaWQgPSBncmlkO1xuICAgIH1cbiAgICB0aGlzLm9uQ3RvcigpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLmdyaWQpIHtcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaGVuIGEgZ3JpZCByb3cgaXMgdXNlZCBvdXRzaWRlIHRoZSBzY29wZSBvZiBhIGdyaWQsIHlvdSBtdXN0IHByb3ZpZGUgdGhlIGdyaWQgaW5zdGFuY2UuYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVzb2x2ZVRva2VucygpO1xuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93dHlwZScsIHRoaXMucm93VHlwZSk7XG4gICAgdGhpcy5fZXh0QXBpLnJvd3NBcGkuYWRkUm93KHRoaXMpXG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjIG9mIHRoaXMuX2V4dEFwaS5jb2x1bW5TdG9yZS5nZXRDb2x1bW5zT2YodGhpcykpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUNlbGwoYyk7XG4gICAgfVxuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hdHRhY2hlZCAmJiB0aGlzLmdyaWQpIHtcbiAgICAgIHRoaXMuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHVucngua2lsbCh0aGlzKTtcbiAgICB0aGlzLl9leHRBcGk/LnJvd3NBcGkucmVtb3ZlUm93KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIHRoZSByb3cgYXMgYXR0YWNoZWQuXG4gICAqIFJvd3MgYXJlIGF0dGFjaGVkIGJ5IGRlZmF1bHQuXG4gICAqIEFuIGF0dGFjaGVkIHJvdyB0YWtlcyBwYXJ0IGluIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHByb2Nlc3NcbiAgICovXG4gIF9hdHRhY2goKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgdGhpcy5fYXR0YWNoZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgcm93IGFzIGRldGFjaGVkLlxuICAgKiBBIGRldGFjaGVkIHJvdyBET1dTIE5PVCB0YWtlIHBhcnQgaW4gdGhlIGNoYW5nZSBkZXRlY3Rpb24gcHJvY2Vzcy5cbiAgICpcbiAgICogVXN1YWxseSB3aGVuIHRoZSByZW5kZXJpbmcgZW5naW5lIGNhY2hlIHJvdyBlbGVtZW50cyBmb3IgcGVyZm9ybWFuY2UsIHRoZXNlIHNob3VsZCBiZSBkZXRhY2hlZCB3aGVuIGNhY2hlZCBhbmQgcmUtYXR0YWNoZWQgd2hlbiByZXR1cm5lZCBpbnRvIHZpZXcuXG4gICAqL1xuICBfZGV0YWNoKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfY3JlYXRlQ2VsbChjb2x1bW46IFBibFJvd1R5cGVUb0NvbHVtblR5cGVNYXA8VFJvd1R5cGU+LCBhdEluZGV4PzogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLmNhbkNyZWF0ZUNlbGwgfHwgdGhpcy5jYW5DcmVhdGVDZWxsKGNvbHVtbiwgYXRJbmRleCkpIHtcbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNyZWF0ZUNvbXBvbmVudChjb2x1bW4sIGF0SW5kZXgpO1xuICAgICAgY2VsbC5pbnN0YW5jZS5zZXRPd25lcih0aGlzKTtcbiAgICAgIGlmICh0aGlzLmNlbGxDcmVhdGVkKSB7XG4gICAgICAgIHRoaXMuY2VsbENyZWF0ZWQoY29sdW1uLCBjZWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZGVzdHJveUNlbGwoY2VsbE9yQ2VsbEluZGV4OiBudW1iZXIgfCBDb21wb25lbnRSZWY8UGJsUm93VHlwZVRvQ2VsbFR5cGVNYXA8VFJvd1R5cGU+Pikge1xuICAgIGNvbnN0IGNlbGwgPSB0eXBlb2YgY2VsbE9yQ2VsbEluZGV4ID09PSAnbnVtYmVyJyA/IHRoaXMuX2NlbGxzW2NlbGxPckNlbGxJbmRleF0gOiBjZWxsT3JDZWxsSW5kZXg7XG4gICAgaWYgKGNlbGwpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fY2VsbHMuaW5kZXhPZihjZWxsKTtcbiAgICAgIGlmICghdGhpcy5jYW5EZXN0cm95Q2VsbCB8fCB0aGlzLmNhbkRlc3Ryb3lDZWxsKGNlbGwpKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHRoaXMuX2NlbGxzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fdmlld1JlZi5yZW1vdmUoaW5kZXgpO1xuICAgICAgICBpZiAobGVuID09PSB0aGlzLl9jZWxscy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLl9jZWxscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNlbGxEZXN0cm95ZWQpIHtcbiAgICAgICAgICB0aGlzLmNlbGxEZXN0cm95ZWQoY2VsbCwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX21vdmVDZWxsKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBjbXAgPSB0aGlzLl9jZWxsc1tmcm9tSW5kZXhdO1xuICAgIGlmIChjbXApIHtcbiAgICAgIGlmICghdGhpcy5jYW5Nb3ZlQ2VsbCB8fCB0aGlzLmNhbk1vdmVDZWxsKGZyb21JbmRleCwgdG9JbmRleCwgY21wKSkge1xuICAgICAgICB0aGlzLl92aWV3UmVmLm1vdmUoY21wLmhvc3RWaWV3LCB0b0luZGV4KTtcbiAgICAgICAgbW92ZUl0ZW1JbkFycmF5RXh0KHRoaXMuX2NlbGxzLCBmcm9tSW5kZXgsIHRvSW5kZXgsIChwcmV2aW91c0l0ZW0sIGN1cnJlbnRJdGVtLCBwcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5jZWxsTW92ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2VsbE1vdmVkKHByZXZpb3VzSXRlbSwgY3VycmVudEl0ZW0sIHByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZGV0ZWN0Q2hhbmdlcygpO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25DdG9yKCk7XG5cbiAgcHJvdGVjdGVkIGNhbkNyZWF0ZUNlbGw/KGNvbHVtbjogUGJsUm93VHlwZVRvQ29sdW1uVHlwZU1hcDxUUm93VHlwZT4sIGF0SW5kZXg/OiBudW1iZXIpOiBib29sZWFuO1xuICBwcm90ZWN0ZWQgY2FuRGVzdHJveUNlbGw/KGNlbGw6IENvbXBvbmVudFJlZjxQYmxSb3dUeXBlVG9DZWxsVHlwZU1hcDxUUm93VHlwZT4+KTogYm9vbGVhbjtcbiAgcHJvdGVjdGVkIGNhbk1vdmVDZWxsPyhmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyLCBjZWxsOiBDb21wb25lbnRSZWY8UGJsUm93VHlwZVRvQ2VsbFR5cGVNYXA8VFJvd1R5cGU+Pik6IGJvb2xlYW47XG4gIHByb3RlY3RlZCBjZWxsQ3JlYXRlZD8oY29sdW1uOiBQYmxSb3dUeXBlVG9Db2x1bW5UeXBlTWFwPFRSb3dUeXBlPiwgY2VsbDogQ29tcG9uZW50UmVmPFBibFJvd1R5cGVUb0NlbGxUeXBlTWFwPFRSb3dUeXBlPj4pO1xuICBwcm90ZWN0ZWQgY2VsbERlc3Ryb3llZD8oY2VsbDogQ29tcG9uZW50UmVmPFBibFJvd1R5cGVUb0NlbGxUeXBlTWFwPFRSb3dUeXBlPj4sIHByZXZpb3VzSW5kZXg6IG51bWJlcik7XG4gIHByb3RlY3RlZCBjZWxsTW92ZWQ/KHByZXZpb3VzSXRlbTogQ29tcG9uZW50UmVmPFBibFJvd1R5cGVUb0NlbGxUeXBlTWFwPFRSb3dUeXBlPj4sIGN1cnJlbnRJdGVtOiBDb21wb25lbnRSZWY8UGJsUm93VHlwZVRvQ2VsbFR5cGVNYXA8VFJvd1R5cGU+PiwgcHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcik7XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZUNvbXBvbmVudChjb2x1bW46IFBibFJvd1R5cGVUb0NvbHVtblR5cGVNYXA8VFJvd1R5cGU+LCBhdEluZGV4PzogbnVtYmVyKSB7XG4gICAgY29uc3Qgdmlld1JlZkxlbmd0aCA9IHRoaXMuX3ZpZXdSZWYubGVuZ3RoO1xuICAgIGlmICghYXRJbmRleCAmJiBhdEluZGV4ICE9PSAwKSB7XG4gICAgICBhdEluZGV4ID0gdmlld1JlZkxlbmd0aDtcbiAgICB9XG4gICAgYXRJbmRleCA9IE1hdGgubWluKHZpZXdSZWZMZW5ndGgsIGF0SW5kZXgpO1xuICAgIGNvbnN0IGNlbGwgPSB0aGlzLl92aWV3UmVmLmNyZWF0ZUNvbXBvbmVudCh0aGlzLl9leHRBcGkucm93c0FwaS5jZWxsRmFjdG9yeS5nZXRDb21wb25lbnRGYWN0b3J5KHRoaXMpLCBhdEluZGV4LCB0aGlzLmNlbGxJbmplY3Rvcik7XG4gICAgdGhpcy5fY2VsbHMuc3BsaWNlKGF0SW5kZXgsIDAsIGNlbGwpO1xuICAgIGNlbGwub25EZXN0cm95KCgpID0+IHRoaXMuX2NlbGxzLnNwbGljZSh0aGlzLl9jZWxscy5pbmRleE9mKGNlbGwpLCAxKSk7XG4gICAgcmV0dXJuIGNlbGw7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIGV4dGVuc2lvbnMgQVBJIGFuZCB0aGUgaW5qZWN0b3IgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGNlbGxzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlc29sdmVUb2tlbnMoKSB7XG4gICAgLy8gVGhlIGNlbGxzIHJlcXVpcmUgdGhlIGV4dEFwaSBhbmQgZ3JpZCB0byBsaXZlIG9uIHRoZSBESSB0cmVlLlxuICAgIC8vIEluIHRoZSBjYXNlIG9mIHJvdyBpdCBtaWdodCBub3QgYmUgdGhlcmUgc2luY2UgdGhlIHJvdyBpcyBkZWZpbmVkIG91dHNpZGUgb2YgdGhlIGdyaWQgc29tZXdoZXJlXG4gICAgLy8gUm93J3MgYXJlIGRlZmluZWQgdmlldyB0ZW1wbGF0ZXMgc28gdGhlaXIgREkgdHJlZSBkZXBlbmRlZCBvbiB0aGVpciBsb2NhdGlvbiBoZW5jZSB3ZSBuZWVkIHRvIHZlcmlmeVxuICAgIC8vIHRoYXQgd2UgY2FuIGdldCB0aGUgZXh0QXBpIGZyb20gdGhlIHZpZXdSZWYncyBpbmplY3RvciwgaWYgc28sIGdyZWF0IGlmIG5vdCB3ZSBuZWVkIHRvIGV4dGVuZCB0aGUgaW5qZWN0b3Igd2UgdXNlXG4gICAgLy8gdG8gYnVpbGQgY2VsbHMuXG4gICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl92aWV3UmVmPy5pbmplY3RvcjtcblxuICAgIGNvbnN0IGV4dEFwaSA9IGluamVjdG9yPy5nZXQ8UGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaTxUPj4oRVhUX0FQSV9UT0tFTiwgbnVsbCk7XG4gICAgaWYgKCFleHRBcGkpIHtcbiAgICAgIC8vIF9leHRBcGkgbWlnaHQgYmUgaGVyZSBhbHJlYWR5Li4uXG4gICAgICB0aGlzLl9leHRBcGkgPSB0aGlzLl9leHRBcGkgfHwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmQodGhpcy5ncmlkKS5leHRBcGkgYXMgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaTxUPjtcbiAgICAgIHRoaXMuY2VsbEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgeyBwcm92aWRlOiBQQkxfTkdSSURfQ09NUE9ORU5ULCB1c2VWYWx1ZTogdGhpcy5ncmlkIH0sXG4gICAgICAgICAgeyBwcm92aWRlOiB0aGlzLmdyaWQuY29uc3RydWN0b3IsIHVzZVZhbHVlOiB0aGlzLmdyaWQgfSxcbiAgICAgICAgICB7IHByb3ZpZGU6IEVYVF9BUElfVE9LRU4sIHVzZVZhbHVlOiB0aGlzLl9leHRBcGkgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFyZW50OiBpbmplY3RvcixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9leHRBcGkgPSB0aGlzLl9leHRBcGkgfHwgZXh0QXBpO1xuICAgICAgdGhpcy5jZWxsSW5qZWN0b3IgPSBpbmplY3RvcjtcbiAgICB9XG4gIH1cblxufVxuIl19