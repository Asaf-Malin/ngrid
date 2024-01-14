import { Observable, BehaviorSubject } from 'rxjs';
import { PblPaginator, PblPaginatorChangeEvent } from './types';
export declare class PblPagingPaginator implements PblPaginator<number> {
    readonly kind: 'pageNumber';
    noCacheMode: boolean;
    get perPage(): number;
    set perPage(value: number);
    /**
     * Get / Set the current page
     */
    get page(): number;
    set page(value: number);
    get total(): number;
    set total(value: number);
    /**
     * The amount of pages in this paginator
     */
    get totalPages(): number;
    get range(): [number, number];
    readonly onChange: Observable<PblPaginatorChangeEvent<number>>;
    protected onChange$: BehaviorSubject<PblPaginatorChangeEvent<number>>;
    private _total;
    private _perPage;
    private _page;
    private _totalPages;
    private _range;
    private queuedChanges;
    constructor();
    canMove(value: number): boolean;
    hasNext(): boolean;
    hasPrev(): boolean;
    move(value: number): void;
    nextPage(): void;
    prevPage(): void;
    reset(): void;
    /**
     * Calculate the number of pages.
     * returns true if the current page has changed due to calculation. (current page \> new pages value)
     */
    protected calcPages(): void;
    private emit;
}
