import { Directive, Input } from '@angular/core';
import { DragDrop, CDK_DRAG_PARENT } from '@angular/cdk/drag-drop';
import { PblNgridPluginController } from '@asafmalin/ngrid';
import { PblDragDrop, CdkLazyDrag } from '../core/index';
import { ROW_REORDER_PLUGIN_KEY } from './row-reorder-plugin';
import * as i0 from "@angular/core";
export class PblNgridRowDragDirective extends CdkLazyDrag {
    constructor() {
        super(...arguments);
        this.rootElementSelector = 'pbl-ngrid-row';
    }
    get context() {
        return this._context;
    }
    set context(value) {
        this._context = value;
        const pluginCtrl = this.pluginCtrl = value && PblNgridPluginController.find(value.grid);
        const plugin = pluginCtrl?.getPlugin(ROW_REORDER_PLUGIN_KEY);
        this.cdkDropList = plugin || undefined;
    }
    /**
     * Reference to the last dragged context.
     *
     * This context is not similar to the `context` property.
     * The `context` property holds the current context which is shared and updated on scroll so if a user start a drag and then scrolled
     * the context will point to the row in view and not the original cell.
     */
    get draggedContext() {
        return this._draggedContext;
    }
    ngOnInit() {
        this.started.subscribe((event) => {
            const { col, row, grid, value } = this._context;
            this._draggedContext = { col, row, grid, value };
        });
        super.ngOnInit();
    }
}
/** @nocollapse */ PblNgridRowDragDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDragDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridRowDragDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridRowDragDirective, selector: "[pblNgridRowDrag]", inputs: { context: ["pblNgridRowDrag", "context"] }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DRAG_PARENT, useExisting: PblNgridRowDragDirective },
    ], exportAs: ["pblNgridRowDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridRowDragDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridRowDrag]',
                    exportAs: 'pblNgridRowDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DRAG_PARENT, useExisting: PblNgridRowDragDirective },
                    ]
                }]
        }], propDecorators: { context: [{
                type: Input,
                args: ['pblNgridRowDrag']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LWRyYWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9kcmFnLWFuZC1kcm9wL3Jvdy9yb3ctZHJhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFnQixlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVqRixPQUFPLEVBQUUsd0JBQXdCLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQzlFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBcUMsc0JBQXNCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7QUFjakcsTUFBTSxPQUFPLHdCQUFrQyxTQUFRLFdBQW9EO0lBWjNHOztRQWFFLHdCQUFtQixHQUFHLGVBQWUsQ0FBQztLQXFDdkM7SUFuQ0MsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUE4QixPQUFPLENBQUMsS0FBNkI7UUFDakUsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RixNQUFNLE1BQU0sR0FBRyxVQUFVLEVBQUUsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksU0FBUyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFJLGNBQWM7UUFDaEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFPRCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUUsQ0FBQyxLQUFtQixFQUFFLEVBQUU7WUFDOUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7O3dJQXJDVSx3QkFBd0I7NEhBQXhCLHdCQUF3QiwyTUFMeEI7UUFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtRQUMvQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFFO0tBQ3BFOzJGQUVVLHdCQUF3QjtrQkFacEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLFVBQVU7d0JBQ25CLDJCQUEyQixFQUFFLHVCQUF1QjtxQkFDckQ7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO3dCQUMvQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVywwQkFBMEIsRUFBRTtxQkFDcEU7aUJBQ0Y7OEJBUStCLE9BQU87c0JBQXBDLEtBQUs7dUJBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEcmFnRHJvcCwgQ2RrRHJhZ1N0YXJ0LCBDREtfRFJBR19QQVJFTlQgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuaW1wb3J0IHsgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLCBQYmxOZ3JpZENlbGxDb250ZXh0IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxEcmFnRHJvcCwgQ2RrTGF6eURyYWcgfSBmcm9tICcuLi9jb3JlL2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkUm93UmVvcmRlclBsdWdpbkRpcmVjdGl2ZSwgUk9XX1JFT1JERVJfUExVR0lOX0tFWSB9IGZyb20gJy4vcm93LXJlb3JkZXItcGx1Z2luJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkUm93RHJhZ10nLFxuICBleHBvcnRBczogJ3BibE5ncmlkUm93RHJhZycsXG4gIGhvc3Q6IHsgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1ob3N0LW1ldGFkYXRhLXByb3BlcnR5XG4gICAgJ2NsYXNzJzogJ2Nkay1kcmFnJyxcbiAgICAnW2NsYXNzLmNkay1kcmFnLWRyYWdnaW5nXSc6ICdfZHJhZ1JlZi5pc0RyYWdnaW5nKCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IERyYWdEcm9wLCB1c2VFeGlzdGluZzogUGJsRHJhZ0Ryb3AgfSxcbiAgICB7IHByb3ZpZGU6IENES19EUkFHX1BBUkVOVCwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkUm93RHJhZ0RpcmVjdGl2ZSB9LFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkUm93RHJhZ0RpcmVjdGl2ZTxUID0gYW55PiBleHRlbmRzIENka0xhenlEcmFnPFQsIFBibE5ncmlkUm93UmVvcmRlclBsdWdpbkRpcmVjdGl2ZTxUPj4gaW1wbGVtZW50cyBPbkluaXQge1xuICByb290RWxlbWVudFNlbGVjdG9yID0gJ3BibC1uZ3JpZC1yb3cnO1xuXG4gIGdldCBjb250ZXh0KCk6IFBibE5ncmlkQ2VsbENvbnRleHQ8VD4ge1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0O1xuICB9XG5cbiAgQElucHV0KCdwYmxOZ3JpZFJvd0RyYWcnKSBzZXQgY29udGV4dCh2YWx1ZTogUGJsTmdyaWRDZWxsQ29udGV4dDxUPikge1xuICAgIHRoaXMuX2NvbnRleHQgPSB2YWx1ZTtcblxuICAgIGNvbnN0IHBsdWdpbkN0cmwgPSB0aGlzLnBsdWdpbkN0cmwgPSB2YWx1ZSAmJiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZCh2YWx1ZS5ncmlkKTtcbiAgICBjb25zdCBwbHVnaW4gPSBwbHVnaW5DdHJsPy5nZXRQbHVnaW4oUk9XX1JFT1JERVJfUExVR0lOX0tFWSk7XG4gICAgdGhpcy5jZGtEcm9wTGlzdCA9IHBsdWdpbiB8fCB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBsYXN0IGRyYWdnZWQgY29udGV4dC5cbiAgICpcbiAgICogVGhpcyBjb250ZXh0IGlzIG5vdCBzaW1pbGFyIHRvIHRoZSBgY29udGV4dGAgcHJvcGVydHkuXG4gICAqIFRoZSBgY29udGV4dGAgcHJvcGVydHkgaG9sZHMgdGhlIGN1cnJlbnQgY29udGV4dCB3aGljaCBpcyBzaGFyZWQgYW5kIHVwZGF0ZWQgb24gc2Nyb2xsIHNvIGlmIGEgdXNlciBzdGFydCBhIGRyYWcgYW5kIHRoZW4gc2Nyb2xsZWRcbiAgICogdGhlIGNvbnRleHQgd2lsbCBwb2ludCB0byB0aGUgcm93IGluIHZpZXcgYW5kIG5vdCB0aGUgb3JpZ2luYWwgY2VsbC5cbiAgICovXG4gIGdldCBkcmFnZ2VkQ29udGV4dCgpOiBQaWNrPFBibE5ncmlkQ2VsbENvbnRleHQ8VD4sICdjb2wnIHwgJ2dyaWQnPiAmIFBhcnRpYWw8UGljazxQYmxOZ3JpZENlbGxDb250ZXh0PFQ+LCAncm93JyB8ICd2YWx1ZSc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RyYWdnZWRDb250ZXh0O1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udGV4dDogUGJsTmdyaWRDZWxsQ29udGV4dDxUPjtcbiAgcHJpdmF0ZSBfZHJhZ2dlZENvbnRleHQ6IFBpY2s8UGJsTmdyaWRDZWxsQ29udGV4dDxUPiwgJ2NvbCcgfCAnZ3JpZCc+ICYgUGFydGlhbDxQaWNrPFBibE5ncmlkQ2VsbENvbnRleHQ8VD4sICdyb3cnIHwgJ3ZhbHVlJz4+O1xuXG4gIHByaXZhdGUgcGx1Z2luQ3RybDogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyO1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuc3RhcnRlZC5zdWJzY3JpYmUoIChldmVudDogQ2RrRHJhZ1N0YXJ0KSA9PiB7XG4gICAgICBjb25zdCB7IGNvbCwgcm93LCBncmlkLCB2YWx1ZSB9ICA9IHRoaXMuX2NvbnRleHQ7XG4gICAgICB0aGlzLl9kcmFnZ2VkQ29udGV4dCA9IHsgY29sLCByb3csIGdyaWQsIHZhbHVlIH07XG4gICAgfSk7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxufVxuIl19