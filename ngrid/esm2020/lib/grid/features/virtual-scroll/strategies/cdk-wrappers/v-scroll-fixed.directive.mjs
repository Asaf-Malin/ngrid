import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, Input } from '@angular/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { PblNgridComponent } from '../../../../ngrid.component';
import { PblNgridBaseVirtualScrollDirective } from '../base-v-scroll.directive';
import { PblNgridFixedSizeVirtualScrollStrategy } from './fixed-size';
import * as i0 from "@angular/core";
import * as i1 from "../../../../ngrid.component";
/**
 * @deprecated Will be removed in v5
 * `vScrollFixed` will move to an independent package in v5.
 * Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
 */
export class PblCdkFixedSizedVirtualScrollDirective extends PblNgridBaseVirtualScrollDirective {
    constructor(grid) { super(grid, 'vScrollFixed'); }
    /**
     * The size of the items in the list (in pixels).
     * If this value is not set the height is calculated from the first rendered row item.
     *
     * @deprecated Will be removed in v5: `vScrollFixed` will move to an independent package in v5. Note that the recommended dynamic strategy for nGrid is `vScrollDynamic`
     */
    get vScrollFixed() { return this._vScrollFixed; }
    set vScrollFixed(value) { this._vScrollFixed = coerceNumberProperty(value); }
    ngOnInit() {
        if (!this._vScrollFixed) {
            this.vScrollFixed = this.grid.findInitialRowHeight() || 48;
        }
        this._scrollStrategy = new PblNgridFixedSizeVirtualScrollStrategy(this._vScrollFixed, this._minBufferPx, this._maxBufferPx);
    }
    ngOnChanges() {
        this._scrollStrategy?.updateItemAndBufferSize(this._vScrollFixed, this._minBufferPx, this._maxBufferPx);
    }
}
/** @nocollapse */ PblCdkFixedSizedVirtualScrollDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkFixedSizedVirtualScrollDirective, deps: [{ token: i1.PblNgridComponent }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblCdkFixedSizedVirtualScrollDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblCdkFixedSizedVirtualScrollDirective, selector: "pbl-ngrid[vScrollFixed]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx", wheelMode: "wheelMode", vScrollFixed: "vScrollFixed" }, providers: [{
            provide: VIRTUAL_SCROLL_STRATEGY,
            useExisting: PblCdkFixedSizedVirtualScrollDirective,
        }], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblCdkFixedSizedVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[vScrollFixed]',
                    inputs: ['minBufferPx', 'maxBufferPx', 'wheelMode'],
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useExisting: PblCdkFixedSizedVirtualScrollDirective,
                        }],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }]; }, propDecorators: { vScrollFixed: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidi1zY3JvbGwtZml4ZWQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvZmVhdHVyZXMvdmlydHVhbC1zY3JvbGwvc3RyYXRlZ2llcy9jZGstd3JhcHBlcnMvdi1zY3JvbGwtZml4ZWQuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsa0NBQWtDLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNoRixPQUFPLEVBQUUsc0NBQXNDLEVBQUUsTUFBTSxjQUFjLENBQUM7OztBQUV0RTs7OztHQUlHO0FBU0gsTUFBTSxPQUFPLHNDQUF1QyxTQUFRLGtDQUFrRDtJQWE1RyxZQUFZLElBQXVCLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFYckU7Ozs7O09BS0c7SUFDSCxJQUFhLFlBQVksS0FBa0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUN2RSxJQUFJLFlBQVksQ0FBQyxLQUFrQixJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBTTFGLFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDN0Q7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksc0NBQXNDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5SCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxRyxDQUFDOztzSkF4QlUsc0NBQXNDOzBJQUF0QyxzQ0FBc0MsNEtBTHRDLENBQUM7WUFDVixPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLFdBQVcsRUFBRSxzQ0FBc0M7U0FDcEQsQ0FBQzsyRkFFUyxzQ0FBc0M7a0JBUmxELFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtvQkFDbkMsTUFBTSxFQUFFLENBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUU7b0JBQ3JELFNBQVMsRUFBRSxDQUFDOzRCQUNWLE9BQU8sRUFBRSx1QkFBdUI7NEJBQ2hDLFdBQVcsd0NBQXdDO3lCQUNwRCxDQUFDO2lCQUNIO3dHQVNjLFlBQVk7c0JBQXhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgT25Jbml0LCBPbkNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGNvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL25ncmlkLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlIH0gZnJvbSAnLi4vYmFzZS12LXNjcm9sbC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuL2ZpeGVkLXNpemUnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCBpbiB2NVxuICogYHZTY3JvbGxGaXhlZGAgd2lsbCBtb3ZlIHRvIGFuIGluZGVwZW5kZW50IHBhY2thZ2UgaW4gdjUuXG4gKiBOb3RlIHRoYXQgdGhlIHJlY29tbWVuZGVkIGR5bmFtaWMgc3RyYXRlZ3kgZm9yIG5HcmlkIGlzIGB2U2Nyb2xsRHluYW1pY2BcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkW3ZTY3JvbGxGaXhlZF0nLCAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOiBkaXJlY3RpdmUtc2VsZWN0b3JcbiAgaW5wdXRzOiBbICdtaW5CdWZmZXJQeCcsICdtYXhCdWZmZXJQeCcsICd3aGVlbE1vZGUnIF0sIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IG5vLWlucHV0cy1tZXRhZGF0YS1wcm9wZXJ0eVxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gICAgdXNlRXhpc3Rpbmc6IFBibENka0ZpeGVkU2l6ZWRWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlLFxuICB9XSxcbn0pXG5leHBvcnQgY2xhc3MgUGJsQ2RrRml4ZWRTaXplZFZpcnR1YWxTY3JvbGxEaXJlY3RpdmUgZXh0ZW5kcyBQYmxOZ3JpZEJhc2VWaXJ0dWFsU2Nyb2xsRGlyZWN0aXZlPCd2U2Nyb2xsRml4ZWQnPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAvKipcbiAgICogVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSBsaXN0IChpbiBwaXhlbHMpLlxuICAgKiBJZiB0aGlzIHZhbHVlIGlzIG5vdCBzZXQgdGhlIGhlaWdodCBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIGZpcnN0IHJlbmRlcmVkIHJvdyBpdGVtLlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBXaWxsIGJlIHJlbW92ZWQgaW4gdjU6IGB2U2Nyb2xsRml4ZWRgIHdpbGwgbW92ZSB0byBhbiBpbmRlcGVuZGVudCBwYWNrYWdlIGluIHY1LiBOb3RlIHRoYXQgdGhlIHJlY29tbWVuZGVkIGR5bmFtaWMgc3RyYXRlZ3kgZm9yIG5HcmlkIGlzIGB2U2Nyb2xsRHluYW1pY2BcbiAgICovXG4gIEBJbnB1dCgpIGdldCB2U2Nyb2xsRml4ZWQoKTogTnVtYmVySW5wdXQgeyByZXR1cm4gdGhpcy5fdlNjcm9sbEZpeGVkOyB9XG4gIHNldCB2U2Nyb2xsRml4ZWQodmFsdWU6IE51bWJlcklucHV0KSB7IHRoaXMuX3ZTY3JvbGxGaXhlZCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxuXG4gIHByaXZhdGUgX3ZTY3JvbGxGaXhlZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50KSB7IHN1cGVyKGdyaWQsICd2U2Nyb2xsRml4ZWQnKTsgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fdlNjcm9sbEZpeGVkKSB7XG4gICAgICB0aGlzLnZTY3JvbGxGaXhlZCAgPSB0aGlzLmdyaWQuZmluZEluaXRpYWxSb3dIZWlnaHQoKSB8fCA0ODtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgUGJsTmdyaWRGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kodGhpcy5fdlNjcm9sbEZpeGVkLCB0aGlzLl9taW5CdWZmZXJQeCwgdGhpcy5fbWF4QnVmZmVyUHgpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3k/LnVwZGF0ZUl0ZW1BbmRCdWZmZXJTaXplKHRoaXMuX3ZTY3JvbGxGaXhlZCwgdGhpcy5fbWluQnVmZmVyUHgsIHRoaXMuX21heEJ1ZmZlclB4KTtcbiAgfVxufVxuIl19