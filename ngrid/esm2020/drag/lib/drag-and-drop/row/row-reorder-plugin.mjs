import { Directive, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DragDrop, CdkDropListGroup, CDK_DROP_LIST, } from '@angular/cdk/drag-drop';
import { PblDragDrop, CdkLazyDropList } from '../core/index';
import { patchDropListRef } from './row-drop-list-ref';
import * as i0 from "@angular/core";
export const ROW_REORDER_PLUGIN_KEY = 'rowReorder';
let _uniqueIdCounter = 0;
export class PblNgridRowReorderPluginDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-row-reorder-list-${_uniqueIdCounter++}`;
        this._rowReorder = false;
    }
    get rowReorder() { return this._rowReorder; }
    ;
    set rowReorder(value) {
        value = coerceBooleanProperty(value);
        this._rowReorder = value;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removePlugin(this.grid);
    }
    getSortedItems() {
        const { rowsApi } = this.gridApi;
        // The CdkTable has a view repeater that cache view's for performance (only when virtual scroll enabled)
        // A cached view is not showing but still "living" so it's CdkDrag element is still up in the air
        // We need to filter them out
        // An alternative will be to catch the events of the rows attached/detached and add/remove them from the drop list.
        return super.getSortedItems().filter(item => {
            return rowsApi.findRowByElement(item.getRootElement())?.attached;
        });
    }
    initDropListRef() {
        patchDropListRef(this.pblDropListRef, this.gridApi);
    }
    gridChanged() {
        this._removePlugin = this.gridApi.pluginCtrl.setPlugin(ROW_REORDER_PLUGIN_KEY, this);
        this.directContainerElement = '.pbl-ngrid-scroll-container';
        this.dropped.subscribe((event) => {
            const item = event.item;
            const previousIndex = this.grid.ds.source.indexOf(item.draggedContext.row);
            const currentIndex = event.currentIndex + this.grid.ds.renderStart;
            this.grid.ds.moveItem(previousIndex, currentIndex, true);
            this.grid.rowsApi.syncRows('data');
        });
    }
}
/** @nocollapse */ PblNgridRowReorderPluginDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowReorderPluginDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowReorderPluginDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowReorderPluginDirective, selector: "pbl-ngrid[rowReorder]", inputs: { rowReorder: "rowReorder" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()", "class.pbl-row-reorder": "rowReorder && !this.grid.ds?.sort.sort?.order && !this.grid.ds?.filter?.filter" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CdkDropListGroup, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridRowReorderPluginDirective },
    ], exportAs: ["pblNgridRowReorder"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowReorderPluginDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[rowReorder]',
                    exportAs: 'pblNgridRowReorder',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                        '[class.pbl-row-reorder]': 'rowReorder && !this.grid.ds?.sort.sort?.order && !this.grid.ds?.filter?.filter',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CdkDropListGroup, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridRowReorderPluginDirective },
                    ],
                }]
        }], propDecorators: { rowReorder: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LXJlb3JkZXItcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9yb3cvcm93LXJlb3JkZXItcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQ0wsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixhQUFhLEdBRWQsTUFBTSx3QkFBd0IsQ0FBQztBQUdoQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7QUFRdkQsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQWlCLFlBQVksQ0FBQztBQUVqRSxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQWtCekIsTUFBTSxPQUFPLGlDQUEyQyxTQUFRLGVBQXdEO0lBaEJ4SDs7UUFrQkUsT0FBRSxHQUFHLDhCQUE4QixnQkFBZ0IsRUFBRSxFQUFFLENBQUM7UUFRaEQsZ0JBQVcsR0FBRyxLQUFLLENBQUM7S0FzQzdCO0lBNUNDLElBQWEsVUFBVSxLQUFjLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQ2hFLElBQUksVUFBVSxDQUFDLEtBQWM7UUFDM0IsS0FBSyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFLRCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxjQUFjO1FBQ1osTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakMsd0dBQXdHO1FBQ3hHLGlHQUFpRztRQUNqRyw2QkFBNkI7UUFDN0IsbUhBQW1IO1FBQ25ILE9BQVEsS0FBSyxDQUFDLGNBQWMsRUFBaUMsQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFDLEVBQUU7WUFDM0UsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVTLGVBQWU7UUFDdkIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGNBQXFCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFUyxXQUFXO1FBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxzQkFBc0IsR0FBRyw2QkFBNkIsQ0FBQztRQUU1RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBRSxDQUFDLEtBQXFCLEVBQUUsRUFBRTtZQUNoRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBbUMsQ0FBQztZQUV2RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0UsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7aUpBN0NVLGlDQUFpQztxSUFBakMsaUNBQWlDLG9ZQU5qQztRQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO1FBQy9DLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7UUFDbEQsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxpQ0FBaUMsRUFBRTtLQUMzRTsyRkFFVSxpQ0FBaUM7a0JBaEI3QyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx1QkFBdUI7b0JBQ2pDLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsZUFBZTt3QkFDeEIsTUFBTSxFQUFFLElBQUk7d0JBQ1osZ0NBQWdDLEVBQUUsMkJBQTJCO3dCQUM3RCxpQ0FBaUMsRUFBRSw0QkFBNEI7d0JBQy9ELHlCQUF5QixFQUFFLGdGQUFnRjtxQkFDNUc7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO3dCQUMvQyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO3dCQUNsRCxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxtQ0FBbUMsRUFBRTtxQkFDM0U7aUJBQ0Y7OEJBS2MsVUFBVTtzQkFBdEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5wdXQsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHkgfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgRHJhZ0Ryb3AsXG4gIENka0Ryb3BMaXN0R3JvdXAsXG4gIENES19EUk9QX0xJU1QsXG4gIENka0RyYWdEcm9wLFxufSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibERyYWdEcm9wLCBDZGtMYXp5RHJvcExpc3QgfSBmcm9tICcuLi9jb3JlL2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkUm93RHJhZ0RpcmVjdGl2ZSB9IGZyb20gJy4vcm93LWRyYWcnO1xuaW1wb3J0IHsgcGF0Y2hEcm9wTGlzdFJlZiB9IGZyb20gJy4vcm93LWRyb3AtbGlzdC1yZWYnO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbiB7XG4gICAgcm93UmVvcmRlcj86IFBibE5ncmlkUm93UmVvcmRlclBsdWdpbkRpcmVjdGl2ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUk9XX1JFT1JERVJfUExVR0lOX0tFWTogJ3Jvd1Jlb3JkZXInID0gJ3Jvd1Jlb3JkZXInO1xuXG5sZXQgX3VuaXF1ZUlkQ291bnRlciA9IDA7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZFtyb3dSZW9yZGVyXScsIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IGRpcmVjdGl2ZS1zZWxlY3RvclxuICBleHBvcnRBczogJ3BibE5ncmlkUm93UmVvcmRlcicsXG4gIGhvc3Q6IHsgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1ob3N0LW1ldGFkYXRhLXByb3BlcnR5XG4gICAgJ2NsYXNzJzogJ2Nkay1kcm9wLWxpc3QnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtZHJhZ2dpbmddJzogJ19kcm9wTGlzdFJlZi5pc0RyYWdnaW5nKCknLFxuICAgICdbY2xhc3MuY2RrLWRyb3AtbGlzdC1yZWNlaXZpbmddJzogJ19kcm9wTGlzdFJlZi5pc1JlY2VpdmluZygpJyxcbiAgICAnW2NsYXNzLnBibC1yb3ctcmVvcmRlcl0nOiAncm93UmVvcmRlciAmJiAhdGhpcy5ncmlkLmRzPy5zb3J0LnNvcnQ/Lm9yZGVyICYmICF0aGlzLmdyaWQuZHM/LmZpbHRlcj8uZmlsdGVyJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgeyBwcm92aWRlOiBEcmFnRHJvcCwgdXNlRXhpc3Rpbmc6IFBibERyYWdEcm9wIH0sXG4gICAgeyBwcm92aWRlOiBDZGtEcm9wTGlzdEdyb3VwLCB1c2VWYWx1ZTogdW5kZWZpbmVkIH0sXG4gICAgeyBwcm92aWRlOiBDREtfRFJPUF9MSVNULCB1c2VFeGlzdGluZzogUGJsTmdyaWRSb3dSZW9yZGVyUGx1Z2luRGlyZWN0aXZlIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkUm93UmVvcmRlclBsdWdpbkRpcmVjdGl2ZTxUID0gYW55PiBleHRlbmRzIENka0xhenlEcm9wTGlzdDxULCBQYmxOZ3JpZFJvd1Jlb3JkZXJQbHVnaW5EaXJlY3RpdmU8VD4+IGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICBpZCA9IGBwYmwtbmdyaWQtcm93LXJlb3JkZXItbGlzdC0ke191bmlxdWVJZENvdW50ZXIrK31gO1xuXG4gIEBJbnB1dCgpIGdldCByb3dSZW9yZGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcm93UmVvcmRlcjsgfTtcbiAgc2V0IHJvd1Jlb3JkZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB2YWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgdGhpcy5fcm93UmVvcmRlciA9IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm93UmVvcmRlciA9IGZhbHNlO1xuICBwcml2YXRlIF9yZW1vdmVQbHVnaW46IChncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+KSA9PiB2b2lkO1xuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luKHRoaXMuZ3JpZCk7XG4gIH1cblxuICBnZXRTb3J0ZWRJdGVtcygpIHtcbiAgICBjb25zdCB7IHJvd3NBcGkgfSA9IHRoaXMuZ3JpZEFwaTtcbiAgICAvLyBUaGUgQ2RrVGFibGUgaGFzIGEgdmlldyByZXBlYXRlciB0aGF0IGNhY2hlIHZpZXcncyBmb3IgcGVyZm9ybWFuY2UgKG9ubHkgd2hlbiB2aXJ0dWFsIHNjcm9sbCBlbmFibGVkKVxuICAgIC8vIEEgY2FjaGVkIHZpZXcgaXMgbm90IHNob3dpbmcgYnV0IHN0aWxsIFwibGl2aW5nXCIgc28gaXQncyBDZGtEcmFnIGVsZW1lbnQgaXMgc3RpbGwgdXAgaW4gdGhlIGFpclxuICAgIC8vIFdlIG5lZWQgdG8gZmlsdGVyIHRoZW0gb3V0XG4gICAgLy8gQW4gYWx0ZXJuYXRpdmUgd2lsbCBiZSB0byBjYXRjaCB0aGUgZXZlbnRzIG9mIHRoZSByb3dzIGF0dGFjaGVkL2RldGFjaGVkIGFuZCBhZGQvcmVtb3ZlIHRoZW0gZnJvbSB0aGUgZHJvcCBsaXN0LlxuICAgIHJldHVybiAoc3VwZXIuZ2V0U29ydGVkSXRlbXMoKSBhcyBQYmxOZ3JpZFJvd0RyYWdEaXJlY3RpdmVbXSkuZmlsdGVyKCBpdGVtID0+IHtcbiAgICAgIHJldHVybiByb3dzQXBpLmZpbmRSb3dCeUVsZW1lbnQoaXRlbS5nZXRSb290RWxlbWVudCgpKT8uYXR0YWNoZWQ7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdERyb3BMaXN0UmVmKCk6IHZvaWQge1xuICAgIHBhdGNoRHJvcExpc3RSZWYodGhpcy5wYmxEcm9wTGlzdFJlZiBhcyBhbnksIHRoaXMuZ3JpZEFwaSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ3JpZENoYW5nZWQoKSB7XG4gICAgdGhpcy5fcmVtb3ZlUGx1Z2luID0gdGhpcy5ncmlkQXBpLnBsdWdpbkN0cmwuc2V0UGx1Z2luKFJPV19SRU9SREVSX1BMVUdJTl9LRVksIHRoaXMpO1xuICAgIHRoaXMuZGlyZWN0Q29udGFpbmVyRWxlbWVudCA9ICcucGJsLW5ncmlkLXNjcm9sbC1jb250YWluZXInO1xuXG4gICAgdGhpcy5kcm9wcGVkLnN1YnNjcmliZSggKGV2ZW50OiBDZGtEcmFnRHJvcDxUPikgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IGV2ZW50Lml0ZW0gYXMgUGJsTmdyaWRSb3dEcmFnRGlyZWN0aXZlPFQ+O1xuXG4gICAgICBjb25zdCBwcmV2aW91c0luZGV4ID0gdGhpcy5ncmlkLmRzLnNvdXJjZS5pbmRleE9mKGl0ZW0uZHJhZ2dlZENvbnRleHQucm93KTtcbiAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGV2ZW50LmN1cnJlbnRJbmRleCArIHRoaXMuZ3JpZC5kcy5yZW5kZXJTdGFydDtcbiAgICAgIHRoaXMuZ3JpZC5kcy5tb3ZlSXRlbShwcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgsIHRydWUpO1xuICAgICAgdGhpcy5ncmlkLnJvd3NBcGkuc3luY1Jvd3MoJ2RhdGEnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dSZW9yZGVyOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=