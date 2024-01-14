// tslint:disable:no-output-rename
import { Directive, EventEmitter, Output } from '@angular/core';
import { DragDrop, CDK_DROP_LIST, CDK_DROP_LIST_GROUP } from '@angular/cdk/drag-drop';
import { CdkLazyDropList, PblDragDrop } from '../core/index';
import { COL_DRAG_CONTAINER_PLUGIN_KEY } from './column-drag-container';
import * as i0 from "@angular/core";
let _uniqueIdCounter = 0;
export class PblNgridColumnDropContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-drop-container-${_uniqueIdCounter++}`;
        this.orientation = 'horizontal';
        this.columnEntered = this.entered;
        this.columnExited = this.exited;
        this.columnDropped = this.dropped;
    }
    get columnContainer() { return this._columnContainer; }
    canDrag(column) {
        return true;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._columnContainer) {
            this._columnContainer.disconnectFrom(this);
        }
    }
    gridChanged() {
        const columnContainer = this.gridApi?.pluginCtrl.getPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY);
        if (columnContainer !== this._columnContainer) {
            if (this._columnContainer) {
                this._columnContainer.disconnectFrom(this);
            }
            this._columnContainer = columnContainer;
            if (columnContainer) {
                columnContainer.connectTo(this);
            }
        }
    }
}
/** @nocollapse */ PblNgridColumnDropContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDropContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDropContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDropContainerDirective, selector: "[pblColumnDropContainer]", inputs: { grid: ["pblColumnDropContainer", "grid"] }, outputs: { columnEntered: "columnEntered", columnExited: "columnExited", columnDropped: "columnDropped" }, host: { properties: { "id": "id" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDropContainerDirective },
    ], exportAs: ["pblColumnDropContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDropContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblColumnDropContainer]',
                    exportAs: 'pblColumnDropContainer',
                    inputs: ['grid: pblColumnDropContainer'],
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDropContainerDirective },
                    ],
                }]
        }], propDecorators: { columnEntered: [{
                type: Output
            }], columnExited: [{
                type: Output
            }], columnDropped: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWRyb3AtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb2x1bW4vY29sdW1uLWRyb3AtY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtDQUFrQztBQUNsQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDaEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUV0RixPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUUsNkJBQTZCLEVBQXdDLE1BQU0seUJBQXlCLENBQUM7O0FBRzlHLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBZ0J6QixNQUFNLE9BQU8sb0NBQThDLFNBQVEsZUFBa0I7SUFkckY7O1FBZUUsT0FBRSxHQUFHLG1DQUFtQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7UUFDN0QsZ0JBQVcsR0FBOEIsWUFBWSxDQUFDO1FBRTVDLGtCQUFhLEdBQXFELElBQUksQ0FBQyxPQUFjLENBQUM7UUFDdEYsaUJBQVksR0FBb0QsSUFBSSxDQUFDLE1BQWEsQ0FBQztRQUNuRixrQkFBYSxHQUFvRCxJQUFJLENBQUMsT0FBYyxDQUFDO0tBNkJoRztJQTNCQyxJQUFJLGVBQWUsS0FBMkMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0lBRzdGLE9BQU8sQ0FBQyxNQUFjO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QztJQUNILENBQUM7SUFFUyxXQUFXO1FBQ25CLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO1FBQ3pGLElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUM3QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QztZQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7WUFDeEMsSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakM7U0FDRjtJQUNILENBQUM7O29KQWpDVSxvQ0FBb0M7d0lBQXBDLG9DQUFvQywyUkFOcEM7UUFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtRQUMvQyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO1FBQ3JELEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsb0NBQW9DLEVBQUU7S0FDOUU7MkZBRVUsb0NBQW9DO2tCQWRoRCxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSwwQkFBMEI7b0JBQ3BDLFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLE1BQU0sRUFBRSxDQUFDLDhCQUE4QixDQUFDO29CQUN4QyxJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLGVBQWU7d0JBQ3hCLE1BQU0sRUFBRSxJQUFJO3FCQUNiO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTt3QkFDL0MsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTt3QkFDckQsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsc0NBQXNDLEVBQUU7cUJBQzlFO2lCQUNGOzhCQUtXLGFBQWE7c0JBQXRCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxhQUFhO3NCQUF0QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6bm8tb3V0cHV0LXJlbmFtZVxuaW1wb3J0IHsgRGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRHJhZ0Ryb3AsIENES19EUk9QX0xJU1QsIENES19EUk9QX0xJU1RfR1JPVVAgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcbmltcG9ydCB7IENPTFVNTiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgQ2RrTGF6eURyb3BMaXN0LCBQYmxEcmFnRHJvcCB9IGZyb20gJy4uL2NvcmUvaW5kZXgnO1xuaW1wb3J0IHsgQ09MX0RSQUdfQ09OVEFJTkVSX1BMVUdJTl9LRVksIFBibE5ncmlkQ29sdW1uRHJhZ0NvbnRhaW5lckRpcmVjdGl2ZSB9IGZyb20gJy4vY29sdW1uLWRyYWctY29udGFpbmVyJztcbmltcG9ydCB7IFBibENvbHVtbkRyYWdEcm9wQ29udGFpbmVyRHJvcCwgUGJsQ29sdW1uRHJhZ0Ryb3BDb250YWluZXJFbnRlciwgUGJsQ29sdW1uRHJhZ0Ryb3BDb250YWluZXJFeGl0IH0gZnJvbSAnLi9jb2x1bW4tZHJvcC1jb250YWluZXIuZXZlbnRzJztcblxubGV0IF91bmlxdWVJZENvdW50ZXIgPSAwO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGJsQ29sdW1uRHJvcENvbnRhaW5lcl0nLFxuICBleHBvcnRBczogJ3BibENvbHVtbkRyb3BDb250YWluZXInLFxuICBpbnB1dHM6IFsnZ3JpZDogcGJsQ29sdW1uRHJvcENvbnRhaW5lciddLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6dXNlLWhvc3QtcHJvcGVydHktZGVjb3JhdG9yXG4gICAgJ2NsYXNzJzogJ2Nkay1kcm9wLWxpc3QnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgeyBwcm92aWRlOiBEcmFnRHJvcCwgdXNlRXhpc3Rpbmc6IFBibERyYWdEcm9wIH0sXG4gICAgeyBwcm92aWRlOiBDREtfRFJPUF9MSVNUX0dST1VQLCB1c2VWYWx1ZTogdW5kZWZpbmVkIH0sXG4gICAgeyBwcm92aWRlOiBDREtfRFJPUF9MSVNULCB1c2VFeGlzdGluZzogUGJsTmdyaWRDb2x1bW5Ecm9wQ29udGFpbmVyRGlyZWN0aXZlIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ29sdW1uRHJvcENvbnRhaW5lckRpcmVjdGl2ZTxUID0gYW55PiBleHRlbmRzIENka0xhenlEcm9wTGlzdDxUPiB7XG4gIGlkID0gYHBibC1uZ3JpZC1jb2x1bW4tZHJvcC1jb250YWluZXItJHtfdW5pcXVlSWRDb3VudGVyKyt9YDtcbiAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAnaG9yaXpvbnRhbCc7XG5cbiAgQE91dHB1dCgpIGNvbHVtbkVudGVyZWQ6IEV2ZW50RW1pdHRlcjxQYmxDb2x1bW5EcmFnRHJvcENvbnRhaW5lckVudGVyPFQ+PiA9IHRoaXMuZW50ZXJlZCBhcyBhbnk7XG4gIEBPdXRwdXQoKSBjb2x1bW5FeGl0ZWQ6IEV2ZW50RW1pdHRlcjxQYmxDb2x1bW5EcmFnRHJvcENvbnRhaW5lckV4aXQ8VD4+ID0gdGhpcy5leGl0ZWQgYXMgYW55O1xuICBAT3V0cHV0KCkgY29sdW1uRHJvcHBlZDogRXZlbnRFbWl0dGVyPFBibENvbHVtbkRyYWdEcm9wQ29udGFpbmVyRHJvcDxUPj4gPSB0aGlzLmRyb3BwZWQgYXMgYW55O1xuXG4gIGdldCBjb2x1bW5Db250YWluZXIoKTogUGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyRGlyZWN0aXZlIHsgcmV0dXJuIHRoaXMuX2NvbHVtbkNvbnRhaW5lcjsgfVxuICBwcml2YXRlIF9jb2x1bW5Db250YWluZXI6IFBibE5ncmlkQ29sdW1uRHJhZ0NvbnRhaW5lckRpcmVjdGl2ZTtcblxuICBjYW5EcmFnKGNvbHVtbjogQ09MVU1OKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIGlmICh0aGlzLl9jb2x1bW5Db250YWluZXIpIHtcbiAgICAgIHRoaXMuX2NvbHVtbkNvbnRhaW5lci5kaXNjb25uZWN0RnJvbSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ3JpZENoYW5nZWQoKSB7XG4gICAgY29uc3QgY29sdW1uQ29udGFpbmVyID0gdGhpcy5ncmlkQXBpPy5wbHVnaW5DdHJsLmdldFBsdWdpbihDT0xfRFJBR19DT05UQUlORVJfUExVR0lOX0tFWSlcbiAgICBpZiAoY29sdW1uQ29udGFpbmVyICE9PSB0aGlzLl9jb2x1bW5Db250YWluZXIpIHtcbiAgICAgIGlmICh0aGlzLl9jb2x1bW5Db250YWluZXIpIHtcbiAgICAgICAgdGhpcy5fY29sdW1uQ29udGFpbmVyLmRpc2Nvbm5lY3RGcm9tKHRoaXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29sdW1uQ29udGFpbmVyID0gY29sdW1uQ29udGFpbmVyO1xuICAgICAgaWYgKGNvbHVtbkNvbnRhaW5lcikge1xuICAgICAgICBjb2x1bW5Db250YWluZXIuY29ubmVjdFRvKHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=