import * as i0 from '@angular/core';
import { ViewContainerRef, NgZone, ElementRef, Directive, Input, NgModule, Optional, SkipSelf } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { MAT_TOOLTIP_SCROLL_STRATEGY, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import * as i1$1 from '@pebula/ngrid/core';
import { PblNgridConfigService, unrx } from '@pebula/ngrid/core';
import * as i1 from '@pebula/ngrid';
import { PblNgridPluginController, ngridPlugin, PblNgridModule } from '@pebula/ngrid';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Platform } from '@angular/cdk/platform';

const PLUGIN_KEY = 'cellTooltip';
const DEFAULT_OPTIONS = {
    canShow: (event) => {
        const element = (event.cellTarget.firstElementChild || event.cellTarget);
        return element.scrollWidth > element.offsetWidth;
    },
    message: (event) => {
        return event.cellTarget.innerText;
    }
};
class PblNgridCellTooltipDirective {
    constructor(table, injector, pluginCtrl) {
        this.table = table;
        this.injector = injector;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        const configService = injector.get(PblNgridConfigService);
        this.initArgs = [
            injector.get(Overlay),
            null,
            injector.get(ScrollDispatcher),
            injector.get(ViewContainerRef),
            injector.get(NgZone),
            injector.get(Platform),
            injector.get(AriaDescriber),
            injector.get(FocusMonitor),
            injector.get(MAT_TOOLTIP_SCROLL_STRATEGY),
            injector.get(Directionality),
            injector.get(MAT_TOOLTIP_DEFAULT_OPTIONS),
            injector.get(DOCUMENT),
        ];
        configService.onUpdate('cellTooltip')
            .pipe(unrx(this))
            .subscribe(cfg => this.lastConfig = cfg.curr);
        pluginCtrl.onInit().subscribe(() => this.init(pluginCtrl));
    }
    // tslint:disable-next-line:no-input-rename
    set canShow(value) {
        if (typeof value === 'function') {
            this._canShow = value;
        }
        else if (value === '') {
            this._canShow = undefined;
        }
        else {
            this._canShow = coerceBooleanProperty(value) ? e => true : e => false;
        }
    }
    static create(table, injector) {
        return new PblNgridCellTooltipDirective(table, injector, PblNgridPluginController.find(table));
    }
    ngOnDestroy() {
        this._removePlugin(this.table);
        this.killTooltip();
        unrx.kill(this);
    }
    init(pluginCtrl) {
        // Depends on target-events plugin
        // if it's not set, create it.
        const targetEventsPlugin = pluginCtrl.getPlugin('targetEvents') || pluginCtrl.createPlugin('targetEvents');
        targetEventsPlugin.cellEnter
            .pipe(unrx(this))
            .subscribe(event => this.cellEnter(event));
        targetEventsPlugin.cellLeave
            .pipe(unrx(this))
            .subscribe(event => this.cellLeave(event));
    }
    cellEnter(event) {
        this.killTooltip();
        if (!this._canShow) {
            // TODO: this will set lastConfig / default option once
            // but if user changes lastConfig it will never update again...
            this.canShow = (this.lastConfig && this.lastConfig.canShow) || DEFAULT_OPTIONS.canShow;
        }
        if (this._canShow(event)) {
            const params = this.initArgs.slice();
            params[1] = new ElementRef(event.cellTarget);
            this.toolTip = new MatTooltip(...params);
            const message = this.message || (this.lastConfig && this.lastConfig.message) || DEFAULT_OPTIONS.message;
            this.toolTip.message = message(event);
            if (this.position) {
                this.toolTip.position = this.position;
            }
            if (this.tooltipClass) {
                this.toolTip.tooltipClass = this.tooltipClass;
            }
            if (this.showDelay >= 0) {
                this.toolTip.showDelay = this.showDelay;
            }
            if (this.hideDelay >= 0) {
                this.toolTip.hideDelay = this.hideDelay;
            }
            this.toolTip.show();
        }
    }
    cellLeave(event) {
        this.killTooltip();
    }
    killTooltip() {
        if (this.toolTip) {
            this.toolTip.hide();
            this.toolTip.ngOnDestroy();
            this.toolTip = undefined;
        }
    }
}
PblNgridCellTooltipDirective.PLUGIN_KEY = PLUGIN_KEY;
/** @nocollapse */ PblNgridCellTooltipDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipDirective, deps: [{ token: i1.PblNgridComponent }, { token: i0.Injector }, { token: i1.PblNgridPluginController }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridCellTooltipDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridCellTooltipDirective, selector: "[cellTooltip]", inputs: { canShow: ["cellTooltip", "canShow"], message: "message", position: "position", tooltipClass: "tooltipClass", showDelay: "showDelay", hideDelay: "hideDelay" }, exportAs: ["pblOverflowTooltip"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[cellTooltip]', exportAs: 'pblOverflowTooltip' }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridComponent }, { type: i0.Injector }, { type: i1.PblNgridPluginController }]; }, propDecorators: { canShow: [{
                type: Input,
                args: ['cellTooltip']
            }], message: [{
                type: Input
            }], position: [{
                type: Input
            }], tooltipClass: [{
                type: Input
            }], showDelay: [{
                type: Input
            }], hideDelay: [{
                type: Input
            }] } });

class PblNgridCellTooltipModule {
    constructor(parentModule, configService) {
        if (parentModule) {
            return;
        }
        PblNgridPluginController.created
            .subscribe(event => {
            // Do not remove the explicit reference to `PblNgridCellTooltipDirective`
            // We use `PblNgridCellTooltipDirective.PLUGIN_KEY` to create a direct reference to `PblNgridCellTooltipDirective`
            // which will disable dead code elimination for the `PblNgridCellTooltipDirective` plugin.
            // If it is not set, using the plugin will only work when it is used in templates, other wise, if used programmatically (`autoSetAll`)
            // CLI prod builds will remove the plugin's code.
            const cellTooltipConfig = configService.get(PblNgridCellTooltipDirective.PLUGIN_KEY);
            if (cellTooltipConfig && cellTooltipConfig.autoSetAll === true) {
                const pluginCtrl = event.controller;
                pluginCtrl.onInit()
                    .subscribe(evt => pluginCtrl.ensurePlugin(PblNgridCellTooltipDirective.PLUGIN_KEY));
            }
        });
    }
}
PblNgridCellTooltipModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create' }, PblNgridCellTooltipDirective);
/** @nocollapse */ PblNgridCellTooltipModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, deps: [{ token: PblNgridCellTooltipModule, optional: true, skipSelf: true }, { token: i1$1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridCellTooltipModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, declarations: [PblNgridCellTooltipDirective], imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridCellTooltipDirective, MatTooltipModule] });
/** @nocollapse */ PblNgridCellTooltipModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule, MatTooltipModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridCellTooltipModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatTooltipModule, OverlayModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [PblNgridCellTooltipDirective],
                    exports: [PblNgridCellTooltipDirective, MatTooltipModule],
                }]
        }], ctorParameters: function () { return [{ type: PblNgridCellTooltipModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1$1.PblNgridConfigService }]; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridCellTooltipDirective, PblNgridCellTooltipModule };
//# sourceMappingURL=pebula-ngrid-material-cell-tooltip.mjs.map
