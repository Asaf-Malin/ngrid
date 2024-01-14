import { EventEmitter, NgZone } from '@angular/core';
import { PblNgridPluginController } from '../../../ext/plugin-control';
import { PblNgridComponent } from '../../ngrid.component';
import * as i0 from "@angular/core";
export declare class PblNgridScrolling<T = any> {
    /**
     * Event emitted when the scrolling state of rows in the table changes.
     * When scrolling starts `true` is emitted and when the scrolling ends `false` is emitted.
     *
     * The table is in "scrolling" state from the first scroll event and until 2 animation frames
     * have passed without a scroll event.
     *
     * When scrolling, the emitted value is the direction: -1 or 1
     * When not scrolling, the emitted value is 0.
     *
     * NOTE: This event runs outside the angular zone.
     */
    scrolling: EventEmitter<0 | 1 | -1>;
    constructor(table: PblNgridComponent<T>, pluginCtrl: PblNgridPluginController, zone: NgZone);
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridScrolling<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridScrolling<any>, "pbl-ngrid[scrolling]", never, {}, { "scrolling": "scrolling"; }, never, never, false>;
}
