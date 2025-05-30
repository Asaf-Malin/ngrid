import { PblNgridMultiComponentRegistry } from '@asafmalin/ngrid';
export class PblNgridOverlayPanelComponentExtension extends PblNgridMultiComponentRegistry {
    constructor(name, component, cfr, injector) {
        super();
        this.component = component;
        this.cfr = cfr;
        this.injector = injector;
        this.kind = 'overlayPanels';
        this.projectContent = false;
        this.name = name;
    }
    getFactory(context) {
        return this.cfr.resolveComponentFactory(this.component);
    }
    onCreated(context, cmpRef) {
        cmpRef.changeDetectorRef.markForCheck();
        cmpRef.changeDetectorRef.detectChanges();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXJlZ2lzdHJ5LWV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvb3ZlcmxheS1wYW5lbC9zcmMvbGliL2NvbXBvbmVudC1yZWdpc3RyeS1leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9ELE1BQU0sT0FBTyxzQ0FBMEMsU0FBUSw4QkFBa0Q7SUFLL0csWUFBWSxJQUFZLEVBQ0wsU0FBa0IsRUFDbEIsR0FBOEIsRUFDOUIsUUFBbUI7UUFDcEMsS0FBSyxFQUFFLENBQUM7UUFIUyxjQUFTLEdBQVQsU0FBUyxDQUFTO1FBQ2xCLFFBQUcsR0FBSCxHQUFHLENBQTJCO1FBQzlCLGFBQVEsR0FBUixRQUFRLENBQVc7UUFON0IsU0FBSSxHQUFvQixlQUFlLENBQUM7UUFDeEMsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFPOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELFVBQVUsQ0FBQyxPQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELFNBQVMsQ0FBQyxPQUFZLEVBQUUsTUFBdUI7UUFDN0MsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IENvbXBvbmVudFJlZiwgVHlwZSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRGYWN0b3J5LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRNdWx0aUNvbXBvbmVudFJlZ2lzdHJ5IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbXBvbmVudEV4dGVuc2lvbjxUPiBleHRlbmRzIFBibE5ncmlkTXVsdGlDb21wb25lbnRSZWdpc3RyeTxULCAnb3ZlcmxheVBhbmVscyc+IHtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBraW5kOiAnb3ZlcmxheVBhbmVscycgPSAnb3ZlcmxheVBhbmVscyc7XG4gIHJlYWRvbmx5IHByb2plY3RDb250ZW50ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgY29tcG9uZW50OiBUeXBlPFQ+LFxuICAgICAgICAgICAgICBwdWJsaWMgY2ZyPzogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgaW5qZWN0b3I/OiBJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGdldEZhY3RvcnkoY29udGV4dDogYW55KTogQ29tcG9uZW50RmFjdG9yeTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIG9uQ3JlYXRlZChjb250ZXh0OiBhbnksIGNtcFJlZjogQ29tcG9uZW50UmVmPFQ+KTogdm9pZCB7XG4gICAgY21wUmVmLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIGNtcFJlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cbn1cbiJdfQ==