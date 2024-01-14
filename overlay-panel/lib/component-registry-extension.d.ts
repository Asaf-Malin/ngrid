import { ComponentRef, Type, ComponentFactoryResolver, ComponentFactory, Injector } from '@angular/core';
import { PblNgridMultiComponentRegistry } from '@pebula/ngrid';
export declare class PblNgridOverlayPanelComponentExtension<T> extends PblNgridMultiComponentRegistry<T, 'overlayPanels'> {
    component: Type<T>;
    cfr?: ComponentFactoryResolver;
    injector?: Injector;
    readonly name: string;
    readonly kind: 'overlayPanels';
    readonly projectContent = false;
    constructor(name: string, component: Type<T>, cfr?: ComponentFactoryResolver, injector?: Injector);
    getFactory(context: any): ComponentFactory<T>;
    onCreated(context: any, cmpRef: ComponentRef<T>): void;
}
