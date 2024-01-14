import { ElementRef, Directive, Inject } from '@angular/core';
import { unrx } from '@pebula/ngrid/core';
import { EXT_API_TOKEN } from '../../ext/grid-ext-api';
import * as i0 from "@angular/core";
export class PblNgridBaseCell {
    constructor(extApi, elementRef) {
        this.extApi = extApi;
        this.el = elementRef.nativeElement;
    }
    get owner() { return this._owner; }
    setOwner(owner) {
        this._owner = owner;
    }
    focus() {
        this.el.focus({ preventScroll: true });
        this.extApi.viewport._scrollIntoView(this.el);
    }
    ngOnDestroy() {
        unrx.kill(this);
    }
}
/** @nocollapse */ PblNgridBaseCell.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCell, deps: [{ token: EXT_API_TOKEN }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridBaseCell.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridBaseCell, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridBaseCell, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: i0.ElementRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1jZWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY2VsbC9iYXNlLWNlbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFhLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFnQyxNQUFNLHdCQUF3QixDQUFDOztBQUtyRixNQUFNLE9BQU8sZ0JBQWdCO0lBTzNCLFlBQTZDLE1BQW9DLEVBQUUsVUFBbUM7UUFBekUsV0FBTSxHQUFOLE1BQU0sQ0FBOEI7UUFDL0UsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ3JDLENBQUM7SUFORCxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBUW5DLFFBQVEsQ0FBQyxLQUFXO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQixDQUFDOztnSUF0QlUsZ0JBQWdCLGtCQU9QLGFBQWE7b0hBUHRCLGdCQUFnQjsyRkFBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTOzswQkFRSyxNQUFNOzJCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPbkRlc3Ryb3ksIEVsZW1lbnRSZWYsIERpcmVjdGl2ZSwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgRVhUX0FQSV9UT0tFTiwgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlUm93Q29tcG9uZW50IH0gZnJvbSAnLi4vcm93L2Jhc2Utcm93LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBHcmlkUm93VHlwZSB9IGZyb20gJy4uL3Jvdy90eXBlcyc7XG5cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQmFzZUNlbGw8VFJvdyBleHRlbmRzIFBibE5ncmlkQmFzZVJvd0NvbXBvbmVudDxHcmlkUm93VHlwZT4gPSBQYmxOZ3JpZEJhc2VSb3dDb21wb25lbnQ8R3JpZFJvd1R5cGU+PiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIGVsOiBIVE1MRWxlbWVudDtcblxuICBnZXQgb3duZXIoKSB7IHJldHVybiB0aGlzLl9vd25lcjsgfVxuXG4gIHByaXZhdGUgX293bmVyOiBUUm93O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRVhUX0FQSV9UT0tFTikgcHJvdGVjdGVkIGV4dEFwaTogUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSwgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4pIHtcbiAgICB0aGlzLmVsID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgc2V0T3duZXIob3duZXI6IFRSb3cpIHtcbiAgICB0aGlzLl9vd25lciA9IG93bmVyO1xuICB9XG5cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5lbC5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgdGhpcy5leHRBcGkudmlld3BvcnQuX3Njcm9sbEludG9WaWV3KHRoaXMuZWwpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdW5yeC5raWxsKHRoaXMpO1xuICB9XG59XG4iXX0=