import { Directive, Input } from '@angular/core';
import { DragDrop, CDK_DRAG_PARENT } from '@angular/cdk/drag-drop';
import { unrx } from '@pebula/ngrid/core';
import { PblColumn, PblNgridPluginController } from '@pebula/ngrid';
import { PblDragDrop, CdkLazyDrag } from '../core/index';
import { COL_DRAG_CONTAINER_PLUGIN_KEY } from './column-drag-container';
import * as i0 from "@angular/core";
export class PblNgridColumnDragDirective extends CdkLazyDrag {
    constructor() {
        super(...arguments);
        this.rootElementSelector = 'pbl-ngrid-header-cell';
    }
    get column() { return this._column; }
    set column(value) {
        if (value !== this._column) {
            this._column = value;
            this.updateDisabledState();
        }
    }
    ngAfterViewInit() {
        if (!this.cdkDropList) {
            this.cdkDropList = PblNgridPluginController.findPlugin(this.column.columnDef.grid, COL_DRAG_CONTAINER_PLUGIN_KEY);
        }
        super.ngAfterViewInit();
        this._dragRef.beforeStarted.subscribe(() => {
            const { cdkDropList } = this;
            if (cdkDropList?.canDrag(this.column)) {
                // we don't allow a new dragging session before the previous ends.
                // this sound impossible, but due to animation transitions its actually is.
                // if the `transitionend` is long enough, a new drag can start...
                //
                // the `disabled` state is checked by pointerDown AFTER calling before start so we can cancel the start...
                if (cdkDropList._dropListRef.isDragging()) {
                    return this.disabled = true;
                }
            }
        });
        this.started.subscribe(() => {
            if (this._column.columnDef) {
                this.column.columnDef.isDragging = true;
            }
        });
        this.ended.subscribe(() => {
            if (this._column.columnDef) {
                this.column.columnDef.isDragging = false;
            }
        });
    }
    ngOnDestroy() {
        unrx.kill(this);
        super.ngOnDestroy();
    }
    getCells() {
        if (!this.cache) {
            this.cache = this.column.columnDef.queryCellElements('table');
        }
        return this.cache;
    }
    reset() {
        super.reset();
        if (this.cache) {
            for (const el of this.cache) {
                el.style.transform = ``;
            }
            this.cache = undefined;
        }
    }
    dropContainerChanged(prev) {
        if (prev) {
            unrx.kill(this, prev);
        }
        this.updateDisabledState();
        this.updateBoundaryElement();
        if (this.cdkDropList) {
            this.cdkDropList.connectionsChanged
                .pipe(unrx(this, this.cdkDropList))
                .subscribe(() => this.updateBoundaryElement());
        }
    }
    updateDisabledState() {
        this.disabled = this.column && this.cdkDropList ? !this.cdkDropList.canDrag(this.column) : true;
    }
    updateBoundaryElement() {
        if (this.cdkDropList?.hasConnections()) {
            this.boundaryElement = undefined;
        }
        else {
            this.boundaryElement = this.cdkDropList.directContainerElement;
        }
    }
}
/** @nocollapse */ PblNgridColumnDragDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDragDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDragDirective, selector: "[pblNgridColumnDrag]", inputs: { column: ["pblNgridColumnDrag", "column"] }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DRAG_PARENT, useExisting: PblNgridColumnDragDirective }
    ], exportAs: ["pblNgridColumnDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridColumnDrag]',
                    exportAs: 'pblNgridColumnDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DRAG_PARENT, useExisting: PblNgridColumnDragDirective }
                    ]
                }]
        }], propDecorators: { column: [{
                type: Input,
                args: ['pblNgridColumnDrag']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWRyYWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9kcmFnLWFuZC1kcm9wL2NvbHVtbi9jb2x1bW4tZHJhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSw2QkFBNkIsRUFBd0MsTUFBTSx5QkFBeUIsQ0FBQzs7QUFjOUcsTUFBTSxPQUFPLDJCQUFxQyxTQUFRLFdBQXVGO0lBWmpKOztRQWFFLHdCQUFtQixHQUFHLHVCQUF1QixDQUFDO0tBOEYvQztJQTVGQyxJQUFpQyxNQUFNLEtBQWdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxNQUFNLENBQUMsS0FBZ0I7UUFDekIsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUM1QjtJQUNILENBQUM7SUFLRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDZCQUE2QixD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QyxXQUFXLEVBQUUsY0FBYyxFQUFFLEVBQUU7WUFDdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7U0FDbEM7YUFBTTtZQUNMLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztTQUNoRTtJQUNILENBQUM7OzJJQTlGVSwyQkFBMkI7K0hBQTNCLDJCQUEyQiwrTUFMM0I7UUFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtRQUMvQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLDJCQUEyQixFQUFFO0tBQ3ZFOzJGQUVVLDJCQUEyQjtrQkFadkMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsc0JBQXNCO29CQUNoQyxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLFVBQVU7d0JBQ25CLDJCQUEyQixFQUFFLHVCQUF1QjtxQkFDckQ7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO3dCQUMvQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyw2QkFBNkIsRUFBRTtxQkFDdkU7aUJBQ0Y7OEJBSWtDLE1BQU07c0JBQXRDLEtBQUs7dUJBQUMsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRHJhZ0Ryb3AsIENES19EUkFHX1BBUkVOVCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBibENvbHVtbiwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxEcmFnRHJvcCwgQ2RrTGF6eURyYWcgfSBmcm9tICcuLi9jb3JlL2luZGV4JztcbmltcG9ydCB7IENPTF9EUkFHX0NPTlRBSU5FUl9QTFVHSU5fS0VZLCBQYmxOZ3JpZENvbHVtbkRyYWdDb250YWluZXJEaXJlY3RpdmUgfSBmcm9tICcuL2NvbHVtbi1kcmFnLWNvbnRhaW5lcic7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1twYmxOZ3JpZENvbHVtbkRyYWddJyxcbiAgZXhwb3J0QXM6ICdwYmxOZ3JpZENvbHVtbkRyYWcnLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICAgICdjbGFzcyc6ICdjZGstZHJhZycsXG4gICAgJ1tjbGFzcy5jZGstZHJhZy1kcmFnZ2luZ10nOiAnX2RyYWdSZWYuaXNEcmFnZ2luZygpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgeyBwcm92aWRlOiBEcmFnRHJvcCwgdXNlRXhpc3Rpbmc6IFBibERyYWdEcm9wIH0sXG4gICAgeyBwcm92aWRlOiBDREtfRFJBR19QQVJFTlQsIHVzZUV4aXN0aW5nOiBQYmxOZ3JpZENvbHVtbkRyYWdEaXJlY3RpdmUgfVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ29sdW1uRHJhZ0RpcmVjdGl2ZTxUID0gYW55PiBleHRlbmRzIENka0xhenlEcmFnPFQsIFBibE5ncmlkQ29sdW1uRHJhZ0NvbnRhaW5lckRpcmVjdGl2ZTxUPiwgUGJsTmdyaWRDb2x1bW5EcmFnRGlyZWN0aXZlPFQ+PiB7XG4gIHJvb3RFbGVtZW50U2VsZWN0b3IgPSAncGJsLW5ncmlkLWhlYWRlci1jZWxsJztcblxuICBASW5wdXQoJ3BibE5ncmlkQ29sdW1uRHJhZycpIGdldCBjb2x1bW4oKTogUGJsQ29sdW1uIHsgcmV0dXJuIHRoaXMuX2NvbHVtbjsgfVxuICBzZXQgY29sdW1uKHZhbHVlOiBQYmxDb2x1bW4pIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX2NvbHVtbikge1xuICAgICAgdGhpcy5fY29sdW1uID0gdmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZURpc2FibGVkU3RhdGUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb2x1bW46IFBibENvbHVtbjtcbiAgcHJpdmF0ZSBjYWNoZTogSFRNTEVsZW1lbnRbXTtcblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNka0Ryb3BMaXN0KSB7XG4gICAgICB0aGlzLmNka0Ryb3BMaXN0ID0gUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmRQbHVnaW4odGhpcy5jb2x1bW4uY29sdW1uRGVmLmdyaWQsIENPTF9EUkFHX0NPTlRBSU5FUl9QTFVHSU5fS0VZKTtcbiAgICB9XG5cbiAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcblxuICAgIHRoaXMuX2RyYWdSZWYuYmVmb3JlU3RhcnRlZC5zdWJzY3JpYmUoICgpID0+IHtcbiAgICAgIGNvbnN0IHsgY2RrRHJvcExpc3QgfSA9IHRoaXM7XG4gICAgICBpZiAoY2RrRHJvcExpc3Q/LmNhbkRyYWcodGhpcy5jb2x1bW4pKSB7XG4gICAgICAgIC8vIHdlIGRvbid0IGFsbG93IGEgbmV3IGRyYWdnaW5nIHNlc3Npb24gYmVmb3JlIHRoZSBwcmV2aW91cyBlbmRzLlxuICAgICAgICAvLyB0aGlzIHNvdW5kIGltcG9zc2libGUsIGJ1dCBkdWUgdG8gYW5pbWF0aW9uIHRyYW5zaXRpb25zIGl0cyBhY3R1YWxseSBpcy5cbiAgICAgICAgLy8gaWYgdGhlIGB0cmFuc2l0aW9uZW5kYCBpcyBsb25nIGVub3VnaCwgYSBuZXcgZHJhZyBjYW4gc3RhcnQuLi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gdGhlIGBkaXNhYmxlZGAgc3RhdGUgaXMgY2hlY2tlZCBieSBwb2ludGVyRG93biBBRlRFUiBjYWxsaW5nIGJlZm9yZSBzdGFydCBzbyB3ZSBjYW4gY2FuY2VsIHRoZSBzdGFydC4uLlxuICAgICAgICBpZiAoY2RrRHJvcExpc3QuX2Ryb3BMaXN0UmVmLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zdGFydGVkLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2NvbHVtbi5jb2x1bW5EZWYpIHtcbiAgICAgICAgdGhpcy5jb2x1bW4uY29sdW1uRGVmLmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZW5kZWQuc3Vic2NyaWJlKCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29sdW1uLmNvbHVtbkRlZikge1xuICAgICAgICB0aGlzLmNvbHVtbi5jb2x1bW5EZWYuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdW5yeC5raWxsKHRoaXMpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICBnZXRDZWxscygpOiBIVE1MRWxlbWVudFtdIHtcbiAgICBpZiAoIXRoaXMuY2FjaGUpIHtcbiAgICAgIHRoaXMuY2FjaGUgPSB0aGlzLmNvbHVtbi5jb2x1bW5EZWYucXVlcnlDZWxsRWxlbWVudHMoJ3RhYmxlJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgICBpZiAodGhpcy5jYWNoZSkge1xuICAgICAgZm9yIChjb25zdCBlbCBvZiB0aGlzLmNhY2hlKSB7XG4gICAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGBgO1xuICAgICAgfVxuICAgICAgdGhpcy5jYWNoZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZHJvcENvbnRhaW5lckNoYW5nZWQocHJldjogUGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyRGlyZWN0aXZlPFQ+KSB7XG4gICAgaWYgKHByZXYpIHtcbiAgICAgIHVucngua2lsbCh0aGlzLCBwcmV2KTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZURpc2FibGVkU3RhdGUoKTtcblxuICAgIHRoaXMudXBkYXRlQm91bmRhcnlFbGVtZW50KCk7XG4gICAgaWYgKHRoaXMuY2RrRHJvcExpc3QpIHtcbiAgICAgIHRoaXMuY2RrRHJvcExpc3QuY29ubmVjdGlvbnNDaGFuZ2VkXG4gICAgICAgIC5waXBlKHVucngodGhpcywgdGhpcy5jZGtEcm9wTGlzdCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy51cGRhdGVCb3VuZGFyeUVsZW1lbnQoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVEaXNhYmxlZFN0YXRlKCkge1xuICAgIHRoaXMuZGlzYWJsZWQgPSB0aGlzLmNvbHVtbiAmJiB0aGlzLmNka0Ryb3BMaXN0ID8gIXRoaXMuY2RrRHJvcExpc3QuY2FuRHJhZyh0aGlzLmNvbHVtbikgOiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVCb3VuZGFyeUVsZW1lbnQoKSB7XG4gICAgaWYgKHRoaXMuY2RrRHJvcExpc3Q/Lmhhc0Nvbm5lY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMuYm91bmRhcnlFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJvdW5kYXJ5RWxlbWVudCA9IHRoaXMuY2RrRHJvcExpc3QuZGlyZWN0Q29udGFpbmVyRWxlbWVudDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==