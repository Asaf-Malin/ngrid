import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CdkRow } from '@angular/cdk/table';
import { PblNgridRowComponent } from '@pebula/ngrid';
import * as i0 from "@angular/core";
export const PBL_NGRID_ROW_TEMPLATE = `<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-content></ng-content><ng-content select=".pbl-ngrid-row-suffix"></ng-content>`;
export class PblNgridInfiniteRowComponent extends PblNgridRowComponent {
    canCreateCell() {
        return false;
    }
}
/** @nocollapse */ PblNgridInfiniteRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridInfiniteRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridInfiniteRowComponent, selector: "pbl-ngrid-row[infiniteRow]", host: { attributes: { "role": "row" }, classAttribute: "pbl-ngrid-row" }, providers: [
        { provide: CdkRow, useExisting: PblNgridRowComponent }
    ], exportAs: ["pblNgridInfiniteRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-content></ng-content><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-row[infiniteRow]',
                    template: PBL_NGRID_ROW_TEMPLATE,
                    host: {
                        'class': 'pbl-ngrid-row',
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkRow, useExisting: PblNgridRowComponent }
                    ],
                    exportAs: 'pblNgridInfiniteRow',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9pbmZpbml0ZS1zY3JvbGwvc3JjL2xpYi9pbmZpbml0ZS12aXJ0dWFsLXJvdy9yb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUVyRCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBSSwySUFBMkksQ0FBQztBQWdCbkwsTUFBTSxPQUFPLDRCQUFzQyxTQUFRLG9CQUF1QjtJQUVoRixhQUFhO1FBQ1gsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOzs0SUFKVSw0QkFBNEI7Z0lBQTVCLDRCQUE0QiwrSEFQNUI7UUFDVCxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFO0tBQ3ZEOzJGQUtVLDRCQUE0QjtrQkFkeEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsNEJBQTRCO29CQUN0QyxRQUFRLEVBQUUsc0JBQXNCO29CQUNoQyxJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLGVBQWU7d0JBQ3hCLE1BQU0sRUFBRSxLQUFLO3FCQUNkO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFO3FCQUN2RDtvQkFDRCxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENka1JvdyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZFJvd0NvbXBvbmVudCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5leHBvcnQgY29uc3QgUEJMX05HUklEX1JPV19URU1QTEFURSAgPSBgPG5nLWNvbnRlbnQgc2VsZWN0PVwiLnBibC1uZ3JpZC1yb3ctcHJlZml4XCI+PC9uZy1jb250ZW50PjxuZy1jb250ZW50PjwvbmctY29udGVudD48bmctY29udGVudCBzZWxlY3Q9XCIucGJsLW5ncmlkLXJvdy1zdWZmaXhcIj48L25nLWNvbnRlbnQ+YDtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGJsLW5ncmlkLXJvd1tpbmZpbml0ZVJvd10nLFxuICB0ZW1wbGF0ZTogUEJMX05HUklEX1JPV19URU1QTEFURSxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICAnY2xhc3MnOiAncGJsLW5ncmlkLXJvdycsXG4gICAgJ3JvbGUnOiAncm93JyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgeyBwcm92aWRlOiBDZGtSb3csIHVzZUV4aXN0aW5nOiBQYmxOZ3JpZFJvd0NvbXBvbmVudCB9XG4gIF0sXG4gIGV4cG9ydEFzOiAncGJsTmdyaWRJbmZpbml0ZVJvdycsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZEluZmluaXRlUm93Q29tcG9uZW50PFQgPSBhbnk+IGV4dGVuZHMgUGJsTmdyaWRSb3dDb21wb25lbnQ8VD4ge1xuXG4gIGNhbkNyZWF0ZUNlbGwoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=