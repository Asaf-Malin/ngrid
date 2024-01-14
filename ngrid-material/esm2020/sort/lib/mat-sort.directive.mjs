import { Directive } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ON_INVALIDATE_HEADERS, unrx } from '@asafmalin/ngrid/core';
import { PblNgridComponent, PblNgridPluginController } from '@asafmalin/ngrid';
import * as i0 from "@angular/core";
import * as i1 from "@asafmalin/ngrid";
import * as i2 from "@angular/material/sort";
export const PLUGIN_KEY = 'matSort';
export class PblNgridMatSortDirective {
    constructor(table, pluginCtrl, sort) {
        this.table = table;
        this.pluginCtrl = pluginCtrl;
        this.sort = sort;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        let origin = 'click';
        this.sort.sortChange
            .pipe(unrx(this))
            .subscribe(s => {
            this.onSort(s, origin);
            origin = 'click';
        });
        const handleDataSourceSortChange = (sortChange) => {
            const { column } = sortChange;
            const order = sortChange.sort ? sortChange.sort.order : undefined;
            if (this.sort && column) {
                if (this.sort.active === column.id && this.sort.direction === (order || '')) {
                    return;
                }
                const sortable = this.sort.sortables.get(column.id);
                if (sortable) {
                    origin = 'ds';
                    this.sort.active = undefined;
                    sortable.start = order || 'asc';
                    sortable._handleClick();
                }
            }
            else if (this.sort.active) { // clear mode (hit from code, not click).
                const sortable = this.sort.sortables.get(this.sort.active);
                if (sortable) {
                    if (!sortable.disableClear) {
                        let nextSortDir;
                        while (nextSortDir = this.sort.getNextSortDirection(sortable)) {
                            this.sort.direction = nextSortDir;
                        }
                    }
                    origin = 'ds';
                    sortable._handleClick();
                }
            }
        };
        pluginCtrl.events
            .pipe(ON_INVALIDATE_HEADERS)
            .subscribe(e => {
            const hasActiveSort = this.sort && this.sort.active;
            if (table.ds && table.ds.sort) {
                if (!table.ds.sort.column && hasActiveSort) {
                    this.onSort({ active: this.sort.active, direction: this.sort.direction || 'asc' }, origin);
                }
                else if (table.ds.sort.column && !hasActiveSort) {
                    setTimeout(() => handleDataSourceSortChange(table.ds.sort));
                }
            }
        });
        pluginCtrl.events
            .subscribe(e => {
            if (e.kind === 'onDataSource') {
                unrx.kill(this, e.prev);
                if (this.sort && this.sort.active) {
                    this.onSort({ active: this.sort.active, direction: this.sort.direction || 'asc' }, origin);
                }
                table.ds.sortChange
                    .pipe(unrx(this, e.curr))
                    .subscribe(event => { handleDataSourceSortChange(event); });
            }
        });
    }
    ngOnDestroy() {
        this._removePlugin(this.table);
        unrx.kill(this);
    }
    onSort(sort, origin) {
        const table = this.table;
        const column = table.columnApi.visibleColumns.find(c => c.id === sort.active);
        if (origin !== 'click' || !column || !column.sort) {
            return;
        }
        else {
            const newSort = {};
            const sortFn = typeof column.sort === 'function' && column.sort;
            if (sort.direction) {
                newSort.order = sort.direction;
            }
            if (sortFn) {
                newSort.sortFn = sortFn;
            }
            const currentSort = table.ds.sort;
            if (column === currentSort.column) {
                const _sort = currentSort.sort || {};
                if (newSort.order === _sort.order) {
                    return;
                }
            }
            table.ds.setSort(column, newSort);
        }
    }
}
/** @nocollapse */ PblNgridMatSortDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortDirective, deps: [{ token: i1.PblNgridComponent }, { token: i1.PblNgridPluginController }, { token: i2.MatSort }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMatSortDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMatSortDirective, selector: "pbl-ngrid[matSort]", exportAs: ["pblMatSort"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[matSort]', exportAs: 'pblMatSort' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i1.PblNgridPluginController }, { type: i2.MatSort }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNvcnQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC1tYXRlcmlhbC9zb3J0L3NyYy9saWIvbWF0LXNvcnQuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxFQUFRLE9BQU8sRUFBZ0MsTUFBTSx3QkFBd0IsQ0FBQztBQUVyRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLHdCQUF3QixFQUF5QyxNQUFNLGVBQWUsQ0FBQzs7OztBQU9uSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQWMsU0FBUyxDQUFDO0FBRy9DLE1BQU0sT0FBTyx3QkFBd0I7SUFHbkMsWUFBbUIsS0FBNkIsRUFBVSxVQUFvQyxFQUFTLElBQWE7UUFBakcsVUFBSyxHQUFMLEtBQUssQ0FBd0I7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUEwQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVM7UUFDbEgsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU1RCxJQUFJLE1BQU0sR0FBbUIsT0FBTyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTthQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hCLFNBQVMsQ0FBRSxDQUFDLENBQUMsRUFBRTtZQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sR0FBRyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFTCxNQUFNLDBCQUEwQixHQUFHLENBQUMsVUFBaUMsRUFBRSxFQUFFO1lBQ3ZF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VSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDaEM7WUFDRCxJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzthQUN6QjtZQUNELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2xDLElBQUksTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNyQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssRUFBRTtvQkFDakMsT0FBTztpQkFDUjthQUNGO1lBQ0QsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQzs7d0lBbEdVLHdCQUF3Qjs0SEFBeEIsd0JBQXdCOzJGQUF4Qix3QkFBd0I7a0JBRHBDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTb3J0LCBNYXRTb3J0LCBNYXRTb3J0SGVhZGVyLCBTb3J0RGlyZWN0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCc7XG5cbmltcG9ydCB7IE9OX0lOVkFMSURBVEVfSEVBREVSUywgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbXBvbmVudCwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLCBQYmxOZ3JpZFNvcnREZWZpbml0aW9uLCBQYmxEYXRhU291cmNlIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2xpYi9leHQvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkUGx1Z2luRXh0ZW5zaW9uIHtcbiAgICBtYXRTb3J0PzogUGJsTmdyaWRNYXRTb3J0RGlyZWN0aXZlO1xuICB9XG59XG5leHBvcnQgY29uc3QgUExVR0lOX0tFWTogJ21hdFNvcnQnID0gJ21hdFNvcnQnO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdwYmwtbmdyaWRbbWF0U29ydF0nLCBleHBvcnRBczogJ3BibE1hdFNvcnQnIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRNYXRTb3J0RGlyZWN0aXZlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfcmVtb3ZlUGx1Z2luOiAodGFibGU6IFBibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRhYmxlOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+LCBwcml2YXRlIHBsdWdpbkN0cmw6IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciwgcHVibGljIHNvcnQ6IE1hdFNvcnQpIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4gPSBwbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcblxuICAgIGxldCBvcmlnaW46ICdkcycgfCAnY2xpY2snID0gJ2NsaWNrJztcbiAgICB0aGlzLnNvcnQuc29ydENoYW5nZVxuICAgICAgLnBpcGUodW5yeCh0aGlzKSlcbiAgICAgIC5zdWJzY3JpYmUoIHMgPT4ge1xuICAgICAgICB0aGlzLm9uU29ydChzLCBvcmlnaW4pO1xuICAgICAgICBvcmlnaW4gPSAnY2xpY2snO1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBoYW5kbGVEYXRhU291cmNlU29ydENoYW5nZSA9IChzb3J0Q2hhbmdlOiBQYmxEYXRhU291cmNlWydzb3J0J10pID0+IHtcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBzb3J0Q2hhbmdlO1xuICAgICAgY29uc3Qgb3JkZXIgPSBzb3J0Q2hhbmdlLnNvcnQgPyBzb3J0Q2hhbmdlLnNvcnQub3JkZXIgOiB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh0aGlzLnNvcnQgJiYgY29sdW1uKSB7XG4gICAgICAgIGlmICh0aGlzLnNvcnQuYWN0aXZlID09PSBjb2x1bW4uaWQgJiYgdGhpcy5zb3J0LmRpcmVjdGlvbiA9PT0gKG9yZGVyIHx8ICcnKSkgeyByZXR1cm47IH1cbiAgICAgICAgY29uc3Qgc29ydGFibGU6IE1hdFNvcnRIZWFkZXIgPSB0aGlzLnNvcnQuc29ydGFibGVzLmdldChjb2x1bW4uaWQpIGFzIGFueTtcbiAgICAgICAgaWYgKHNvcnRhYmxlKSB7XG4gICAgICAgICAgb3JpZ2luID0gJ2RzJztcbiAgICAgICAgICB0aGlzLnNvcnQuYWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHNvcnRhYmxlLnN0YXJ0ID0gb3JkZXIgfHwgJ2FzYyc7XG4gICAgICAgICAgc29ydGFibGUuX2hhbmRsZUNsaWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zb3J0LmFjdGl2ZSkgeyAvLyBjbGVhciBtb2RlIChoaXQgZnJvbSBjb2RlLCBub3QgY2xpY2spLlxuICAgICAgICBjb25zdCBzb3J0YWJsZTogTWF0U29ydEhlYWRlciA9IHRoaXMuc29ydC5zb3J0YWJsZXMuZ2V0KHRoaXMuc29ydC5hY3RpdmUpIGFzIGFueTtcbiAgICAgICAgaWYgKHNvcnRhYmxlICkge1xuICAgICAgICAgIGlmICghc29ydGFibGUuZGlzYWJsZUNsZWFyKSB7XG4gICAgICAgICAgICBsZXQgbmV4dFNvcnREaXI6IFNvcnREaXJlY3Rpb247XG4gICAgICAgICAgICB3aGlsZSAobmV4dFNvcnREaXIgPSB0aGlzLnNvcnQuZ2V0TmV4dFNvcnREaXJlY3Rpb24oc29ydGFibGUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc29ydC5kaXJlY3Rpb24gPSBuZXh0U29ydERpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgb3JpZ2luID0gJ2RzJztcbiAgICAgICAgICBzb3J0YWJsZS5faGFuZGxlQ2xpY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBsdWdpbkN0cmwuZXZlbnRzXG4gICAgICAucGlwZShPTl9JTlZBTElEQVRFX0hFQURFUlMpXG4gICAgICAuc3Vic2NyaWJlKCBlID0+IHtcbiAgICAgICAgY29uc3QgaGFzQWN0aXZlU29ydCA9IHRoaXMuc29ydCAmJiB0aGlzLnNvcnQuYWN0aXZlO1xuICAgICAgICBpZiAodGFibGUuZHMgJiYgdGFibGUuZHMuc29ydCkge1xuICAgICAgICAgIGlmICghdGFibGUuZHMuc29ydC5jb2x1bW4gJiYgaGFzQWN0aXZlU29ydCkge1xuICAgICAgICAgICAgdGhpcy5vblNvcnQoeyBhY3RpdmU6IHRoaXMuc29ydC5hY3RpdmUsIGRpcmVjdGlvbjogdGhpcy5zb3J0LmRpcmVjdGlvbiB8fCAnYXNjJyB9LCBvcmlnaW4pO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGFibGUuZHMuc29ydC5jb2x1bW4gJiYgIWhhc0FjdGl2ZVNvcnQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gaGFuZGxlRGF0YVNvdXJjZVNvcnRDaGFuZ2UodGFibGUuZHMuc29ydCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBwbHVnaW5DdHJsLmV2ZW50c1xuICAgICAgLnN1YnNjcmliZSggZSA9PiB7XG4gICAgICAgIGlmIChlLmtpbmQgPT09ICdvbkRhdGFTb3VyY2UnKSB7XG4gICAgICAgICAgdW5yeC5raWxsKHRoaXMsIGUucHJldik7XG4gICAgICAgICAgaWYgKHRoaXMuc29ydCAmJiB0aGlzLnNvcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLm9uU29ydCh7IGFjdGl2ZTogdGhpcy5zb3J0LmFjdGl2ZSwgZGlyZWN0aW9uOiB0aGlzLnNvcnQuZGlyZWN0aW9uIHx8ICdhc2MnIH0sIG9yaWdpbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRhYmxlLmRzLnNvcnRDaGFuZ2VcbiAgICAgICAgICAgIC5waXBlKHVucngodGhpcywgZS5jdXJyKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHsgaGFuZGxlRGF0YVNvdXJjZVNvcnRDaGFuZ2UoZXZlbnQpOyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4odGhpcy50YWJsZSk7XG4gICAgdW5yeC5raWxsKHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblNvcnQoc29ydDogU29ydCwgb3JpZ2luOiAnZHMnIHwgJ2NsaWNrJyk6IHZvaWQge1xuICAgIGNvbnN0IHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICBjb25zdCBjb2x1bW4gPSB0YWJsZS5jb2x1bW5BcGkudmlzaWJsZUNvbHVtbnMuZmluZChjID0+IGMuaWQgPT09IHNvcnQuYWN0aXZlKTtcblxuICAgIGlmICggb3JpZ2luICE9PSAnY2xpY2snIHx8ICFjb2x1bW4gfHwgIWNvbHVtbi5zb3J0ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuZXdTb3J0OiBQYmxOZ3JpZFNvcnREZWZpbml0aW9uID0geyB9O1xuICAgICAgY29uc3Qgc29ydEZuID0gdHlwZW9mIGNvbHVtbi5zb3J0ID09PSAnZnVuY3Rpb24nICYmIGNvbHVtbi5zb3J0O1xuICAgICAgaWYgKHNvcnQuZGlyZWN0aW9uKSB7XG4gICAgICAgIG5ld1NvcnQub3JkZXIgPSBzb3J0LmRpcmVjdGlvbjtcbiAgICAgIH1cbiAgICAgIGlmIChzb3J0Rm4pIHtcbiAgICAgICAgbmV3U29ydC5zb3J0Rm4gPSBzb3J0Rm47XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50U29ydCA9IHRhYmxlLmRzLnNvcnQ7XG4gICAgICBpZiAoY29sdW1uID09PSBjdXJyZW50U29ydC5jb2x1bW4pIHtcbiAgICAgICAgY29uc3QgX3NvcnQgPSBjdXJyZW50U29ydC5zb3J0IHx8IHt9O1xuICAgICAgICBpZiAobmV3U29ydC5vcmRlciA9PT0gX3NvcnQub3JkZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRhYmxlLmRzLnNldFNvcnQoY29sdW1uLCBuZXdTb3J0KTtcbiAgICB9XG4gIH1cblxufVxuIl19