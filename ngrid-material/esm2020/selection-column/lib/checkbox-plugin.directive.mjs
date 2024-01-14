import { Directive, Injector, Input, ComponentFactoryResolver } from '@angular/core';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import { PblNgridCheckboxComponent } from './table-checkbox.component';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid";
export const PLUGIN_KEY = 'matCheckboxSelection';
export class PblNgridMatCheckboxSelectionDirective {
    constructor(table, cfr, injector, pluginCtrl) {
        this.table = table;
        this.cfr = cfr;
        this.injector = injector;
        this._color = 'primary';
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
    }
    get isCheckboxDisabled() { return this._isCheckboxDisabled; }
    set isCheckboxDisabled(value) {
        if (value !== this._isCheckboxDisabled) {
            this._isCheckboxDisabled = value;
            if (this.cmpRef && value) {
                this.cmpRef.instance.isCheckboxDisabled = value;
                this.cmpRef.changeDetectorRef.detectChanges();
            }
        }
    }
    /**
     * Add's a selection column using material's `mat-checkbox` in the column specified.
     */
    get matCheckboxSelection() { return this._name; }
    set matCheckboxSelection(value) {
        if (value !== this._name) {
            this._name = value;
            if (!value) {
                if (this.cmpRef) {
                    this.cmpRef.destroy();
                    this.cmpRef = undefined;
                }
            }
            else {
                if (!this.cmpRef) {
                    this.cmpRef = this.cfr.resolveComponentFactory(PblNgridCheckboxComponent).create(this.injector);
                    this.cmpRef.instance.table = this.table;
                    if (this._bulkSelectMode) {
                        this.cmpRef.instance.bulkSelectMode = this._bulkSelectMode;
                    }
                    this.cmpRef.instance.color = this._color;
                }
                if (this.isCheckboxDisabled) {
                    this.cmpRef.instance.isCheckboxDisabled = this.isCheckboxDisabled;
                }
                this.cmpRef.instance.name = value;
                this.cmpRef.changeDetectorRef.detectChanges();
            }
        }
    }
    /**
     * Defines the behavior when clicking on the bulk select checkbox (header).
     * There are 2 options:
     *
     * - all: Will select all items in the current collection
     * - view: Will select only the rendered items in the view
     *
     * The default value is `all`
     */
    get bulkSelectMode() { return this._bulkSelectMode; }
    set bulkSelectMode(value) {
        if (value !== this._bulkSelectMode) {
            this._bulkSelectMode = value;
            if (this.cmpRef) {
                this.cmpRef.instance.bulkSelectMode = value;
            }
        }
    }
    get matCheckboxSelectionColor() { return this._color; }
    set matCheckboxSelectionColor(value) {
        if (value !== this._color) {
            this._color = value;
            if (this.cmpRef) {
                this.cmpRef.instance.color = value;
            }
        }
    }
    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
        this._removePlugin(this.table);
    }
}
/** @nocollapse */ PblNgridMatCheckboxSelectionDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatCheckboxSelectionDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.ComponentFactoryResolver }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMatCheckboxSelectionDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMatCheckboxSelectionDirective, selector: "pbl-ngrid[matCheckboxSelection]", inputs: { isCheckboxDisabled: "isCheckboxDisabled", matCheckboxSelection: "matCheckboxSelection", bulkSelectMode: "bulkSelectMode", matCheckboxSelectionColor: "matCheckboxSelectionColor" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatCheckboxSelectionDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[matCheckboxSelection]' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.ComponentFactoryResolver }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { isCheckboxDisabled: [{
                type: Input
            }], matCheckboxSelection: [{
                type: Input
            }], bulkSelectMode: [{
                type: Input
            }], matCheckboxSelectionColor: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3gtcGx1Z2luLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQtbWF0ZXJpYWwvc2VsZWN0aW9uLWNvbHVtbi9zcmMvbGliL2NoZWNrYm94LXBsdWdpbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFhLHdCQUF3QixFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUc5RyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7OztBQVF2RSxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQTJCLHNCQUFzQixDQUFDO0FBR3pFLE1BQU0sT0FBTyxxQ0FBcUM7SUErRWhELFlBQW9CLEtBQTZCLEVBQzdCLEdBQTZCLEVBQzdCLFFBQWtCLEVBQzFCLFVBQW9DO1FBSDVCLFVBQUssR0FBTCxLQUFLLENBQXdCO1FBQzdCLFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFQOUIsV0FBTSxHQUFpQixTQUFTLENBQUM7UUFTdkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBbEZELElBQWEsa0JBQWtCLEtBQUssT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLElBQUksa0JBQWtCLENBQUMsS0FBNEI7UUFDakQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7WUFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRTtnQkFDeEIs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LHFDQUFxQzt5SUFBckMscUNBQXFDOzJGQUFyQyxxQ0FBcUM7a0JBRGpELFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsaUNBQWlDLEVBQUU7Nk1BRzNDLGtCQUFrQjtzQkFBOUIsS0FBSztnQkFjTyxvQkFBb0I7c0JBQWhDLEtBQUs7Z0JBb0NPLGNBQWM7c0JBQTFCLEtBQUs7Z0JBVU8seUJBQXlCO3NCQUFyQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciwgSW5wdXQsIE9uRGVzdHJveSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRoZW1lUGFsZXR0ZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmltcG9ydCB7IFBibE5ncmlkQ2hlY2tib3hDb21wb25lbnQgfSBmcm9tICcuL3RhYmxlLWNoZWNrYm94LmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBtYXRDaGVja2JveFNlbGVjdGlvbj86IFBibE5ncmlkTWF0Q2hlY2tib3hTZWxlY3Rpb25EaXJlY3RpdmU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFBMVUdJTl9LRVk6ICdtYXRDaGVja2JveFNlbGVjdGlvbicgPSAnbWF0Q2hlY2tib3hTZWxlY3Rpb24nO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdwYmwtbmdyaWRbbWF0Q2hlY2tib3hTZWxlY3Rpb25dJyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkTWF0Q2hlY2tib3hTZWxlY3Rpb25EaXJlY3RpdmUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIEBJbnB1dCgpIGdldCBpc0NoZWNrYm94RGlzYWJsZWQoKSB7IHJldHVybiB0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQ7IH1cbiAgc2V0IGlzQ2hlY2tib3hEaXNhYmxlZCh2YWx1ZTogKHJvdzogYW55KSA9PiBib29sZWFuICkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5faXNDaGVja2JveERpc2FibGVkKSB7XG4gICAgICB0aGlzLl9pc0NoZWNrYm94RGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLmNtcFJlZiAmJiB2YWx1ZSkge1xuICAgICAgICB0aGlzLmNtcFJlZi5pbnN0YW5jZS5pc0NoZWNrYm94RGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5jbXBSZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQncyBhIHNlbGVjdGlvbiBjb2x1bW4gdXNpbmcgbWF0ZXJpYWwncyBgbWF0LWNoZWNrYm94YCBpbiB0aGUgY29sdW1uIHNwZWNpZmllZC5cbiAgICovXG4gIEBJbnB1dCgpIGdldCBtYXRDaGVja2JveFNlbGVjdGlvbigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuICBzZXQgbWF0Q2hlY2tib3hTZWxlY3Rpb24odmFsdWU6IHN0cmluZyApIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX25hbWUpIHtcbiAgICAgIHRoaXMuX25hbWUgPSB2YWx1ZTtcbiAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY21wUmVmKSB7XG4gICAgICAgICAgdGhpcy5jbXBSZWYuZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXMuY21wUmVmID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXRoaXMuY21wUmVmKSB7XG4gICAgICAgICAgdGhpcy5jbXBSZWYgPSB0aGlzLmNmci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShQYmxOZ3JpZENoZWNrYm94Q29tcG9uZW50KS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XG4gICAgICAgICAgdGhpcy5jbXBSZWYuaW5zdGFuY2UudGFibGUgPSB0aGlzLnRhYmxlO1xuICAgICAgICAgIGlmICh0aGlzLl9idWxrU2VsZWN0TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5jbXBSZWYuaW5zdGFuY2UuYnVsa1NlbGVjdE1vZGUgPSB0aGlzLl9idWxrU2VsZWN0TW9kZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jbXBSZWYuaW5zdGFuY2UuY29sb3IgPSB0aGlzLl9jb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0NoZWNrYm94RGlzYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLmNtcFJlZi5pbnN0YW5jZS5pc0NoZWNrYm94RGlzYWJsZWQgPSB0aGlzLmlzQ2hlY2tib3hEaXNhYmxlZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNtcFJlZi5pbnN0YW5jZS5uYW1lID0gdmFsdWU7XG4gICAgICAgIHRoaXMuY21wUmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgYmVoYXZpb3Igd2hlbiBjbGlja2luZyBvbiB0aGUgYnVsayBzZWxlY3QgY2hlY2tib3ggKGhlYWRlcikuXG4gICAqIFRoZXJlIGFyZSAyIG9wdGlvbnM6XG4gICAqXG4gICAqIC0gYWxsOiBXaWxsIHNlbGVjdCBhbGwgaXRlbXMgaW4gdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuICAgKiAtIHZpZXc6IFdpbGwgc2VsZWN0IG9ubHkgdGhlIHJlbmRlcmVkIGl0ZW1zIGluIHRoZSB2aWV3XG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIGBhbGxgXG4gICAqL1xuICBASW5wdXQoKSBnZXQgYnVsa1NlbGVjdE1vZGUoKTogJ2FsbCcgfCAndmlldycgfCAnbm9uZScgeyByZXR1cm4gdGhpcy5fYnVsa1NlbGVjdE1vZGU7IH1cbiAgc2V0IGJ1bGtTZWxlY3RNb2RlKHZhbHVlOiAnYWxsJyB8ICd2aWV3JyB8ICdub25lJykge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fYnVsa1NlbGVjdE1vZGUpIHtcbiAgICAgIHRoaXMuX2J1bGtTZWxlY3RNb2RlID0gdmFsdWU7XG4gICAgICBpZiAodGhpcy5jbXBSZWYpIHtcbiAgICAgICAgdGhpcy5jbXBSZWYuaW5zdGFuY2UuYnVsa1NlbGVjdE1vZGUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBASW5wdXQoKSBnZXQgbWF0Q2hlY2tib3hTZWxlY3Rpb25Db2xvcigpOiBUaGVtZVBhbGV0dGUgeyByZXR1cm4gdGhpcy5fY29sb3I7IH1cbiAgc2V0IG1hdENoZWNrYm94U2VsZWN0aW9uQ29sb3IodmFsdWU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fY29sb3IpIHtcbiAgICAgIHRoaXMuX2NvbG9yID0gdmFsdWU7XG4gICAgICBpZiAodGhpcy5jbXBSZWYpIHtcbiAgICAgICAgdGhpcy5jbXBSZWYuaW5zdGFuY2UuY29sb3IgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX2J1bGtTZWxlY3RNb2RlOiAnYWxsJyB8ICd2aWV3JyB8ICdub25lJztcbiAgcHJpdmF0ZSBfY29sb3I6IFRoZW1lUGFsZXR0ZSA9ICdwcmltYXJ5JztcbiAgcHJpdmF0ZSBjbXBSZWY6IENvbXBvbmVudFJlZjxQYmxOZ3JpZENoZWNrYm94Q29tcG9uZW50PjtcbiAgcHJpdmF0ZSBfcmVtb3ZlUGx1Z2luOiAodGFibGU6IFBibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHZvaWQ7XG4gIHByaXZhdGUgX2lzQ2hlY2tib3hEaXNhYmxlZDogKHJvdzogYW55KSA9PiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdGFibGU6IFBibE5ncmlkQ29tcG9uZW50PGFueT4sXG4gICAgICAgICAgICAgIHByaXZhdGUgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4gPSBwbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmNtcFJlZikge1xuICAgICAgdGhpcy5jbXBSZWYuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4odGhpcy50YWJsZSk7XG4gIH1cbn1cbiJdfQ==