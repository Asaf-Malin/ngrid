import { Directive, Input, Attribute } from '@angular/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { PblNgridComponent } from '../../../ngrid.component';
import { NoVirtualScrollStrategy } from './noop';
import { PblNgridDynamicVirtualScrollStrategy } from './dynamic-size/dynamic-size';
import { PblNgridBaseVirtualScrollDirective } from './base-v-scroll.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../../ngrid.component";
/** A virtual scroll strategy that supports unknown or dynamic size items. */
export class PblCdkVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(vScrollDynamic, vScrollNone, grid) {
        super(grid, vScrollDynamic === null ? 'vScrollNone' : 'vScrollDynamic');
        if (vScrollDynamic !== null && vScrollNone !== null) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Invalid vScroll instruction, only one value is allow.`);
            }
        }
    }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     */
    get vScrollDynamic() { return this._vScrollDynamic; }
    set vScrollDynamic(value) { this._vScrollDynamic = coerceNumberProperty(value); }
    ngOnInit() {
        switch (this.type) {
            case 'vScrollDynamic':
                if (!this._vScrollDynamic) {
                    this.vScrollDynamic = this.grid.findInitialRowHeight() || 48;
                }
                this._scrollStrategy = new PblNgridDynamicVirtualScrollStrategy(this._vScrollDynamic, this._minBufferPx, this._maxBufferPx);
                break;
            default:
                this._scrollStrategy = new NoVirtualScrollStrategy();
                break;
        }
    }
    ngOnChanges() {
        if (this._scrollStrategy) {
            switch (this.type) {
                case 'vScrollDynamic':
                    this._scrollStrategy?.updateItemAndBufferSize(this._vScrollDynamic, this._minBufferPx, this._maxBufferPx);
                    break;
                default:
                    break;
            }
        }
    }
}
/** @nocollapse */ PblCdkVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollDirective, deps: [{ token: 'vScrollDynamic', attribute: true }, { token: 'vScrollNone', attribute: true }, { token: i1.PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkVirtualScrollDirective, selector: "pbl-ngrid[vScrollDynamic], pbl-ngrid[vScrollNone]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollDynamic: "vScrollDynamic" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollDynamic], pbl-ngrid[vScrollNone]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['vScrollDynamic']
                }] }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['vScrollNone']
                }] }, { type: i1.PblNgridComponent }]; }, propDecorators: { vScrollDynamic: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidi1zY3JvbGwuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvc3RyYXRlZ2llcy92LXNjcm9sbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRSxPQUFPLEVBQUUsb0JBQW9CLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDakQsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbkYsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7OztBQUUvRSw2RUFBNkU7QUFTN0UsTUFBTSxPQUFPLDRCQUE2QixTQUFRLGtDQUFvRTtJQVdwSCxZQUF5QyxjQUFtQixFQUN0QixXQUFnQixFQUMxQyxJQUE0QjtRQUN0QyxLQUFLLENBQUMsSUFBSSxFQUFFLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUNuRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQzthQUMxRTtTQUNGO0lBQ0gsQ0FBQztJQWxCRDs7O09BR0c7SUFDSCxJQUFhLGNBQWMsS0FBa0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUMzRSxJQUFJLGNBQWMsQ0FBQyxLQUFrQixJQUFJLElBQUksQ0FBQyxlQUFlLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBZTlGLFFBQVE7UUFDTixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakIsS0FBSyxnQkFBZ0I7Z0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUN6QixJQUFJLENBQUMsY0FBYyxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQy9EO2dCQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1SCxNQUFNO1lBQ1I7Z0JBQ0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHVCQUF1QixFQUFFLENBQUM7Z0JBQ3JELE1BQU07U0FDVDtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDakIsS0FBSyxnQkFBZ0I7b0JBQ2xCLElBQUksQ0FBQyxlQUF3RCxFQUFFLHVCQUF1QixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BKLE1BQU07Z0JBQ1I7b0JBQ0UsTUFBTTthQUNUO1NBQ0Y7SUFDSCxDQUFDOzs0SUE5Q1UsNEJBQTRCLGtCQVdoQixnQkFBZ0IsOEJBQ2hCLGFBQWE7Z0lBWnpCLDRCQUE0QiwwTUFMNUIsQ0FBQztZQUNWLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsV0FBVyxFQUFFLDRCQUE0QjtTQUMxQyxDQUFDOzJGQUVTLDRCQUE0QjtrQkFSeEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsbURBQW1EO29CQUM3RCxNQUFNLEVBQUUsQ0FBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBRTtvQkFDckQsU0FBUyxFQUFFLENBQUM7NEJBQ1YsT0FBTyxFQUFFLHVCQUF1Qjs0QkFDaEMsV0FBVyw4QkFBOEI7eUJBQzFDLENBQUM7aUJBQ0g7OzBCQVljLFNBQVM7MkJBQUMsZ0JBQWdCOzswQkFDMUIsU0FBUzsyQkFBQyxhQUFhOzRFQU52QixjQUFjO3NCQUExQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgT25Jbml0LCBPbkNoYW5nZXMsIEF0dHJpYnV0ZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgY29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IFZJUlRVQUxfU0NST0xMX1NUUkFURUdZIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL25ncmlkLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOb1ZpcnR1YWxTY3JvbGxTdHJhdGVneSB9IGZyb20gJy4vbm9vcCc7XG5pbXBvcnQgeyBQYmxOZ3JpZER5bmFtaWNWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuL2R5bmFtaWMtc2l6ZS9keW5hbWljLXNpemUnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlVmlydHVhbFNjcm9sbERpcmVjdGl2ZSB9IGZyb20gJy4vYmFzZS12LXNjcm9sbC5kaXJlY3RpdmUnO1xuXG4vKiogQSB2aXJ0dWFsIHNjcm9sbCBzdHJhdGVneSB0aGF0IHN1cHBvcnRzIHVua25vd24gb3IgZHluYW1pYyBzaXplIGl0ZW1zLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkW3ZTY3JvbGxEeW5hbWljXSwgcGJsLW5ncmlkW3ZTY3JvbGxOb25lXScsIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IGRpcmVjdGl2ZS1zZWxlY3RvclxuICBpbnB1dHM6IFsgJ21pbkJ1ZmZlclB4JywgJ21heEJ1ZmZlclB4JywgJ3doZWVsTW9kZScgXSwgLy8gdHNsaW50OmRpc2FibGUtbGluZTogbm8taW5wdXRzLW1ldGFkYXRhLXByb3BlcnR5XG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgICB1c2VFeGlzdGluZzogUGJsQ2RrVmlydHVhbFNjcm9sbERpcmVjdGl2ZSxcbiAgfV0sXG59KVxuZXhwb3J0IGNsYXNzIFBibENka1ZpcnR1YWxTY3JvbGxEaXJlY3RpdmUgZXh0ZW5kcyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlPCd2U2Nyb2xsRHluYW1pYycgfCAndlNjcm9sbE5vbmUnPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAvKipcbiAgICogVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSBsaXN0IChpbiBwaXhlbHMpLlxuICAgKiBJZiB0aGlzIHZhbHVlIGlzIG5vdCBzZXQgdGhlIGhlaWdodCBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIGZpcnN0IHJlbmRlcmVkIHJvdyBpdGVtLlxuICAgKi9cbiAgQElucHV0KCkgZ2V0IHZTY3JvbGxEeW5hbWljKCk6IE51bWJlcklucHV0IHsgcmV0dXJuIHRoaXMuX3ZTY3JvbGxEeW5hbWljOyB9XG4gIHNldCB2U2Nyb2xsRHluYW1pYyh2YWx1ZTogTnVtYmVySW5wdXQpIHsgdGhpcy5fdlNjcm9sbER5bmFtaWMgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7IH1cblxuICBwcml2YXRlIF92U2Nyb2xsRHluYW1pYzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ3ZTY3JvbGxEeW5hbWljJykgdlNjcm9sbER5bmFtaWM6IGFueSxcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgndlNjcm9sbE5vbmUnKSB2U2Nyb2xsTm9uZTogYW55LFxuICAgICAgICAgICAgICBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+KSB7XG4gICAgc3VwZXIoZ3JpZCwgdlNjcm9sbER5bmFtaWMgPT09IG51bGwgPyAndlNjcm9sbE5vbmUnIDogJ3ZTY3JvbGxEeW5hbWljJyk7XG4gICAgaWYgKHZTY3JvbGxEeW5hbWljICE9PSBudWxsICYmIHZTY3JvbGxOb25lICE9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2U2Nyb2xsIGluc3RydWN0aW9uLCBvbmx5IG9uZSB2YWx1ZSBpcyBhbGxvdy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSAndlNjcm9sbER5bmFtaWMnOlxuICAgICAgICBpZiAoIXRoaXMuX3ZTY3JvbGxEeW5hbWljKSB7XG4gICAgICAgICAgdGhpcy52U2Nyb2xsRHluYW1pYyAgPSB0aGlzLmdyaWQuZmluZEluaXRpYWxSb3dIZWlnaHQoKSB8fCA0ODtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IG5ldyBQYmxOZ3JpZER5bmFtaWNWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kodGhpcy5fdlNjcm9sbER5bmFtaWMsIHRoaXMuX21pbkJ1ZmZlclB4LCB0aGlzLl9tYXhCdWZmZXJQeCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgTm9WaXJ0dWFsU2Nyb2xsU3RyYXRlZ3koKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX3Njcm9sbFN0cmF0ZWd5KSB7XG4gICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICBjYXNlICd2U2Nyb2xsRHluYW1pYyc6XG4gICAgICAgICAgKHRoaXMuX3Njcm9sbFN0cmF0ZWd5IGFzIFBibE5ncmlkRHluYW1pY1ZpcnR1YWxTY3JvbGxTdHJhdGVneSk/LnVwZGF0ZUl0ZW1BbmRCdWZmZXJTaXplKHRoaXMuX3ZTY3JvbGxEeW5hbWljLCB0aGlzLl9taW5CdWZmZXJQeCwgdGhpcy5fbWF4QnVmZmVyUHgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=