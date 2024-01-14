// tslint:disable:use-host-property-decorator
import { Directive, TemplateRef } from '@angular/core';
import { PblNgridComponent } from '../ngrid.component';
import * as i0 from "@angular/core";
import * as i1 from "../ngrid.component";
/**
 * A directive that marks the template as a projected section inside the grid.
 * The location of the project content is set by the position input.
 *
 * Note that this directive can only be set as the content inside the grid.
 */
export class PblNgridOuterSectionDirective {
    constructor(grid, tRef) {
        this.grid = grid;
        this.tRef = tRef;
    }
    ngAfterViewInit() {
        this.grid.createView(this.position === 'bottom' ? 'beforeContent' : 'beforeTable', this.tRef);
    }
}
/** @nocollapse */ PblNgridOuterSectionDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOuterSectionDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridOuterSectionDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridOuterSectionDirective, selector: "[pblNgridOuterSection]", inputs: { position: ["pblNgridOuterSection", "position"] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOuterSectionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridOuterSection]',
                    inputs: ['position:pblNgridOuterSection'] // tslint:disable-line:use-input-property-decorator
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.TemplateRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2RpcmVjdGl2ZXMvZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw2Q0FBNkM7QUFDN0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDOzs7QUFFdkQ7Ozs7O0dBS0c7QUFLSCxNQUFNLE9BQU8sNkJBQTZCO0lBSXhDLFlBQW9CLElBQTRCLEVBQVUsSUFBd0Q7UUFBOUYsU0FBSSxHQUFKLElBQUksQ0FBd0I7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFvRDtJQUFJLENBQUM7SUFFdkgsZUFBZTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEcsQ0FBQzs7NklBUlUsNkJBQTZCO2lJQUE3Qiw2QkFBNkI7MkZBQTdCLDZCQUE2QjtrQkFKekMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsd0JBQXdCO29CQUNsQyxNQUFNLEVBQUUsQ0FBRSwrQkFBK0IsQ0FBRSxDQUFDLG1EQUFtRDtpQkFDaEciLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0c2xpbnQ6ZGlzYWJsZTp1c2UtaG9zdC1wcm9wZXJ0eS1kZWNvcmF0b3JcbmltcG9ydCB7IERpcmVjdGl2ZSwgVGVtcGxhdGVSZWYsIEFmdGVyVmlld0luaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi9uZ3JpZC5jb21wb25lbnQnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgbWFya3MgdGhlIHRlbXBsYXRlIGFzIGEgcHJvamVjdGVkIHNlY3Rpb24gaW5zaWRlIHRoZSBncmlkLlxuICogVGhlIGxvY2F0aW9uIG9mIHRoZSBwcm9qZWN0IGNvbnRlbnQgaXMgc2V0IGJ5IHRoZSBwb3NpdGlvbiBpbnB1dC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBkaXJlY3RpdmUgY2FuIG9ubHkgYmUgc2V0IGFzIHRoZSBjb250ZW50IGluc2lkZSB0aGUgZ3JpZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkT3V0ZXJTZWN0aW9uXScsXG4gIGlucHV0czogWyAncG9zaXRpb246cGJsTmdyaWRPdXRlclNlY3Rpb24nIF0gLy8gdHNsaW50OmRpc2FibGUtbGluZTp1c2UtaW5wdXQtcHJvcGVydHktZGVjb3JhdG9yXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkT3V0ZXJTZWN0aW9uRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgcG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbSc7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taW5wdXQtcmVuYW1lXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+LCBwcml2YXRlIHRSZWY6IFRlbXBsYXRlUmVmPHsgJGltcGxpY2l0OiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+IH0+KSB7IH1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5ncmlkLmNyZWF0ZVZpZXcodGhpcy5wb3NpdGlvbiA9PT0gJ2JvdHRvbScgPyAnYmVmb3JlQ29udGVudCcgOiAnYmVmb3JlVGFibGUnLCB0aGlzLnRSZWYpO1xuICB9XG59XG4iXX0=