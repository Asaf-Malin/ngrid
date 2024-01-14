import { ComponentFactory, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { PblNgridMultiComponentRegistry, PblNgridDataHeaderExtensionContext } from '@pebula/ngrid';
import { MatHeaderContextMenuTrigger } from './header-context-menu-trigger';
export declare class MatHeaderContextMenuExtension extends PblNgridMultiComponentRegistry<MatHeaderContextMenuTrigger, 'dataHeaderExtensions'> {
    private cfr;
    readonly name: 'matHeaderContextMenuTrigger';
    readonly kind: 'dataHeaderExtensions';
    readonly projectContent = false;
    constructor(cfr: ComponentFactoryResolver);
    shouldRender(context: PblNgridDataHeaderExtensionContext): boolean;
    getFactory(context: PblNgridDataHeaderExtensionContext): ComponentFactory<MatHeaderContextMenuTrigger>;
    onCreated(context: PblNgridDataHeaderExtensionContext, cmpRef: ComponentRef<MatHeaderContextMenuTrigger>): void;
}
