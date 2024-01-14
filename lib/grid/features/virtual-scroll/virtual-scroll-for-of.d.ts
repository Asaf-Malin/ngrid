import { Observable } from 'rxjs';
import { NgZone } from '@angular/core';
import { CollectionViewer, ListRange } from '@angular/cdk/collections';
import { PblNgridInternalExtensionApi } from '../../../ext/grid-ext-api';
export interface NgeVirtualTableRowInfo {
    readonly headerLength: number;
    readonly rowLength: number;
    readonly footerLength: number;
}
export declare class PblVirtualScrollForOf<T> implements CollectionViewer, NgeVirtualTableRowInfo {
    private ngZone;
    viewChange: Observable<ListRange>;
    dataStream: Observable<T[] | ReadonlyArray<T>>;
    get headerLength(): number;
    get rowLength(): number;
    get footerLength(): number;
    readonly wheelControl: {
        wheelListen: () => void;
        wheelUnListen: () => void;
        readonly listening: boolean;
    };
    private destroyed;
    private ds;
    private get vcRefs();
    private renderedContentOffset;
    /** A tuple containing the last known ranges [header, data, footer] */
    private _renderedRanges;
    /** The length of meta rows [0] = header [1] = footer */
    private metaRows;
    private header;
    private footer;
    private grid;
    private cdkTable;
    private viewport;
    constructor(extApi: PblNgridInternalExtensionApi<T>, ngZone: NgZone);
    /**
     * Measures the combined size (width for horizontal orientation, height for vertical) of all items
     * in the specified range. Throws an error if the range includes items that are not currently
     * rendered.
     */
    measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number;
    destroy(): void;
    private initWheelControl;
    private attachView;
    private detachView;
}
