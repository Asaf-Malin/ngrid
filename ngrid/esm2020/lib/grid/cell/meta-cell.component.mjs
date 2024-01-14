import { filter } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewContainerRef, ViewChild, } from '@angular/core';
import { unrx } from '@asafmalin/ngrid/core';
import { isPblColumnGroup } from '../column/model';
import { MetaCellContext } from '../context/index';
import { PblNgridColumnDef } from '../column/directives/column-def';
import { applySourceWidth, initCellElement, initCellHeaderFooter } from './utils';
import { PblNgridBaseCell } from './base-cell';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const HEADER_GROUP_CSS = `pbl-header-group-cell`;
const HEADER_GROUP_PLACE_HOLDER_CSS = `pbl-header-group-cell-placeholder`;
/**
 * Header cell component.
 * The header cell component will render the header cell template and add the proper classes and role.
 *
 * It is also responsible for creating and managing the any `dataHeaderExtensions` registered in the registry.
 * These extensions add features to the cells either as a template instance or as a component instance.
 * Examples: Sorting behavior, drag&drop/resize handlers, menus etc...
 */
export class PblNgridMetaCellComponent extends PblNgridBaseCell {
    get columnDef() { return this.column.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column, isFooter) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            if (column) {
                if (!column.columnDef) {
                    new PblNgridColumnDef(this.extApi).column = column;
                    column.columnDef.name = column.id;
                }
                this.cellCtx = MetaCellContext.create(column, this.grid);
                if (isPblColumnGroup(column)) {
                    this.el.classList.add(HEADER_GROUP_CSS);
                    if (column.placeholder) {
                        this.el.classList.add(HEADER_GROUP_PLACE_HOLDER_CSS);
                    }
                }
                this.columnDef.widthChange
                    .pipe(filter(event => event.reason !== 'resize'), unrx(this, column))
                    .subscribe(event => this.columnDef.applySourceWidth(this.el));
                applySourceWidth.call(this);
                initCellElement(this.el, column);
                initCellHeaderFooter(this.el, isFooter);
            }
        }
    }
    ngOnDestroy() {
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
}
/** @nocollapse */ PblNgridMetaCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaCellComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridMetaCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMetaCellComponent, selector: "pbl-ngrid-meta-cell", host: { attributes: { "role": "cell" } }, viewQueries: [{ propertyName: "vcRef", first: true, predicate: ["vcRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["ngridMetaCell"], usesInheritance: true, ngImport: i0, template: `<ng-container *ngTemplateOutlet="column?.template; context: cellCtx"></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-meta-cell',
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        role: 'cell',
                    },
                    exportAs: 'ngridMetaCell',
                    template: `<ng-container *ngTemplateOutlet="column?.template; context: cellCtx"></ng-container>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], propDecorators: { vcRef: [{
                type: ViewChild,
                args: ['vcRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS1jZWxsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NlbGwvbWV0YS1jZWxsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEMsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRzFDLE9BQU8sRUFBaUMsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNsRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7OztBQUUvQyxNQUFNLGdCQUFnQixHQUFHLHVCQUF1QixDQUFDO0FBQ2pELE1BQU0sNkJBQTZCLEdBQUcsbUNBQW1DLENBQUM7QUFFMUU7Ozs7Ozs7R0FPRztBQVlILE1BQU0sT0FBTyx5QkFBcUcsU0FBUSxnQkFBZ0I7SUFNeEksSUFBSSxTQUFTLEtBQXVDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ25GLElBQUksSUFBSSxLQUF5QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUUzRCxTQUFTLENBQUMsTUFBUyxFQUFFLFFBQWlCO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQ25CLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFFckIsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7b0JBQ3JCLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7b0JBQ25ELE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7aUJBQ25DO2dCQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV6RCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM1QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO3dCQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztxQkFDdEQ7aUJBQ0Y7Z0JBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXO3FCQUN2QixJQUFJLENBQ0gsTUFBTSxDQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsRUFDM0MsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FDbkI7cUJBQ0EsU0FBUyxDQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFakUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QixlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN6QztTQUNGO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QjtRQUNELEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzt5SUFuRFUseUJBQXlCOzZIQUF6Qix5QkFBeUIsZ0xBQ1IsZ0JBQWdCLCtGQUxsQyxzRkFBc0Y7MkZBSXJGLHlCQUF5QjtrQkFYckMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixzREFBc0Q7b0JBQ3RELElBQUksRUFBRTt3QkFDSixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLHNGQUFzRjtvQkFDaEcsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN0Qzs4QkFFK0QsS0FBSztzQkFBbEUsU0FBUzt1QkFBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBQYmxNZXRhQ29sdW1uLCBQYmxDb2x1bW5Hcm91cCwgaXNQYmxDb2x1bW5Hcm91cCB9IGZyb20gJy4uL2NvbHVtbi9tb2RlbCc7XG5pbXBvcnQgeyBNZXRhQ2VsbENvbnRleHQgfSBmcm9tICcuLi9jb250ZXh0L2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uRGVmIH0gZnJvbSAnLi4vY29sdW1uL2RpcmVjdGl2ZXMvY29sdW1uLWRlZic7XG5pbXBvcnQgeyBhcHBseVNvdXJjZVdpZHRoLCBpbml0Q2VsbEVsZW1lbnQsIGluaXRDZWxsSGVhZGVyRm9vdGVyIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBQYmxOZ3JpZEJhc2VDZWxsIH0gZnJvbSAnLi9iYXNlLWNlbGwnO1xuXG5jb25zdCBIRUFERVJfR1JPVVBfQ1NTID0gYHBibC1oZWFkZXItZ3JvdXAtY2VsbGA7XG5jb25zdCBIRUFERVJfR1JPVVBfUExBQ0VfSE9MREVSX0NTUyA9IGBwYmwtaGVhZGVyLWdyb3VwLWNlbGwtcGxhY2Vob2xkZXJgO1xuXG4vKipcbiAqIEhlYWRlciBjZWxsIGNvbXBvbmVudC5cbiAqIFRoZSBoZWFkZXIgY2VsbCBjb21wb25lbnQgd2lsbCByZW5kZXIgdGhlIGhlYWRlciBjZWxsIHRlbXBsYXRlIGFuZCBhZGQgdGhlIHByb3BlciBjbGFzc2VzIGFuZCByb2xlLlxuICpcbiAqIEl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGFuZCBtYW5hZ2luZyB0aGUgYW55IGBkYXRhSGVhZGVyRXh0ZW5zaW9uc2AgcmVnaXN0ZXJlZCBpbiB0aGUgcmVnaXN0cnkuXG4gKiBUaGVzZSBleHRlbnNpb25zIGFkZCBmZWF0dXJlcyB0byB0aGUgY2VsbHMgZWl0aGVyIGFzIGEgdGVtcGxhdGUgaW5zdGFuY2Ugb3IgYXMgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKiBFeGFtcGxlczogU29ydGluZyBiZWhhdmlvciwgZHJhZyZkcm9wL3Jlc2l6ZSBoYW5kbGVycywgbWVudXMgZXRjLi4uXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZC1tZXRhLWNlbGwnLFxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgaG9zdDoge1xuICAgIHJvbGU6ICdjZWxsJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICduZ3JpZE1ldGFDZWxsJyxcbiAgdGVtcGxhdGU6IGA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiY29sdW1uPy50ZW1wbGF0ZTsgY29udGV4dDogY2VsbEN0eFwiPjwvbmctY29udGFpbmVyPmAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZE1ldGFDZWxsQ29tcG9uZW50PFQgZXh0ZW5kcyBQYmxNZXRhQ29sdW1uIHwgUGJsQ29sdW1uR3JvdXAgPSBQYmxNZXRhQ29sdW1uIHwgUGJsQ29sdW1uR3JvdXA+IGV4dGVuZHMgUGJsTmdyaWRCYXNlQ2VsbCB7XG4gIEBWaWV3Q2hpbGQoJ3ZjUmVmJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSkgdmNSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgY29sdW1uOiBUO1xuICBjZWxsQ3R4OiBNZXRhQ2VsbENvbnRleHQ8YW55LCBQYmxNZXRhQ29sdW1uPjtcblxuICBnZXQgY29sdW1uRGVmKCk6IFBibE5ncmlkQ29sdW1uRGVmPFBibE1ldGFDb2x1bW4+IHsgcmV0dXJuIHRoaXMuY29sdW1uLmNvbHVtbkRlZjsgfVxuICBnZXQgZ3JpZCgpOiBfUGJsTmdyaWRDb21wb25lbnQgeyByZXR1cm4gdGhpcy5leHRBcGkuZ3JpZDsgfVxuXG4gIHNldENvbHVtbihjb2x1bW46IFQsIGlzRm9vdGVyOiBib29sZWFuKSB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuY29sdW1uO1xuICAgIGlmIChwcmV2ICE9PSBjb2x1bW4pIHtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHVucngua2lsbCh0aGlzLCBwcmV2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG5cbiAgICAgIGlmIChjb2x1bW4pIHtcbiAgICAgICAgaWYgKCFjb2x1bW4uY29sdW1uRGVmKSB7XG4gICAgICAgICAgbmV3IFBibE5ncmlkQ29sdW1uRGVmKHRoaXMuZXh0QXBpKS5jb2x1bW4gPSBjb2x1bW47XG4gICAgICAgICAgY29sdW1uLmNvbHVtbkRlZi5uYW1lID0gY29sdW1uLmlkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jZWxsQ3R4ID0gTWV0YUNlbGxDb250ZXh0LmNyZWF0ZShjb2x1bW4sIHRoaXMuZ3JpZCk7XG5cbiAgICAgICAgaWYgKGlzUGJsQ29sdW1uR3JvdXAoY29sdW1uKSkge1xuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZChIRUFERVJfR1JPVVBfQ1NTKTtcbiAgICAgICAgICBpZiAoY29sdW1uLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoSEVBREVSX0dST1VQX1BMQUNFX0hPTERFUl9DU1MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbHVtbkRlZi53aWR0aENoYW5nZVxuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgZmlsdGVyKCBldmVudCA9PiBldmVudC5yZWFzb24gIT09ICdyZXNpemUnKSxcbiAgICAgICAgICAgIHVucngodGhpcywgY29sdW1uKSxcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSggZXZlbnQgPT4gdGhpcy5jb2x1bW5EZWYuYXBwbHlTb3VyY2VXaWR0aCh0aGlzLmVsKSk7XG5cbiAgICAgICAgYXBwbHlTb3VyY2VXaWR0aC5jYWxsKHRoaXMpO1xuICAgICAgICBpbml0Q2VsbEVsZW1lbnQodGhpcy5lbCwgY29sdW1uKTtcbiAgICAgICAgaW5pdENlbGxIZWFkZXJGb290ZXIodGhpcy5lbCwgaXNGb290ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmNvbHVtbikge1xuICAgICAgdW5yeCh0aGlzLCB0aGlzLmNvbHVtbik7XG4gICAgfVxuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==