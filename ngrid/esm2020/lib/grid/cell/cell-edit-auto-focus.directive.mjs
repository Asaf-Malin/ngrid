import { take } from 'rxjs/operators';
import { Directive, ElementRef, Input, NgZone } from '@angular/core';
import * as i0 from "@angular/core";
export class PblNgridCellEditAutoFocusDirective {
    constructor(elRef, ngZone) {
        this.elRef = elRef;
        this.ngZone = ngZone;
    }
    ngAfterViewInit() {
        const doFocus = () => {
            const context = this.context;
            if (context.editing && !context.rowContext.outOfView) {
                this.elRef.nativeElement.focus();
            }
        };
        this.ngZone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
                if (!this._destroyed) {
                    const { viewport } = this.context.grid;
                    if (viewport && viewport.isScrolling) {
                        viewport.scrolling.pipe(take(1)).subscribe(doFocus);
                    }
                    else {
                        doFocus();
                    }
                }
            });
        });
    }
    ngOnDestroy() {
        this._destroyed = true;
    }
}
/** @nocollapse */ PblNgridCellEditAutoFocusDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditAutoFocusDirective, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellEditAutoFocusDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellEditAutoFocusDirective, selector: "[pblCellEditAutoFocus]", inputs: { context: ["pblCellEditAutoFocus", "context"] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellEditAutoFocusDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblCellEditAutoFocus]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { context: [{
                type: Input,
                args: ['pblCellEditAutoFocus']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1lZGl0LWF1dG8tZm9jdXMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY2VsbC9jZWxsLWVkaXQtYXV0by1mb2N1cy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXRDLE9BQU8sRUFBRSxTQUFTLEVBQWlCLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFhLE1BQU0sZUFBZSxDQUFDOztBQUkvRixNQUFNLE9BQU8sa0NBQWtDO0lBTzdDLFlBQW9CLEtBQThCLEVBQVUsTUFBYztRQUF0RCxVQUFLLEdBQUwsS0FBSyxDQUF5QjtRQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7SUFBSSxDQUFDO0lBRS9FLGVBQWU7UUFDYixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM3QixJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDbEM7UUFDSCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNqQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ3BCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDdkMsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRTt3QkFDcEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUNyRDt5QkFBTTt3QkFDTCxPQUFPLEVBQUUsQ0FBQztxQkFDWDtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7O2tKQWpDVSxrQ0FBa0M7c0lBQWxDLGtDQUFrQzsyRkFBbEMsa0NBQWtDO2tCQUQ5QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHdCQUF3QixFQUFFO3NIQUloQixPQUFPO3NCQUFyQyxLQUFLO3VCQUFDLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IERpcmVjdGl2ZSwgQWZ0ZXJWaWV3SW5pdCwgRWxlbWVudFJlZiwgSW5wdXQsIE5nWm9uZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENlbGxDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9pbmRleCc7XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1twYmxDZWxsRWRpdEF1dG9Gb2N1c10nIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRDZWxsRWRpdEF1dG9Gb2N1c0RpcmVjdGl2ZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWlucHV0LXJlbmFtZVxuICBASW5wdXQoJ3BibENlbGxFZGl0QXV0b0ZvY3VzJykgY29udGV4dDogUGJsTmdyaWRDZWxsQ29udGV4dDxhbnk+O1xuXG4gIHByaXZhdGUgX2Rlc3Ryb3llZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkgeyB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIGNvbnN0IGRvRm9jdXMgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgICAgaWYgKGNvbnRleHQuZWRpdGluZyAmJiAhY29udGV4dC5yb3dDb250ZXh0Lm91dE9mVmlldykge1xuICAgICAgICB0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgY29uc3QgeyB2aWV3cG9ydCB9ID0gdGhpcy5jb250ZXh0LmdyaWQ7XG4gICAgICAgICAgaWYgKHZpZXdwb3J0ICYmIHZpZXdwb3J0LmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgICB2aWV3cG9ydC5zY3JvbGxpbmcucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoZG9Gb2N1cyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvRm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxufVxuIl19