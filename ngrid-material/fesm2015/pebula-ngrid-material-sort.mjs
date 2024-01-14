import * as i0 from '@angular/core';
import { Directive, NgModule } from '@angular/core';
import { unrx, ON_INVALIDATE_HEADERS } from '@asafmalin/ngrid/core';
import * as i1 from '@asafmalin/ngrid';
import { PblNgridMultiComponentRegistry, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import * as i2 from '@angular/material/sort';
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

const PLUGIN_KEY = 'matSort';
class PblNgridMatSortDirective {
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

class MatSortExtension extends PblNgridMultiComponentRegistry {
    constructor(cfr) {
        super();
        this.cfr = cfr;
        this.name = 'sortContainer';
        this.kind = 'dataHeaderExtensions';
        this.projectContent = true;
    }
    shouldRender(context) {
        return !!context.col.sort && !!context.injector.get(MatSort, false);
    }
    getFactory(context) {
        return this.cfr.resolveComponentFactory(MatSortHeader);
    }
    onCreated(context, cmpRef) {
        // We assign the ID and also verify that it does not exist on the `MatSort` container
        // It might exists on specific scenarios when a header is removed and added instantly but the "add" part happens before the teardown so the `MatSort` will throw.
        this.deregisterId(context, cmpRef.instance.id = context.col.id);
        cmpRef.changeDetectorRef.markForCheck();
    }
    /**
     * Check that the current `MatSort` does not already have a sortable header with the provided id.
     */
    deregisterId(context, id) {
        const matSort = context.injector.get(MatSort);
        const matSortHeader = matSort.sortables.get(id);
        if (matSortHeader) {
            matSort.deregister(matSortHeader);
        }
    }
}

class PblNgridMatSortModule {
    constructor(registry, cfr) {
        this.registry = registry;
        registry.addMulti('dataHeaderExtensions', new MatSortExtension(cfr));
    }
}
PblNgridMatSortModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridMatSortDirective);
/** @nocollapse */ PblNgridMatSortModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, deps: [{ token: i1.PblNgridRegistryService }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridMatSortModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, declarations: [PblNgridMatSortDirective], imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule], exports: [PblNgridMatSortDirective, MatSortModule] });
/** @nocollapse */ PblNgridMatSortModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule, MatSortModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatSortModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatButtonModule, MatSortModule, PblNgridModule],
                    declarations: [PblNgridMatSortDirective],
                    exports: [PblNgridMatSortDirective, MatSortModule]
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridRegistryService }, { type: i0.ComponentFactoryResolver }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridMatSortDirective, PblNgridMatSortModule };
//# sourceMappingURL=pebula-ngrid-material-sort.mjs.map
