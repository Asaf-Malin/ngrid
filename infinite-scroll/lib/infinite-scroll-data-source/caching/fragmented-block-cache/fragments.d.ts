import { RowSequence, StartOrEnd } from '../cache-adapter';
import { Fragment } from './fragment';
export declare class Fragments extends Array<Fragment> {
    private dirty;
    private _size;
    get size(): number;
    remove(startRow: number, count: number, startFrom?: number): RowSequence[];
    removeItems(count: number, location: StartOrEnd): RowSequence[];
    clear(): RowSequence[];
    /**
     * Returns the first row index of a missing row that is the most close (based on the direction) to the provided rowIndex.
     * If the provided rowIndex is missing, returns the provided rowIndex.
     * Note that when the direction is -1 the closest missing row might be -1, i.e. all rows are in-place and nothing is missing
     */
    findClosestMissing(rowIndex: number, direction: StartOrEnd): number;
    containsRange(startRow: number, endRow: number): boolean;
    /**
     * Search all fragments and find the index of the fragments that contains a specific row index
     */
    searchByRow(rowIndex: number, startFrom?: number): number;
    /**
     * Search for the row that either contain the rowIndex or is the closest to it (from the start)
     * I.e, if no fragment contains the rowIndex, the closest fragment to it will return it's index
     * If The row index is greater then the end of the hightest fragment -1 is returned
     * */
    searchRowProximity(rowIndex: number, startFrom?: number): number;
    markDirty(): void;
    /**
     * Check and verify that there are no sequential blocks (e.g. block 1 [0, 99], block 2 [100, 199])
     * If there are, merge them into a single block
     */
    checkAndMerge(): void;
    private onDirty;
}
