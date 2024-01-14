import { Directive, Input } from '@angular/core';
import { PblNgridPluginController } from '@pebula/ngrid';
import { PblNgridOverlayPanelFactory } from '@pebula/ngrid/overlay-panel';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid/overlay-panel";
import * as i2 from "@pebula/ngrid";
export const PLUGIN_KEY = 'matHeaderContextMenu';
export class PblNgridMatHeaderContextMenuPlugin {
    constructor(overlayPanelFactory, pluginCtrl) {
        this.pluginCtrl = pluginCtrl;
        this.overlayPanel = overlayPanelFactory.create(pluginCtrl.extApi.grid);
    }
}
/** @nocollapse */ PblNgridMatHeaderContextMenuPlugin.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatHeaderContextMenuPlugin, deps: [{ token: i1.PblNgridOverlayPanelFactory }, { token: i2.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMatHeaderContextMenuPlugin.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMatHeaderContextMenuPlugin, selector: "pbl-ngrid[matHeaderContextMenu]", inputs: { style: ["matHeaderContextMenu", "style"], config: "config" }, providers: [PblNgridOverlayPanelFactory], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatHeaderContextMenuPlugin, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[matHeaderContextMenu]', providers: [PblNgridOverlayPanelFactory] }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridOverlayPanelFactory }, { type: i2.PblNgridPluginController }]; }, propDecorators: { style: [{
                type: Input,
                args: ['matHeaderContextMenu']
            }], config: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLWNvbnRleHQtbWVudS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkLW1hdGVyaWFsL2NvbnRleHQtbWVudS9zcmMvbGliL2hlYWRlci1jb250ZXh0L2hlYWRlci1jb250ZXh0LW1lbnUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsMkJBQTJCLEVBQW9ELE1BQU0sNkJBQTZCLENBQUM7Ozs7QUFRNUgsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUEyQixzQkFBc0IsQ0FBQztBQUd6RSxNQUFNLE9BQU8sa0NBQWtDO0lBTzdDLFlBQVksbUJBQWdELEVBQ2hDLFVBQW9DO1FBQXBDLGVBQVUsR0FBVixVQUFVLENBQTBCO1FBQzlELElBQUksQ0FBQyxZQUFZLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekUsQ0FBQzs7a0pBVlUsa0NBQWtDO3NJQUFsQyxrQ0FBa0Msa0lBRHNCLENBQUUsMkJBQTJCLENBQUU7MkZBQ3ZGLGtDQUFrQztrQkFEOUMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRSxTQUFTLEVBQUUsQ0FBRSwyQkFBMkIsQ0FBRSxFQUFFO3lKQUdyRSxLQUFLO3NCQUFuQyxLQUFLO3VCQUFDLHNCQUFzQjtnQkFDcEIsTUFBTTtzQkFBZCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxOZ3JpZE92ZXJsYXlQYW5lbEZhY3RvcnksIFBibE5ncmlkT3ZlcmxheVBhbmVsLCBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbmZpZyB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvb3ZlcmxheS1wYW5lbCc7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBtYXRIZWFkZXJDb250ZXh0TWVudT86IFBibE5ncmlkTWF0SGVhZGVyQ29udGV4dE1lbnVQbHVnaW47XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFBMVUdJTl9LRVk6ICdtYXRIZWFkZXJDb250ZXh0TWVudScgPSAnbWF0SGVhZGVyQ29udGV4dE1lbnUnO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdwYmwtbmdyaWRbbWF0SGVhZGVyQ29udGV4dE1lbnVdJywgcHJvdmlkZXJzOiBbIFBibE5ncmlkT3ZlcmxheVBhbmVsRmFjdG9yeSBdIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRNYXRIZWFkZXJDb250ZXh0TWVudVBsdWdpbiB7XG5cbiAgQElucHV0KCdtYXRIZWFkZXJDb250ZXh0TWVudScpIHN0eWxlOiBhbnk7XG4gIEBJbnB1dCgpIGNvbmZpZzogUGJsTmdyaWRPdmVybGF5UGFuZWxDb25maWc7XG5cbiAgcmVhZG9ubHkgb3ZlcmxheVBhbmVsOiBQYmxOZ3JpZE92ZXJsYXlQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihvdmVybGF5UGFuZWxGYWN0b3J5OiBQYmxOZ3JpZE92ZXJsYXlQYW5lbEZhY3RvcnksXG4gICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLm92ZXJsYXlQYW5lbCA9IG92ZXJsYXlQYW5lbEZhY3RvcnkuY3JlYXRlKHBsdWdpbkN0cmwuZXh0QXBpLmdyaWQpO1xuICB9XG5cbn1cbiJdfQ==