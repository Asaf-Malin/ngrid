import { Input, Directive, ElementRef, Optional, Inject, SkipSelf, ChangeDetectorRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DragDrop, CdkDropListGroup, CdkDropList, CDK_DROP_LIST, CDK_DROP_LIST_GROUP, CDK_DRAG_CONFIG, } from '@angular/cdk/drag-drop';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import { PblDropListRef } from './drop-list-ref';
import { PblDragDrop } from './drag-drop';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
import * as i2 from "@angular/cdk/drag-drop";
import * as i3 from "@angular/cdk/scrolling";
import * as i4 from "@angular/cdk/bidi";
export class CdkLazyDropList extends CdkDropList {
    constructor(grid, element, dragDrop, changeDetectorRef, _scrollDispatcher, dir, group, config) {
        super(element, dragDrop, changeDetectorRef, _scrollDispatcher, dir, group, config);
        if (!(this.pblDropListRef instanceof PblDropListRef)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid `DropListRef` injection, the ref is not an instance of PblDropListRef');
            }
            return;
        }
        // This is a workaround for https://github.com/angular/material2/pull/14153
        // Working around the missing capability for selecting a container element that is not the drop container host.
        this.originalElement = element;
        if (grid) {
            this.updateGrid(grid);
        }
        this.initDropListRef();
    }
    get pblDropListRef() { return this._dropListRef; }
    get grid() { return this._gridApi?.grid; }
    set grid(value) { this.updateGrid(value); }
    get dir() { return this._gridApi?.getDirection(); }
    get gridApi() { return this._gridApi; }
    ngOnInit() {
        this._dropListRef.beforeStarted.subscribe(() => this.beforeStarted());
    }
    addDrag(drag) {
        this.addItem(drag);
    }
    removeDrag(drag) {
        this.removeItem(drag);
    }
    /**
     * A chance for inheriting implementations to change/modify the drop list ref instance
     *
     * We can't do this via a DragDrop service replacement as we might have multiple drop-lists on the same
     * element which mean they must share the same DragDrop factory...
     */
    initDropListRef() { }
    beforeStarted() {
        if (this.directContainerElement) {
            const element = this.originalElement.nativeElement.querySelector(this.directContainerElement);
            this.element = new ElementRef(element);
        }
        else {
            this.element = this.originalElement;
        }
        this.pblDropListRef.withElement(this.element);
        if (this.dir) {
            this.pblDropListRef.withDirection(this.dir);
        }
    }
    gridChanged(prev) { }
    updateGrid(grid) {
        if (grid !== this.grid) {
            const prev = this._gridApi;
            this._gridApi = grid ? PblNgridPluginController.find(grid).extApi : undefined;
            this.gridChanged(prev);
        }
    }
}
/** @nocollapse */ CdkLazyDropList.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDropList, deps: [{ token: i1.PblNgridComponent, optional: true }, { token: i0.ElementRef }, { token: i2.DragDrop }, { token: i0.ChangeDetectorRef }, { token: i3.ScrollDispatcher }, { token: i4.Directionality, optional: true }, { token: CDK_DROP_LIST_GROUP, optional: true, skipSelf: true }, { token: CDK_DRAG_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ CdkLazyDropList.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: CdkLazyDropList, selector: "[cdkLazyDropList]", inputs: { directContainerElement: ["cdkDropListDirectContainerElement", "directContainerElement"] }, host: { properties: { "id": "id", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST, useClass: CdkLazyDropList },
    ], exportAs: ["cdkLazyDropList"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDropList, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkLazyDropList]',
                    exportAs: 'cdkLazyDropList',
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST, useClass: CdkLazyDropList },
                    ],
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    }
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.DragDrop }, { type: i0.ChangeDetectorRef }, { type: i3.ScrollDispatcher }, { type: i4.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.CdkDropListGroup, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DROP_LIST_GROUP]
                }, {
                    type: SkipSelf
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }]; }, propDecorators: { directContainerElement: [{
                type: Input,
                args: ['cdkDropListDirectContainerElement']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcC1saXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb3JlL2Ryb3AtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUVSLE1BQU0sRUFDTixRQUFRLEVBQ1IsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQ0wsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixXQUFXLEVBRVgsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixlQUFlLEdBRWhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFFLGlCQUFpQixFQUF3Qix3QkFBd0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7Ozs7O0FBZ0IxQyxNQUFNLE9BQU8sZUFBcUMsU0FBUSxXQUFjO0lBc0J0RSxZQUF3QixJQUEwQixFQUN0QyxPQUFnQyxFQUNoQyxRQUFrQixFQUNsQixpQkFBb0MsRUFDcEMsaUJBQW9DLEVBQ3hCLEdBQW9CLEVBQ3FCLEtBQXFDLEVBQ3JELE1BQXVCO1FBQ3RFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFbkYsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsWUFBWSxjQUFjLENBQUMsRUFBRTtZQUNwRCxJ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LFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IsU0FBUyxFQUFFO3dCQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO3dCQUMvQyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxpQkFBaUIsRUFBRTtxQkFDdEQ7b0JBQ0QsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxlQUFlO3dCQUN4QixNQUFNLEVBQUUsSUFBSTt3QkFDWixnQ0FBZ0MsRUFBRSwyQkFBMkI7d0JBQzdELGlDQUFpQyxFQUFFLDRCQUE0QjtxQkFDaEU7aUJBQ0Y7OzBCQXVCYyxRQUFROzswQkFLUixRQUFROzswQkFDUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQUcsUUFBUTs7MEJBQ2pELFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsZUFBZTs0Q0FiSCxzQkFBc0I7c0JBQWpFLEtBQUs7dUJBQUMsbUNBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSW5wdXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgT3B0aW9uYWwsXG4gIE9uSW5pdCxcbiAgSW5qZWN0LFxuICBTa2lwU2VsZixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHsgU2Nyb2xsRGlzcGF0Y2hlciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtcbiAgRHJhZ0Ryb3AsXG4gIENka0Ryb3BMaXN0R3JvdXAsXG4gIENka0Ryb3BMaXN0LFxuICBDZGtEcmFnLFxuICBDREtfRFJPUF9MSVNULFxuICBDREtfRFJPUF9MSVNUX0dST1VQLFxuICBDREtfRFJBR19DT05GSUcsXG4gIERyYWdEcm9wQ29uZmlnLFxufSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcbmltcG9ydCB7IFBibE5ncmlkQ29tcG9uZW50LCBQYmxOZ3JpZEV4dGVuc2lvbkFwaSwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmltcG9ydCB7IFBibERyb3BMaXN0UmVmIH0gZnJvbSAnLi9kcm9wLWxpc3QtcmVmJztcbmltcG9ydCB7IFBibERyYWdEcm9wIH0gZnJvbSAnLi9kcmFnLWRyb3AnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTGF6eURyb3BMaXN0XScsIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IGRpcmVjdGl2ZS1zZWxlY3RvclxuICBleHBvcnRBczogJ2Nka0xhenlEcm9wTGlzdCcsXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogRHJhZ0Ryb3AsIHVzZUV4aXN0aW5nOiBQYmxEcmFnRHJvcCB9LFxuICAgIHsgcHJvdmlkZTogQ0RLX0RST1BfTElTVCwgdXNlQ2xhc3M6IENka0xhenlEcm9wTGlzdCB9LFxuICBdLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICAgICdjbGFzcyc6ICdjZGstZHJvcC1saXN0JyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1tjbGFzcy5jZGstZHJvcC1saXN0LWRyYWdnaW5nXSc6ICdfZHJvcExpc3RSZWYuaXNEcmFnZ2luZygpJyxcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtcmVjZWl2aW5nXSc6ICdfZHJvcExpc3RSZWYuaXNSZWNlaXZpbmcoKScsXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGF6eURyb3BMaXN0PFQgPSBhbnksIERSZWYgPSBhbnk+IGV4dGVuZHMgQ2RrRHJvcExpc3Q8VD4gaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIGdldCBwYmxEcm9wTGlzdFJlZigpOiBQYmxEcm9wTGlzdFJlZjxEUmVmPiB7IHJldHVybiB0aGlzLl9kcm9wTGlzdFJlZiBhcyBhbnk7IH1cblxuICBnZXQgZ3JpZCgpOiBQYmxOZ3JpZENvbXBvbmVudDxUPiB7IHJldHVybiB0aGlzLl9ncmlkQXBpPy5ncmlkOyB9XG4gIHNldCBncmlkKHZhbHVlOiBQYmxOZ3JpZENvbXBvbmVudDxUPikgeyB0aGlzLnVwZGF0ZUdyaWQodmFsdWUpOyB9XG5cbiAgZ2V0IGRpcigpOiBEaXJlY3Rpb24gfCBudWxsIHsgcmV0dXJuIHRoaXMuX2dyaWRBcGk/LmdldERpcmVjdGlvbigpOyB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdG9yIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGRldGVybWluZSB0aGUgZGlyZWN0IGNvbnRhaW5lciBlbGVtZW50LCBzdGFydGluZyBmcm9tXG4gICAqIHRoZSBgY2RrRHJvcExpc3RgIGVsZW1lbnQgYW5kIGdvaW5nIGRvd24gdGhlIERPTS4gUGFzc2luZyBhbiBhbHRlcm5hdGUgZGlyZWN0IGNvbnRhaW5lciBlbGVtZW50XG4gICAqIGlzIHVzZWZ1bCB3aGVuIHRoZSBgY2RrRHJvcExpc3RgIGlzIG5vdCB0aGUgZGlyZWN0IHBhcmVudCAoaS5lLiBhbmNlc3RvciBidXQgbm90IGZhdGhlcilcbiAgICogb2YgdGhlIGRyYWdnYWJsZSBlbGVtZW50cy5cbiAgICovXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1pbnB1dC1yZW5hbWVcbiAgQElucHV0KCdjZGtEcm9wTGlzdERpcmVjdENvbnRhaW5lckVsZW1lbnQnKSBkaXJlY3RDb250YWluZXJFbGVtZW50OiBzdHJpbmc7XG5cbiAgcHJvdGVjdGVkIGdldCBncmlkQXBpKCk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpPFQ+IHsgcmV0dXJuIHRoaXMuX2dyaWRBcGk7IH1cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG9yaWdpbmFsRWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG4gIHByaXZhdGUgX2dyaWRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PFQ+LFxuICAgICAgICAgICAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgICAgICAgZHJhZ0Ryb3A6IERyYWdEcm9wLFxuICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIF9zY3JvbGxEaXNwYXRjaGVyPzogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0RST1BfTElTVF9HUk9VUCkgQFNraXBTZWxmKCkgZ3JvdXA/OiBDZGtEcm9wTGlzdEdyb3VwPENka0Ryb3BMaXN0PixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfRFJBR19DT05GSUcpIGNvbmZpZz86IERyYWdEcm9wQ29uZmlnKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgZHJhZ0Ryb3AsIGNoYW5nZURldGVjdG9yUmVmLCBfc2Nyb2xsRGlzcGF0Y2hlciwgZGlyLCBncm91cCwgY29uZmlnKTtcblxuICAgIGlmICghKHRoaXMucGJsRHJvcExpc3RSZWYgaW5zdGFuY2VvZiBQYmxEcm9wTGlzdFJlZikpIHtcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGBEcm9wTGlzdFJlZmAgaW5qZWN0aW9uLCB0aGUgcmVmIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBQYmxEcm9wTGlzdFJlZicpXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMi9wdWxsLzE0MTUzXG4gICAgLy8gV29ya2luZyBhcm91bmQgdGhlIG1pc3NpbmcgY2FwYWJpbGl0eSBmb3Igc2VsZWN0aW5nIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCBpcyBub3QgdGhlIGRyb3AgY29udGFpbmVyIGhvc3QuXG4gICAgdGhpcy5vcmlnaW5hbEVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgaWYgKGdyaWQpIHtcbiAgICAgIHRoaXMudXBkYXRlR3JpZChncmlkKTtcbiAgICB9XG5cbiAgICB0aGlzLmluaXREcm9wTGlzdFJlZigpO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fZHJvcExpc3RSZWYuYmVmb3JlU3RhcnRlZC5zdWJzY3JpYmUoICgpID0+IHRoaXMuYmVmb3JlU3RhcnRlZCgpICk7XG4gIH1cblxuICBhZGREcmFnKGRyYWc6IENka0RyYWcpOiB2b2lkIHtcbiAgICB0aGlzLmFkZEl0ZW0oZHJhZyk7XG4gIH1cblxuICByZW1vdmVEcmFnKGRyYWc6IENka0RyYWcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbW92ZUl0ZW0oZHJhZyk7XG4gIH1cblxuICAvKipcbiAgICogQSBjaGFuY2UgZm9yIGluaGVyaXRpbmcgaW1wbGVtZW50YXRpb25zIHRvIGNoYW5nZS9tb2RpZnkgdGhlIGRyb3AgbGlzdCByZWYgaW5zdGFuY2VcbiAgICpcbiAgICogV2UgY2FuJ3QgZG8gdGhpcyB2aWEgYSBEcmFnRHJvcCBzZXJ2aWNlIHJlcGxhY2VtZW50IGFzIHdlIG1pZ2h0IGhhdmUgbXVsdGlwbGUgZHJvcC1saXN0cyBvbiB0aGUgc2FtZVxuICAgKiBlbGVtZW50IHdoaWNoIG1lYW4gdGhleSBtdXN0IHNoYXJlIHRoZSBzYW1lIERyYWdEcm9wIGZhY3RvcnkuLi5cbiAgICovXG4gIHByb3RlY3RlZCBpbml0RHJvcExpc3RSZWYoKTogdm9pZCB7IH1cblxuICBwcm90ZWN0ZWQgYmVmb3JlU3RhcnRlZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXJlY3RDb250YWluZXJFbGVtZW50KSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5vcmlnaW5hbEVsZW1lbnQubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZGlyZWN0Q29udGFpbmVyRWxlbWVudCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBuZXcgRWxlbWVudFJlZjxIVE1MRWxlbWVudD4oZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3JpZ2luYWxFbGVtZW50O1xuICAgIH1cbiAgICB0aGlzLnBibERyb3BMaXN0UmVmLndpdGhFbGVtZW50KHRoaXMuZWxlbWVudCk7XG4gICAgaWYgKHRoaXMuZGlyKSB7XG4gICAgICB0aGlzLnBibERyb3BMaXN0UmVmLndpdGhEaXJlY3Rpb24odGhpcy5kaXIpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBncmlkQ2hhbmdlZChwcmV2PzogUGJsTmdyaWRFeHRlbnNpb25BcGk8VD4pIHsgfVxuXG4gIHByaXZhdGUgdXBkYXRlR3JpZChncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxUPikge1xuICAgIGlmIChncmlkICE9PSB0aGlzLmdyaWQpIHtcbiAgICAgIGNvbnN0IHByZXYgPSB0aGlzLl9ncmlkQXBpO1xuICAgICAgdGhpcy5fZ3JpZEFwaSA9IGdyaWQgPyBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZChncmlkKS5leHRBcGkgOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmdyaWRDaGFuZ2VkKHByZXYpO1xuICAgIH1cbiAgfVxufVxuIl19