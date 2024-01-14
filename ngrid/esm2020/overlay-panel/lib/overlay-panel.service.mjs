import { Injectable, ViewContainerRef, ElementRef, Injector, NgZone } from '@angular/core';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal, ComponentPortal } from '@angular/cdk/portal';
import { PblNgridPluginController, PblNgridMultiTemplateRegistry } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelRef } from './overlay-panel-ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
const DEFAULT_OVERLAY_PANEL_CONFIG = {
    hasBackdrop: false,
    xPos: 'center',
    yPos: 'center',
    insetPos: false,
};
export class PblNgridOverlayPanelFactory {
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
export class PblNgridOverlayPanel {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1wYW5lbC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9vdmVybGF5LXBhbmVsL3NyYy9saWIvb3ZlcmxheS1wYW5lbC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEcsT0FBTyxFQUdMLE9BQU8sRUFDUCxhQUFhLEdBSWQsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSx3QkFBd0IsRUFBcUIsNkJBQTZCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0csT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUJBQXFCLENBQUM7OztBQW1COUQsTUFBTSw0QkFBNEIsR0FBK0I7SUFDL0QsV0FBVyxFQUFFLEtBQUs7SUFDbEIsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFJLEVBQUUsUUFBUTtJQUNkLFFBQVEsRUFBRSxLQUFLO0NBQ2hCLENBQUM7QUFHRixNQUFNLE9BQU8sMkJBQTJCO0lBQ3RDLFlBQW9CLFFBQWlCLEVBQVUsSUFBWTtRQUF2QyxhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUFJLENBQUM7SUFFaEUsTUFBTSxDQUFJLElBQTBCO1FBQ2xDLE9BQU8sSUFBSSxvQkFBb0IsQ0FBSSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckUsQ0FBQzs7MklBTFUsMkJBQTJCOytJQUEzQiwyQkFBMkI7MkZBQTNCLDJCQUEyQjtrQkFEdkMsVUFBVTs7QUFTWCxNQUFNLE9BQU8sb0JBQW9CO0lBTS9CLFlBQW9C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QkFDZCxPQUFPLElBQUksQ0FBQztpQkFDYjthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIFZpZXdDb250YWluZXJSZWYsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBUZW1wbGF0ZVJlZiwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgSG9yaXpvbnRhbENvbm5lY3Rpb25Qb3MsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG4gIFZlcnRpY2FsQ29ubmVjdGlvblBvcyxcbiAgU2Nyb2xsU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFRlbXBsYXRlUG9ydGFsLCBDb21wb25lbnRQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IFBibE5ncmlkUGx1Z2luQ29udHJvbGxlciwgUGJsTmdyaWRDb21wb25lbnQsIFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5cbmltcG9ydCB7IFBibE5ncmlkT3ZlcmxheVBhbmVsQ29tcG9uZW50RXh0ZW5zaW9uIH0gZnJvbSAnLi9jb21wb25lbnQtcmVnaXN0cnktZXh0ZW5zaW9uJztcbmltcG9ydCB7IFBibE5ncmlkT3ZlcmxheVBhbmVsUmVmIH0gZnJvbSAnLi9vdmVybGF5LXBhbmVsLXJlZic7XG5pbXBvcnQgeyBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbnRleHQgfSBmcm9tICcuL292ZXJsYXktcGFuZWwtZGVmJztcblxuZGVjbGFyZSBtb2R1bGUgJ0BwZWJ1bGEvbmdyaWQvY29yZS9saWIvcmVnaXN0cnkvdHlwZXMnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkTXVsdGlSZWdpc3RyeU1hcCB7XG4gICAgb3ZlcmxheVBhbmVscz86XG4gICAgICB8IFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5PGFueSwgJ292ZXJsYXlQYW5lbHMnPlxuICAgICAgfCBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbXBvbmVudEV4dGVuc2lvbjxhbnk+O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGJsTmdyaWRPdmVybGF5UGFuZWxDb25maWcge1xuICBoYXNCYWNrZHJvcD86IGJvb2xlYW47XG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmc7XG4gIHhQb3M/OiAnYmVmb3JlJyB8ICdjZW50ZXInIHwgJ2FmdGVyJztcbiAgeVBvcz86ICdhYm92ZScgfCAnY2VudGVyJyB8ICdiZWxvdyc7XG4gIGluc2V0UG9zPzogYm9vbGVhbjtcbn1cblxuY29uc3QgREVGQVVMVF9PVkVSTEFZX1BBTkVMX0NPTkZJRzogUGJsTmdyaWRPdmVybGF5UGFuZWxDb25maWcgPSB7XG4gIGhhc0JhY2tkcm9wOiBmYWxzZSxcbiAgeFBvczogJ2NlbnRlcicsXG4gIHlQb3M6ICdjZW50ZXInLFxuICBpbnNldFBvczogZmFsc2UsXG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRPdmVybGF5UGFuZWxGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSwgcHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHsgfVxuXG4gIGNyZWF0ZTxUPihncmlkOiBQYmxOZ3JpZENvbXBvbmVudDxUPik6IFBibE5ncmlkT3ZlcmxheVBhbmVsPFQ+IHtcbiAgICByZXR1cm4gbmV3IFBibE5ncmlkT3ZlcmxheVBhbmVsPFQ+KHRoaXMuX292ZXJsYXksIHRoaXMuem9uZSwgZ3JpZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBibE5ncmlkT3ZlcmxheVBhbmVsPFQgPSBhbnk+IHtcblxuICBwcml2YXRlIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgICAgICAgICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8VD4pIHtcbiAgICBjb25zdCBjb250cm9sbGVyID0gUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLmZpbmQoZ3JpZCk7XG4gICAgdGhpcy5pbmplY3RvciA9IGNvbnRyb2xsZXIuaW5qZWN0b3I7XG4gICAgdGhpcy52Y1JlZiA9IGNvbnRyb2xsZXIuaW5qZWN0b3IuZ2V0KFZpZXdDb250YWluZXJSZWYpO1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gKCkgPT4gX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBPcGVucyBhIHBhbmVsIHJlbGF0aXZlIHRvIGEgY2VsbCBlbGVtZW50IHVzaW5nIHRoZSBvdmVybGF5IHBhbmVsIGV4dGVuc2lvbiByZWdpc3RyeSB0ZW1wbGF0ZS9jb21wb25lbnQgd2l0aCB0aGUgbmFtZSBwcm92aWRlZCBpbiBgZXh0TmFtZWAuXG4gICAqIFRoZSBjZWxsIGVsZW1lbnQgaXMgcmVmZXJlbmNlZCBieSB0aGUgYGNvbHVtbklkYCBhbmQgdGhlIGByb3dSZW5kZXJQb3NpdGlvbmAuXG4gICAqXG4gICAqIElmIHRoZSBgcm93UmVuZGVyUG9zaXRpb25gIGlzIFwiaGVhZGVyXCIgb3IgXCJmb290ZXJcIiB0aGVuIHRoZSBncmlkJ3MgaGVhZGVyIC8gZm9vdGVyIHJvd3MgYXJlIHRhcmdldGVkLCBvdGhlcndpc2UgdGhlIG51bWJlciBwcm92aWRlZCBzaG91bGQgcmVmZXJlbmNlXG4gICAqIHRoZSByZW5kZXJlZCByb3cgaW5kZXggdG8gdXNlIHRvIGdldCB0aGUgY2VsbCBmcm9tLlxuICAgKlxuICAgKiA+IE5vdGUgdGhhdCB0aGlzIGhlbHBlciBtZXRob2QgZG9lcyBub3QgYWxsb3cgdGFyZ2V0aW5nIG1ldGEgY2VsbHMuXG4gICAqL1xuICBvcGVuR3JpZENlbGw8VCA9IGFueT4oZXh0TmFtZTogc3RyaW5nLCBjb2x1bW5JZDogc3RyaW5nLCByb3dSZW5kZXJQb3NpdGlvbjogbnVtYmVyIHwgJ2hlYWRlcicgfCAnZm9vdGVyJywgY29uZmlnPzogUGJsTmdyaWRPdmVybGF5UGFuZWxDb25maWcsIGRhdGE/OiBUKTogUGJsTmdyaWRPdmVybGF5UGFuZWxSZWY8VD4ge1xuICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMuZ3JpZC5jb2x1bW5BcGkuZmluZENvbHVtbihjb2x1bW5JZCk7XG4gICAgaWYgKCFjb2x1bW4pIHtcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCB0aGUgY29sdW1uICcgKyBjb2x1bW5JZCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlY3Rpb246ICd0YWJsZScgfCAnaGVhZGVyJyB8ICdmb290ZXInO1xuICAgIGxldCByb3dSZW5kZXJJbmRleCA9IDA7XG4gICAgc3dpdGNoIChyb3dSZW5kZXJQb3NpdGlvbikge1xuICAgICAgY2FzZSAnaGVhZGVyJzpcbiAgICAgIGNhc2UgJ2Zvb3Rlcic6XG4gICAgICAgIHNlY3Rpb24gPSByb3dSZW5kZXJQb3NpdGlvbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHJvd1JlbmRlclBvc2l0aW9uID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHNlY3Rpb24gPSAndGFibGUnO1xuICAgICAgICAgIHJvd1JlbmRlckluZGV4ID0gcm93UmVuZGVyUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFzZWN0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInJvd1JlbmRlclBvc2l0aW9uXCIgcHJvdmlkZWQsIHVzZSBcImhlYWRlclwiLCBcImZvb3RlclwiIG9yIGFueSBudW1iZXIgPj0gMC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbCA9IGNvbHVtbiAmJiBjb2x1bW4uY29sdW1uRGVmLnF1ZXJ5Q2VsbEVsZW1lbnRzKHNlY3Rpb24pW3Jvd1JlbmRlckluZGV4XTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBjZWxsIGZvciB0aGUgY29sdW1uICR7Y29sdW1uSWR9IGF0IHJlbmRlciBpbmRleCAke3Jvd1JlbmRlckluZGV4fWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wZW4oZXh0TmFtZSwgbmV3IEVsZW1lbnRSZWYoZWwpLCBjb25maWcsIGRhdGEpO1xuICB9XG5cbiAgb3BlbjxUID0gYW55PihleHROYW1lOiBzdHJpbmcsIHNvdXJjZTogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIGNvbmZpZz86IFBibE5ncmlkT3ZlcmxheVBhbmVsQ29uZmlnLCBkYXRhPzogVCk6IFBibE5ncmlkT3ZlcmxheVBhbmVsUmVmPFQ+IHtcbiAgICBjb25maWcgPSBPYmplY3QuYXNzaWduKHsgLi4uREVGQVVMVF9PVkVSTEFZX1BBTkVMX0NPTkZJRyB9LCBjb25maWcgfHwge30pO1xuICAgIGNvbnN0IG1hdGNoID0gdGhpcy5maW5kTmFtZXNFeHRlbnNpb24oZXh0TmFtZSk7XG5cbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgdGhlIG92ZXJsYXkgcGFuZWwgd2l0aCB0aGUgbmFtZSAnICsgZXh0TmFtZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoc291cmNlLCBjb25maWcpO1xuICAgICAgY29uc3Qgb3ZlcmxheVBhbmVsUmVmID0gbmV3IFBibE5ncmlkT3ZlcmxheVBhbmVsUmVmKG92ZXJsYXlSZWYsIGRhdGEpO1xuICAgICAgdGhpcy5fc2V0UG9zaXRpb24ob3ZlcmxheVJlZi5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSwgY29uZmlnKTtcblxuICAgICAgaWYgKG1hdGNoIGluc3RhbmNlb2YgUGJsTmdyaWRNdWx0aVRlbXBsYXRlUmVnaXN0cnkpIHtcbiAgICAgICAgY29uc3QgdFBvcnRhbCA9IHRoaXMuX2dldFRlbXBsYXRlUG9ydGFsKG1hdGNoLnRSZWYsIG92ZXJsYXlQYW5lbFJlZik7XG4gICAgICAgIGNvbnN0IHZpZXdSZWYgPSBvdmVybGF5UmVmLmF0dGFjaCh0UG9ydGFsKTtcbiAgICAgICAgdmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgdmlld1JlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjUG9ydGFsID0gdGhpcy5fZ2V0Q29tcG9uZW50UG9ydGFsKG92ZXJsYXlQYW5lbFJlZiwgbWF0Y2gpXG4gICAgICAgIGNvbnN0IGNtcFJlZiA9IG92ZXJsYXlSZWYuYXR0YWNoKGNQb3J0YWwpO1xuICAgICAgICBtYXRjaC5vbkNyZWF0ZWQobnVsbCwgY21wUmVmKTtcbiAgICAgIH1cblxuICAgICAgb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgcmV0dXJuIG92ZXJsYXlQYW5lbFJlZjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIHRoZSBvdmVybGF5IGZyb20gdGhlIHByb3ZpZGVkIG1lbnUncyB0ZW1wbGF0ZSBhbmQgc2F2ZXMgaXRzXG4gICAqIE92ZXJsYXlSZWYgc28gdGhhdCBpdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSB3aGVuIG9wZW5NZW51IGlzIGNhbGxlZC5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXkoZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIGNvbmZpZzogUGJsTmdyaWRPdmVybGF5UGFuZWxDb25maWcpOiBPdmVybGF5UmVmIHtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gdGhpcy5fZ2V0T3ZlcmxheUNvbmZpZyhlbGVtZW50LCBjb25maWcpO1xuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZShvdmVybGF5Q29uZmlnKTtcbiAgICBvdmVybGF5UmVmLmdldENvbmZpZygpLmhhc0JhY2tkcm9wID0gISFjb25maWcuaGFzQmFja2Ryb3BcbiAgICAvLyBDb25zdW1lIHRoZSBga2V5ZG93bkV2ZW50c2AgaW4gb3JkZXIgdG8gcHJldmVudCB0aGVtIGZyb20gZ29pbmcgdG8gYW5vdGhlciBvdmVybGF5LlxuICAgIC8vIElkZWFsbHkgd2UnZCBhbHNvIGhhdmUgb3VyIGtleWJvYXJkIGV2ZW50IGxvZ2ljIGluIGhlcmUsIGhvd2V2ZXIgZG9pbmcgc28gd2lsbFxuICAgIC8vIGJyZWFrIGFueWJvZHkgdGhhdCBtYXkgaGF2ZSBpbXBsZW1lbnRlZCB0aGUgYE1hdE1lbnVQYW5lbGAgdGhlbXNlbHZlcy5cbiAgICBvdmVybGF5UmVmLmtleWRvd25FdmVudHMoKS5zdWJzY3JpYmUoKTtcblxuICAgIHJldHVybiBvdmVybGF5UmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGJ1aWxkcyB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgbmVlZGVkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheSwgdGhlIE92ZXJsYXlTdGF0ZS5cbiAgICogQHJldHVybnMgT3ZlcmxheUNvbmZpZ1xuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNvbmZpZyhlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgY29uZmlnOiBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbmZpZyk6IE92ZXJsYXlDb25maWcge1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oZWxlbWVudClcbiAgICAgIC53aXRoTG9ja2VkUG9zaXRpb24oKTtcblxuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LFxuICAgICAgYmFja2Ryb3BDbGFzczogY29uZmlnLmJhY2tkcm9wQ2xhc3MgfHwgJ2Nkay1vdmVybGF5LXRyYW5zcGFyZW50LWJhY2tkcm9wJywgLy8gVE9ETzogZG9uJ3QgdXNlIHRoZSBjZGsncyBjbGFzcywgY3JlYXRlIGl0XG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5ncmlkLmRpcixcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFRlbXBsYXRlUG9ydGFsKHRSZWY6IFRlbXBsYXRlUmVmPFBibE5ncmlkT3ZlcmxheVBhbmVsQ29udGV4dD4sIG92ZXJsYXlQYW5lbFJlZjogUGJsTmdyaWRPdmVybGF5UGFuZWxSZWYpIHtcbiAgICBjb25zdCBjb250ZXh0OiBQYmxOZ3JpZE92ZXJsYXlQYW5lbENvbnRleHQgPSB7XG4gICAgICBncmlkOiB0aGlzLmdyaWQsXG4gICAgICByZWY6IG92ZXJsYXlQYW5lbFJlZixcbiAgICB9O1xuICAgIHJldHVybiBuZXcgVGVtcGxhdGVQb3J0YWwodFJlZiwgdGhpcy52Y1JlZiwgY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDb21wb25lbnRQb3J0YWwob3ZlcmxheVBhbmVsUmVmOiBQYmxOZ3JpZE92ZXJsYXlQYW5lbFJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEV4dGVuc2lvbjogUGJsTmdyaWRPdmVybGF5UGFuZWxDb21wb25lbnRFeHRlbnNpb248YW55Pikge1xuICAgIGNvbnN0IHBvcnRhbEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IFBibE5ncmlkT3ZlcmxheVBhbmVsUmVmLCB1c2VWYWx1ZTogb3ZlcmxheVBhbmVsUmVmIH0sXG4gICAgICBdLFxuICAgICAgcGFyZW50OiBjb21wb25lbnRFeHRlbnNpb24uaW5qZWN0b3IgfHwgdGhpcy5pbmplY3RvcixcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudFBvcnRhbChjb21wb25lbnRFeHRlbnNpb24uY29tcG9uZW50LCB0aGlzLnZjUmVmLCBwb3J0YWxJbmplY3RvciwgY29tcG9uZW50RXh0ZW5zaW9uLmNmciB8fCBudWxsKVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0UG9zaXRpb24ocG9zaXRpb25TdHJhdGVneTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LCBjb25maWc6IFBibE5ncmlkT3ZlcmxheVBhbmVsQ29uZmlnKSB7XG4gICAgbGV0IFtvcmlnaW5YLCBvcmlnaW5GYWxsYmFja1hdOiBIb3Jpem9udGFsQ29ubmVjdGlvblBvc1tdID1cbiAgICAgIGNvbmZpZy54UG9zID09PSAnY2VudGVyJ1xuICAgICAgICA/IFsnY2VudGVyJywgJ2NlbnRlciddXG4gICAgICAgIDogY29uZmlnLnhQb3MgPT09ICdiZWZvcmUnID8gWydlbmQnLCAnc3RhcnQnXSA6IFsnc3RhcnQnLCAnZW5kJ107XG5cbiAgICBsZXQgW292ZXJsYXlZLCBvdmVybGF5RmFsbGJhY2tZXTogVmVydGljYWxDb25uZWN0aW9uUG9zW10gPVxuICAgICAgY29uZmlnLnlQb3MgPT09ICdjZW50ZXInXG4gICAgICAgID8gWydjZW50ZXInLCAnY2VudGVyJ11cbiAgICAgICAgOiBjb25maWcueVBvcyA9PT0gJ2Fib3ZlJyA/IFsnYm90dG9tJywgJ3RvcCddIDogWyd0b3AnLCAnYm90dG9tJ107XG5cbiAgICBsZXQgW29yaWdpblksIG9yaWdpbkZhbGxiYWNrWV0gPSBbb3ZlcmxheVksIG92ZXJsYXlGYWxsYmFja1ldO1xuICAgIGxldCBbb3ZlcmxheVgsIG92ZXJsYXlGYWxsYmFja1hdID0gW29yaWdpblgsIG9yaWdpbkZhbGxiYWNrWF07XG4gICAgbGV0IG9mZnNldFkgPSAwO1xuXG4gICAgaWYgKCFjb25maWcuaW5zZXRQb3MpIHtcbiAgICAgIGlmIChvdmVybGF5WSAhPT0gJ2NlbnRlcicpIHtcbiAgICAgICAgb3JpZ2luWSA9IG92ZXJsYXlZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxheUZhbGxiYWNrWSAhPT0gJ2NlbnRlcicpIHtcbiAgICAgICAgb3JpZ2luRmFsbGJhY2tZID0gb3ZlcmxheUZhbGxiYWNrWSA9PT0gJ3RvcCcgPyAnYm90dG9tJyA6ICd0b3AnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBvc2l0aW9uU3RyYXRlZ3kud2l0aFBvc2l0aW9ucyhbXG4gICAgICB7b3JpZ2luWCwgb3JpZ2luWSwgb3ZlcmxheVgsIG92ZXJsYXlZLCBvZmZzZXRZfSxcbiAgICAgIHtvcmlnaW5YOiBvcmlnaW5GYWxsYmFja1gsIG9yaWdpblksIG92ZXJsYXlYOiBvdmVybGF5RmFsbGJhY2tYLCBvdmVybGF5WSwgb2Zmc2V0WX0sXG4gICAgICB7XG4gICAgICAgIG9yaWdpblgsXG4gICAgICAgIG9yaWdpblk6IG9yaWdpbkZhbGxiYWNrWSxcbiAgICAgICAgb3ZlcmxheVgsXG4gICAgICAgIG92ZXJsYXlZOiBvdmVybGF5RmFsbGJhY2tZLFxuICAgICAgICBvZmZzZXRZOiAtb2Zmc2V0WVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgb3JpZ2luWDogb3JpZ2luRmFsbGJhY2tYLFxuICAgICAgICBvcmlnaW5ZOiBvcmlnaW5GYWxsYmFja1ksXG4gICAgICAgIG92ZXJsYXlYOiBvdmVybGF5RmFsbGJhY2tYLFxuICAgICAgICBvdmVybGF5WTogb3ZlcmxheUZhbGxiYWNrWSxcbiAgICAgICAgb2Zmc2V0WTogLW9mZnNldFlcbiAgICAgIH1cbiAgICBdKTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZE5hbWVzRXh0ZW5zaW9uKGV4dE5hbWU6IHN0cmluZykge1xuICAgIGxldCBtYXRjaDogUGJsTmdyaWRNdWx0aVRlbXBsYXRlUmVnaXN0cnk8UGJsTmdyaWRPdmVybGF5UGFuZWxDb250ZXh0LCAnb3ZlcmxheVBhbmVscyc+IHwgUGJsTmdyaWRPdmVybGF5UGFuZWxDb21wb25lbnRFeHRlbnNpb248YW55PjtcbiAgICB0aGlzLmdyaWQucmVnaXN0cnkuZm9yTXVsdGkoJ292ZXJsYXlQYW5lbHMnLCB2YWx1ZXMgPT4ge1xuICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlLm5hbWUgPT09IGV4dE5hbWUpIHtcbiAgICAgICAgICBtYXRjaCA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoO1xuICB9XG59XG5cblxuIl19