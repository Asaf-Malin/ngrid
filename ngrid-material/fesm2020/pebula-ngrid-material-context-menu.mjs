import * as i0 from '@angular/core';
import { Directive, Input, Component, ViewEncapsulation, ViewContainerRef, ViewChild, NgModule, Optional, SkipSelf } from '@angular/core';
import * as i2 from '@asafmalin/ngrid';
import { PblNgridMultiComponentRegistry, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import * as i1 from '@asafmalin/ngrid/overlay-panel';
import { PblNgridOverlayPanelFactory, PblNgridOverlayPanelComponentExtension, PblNgridOverlayPanelModule } from '@asafmalin/ngrid/overlay-panel';
import * as i2$2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i2$1 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i4 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i5 from '@angular/material/menu';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import * as i6 from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as i7 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import * as i2$3 from '@asafmalin/ngrid/core';

const PLUGIN_KEY = 'matHeaderContextMenu';
class PblNgridMatHeaderContextMenuPlugin {
    constructor(overlayPanelFactory, pluginCtrl) {
        this.pluginCtrl = pluginCtrl;
        this.overlayPanel = overlayPanelFactory.create(pluginCtrl.extApi.grid);
    }
}
/** @nocollapse */ PblNgridMatHeaderContextMenuPlugin.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatHeaderContextMenuPlugin, deps: [{ token: i1.PblNgridOverlayPanelFactory }, { token: i2.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridMatHeaderContextMenuPlugin.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMatHeaderContextMenuPlugin, selector: "pbl-ngrid[matHeaderContextMenu]", inputs: { style: ["matHeaderContextMenu", "style"], config: "config" }, providers: [PblNgridOverlayPanelFactory], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMatHeaderContextMenuPlugin, decorators: [{
            type: Directive,
            args: [{ selector: 'pbl-ngrid[matHeaderContextMenu]', providers: [PblNgridOverlayPanelFactory] }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridOverlayPanelFactory }, { type: i2.PblNgridPluginController }]; }, propDecorators: { style: [{
                type: Input,
                args: ['matHeaderContextMenu']
            }], config: [{
                type: Input
            }] } });

const DEFAULT_CONFIG = { hasBackdrop: true, xPos: 'after', yPos: 'below' };
class MatHeaderContextMenuTrigger {
    constructor(plugin, elRef) {
        this.plugin = plugin;
        this.elRef = elRef;
    }
    openOverlayPanel() {
        const config = this.plugin.config || DEFAULT_CONFIG;
        this.plugin.overlayPanel.open(this.plugin.style, this.elRef, config, this.context);
    }
}
/** @nocollapse */ MatHeaderContextMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: MatHeaderContextMenuTrigger, deps: [{ token: PblNgridMatHeaderContextMenuPlugin }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ MatHeaderContextMenuTrigger.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: MatHeaderContextMenuTrigger, selector: "div[mat-header-context-menu-trigger]", host: { listeners: { "click": "openOverlayPanel()" }, classAttribute: "mat-header-context-menu-trigger" }, ngImport: i0, template: "<mat-icon style=\"height: 16px; width: 16px; font-size: 16px; line-height: 16px;\">more_vert</mat-icon>\n", styles: ["div.mat-header-context-menu-trigger{position:absolute;display:flex;align-items:center;right:0;height:100%;cursor:pointer;margin-right:12px;z-index:100}[dir=rtl] div.mat-header-context-menu-trigger{right:unset;left:0;margin-right:unset;margin-left:12px}\n"], dependencies: [{ kind: "component", type: i2$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: MatHeaderContextMenuTrigger, decorators: [{
            type: Component,
            args: [{ selector: 'div[mat-header-context-menu-trigger]', host: {
                        class: 'mat-header-context-menu-trigger',
                        '(click)': 'openOverlayPanel()',
                    }, encapsulation: ViewEncapsulation.None, template: "<mat-icon style=\"height: 16px; width: 16px; font-size: 16px; line-height: 16px;\">more_vert</mat-icon>\n", styles: ["div.mat-header-context-menu-trigger{position:absolute;display:flex;align-items:center;right:0;height:100%;cursor:pointer;margin-right:12px;z-index:100}[dir=rtl] div.mat-header-context-menu-trigger{right:unset;left:0;margin-right:unset;margin-left:12px}\n"] }]
        }], ctorParameters: function () { return [{ type: PblNgridMatHeaderContextMenuPlugin }, { type: i0.ElementRef }]; } });

class MatHeaderContextMenuExtension extends PblNgridMultiComponentRegistry {
    constructor(cfr) {
        super();
        this.cfr = cfr;
        this.name = 'matHeaderContextMenuTrigger';
        this.kind = 'dataHeaderExtensions';
        this.projectContent = false;
    }
    shouldRender(context) {
        return !!context.injector.get(PblNgridMatHeaderContextMenuPlugin, false);
    }
    getFactory(context) {
        return this.cfr.resolveComponentFactory(MatHeaderContextMenuTrigger);
    }
    onCreated(context, cmpRef) {
        cmpRef.instance.context = context;
        cmpRef.changeDetectorRef.markForCheck();
    }
}

class MatExcelStyleHeaderMenu {
    constructor(ref) {
        this.ref = ref;
        this.currentFilter = '';
        this.column = ref.data.col;
        this.grid = ref.data.grid;
        if (this.grid.ds.sort.column === this.column) {
            this.currentSort = this.grid.ds.sort.sort.order;
        }
        this.currentPin = this.column.columnDef.sticky ? 'start' : this.column.columnDef.stickyEnd ? 'end' : undefined;
        const dsFilter = this.grid.ds.filter;
        if (dsFilter && dsFilter.type === 'value' && dsFilter.columns && dsFilter.columns.indexOf(this.column) >= 0) {
            this.currentFilter = dsFilter.filter;
        }
    }
    ngAfterViewInit() {
        this.matMenu.closed.subscribe(reason => {
            this.ref.close();
        });
        const view = this.menuViewLocation.createEmbeddedView(this.matMenu.templateRef);
        this.matMenu.setElevation(0);
        this.matMenu.focusFirstItem('program');
        this.matMenu._resetAnimation();
        view.markForCheck();
        view.detectChanges();
        this.matMenu._startAnimation();
    }
    hide() {
        this.grid.columnApi.hideColumns(this.column.id);
    }
    onSortToggle(sort) {
        if (this.currentSort === sort) {
            this.grid.ds.setSort();
        }
        else {
            this.grid.ds.setSort(this.column, { order: sort });
        }
    }
    onPinToggle(pin) {
        if (this.currentPin === pin) {
            this.column.columnDef.updatePin();
        }
        else {
            this.column.columnDef.updatePin(pin);
        }
    }
    filterColumn(filterValue) {
        this.currentFilter = filterValue;
        if (!filterValue) {
            this.grid.setFilter();
        }
        else {
            this.grid.setFilter(filterValue.trim(), [this.column]);
        }
    }
    clickTrap(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}
/** @nocollapse */ MatExcelStyleHeaderMenu.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: MatExcelStyleHeaderMenu, deps: [{ token: i1.PblNgridOverlayPanelRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ MatExcelStyleHeaderMenu.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: MatExcelStyleHeaderMenu, selector: "mat-excel-style-header-menu", viewQueries: [{ propertyName: "matMenu", first: true, predicate: ["columnMenu"], descendants: true, read: MatMenu, static: true }, { propertyName: "menuViewLocation", first: true, predicate: ["menuViewLocation"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0, template: "<mat-menu #columnMenu=\"matMenu\" class=\"pbl-mat-menu-panel\">\n\n  <button *ngIf=\"column.sort\" mat-menu-item [matMenuTriggerFor]=\"sortMenu\">\n    <mat-icon>sort</mat-icon>Sort\n  </button>\n  <button mat-menu-item [matMenuTriggerFor]=\"pinMenu\">\n    <mat-icon>place</mat-icon>Pin\n  </button>\n  <button mat-menu-item (click)=\"grid.columnApi.autoSizeColumn(column)\">\n    <mat-icon>keyboard_tab</mat-icon>Auto Fit\n  </button>\n  <button mat-menu-item (click)=\"hide()\">\n    <mat-icon>visibility_off</mat-icon>Hide Column\n  </button>\n\n  <mat-menu #sortMenu=\"matMenu\">\n    <button mat-menu-item (click)=\"onSortToggle('asc')\" [class.menu-item-selected]=\"currentSort === 'asc'\">\n      <mat-icon [color]=\"currentSort === 'asc' ? 'primary' : ''\">arrow_upward</mat-icon>\n      <span>Ascending</span>\n    </button>\n    <button mat-menu-item (click)=\"onSortToggle('desc')\" [class.menu-item-selected]=\"currentSort === 'desc'\">\n      <mat-icon [color]=\"currentSort === 'desc' ? 'primary' : ''\">arrow_downward</mat-icon>\n      <span>Descending</span>\n    </button>\n  </mat-menu>\n\n  <mat-menu #pinMenu=\"matMenu\">\n    <button mat-menu-item (click)=\"onPinToggle('start')\" [class.menu-item-selected]=\"currentPin === 'start'\">\n      <span>Start</span>\n    </button>\n    <button mat-menu-item (click)=\"onPinToggle('end')\" [class.menu-item-selected]=\"currentPin === 'end'\">\n      <span>End</span>\n    </button>\n  </mat-menu>\n\n  <div class=\"mat-menu-item pbl-mat-menu-row\" (click)=\"clickTrap($event)\">\n    <mat-form-field>\n      <mat-label>Search</mat-label>\n      <input #input matInput (keyup)=\"filterColumn(input.value)\" [value]=\"currentFilter\">\n      <mat-icon matPrefix>search</mat-icon>\n      <button mat-button [style.visibility]=\"currentFilter ? 'visible' : 'hidden'\" matSuffix mat-icon-button aria-label=\"Clear\"\n              (click)=\"filterColumn('')\">\n        <mat-icon>close</mat-icon>\n      </button>\n    </mat-form-field>\n  </div>\n</mat-menu>\n<ng-container #menuViewLocation></ng-container>\n", styles: [".mat-menu-panel.pbl-mat-menu-panel{max-width:400px}.mat-menu-item.pbl-mat-menu-row{width:100%;box-sizing:border-box;line-height:inherit;height:auto;margin:6px 0;cursor:inherit}.mat-menu-item.pbl-mat-menu-row:hover{background:inherit}\n"], dependencies: [{ kind: "directive", type: i2$2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i2$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: i4.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i5.MatMenu, selector: "mat-menu", exportAs: ["matMenu"] }, { kind: "component", type: i5.MatMenuItem, selector: "[mat-menu-item]", inputs: ["disabled", "disableRipple", "role"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i5.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", exportAs: ["matMenuTrigger"] }, { kind: "component", type: i6.MatFormField, selector: "mat-form-field", inputs: ["color", "appearance", "hideRequiredMarker", "hintLabel", "floatLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i6.MatLabel, selector: "mat-label" }, { kind: "directive", type: i6.MatPrefix, selector: "[matPrefix]" }, { kind: "directive", type: i6.MatSuffix, selector: "[matSuffix]" }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: MatExcelStyleHeaderMenu, decorators: [{
            type: Component,
            args: [{ selector: 'mat-excel-style-header-menu', encapsulation: ViewEncapsulation.None, template: "<mat-menu #columnMenu=\"matMenu\" class=\"pbl-mat-menu-panel\">\n\n  <button *ngIf=\"column.sort\" mat-menu-item [matMenuTriggerFor]=\"sortMenu\">\n    <mat-icon>sort</mat-icon>Sort\n  </button>\n  <button mat-menu-item [matMenuTriggerFor]=\"pinMenu\">\n    <mat-icon>place</mat-icon>Pin\n  </button>\n  <button mat-menu-item (click)=\"grid.columnApi.autoSizeColumn(column)\">\n    <mat-icon>keyboard_tab</mat-icon>Auto Fit\n  </button>\n  <button mat-menu-item (click)=\"hide()\">\n    <mat-icon>visibility_off</mat-icon>Hide Column\n  </button>\n\n  <mat-menu #sortMenu=\"matMenu\">\n    <button mat-menu-item (click)=\"onSortToggle('asc')\" [class.menu-item-selected]=\"currentSort === 'asc'\">\n      <mat-icon [color]=\"currentSort === 'asc' ? 'primary' : ''\">arrow_upward</mat-icon>\n      <span>Ascending</span>\n    </button>\n    <button mat-menu-item (click)=\"onSortToggle('desc')\" [class.menu-item-selected]=\"currentSort === 'desc'\">\n      <mat-icon [color]=\"currentSort === 'desc' ? 'primary' : ''\">arrow_downward</mat-icon>\n      <span>Descending</span>\n    </button>\n  </mat-menu>\n\n  <mat-menu #pinMenu=\"matMenu\">\n    <button mat-menu-item (click)=\"onPinToggle('start')\" [class.menu-item-selected]=\"currentPin === 'start'\">\n      <span>Start</span>\n    </button>\n    <button mat-menu-item (click)=\"onPinToggle('end')\" [class.menu-item-selected]=\"currentPin === 'end'\">\n      <span>End</span>\n    </button>\n  </mat-menu>\n\n  <div class=\"mat-menu-item pbl-mat-menu-row\" (click)=\"clickTrap($event)\">\n    <mat-form-field>\n      <mat-label>Search</mat-label>\n      <input #input matInput (keyup)=\"filterColumn(input.value)\" [value]=\"currentFilter\">\n      <mat-icon matPrefix>search</mat-icon>\n      <button mat-button [style.visibility]=\"currentFilter ? 'visible' : 'hidden'\" matSuffix mat-icon-button aria-label=\"Clear\"\n              (click)=\"filterColumn('')\">\n        <mat-icon>close</mat-icon>\n      </button>\n    </mat-form-field>\n  </div>\n</mat-menu>\n<ng-container #menuViewLocation></ng-container>\n", styles: [".mat-menu-panel.pbl-mat-menu-panel{max-width:400px}.mat-menu-item.pbl-mat-menu-row{width:100%;box-sizing:border-box;line-height:inherit;height:auto;margin:6px 0;cursor:inherit}.mat-menu-item.pbl-mat-menu-row:hover{background:inherit}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridOverlayPanelRef }]; }, propDecorators: { matMenu: [{
                type: ViewChild,
                args: ['columnMenu', { read: MatMenu, static: true }]
            }], menuViewLocation: [{
                type: ViewChild,
                args: ['menuViewLocation', { read: ViewContainerRef, static: true }]
            }] } });

class PblNgridContextMenuModule {
    constructor(parentModule, registry, cfr, configService) {
        if (parentModule) {
            return;
        }
        registry.addMulti('dataHeaderExtensions', new MatHeaderContextMenuExtension(cfr));
        registry.addMulti('overlayPanels', new PblNgridOverlayPanelComponentExtension('excelMenu', MatExcelStyleHeaderMenu, cfr));
    }
}
PblNgridContextMenuModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridMatHeaderContextMenuPlugin);
/** @nocollapse */ PblNgridContextMenuModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, deps: [{ token: PblNgridContextMenuModule, optional: true, skipSelf: true }, { token: i2.PblNgridRegistryService }, { token: i0.ComponentFactoryResolver }, { token: i2$3.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridContextMenuModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, declarations: [MatHeaderContextMenuTrigger,
        PblNgridMatHeaderContextMenuPlugin,
        MatExcelStyleHeaderMenu], imports: [CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        PblNgridModule,
        PblNgridOverlayPanelModule], exports: [PblNgridMatHeaderContextMenuPlugin] });
/** @nocollapse */ PblNgridContextMenuModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, imports: [CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        PblNgridModule,
        PblNgridOverlayPanelModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridContextMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        MatIconModule,
                        MatButtonModule,
                        MatMenuModule,
                        MatFormFieldModule,
                        MatInputModule,
                        PblNgridModule,
                        PblNgridOverlayPanelModule,
                    ],
                    declarations: [
                        MatHeaderContextMenuTrigger,
                        PblNgridMatHeaderContextMenuPlugin,
                        MatExcelStyleHeaderMenu,
                    ],
                    exports: [
                        PblNgridMatHeaderContextMenuPlugin,
                    ]
                }]
        }], ctorParameters: function () { return [{ type: PblNgridContextMenuModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2.PblNgridRegistryService }, { type: i0.ComponentFactoryResolver }, { type: i2$3.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridContextMenuModule, PblNgridMatHeaderContextMenuPlugin };
//# sourceMappingURL=pebula-ngrid-material-context-menu.mjs.map
