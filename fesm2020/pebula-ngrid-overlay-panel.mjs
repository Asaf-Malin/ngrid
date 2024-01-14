import * as i1$1 from '@pebula/ngrid';
import { PblNgridMultiComponentRegistry, PblNgridPluginController, PblNgridMultiTemplateRegistry } from '@pebula/ngrid';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { Injectable, ViewContainerRef, ElementRef, Injector, Directive, Input, NgModule } from '@angular/core';
import * as i1 from '@angular/cdk/overlay';
import { OverlayConfig, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal, ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';

class PblNgridOverlayPanelComponentExtension extends PblNgridMultiComponentRegistry {
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

class PblNgridOverlayPanelRef {
    constructor(overlayRef, data) {
        this.overlayRef = overlayRef;
        this.data = data;
        this._closed$ = new Subject();
        this.closed = this._closed$.asObservable();
        this._closingActions(this, overlayRef)
            .pipe(takeUntil(this.closed))
            .subscribe(() => this.close());
    }
    close() {
        if (this._closed$) {
            const closed$ = this._closed$;
            this._closed$ = undefined;
            closed$.next();
            closed$.complete();
            this.overlayRef.detach();
            this.overlayRef.dispose();
        }
    }
    _closingActions(overlayPanelRef, overlayRef) {
        const backdrop = overlayRef.backdropClick();
        const detachments = overlayRef.detachments();
        return merge(backdrop, detachments, overlayPanelRef.closed);
    }
}

const DEFAULT_OVERLAY_PANEL_CONFIG = {
    hasBackdrop: false,
    xPos: 'center',
    yPos: 'center',
    insetPos: false,
};
class PblNgridOverlayPanelFactory {
    constructor(_overlay, zone) {
        this._overlay = _overlay;
        this.zone = zone;
    }
    create(grid) {
        return new PblNgridOverlayPanel(this._overlay, this.zone, grid);
    }
}
/** @nocollapse */ PblNgridOverlayPanelFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelFactory, deps: [{ token: i1.Overlay }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridOverlayPanelFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelFactory });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelFactory, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.NgZone }]; } });
class PblNgridOverlayPanel {
    constructor(_overlay, zone, grid) {
        this._overlay = _overlay;
        this.zone = zone;
        this.grid = grid;
        const controller = PblNgridPluginController.find(grid);
        this.injector = controller.injector;
        this.vcRef = controller.injector.get(ViewContainerRef);
        this._scrollStrategy = () => _overlay.scrollStrategies.reposition();
    }
    /**
     * Opens a panel relative to a cell element using the overlay panel extension registry template/component with the name provided in `extName`.
     * The cell element is referenced by the `columnId` and the `rowRenderPosition`.
     *
     * If the `rowRenderPosition` is "header" or "footer" then the grid's header / footer rows are targeted, otherwise the number provided should reference
     * the rendered row index to use to get the cell from.
     *
     * > Note that this helper method does not allow targeting meta cells.
     */
    openGridCell(extName, columnId, rowRenderPosition, config, data) {
        const column = this.grid.columnApi.findColumn(columnId);
        if (!column) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Could not find the column ' + columnId);
            }
            return;
        }
        let section;
        let rowRenderIndex = 0;
        switch (rowRenderPosition) {
            case 'header':
            case 'footer':
                section = rowRenderPosition;
                break;
            default:
                if (typeof rowRenderPosition === 'number') {
                    section = 'table';
                    rowRenderIndex = rowRenderPosition;
                }
                break;
        }
        if (!section) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid "rowRenderPosition" provided, use "header", "footer" or any number >= 0.');
            }
            return;
        }
        const el = column && column.columnDef.queryCellElements(section)[rowRenderIndex];
        if (!el) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error(`Could not find a cell for the column ${columnId} at render index ${rowRenderIndex}`);
            }
            return;
        }
        return this.open(extName, new ElementRef(el), config, data);
    }
    open(extName, source, config, data) {
        config = Object.assign({ ...DEFAULT_OVERLAY_PANEL_CONFIG }, config || {});
        const match = this.findNamesExtension(extName);
        if (!match) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Could not find the overlay panel with the name ' + extName);
            }
            return;
        }
        return this.zone.run(() => {
            const overlayRef = this._createOverlay(source, config);
            const overlayPanelRef = new PblNgridOverlayPanelRef(overlayRef, data);
            this._setPosition(overlayRef.getConfig().positionStrategy, config);
            if (match instanceof PblNgridMultiTemplateRegistry) {
                const tPortal = this._getTemplatePortal(match.tRef, overlayPanelRef);
                const viewRef = overlayRef.attach(tPortal);
                viewRef.markForCheck();
                viewRef.detectChanges();
            }
            else {
                const cPortal = this._getComponentPortal(overlayPanelRef, match);
                const cmpRef = overlayRef.attach(cPortal);
                match.onCreated(null, cmpRef);
            }
            overlayRef.updatePosition();
            return overlayPanelRef;
        });
    }
    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    _createOverlay(element, config) {
        const overlayConfig = this._getOverlayConfig(element, config);
        const overlayRef = this._overlay.create(overlayConfig);
        overlayRef.getConfig().hasBackdrop = !!config.hasBackdrop;
        // Consume the `keydownEvents` in order to prevent them from going to another overlay.
        // Ideally we'd also have our keyboard event logic in here, however doing so will
        // break anybody that may have implemented the `MatMenuPanel` themselves.
        overlayRef.keydownEvents().subscribe();
        return overlayRef;
    }
    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    _getOverlayConfig(element, config) {
        const positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(element)
            .withLockedPosition();
        return new OverlayConfig({
            positionStrategy,
            backdropClass: config.backdropClass || 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this._scrollStrategy(),
            direction: this.grid.dir,
        });
    }
    _getTemplatePortal(tRef, overlayPanelRef) {
        const context = {
            grid: this.grid,
            ref: overlayPanelRef,
        };
        return new TemplatePortal(tRef, this.vcRef, context);
    }
    _getComponentPortal(overlayPanelRef, componentExtension) {
        const portalInjector = Injector.create({
            providers: [
                { provide: PblNgridOverlayPanelRef, useValue: overlayPanelRef },
            ],
            parent: componentExtension.injector || this.injector,
        });
        return new ComponentPortal(componentExtension.component, this.vcRef, portalInjector, componentExtension.cfr || null);
    }
    _setPosition(positionStrategy, config) {
        let [originX, originFallbackX] = config.xPos === 'center'
            ? ['center', 'center']
            : config.xPos === 'before' ? ['end', 'start'] : ['start', 'end'];
        let [overlayY, overlayFallbackY] = config.yPos === 'center'
            ? ['center', 'center']
            : config.yPos === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];
        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        let offsetY = 0;
        if (!config.insetPos) {
            if (overlayY !== 'center') {
                originY = overlayY === 'top' ? 'bottom' : 'top';
            }
            if (overlayFallbackY !== 'center') {
                originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
            }
        }
        positionStrategy.withPositions([
            { originX, originY, overlayX, overlayY, offsetY },
            { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY },
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            }
        ]);
    }
    findNamesExtension(extName) {
        let match;
        this.grid.registry.forMulti('overlayPanels', values => {
            for (const value of values) {
                if (value.name === extName) {
                    match = value;
                    return true;
                }
            }
        });
        return match;
    }
}

class PblNgridOverlayPanelDef extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.kind = 'overlayPanels';
    }
}
/** @nocollapse */ PblNgridOverlayPanelDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelDef, deps: [{ token: i0.TemplateRef }, { token: i1$1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridOverlayPanelDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridOverlayPanelDef, selector: "[pblNgridOverlayPanelDef]", inputs: { name: ["pblNgridOverlayPanelDef", "name"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelDef, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridOverlayPanelDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1$1.PblNgridRegistryService }]; }, propDecorators: { name: [{
                type: Input,
                args: ['pblNgridOverlayPanelDef']
            }] } });

class PblNgridOverlayPanelModule {
}
/** @nocollapse */ PblNgridOverlayPanelModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridOverlayPanelModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, declarations: [PblNgridOverlayPanelDef], imports: [CommonModule,
        OverlayModule,
        BidiModule], exports: [PblNgridOverlayPanelDef] });
/** @nocollapse */ PblNgridOverlayPanelModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, providers: [
        PblNgridOverlayPanelFactory,
    ], imports: [CommonModule,
        OverlayModule,
        BidiModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridOverlayPanelModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        OverlayModule,
                        BidiModule,
                    ],
                    declarations: [
                        PblNgridOverlayPanelDef,
                    ],
                    exports: [
                        PblNgridOverlayPanelDef,
                    ],
                    providers: [
                        PblNgridOverlayPanelFactory,
                    ],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridOverlayPanel, PblNgridOverlayPanelComponentExtension, PblNgridOverlayPanelDef, PblNgridOverlayPanelFactory, PblNgridOverlayPanelModule, PblNgridOverlayPanelRef };
//# sourceMappingURL=pebula-ngrid-overlay-panel.mjs.map
