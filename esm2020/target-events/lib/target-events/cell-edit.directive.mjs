import { Directive, Input, Injector } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { unrx } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
export class PblNgridCellEditDirective {
    constructor(grid, injector, pluginCtrl) {
        this._click = false;
        this._dblClick = false;
        pluginCtrl.onInit()
            .subscribe(() => {
            this.targetEventsPlugin = pluginCtrl.getPlugin('targetEvents') || pluginCtrl.createPlugin('targetEvents');
            this.update();
        });
    }
    set cellEditClick(value) {
        value = coerceBooleanProperty(value);
        if (this._click !== value) {
            this._click = value;
            this.update();
        }
    }
    set cellEditDblClick(value) {
        value = coerceBooleanProperty(value);
        if (this._dblClick !== value) {
            this._dblClick = value;
            this.update();
        }
    }
    ngOnDestroy() {
        unrx.kill(this);
    }
    update() {
        if (this.targetEventsPlugin) {
            unrx.kill(this, this.targetEventsPlugin);
            if (this._click) {
                this.targetEventsPlugin.cellClick
                    .pipe(unrx(this, this.targetEventsPlugin))
                    .subscribe(event => {
                    if (event.type === 'data' && event.column.editable) {
                        event.context.startEdit(true);
                    }
                });
            }
            if (this._dblClick) {
                this.targetEventsPlugin.cellDblClick
                    .pipe(unrx(this, this.targetEventsPlugin))
                    .subscribe(event => {
                    if (event.type === 'data' && event.column.editable) {
                        event.context.startEdit(true);
                    }
                });
            }
        }
    }
}
/** @nocollapse */ PblNgridCellEditDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellEditDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellEditDirective, selector: "pbl-ngrid[cellEditClick], pbl-ngrid[cellEditDblClick]", inputs: { cellEditClick: "cellEditClick", cellEditDblClick: "cellEditDblClick" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditDirective, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: 'pbl-ngrid[cellEditClick], pbl-ngrid[cellEditDblClick]',
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { cellEditClick: [{
                type: Input
            }], cellEditDblClick: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1lZGl0LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvdGFyZ2V0LWV2ZW50cy9zcmMvbGliL3RhcmdldC1ldmVudHMvY2VsbC1lZGl0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDdEUsT0FBTyxFQUFnQixxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQU81RSxNQUFNLE9BQU8seUJBQXlCO0lBb0JwQyxZQUFZLElBQTRCLEVBQUUsUUFBa0IsRUFBRSxVQUFvQztRQUoxRixXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUl4QixVQUFVLENBQUMsTUFBTSxFQUFFO2FBQ2hCLFNBQVMsQ0FBRSxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUF6QkQsSUFBYSxhQUFhLENBQUMsS0FBYztRQUN2QyxLQUFLLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDZjtJQUNILENBQUM7SUFDRCxJQUFhLGdCQUFnQixDQUFDLEtBQWM7UUFDMUMsS0FBSyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2Y7SUFDSCxDQUFDO0lBY0QsV0FBVztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVPLE1BQU07UUFDWixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVM7cUJBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3FCQUN6QyxTQUFTLENBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ2xCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7d0JBQ2xELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMvQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWTtxQkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7cUJBQ3pDLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTt3QkFDbEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQy9CO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ047U0FDRjtJQUNILENBQUM7O3lJQXZEVSx5QkFBeUI7NkhBQXpCLHlCQUF5QjsyRkFBekIseUJBQXlCO2tCQUpyQyxTQUFTO21CQUFDO29CQUNULDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLHVEQUF1RDtpQkFDbEU7c0tBRWMsYUFBYTtzQkFBekIsS0FBSztnQkFPTyxnQkFBZ0I7c0JBQTVCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBJbmplY3RvciwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbmltcG9ydCB7IHVucnggfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgUGJsTmdyaWRUYXJnZXRFdmVudHNQbHVnaW4gfSBmcm9tICcuL3RhcmdldC1ldmVudHMtcGx1Z2luJztcblxuQERpcmVjdGl2ZSh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkaXJlY3RpdmUtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbY2VsbEVkaXRDbGlja10sIHBibC1uZ3JpZFtjZWxsRWRpdERibENsaWNrXScsXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ2VsbEVkaXREaXJlY3RpdmU8VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBzZXQgY2VsbEVkaXRDbGljayh2YWx1ZTogYm9vbGVhbikge1xuICAgIHZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICBpZiAodGhpcy5fY2xpY2sgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl9jbGljayA9IHZhbHVlO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH1cbiAgQElucHV0KCkgc2V0IGNlbGxFZGl0RGJsQ2xpY2sodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB2YWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgaWYgKHRoaXMuX2RibENsaWNrICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fZGJsQ2xpY2sgPSB2YWx1ZTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2xpY2sgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGJsQ2xpY2sgPSBmYWxzZTtcbiAgcHJpdmF0ZSB0YXJnZXRFdmVudHNQbHVnaW46IFBibE5ncmlkVGFyZ2V0RXZlbnRzUGx1Z2luPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PGFueT4sIGluamVjdG9yOiBJbmplY3RvciwgcGx1Z2luQ3RybDogUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyKSB7XG4gICAgcGx1Z2luQ3RybC5vbkluaXQoKVxuICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICB0aGlzLnRhcmdldEV2ZW50c1BsdWdpbiA9IHBsdWdpbkN0cmwuZ2V0UGx1Z2luKCd0YXJnZXRFdmVudHMnKSB8fCBwbHVnaW5DdHJsLmNyZWF0ZVBsdWdpbigndGFyZ2V0RXZlbnRzJyk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHVucngua2lsbCh0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRhcmdldEV2ZW50c1BsdWdpbikge1xuICAgICAgdW5yeC5raWxsKHRoaXMsIHRoaXMudGFyZ2V0RXZlbnRzUGx1Z2luKTtcbiAgICAgIGlmICh0aGlzLl9jbGljaykge1xuICAgICAgICB0aGlzLnRhcmdldEV2ZW50c1BsdWdpbi5jZWxsQ2xpY2tcbiAgICAgICAgICAucGlwZSh1bnJ4KHRoaXMsIHRoaXMudGFyZ2V0RXZlbnRzUGx1Z2luKSlcbiAgICAgICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2RhdGEnICYmIGV2ZW50LmNvbHVtbi5lZGl0YWJsZSkge1xuICAgICAgICAgICAgICBldmVudC5jb250ZXh0LnN0YXJ0RWRpdCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2RibENsaWNrKSB7XG4gICAgICAgIHRoaXMudGFyZ2V0RXZlbnRzUGx1Z2luLmNlbGxEYmxDbGlja1xuICAgICAgICAgIC5waXBlKHVucngodGhpcywgdGhpcy50YXJnZXRFdmVudHNQbHVnaW4pKVxuICAgICAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnZGF0YScgJiYgZXZlbnQuY29sdW1uLmVkaXRhYmxlKSB7XG4gICAgICAgICAgICAgIGV2ZW50LmNvbnRleHQuc3RhcnRFZGl0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jZWxsRWRpdENsaWNrOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jZWxsRWRpdERibENsaWNrOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=