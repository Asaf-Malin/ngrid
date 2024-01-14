import { ComponentFactory, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { MatSortHeader } from '@angular/material/sort';
import { PblNgridMultiComponentRegistry, PblNgridDataHeaderExtensionContext } from '@asafmalin/ngrid';
export declare class MatSortExtension extends PblNgridMultiComponentRegistry<MatSortHeader, 'dataHeaderExtensions'> {
    private cfr;
    readonly name: 'sortContainer';
    readonly kind: 'dataHeaderExtensions';
    readonly projectContent = true;
    constructor(cfr: ComponentFactoryResolver);
    shouldRender(context: PblNgridDataHeaderExtensionContext): boolean;
    getFactory(context: PblNgridDataHeaderExtensionContext): ComponentFactory<MatSortHeader>;
    onCreated(context: PblNgridDataHeaderExtensionContext, cmpRef: ComponentRef<MatSortHeader>): void;
    /**
     * Check that the current `MatSort` does not already have a sortable header with the provided id.
     */
    private deregisterId;
}
