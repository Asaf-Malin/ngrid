export declare class Fragment {
    start: number;
    end: number;
    static calcEnd(startRow: number, count: number): number;
    get size(): number;
    get empty(): boolean;
    constructor(start: number, end: number);
    containsRow(rowIndex: number): boolean;
    equals(f: Fragment): boolean;
}
