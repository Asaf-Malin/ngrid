// tslint:disable:no-output-rename
import { Directive } from '@angular/core';
import { DragDrop, CDK_DROP_LIST, CDK_DROP_LIST_GROUP } from '@angular/cdk/drag-drop';
import { CdkLazyDropList, PblDragDrop } from '../core/index';
import * as i0 from "@angular/core";
let _uniqueIdCounter = 0;
export class PblNgridAggregationContainerDirective extends CdkLazyDropList {
    constructor() {
        super(...arguments);
        this.id = `pbl-ngrid-column-aggregation-container-${_uniqueIdCounter++}`;
        this.orientation = 'horizontal';
    }
    ngOnInit() {
        super.ngOnInit();
        this.pblDropListRef.dropped
            .subscribe(event => {
            const item = event.item;
            this.pending = undefined;
            this.grid.columnApi.addGroupBy(item.data.column);
        });
        this.pblDropListRef.entered
            .subscribe(event => {
            const item = event.item;
            this.pending = item.data.column;
            item.getPlaceholderElement().style.display = 'none';
            for (const c of item.data.getCells()) {
                c.style.display = 'none';
            }
        });
        this.pblDropListRef.exited
            .subscribe(event => {
            const item = event.item;
            this.pending = undefined;
            item.getPlaceholderElement().style.display = '';
            for (const c of item.data.getCells()) {
                c.style.display = '';
            }
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.columnContainer.disconnectFrom(this);
    }
    gridChanged() {
        this.columnContainer = this.gridApi.pluginCtrl.getPlugin('columnReorder');
        this.columnContainer.connectTo(this);
    }
}
/** @nocollapse */ PblNgridAggregationContainerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridAggregationContainerDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridAggregationContainerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridAggregationContainerDirective, selector: "[pblAggregationContainer]", host: { properties: { "id": "id" }, classAttribute: "cdk-drop-list" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
        { provide: CDK_DROP_LIST, useExisting: PblNgridAggregationContainerDirective },
    ], exportAs: ["pblAggregationContainer"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridAggregationContainerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblAggregationContainer]',
                    exportAs: 'pblAggregationContainer',
                    host: {
                        'class': 'cdk-drop-list',
                        '[id]': 'id',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: PblNgridAggregationContainerDirective },
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRpb24tY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvZHJhZy1hbmQtZHJvcC9jb2x1bW4vYWdncmVnYXRpb24tY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtDQUFrQztBQUNsQyxPQUFPLEVBQUUsU0FBUyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHdEYsT0FBTyxFQUFFLGVBQWUsRUFBYyxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBSXpFLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBZXpCLE1BQU0sT0FBTyxxQ0FBK0MsU0FBUSxlQUFrQjtJQWJ0Rjs7UUFjRSxPQUFFLEdBQUcsMENBQTBDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztRQUNwRSxnQkFBVyxHQUE4QixZQUFZLENBQUM7S0E2Q3ZEO0lBdkNDLFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPO2FBQ3hCLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUNsQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBb0QsQ0FBQztZQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTzthQUN4QixTQUFTLENBQUUsS0FBSyxDQUFDLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQW9ELENBQUM7WUFDeEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNwRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3BDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzthQUMxQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNO2FBQ3ZCLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUNsQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBb0QsQ0FBQztZQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUN6QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNoRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3BDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzthQUN0QjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVTLFdBQVc7UUFDbkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7cUpBOUNVLHFDQUFxQzt5SUFBckMscUNBQXFDLDJIQU5yQztRQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFO1FBQy9DLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7UUFDckQsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxxQ0FBcUMsRUFBRTtLQUMvRTsyRkFFVSxxQ0FBcUM7a0JBYmpELFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsUUFBUSxFQUFFLHlCQUF5QjtvQkFDbkMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxlQUFlO3dCQUN4QixNQUFNLEVBQUUsSUFBSTtxQkFDYjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7d0JBQy9DLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7d0JBQ3JELEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLHVDQUF1QyxFQUFFO3FCQUMvRTtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOm5vLW91dHB1dC1yZW5hbWVcbmltcG9ydCB7IERpcmVjdGl2ZSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEcmFnRHJvcCwgQ0RLX0RST1BfTElTVCwgQ0RLX0RST1BfTElTVF9HUk9VUCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IENka0xhenlEcm9wTGlzdCwgUGJsRHJhZ1JlZiwgUGJsRHJhZ0Ryb3AgfSBmcm9tICcuLi9jb3JlL2luZGV4JztcbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uUmVvcmRlclBsdWdpbkRpcmVjdGl2ZSB9IGZyb20gJy4vY29sdW1uLXJlb3JkZXItcGx1Z2luJztcbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uRHJhZ0RpcmVjdGl2ZSB9IGZyb20gJy4vY29sdW1uLWRyYWcnO1xuXG5sZXQgX3VuaXF1ZUlkQ291bnRlciA9IDA7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1twYmxBZ2dyZWdhdGlvbkNvbnRhaW5lcl0nLFxuICBleHBvcnRBczogJ3BibEFnZ3JlZ2F0aW9uQ29udGFpbmVyJyxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICAnY2xhc3MnOiAnY2RrLWRyb3AtbGlzdCcsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IERyYWdEcm9wLCB1c2VFeGlzdGluZzogUGJsRHJhZ0Ryb3AgfSxcbiAgICB7IHByb3ZpZGU6IENES19EUk9QX0xJU1RfR1JPVVAsIHVzZVZhbHVlOiB1bmRlZmluZWQgfSxcbiAgICB7IHByb3ZpZGU6IENES19EUk9QX0xJU1QsIHVzZUV4aXN0aW5nOiBQYmxOZ3JpZEFnZ3JlZ2F0aW9uQ29udGFpbmVyRGlyZWN0aXZlIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQWdncmVnYXRpb25Db250YWluZXJEaXJlY3RpdmU8VCA9IGFueT4gZXh0ZW5kcyBDZGtMYXp5RHJvcExpc3Q8VD4gaW1wbGVtZW50cyBPbkluaXQge1xuICBpZCA9IGBwYmwtbmdyaWQtY29sdW1uLWFnZ3JlZ2F0aW9uLWNvbnRhaW5lci0ke191bmlxdWVJZENvdW50ZXIrK31gO1xuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICdob3Jpem9udGFsJztcblxuICBwZW5kaW5nOiBQYmxDb2x1bW47XG5cbiAgY29sdW1uQ29udGFpbmVyOiBQYmxOZ3JpZENvbHVtblJlb3JkZXJQbHVnaW5EaXJlY3RpdmU7XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICB0aGlzLnBibERyb3BMaXN0UmVmLmRyb3BwZWRcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGV2ZW50Lml0ZW0gYXMgUGJsRHJhZ1JlZjxQYmxOZ3JpZENvbHVtbkRyYWdEaXJlY3RpdmU8YW55Pj47XG4gICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5ncmlkLmNvbHVtbkFwaS5hZGRHcm91cEJ5KGl0ZW0uZGF0YS5jb2x1bW4pO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLnBibERyb3BMaXN0UmVmLmVudGVyZWRcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGV2ZW50Lml0ZW0gYXMgUGJsRHJhZ1JlZjxQYmxOZ3JpZENvbHVtbkRyYWdEaXJlY3RpdmU8YW55Pj47XG4gICAgICAgIHRoaXMucGVuZGluZyA9IGl0ZW0uZGF0YS5jb2x1bW47XG4gICAgICAgIGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCkuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIGl0ZW0uZGF0YS5nZXRDZWxscygpKSB7XG4gICAgICAgICAgYy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIHRoaXMucGJsRHJvcExpc3RSZWYuZXhpdGVkXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBldmVudC5pdGVtIGFzIFBibERyYWdSZWY8UGJsTmdyaWRDb2x1bW5EcmFnRGlyZWN0aXZlPGFueT4+O1xuICAgICAgICB0aGlzLnBlbmRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCkuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICBmb3IgKGNvbnN0IGMgb2YgaXRlbS5kYXRhLmdldENlbGxzKCkpIHtcbiAgICAgICAgICBjLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuY29sdW1uQ29udGFpbmVyLmRpc2Nvbm5lY3RGcm9tKHRoaXMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdyaWRDaGFuZ2VkKCkge1xuICAgIHRoaXMuY29sdW1uQ29udGFpbmVyID0gdGhpcy5ncmlkQXBpLnBsdWdpbkN0cmwuZ2V0UGx1Z2luKCdjb2x1bW5SZW9yZGVyJyk7XG4gICAgdGhpcy5jb2x1bW5Db250YWluZXIuY29ubmVjdFRvKHRoaXMpO1xuICB9XG59XG4iXX0=