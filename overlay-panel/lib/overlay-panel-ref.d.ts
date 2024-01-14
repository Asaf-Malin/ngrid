import { Observable } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
export declare class PblNgridOverlayPanelRef<T = any> {
    private overlayRef;
    readonly data?: T;
    closed: Observable<void>;
    private _closed$;
    constructor(overlayRef: OverlayRef, data?: T);
    close(): void;
    private _closingActions;
}
