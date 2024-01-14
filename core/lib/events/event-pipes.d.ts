import { Observable } from 'rxjs';
import { PblNgridEvents } from './ngrid-events';
export declare const ON_CONSTRUCTED: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridOnConstructedEvent>;
export declare const ON_INIT: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridOnInitEvent>;
export declare const ON_DESTROY: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridOnDestroyEvent>;
export declare const ON_BEFORE_INVALIDATE_HEADERS: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridBeforeInvalidateHeadersEvent>;
export declare const ON_INVALIDATE_HEADERS: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridOnInvalidateHeadersEvent>;
export declare const ON_RESIZE_ROW: (o: Observable<PblNgridEvents>) => Observable<import("./ngrid-events").PblNgridOnResizeRowEvent>;
