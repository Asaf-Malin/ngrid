import { PblColumn } from '../model';
export declare class HiddenColumns {
    readonly hidden: Set<string>;
    readonly allHidden: Set<string>;
    private readonly indirect;
    constructor();
    add(columns: PblColumn[] | string[], indirect?: string): boolean;
    /**
     * Show the column.
     */
    remove(columns: PblColumn[] | string[], indirect?: string): boolean;
    clear(onlyHidden: boolean): void;
    syncAllHidden(): this;
}
