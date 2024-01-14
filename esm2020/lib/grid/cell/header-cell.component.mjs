// tslint:disable:use-host-property-decorator
// tslint:disable:directive-selector
import { first, filter } from 'rxjs/operators';
import { Component, ElementRef, ChangeDetectionStrategy, ViewEncapsulation, ViewContainerRef, ViewChild, NgZone, Inject, } from '@angular/core';
import { unrx } from '@asafmalin/ngrid/core';
import { EXT_API_TOKEN } from '../../ext/grid-ext-api';
import { PblNgridDataHeaderExtensionContext, PblNgridMultiComponentRegistry, PblNgridMultiTemplateRegistry } from '../registry';
import { applySourceWidth, applyWidth, initCellElement } from './utils';
import { PblNgridBaseCell } from './base-cell';
import { PblColumnSizeObserver } from '../features/column-size-observer/column-size-observer';
import * as i0 from "@angular/core";
const lastDataHeaderExtensions = new Map();
/**
 * Header cell component.
 * The header cell component will render the header cell template and add the proper classes and role.
 *
 * It is also responsible for creating and managing the any `dataHeaderExtensions` registered in the registry.
 * These extensions add features to the cells either as a template instance or as a component instance.
 * Examples: Sorting behavior, drag&drop/resize handlers, menus etc...
 */
export class PblNgridHeaderCellComponent extends PblNgridBaseCell {
    constructor(extApi, elementRef, zone) {
        super(extApi, elementRef);
        this.zone = zone;
    }
    get columnDef() { return this.column?.columnDef; }
    get grid() { return this.extApi.grid; }
    setColumn(column, gridWidthRow) {
        const prev = this.column;
        if (prev !== column) {
            if (prev) {
                unrx.kill(this, prev);
            }
            this.column = column;
            let predicate;
            let view;
            let widthUpdater;
            widthUpdater = gridWidthRow ? applySourceWidth : applyWidth;
            predicate = event => (!gridWidthRow && event.reason !== 'update') || (gridWidthRow && event.reason !== 'resize');
            view = !gridWidthRow ? this.initMainHeaderColumnView(column) : undefined;
            if (gridWidthRow && !this.resizeObserver) {
                this.resizeObserver = new PblColumnSizeObserver(this.el, this.extApi);
            }
            this.columnDef.widthChange
                .pipe(filter(predicate), unrx(this, column))
                .subscribe(widthUpdater.bind(this));
            if (view) {
                view.detectChanges();
            }
            widthUpdater.call(this);
            initCellElement(this.el, column);
        }
    }
    updateSize() {
        if (this.resizeObserver) {
            this.resizeObserver.updateSize();
        }
    }
    ngAfterViewInit() {
        if (this.resizeObserver) {
            this.resizeObserver.column = this.column;
        }
    }
    ngOnDestroy() {
        this.resizeObserver?.destroy();
        if (this.column) {
            unrx(this, this.column);
        }
        super.ngOnDestroy();
    }
    initMainHeaderColumnView(col) {
        this.cellCtx = PblNgridDataHeaderExtensionContext.createDateHeaderCtx(this, this.vcRef.injector);
        const context = this.cellCtx;
        const view = this.vcRef.createEmbeddedView(col.headerCellTpl, context);
        this.zone.onStable
            .pipe(first())
            .subscribe(() => {
            this.runHeaderExtensions(context, view);
            const v = this.vcRef.get(0);
            // at this point the view might get destroyed, its possible...
            if (!v.destroyed) {
                v.detectChanges();
            }
        });
        return view;
    }
    runHeaderExtensions(context, view) {
        // we collect the first header extension for each unique name only once per grid instance
        let extensions = lastDataHeaderExtensions.get(this.grid);
        if (!extensions) {
            const dataHeaderExtensions = new Map();
            this.grid.registry.forMulti('dataHeaderExtensions', values => {
                for (const value of values) {
                    if (!dataHeaderExtensions.has(value.name)) {
                        dataHeaderExtensions.set(value.name, value);
                    }
                }
            });
            extensions = Array.from(dataHeaderExtensions.values());
            lastDataHeaderExtensions.set(this.grid, extensions);
            // destroy it on the next turn, we know all cells will render on the same turn.
            this.zone.onStable.pipe(first()).subscribe(() => lastDataHeaderExtensions.delete(this.grid));
        }
        let { rootNodes } = view;
        for (const ext of extensions) {
            if (!ext.shouldRender || ext.shouldRender(context)) {
                if (ext instanceof PblNgridMultiTemplateRegistry) {
                    const extView = this.vcRef.createEmbeddedView(ext.tRef, context);
                    extView.markForCheck();
                }
                else if (ext instanceof PblNgridMultiComponentRegistry) {
                    rootNodes = this.createComponent(ext, context, rootNodes);
                }
            }
        }
    }
    createComponent(ext, context, rootNodes) {
        const factory = ext.getFactory(context);
        const projectedContent = [];
        if (ext.projectContent) {
            projectedContent.push(rootNodes);
        }
        const cmpRef = this.vcRef.createComponent(factory, this.vcRef.length, null, projectedContent);
        if (ext.projectContent) {
            rootNodes = [cmpRef.location.nativeElement];
        }
        if (ext.onCreated) {
            ext.onCreated(context, cmpRef);
        }
        return rootNodes;
    }
}
/** @nocollapse */ PblNgridHeaderCellComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellComponent, deps: [{ token: EXT_API_TOKEN }, { token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridHeaderCellComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderCellComponent, selector: "pbl-ngrid-header-cell", host: { attributes: { "role": "columnheader" }, classAttribute: "cdk-header-cell pbl-ngrid-header-cell" }, viewQueries: [{ propertyName: "vcRef", first: true, predicate: ["vcRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["ngridHeaderCell"], usesInheritance: true, ngImport: i0, template: `<ng-container #vcRef></ng-container>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderCellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-header-cell',
                    // tslint:disable-next-line: no-host-metadata-property
                    host: {
                        class: 'cdk-header-cell pbl-ngrid-header-cell',
                        role: 'columnheader',
                    },
                    exportAs: 'ngridHeaderCell',
                    template: `<ng-container #vcRef></ng-container>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }, { type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { vcRef: [{
                type: ViewChild,
                args: ['vcRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLWNlbGwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvY2VsbC9oZWFkZXItY2VsbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBQzdDLG9DQUFvQztBQUNwQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFHTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFDVCxNQUFNLEVBRU4sTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxJQUFJLEVBQTRCLE1BQU0sb0JBQW9CLENBQUM7QUFHcEUsT0FBTyxFQUFFLGFBQWEsRUFBZ0MsTUFBTSx3QkFBd0IsQ0FBQztBQUdyRixPQUFPLEVBQUUsa0NBQWtDLEVBQUUsOEJBQThCLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFaEksT0FBTyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFDOztBQUU5RixNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUEwRSxDQUFDO0FBRW5IOzs7Ozs7O0dBT0c7QUFhSCxNQUFNLE9BQU8sMkJBQXVELFNBQVEsZ0JBQWdCO0lBVzFGLFlBQW1DLE1BQW9DLEVBQzNELFVBQXNCLEVBQ2QsSUFBWTtRQUM5QixLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRFIsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUVoQyxDQUFDO0lBVEQsSUFB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QyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTlGLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBRTtZQUN0QixTQUFTLEdBQUcsQ0FBRSxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBRSxDQUFDO1NBQy9DO1FBRUQsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzs7MklBNUlVLDJCQUEyQixrQkFXbEIsYUFBYTsrSEFYdEIsMkJBQTJCLG1QQUNWLGdCQUFnQixpR0FMbEMsc0NBQXNDOzJGQUlyQywyQkFBMkI7a0JBWnZDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsc0RBQXNEO29CQUN0RCxJQUFJLEVBQUU7d0JBQ0osS0FBSyxFQUFFLHVDQUF1Qzt3QkFDOUMsSUFBSSxFQUFFLGNBQWM7cUJBQ3JCO29CQUNELFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLFFBQVEsRUFBRSxzQ0FBc0M7b0JBQ2hELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO29CQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtpQkFDdEM7OzBCQVljLE1BQU07MkJBQUMsYUFBYTswRkFWNkIsS0FBSztzQkFBbEUsU0FBUzt1QkFBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOnVzZS1ob3N0LXByb3BlcnR5LWRlY29yYXRvclxuLy8gdHNsaW50OmRpc2FibGU6ZGlyZWN0aXZlLXNlbGVjdG9yXG5pbXBvcnQgeyBmaXJzdCwgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgT25EZXN0cm95LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0NoaWxkLFxuICBOZ1pvbmUsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgSW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IHVucngsIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IF9QYmxOZ3JpZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3Rva2Vucyc7XG5pbXBvcnQgeyBFWFRfQVBJX1RPS0VOLCBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5pbXBvcnQgeyBDT0xVTU4sIFBibE1ldGFDb2x1bW4sIFBibENvbHVtbiB9IGZyb20gJy4uL2NvbHVtbi9tb2RlbCc7XG5pbXBvcnQgeyBNZXRhQ2VsbENvbnRleHQsIFBibE5ncmlkTWV0YUNlbGxDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9pbmRleCc7XG5pbXBvcnQgeyBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0LCBQYmxOZ3JpZE11bHRpQ29tcG9uZW50UmVnaXN0cnksIFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnLi4vcmVnaXN0cnknO1xuaW1wb3J0IHsgUGJsTmdyaWRDb2x1bW5EZWYsIFdpZHRoQ2hhbmdlRXZlbnQgfSBmcm9tICcuLi9jb2x1bW4vZGlyZWN0aXZlcy9jb2x1bW4tZGVmJztcbmltcG9ydCB7IGFwcGx5U291cmNlV2lkdGgsIGFwcGx5V2lkdGgsIGluaXRDZWxsRWxlbWVudCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgUGJsTmdyaWRCYXNlQ2VsbCB9IGZyb20gJy4vYmFzZS1jZWxsJztcbmltcG9ydCB7IFBibENvbHVtblNpemVPYnNlcnZlciB9IGZyb20gJy4uL2ZlYXR1cmVzL2NvbHVtbi1zaXplLW9ic2VydmVyL2NvbHVtbi1zaXplLW9ic2VydmVyJztcblxuY29uc3QgbGFzdERhdGFIZWFkZXJFeHRlbnNpb25zID0gbmV3IE1hcDxfUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcFsnZGF0YUhlYWRlckV4dGVuc2lvbnMnXVtdPigpO1xuXG4vKipcbiAqIEhlYWRlciBjZWxsIGNvbXBvbmVudC5cbiAqIFRoZSBoZWFkZXIgY2VsbCBjb21wb25lbnQgd2lsbCByZW5kZXIgdGhlIGhlYWRlciBjZWxsIHRlbXBsYXRlIGFuZCBhZGQgdGhlIHByb3BlciBjbGFzc2VzIGFuZCByb2xlLlxuICpcbiAqIEl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGFuZCBtYW5hZ2luZyB0aGUgYW55IGBkYXRhSGVhZGVyRXh0ZW5zaW9uc2AgcmVnaXN0ZXJlZCBpbiB0aGUgcmVnaXN0cnkuXG4gKiBUaGVzZSBleHRlbnNpb25zIGFkZCBmZWF0dXJlcyB0byB0aGUgY2VsbHMgZWl0aGVyIGFzIGEgdGVtcGxhdGUgaW5zdGFuY2Ugb3IgYXMgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKiBFeGFtcGxlczogU29ydGluZyBiZWhhdmlvciwgZHJhZyZkcm9wL3Jlc2l6ZSBoYW5kbGVycywgbWVudXMgZXRjLi4uXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BibC1uZ3JpZC1oZWFkZXItY2VsbCcsXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICBob3N0OiB7XG4gICAgY2xhc3M6ICdjZGstaGVhZGVyLWNlbGwgcGJsLW5ncmlkLWhlYWRlci1jZWxsJyxcbiAgICByb2xlOiAnY29sdW1uaGVhZGVyJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICduZ3JpZEhlYWRlckNlbGwnLFxuICB0ZW1wbGF0ZTogYDxuZy1jb250YWluZXIgI3ZjUmVmPjwvbmctY29udGFpbmVyPmAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQ8VCBleHRlbmRzIENPTFVNTiA9IENPTFVNTj4gZXh0ZW5kcyBQYmxOZ3JpZEJhc2VDZWxsIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZCgndmNSZWYnLCB7IHJlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZSB9KSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICBjb2x1bW46IFBibENvbHVtbjtcbiAgY2VsbEN0eDogUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dCB8IE1ldGFDZWxsQ29udGV4dDtcblxuICBnZXQgY29sdW1uRGVmKCk6IFBibE5ncmlkQ29sdW1uRGVmPFBibENvbHVtbj4geyByZXR1cm4gdGhpcy5jb2x1bW4/LmNvbHVtbkRlZjsgfVxuICBnZXQgZ3JpZCgpOiBfUGJsTmdyaWRDb21wb25lbnQgeyByZXR1cm4gdGhpcy5leHRBcGkuZ3JpZDsgfVxuXG4gIHByaXZhdGUgcmVzaXplT2JzZXJ2ZXI6IFBibENvbHVtblNpemVPYnNlcnZlcjtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KEVYVF9BUElfVE9LRU4pIGV4dEFwaTogUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSxcbiAgICAgICAgICAgICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHtcbiAgICBzdXBlcihleHRBcGksIGVsZW1lbnRSZWYpO1xuICB9XG5cbiAgc2V0Q29sdW1uKGNvbHVtbjogUGJsQ29sdW1uLCBncmlkV2lkdGhSb3c6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHByZXYgIT09IGNvbHVtbikge1xuICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgdW5yeC5raWxsKHRoaXMsIHByZXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcblxuICAgICAgbGV0IHByZWRpY2F0ZTogKGV2ZW50OiBXaWR0aENoYW5nZUV2ZW50KSA9PiBib29sZWFuO1xuICAgICAgbGV0IHZpZXc6IEVtYmVkZGVkVmlld1JlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxhbnksIFBibE1ldGFDb2x1bW4gfCBQYmxDb2x1bW4+PlxuICAgICAgbGV0IHdpZHRoVXBkYXRlcjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG4gICAgICB3aWR0aFVwZGF0ZXIgPSBncmlkV2lkdGhSb3cgPyBhcHBseVNvdXJjZVdpZHRoIDogYXBwbHlXaWR0aDtcbiAgICAgIHByZWRpY2F0ZSA9IGV2ZW50ID0+ICghZ3JpZFdpZHRoUm93ICYmIGV2ZW50LnJlYXNvbiAhPT0gJ3VwZGF0ZScpIHx8IChncmlkV2lkdGhSb3cgJiYgZXZlbnQucmVhc29uICE9PSAncmVzaXplJyk7XG4gICAgICB2aWV3ID0gIWdyaWRXaWR0aFJvdyA/IHRoaXMuaW5pdE1haW5IZWFkZXJDb2x1bW5WaWV3KGNvbHVtbikgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAoZ3JpZFdpZHRoUm93ICYmICF0aGlzLnJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUGJsQ29sdW1uU2l6ZU9ic2VydmVyKHRoaXMuZWwsIHRoaXMuZXh0QXBpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jb2x1bW5EZWYud2lkdGhDaGFuZ2VcbiAgICAgICAgLnBpcGUoZmlsdGVyKHByZWRpY2F0ZSksIHVucngodGhpcywgY29sdW1uKSlcbiAgICAgICAgLnN1YnNjcmliZSh3aWR0aFVwZGF0ZXIuYmluZCh0aGlzKSk7XG5cbiAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgIHZpZXcuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuXG4gICAgICB3aWR0aFVwZGF0ZXIuY2FsbCh0aGlzKTtcbiAgICAgIGluaXRDZWxsRWxlbWVudCh0aGlzLmVsLCBjb2x1bW4pO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVNpemUoKSB7XG4gICAgaWYgKHRoaXMucmVzaXplT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIudXBkYXRlU2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICBpZiAodGhpcy5yZXNpemVPYnNlcnZlcikge1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5jb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnJlc2l6ZU9ic2VydmVyPy5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuY29sdW1uKSB7XG4gICAgICB1bnJ4KHRoaXMsIHRoaXMuY29sdW1uKTtcbiAgICB9XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0TWFpbkhlYWRlckNvbHVtblZpZXcoY29sOiBQYmxDb2x1bW4pIHtcbiAgICB0aGlzLmNlbGxDdHggPSBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0LmNyZWF0ZURhdGVIZWFkZXJDdHgodGhpcyBhcyBQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQ8UGJsQ29sdW1uPiwgdGhpcy52Y1JlZi5pbmplY3Rvcik7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuY2VsbEN0eCBhcyBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0O1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLnZjUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhjb2wuaGVhZGVyQ2VsbFRwbCwgY29udGV4dCk7XG4gICAgdGhpcy56b25lLm9uU3RhYmxlXG4gICAgICAucGlwZShmaXJzdCgpKVxuICAgICAgLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICB0aGlzLnJ1bkhlYWRlckV4dGVuc2lvbnMoY29udGV4dCwgdmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8UGJsTmdyaWRNZXRhQ2VsbENvbnRleHQ8YW55LCBQYmxDb2x1bW4+Pik7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLnZjUmVmLmdldCgwKTtcbiAgICAgICAgLy8gYXQgdGhpcyBwb2ludCB0aGUgdmlldyBtaWdodCBnZXQgZGVzdHJveWVkLCBpdHMgcG9zc2libGUuLi5cbiAgICAgICAgaWYgKCF2LmRlc3Ryb3llZCkge1xuICAgICAgICAgIHYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIHByb3RlY3RlZCBydW5IZWFkZXJFeHRlbnNpb25zKGNvbnRleHQ6IFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQsIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxQYmxOZ3JpZE1ldGFDZWxsQ29udGV4dDxhbnksIFBibENvbHVtbj4+KTogdm9pZCB7XG4gICAgLy8gd2UgY29sbGVjdCB0aGUgZmlyc3QgaGVhZGVyIGV4dGVuc2lvbiBmb3IgZWFjaCB1bmlxdWUgbmFtZSBvbmx5IG9uY2UgcGVyIGdyaWQgaW5zdGFuY2VcbiAgICBsZXQgZXh0ZW5zaW9ucyA9IGxhc3REYXRhSGVhZGVyRXh0ZW5zaW9ucy5nZXQodGhpcy5ncmlkKTtcbiAgICBpZiAoIWV4dGVuc2lvbnMpIHtcbiAgICAgIGNvbnN0IGRhdGFIZWFkZXJFeHRlbnNpb25zID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcblxuICAgICAgdGhpcy5ncmlkLnJlZ2lzdHJ5LmZvck11bHRpKCdkYXRhSGVhZGVyRXh0ZW5zaW9ucycsIHZhbHVlcyA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgICAgaWYgKCFkYXRhSGVhZGVyRXh0ZW5zaW9ucy5oYXModmFsdWUubmFtZSkpIHtcbiAgICAgICAgICAgIGRhdGFIZWFkZXJFeHRlbnNpb25zLnNldCh2YWx1ZS5uYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZXh0ZW5zaW9ucyA9IEFycmF5LmZyb20oZGF0YUhlYWRlckV4dGVuc2lvbnMudmFsdWVzKCkpO1xuICAgICAgbGFzdERhdGFIZWFkZXJFeHRlbnNpb25zLnNldCh0aGlzLmdyaWQsIGV4dGVuc2lvbnMpO1xuICAgICAgLy8gZGVzdHJveSBpdCBvbiB0aGUgbmV4dCB0dXJuLCB3ZSBrbm93IGFsbCBjZWxscyB3aWxsIHJlbmRlciBvbiB0aGUgc2FtZSB0dXJuLlxuICAgICAgdGhpcy56b25lLm9uU3RhYmxlLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKCAoKSA9PiBsYXN0RGF0YUhlYWRlckV4dGVuc2lvbnMuZGVsZXRlKHRoaXMuZ3JpZCkgKTtcbiAgICB9XG5cbiAgICBsZXQgeyByb290Tm9kZXMgfSA9IHZpZXc7XG5cbiAgICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgICBpZiAoIWV4dC5zaG91bGRSZW5kZXIgfHwgZXh0LnNob3VsZFJlbmRlcihjb250ZXh0KSkge1xuICAgICAgICBpZiAoZXh0IGluc3RhbmNlb2YgUGJsTmdyaWRNdWx0aVRlbXBsYXRlUmVnaXN0cnkpIHtcbiAgICAgICAgICBjb25zdCBleHRWaWV3ID0gdGhpcy52Y1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcoZXh0LnRSZWYsIGNvbnRleHQpO1xuICAgICAgICAgIGV4dFZpZXcubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0IGluc3RhbmNlb2YgUGJsTmdyaWRNdWx0aUNvbXBvbmVudFJlZ2lzdHJ5KSB7XG4gICAgICAgICAgcm9vdE5vZGVzID0gdGhpcy5jcmVhdGVDb21wb25lbnQoZXh0LCBjb250ZXh0LCByb290Tm9kZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZUNvbXBvbmVudChleHQ6IFBibE5ncmlkTXVsdGlDb21wb25lbnRSZWdpc3RyeTxhbnksIFwiZGF0YUhlYWRlckV4dGVuc2lvbnNcIj4sIGNvbnRleHQ6IFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQsIHJvb3ROb2RlczogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgZmFjdG9yeSA9IGV4dC5nZXRGYWN0b3J5KGNvbnRleHQpO1xuICAgIGNvbnN0IHByb2plY3RlZENvbnRlbnQ6IGFueVtdW10gPSBbXTtcblxuICAgIGlmIChleHQucHJvamVjdENvbnRlbnQpIHtcbiAgICAgIHByb2plY3RlZENvbnRlbnQucHVzaChyb290Tm9kZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNtcFJlZiA9IHRoaXMudmNSZWYuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnksIHRoaXMudmNSZWYubGVuZ3RoLCBudWxsLCBwcm9qZWN0ZWRDb250ZW50KTtcblxuICAgIGlmIChleHQucHJvamVjdENvbnRlbnQpIHtcbiAgICAgIHJvb3ROb2RlcyA9IFsgY21wUmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQgXTtcbiAgICB9XG5cbiAgICBpZiAoZXh0Lm9uQ3JlYXRlZCkge1xuICAgICAgZXh0Lm9uQ3JlYXRlZChjb250ZXh0LCBjbXBSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZXM7XG4gIH1cbn1cbiJdfQ==