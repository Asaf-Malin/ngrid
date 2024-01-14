export declare class Sizer {
    itemSize: number;
    itemsLength: number;
    protected groupSize: number;
    private groups;
    constructor(groupSize?: number);
    clear(): void;
    setSize(dsIndex: number, height: number): void;
    getTotalContentSize(): number;
    getSizeForItem(dsIndex: number): number;
    getSizeBefore(dsIndex: number): number;
    getSizeForRange(dsIndexStart: number, dsIndexEnd: number): number;
    getSizeAfter(dsIndex: number): number;
    findRenderItemAtOffset(offset: number): number;
    protected getGroupIndex(dsIndex: number): number;
}
