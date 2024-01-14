import { ElementRef } from '@angular/core';
import { PblNgridDataHeaderExtensionContext } from '@pebula/ngrid';
import { PblNgridMatHeaderContextMenuPlugin } from './header-context-menu.directive';
import * as i0 from "@angular/core";
export declare class MatHeaderContextMenuTrigger {
    private plugin;
    private elRef;
    context: PblNgridDataHeaderExtensionContext;
    constructor(plugin: PblNgridMatHeaderContextMenuPlugin, elRef: ElementRef<HTMLElement>);
    openOverlayPanel(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHeaderContextMenuTrigger, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatHeaderContextMenuTrigger, "div[mat-header-context-menu-trigger]", never, {}, {}, never, never, false>;
}
