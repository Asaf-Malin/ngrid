import { Directive, Input, IterableDiffers } from '@angular/core';
import { PblNgridPluginController } from '../../ext/plugin-control';
import * as i0 from "@angular/core";
import * as i1 from "../../ext/plugin-control";
export class PblNgridHideColumns {
    constructor(pluginCtrl, differs) {
        this.pluginCtrl = pluginCtrl;
        this.differs = differs;
        this.columnStore = pluginCtrl.extApi.columnStore;
    }
    set hideColumns(value) {
        this.hidden = value;
        this.dirty = true;
    }
    ngDoCheck() {
        if (this.dirty) {
            this.dirty = false;
            const value = this.hidden;
            if (!this.differ && value) {
                try {
                    this.differ = this.differs.find(value).create();
                }
                catch (e) {
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error(`Cannot find a differ supporting object '${value}. hideColumns only supports binding to Iterables such as Arrays.`);
                    }
                    return;
                }
            }
        }
        if (this.differ) {
            const hideColumns = this.hidden || [];
            const changes = this.differ.diff(hideColumns);
            if (changes) {
                const hide = [];
                const show = [];
                changes.forEachOperation((record, previousIndex, currentIndex) => {
                    if (record.previousIndex == null) {
                        hide.push(record.item);
                    }
                    else if (currentIndex == null) {
                        show.push(record.item);
                    }
                });
                this.columnStore.updateColumnVisibility(hide, show);
            }
            if (!this.hidden) {
                this.differ = undefined;
            }
        }
    }
}
/** @nocollapse */ PblNgridHideColumns.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHideColumns, deps: [{ token: i1.PblNgridPluginController }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHideColumns.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHideColumns, selector: "pbl-ngrid[hideColumns]", inputs: { hideColumns: "hideColumns" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHideColumns, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pbl-ngrid[hideColumns]'
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridPluginController }, { type: i0.IterableDiffers }]; }, propDecorators: { hideColumns: [{
                type: Input,
                args: ['hideColumns']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlkZS1jb2x1bW5zLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2ZlYXR1cmVzL2hpZGUtY29sdW1ucy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQTJCLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7O0FBTXBFLE1BQU0sT0FBTyxtQkFBbUI7SUFZOUIsWUFBNkIsVUFBb0MsRUFBbUIsT0FBd0I7UUFBL0UsZUFBVSxHQUFWLFVBQVUsQ0FBMEI7UUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDMUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNuRCxDQUFDO0lBWkQsSUFBMEIsV0FBVyxDQUFDLEtBQWU7UUFDbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQVdELFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSTtvQkFDRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNqRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUU7d0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLEtBQUssa0VBQWtFLENBQUMsQ0FBQztxQkFDckk7b0JBQ0QsT0FBTztpQkFDUjthQUNGO1NBQ0Y7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUN0QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5QyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxNQUFNLElBQUksR0FBYSxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sSUFBSSxHQUFhLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsRUFBRTtvQkFDL0QsSUFBSSxNQUFNLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTt3QkFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3hCO3lCQUFNLElBQUksWUFBWSxJQUFJLElBQUksRUFBRTt3QkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3hCO2dCQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3pCO1NBQ0Y7SUFDSCxDQUFDOzttSUFsRFUsbUJBQW1CO3VIQUFuQixtQkFBbUI7MkZBQW5CLG1CQUFtQjtrQkFIL0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2lCQUNuQzs2SUFHMkIsV0FBVztzQkFBcEMsS0FBSzt1QkFBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgRG9DaGVjaywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyIH0gZnJvbSAnLi4vLi4vZXh0L3BsdWdpbi1jb250cm9sJztcbmltcG9ydCB7IFBibENvbHVtblN0b3JlIH0gZnJvbSAnLi4vY29sdW1uL21hbmFnZW1lbnQnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWRbaGlkZUNvbHVtbnNdJ1xufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZEhpZGVDb2x1bW5zIGltcGxlbWVudHMgRG9DaGVjayB7XG5cbiAgQElucHV0KCdoaWRlQ29sdW1ucycpIHNldCBoaWRlQ29sdW1ucyh2YWx1ZTogc3RyaW5nW10pIHtcbiAgICB0aGlzLmhpZGRlbiA9IHZhbHVlO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXJ0eTogYm9vbGVhbjtcbiAgcHJpdmF0ZSBoaWRkZW46IHN0cmluZ1tdO1xuICBwcml2YXRlIGRpZmZlcjogSXRlcmFibGVEaWZmZXI8c3RyaW5nPjtcbiAgcHJpdmF0ZSByZWFkb25seSBjb2x1bW5TdG9yZTogUGJsQ29sdW1uU3RvcmU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBwbHVnaW5DdHJsOiBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIHByaXZhdGUgcmVhZG9ubHkgZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7XG4gICAgdGhpcy5jb2x1bW5TdG9yZSA9IHBsdWdpbkN0cmwuZXh0QXBpLmNvbHVtblN0b3JlO1xuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaGlkZGVuO1xuICAgICAgaWYgKCF0aGlzLmRpZmZlciAmJiB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuZGlmZmVyID0gdGhpcy5kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0uIGhpZGVDb2x1bW5zIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5kaWZmZXIpIHtcbiAgICAgIGNvbnN0IGhpZGVDb2x1bW5zID0gdGhpcy5oaWRkZW4gfHwgW107XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5kaWZmZXIuZGlmZihoaWRlQ29sdW1ucyk7XG4gICAgICBpZiAoY2hhbmdlcykge1xuICAgICAgICBjb25zdCBoaWRlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBzaG93OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oKHJlY29yZCwgcHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKHJlY29yZC5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGhpZGUucHVzaChyZWNvcmQuaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgc2hvdy5wdXNoKHJlY29yZC5pdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbHVtblN0b3JlLnVwZGF0ZUNvbHVtblZpc2liaWxpdHkoaGlkZSwgc2hvdyk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaGlkZGVuKSB7XG4gICAgICAgIHRoaXMuZGlmZmVyID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19