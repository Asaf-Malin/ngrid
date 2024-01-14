import { Directive, EventEmitter, Output, NgZone } from '@angular/core';
import { PblNgridPluginController } from '../../../ext/plugin-control';
import { PblNgridComponent } from '../../ngrid.component';
import * as i0 from "@angular/core";
import * as i1 from "../../ngrid.component";
import * as i2 from "../../../ext/plugin-control";
export class PblNgridScrolling {
    constructor(table, pluginCtrl, zone) {
        /**
         * Event emitted when the scrolling state of rows in the table changes.
         * When scrolling starts `true` is emitted and when the scrolling ends `false` is emitted.
         *
         * The table is in "scrolling" state from the first scroll event and until 2 animation frames
         * have passed without a scroll event.
         *
         * When scrolling, the emitted value is the direction: -1 or 1
         * When not scrolling, the emitted value is 0.
         *
         * NOTE: This event runs outside the angular zone.
         */
        this.scrolling = new EventEmitter();
        pluginCtrl.onInit()
            .subscribe(() => {
            const { viewport } = table;
            if (viewport) {
                viewport.scrolling.subscribe(isScrolling => zone.run(() => this.scrolling.next(isScrolling)));
            }
        });
    }
}
/** @nocollapse */ PblNgridScrolling.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridScrolling, deps: [{ token: i1.PblNgridComponent }, { token: i2.PblNgridPluginController }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridScrolling.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridScrolling, selector: "pbl-ngrid[scrolling]", outputs: { scrolling: "scrolling" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridScrolling, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[scrolling]' // tslint:disable-line: directive-selector
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i2.PblNgridPluginController }, { type: i0.NgZone }]; }, propDecorators: { scrolling: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLXBsdWdpbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC9zY3JvbGxpbmctcGx1Z2luLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7O0FBSzFELE1BQU0sT0FBTyxpQkFBaUI7SUFnQjVCLFlBQVksS0FBMkIsRUFBRSxVQUFvQyxFQUFFLElBQVk7UUFkM0Y7Ozs7Ozs7Ozs7O1dBV0c7UUFDTyxjQUFTLEdBQUcsSUFBSSxZQUFZLEVBQWdCLENBQUM7UUFHckQsVUFBVSxDQUFDLE1BQU0sRUFBRTthQUNoQixTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLFFBQVEsRUFBRTtnQkFDWixRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBRSxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUUsQ0FBRSxDQUFDO2FBQ25HO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOztpSUF4QlUsaUJBQWlCO3FIQUFqQixpQkFBaUI7MkZBQWpCLGlCQUFpQjtrQkFIN0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsc0JBQXNCLENBQUMsMENBQTBDO2lCQUM1RTtvS0FlVyxTQUFTO3NCQUFsQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIE91dHB1dCwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIgfSBmcm9tICcuLi8uLi8uLi9leHQvcGx1Z2luLWNvbnRyb2wnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi8uLi9uZ3JpZC5jb21wb25lbnQnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbc2Nyb2xsaW5nXScgLy8gdHNsaW50OmRpc2FibGUtbGluZTogZGlyZWN0aXZlLXNlbGVjdG9yXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkU2Nyb2xsaW5nPFQgPSBhbnk+IHtcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzY3JvbGxpbmcgc3RhdGUgb2Ygcm93cyBpbiB0aGUgdGFibGUgY2hhbmdlcy5cbiAgICogV2hlbiBzY3JvbGxpbmcgc3RhcnRzIGB0cnVlYCBpcyBlbWl0dGVkIGFuZCB3aGVuIHRoZSBzY3JvbGxpbmcgZW5kcyBgZmFsc2VgIGlzIGVtaXR0ZWQuXG4gICAqXG4gICAqIFRoZSB0YWJsZSBpcyBpbiBcInNjcm9sbGluZ1wiIHN0YXRlIGZyb20gdGhlIGZpcnN0IHNjcm9sbCBldmVudCBhbmQgdW50aWwgMiBhbmltYXRpb24gZnJhbWVzXG4gICAqIGhhdmUgcGFzc2VkIHdpdGhvdXQgYSBzY3JvbGwgZXZlbnQuXG4gICAqXG4gICAqIFdoZW4gc2Nyb2xsaW5nLCB0aGUgZW1pdHRlZCB2YWx1ZSBpcyB0aGUgZGlyZWN0aW9uOiAtMSBvciAxXG4gICAqIFdoZW4gbm90IHNjcm9sbGluZywgdGhlIGVtaXR0ZWQgdmFsdWUgaXMgMC5cbiAgICpcbiAgICogTk9URTogVGhpcyBldmVudCBydW5zIG91dHNpZGUgdGhlIGFuZ3VsYXIgem9uZS5cbiAgICovXG4gIEBPdXRwdXQoKSBzY3JvbGxpbmcgPSBuZXcgRXZlbnRFbWl0dGVyPCAtMSB8IDAgfCAxID4oKTtcblxuICBjb25zdHJ1Y3Rvcih0YWJsZTogUGJsTmdyaWRDb21wb25lbnQ8VD4sIHBsdWdpbkN0cmw6IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciwgem9uZTogTmdab25lKSB7XG4gICAgcGx1Z2luQ3RybC5vbkluaXQoKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdmlld3BvcnQgfSA9IHRhYmxlO1xuICAgICAgICBpZiAodmlld3BvcnQpIHtcbiAgICAgICAgICB2aWV3cG9ydC5zY3JvbGxpbmcuc3Vic2NyaWJlKCBpc1Njcm9sbGluZyA9PiB6b25lLnJ1biggKCkgPT4gdGhpcy5zY3JvbGxpbmcubmV4dChpc1Njcm9sbGluZykgKSApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuIl19