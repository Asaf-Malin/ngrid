// tslint:disable:no-output-rename
import { BehaviorSubject, Subject } from 'rxjs';
import { Directive, Input, Output } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DragDrop, CDK_DROP_LIST } from '@angular/cdk/drag-drop';
import { CdkLazyDropList, PblDragDrop } from '../core/index';
import { patchDropListRef } from './column-drop-list-ref';
import * as i0 from "@angular/core";
export const COL_DRAG_CONTAINER_PLUGIN_KEY = 'columnDrag';
let _uniqueIdCounter = 0;
export class PblNgridColumnDragContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-drag-container-list-${_uniqueIdCounter++}`;
        this.orientation = 'horizontal';
        this._columnDrag = false;
        this.connections = new Set();
    }
    get columnDrag() { return this._columnDrag; }
    ;
    set columnDrag(value) {
        this._columnDrag = coerceBooleanProperty(value);
    }
    hasConnections() {
        return this.connections.size > 0;
    }
    canDrag(column) {
        return this.connections.size > 0;
    }
    connectTo(dropList) {
        if (!this.connections.has(dropList)) {
            this.connections.add(dropList);
            this.connectedTo = Array.from(this.connections);
            this.connectionsChanged.next();
        }
    }
    disconnectFrom(dropList) {
        if (this.connections.delete(dropList)) {
            this.connectedTo = Array.from(this.connections);
            this.connectionsChanged.next();
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.connectionsChanged.complete();
        this.dragging.complete();
        this._removePlugin(this.grid);
    }
    initDropListRef() {
        patchDropListRef(this.pblDropListRef);
    }
    beforeStarted() {
        super.beforeStarted();
        this.dragging.next(true);
    }
    gridChanged() {
        this.dragging = new BehaviorSubject(false);
        this.connectionsChanged = new Subject();
        this._removePlugin = this.gridApi.pluginCtrl.setPlugin(COL_DRAG_CONTAINER_PLUGIN_KEY, this);
        this.directContainerElement = '.pbl-ngrid-header-row-main';
        this.dragging.subscribe(isDragging => {
            const el = this.originalElement.nativeElement;
            if (isDragging) {
                el.classList.add('pbl-ngrid-column-list-dragging');
            }
            else {
                el.classList.remove('pbl-ngrid-column-list-dragging');
            }
        });
        this.sortingDisabled = true;
    }
}
/** @nocollapse */ PblNgridColumnDragContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDragContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDragContainerDirective, selector: "pbl-ngrid[columnDrag]:not([columnReorder])", inputs: { columnDrag: "columnDrag" }, outputs: { dragging: "cdkDropDragging", connectionsChanged: "cdkDropConnectionsChanged" }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDragContainerDirective },
    ], exportAs: ["pblNgridColumnDragContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDragContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[columnDrag]:not([columnReorder])',
                    exportAs: 'pblNgridColumnDragContainer',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridColumnDragContainerDirective },
                    ],
                }]
        }], propDecorators: { columnDrag: [{
                type: Input
            }], dragging: [{
                type: Output,
                args: ['cdkDropDragging']
            }], connectionsChanged: [{
                type: Output,
                args: ['cdkDropConnectionsChanged']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWRyYWctY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb2x1bW4vY29sdW1uLWRyYWctY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtDQUFrQztBQUNsQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNoRCxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFnQixxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzVFLE9BQU8sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFlLE1BQU0sd0JBQXdCLENBQUM7QUFHOUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7O0FBUTFELE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFpQixZQUFZLENBQUM7QUFFeEUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFnQnpCLE1BQU0sT0FBTyxvQ0FBOEMsU0FBUSxlQUEyRDtJQWQ5SDs7UUFlRSxPQUFFLEdBQUcsd0NBQXdDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztRQUNsRSxnQkFBVyxHQUE4QixZQUFZLENBQUM7UUFZOUMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFHcEIsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO0tBOEQ5QztJQTNFQyxJQUFhLFVBQVUsS0FBYyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQUEsQ0FBQztJQUNoRSxJQUFJLFVBQVUsQ0FBQyxLQUFjO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQXFC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QUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLGVBQWU7d0JBQ3hCLE1BQU0sRUFBRSxJQUFJO3dCQUNaLGdDQUFnQyxFQUFFLDJCQUEyQjt3QkFDN0QsaUNBQWlDLEVBQUUsNEJBQTRCO3FCQUNoRTtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7d0JBQy9DLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLHNDQUFzQyxFQUFFO3FCQUM5RTtpQkFDRjs4QkFLYyxVQUFVO3NCQUF0QixLQUFLO2dCQUtxQixRQUFRO3NCQUFsQyxNQUFNO3VCQUFDLGlCQUFpQjtnQkFFWSxrQkFBa0I7c0JBQXRELE1BQU07dUJBQUMsMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6bm8tb3V0cHV0LXJlbmFtZVxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IERyYWdEcm9wLCBDREtfRFJPUF9MSVNULCBDZGtEcm9wTGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyBDT0xVTU4sIFBibE5ncmlkQ29tcG9uZW50IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBDZGtMYXp5RHJvcExpc3QsIFBibERyYWdEcm9wIH0gZnJvbSAnLi4vY29yZS9pbmRleCc7XG5pbXBvcnQgeyBwYXRjaERyb3BMaXN0UmVmIH0gZnJvbSAnLi9jb2x1bW4tZHJvcC1saXN0LXJlZic7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBjb2x1bW5EcmFnPzogUGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyRGlyZWN0aXZlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDT0xfRFJBR19DT05UQUlORVJfUExVR0lOX0tFWTogJ2NvbHVtbkRyYWcnID0gJ2NvbHVtbkRyYWcnO1xuXG5sZXQgX3VuaXF1ZUlkQ291bnRlciA9IDA7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZFtjb2x1bW5EcmFnXTpub3QoW2NvbHVtblJlb3JkZXJdKScsXG4gIGV4cG9ydEFzOiAncGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyJyxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOnVzZS1ob3N0LXByb3BlcnR5LWRlY29yYXRvclxuICAgICdjbGFzcyc6ICdjZGstZHJvcC1saXN0JyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1tjbGFzcy5jZGstZHJvcC1saXN0LWRyYWdnaW5nXSc6ICdfZHJvcExpc3RSZWYuaXNEcmFnZ2luZygpJyxcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtcmVjZWl2aW5nXSc6ICdfZHJvcExpc3RSZWYuaXNSZWNlaXZpbmcoKScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogRHJhZ0Ryb3AsIHVzZUV4aXN0aW5nOiBQYmxEcmFnRHJvcCB9LFxuICAgIHsgcHJvdmlkZTogQ0RLX0RST1BfTElTVCwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkQ29sdW1uRHJhZ0NvbnRhaW5lckRpcmVjdGl2ZSB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENvbHVtbkRyYWdDb250YWluZXJEaXJlY3RpdmU8VCA9IGFueT4gZXh0ZW5kcyBDZGtMYXp5RHJvcExpc3Q8VCwgUGJsTmdyaWRDb2x1bW5EcmFnQ29udGFpbmVyRGlyZWN0aXZlPFQ+PiB7XG4gIGlkID0gYHBibC1uZ3JpZC1jb2x1bW4tZHJhZy1jb250YWluZXItbGlzdC0ke191bmlxdWVJZENvdW50ZXIrK31gO1xuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICdob3Jpem9udGFsJztcblxuICBASW5wdXQoKSBnZXQgY29sdW1uRHJhZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2NvbHVtbkRyYWc7IH07XG4gIHNldCBjb2x1bW5EcmFnKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fY29sdW1uRHJhZyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBAT3V0cHV0KCdjZGtEcm9wRHJhZ2dpbmcnKSBkcmFnZ2luZzogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuXG4gIEBPdXRwdXQoJ2Nka0Ryb3BDb25uZWN0aW9uc0NoYW5nZWQnKSBjb25uZWN0aW9uc0NoYW5nZWQ6IFN1YmplY3Q8dm9pZD47XG5cblxuICBwcml2YXRlIF9jb2x1bW5EcmFnID0gZmFsc2U7XG4gIHByaXZhdGUgX3JlbW92ZVBsdWdpbjogKHRhYmxlOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+KSA9PiB2b2lkO1xuXG4gIHByaXZhdGUgY29ubmVjdGlvbnMgPSBuZXcgU2V0PENka0Ryb3BMaXN0PigpO1xuXG4gIGhhc0Nvbm5lY3Rpb25zKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb25zLnNpemUgPiAwO1xuICB9XG5cbiAgY2FuRHJhZyhjb2x1bW46IENPTFVNTik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb25zLnNpemUgPiAwO1xuICB9XG5cbiAgY29ubmVjdFRvKGRyb3BMaXN0OiBDZGtEcm9wTGlzdCkge1xuICAgIGlmICghdGhpcy5jb25uZWN0aW9ucy5oYXMoZHJvcExpc3QpKSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb25zLmFkZChkcm9wTGlzdCk7XG4gICAgICB0aGlzLmNvbm5lY3RlZFRvID0gQXJyYXkuZnJvbSh0aGlzLmNvbm5lY3Rpb25zKTtcbiAgICAgIHRoaXMuY29ubmVjdGlvbnNDaGFuZ2VkLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0RnJvbShkcm9wTGlzdDogQ2RrRHJvcExpc3QpIHtcbiAgICBpZiAodGhpcy5jb25uZWN0aW9ucy5kZWxldGUoZHJvcExpc3QpKSB7XG4gICAgICB0aGlzLmNvbm5lY3RlZFRvID0gQXJyYXkuZnJvbSh0aGlzLmNvbm5lY3Rpb25zKTtcbiAgICAgIHRoaXMuY29ubmVjdGlvbnNDaGFuZ2VkLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuY29ubmVjdGlvbnNDaGFuZ2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5kcmFnZ2luZy5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3JlbW92ZVBsdWdpbih0aGlzLmdyaWQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXREcm9wTGlzdFJlZigpOiB2b2lkIHtcbiAgICBwYXRjaERyb3BMaXN0UmVmKHRoaXMucGJsRHJvcExpc3RSZWYgYXMgYW55KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBiZWZvcmVTdGFydGVkKCk6IHZvaWQge1xuICAgIHN1cGVyLmJlZm9yZVN0YXJ0ZWQoKTtcbiAgICB0aGlzLmRyYWdnaW5nLm5leHQodHJ1ZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ3JpZENoYW5nZWQoKSB7XG4gICAgdGhpcy5kcmFnZ2luZyA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgIHRoaXMuY29ubmVjdGlvbnNDaGFuZ2VkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAgIHRoaXMuX3JlbW92ZVBsdWdpbiA9IHRoaXMuZ3JpZEFwaS5wbHVnaW5DdHJsLnNldFBsdWdpbihDT0xfRFJBR19DT05UQUlORVJfUExVR0lOX0tFWSwgdGhpcyk7XG5cbiAgICB0aGlzLmRpcmVjdENvbnRhaW5lckVsZW1lbnQgPSAnLnBibC1uZ3JpZC1oZWFkZXItcm93LW1haW4nO1xuXG4gICAgdGhpcy5kcmFnZ2luZy5zdWJzY3JpYmUoIGlzRHJhZ2dpbmcgPT4ge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLm9yaWdpbmFsRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgICAgaWYgKGlzRHJhZ2dpbmcpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgncGJsLW5ncmlkLWNvbHVtbi1saXN0LWRyYWdnaW5nJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdwYmwtbmdyaWQtY29sdW1uLWxpc3QtZHJhZ2dpbmcnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ydGluZ0Rpc2FibGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5EcmFnOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=