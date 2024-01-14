// tslint:disable:no-output-rename
import { Directive, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DragDrop, CDK_DROP_LIST } from '@angular/cdk/drag-drop';
import { PblDragDrop } from '../core/index';
import { PblNgridColumnDragContainerDirective } from './column-drag-container';
import * as i0 from "@angular/core";
export const COL_REORDER_PLUGIN_KEY = 'columnReorder';
export class PblNgridColumnReorderPluginDirective extends PblNgridColumnDragContainerDirective {
    constructor() {
        super(...arguments);
        this._columnReorder = false;
        this._manualOverride = false;
    }
    get columnReorder() { return this._columnReorder; }
    ;
    set columnReorder(value) {
        this._columnReorder = coerceBooleanProperty(value);
        this.sortingDisabled = !this._columnReorder;
    }
    /**
     * When true, will not move the column on drop.
     * Instead you need to handle the dropped event.
     */
    get manualOverride() { return this._manualOverride; }
    ;
    set manualOverride(value) { this._manualOverride = coerceBooleanProperty(value); }
    canDrag(column) {
        return (this._columnReorder && column.reorder) || super.canDrag(column);
    }
    ngOnInit() {
        super.ngOnInit();
        this.dropped.subscribe(e => this._pblReset());
        this.pblDropListRef.beforeExit.subscribe(e => this._pblReset());
    }
    gridChanged() {
        super.gridChanged();
        this.dropped.subscribe((event) => {
            if (!this.manualOverride && this._columnReorder) {
                this.grid.columnApi.moveColumn(event.item.column, event.currentIndex);
            }
        });
    }
    _pblReset() {
        this.dragging.next(false);
        const siblings = this.getSortedItems().map(c => c._dragRef);
        siblings.forEach((sibling, index) => {
            for (const c of sibling.data.getCells()) {
                c.style.transform = ``;
            }
        });
    }
}
/** @nocollapse */ PblNgridColumnReorderPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnReorderPluginDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnReorderPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnReorderPluginDirective, selector: "pbl-ngrid[columnReorder]", inputs: { columnReorder: "columnReorder", manualOverride: "manualOverride" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnReorderPluginDirective },
    ], exportAs: ["pblNgridColumnReorder"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnReorderPluginDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[columnReorder]',
                    exportAs: 'pblNgridColumnReorder',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnReorderPluginDirective },
                    ],
                }]
        }], propDecorators: { columnReorder: [{
                type: Input
            }], manualOverride: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlb3JkZXItcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb2x1bW4vY29sdW1uLXJlb3JkZXItcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtDQUFrQztBQUNsQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQWdCLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBZSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUc5RSxPQUFPLEVBQUUsV0FBVyxFQUFjLE1BQU0sZUFBZSxDQUFDO0FBRXhELE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLHlCQUF5QixDQUFDOztBQVEvRSxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBb0IsZUFBZSxDQUFDO0FBZ0J2RSxNQUFNLE9BQU8sb0NBQThDLFNBQVEsb0NBQXVDO0lBZDFHOztRQTZCVSxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixvQkFBZSxHQUFHLEtBQUssQ0FBQztLQWtDakM7SUFoREMsSUFBYSxhQUFhLEtBQWMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUM7SUFDdEUsSUFBSSxhQUFhLENBQUMsS0FBYztRQUM5QixJQUFJLENBQUMsY0FBYyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFhLGNBQWMsS0FBYyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQUEsQ0FBQztJQUN4RSxJQUFJLGNBQWMsQ0FBQyxLQUFjLElBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFLM0YsT0FBTyxDQUFDLE1BQWM7UUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUssTUFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFFLENBQUM7SUFDcEUsQ0FBQztJQUVTLFdBQVc7UUFDbkIsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFFLENBQUMsS0FBMEIsRUFBRSxFQUFFO1lBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBRSxLQUFLLENBQUMsSUFBdUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzNHO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sU0FBUztRQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLE1BQU0sUUFBUSxHQUFpRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBUSxDQUFDO1FBQ2xILFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDbEMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUN2QyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDeEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O29KQTdDVSxvQ0FBb0M7d0lBQXBDLG9DQUFvQyxvVUFMcEM7UUFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtRQUMvQyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLG9DQUFvQyxFQUFFO0tBQzlFOzJGQUVVLG9DQUFvQztrQkFkaEQsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsMEJBQTBCO29CQUNwQyxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLGVBQWU7d0JBQ3hCLE1BQU0sRUFBRSxJQUFJO3dCQUNaLGdDQUFnQyxFQUFFLDJCQUEyQjt3QkFDN0QsaUNBQWlDLEVBQUUsNEJBQTRCO3FCQUNoRTtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7d0JBQy9DLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLHNDQUFzQyxFQUFFO3FCQUM5RTtpQkFDRjs4QkFHYyxhQUFhO3NCQUF6QixLQUFLO2dCQVVPLGNBQWM7c0JBQTFCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0c2xpbnQ6ZGlzYWJsZTpuby1vdXRwdXQtcmVuYW1lXG5pbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IERyYWdEcm9wLCBDZGtEcmFnRHJvcCwgQ0RLX0RST1BfTElTVCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyBQYmxDb2x1bW4sIENPTFVNTiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgUGJsRHJhZ0Ryb3AsIFBibERyYWdSZWYgfSBmcm9tICcuLi9jb3JlL2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uRHJhZ0RpcmVjdGl2ZSB9IGZyb20gJy4vY29sdW1uLWRyYWcnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyRGlyZWN0aXZlIH0gZnJvbSAnLi9jb2x1bW4tZHJhZy1jb250YWluZXInO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbiB7XG4gICAgY29sdW1uUmVvcmRlcj86IFBibE5ncmlkQ29sdW1uUmVvcmRlclBsdWdpbkRpcmVjdGl2ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ09MX1JFT1JERVJfUExVR0lOX0tFWTogJ2NvbHVtblJlb3JkZXInID0gJ2NvbHVtblJlb3JkZXInO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbY29sdW1uUmVvcmRlcl0nLCAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOiBkaXJlY3RpdmUtc2VsZWN0b3JcbiAgZXhwb3J0QXM6ICdwYmxOZ3JpZENvbHVtblJlb3JkZXInLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICAgICdjbGFzcyc6ICdjZGstZHJvcC1saXN0JyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1tjbGFzcy5jZGstZHJvcC1saXN0LWRyYWdnaW5nXSc6ICdfZHJvcExpc3RSZWYuaXNEcmFnZ2luZygpJyxcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtcmVjZWl2aW5nXSc6ICdfZHJvcExpc3RSZWYuaXNSZWNlaXZpbmcoKScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogRHJhZ0Ryb3AsIHVzZUV4aXN0aW5nOiBQYmxEcmFnRHJvcCB9LFxuICAgIHsgcHJvdmlkZTogQ0RLX0RST1BfTElTVCwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkQ29sdW1uUmVvcmRlclBsdWdpbkRpcmVjdGl2ZSB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENvbHVtblJlb3JkZXJQbHVnaW5EaXJlY3RpdmU8VCA9IGFueT4gZXh0ZW5kcyBQYmxOZ3JpZENvbHVtbkRyYWdDb250YWluZXJEaXJlY3RpdmU8VD4gaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIEBJbnB1dCgpIGdldCBjb2x1bW5SZW9yZGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY29sdW1uUmVvcmRlcjsgfTtcbiAgc2V0IGNvbHVtblJlb3JkZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9jb2x1bW5SZW9yZGVyID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLnNvcnRpbmdEaXNhYmxlZCA9ICF0aGlzLl9jb2x1bW5SZW9yZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdHJ1ZSwgd2lsbCBub3QgbW92ZSB0aGUgY29sdW1uIG9uIGRyb3AuXG4gICAqIEluc3RlYWQgeW91IG5lZWQgdG8gaGFuZGxlIHRoZSBkcm9wcGVkIGV2ZW50LlxuICAgKi9cbiAgQElucHV0KCkgZ2V0IG1hbnVhbE92ZXJyaWRlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fbWFudWFsT3ZlcnJpZGU7IH07XG4gIHNldCBtYW51YWxPdmVycmlkZSh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9tYW51YWxPdmVycmlkZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cblxuICBwcml2YXRlIF9jb2x1bW5SZW9yZGVyID0gZmFsc2U7XG4gIHByaXZhdGUgX21hbnVhbE92ZXJyaWRlID0gZmFsc2U7XG5cbiAgY2FuRHJhZyhjb2x1bW46IENPTFVNTik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy5fY29sdW1uUmVvcmRlciAmJiAoY29sdW1uIGFzIFBibENvbHVtbikucmVvcmRlcikgfHwgc3VwZXIuY2FuRHJhZyhjb2x1bW4pO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICB0aGlzLmRyb3BwZWQuc3Vic2NyaWJlKCBlID0+IHRoaXMuX3BibFJlc2V0KCkgKTtcbiAgICB0aGlzLnBibERyb3BMaXN0UmVmLmJlZm9yZUV4aXQuc3Vic2NyaWJlKCBlID0+IHRoaXMuX3BibFJlc2V0KCkgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBncmlkQ2hhbmdlZCgpIHtcbiAgICBzdXBlci5ncmlkQ2hhbmdlZCgpO1xuICAgIHRoaXMuZHJvcHBlZC5zdWJzY3JpYmUoIChldmVudDogQ2RrRHJhZ0Ryb3A8VCwgYW55PikgPT4ge1xuICAgICAgaWYgKCF0aGlzLm1hbnVhbE92ZXJyaWRlICYmIHRoaXMuX2NvbHVtblJlb3JkZXIpIHtcbiAgICAgICAgdGhpcy5ncmlkLmNvbHVtbkFwaS5tb3ZlQ29sdW1uKChldmVudC5pdGVtIGFzIFBibE5ncmlkQ29sdW1uRHJhZ0RpcmVjdGl2ZTxUPikuY29sdW1uLCBldmVudC5jdXJyZW50SW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGJsUmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnZ2luZy5uZXh0KGZhbHNlKTtcbiAgICBjb25zdCBzaWJsaW5nczogUGJsRHJhZ1JlZjxQYmxOZ3JpZENvbHVtbkRyYWdEaXJlY3RpdmU8VD4+W10gPSB0aGlzLmdldFNvcnRlZEl0ZW1zKCkubWFwKCBjID0+IGMuX2RyYWdSZWYpIGFzIGFueTtcbiAgICBzaWJsaW5ncy5mb3JFYWNoKChzaWJsaW5nLCBpbmRleCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBjIG9mIHNpYmxpbmcuZGF0YS5nZXRDZWxscygpKSB7XG4gICAgICAgIGMuc3R5bGUudHJhbnNmb3JtID0gYGA7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29sdW1uUmVvcmRlcjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFudWFsT3ZlcnJpZGU6IEJvb2xlYW5JbnB1dDtcblxufVxuIl19