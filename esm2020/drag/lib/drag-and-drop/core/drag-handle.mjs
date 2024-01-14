import { Directive, ElementRef, Optional, Inject, SkipSelf, } from '@angular/core';
import { CDK_DRAG_HANDLE, CdkDragHandle, CDK_DRAG_PARENT } from '@angular/cdk/drag-drop';
import * as i0 from "@angular/core";
/** Handle that can be used to drag and CdkDrag instance. */
export class PblDragHandle extends CdkDragHandle {
    constructor(element, parentDrag) {
        super(element, parentDrag);
        this.element = element;
    }
}
/** @nocollapse */ PblDragHandle.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragHandle, deps: [{ token: i0.ElementRef }, { token: CDK_DRAG_PARENT, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblDragHandle.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblDragHandle, selector: "[pblDragHandle]", host: { classAttribute: "cdk-drag-handle" }, providers: [
        {
            provide: CDK_DRAG_HANDLE,
            useExisting: PblDragHandle
        }
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblDragHandle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblDragHandle]',
                    host: {
                        'class': 'cdk-drag-handle'
                    },
                    providers: [
                        {
                            provide: CDK_DRAG_HANDLE,
                            useExisting: PblDragHandle
                        }
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_DRAG_PARENT]
                }, {
                    type: Optional
                }, {
                    type: SkipSelf
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2RyYWcvc3JjL2xpYi9kcmFnLWFuZC1kcm9wL2NvcmUvZHJhZy1oYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7O0FBRXpGLDREQUE0RDtBQWE1RCxNQUFNLE9BQU8sYUFBYyxTQUFRLGFBQWE7SUFDOUMsWUFBbUIsT0FBZ0MsRUFDVSxVQUFnQjtRQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFEekYsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7SUFDMEQsQ0FBQzs7NkhBRm5HLGFBQWEsNENBRUosZUFBZTtpSEFGeEIsYUFBYSx1RkFQYjtRQUNUO1lBQ0UsT0FBTyxFQUFFLGVBQWU7WUFDeEIsV0FBVyxFQUFFLGFBQWE7U0FDM0I7S0FDRjsyRkFFVSxhQUFhO2tCQVp6QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsaUJBQWlCO3FCQUMzQjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGVBQWU7NEJBQ3hCLFdBQVcsZUFBZTt5QkFDM0I7cUJBQ0Y7aUJBQ0Y7OzBCQUdjLE1BQU07MkJBQUMsZUFBZTs7MEJBQUcsUUFBUTs7MEJBQUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgT3B0aW9uYWwsXG4gIEluamVjdCxcbiAgU2tpcFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ0RLX0RSQUdfSEFORExFLCBDZGtEcmFnSGFuZGxlLCBDREtfRFJBR19QQVJFTlQgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuLyoqIEhhbmRsZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYWcgYW5kIENka0RyYWcgaW5zdGFuY2UuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGJsRHJhZ0hhbmRsZV0nLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6dXNlLWhvc3QtcHJvcGVydHktZGVjb3JhdG9yXG4gICAgJ2NsYXNzJzogJ2Nkay1kcmFnLWhhbmRsZSdcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQ0RLX0RSQUdfSEFORExFLFxuICAgICAgdXNlRXhpc3Rpbmc6IFBibERyYWdIYW5kbGVcbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUGJsRHJhZ0hhbmRsZSBleHRlbmRzIENka0RyYWdIYW5kbGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIEBJbmplY3QoQ0RLX0RSQUdfUEFSRU5UKSBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwYXJlbnREcmFnPzogYW55KSB7IHN1cGVyKGVsZW1lbnQsIHBhcmVudERyYWcpOyB9XG59XG4iXX0=