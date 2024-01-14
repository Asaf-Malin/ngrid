import { ComponentFactoryResolver } from '@angular/core';
import { ON_DESTROY } from '@pebula/ngrid/core';
import { PblNgridPluginController } from '@pebula/ngrid';
import { PblInfiniteScrollDataSource } from './infinite-scroll-data-source/infinite-scroll-datasource';
import { INFINITE_SCROLL_DEFFERED_ROW } from './infinite-scroll-data-source/infinite-scroll-deffered-row';
import { PblNgridDefaultInfiniteVirtualRowComponent } from './default-infinite-virtual-row/default-infinite-virtual-row.component';
export const PLUGIN_KEY = 'infiniteScroll';
const IS_INFINITE_VIRTUAL_ROW = (index, rowData) => {
    return rowData === INFINITE_SCROLL_DEFFERED_ROW;
};
const IS_NOT_INFINITE_VIRTUAL_ROW = (index, rowData) => {
    return !IS_INFINITE_VIRTUAL_ROW(index, rowData);
};
export class PblNgridInfiniteScrollPlugin {
    constructor(grid, pluginCtrl, injector) {
        this.grid = grid;
        this.pluginCtrl = pluginCtrl;
        this.injector = injector;
        this._enabled = false;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        grid.registry.changes
            .subscribe(changes => {
            for (const c of changes) {
                switch (c.type) {
                    case 'infiniteVirtualRow':
                        if (c.op === 'remove') {
                            this.pluginCtrl.extApi.cdkTable.removeRowDef(c.value);
                            this._infiniteVirtualRowDef = undefined;
                        }
                        this.setupInfiniteVirtualRow();
                        break;
                }
            }
        });
        pluginCtrl.events
            .pipe(ON_DESTROY)
            .subscribe(() => {
            if (this._infiniteVirtualRowRef) {
                this._infiniteVirtualRowRef.destroy();
            }
            this._removePlugin(this.grid);
        });
        pluginCtrl.events.subscribe(event => {
            if (event.kind === 'onDataSource') {
                const prevState = this._enabled;
                this._enabled = event.curr instanceof PblInfiniteScrollDataSource;
                if (this._enabled !== prevState) {
                    pluginCtrl.onInit().subscribe(() => this.updateTable());
                }
            }
        });
    }
    static create(grid, injector) {
        const pluginCtrl = PblNgridPluginController.find(grid);
        return new PblNgridInfiniteScrollPlugin(grid, pluginCtrl, injector);
    }
    setupInfiniteVirtualRow() {
        const grid = this.grid;
        const cdkTable = this.pluginCtrl.extApi.cdkTable;
        if (this._infiniteVirtualRowDef) {
            cdkTable.removeRowDef(this._infiniteVirtualRowDef);
            this._infiniteVirtualRowDef = undefined;
        }
        if (this._enabled) {
            let infiniteVirtualRow = grid.registry.getSingle('infiniteVirtualRow');
            if (infiniteVirtualRow) {
                this._infiniteVirtualRowDef = infiniteVirtualRow = infiniteVirtualRow.clone();
                Object.defineProperty(infiniteVirtualRow, 'when', { enumerable: true, get: () => IS_INFINITE_VIRTUAL_ROW });
            }
            else if (!this._infiniteVirtualRowRef) {
                // TODO: move to module? set in root registry? put elsewhere to avoid grid sync (see event of registry change)...
                this._infiniteVirtualRowRef = this.injector.get(ComponentFactoryResolver)
                    .resolveComponentFactory(PblNgridDefaultInfiniteVirtualRowComponent)
                    .create(this.injector);
                this._infiniteVirtualRowRef.changeDetectorRef.detectChanges();
                return;
            }
        }
        this.resetTableRowDefs();
    }
    resetTableRowDefs() {
        if (this._infiniteVirtualRowDef) {
            this._enabled === false
                ? this.pluginCtrl.extApi.cdkTable.removeRowDef(this._infiniteVirtualRowDef)
                : this.pluginCtrl.extApi.cdkTable.addRowDef(this._infiniteVirtualRowDef);
        }
    }
    /**
     * Update the grid with detail row infor.
     * Instead of calling for a change detection cycle we can assign the new predicates directly to the pblNgridRowDef instances.
     */
    updateTable() {
        this.grid._tableRowDef.when = !!this._enabled ? IS_NOT_INFINITE_VIRTUAL_ROW : undefined;
        this.setupInfiniteVirtualRow();
        // Once we changed the `when` predicate on the `CdkRowDef` we must:
        //   1. Update the row cache (property `rowDefs`) to reflect the new change
        this.pluginCtrl.extApi.cdkTable.updateRowDefCache();
        //   2. re-render all rows.
        // The logic for re-rendering all rows is handled in `CdkTable._forceRenderDataRows()` which is a private method.
        // This is a workaround, assigning to `multiTemplateDataRows` will invoke the setter which
        // also calls `CdkTable._forceRenderDataRows()`
        // TODO: This is risky, the setter logic might change.
        // for example, if material will check for change in `multiTemplateDataRows` setter from previous value...
        this.pluginCtrl.extApi.cdkTable.multiTemplateDataRows = !!this._enabled;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGUtc2Nyb2xsLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvaW5maW5pdGUtc2Nyb2xsL3NyYy9saWIvaW5maW5pdGUtc2Nyb2xsLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVksd0JBQXdCLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRWpGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLEVBQXFCLHdCQUF3QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzVFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBQzFHLE9BQU8sRUFBRSwwQ0FBMEMsRUFBRSxNQUFNLHVFQUF1RSxDQUFDO0FBV25JLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxnQkFBeUIsQ0FBQztBQUVwRCxNQUFNLHVCQUF1QixHQUFHLENBQUMsS0FBYSxFQUFFLE9BQVksRUFBRSxFQUFFO0lBQzlELE9BQU8sT0FBTyxLQUFLLDRCQUE0QixDQUFDO0FBQ2xELENBQUMsQ0FBQztBQUNGLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDbEUsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFFRixNQUFNLE9BQU8sNEJBQTRCO0lBWXZDLFlBQW9CLElBQTRCLEVBQVUsVUFBdUMsRUFBVSxRQUFrQjtRQUF6RyxTQUFJLEdBQUosSUFBSSxDQUF3QjtRQUFVLGVBQVUsR0FBVixVQUFVLENBQTZCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUxySCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBTWhDLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQ2xCLFNBQVMsQ0FBRSxPQUFPLENBQUMsRUFBRTtZQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtnQkFDdkIsUUFBUSxDQUFDLENBQUMsSUFBSSxFQUFFO29CQUNkLEtBQUssb0JBQW9CO3dCQUN2QixJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxFQUFFOzRCQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDdEQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQzt5QkFDekM7d0JBQ0QsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7d0JBQy9CLE1BQU07aUJBQ1Q7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUwsVUFBVSxDQUFDLE1BQU07YUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3ZDO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFTCxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUNuQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO2dCQUNqQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLFlBQVksMkJBQTJCLENBQUM7Z0JBRWxFLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQy9CLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFFLENBQUM7aUJBQzNEO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUEvQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUF1QixFQUFFLFFBQWtCO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksNEJBQTRCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBOENPLHVCQUF1QjtRQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNqRCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUMvQixRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxTQUFTLENBQUM7U0FDekM7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDOUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7YUFDOUc7aUJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDdkMsaUhBQWlIO2dCQUNqSCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUM7cUJBQ3RFLHVCQUF1QixDQUFDLDBDQUEwQyxDQUFDO3FCQUNuRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQzlELE9BQU87YUFDUjtTQUNGO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUs7Z0JBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztnQkFDM0UsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQ3pFO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssV0FBVztRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEYsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDL0IsbUVBQW1FO1FBQ25FLDJFQUEyRTtRQUMzRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVwRCwyQkFBMkI7UUFDM0IsaUhBQWlIO1FBQ2pILDBGQUEwRjtRQUMxRiwrQ0FBK0M7UUFDL0Msc0RBQXNEO1FBQ3RELDBHQUEwRztRQUMxRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDMUUsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0b3IsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE9OX0RFU1RST1kgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZEluZmluaXRlVmlydHVhbFJvd1JlZkRpcmVjdGl2ZSB9IGZyb20gJy4vaW5maW5pdGUtdmlydHVhbC1yb3cvZGlyZWN0aXZlcyc7XG5pbXBvcnQgeyBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2UgfSBmcm9tICcuL2luZmluaXRlLXNjcm9sbC1kYXRhLXNvdXJjZS9pbmZpbml0ZS1zY3JvbGwtZGF0YXNvdXJjZSc7XG5pbXBvcnQgeyBJTkZJTklURV9TQ1JPTExfREVGRkVSRURfUk9XIH0gZnJvbSAnLi9pbmZpbml0ZS1zY3JvbGwtZGF0YS1zb3VyY2UvaW5maW5pdGUtc2Nyb2xsLWRlZmZlcmVkLXJvdyc7XG5pbXBvcnQgeyBQYmxOZ3JpZERlZmF1bHRJbmZpbml0ZVZpcnR1YWxSb3dDb21wb25lbnQgfSBmcm9tICcuL2RlZmF1bHQtaW5maW5pdGUtdmlydHVhbC1yb3cvZGVmYXVsdC1pbmZpbml0ZS12aXJ0dWFsLXJvdy5jb21wb25lbnQnO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbiB7XG4gICAgaW5maW5pdGVTY3JvbGw/OiBQYmxOZ3JpZEluZmluaXRlU2Nyb2xsUGx1Z2luO1xuICB9XG4gIGludGVyZmFjZSBQYmxOZ3JpZFBsdWdpbkV4dGVuc2lvbkZhY3RvcmllcyB7XG4gICAgaW5maW5pdGVTY3JvbGw6IGtleW9mIHR5cGVvZiBQYmxOZ3JpZEluZmluaXRlU2Nyb2xsUGx1Z2luO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBQTFVHSU5fS0VZID0gJ2luZmluaXRlU2Nyb2xsJyBhcyBjb25zdDtcblxuY29uc3QgSVNfSU5GSU5JVEVfVklSVFVBTF9ST1cgPSAoaW5kZXg6IG51bWJlciwgcm93RGF0YTogYW55KSA9PiB7XG4gIHJldHVybiByb3dEYXRhID09PSBJTkZJTklURV9TQ1JPTExfREVGRkVSRURfUk9XO1xufTtcbmNvbnN0IElTX05PVF9JTkZJTklURV9WSVJUVUFMX1JPVyA9IChpbmRleDogbnVtYmVyLCByb3dEYXRhOiBhbnkpID0+IHtcbiAgcmV0dXJuICFJU19JTkZJTklURV9WSVJUVUFMX1JPVyhpbmRleCwgcm93RGF0YSk7XG59O1xuXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRJbmZpbml0ZVNjcm9sbFBsdWdpbjxUID0gYW55PiB7XG5cbiAgc3RhdGljIGNyZWF0ZShncmlkOiBQYmxOZ3JpZENvbXBvbmVudCwgaW5qZWN0b3I6IEluamVjdG9yKTogUGJsTmdyaWRJbmZpbml0ZVNjcm9sbFBsdWdpbiB7XG4gICAgY29uc3QgcGx1Z2luQ3RybCA9IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlci5maW5kKGdyaWQpO1xuICAgIHJldHVybiBuZXcgUGJsTmdyaWRJbmZpbml0ZVNjcm9sbFBsdWdpbihncmlkLCBwbHVnaW5DdHJsLCBpbmplY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9lbmFibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2luZmluaXRlVmlydHVhbFJvd0RlZjogUGJsTmdyaWRJbmZpbml0ZVZpcnR1YWxSb3dSZWZEaXJlY3RpdmU8VD47XG4gIHByaXZhdGUgX2luZmluaXRlVmlydHVhbFJvd1JlZjogQ29tcG9uZW50UmVmPFBibE5ncmlkRGVmYXVsdEluZmluaXRlVmlydHVhbFJvd0NvbXBvbmVudD47XG4gIHByaXZhdGUgX3JlbW92ZVBsdWdpbjogKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50PGFueT4pID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxhbnk+LCBwcml2YXRlIHBsdWdpbkN0cmw6IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlcjxUPiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLl9yZW1vdmVQbHVnaW4gPSBwbHVnaW5DdHJsLnNldFBsdWdpbihQTFVHSU5fS0VZLCB0aGlzKTtcblxuICAgIGdyaWQucmVnaXN0cnkuY2hhbmdlc1xuICAgICAgLnN1YnNjcmliZSggY2hhbmdlcyA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgYyBvZiBjaGFuZ2VzKSB7XG4gICAgICAgICAgc3dpdGNoIChjLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZmluaXRlVmlydHVhbFJvdyc6XG4gICAgICAgICAgICAgIGlmIChjLm9wID09PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGUucmVtb3ZlUm93RGVmKGMudmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2luZmluaXRlVmlydHVhbFJvd0RlZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnNldHVwSW5maW5pdGVWaXJ0dWFsUm93KCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBwbHVnaW5DdHJsLmV2ZW50c1xuICAgICAgLnBpcGUoT05fREVTVFJPWSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faW5maW5pdGVWaXJ0dWFsUm93UmVmKSB7XG4gICAgICAgICAgdGhpcy5faW5maW5pdGVWaXJ0dWFsUm93UmVmLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW1vdmVQbHVnaW4odGhpcy5ncmlkKTtcbiAgICAgIH0pO1xuXG4gICAgcGx1Z2luQ3RybC5ldmVudHMuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQua2luZCA9PT0gJ29uRGF0YVNvdXJjZScpIHtcbiAgICAgICAgY29uc3QgcHJldlN0YXRlID0gdGhpcy5fZW5hYmxlZDtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGV2ZW50LmN1cnIgaW5zdGFuY2VvZiBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2U7XG5cbiAgICAgICAgaWYgKHRoaXMuX2VuYWJsZWQgIT09IHByZXZTdGF0ZSkge1xuICAgICAgICAgIHBsdWdpbkN0cmwub25Jbml0KCkuc3Vic2NyaWJlKCAoKSA9PiB0aGlzLnVwZGF0ZVRhYmxlKCkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cEluZmluaXRlVmlydHVhbFJvdygpOiB2b2lkIHtcbiAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkO1xuICAgIGNvbnN0IGNka1RhYmxlID0gdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jZGtUYWJsZTtcbiAgICBpZiAodGhpcy5faW5maW5pdGVWaXJ0dWFsUm93RGVmKSB7XG4gICAgICBjZGtUYWJsZS5yZW1vdmVSb3dEZWYodGhpcy5faW5maW5pdGVWaXJ0dWFsUm93RGVmKTtcbiAgICAgIHRoaXMuX2luZmluaXRlVmlydHVhbFJvd0RlZiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuYWJsZWQpIHtcbiAgICAgIGxldCBpbmZpbml0ZVZpcnR1YWxSb3cgPSBncmlkLnJlZ2lzdHJ5LmdldFNpbmdsZSgnaW5maW5pdGVWaXJ0dWFsUm93Jyk7XG4gICAgICBpZiAoaW5maW5pdGVWaXJ0dWFsUm93KSB7XG4gICAgICAgIHRoaXMuX2luZmluaXRlVmlydHVhbFJvd0RlZiA9IGluZmluaXRlVmlydHVhbFJvdyA9IGluZmluaXRlVmlydHVhbFJvdy5jbG9uZSgpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5maW5pdGVWaXJ0dWFsUm93LCAnd2hlbicsIHsgZW51bWVyYWJsZTogdHJ1ZSwgIGdldDogKCkgPT4gSVNfSU5GSU5JVEVfVklSVFVBTF9ST1cgfSk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLl9pbmZpbml0ZVZpcnR1YWxSb3dSZWYpIHtcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0byBtb2R1bGU/IHNldCBpbiByb290IHJlZ2lzdHJ5PyBwdXQgZWxzZXdoZXJlIHRvIGF2b2lkIGdyaWQgc3luYyAoc2VlIGV2ZW50IG9mIHJlZ2lzdHJ5IGNoYW5nZSkuLi5cbiAgICAgICAgdGhpcy5faW5maW5pdGVWaXJ0dWFsUm93UmVmID0gdGhpcy5pbmplY3Rvci5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKVxuICAgICAgICAgIC5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShQYmxOZ3JpZERlZmF1bHRJbmZpbml0ZVZpcnR1YWxSb3dDb21wb25lbnQpXG4gICAgICAgICAgLmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcbiAgICAgICAgdGhpcy5faW5maW5pdGVWaXJ0dWFsUm93UmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2V0VGFibGVSb3dEZWZzKCk7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0VGFibGVSb3dEZWZzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pbmZpbml0ZVZpcnR1YWxSb3dEZWYpIHtcbiAgICAgIHRoaXMuX2VuYWJsZWQgPT09IGZhbHNlXG4gICAgICAgID8gdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jZGtUYWJsZS5yZW1vdmVSb3dEZWYodGhpcy5faW5maW5pdGVWaXJ0dWFsUm93RGVmKVxuICAgICAgICA6IHRoaXMucGx1Z2luQ3RybC5leHRBcGkuY2RrVGFibGUuYWRkUm93RGVmKHRoaXMuX2luZmluaXRlVmlydHVhbFJvd0RlZilcbiAgICAgIDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBncmlkIHdpdGggZGV0YWlsIHJvdyBpbmZvci5cbiAgICogSW5zdGVhZCBvZiBjYWxsaW5nIGZvciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgd2UgY2FuIGFzc2lnbiB0aGUgbmV3IHByZWRpY2F0ZXMgZGlyZWN0bHkgdG8gdGhlIHBibE5ncmlkUm93RGVmIGluc3RhbmNlcy5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlVGFibGUoKTogdm9pZCB7XG4gICAgdGhpcy5ncmlkLl90YWJsZVJvd0RlZi53aGVuID0gISF0aGlzLl9lbmFibGVkID8gSVNfTk9UX0lORklOSVRFX1ZJUlRVQUxfUk9XIDogdW5kZWZpbmVkO1xuICAgIHRoaXMuc2V0dXBJbmZpbml0ZVZpcnR1YWxSb3coKTtcbiAgICAvLyBPbmNlIHdlIGNoYW5nZWQgdGhlIGB3aGVuYCBwcmVkaWNhdGUgb24gdGhlIGBDZGtSb3dEZWZgIHdlIG11c3Q6XG4gICAgLy8gICAxLiBVcGRhdGUgdGhlIHJvdyBjYWNoZSAocHJvcGVydHkgYHJvd0RlZnNgKSB0byByZWZsZWN0IHRoZSBuZXcgY2hhbmdlXG4gICAgdGhpcy5wbHVnaW5DdHJsLmV4dEFwaS5jZGtUYWJsZS51cGRhdGVSb3dEZWZDYWNoZSgpO1xuXG4gICAgLy8gICAyLiByZS1yZW5kZXIgYWxsIHJvd3MuXG4gICAgLy8gVGhlIGxvZ2ljIGZvciByZS1yZW5kZXJpbmcgYWxsIHJvd3MgaXMgaGFuZGxlZCBpbiBgQ2RrVGFibGUuX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKWAgd2hpY2ggaXMgYSBwcml2YXRlIG1ldGhvZC5cbiAgICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCwgYXNzaWduaW5nIHRvIGBtdWx0aVRlbXBsYXRlRGF0YVJvd3NgIHdpbGwgaW52b2tlIHRoZSBzZXR0ZXIgd2hpY2hcbiAgICAvLyBhbHNvIGNhbGxzIGBDZGtUYWJsZS5fZm9yY2VSZW5kZXJEYXRhUm93cygpYFxuICAgIC8vIFRPRE86IFRoaXMgaXMgcmlza3ksIHRoZSBzZXR0ZXIgbG9naWMgbWlnaHQgY2hhbmdlLlxuICAgIC8vIGZvciBleGFtcGxlLCBpZiBtYXRlcmlhbCB3aWxsIGNoZWNrIGZvciBjaGFuZ2UgaW4gYG11bHRpVGVtcGxhdGVEYXRhUm93c2Agc2V0dGVyIGZyb20gcHJldmlvdXMgdmFsdWUuLi5cbiAgICB0aGlzLnBsdWdpbkN0cmwuZXh0QXBpLmNka1RhYmxlLm11bHRpVGVtcGxhdGVEYXRhUm93cyA9ICEhdGhpcy5fZW5hYmxlZDtcbiAgfVxufVxuIl19