import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, Input } from '@angular/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { PblNgridComponent } from '../../../../ngrid.component';
import { PblNgridBaseVirtualScrollDirective } from '../base-v-scroll.directive';
import { PblNgridAutoSizeVirtualScrollStrategy, PblNgridItemSizeAverager } from './auto-size';
import * as i0 from "@angular/core";
import * as i1 from "../../../../ngrid.component";
/**
 * @deprecated Will be removed in v5
 * `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 * Note that the default virtual scroll strategy will also change from `vScrollAuto` to `vScrollDynamic`
 */
export class PblCdkAutoSizeVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(grid) { super(grid, 'vScrollAuto'); }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollAuto` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollAuto() { return this._vScrollAuto; }
    set vScrollAuto(value) { this._vScrollAuto = coerceNumberProperty(value); }
    ngOnInit() {
        if (!this._vScrollAuto) {
            this._vScrollAuto = this.grid.findInitialRowHeight() || 48;
        }
        this._scrollStrategy = new PblNgridAutoSizeVirtualScrollStrategy(this._minBufferPx, this._maxBufferPx, new PblNgridItemSizeAverager(this._vScrollAuto));
    }
    ngOnChanges() {
        this._scrollStrategy?.updateBufferSize(this._minBufferPx, this._maxBufferPx);
    }
}
/** @nocollapse */ PblCdkAutoSizeVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkAutoSizeVirtualScrollDirective, deps: [{ token: i1.PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkAutoSizeVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkAutoSizeVirtualScrollDirective, selector: "pbl-ngrid[vScrollAuto]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollAuto: "vScrollAuto" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkAutoSizeVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkAutoSizeVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollAuto]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkAutoSizeVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }]; }, propDecorators: { vScrollAuto: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidi1zY3JvbGwtYXV0by5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC9zdHJhdGVnaWVzL2Nkay13cmFwcGVycy92LXNjcm9sbC1hdXRvLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDcEUsT0FBTyxFQUFFLG9CQUFvQixFQUFlLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDaEYsT0FBTyxFQUFFLHFDQUFxQyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sYUFBYSxDQUFDOzs7QUFFOUY7Ozs7R0FJRztBQVNILE1BQU0sT0FBTyxvQ0FBcUMsU0FBUSxrQ0FBaUQ7SUFZekcsWUFBWSxJQUE0QixJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBVnpFOzs7OztPQUtHO0lBQ0gsSUFBYSxXQUFXLEtBQWtCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDckUsSUFBSSxXQUFXLENBQUMsS0FBa0IsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUt4RixRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksRUFBRSxDQUFDO1NBQzdEO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzFKLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvRSxDQUFDOztvSkF2QlUsb0NBQW9DO3dJQUFwQyxvQ0FBb0MseUtBTHBDLENBQUM7WUFDVixPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLFdBQVcsRUFBRSxvQ0FBb0M7U0FDbEQsQ0FBQzsyRkFFUyxvQ0FBb0M7a0JBUmhELFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHdCQUF3QjtvQkFDbEMsTUFBTSxFQUFFLENBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUU7b0JBQ3JELFNBQVMsRUFBRSxDQUFDOzRCQUNWLE9BQU8sRUFBRSx1QkFBdUI7NEJBQ2hDLFdBQVcsc0NBQXNDO3lCQUNsRCxDQUFDO2lCQUNIO3dHQVNjLFdBQVc7c0JBQXZCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgT25Jbml0LCBPbkNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGNvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL25ncmlkLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlIH0gZnJvbSAnLi4vYmFzZS12LXNjcm9sbC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSwgUGJsTmdyaWRJdGVtU2l6ZUF2ZXJhZ2VyIH0gZnJvbSAnLi9hdXRvLXNpemUnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCBpbiB2NVxuICogYHZTY3JvbGxBdXRvYCB3aWxsIG1vdmUgdG8gYW4gaW5kZXBlbmRlbnQgcGFja2FnZSBpbiB2NS4gTm90ZSB0aGF0IHRoZSByZWNvbW1lbmRlZCBkeW5hbWljIHN0cmF0ZWd5IGZvciBuR3JpZCBpcyBgdlNjcm9sbER5bmFtaWNgXG4gKiBOb3RlIHRoYXQgdGhlIGRlZmF1bHQgdmlydHVhbCBzY3JvbGwgc3RyYXRlZ3kgd2lsbCBhbHNvIGNoYW5nZSBmcm9tIGB2U2Nyb2xsQXV0b2AgdG8gYHZTY3JvbGxEeW5hbWljYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbdlNjcm9sbEF1dG9dJywgLy8gdHNsaW50OmRpc2FibGUtbGluZTogZGlyZWN0aXZlLXNlbGVjdG9yXG4gIGlucHV0czogWyAnbWluQnVmZmVyUHgnLCAnbWF4QnVmZmVyUHgnLCAnd2hlZWxNb2RlJyBdLCAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOiBuby1pbnB1dHMtbWV0YWRhdGEtcHJvcGVydHlcbiAgcHJvdmlkZXJzOiBbe1xuICAgIHByb3ZpZGU6IFZJUlRVQUxfU0NST0xMX1NUUkFURUdZLFxuICAgIHVzZUV4aXN0aW5nOiBQYmxDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGxEaXJlY3RpdmUsXG4gIH1dLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGxEaXJlY3RpdmUgZXh0ZW5kcyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlPCd2U2Nyb2xsQXV0byc+IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMge1xuXG4gIC8qKlxuICAgKiBUaGUgc2l6ZSBvZiB0aGUgaXRlbXMgaW4gdGhlIGxpc3QgKGluIHBpeGVscykuXG4gICAqIElmIHRoaXMgdmFsdWUgaXMgbm90IHNldCB0aGUgaGVpZ2h0IGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgZmlyc3QgcmVuZGVyZWQgcm93IGl0ZW0uXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCBpbiB2NTogYHZTY3JvbGxBdXRvYCB3aWxsIG1vdmUgdG8gYW4gaW5kZXBlbmRlbnQgcGFja2FnZSBpbiB2NS4gTm90ZSB0aGF0IHRoZSByZWNvbW1lbmRlZCBkeW5hbWljIHN0cmF0ZWd5IGZvciBuR3JpZCBpcyBgdlNjcm9sbER5bmFtaWNgXG4gICAqL1xuICBASW5wdXQoKSBnZXQgdlNjcm9sbEF1dG8oKTogTnVtYmVySW5wdXQgeyByZXR1cm4gdGhpcy5fdlNjcm9sbEF1dG87IH1cbiAgc2V0IHZTY3JvbGxBdXRvKHZhbHVlOiBOdW1iZXJJbnB1dCkgeyB0aGlzLl92U2Nyb2xsQXV0byA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxuXG4gIHByaXZhdGUgX3ZTY3JvbGxBdXRvOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PGFueT4pIHsgc3VwZXIoZ3JpZCwgJ3ZTY3JvbGxBdXRvJyk7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3ZTY3JvbGxBdXRvKSB7XG4gICAgICB0aGlzLl92U2Nyb2xsQXV0byAgPSB0aGlzLmdyaWQuZmluZEluaXRpYWxSb3dIZWlnaHQoKSB8fCA0ODtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgUGJsTmdyaWRBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSh0aGlzLl9taW5CdWZmZXJQeCwgdGhpcy5fbWF4QnVmZmVyUHgsIG5ldyBQYmxOZ3JpZEl0ZW1TaXplQXZlcmFnZXIodGhpcy5fdlNjcm9sbEF1dG8pKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5Py51cGRhdGVCdWZmZXJTaXplKHRoaXMuX21pbkJ1ZmZlclB4LCB0aGlzLl9tYXhCdWZmZXJQeCk7XG4gIH1cbn1cbiJdfQ==