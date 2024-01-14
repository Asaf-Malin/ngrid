import { TemplateRef, Injector } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblColumn } from '../../column/model';
import { MetaCellContext } from '../../context/index';
import { PblNgridHeaderCellComponent } from '../../cell/header-cell.component';
import { PblNgridMultiTemplateRegistry } from './multi-template.directives';
import { PblNgridMultiComponentRegistry } from './multi-component';
import * as i0 from "@angular/core";
export declare class PblNgridDataHeaderExtensionContext<T = any> extends MetaCellContext<T, PblColumn> {
    readonly injector: Injector;
    protected constructor();
    static createDateHeaderCtx<T = any>(headerCell: PblNgridHeaderCellComponent<PblColumn>, injector: Injector): PblNgridDataHeaderExtensionContext<T>;
}
export interface PblNgridDataHeaderExtensionRef<T = any> {
    shouldRender?(context: PblNgridDataHeaderExtensionContext<T>): boolean;
}
/**
 * A generic, multi-purpose template reference for data header extensions.
 * The template's context is `PblNgridDataHeaderExtensionContext`:
 *
 * ```ts
 * interface PblNgridDataHeaderExtensionContext {
 *   col: PblMetaColumn;
 *   grid: PblNgridComponent<any>;
 *   injector: Injector;
 * }
 * ```
 *
 * By default it will render if registered but it is possible to provide a predicate to conditionally load it.
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="let ctx"></div>
 * ````
 *
 * Or with a `shouldRender` predicate:
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="shouldRender; let ctx"></div>
 * ```
 *
 * And in the component the template is defined on:
 *
 * ```ts
 * class MyComponent {
 *
 *   shouldRender = (context: PblNgridDataHeaderExtensionContext) => {
 *     // Some code returning true or false
 *   }
 * }
 * ```
 *
 * Note that the `shouldRender` predicate is run once when the header initialize.
 */
export declare class PblNgridHeaderExtensionRefDirective extends PblNgridMultiTemplateRegistry<PblNgridDataHeaderExtensionContext, 'dataHeaderExtensions'> implements PblNgridDataHeaderExtensionRef {
    private static _id;
    readonly name: string;
    readonly kind: 'dataHeaderExtensions';
    shouldRender?: (context: PblNgridDataHeaderExtensionContext) => boolean;
    constructor(tRef: TemplateRef<PblNgridDataHeaderExtensionContext>, registry: PblNgridRegistryService);
    static ngAcceptInputType_shouldRender: string | ((context: PblNgridDataHeaderExtensionContext) => boolean);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridHeaderExtensionRefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridHeaderExtensionRefDirective, "[pblNgridHeaderExtensionRef]", never, { "shouldRender": "pblNgridHeaderExtensionRef"; }, {}, never, never, false>;
}
declare module '@pebula/ngrid/core/lib/registry/types' {
    interface PblNgridMultiRegistryMap {
        dataHeaderExtensions?: (PblNgridMultiTemplateRegistry<PblNgridDataHeaderExtensionContext, 'dataHeaderExtensions'> & PblNgridDataHeaderExtensionRef) | (PblNgridMultiComponentRegistry<any, 'dataHeaderExtensions'> & PblNgridDataHeaderExtensionRef);
    }
}
