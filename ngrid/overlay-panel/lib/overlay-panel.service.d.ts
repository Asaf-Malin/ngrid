import { ElementRef, NgZone } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { PblNgridComponent, PblNgridMultiTemplateRegistry } from '@asafmalin/ngrid';
import { PblNgridOverlayPanelComponentExtension } from './component-registry-extension';
import { PblNgridOverlayPanelRef } from './overlay-panel-ref';
import * as i0 from "@angular/core";
declare module '@asafmalin/ngrid/core/lib/registry/types' {
    interface PblNgridMultiRegistryMap {
        overlayPanels?: PblNgridMultiTemplateRegistry<any, 'overlayPanels'> | PblNgridOverlayPanelComponentExtension<any>;
    }
}
export interface PblNgridOverlayPanelConfig {
    hasBackdrop?: boolean;
    backdropClass?: string;
    xPos?: 'before' | 'center' | 'after';
    yPos?: 'above' | 'center' | 'below';
    insetPos?: boolean;
}
export declare class PblNgridOverlayPanelFactory {
    private _overlay;
    private zone;
    constructor(_overlay: Overlay, zone: NgZone);
    create<T>(grid: PblNgridComponent<T>): PblNgridOverlayPanel<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridOverlayPanelFactory, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PblNgridOverlayPanelFactory>;
}
export declare class PblNgridOverlayPanel<T = any> {
    private _overlay;
    private zone;
    readonly grid: PblNgridComponent<T>;
    private vcRef;
    private injector;
    private _scrollStrategy;
    constructor(_overlay: Overlay, zone: NgZone, grid: PblNgridComponent<T>);
    /**
     * Opens a panel relative to a cell element using the overlay panel extension registry template/component with the name provided in `extName`.
     * The cell element is referenced by the `columnId` and the `rowRenderPosition`.
     *
     * If the `rowRenderPosition` is "header" or "footer" then the grid's header / footer rows are targeted, otherwise the number provided should reference
     * the rendered row index to use to get the cell from.
     *
     * > Note that this helper method does not allow targeting meta cells.
     */
    openGridCell<T = any>(extName: string, columnId: string, rowRenderPosition: number | 'header' | 'footer', config?: PblNgridOverlayPanelConfig, data?: T): PblNgridOverlayPanelRef<T>;
    open<T = any>(extName: string, source: ElementRef<HTMLElement>, config?: PblNgridOverlayPanelConfig, data?: T): PblNgridOverlayPanelRef<T>;
    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    private _createOverlay;
    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    private _getOverlayConfig;
    private _getTemplatePortal;
    private _getComponentPortal;
    private _setPosition;
    private findNamesExtension;
}
