import { PblDataSourceBaseFactory, ON_DESTROY } from '@asafmalin/ngrid/core';
import { Observable, Subject, of, isObservable, from, BehaviorSubject } from 'rxjs';
import { take, debounceTime, tap, finalize, filter, map } from 'rxjs/operators';
import { PblDataSource, PblDataSourceAdapter, PblNgridRowDef, PblNgridRowComponent, PblNgridPluginController, ngridPlugin, PblNgridModule } from '@asafmalin/ngrid';
import * as i0 from '@angular/core';
import { Directive, Component, ChangeDetectionStrategy, ViewEncapsulation, ComponentFactoryResolver, NgModule } from '@angular/core';
import { CdkRow, CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { PblNgridTargetEventsModule } from '@asafmalin/ngrid/target-events';

const INFINITE_SCROLL_DEFFERED_ROW = {};

/*
This cache will force the blocks to align perfectly, where no event can be fired with rows
that overlap any other pervious or future event unless they overlap fully.
For example, if the block size is 50 and strictBlocks is true the events will include fromRow, toRows: [0, 49] [50, 99] .... [300, 349]
If strictBlocks is false you might get the above but might also get [73, 122] etc...

While the user scrolls slowly the datasource will output strict blocks natively, the anomalies happen when
the user scrolls fast, into a scroll area with no rows.

Using strictBlocks fits to scenarios where the server returns page based pagination with no option to get items between pages. (i.e. fixed page size)
If your server returns pagination based on "skip" and "limit" then using strictBlocks does not add any value.

When using strictBlocks cache performance might improve but the tradeoff is a little bit more API calls.
*/
/**
 * A Caching strategy that enforces storing cache rows in blocks where
 *
 *  - All blocks have the same predefined size (configurable)
 *  - A block contains items in a sequence (I.E A block is a page)
 *  - Each block must continue a sequence from the last block.
 *
 * In Addition, the cache is limited by size (configurable).
 * When items are added or when maximum size is updated the cache will auto-purge items
 * that cause overflow.
 *
 * If items are added which breaks the current sequence the entire cache is purged automatically.
 *
 * This is best for grid's that use a datasource with page based pagination.
 * While the user scrolls, each next item is most often the next block in sequence.
 *
 * Note that when pre-defining the virtual size to the total amount of rows will allow the user
 * to fast scroll which might break the sequence, skipping a block or more, thus purging the entire cache.
 */
class SequencedBlockCache {
    constructor(context, options) {
        this.context = context;
        this.end = -1;
        this.start = 0;
        this._maxSize = 0;
        this.options = { ...(options || {}) };
    }
    get maxSize() { return this._maxSize; }
    get size() { return this.end - this.start + 1; }
    get empty() { return this.size === 0; }
    remove(startRow, count) {
        const start = Math.max(startRow, this.start);
        const end = Math.min(startRow + count - 1, this.end);
        return [[start, end]];
    }
    /**
     * Set the new max size for this cache.
     * @returns When new max size is bigger the old & current size violates the new max size, return the number of items trimmed from the cache
     * with positive value if trimmed from end, negative value if trimmed from start. Otherwise returns 0.
     */
    setCacheSize(maxSize) {
        this._maxSize = Math.max(0, maxSize);
        const oversize = this.alignBoundary(this.lastAdd || 1);
        if (oversize < 0) {
            return [
                [this.start + oversize, this.start - 1],
            ];
        }
        else if (oversize > 0) {
            return [
                [this.end + 1, this.end + oversize],
            ];
        }
        else {
            return [];
        }
    }
    update(startRow, endRow, direction) {
        if (this.empty) {
            return this.add(startRow, endRow - startRow + 1);
        }
        else if (this.isSibling(startRow, endRow, direction)) {
            if (direction === -1) {
                const offset = this.start - startRow;
                return this.add(startRow, offset);
            }
            else if (direction === 1) {
                const offset = endRow - this.end;
                return this.add(this.end + 1, offset);
            }
            else {
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                    throw new Error('Infinite scroll - Sequenced block cache Error');
                }
                return;
            }
        }
        else {
            const result = this.clear();
            this.add(startRow, endRow - startRow + 1);
            return result;
        }
    }
    clear() {
        this.lastAdd = undefined;
        if (this.empty) {
            return [[0, 0]];
        }
        const { start, end } = this;
        this.start = 0;
        this.end = -1;
        return [[start, end]];
    }
    createBlock(startIndex, endIndex, totalLength = 0) {
        const [direction, start, end] = this.matchBlock(startIndex, endIndex) || [];
        if (!direction) {
            return undefined;
        }
        const { blockSize } = this.context.options;
        let fromRow;
        let toRow;
        switch (direction) {
            case -1:
                fromRow = Math.max(0, end - (blockSize - 1));
                toRow = end;
                break;
            case 1:
                fromRow = start;
                toRow = start + blockSize - 1;
                break;
        }
        if (totalLength && fromRow >= totalLength) {
            return undefined;
        }
        // Strict Block logic:
        // Now, we align the block to match a sequential world of blocks based on the block size.
        // If we have a gap we want to divert to the nearest block start/end, based on the direction.
        // If we go down (direction is 1) we want the nearest block start BELOW us, getting duplicates in the call but ensuring no gaps ahead
        // If we go up (direction is -1) we want to nearest block start ABOVE us, getting duplicates in the call but ensuring no gaps ahead.
        const main = direction === 1 ? fromRow : toRow;
        let rem = main % blockSize;
        if (rem !== 0) {
            fromRow = main - rem;
            toRow = fromRow + blockSize - 1;
        }
        if (totalLength) {
            if (toRow >= totalLength) {
                toRow = totalLength - 1;
                fromRow = toRow - (toRow % blockSize);
            }
        }
        return [direction, fromRow, toRow];
    }
    matchBlock(start, end) {
        if (this.empty) {
            return [1, start, end];
        }
        if (start >= this.start && end <= this.end) {
            return undefined;
        }
        if (start < this.start && end >= this.start - 1) {
            return [-1, start, this.start - 1];
        }
        if (end > this.end && start <= this.end + 1) {
            return [1, this.end + 1, end];
        }
        return [end > this.end ? 1 : -1, start, end];
    }
    oversize() {
        return this._maxSize ? Math.max(this.size - this._maxSize, 0) : 0;
    }
    isSibling(startRow, endRow, direction) {
        if (direction === 1) {
            return this.end + 1 === startRow;
        }
        if (direction === -1) {
            return this.start - 1 === endRow;
        }
        return false;
    }
    add(startRow, count) {
        if (startRow < 0 || count <= 0) {
            return [];
        }
        let oversize;
        let end = startRow + count - 1;
        if (this.empty) {
            this.start = startRow;
            this.end = end;
            oversize = this.alignBoundary(1);
        }
        else if (startRow < this.start) {
            this.start = startRow;
            oversize = this.alignBoundary(-(this.lastAdd = -1));
        }
        else if (end > this.end) {
            this.end = end;
            oversize = this.alignBoundary(-(this.lastAdd = 1));
        }
        if (oversize < 0) {
            return [
                [this.start + oversize, this.start - 1],
            ];
        }
        else if (oversize > 0) {
            return [
                [this.end + 1, this.end + oversize],
            ];
        }
        else {
            return [];
        }
    }
    /**
     * Align the cache to fix max size.
     * @returns the number of items trimmed from the cache with positive value if trimmed from end, negative value if trimmed from start.
    */
    alignBoundary(trimFrom) {
        const oversize = this.oversize();
        if (oversize) {
            if (trimFrom === 1) {
                this.end -= oversize;
            }
            else {
                this.start += oversize;
                return -oversize;
            }
        }
        return oversize;
    }
}

class Fragment {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    static calcEnd(startRow, count) {
        return startRow + count - 1;
    }
    get size() { return this.end - this.start + 1; }
    get empty() { return this.size === 0; }
    containsRow(rowIndex) {
        return rowIndex >= this.start && rowIndex <= this.end;
    }
    equals(f) {
        return this.start === f.start && this.end === f.end;
    }
}

class Fragments extends Array {
    constructor() {
        super(...arguments);
        this.dirty = false;
        this._size = 0;
    }
    get size() {
        if (this.dirty) {
            this.onDirty();
        }
        return this._size;
    }
    remove(startRow, count, startFrom = 0) {
        const result = [];
        const endRow = Fragment.calcEnd(startRow, count);
        const index = this.searchByRow(startRow, startFrom);
        if (index !== -1) {
            const item = this[index];
            const originalEnd = item.end;
            const gap = originalEnd - endRow;
            item.end = startRow - 1;
            if (gap === 0) {
                result.push([startRow, endRow]);
            }
            else if (gap < 0) {
                result.push([startRow, originalEnd], ...this.remove(originalEnd + 1, gap, index + 1));
            }
            else {
                const f = new Fragment(endRow + 1, originalEnd);
                this.splice(index, 0, f);
                result.push([startRow, endRow]);
            }
            if (result.length > 0) {
                this.markDirty();
            }
        }
        return result;
    }
    removeItems(count, location) {
        const result = [];
        let f;
        while (count > 0) {
            f = location === -1 ? this.shift() : this.pop();
            if (!f) {
                break;
            }
            if (f.size > count) {
                if (location === -1) {
                    f.start += count;
                    result.push([f.start - count, f.start - 1]);
                }
                else {
                    f.end -= count;
                    result.push([f.end + 1, f.end + count]);
                }
                count = 0;
            }
            else {
                count = count - f.size;
                result.push([f.start, f.end]);
                f = undefined;
            }
        }
        if (f) {
            if (location === -1) {
                this.unshift(f);
            }
            else {
                this.push(f);
            }
        }
        if (result.length > 0) {
            this.markDirty();
        }
        return result;
    }
    clear() {
        const result = [];
        while (this.length > 0) {
            const f = this.shift();
            result.push([f.start, f.end]);
        }
        if (result.length > 0) {
            this.markDirty();
        }
        return result;
    }
    /**
     * Returns the first row index of a missing row that is the most close (based on the direction) to the provided rowIndex.
     * If the provided rowIndex is missing, returns the provided rowIndex.
     * Note that when the direction is -1 the closest missing row might be -1, i.e. all rows are in-place and nothing is missing
     */
    findClosestMissing(rowIndex, direction) {
        const fragment = this[this.searchByRow(rowIndex)];
        if (fragment) { // we assume fragments must have gaps or else they are merged
            return direction === 1 ? fragment.end + 1 : fragment.start - 1;
        }
        return rowIndex;
    }
    containsRange(startRow, endRow) {
        const first = this[this.searchByRow(startRow)];
        return first && endRow <= first.end; // we assume fragments must have gaps or else they are merged
    }
    /**
     * Search all fragments and find the index of the fragments that contains a specific row index
     */
    searchByRow(rowIndex, startFrom = 0) {
        let end = this.length - 1;
        while (startFrom <= end) {
            let mid = Math.floor((startFrom + end) / 2);
            const item = this[mid];
            if (item.containsRow(rowIndex)) {
                return mid;
            }
            else if (item.end < rowIndex) {
                startFrom = mid + 1;
            }
            else {
                end = mid - 1;
            }
        }
        return -1;
    }
    /**
     * Search for the row that either contain the rowIndex or is the closest to it (from the start)
     * I.e, if no fragment contains the rowIndex, the closest fragment to it will return it's index
     * If The row index is greater then the end of the hightest fragment -1 is returned
     * */
    searchRowProximity(rowIndex, startFrom = 0) {
        let end = this.length - 1;
        let mostProximate = -1;
        while (startFrom <= end) {
            let mid = Math.floor((startFrom + end) / 2);
            const item = this[mid];
            if (item.containsRow(rowIndex)) {
                return mid;
            }
            else if (item.end < rowIndex) {
                startFrom = mid + 1;
            }
            else {
                mostProximate = mid;
                end = mid - 1;
            }
        }
        return mostProximate;
    }
    markDirty() {
        this.dirty = true;
    }
    /**
     * Check and verify that there are no sequential blocks (e.g. block 1 [0, 99], block 2 [100, 199])
     * If there are, merge them into a single block
     */
    checkAndMerge() {
        for (let i = 1; i < this.length; i++) {
            if (this[i - 1].end + 1 === this[i].start) {
                this[i - 1].end = this[i].end;
                this.splice(i, 1);
                i -= 1;
            }
        }
    }
    onDirty() {
        this.dirty = false;
        this._size = this.reduce((s, f) => s + f.size, 0);
    }
}

var IntersectionType;
(function (IntersectionType) {
    /** No intersection between "source" and "target" */
    IntersectionType[IntersectionType["none"] = 0] = "none";
    /** "source" and "target" are equal */
    IntersectionType[IntersectionType["full"] = 1] = "full";
    /** "target" contains the entire "source" */
    IntersectionType[IntersectionType["contained"] = 2] = "contained";
    /** "source" contains the entire "target" */
    IntersectionType[IntersectionType["contains"] = 3] = "contains";
    /** A portion from the "source" is not intersected with the "target" */
    IntersectionType[IntersectionType["partial"] = 4] = "partial";
})(IntersectionType || (IntersectionType = {}));
function intersect(f1, f2) {
    const min = f1.start < f2.start ? f1 : f2;
    const max = min === f1 ? f2 : f1;
    return min.end < max.start
        ? null
        : new Fragment(max.start, min.end < max.end ? min.end : max.end);
}
function findIntersectionType(source, target, intersection) {
    if (source.equals(target)) {
        return IntersectionType.full;
    }
    if (intersection === undefined) {
        intersection = intersect(source, target);
    }
    if (!intersection) {
        return IntersectionType.none;
    }
    if (source.equals(intersection)) {
        return IntersectionType.contained;
    }
    if (target.equals(intersection)) {
        return IntersectionType.contains;
    }
    return IntersectionType.partial;
}

/**
 * A Caching strategy that enforces storing cache rows in blocks where
 *
 *  - All blocks have the same predefined size (configurable)
 *  - A block contains items in a sequence (I.E A block is a page)
 *
 * In Addition, the cache is limited by size (configurable).
 * When items are added or when maximum size is updated the cache will auto-purge items
 * that cause overflow.
 *
 * Beside overflow, not other logic can perform automatic purging.
 *
 * This is best for grid's that use a datasource with an index based pagination (skip/limit) and
 */
class FragmentedBlockCache {
    constructor(context, options) {
        this.context = context;
        this._maxSize = 0;
        // DO NOT MODIFY FRAGMENT ITEMS IN THE COLLECTION WITHOUT CALLING "markDirty()" afterwards
        this.fragments = new Fragments();
        this.lastStartRow = 0;
        this.lastDir = 1;
        this.options = { ...(options || {}) };
    }
    get maxSize() { return this._maxSize; }
    get size() { return this.fragments.size; }
    get empty() { return this.size === 0; }
    remove(startRow, count) {
        return this.fragments.remove(startRow, count);
    }
    /**
     * Set the new max size for this cache.
     * @returns When new max size is bigger the old & current size violates the new max size, return the number of items trimmed from the cache
     * with positive value if trimmed from end, negative value if trimmed from start. Otherwise returns 0.
     */
    setCacheSize(maxSize) {
        this._maxSize = Math.max(0, maxSize);
        return this.alignBoundary();
    }
    update(startRow, endRow, direction) {
        this.coldLocation = direction === 1 ? -1 : 1;
        return this.add(startRow, endRow);
    }
    clear() {
        this.coldLocation = undefined;
        if (this.empty) {
            return [[0, 0]];
        }
        return this.fragments.clear();
    }
    createBlock(startIndex, endIndex, totalLength = 0) {
        const [direction, start, end] = this.matchBlock(startIndex, endIndex) || [];
        // LOG(`CREATE BLOCK: [${startIndex}, ${endIndex}] => [${direction}, ${start}, ${end}]`)
        if (!direction) {
            return undefined;
        }
        const { blockSize } = this.context.options;
        const { strictPaging } = this.options;
        let fromRow;
        let toRow;
        switch (direction) {
            case -1:
                fromRow = Math.max(0, end - (blockSize - 1));
                toRow = end;
                if (!strictPaging && fromRow < start) {
                    fromRow = Math.min(this.fragments.findClosestMissing(fromRow, 1), start);
                }
                break;
            case 1:
                fromRow = start;
                toRow = start + blockSize - 1;
                if (!strictPaging && toRow > end) {
                    toRow = Math.max(this.fragments.findClosestMissing(toRow, -1), end);
                }
                break;
        }
        if (totalLength && fromRow >= totalLength) {
            return undefined;
        }
        // Strict Block logic:
        // Now, we align the block to match a sequential world of blocks based on the block size.
        // If we have a gap we want to divert to the nearest block start/end, based on the direction.
        // If we go down (direction is 1) we want the nearest block start BELOW us, getting duplicates in the call but ensuring no gaps ahead
        // If we go up (direction is -1) we want to nearest block start ABOVE us, getting duplicates in the call but ensuring no gaps ahead.
        if (strictPaging) {
            const main = direction === 1 ? fromRow : toRow;
            let rem = main % blockSize;
            if (rem !== 0) {
                fromRow = main - rem;
                toRow = fromRow + blockSize - 1;
            }
        }
        if (totalLength && toRow >= totalLength) {
            toRow = totalLength - 1;
            if (strictPaging) {
                fromRow = toRow - (toRow % blockSize);
            }
        }
        return [direction, fromRow, toRow];
    }
    matchBlock(start, end) {
        if (this.empty) {
            return [1, start, end];
        }
        const iFirst = this.fragments.searchRowProximity(start);
        const iLast = this.fragments.searchRowProximity(end);
        if (iFirst === -1) {
            return [1, start, end];
        }
        const first = this.fragments[iFirst];
        if (iLast === -1) {
            return [1, first.containsRow(start) ? first.end + 1 : start, end];
        }
        const intersectionType = findIntersectionType(first, new Fragment(start, end));
        const dir = this.lastStartRow > start ? -1 : this.lastStartRow === start ? this.lastDir : 1;
        this.lastStartRow = start;
        this.lastDir = dir;
        // The logic here assumes that there are not sequential blocks, (e.g. block 1 [0, 99], block 2 [100, 199])
        // All sequential blocks are to be merged via checkAndMerge on the fragments collection
        switch (intersectionType) {
            case IntersectionType.none:
                return [dir, start, end];
            case IntersectionType.partial:
                if (iFirst === iLast) {
                    if (start < first.start) {
                        return [dir, start, first.start - 1];
                    }
                    else {
                        return [dir, first.end + 1, end];
                    }
                }
                else {
                    const last = this.fragments[iLast];
                    return [dir, start < first.start ? start : first.end + 1, end >= last.start ? last.start - 1 : end];
                }
            case IntersectionType.contained:
                const last = this.fragments[iLast];
                return [dir, start, end >= last.start ? last.start - 1 : end];
            case IntersectionType.contains:
            case IntersectionType.full:
                return undefined;
        }
    }
    add(startRow, endRow) {
        if (startRow < 0 || endRow <= 0) {
            return [];
        }
        const newFragment = new Fragment(startRow, endRow);
        const iFirst = this.fragments.searchRowProximity(startRow);
        const first = this.fragments[iFirst];
        const intersectionType = !first ? null : findIntersectionType(first, newFragment);
        switch (intersectionType) {
            case null:
                // EDGE CASE: when  "first" is undefined, i.e. "iFirst" is -1
                // This edge case means no proximity, i,e. the new fragment is AFTER the last fragment we currently have (or we have no fragments)
                this.fragments.push(newFragment);
                break;
            case IntersectionType.none: // it means first === last
                this.fragments.splice(iFirst, 0, newFragment);
                break;
            case IntersectionType.partial:
            case IntersectionType.contained:
                let iLast = this.fragments.searchRowProximity(endRow);
                if (iLast === -1) {
                    iLast = this.fragments.length - 1;
                }
                const last = this.fragments[iLast];
                first.start = Math.min(newFragment.start, first.start);
                if (newFragment.end >= last.start) {
                    first.end = newFragment.end;
                    this.fragments.splice(iFirst + 1, iLast - iFirst);
                }
                else {
                    first.end = Math.max(newFragment.end, first.end);
                    this.fragments.splice(iFirst + 1, (iLast - 1) - iFirst);
                }
                break;
            case IntersectionType.contains:
            case IntersectionType.full:
                return [];
        }
        this.fragments.markDirty();
        this.fragments.checkAndMerge();
        return this.alignBoundary();
    }
    oversize() {
        return this._maxSize ? Math.max(this.size - this._maxSize, 0) : 0;
    }
    alignBoundary() {
        const oversize = this.oversize();
        return oversize > 0 ? this.fragments.removeItems(oversize, this.coldLocation || 1) : [];
    }
}

/**
 * A Caching strategy that enforces storing cache rows in blocks where
 *
 *  - All blocks have the same predefined size (configurable)
 *  - A block contains items in a sequence (I.E A block is a page)
 *  - Each block must continue a sequence from the last block.
 *
 * In Addition, the cache is limited by size (configurable).
 * When items are added or when maximum size is updated the cache will auto-purge items
 * that cause overflow.
 *
 * If items are added which breaks the current sequence the entire cache is purged automatically.
 *
 * This is best for grid's that use a datasource with page based pagination.
 * While the user scrolls, each next item is most often the next block in sequence.
 *
 * Note that when pre-defining the virtual size to the total amount of rows will allow the user
 * to fast scroll which might break the sequence, skipping a block or more, thus purging the entire cache.
 */
class NoOpBlockCache {
    constructor(context, virtualRow) {
        this.context = context;
        this.virtualRow = virtualRow;
        this.ds = context.getDataSource();
    }
    get maxSize() { return this.ds.length; }
    get size() { return this.ds.length; }
    get empty() { return this.size === 0; }
    remove(startRow, count) {
        const start = 0;
        const end = Math.min(startRow + count - 1, this.ds.length);
        return [[start, end]];
    }
    /**
     * Set the new max size for this cache.
     * @returns When new max size is bigger the old & current size violates the new max size, return the number of items trimmed from the cache
     * with positive value if trimmed from end, negative value if trimmed from start. Otherwise returns 0.
     */
    setCacheSize(maxSize) {
        return [];
    }
    update(startRow, endRow, direction) {
        return [];
    }
    clear() {
        return [[0, this.ds.length - 1]];
    }
    createBlock(startIndex, endIndex, totalLength = 0) {
        const [direction, start, end] = this.matchBlock(startIndex, endIndex) || [];
        if (!direction) {
            return undefined;
        }
        const { blockSize } = this.context.options;
        let fromRow;
        let toRow;
        switch (direction) {
            case -1:
                fromRow = Math.max(0, end - (blockSize - 1));
                toRow = end;
                break;
            case 1:
                fromRow = start;
                toRow = start + blockSize - 1;
                break;
        }
        if (totalLength && fromRow >= totalLength) {
            return undefined;
        }
        if (totalLength) {
            if (toRow >= totalLength) {
                toRow = totalLength - 1;
            }
        }
        return [direction, fromRow, toRow];
    }
    matchBlock(start, end) {
        if (start === end) {
            return [1, start, end];
        }
        const source = this.ds.source;
        for (let i = start; i <= end; i++) {
            if (source[i] !== this.virtualRow) {
                start = i;
            }
            else {
                break;
            }
        }
        if (start === end) {
            return undefined;
        }
        else {
            return [1, start, end];
        }
    }
}

function createCacheAdapter(context, options) {
    switch (options.type) {
        case 'noOpCache':
            return new NoOpBlockCache(context, INFINITE_SCROLL_DEFFERED_ROW);
        case 'sequenceBlocks':
            return new SequencedBlockCache(context, options.options);
        case 'fragmentedBlocks':
            return new FragmentedBlockCache(context, options.options);
    }
}

function normalizeCacheOptions(options) {
    if (!options) {
        options = { type: 'noOpCache' };
    }
    return options;
}
class PblInfiniteScrollDataSourceCache {
    constructor(context, options) {
        this.context = context;
        this.cacheAdapter = createCacheAdapter(context, normalizeCacheOptions(options));
        this.setCacheSize(300);
    }
    get maxSize() { return this.cacheAdapter.maxSize; }
    get size() { return this.cacheAdapter.size; }
    get empty() { return this.cacheAdapter.empty; }
    setCacheSize(maxSize) {
        this.cacheAdapter.setCacheSize(maxSize);
    }
    matchNewBlock() {
        const ds = this.context.getDataSource();
        const totalLength = this.context.totalLength;
        const renderEnd = ds.renderStart + ds.renderLength;
        const start = ds.renderStart;
        const end = totalLength ? Math.min(renderEnd, totalLength) : renderEnd;
        return this.cacheAdapter.createBlock(start, end, totalLength);
    }
    createInitialBlock() {
        const ds = this.context.getDataSource();
        const totalLength = this.context.totalLength;
        const renderEnd = ds.renderLength;
        const start = 0;
        const end = totalLength ? Math.min(renderEnd, totalLength) : renderEnd;
        return this.cacheAdapter.createBlock(start, end, totalLength);
    }
    update(startRow, endRow, direction) {
        return this.cacheAdapter.update(startRow, endRow, direction);
    }
    clear() {
        return this.cacheAdapter.clear();
    }
}

function normalizeOptions(rawOptions) {
    const options = rawOptions || {};
    options.blockSize = Number(options.blockSize);
    if (Number.isNaN(options.blockSize)) {
        options.blockSize = 50;
    }
    else if (options.blockSize <= 0) {
        options.blockSize = 50;
    }
    options.initialVirtualSize = Number(options.initialVirtualSize);
    if (Number.isNaN(options.initialVirtualSize)) {
        options.initialVirtualSize = 0;
    }
    return options;
}
function shouldTriggerInvisibleScroll(context) {
    const ds = context.getDataSource();
    if (context.totalLength && ds.renderStart > context.totalLength) {
        return false;
    }
    return !!(context.cache.matchNewBlock());
}
function tryAddVirtualRowsBlock(source, event, blockSize) {
    const currLen = source.length;
    if (currLen < event.totalLength && event.totalLength > event.toRow && source[currLen - 1] !== INFINITE_SCROLL_DEFFERED_ROW) {
        const len = Math.min(currLen + blockSize - 1, event.totalLength);
        for (let i = currLen; i < len; i++) {
            source[i] = INFINITE_SCROLL_DEFFERED_ROW;
        }
        return true;
    }
    return false;
}
function upgradeChangeEventToInfinite(totalLength, event, blockMatch) {
    const [direction, start, end] = blockMatch;
    if (!event.isInitial) {
        if (direction === 1 && end === totalLength - 1) {
            event.isLastBlock = true;
        }
    }
    event.direction = direction;
    event.fromRow = start;
    event.offset = (end - start) + 1;
    event.toRow = end;
    return event;
}
/**
 * Update the cache with new block information to reflect the last triggered event and
 * also update the datasource with the new values, removing values that are purged due to cache logic.
 * Returns the new datasource, or the original datasource editing in-place.
 *
 * For example, if the cache was empty the values provided are returned
 * Otherwise, the original datasource is edited and returned.
 */
function updateCacheAndDataSource(context, event, values) {
    if (context.cache.empty) {
        return values;
    }
    const source = context.getDataSource().source;
    const toRemove = context.cache.update(event.fromRow, event.toRow, event.direction);
    for (const [start, end] of toRemove) {
        for (let i = start; i <= end; i++) {
            source[i] = INFINITE_SCROLL_DEFFERED_ROW;
        }
    }
    const { fromRow } = event;
    for (let i = 0, len = values.length; i < len; i++) {
        source[i + fromRow] = values[i];
    }
    return source;
}

class PblInfiniteScrollDataSource extends PblDataSource {
    constructor(context, options) {
        super(context.getAdapter(), options);
        this.context = context;
    }
    get maxCacheSize() { return this.context.cache.maxSize; }
    get cacheSize() { return this.context.cache.size; }
    setCacheSize(maxSize) {
        this.context.cache.setCacheSize(maxSize);
    }
    purgeCache() {
        const source = this.source;
        for (const [start, end] of this.context.cache.clear()) {
            for (let i = start; i <= end; i++) {
                source[i] = INFINITE_SCROLL_DEFFERED_ROW;
            }
        }
        this.refresh();
    }
    isVirtualRow(row) {
        return row === INFINITE_SCROLL_DEFFERED_ROW;
    }
    isVirtualContext(context) {
        return context.$implicit === INFINITE_SCROLL_DEFFERED_ROW;
    }
    /**
     * Update the size of the datasource to reflect a virtual size.
     * This will extend the scrollable size of the grid.
     *
     * > Note that you can only add to the size, if the current size is larger than the new size nothing will happen.
     */
    updateVirtualSize(newSize) {
        if (this.adapter.inFlight) {
            this.onRenderDataChanging
                .pipe(take(1))
                .subscribe(r => {
                PblInfiniteScrollDataSource.updateVirtualSize(newSize, r.data);
                // we must refire so virtual scroll viewport can catch it
                // because it also listen's to this stream but it is registered before us.
                // See virtual-scroll/virtual-scroll-for-of.ts where "dataStream" is assigned
                this._onRenderDataChanging.next(r);
            });
        }
        else {
            PblInfiniteScrollDataSource.updateVirtualSize(newSize, this.source);
        }
    }
    static updateVirtualSize(newSize, values) {
        if (values && values.length < newSize) {
            for (let i = values.length; i < newSize; i++) {
                values[i] = INFINITE_SCROLL_DEFFERED_ROW;
            }
        }
    }
}

class PblInfiniteScrollDataSourceAdapter extends PblDataSourceAdapter {
    constructor(context, config, onVirtualLoading) {
        super(e => context.onTrigger(e), config);
        this.context = context;
        this.virtualRowsLoading = onVirtualLoading.pipe(debounceTime(24));
    }
    dispose() {
        this.context.dispose();
        super.dispose();
    }
    emitOnSourceChanging(event) {
        if (event.isInitial) {
            super.emitOnSourceChanging(event);
        }
    }
}

// const LOG = msg => console.log(msg);
/**
 * A wrapper around an on trigger observable call that will prevent it from
 * closing if marked to do so (calling `keepAlive()`).
 * If `keepAlive()` was called and the observable has been unsubscribed the teardown logic
 * will not unsubscribe from the underlying on-trigger observable, it will let it roll until
 * finished or being killed again.
 * Keep alive is a toggle, if "used" it can not be used again unless `keepAlive()` is called again.
 *
 * This observable is used internally by the execution queue to prevent on-trigger calls from being invoked and
 * cancelled multiple times.
 * This usually happen when scrolling, since the scroll might not break the current page block fetched, until fetched
 * it will keep asking for it, hence the need to keep it alive.
 * Each execution must return an observable or it will get canceled, so we return the currently executed trigger
 * instead of running it again...
 * @internal
 */
class TriggerExecutionProxyObservable extends Observable {
    constructor(event, target) {
        super(subscriber => this.onSubscribe(subscriber));
        this.event = event;
        this.target = target;
        this.onKilled = new Subject();
        this.canLive = false;
        // LOG(`NEW[${event.id}]: ${event.fromRow} - ${event.toRow}`);
    }
    keepAlive() {
        this.canLive = true;
    }
    onSubscribe(subscriber) {
        this.subscriber = subscriber;
        if (!this.baseSubscription) {
            this.baseSubscription = this.target.subscribe({
                next: v => this.subscriber.next(v),
                error: e => {
                    this.error = e;
                    this.subscriber.error(e);
                },
                complete: () => {
                    this.completed = true;
                    this.subscriber.complete();
                },
            });
        }
        return () => this.tearDown();
    }
    tearDown() {
        if (!this.canLive || this.completed || this.error) {
            // LOG(`UNSUBSCRIBE${this.event.id}: ${this.event.fromRow} - ${this.event.toRow}`);
            this.baseSubscription.unsubscribe();
            this.onKilled.next();
            this.onKilled.complete();
        }
        else {
            // LOG(`REMOVE CREDIT${this.event.id}: ${this.event.fromRow} - ${this.event.toRow}`);
            this.canLive = false;
        }
    }
}

// const LOG = msg => console.log(msg);
/**
 * Execute a data source trigger based on infinite trigger change events provided.
 * Each time an execution starts the event is compared to already in-process event that were executed and did not yet finish.
 * If the event overlaps with an existing event, it will not execute.
 * Events overlap when the event to be executed has a range that is contained with any other in-flight event.
 */
class TriggerExecutionQueue {
    constructor(handler) {
        this.handler = handler;
        this.slots = 2;
        this.runningEvents = new Map();
    }
    /**
     * Execute an event and keep track of it until execution is done.
     * Before execution, check if one of the events currently in execution, contains the provided event.
     * If so, the execution is will not go through.
     * Event contains another event only if the range (from/to) of the other event is within the boundaries of it's own range.
     * For example, the event from row 50 to row 100 contains the event from row 70 to row 100 but it does not contain
     * the event from row 49 to row 50.
     * @param event
     * @param fallbackToOverlap When true (and then a containing event is found), will signal the containing event to
     * that an event with a set or all items it is fetching trying to execute again but was denied and it will also
     * return it's currently running observable.
     * Due to how the datasource works, it will try to unsubscribe/cancel the currently running observable and subscribe
     * to the returned observable (which is the same), by signaling we allow the running observable to prevent closing the
     * running call and remain in fact we're making it "hot" for period of time so it will not cancel any running call.
     */
    execute(event, fallbackToOverlap = false) {
        const overlap = this.checkOverlap(event);
        if (!!overlap) {
            if (fallbackToOverlap) {
                overlap.keepAlive();
                return overlap;
            }
            return false;
        }
        // LOG(`EXECUTING HANDLER: ${event.fromRow} - ${event.toRow}`);
        const result = this.handler(event);
        if (result === false) {
            return false;
        }
        const triggerResult = Array.isArray(result)
            ? of(result)
            : isObservable(result)
                ? result
                : from(result);
        // LOG(`CREATE[${event.id}]: ${event.fromRow} - ${event.toRow}`);
        const obs = new TriggerExecutionProxyObservable(event, triggerResult);
        obs.onKilled.subscribe(() => this.runningEvents.delete(event));
        this.runningEvents.set(event, obs);
        return obs;
    }
    checkOverlap(event) {
        for (const [e, v] of this.runningEvents.entries()) {
            if (event.fromRow >= e.fromRow && event.toRow <= e.toRow) {
                // LOG(`OVERLAPPED: ${event.fromRow} - ${event.toRow}`);
                return v;
            }
        }
    }
}

/**
 * @internal
 */
class EventState {
    constructor(event = null) {
        this.event = event;
    }
    isDone() {
        return this.done;
    }
    rangeEquals(event) {
        return event.fromRow === this.event.fromRow && event.toRow === this.event.toRow;
    }
    /**
     * When true is returned, the handling of `PblDataSource.onRenderedDataChanged` should be skipped.
     * Usually, the event state will keep track of the returned value and check if the length of items returned covers
     * the total length required by the event. Only when not enough items have been returned, the returned value will be true.
     * Once true is returned, it will toggle back to false, i.e. it will tell you to skip once only.
     */
    skipNextRender() {
        if (this.notFull) {
            this.notFull = false;
            return true;
        }
        return false;
    }
    pipe() {
        return (o) => {
            return o.pipe(tap(values => {
                this.done = true;
                this.notFull = values.length < this.event.offset;
            }));
        };
    }
}

class PblInfiniteScrollDSContext {
    constructor(factoryOptions) {
        this.factoryOptions = factoryOptions;
        this.onVirtualLoading = new BehaviorSubject(false);
        this.virtualLoadingSessions = 0;
        this.timeoutCancelTokens = new Set();
        this.ignoreScrolling = false;
        this.lastEventState = new EventState();
        this.options = normalizeOptions(factoryOptions.infiniteOptions);
        if (this.options.initialVirtualSize > 0) {
            this.totalLength = this.options.initialVirtualSize;
        }
        this.queue = new TriggerExecutionQueue(this.factoryOptions.onTrigger);
    }
    onTrigger(rawEvent) {
        if (rawEvent.isInitial) {
            return this.invokeInitialOnTrigger(rawEvent);
        }
        if (this.pendingTrigger$) {
            // LOG(`HAS pendingTrigger$`);
            const pendingTrigger$ = this.pendingTrigger$;
            this.pendingTrigger$ = undefined;
            if (rawEvent.data.changed && rawEvent.data.curr === pendingTrigger$) {
                // LOG(`PENDING - MATCHED!`);
                this.currentSessionToken = undefined;
                return pendingTrigger$
                    .pipe(finalize(() => {
                    // LOG(`PENDING - RESULT DONE`);
                    this.deferSyncRows(16, () => this.tickVirtualLoading(-1));
                }));
            }
        }
        if (this.currentSessionToken && rawEvent.data.changed && rawEvent.data.curr === this.currentSessionToken) {
            if (this.ds.hostGrid.viewport.isScrolling) {
                this.handleScrolling(rawEvent);
                return of(this.ds.source);
            }
            const { result, event } = this.invokeRuntimeOnTrigger(rawEvent);
            if (!result || !event) { // !event for type gate, because if we have "result: then "event" is always set
                // LOG('NO SCROLL - FALSE TRIGGER!');
                this.currentSessionToken = undefined;
                return false;
            }
            else {
                const { source } = this.ds;
                if (tryAddVirtualRowsBlock(source, event, this.options.blockSize)) {
                    this.pendingTrigger$ = result;
                    this.tickVirtualLoading(1);
                    // LOG('NO SCROLL - VIRTUAL ROWS ADDED');
                    return of(source)
                        .pipe(finalize(() => {
                        this.deferSyncRows();
                        // LOG('NO SCROLL - VIRTUAL ROWS RENDERED');
                        this.currentSessionToken = undefined;
                        this.ds.refresh(result);
                    }));
                }
                else {
                    // LOG('NO SCROLL - NO VIRTUAL ROWS ADDED');
                    return result
                        .pipe(finalize(() => {
                        // LOG(`NO SCROLL - RESULT DONE`);
                        this.deferSyncRows(16);
                        this.currentSessionToken = undefined;
                    }));
                }
            }
        }
        if (rawEvent.data.changed || (this.customTriggers && PblInfiniteScrollDataSourceAdapter.isCustomBehaviorEvent(rawEvent, this.customTriggers))) {
            this.cache.clear();
            rawEvent.isInitial = true;
            return this.invokeInitialOnTrigger(rawEvent);
        }
        return false;
        // throw new Error('Invalid');
    }
    getAdapter() {
        if (!this.adapter) {
            this.customTriggers = this.factoryOptions.customTriggers || false;
            // we can't allow any internal trigger handlers to run
            // It will throw the entire datasource out of sync, infinite ds can't do that
            this.adapter = new PblInfiniteScrollDataSourceAdapter(this, { filter: true, sort: true, pagination: true }, this.onVirtualLoading);
        }
        return this.adapter;
    }
    getDataSource() {
        if (!this.ds) {
            this.ds = new PblInfiniteScrollDataSource(this, this.factoryOptions.dsOptions);
            this.cache = new PblInfiniteScrollDataSourceCache(this, this.factoryOptions.cacheOptions);
            this.ds.onRenderedDataChanged.subscribe(() => this.onRenderedDataChanged());
            if (this.factoryOptions.onCreated) {
                this.factoryOptions.onCreated(this.ds);
            }
        }
        return this.ds;
    }
    dispose() {
        this.onVirtualLoading.complete();
        for (const t of this.timeoutCancelTokens.values()) {
            clearTimeout(t);
        }
    }
    /**
     * This is where we detect if we need to internally invoke a trigger because we've reached an area
     * in the grid where row's does not exists but we show the dummy row, hence we need to fetch them.
     * The grid will never trigger an event here since from the grid's perspective a row is showing...
     * This detection also handle's scrolling and session so we don't invoke the trigger to much.
     */
    onRenderedDataChanged() {
        if (this.lastEventState.skipNextRender()) {
            // if the current event returned items that did not occupy the whole range of the event
            // stop, we don't want to check anything cause we already know we are missing items.
            // since we know we're missing items, we also know we're going to call the same range again which
            // did not return anyway, so it is useless and in the worst case might cause infinite loop
            // LOG(`RENDER DATA SKIPPING DUE TO SKIP NEXT RENDER!`);
            return;
        }
        if (!this.currentSessionToken) {
            if (shouldTriggerInvisibleScroll(this)) {
                // LOG(`RENDER DATA CHANGED FROM ROW ${this.ds.renderStart}`);
                const t = this.currentSessionToken = {};
                this.safeAsyncOp(() => {
                    if (this.currentSessionToken === t) {
                        this.ds.refresh(t);
                    }
                }, 0);
            }
        }
        else {
            // LOG(`RENDER DATA WITH SESSION FROM ROW ${this.ds.renderStart}`);
            if (!this.ds.hostGrid.viewport.isScrolling) {
                // LOG(`SESSION OVERRIDE`);
                this.ds.refresh(this.currentSessionToken = {});
            }
            else {
                if (!this.ignoreScrolling) {
                    this.ignoreScrolling = true;
                    this.ds.hostGrid.viewport.scrolling
                        .pipe(filter(d => d === 0), take(1))
                        .subscribe(d => {
                        this.ignoreScrolling = false;
                        if (shouldTriggerInvisibleScroll(this)) {
                            // LOG(`OVERRIDING AFTER SCROLL SESSION`);
                            this.currentSessionToken = undefined;
                            this.onRenderedDataChanged();
                        }
                    });
                }
            }
        }
    }
    /**
     * Create a new event state for the given event, store it in the lastEventState property
     * and returns a pipe that will sync the state of the event as the call progress.
     * @param event
     */
    wrapEventState(event) {
        return (this.lastEventState = new EventState(event)).pipe();
    }
    deferSyncRows(ms = 0, runBefore, runAfter) {
        this.safeAsyncOp(() => {
            runBefore && runBefore();
            this.ds.hostGrid.rowsApi.syncRows('data', true);
            runAfter && runAfter();
        }, ms);
    }
    safeAsyncOp(fn, delay) {
        const cancelToken = setTimeout(() => {
            this.timeoutCancelTokens.delete(cancelToken);
            fn();
        }, delay);
        this.timeoutCancelTokens.add(cancelToken);
    }
    tickVirtualLoading(value) {
        this.virtualLoadingSessions = this.virtualLoadingSessions + value;
        const inVirtualLoad = this.onVirtualLoading.value;
        switch (this.virtualLoadingSessions) {
            case 0:
                inVirtualLoad && this.onVirtualLoading.next(false);
                break;
            case 1:
                !inVirtualLoad && this.onVirtualLoading.next(true);
                break;
            default:
                if (this.virtualLoadingSessions < 0) {
                    this.virtualLoadingSessions = 0;
                }
                break;
        }
    }
    handleScrolling(rawEvent) {
        this.tickVirtualLoading(1);
        const newBlock = this.cache.matchNewBlock();
        const event = newBlock ? this.tryGetInfiniteEvent(rawEvent, newBlock) : false;
        if (event !== false) {
            if (tryAddVirtualRowsBlock(this.ds.source, event, this.options.blockSize)) {
                // LOG('SCROLL - VIRTUAL ROWS ADDED');
            }
        }
        this.ds.hostGrid.viewport.scrolling
            .pipe(filter(d => d === 0), take(1))
            .subscribe(d => {
            const { result } = this.invokeRuntimeOnTrigger(rawEvent);
            if (!!result) {
                if (this.pendingTrigger$) {
                    this.tickVirtualLoading(-1);
                }
                // LOG('SCROLL DONE - HAS RESULT - HAS PENDING');
                this.ds.refresh(this.pendingTrigger$ = result);
            }
            else if (!this.pendingTrigger$) {
                // LOG('SCROLL DONE = NO RESULT - NOT HAS PENDING');
                this.ds.refresh(this.pendingTrigger$ = of(this.ds.source));
            }
            else {
                // LOG('SCROLL DONE = NO RESULT - HAS PENDING');
                this.tickVirtualLoading(-1);
            }
        });
    }
    invokeInitialOnTrigger(rawEvent) {
        const event = this.tryGetInfiniteEvent(rawEvent, rawEvent.isInitial ? this.cache.createInitialBlock() : this.cache.createInitialBlock());
        const result = this.queue.execute(event);
        return result && result.pipe(this.wrapEventState(event), tap(values => {
            this.cache.clear();
            if (values.length > 1) {
                this.cache.update(0, values.length - 1, 1);
            }
            PblInfiniteScrollDataSource.updateVirtualSize(this.options.initialVirtualSize, values);
            if (!rawEvent.isInitial) {
                this.ds.hostGrid.viewport.scrollToOffset(0);
            }
        }));
    }
    invokeRuntimeOnTrigger(rawEvent) {
        const newBlock = this.cache.matchNewBlock();
        const event = newBlock ? this.tryGetInfiniteEvent(rawEvent, newBlock) : false;
        if (event !== false) {
            if (this.lastEventState.isDone() && this.lastEventState.rangeEquals(event)) {
                return { event: false };
            }
            event.eventSource = 'infiniteScroll';
            const triggerResult = this.queue.execute(event, true);
            if (triggerResult !== false) {
                return {
                    event,
                    result: triggerResult
                        .pipe(
                    // tap( () => LOG(`TRIGGER[${event.id}]: ${event.fromRow} - ${event.toRow}`)),
                    this.wrapEventState(event), map(values => updateCacheAndDataSource(this, event, values))),
                };
            }
        }
        return { event };
    }
    tryGetInfiniteEvent(rawEvent, block) {
        const totalLength = this.totalLength || 0;
        rawEvent.updateTotalLength = (totalLength) => { this.totalLength = totalLength; };
        rawEvent.totalLength = totalLength;
        return upgradeChangeEventToInfinite(totalLength, rawEvent, block);
    }
}

class PblInfiniteScrollDSFactory extends PblDataSourceBaseFactory {
    withInfiniteScrollOptions(options) {
        this.infiniteScrollOptions = options;
        return this;
    }
    withCacheOptions(type, options) {
        this.cacheOptions = { type, options: options };
        return this;
    }
    create() {
        const factoryOptions = {
            onTrigger: this._adapter.onTrigger,
            customTriggers: this._adapter.customTriggers,
            onCreated: this._onCreated,
            dsOptions: this._dsOptions,
            infiniteOptions: this.infiniteScrollOptions,
            cacheOptions: this.cacheOptions,
        };
        this.context = new PblInfiniteScrollDSContext(factoryOptions);
        super.onCreated(null);
        return super.create();
    }
    createAdapter() {
        return this.context.getAdapter();
    }
    createDataSource(adapter) {
        return this.context.getDataSource();
    }
}
function createInfiniteScrollDS() {
    return new PblInfiniteScrollDSFactory();
}

// tslint:disable:use-host-property-decorator
class PblNgridInfiniteVirtualRowRefDirective extends PblNgridRowDef {
    ngOnInit() {
        this.registry.setSingle('infiniteVirtualRow', this);
    }
    ngOnDestroy() {
        this.registry.setSingle('infiniteVirtualRow', undefined);
    }
}
/** @nocollapse */ PblNgridInfiniteVirtualRowRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteVirtualRowRefDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridInfiniteVirtualRowRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridInfiniteVirtualRowRefDirective, selector: "[pblNgridInfiniteVirtualRowDef]", inputs: { columns: ["pblNgridInfiniteVirtualRowDefColumns", "columns"], when: ["pblNgridInfiniteVirtualRowDefWhen", "when"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteVirtualRowRefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridInfiniteVirtualRowDef]',
                    inputs: ['columns: pblNgridInfiniteVirtualRowDefColumns', 'when: pblNgridInfiniteVirtualRowDefWhen'],
                }]
        }] });

const PBL_NGRID_ROW_TEMPLATE = `<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-content></ng-content><ng-content select=".pbl-ngrid-row-suffix"></ng-content>`;
class PblNgridInfiniteRowComponent extends PblNgridRowComponent {
    canCreateCell() {
        return false;
    }
}
/** @nocollapse */ PblNgridInfiniteRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridInfiniteRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridInfiniteRowComponent, selector: "pbl-ngrid-row[infiniteRow]", host: { attributes: { "role": "row" }, classAttribute: "pbl-ngrid-row" }, providers: [
        { provide: CdkRow, useExisting: PblNgridRowComponent }
    ], exportAs: ["pblNgridInfiniteRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-content></ng-content><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pbl-ngrid-row[infiniteRow]',
                    template: PBL_NGRID_ROW_TEMPLATE,
                    host: {
                        'class': 'pbl-ngrid-row',
                        'role': 'row',
                    },
                    providers: [
                        { provide: CdkRow, useExisting: PblNgridRowComponent }
                    ],
                    exportAs: 'pblNgridInfiniteRow',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                }]
        }] });

/**
 * Use to set the a default `pblNgridInfiniteVirtualRowDef` if the user did not set one.
 */
class PblNgridDefaultInfiniteVirtualRowComponent {
    createCell(column) {
    }
    destroyCell(column) {
    }
}
/** @nocollapse */ PblNgridDefaultInfiniteVirtualRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultInfiniteVirtualRowComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDefaultInfiniteVirtualRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDefaultInfiniteVirtualRowComponent, selector: "pbl-ngrid-default-infinite-virtual-row", ngImport: i0, template: "<pbl-ngrid-row in *pblNgridInfiniteVirtualRowDef=\"let row;\" class=\"pbl-ngrid-infinite-virtual-row\" infiniteRow>\n  ...Loading\n</pbl-ngrid-row>\n", styles: [".pbl-ngrid-infinite-virtual-row .pbl-ngrid-cell{position:relative}.pbl-ngrid-infinite-virtual-row .pbl-ngrid-cell:before{position:absolute;inset:12px;content:\" \";animation-duration:2s;animation-fill-mode:forwards;animation-iteration-count:infinite;animation-name:placeload;animation-timing-function:ease;background:#f6f7f8;background:#eeeeee;background:linear-gradient(to right,#eeeeee 8%,#dddddd 18%,#eeeeee 33%);background-size:200px 100%;border-radius:4px}@keyframes placeload{0%{background-position:-200px 0}to{background-position:200px 0}}\n"], dependencies: [{ kind: "directive", type: PblNgridInfiniteVirtualRowRefDirective, selector: "[pblNgridInfiniteVirtualRowDef]", inputs: ["pblNgridInfiniteVirtualRowDefColumns", "pblNgridInfiniteVirtualRowDefWhen"] }, { kind: "component", type: PblNgridInfiniteRowComponent, selector: "pbl-ngrid-row[infiniteRow]", exportAs: ["pblNgridInfiniteRow"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDefaultInfiniteVirtualRowComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-default-infinite-virtual-row', encapsulation: ViewEncapsulation.None, template: "<pbl-ngrid-row in *pblNgridInfiniteVirtualRowDef=\"let row;\" class=\"pbl-ngrid-infinite-virtual-row\" infiniteRow>\n  ...Loading\n</pbl-ngrid-row>\n", styles: [".pbl-ngrid-infinite-virtual-row .pbl-ngrid-cell{position:relative}.pbl-ngrid-infinite-virtual-row .pbl-ngrid-cell:before{position:absolute;inset:12px;content:\" \";animation-duration:2s;animation-fill-mode:forwards;animation-iteration-count:infinite;animation-name:placeload;animation-timing-function:ease;background:#f6f7f8;background:#eeeeee;background:linear-gradient(to right,#eeeeee 8%,#dddddd 18%,#eeeeee 33%);background-size:200px 100%;border-radius:4px}@keyframes placeload{0%{background-position:-200px 0}to{background-position:200px 0}}\n"] }]
        }] });

const PLUGIN_KEY = 'infiniteScroll';
const IS_INFINITE_VIRTUAL_ROW = (index, rowData) => {
    return rowData === INFINITE_SCROLL_DEFFERED_ROW;
};
const IS_NOT_INFINITE_VIRTUAL_ROW = (index, rowData) => {
    return !IS_INFINITE_VIRTUAL_ROW(index, rowData);
};
class PblNgridInfiniteScrollPlugin {
    constructor(grid, pluginCtrl, injector) {
        this.grid = grid;
        this.pluginCtrl = pluginCtrl;
        this.injector = injector;
        this._enabled = false;
        this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
        grid.registry.changes
            .subscribe(changes => {
            for (const c of changes) {
                switch (c.type) {
                    case 'infiniteVirtualRow':
                        if (c.op === 'remove') {
                            this.pluginCtrl.extApi.cdkTable.removeRowDef(c.value);
                            this._infiniteVirtualRowDef = undefined;
                        }
                        this.setupInfiniteVirtualRow();
                        break;
                }
            }
        });
        pluginCtrl.events
            .pipe(ON_DESTROY)
            .subscribe(() => {
            if (this._infiniteVirtualRowRef) {
                this._infiniteVirtualRowRef.destroy();
            }
            this._removePlugin(this.grid);
        });
        pluginCtrl.events.subscribe(event => {
            if (event.kind === 'onDataSource') {
                const prevState = this._enabled;
                this._enabled = event.curr instanceof PblInfiniteScrollDataSource;
                if (this._enabled !== prevState) {
                    pluginCtrl.onInit().subscribe(() => this.updateTable());
                }
            }
        });
    }
    static create(grid, injector) {
        const pluginCtrl = PblNgridPluginController.find(grid);
        return new PblNgridInfiniteScrollPlugin(grid, pluginCtrl, injector);
    }
    setupInfiniteVirtualRow() {
        const grid = this.grid;
        const cdkTable = this.pluginCtrl.extApi.cdkTable;
        if (this._infiniteVirtualRowDef) {
            cdkTable.removeRowDef(this._infiniteVirtualRowDef);
            this._infiniteVirtualRowDef = undefined;
        }
        if (this._enabled) {
            let infiniteVirtualRow = grid.registry.getSingle('infiniteVirtualRow');
            if (infiniteVirtualRow) {
                this._infiniteVirtualRowDef = infiniteVirtualRow = infiniteVirtualRow.clone();
                Object.defineProperty(infiniteVirtualRow, 'when', { enumerable: true, get: () => IS_INFINITE_VIRTUAL_ROW });
            }
            else if (!this._infiniteVirtualRowRef) {
                // TODO: move to module? set in root registry? put elsewhere to avoid grid sync (see event of registry change)...
                this._infiniteVirtualRowRef = this.injector.get(ComponentFactoryResolver)
                    .resolveComponentFactory(PblNgridDefaultInfiniteVirtualRowComponent)
                    .create(this.injector);
                this._infiniteVirtualRowRef.changeDetectorRef.detectChanges();
                return;
            }
        }
        this.resetTableRowDefs();
    }
    resetTableRowDefs() {
        if (this._infiniteVirtualRowDef) {
            this._enabled === false
                ? this.pluginCtrl.extApi.cdkTable.removeRowDef(this._infiniteVirtualRowDef)
                : this.pluginCtrl.extApi.cdkTable.addRowDef(this._infiniteVirtualRowDef);
        }
    }
    /**
     * Update the grid with detail row infor.
     * Instead of calling for a change detection cycle we can assign the new predicates directly to the pblNgridRowDef instances.
     */
    updateTable() {
        this.grid._tableRowDef.when = !!this._enabled ? IS_NOT_INFINITE_VIRTUAL_ROW : undefined;
        this.setupInfiniteVirtualRow();
        // Once we changed the `when` predicate on the `CdkRowDef` we must:
        //   1. Update the row cache (property `rowDefs`) to reflect the new change
        this.pluginCtrl.extApi.cdkTable.updateRowDefCache();
        //   2. re-render all rows.
        // The logic for re-rendering all rows is handled in `CdkTable._forceRenderDataRows()` which is a private method.
        // This is a workaround, assigning to `multiTemplateDataRows` will invoke the setter which
        // also calls `CdkTable._forceRenderDataRows()`
        // TODO: This is risky, the setter logic might change.
        // for example, if material will check for change in `multiTemplateDataRows` setter from previous value...
        this.pluginCtrl.extApi.cdkTable.multiTemplateDataRows = !!this._enabled;
    }
}

class PblNgridInfiniteScrollModule {
    constructor() {
        PblNgridPluginController.onCreatedSafe(PblNgridInfiniteScrollModule, (grid, controller) => {
            if (controller && controller.hasAncestor(PblNgridInfiniteScrollModule)) {
                controller.createPlugin(PLUGIN_KEY);
            }
        });
    }
}
PblNgridInfiniteScrollModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY, factory: 'create' }, PblNgridInfiniteScrollPlugin);
/** @nocollapse */ PblNgridInfiniteScrollModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteScrollModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridInfiniteScrollModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteScrollModule, declarations: [PblNgridInfiniteVirtualRowRefDirective, PblNgridInfiniteRowComponent, PblNgridDefaultInfiniteVirtualRowComponent], imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule], exports: [PblNgridInfiniteVirtualRowRefDirective, PblNgridInfiniteRowComponent] });
/** @nocollapse */ PblNgridInfiniteScrollModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteScrollModule, imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridInfiniteScrollModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule, PblNgridTargetEventsModule],
                    declarations: [PblNgridInfiniteVirtualRowRefDirective, PblNgridInfiniteRowComponent, PblNgridDefaultInfiniteVirtualRowComponent],
                    exports: [PblNgridInfiniteVirtualRowRefDirective, PblNgridInfiniteRowComponent]
                }]
        }], ctorParameters: function () { return []; } });

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridInfiniteRowComponent, PblNgridInfiniteScrollModule, PblNgridInfiniteVirtualRowRefDirective, createInfiniteScrollDS };
//# sourceMappingURL=pebula-ngrid-infinite-scroll.mjs.map
