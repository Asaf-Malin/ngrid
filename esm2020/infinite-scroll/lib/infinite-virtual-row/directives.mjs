// tslint:disable:use-host-property-decorator
import { Directive, } from '@angular/core';
import { PblNgridRowDef } from '@pebula/ngrid';
import * as i0 from "@angular/core";
export class PblNgridInfiniteVirtualRowRefDirective extends PblNgridRowDef {
    ngOnInit() {
        this.registry.setSingle('infiniteVirtualRow', this);
    }
    ngOnDestroy() {
        this.registry.setSingle('infiniteVirtualRow', undefined);
    }
}
/** @nocollapse */ PblNgridInfiniteVirtualRowRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteVirtualRowRefDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridInfiniteVirtualRowRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridInfiniteVirtualRowRefDirective, selector: "[pblNgridInfiniteVirtualRowDef]", inputs: { columns: ["pblNgridInfiniteVirtualRowDefColumns", "columns"], when: ["pblNgridInfiniteVirtualRowDefWhen", "when"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteVirtualRowRefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridInfiniteVirtualRowDef]',
                    inputs: ['columns: pblNgridInfiniteVirtualRowDefColumns', 'when: pblNgridInfiniteVirtualRowDefWhen'],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvaW5maW5pdGUtc2Nyb2xsL3NyYy9saWIvaW5maW5pdGUtdmlydHVhbC1yb3cvZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw2Q0FBNkM7QUFDN0MsT0FBTyxFQUNMLFNBQVMsR0FHVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQVkvQyxNQUFNLE9BQU8sc0NBQWdELFNBQVEsY0FBaUI7SUFFcEYsUUFBUTtRQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLElBQVcsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQUcsU0FBUyxDQUFDLENBQUM7SUFDNUQsQ0FBQzs7c0pBUlUsc0NBQXNDOzBJQUF0QyxzQ0FBc0M7MkZBQXRDLHNDQUFzQztrQkFKbEQsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsaUNBQWlDO29CQUMzQyxNQUFNLEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSx5Q0FBeUMsQ0FBQztpQkFDckciLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0c2xpbnQ6ZGlzYWJsZTp1c2UtaG9zdC1wcm9wZXJ0eS1kZWNvcmF0b3JcbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZFJvd0RlZiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9jb3JlL2xpYi9yZWdpc3RyeS90eXBlcycge1xuICBpbnRlcmZhY2UgUGJsTmdyaWRTaW5nbGVSZWdpc3RyeU1hcCB7XG4gICAgaW5maW5pdGVWaXJ0dWFsUm93PzogUGJsTmdyaWRJbmZpbml0ZVZpcnR1YWxSb3dSZWZEaXJlY3RpdmU7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BibE5ncmlkSW5maW5pdGVWaXJ0dWFsUm93RGVmXScsXG4gIGlucHV0czogWydjb2x1bW5zOiBwYmxOZ3JpZEluZmluaXRlVmlydHVhbFJvd0RlZkNvbHVtbnMnLCAnd2hlbjogcGJsTmdyaWRJbmZpbml0ZVZpcnR1YWxSb3dEZWZXaGVuJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkSW5maW5pdGVWaXJ0dWFsUm93UmVmRGlyZWN0aXZlPFQgPSBhbnk+IGV4dGVuZHMgUGJsTmdyaWRSb3dEZWY8VD4gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RyeS5zZXRTaW5nbGUoJ2luZmluaXRlVmlydHVhbFJvdycsIHRoaXMgYXMgYW55KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0cnkuc2V0U2luZ2xlKCdpbmZpbml0ZVZpcnR1YWxSb3cnLCAgdW5kZWZpbmVkKTtcbiAgfVxufVxuIl19