import { TemplateRef, AfterViewInit } from '@angular/core';
import { PblNgridComponent } from '../ngrid.component';
import * as i0 from "@angular/core";
/**
 * A directive that marks the template as a projected section inside the grid.
 * The location of the project content is set by the position input.
 *
 * Note that this directive can only be set as the content inside the grid.
 */
export declare class PblNgridOuterSectionDirective implements AfterViewInit {
    private grid;
    private tRef;
    position: 'top' | 'bottom';
    constructor(grid: PblNgridComponent<any>, tRef: TemplateRef<{
        $implicit: PblNgridComponent<any>;
    }>);
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridOuterSectionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridOuterSectionDirective, "[pblNgridOuterSection]", never, { "position": "pblNgridOuterSection"; }, {}, never, never, false>;
}
