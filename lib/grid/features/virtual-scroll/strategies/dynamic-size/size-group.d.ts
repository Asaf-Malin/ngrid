export declare class SizeGroup {
    readonly groupIndex: number;
    private readonly maxItems;
    readonly dsStart: number;
    readonly dsEnd: number;
    rawTotal: number;
    length: number;
    items: number[];
    constructor(groupIndex: number, maxItems: number);
    set(dsIndex: number, height: number): void;
    remove(dsIndex: number): boolean;
    has(dsIndex: number): boolean;
    clear(): void;
    getItemSize(dsIndex: number): number;
    getSizeBefore(dsIndex: number, itemSize: number): number;
    getSize(itemSize: number): number;
    getSubSize(dsIndexStart: number, dsIndexEnd: number, itemSize: number): number;
    getSizeAfter(dsIndex: number, itemSize: number): number;
    getRawDiffSize(itemSize: number): number;
}
