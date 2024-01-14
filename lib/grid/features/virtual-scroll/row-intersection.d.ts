import { Observable } from 'rxjs';
export declare class RowIntersectionTracker {
    get observerMode(): boolean;
    readonly intersectionChanged: Observable<IntersectionObserverEntry[]>;
    private readonly intersectionObserver;
    constructor(rootElement: HTMLElement, forceManual?: boolean);
    snapshot(): IntersectionObserverEntry[];
    track(element: HTMLElement): void;
    untrack(element: HTMLElement): void;
    destroy(): void;
}
