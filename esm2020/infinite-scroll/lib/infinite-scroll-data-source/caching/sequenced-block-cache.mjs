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
export class SequencedBlockCache {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VxdWVuY2VkLWJsb2NrLWNhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9pbmZpbml0ZS1zY3JvbGwvc3JjL2xpYi9pbmZpbml0ZS1zY3JvbGwtZGF0YS1zb3VyY2UvY2FjaGluZy9zZXF1ZW5jZWQtYmxvY2stY2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7Ozs7Ozs7Ozs7Ozs7RUFhRTtBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBYzlCLFlBQTZCLE9BQXdDLEVBQUUsT0FBNkI7UUFBdkUsWUFBTyxHQUFQLE9BQU8sQ0FBaUM7UUFaOUQsUUFBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFRakIsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUluQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFYRCxJQUFJLE9BQU8sS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQy9DLElBQUksSUFBSSxLQUFhLE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFXdkMsTUFBTSxDQUFDLFFBQWdCLEVBQUUsS0FBYTtRQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSxJ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QUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ2YsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFRLENBQUMsQ0FBQztTQUMzRDtRQUNELElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNoQixPQUFPO2dCQUNMLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDeEMsQ0FBQztTQUNIO2FBQU0sSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87Z0JBQ0wsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQzthQUNwQyxDQUFDO1NBQ0g7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDO0lBRUQ7OztNQUdFO0lBQ00sYUFBYSxDQUFDLFFBQW9CO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUM7Z0JBQ3ZCLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDbEI7U0FDRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRFNDb250ZXh0IH0gZnJvbSAnLi4vaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UuY29udGV4dCc7XG5pbXBvcnQgeyBDYWNoZUFkYXB0ZXJPcHRpb25zLCBDYWNoZUJsb2NrLCBQYmxOZ3JpZENhY2hlQWRhcHRlciwgUm93U2VxdWVuY2UsIFN0YXJ0T3JFbmQgfSBmcm9tICcuL2NhY2hlLWFkYXB0ZXInO1xuXG4vKlxuVGhpcyBjYWNoZSB3aWxsIGZvcmNlIHRoZSBibG9ja3MgdG8gYWxpZ24gcGVyZmVjdGx5LCB3aGVyZSBubyBldmVudCBjYW4gYmUgZmlyZWQgd2l0aCByb3dzXG50aGF0IG92ZXJsYXAgYW55IG90aGVyIHBlcnZpb3VzIG9yIGZ1dHVyZSBldmVudCB1bmxlc3MgdGhleSBvdmVybGFwIGZ1bGx5LlxuRm9yIGV4YW1wbGUsIGlmIHRoZSBibG9jayBzaXplIGlzIDUwIGFuZCBzdHJpY3RCbG9ja3MgaXMgdHJ1ZSB0aGUgZXZlbnRzIHdpbGwgaW5jbHVkZSBmcm9tUm93LCB0b1Jvd3M6IFswLCA0OV0gWzUwLCA5OV0gLi4uLiBbMzAwLCAzNDldXG5JZiBzdHJpY3RCbG9ja3MgaXMgZmFsc2UgeW91IG1pZ2h0IGdldCB0aGUgYWJvdmUgYnV0IG1pZ2h0IGFsc28gZ2V0IFs3MywgMTIyXSBldGMuLi5cblxuV2hpbGUgdGhlIHVzZXIgc2Nyb2xscyBzbG93bHkgdGhlIGRhdGFzb3VyY2Ugd2lsbCBvdXRwdXQgc3RyaWN0IGJsb2NrcyBuYXRpdmVseSwgdGhlIGFub21hbGllcyBoYXBwZW4gd2hlblxudGhlIHVzZXIgc2Nyb2xscyBmYXN0LCBpbnRvIGEgc2Nyb2xsIGFyZWEgd2l0aCBubyByb3dzLlxuXG5Vc2luZyBzdHJpY3RCbG9ja3MgZml0cyB0byBzY2VuYXJpb3Mgd2hlcmUgdGhlIHNlcnZlciByZXR1cm5zIHBhZ2UgYmFzZWQgcGFnaW5hdGlvbiB3aXRoIG5vIG9wdGlvbiB0byBnZXQgaXRlbXMgYmV0d2VlbiBwYWdlcy4gKGkuZS4gZml4ZWQgcGFnZSBzaXplKVxuSWYgeW91ciBzZXJ2ZXIgcmV0dXJucyBwYWdpbmF0aW9uIGJhc2VkIG9uIFwic2tpcFwiIGFuZCBcImxpbWl0XCIgdGhlbiB1c2luZyBzdHJpY3RCbG9ja3MgZG9lcyBub3QgYWRkIGFueSB2YWx1ZS5cblxuV2hlbiB1c2luZyBzdHJpY3RCbG9ja3MgY2FjaGUgcGVyZm9ybWFuY2UgbWlnaHQgaW1wcm92ZSBidXQgdGhlIHRyYWRlb2ZmIGlzIGEgbGl0dGxlIGJpdCBtb3JlIEFQSSBjYWxscy5cbiovXG5cbi8qKlxuICogQSBDYWNoaW5nIHN0cmF0ZWd5IHRoYXQgZW5mb3JjZXMgc3RvcmluZyBjYWNoZSByb3dzIGluIGJsb2NrcyB3aGVyZVxuICpcbiAqICAtIEFsbCBibG9ja3MgaGF2ZSB0aGUgc2FtZSBwcmVkZWZpbmVkIHNpemUgKGNvbmZpZ3VyYWJsZSlcbiAqICAtIEEgYmxvY2sgY29udGFpbnMgaXRlbXMgaW4gYSBzZXF1ZW5jZSAoSS5FIEEgYmxvY2sgaXMgYSBwYWdlKVxuICogIC0gRWFjaCBibG9jayBtdXN0IGNvbnRpbnVlIGEgc2VxdWVuY2UgZnJvbSB0aGUgbGFzdCBibG9jay5cbiAqXG4gKiBJbiBBZGRpdGlvbiwgdGhlIGNhY2hlIGlzIGxpbWl0ZWQgYnkgc2l6ZSAoY29uZmlndXJhYmxlKS5cbiAqIFdoZW4gaXRlbXMgYXJlIGFkZGVkIG9yIHdoZW4gbWF4aW11bSBzaXplIGlzIHVwZGF0ZWQgdGhlIGNhY2hlIHdpbGwgYXV0by1wdXJnZSBpdGVtc1xuICogdGhhdCBjYXVzZSBvdmVyZmxvdy5cbiAqXG4gKiBJZiBpdGVtcyBhcmUgYWRkZWQgd2hpY2ggYnJlYWtzIHRoZSBjdXJyZW50IHNlcXVlbmNlIHRoZSBlbnRpcmUgY2FjaGUgaXMgcHVyZ2VkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogVGhpcyBpcyBiZXN0IGZvciBncmlkJ3MgdGhhdCB1c2UgYSBkYXRhc291cmNlIHdpdGggcGFnZSBiYXNlZCBwYWdpbmF0aW9uLlxuICogV2hpbGUgdGhlIHVzZXIgc2Nyb2xscywgZWFjaCBuZXh0IGl0ZW0gaXMgbW9zdCBvZnRlbiB0aGUgbmV4dCBibG9jayBpbiBzZXF1ZW5jZS5cbiAqXG4gKiBOb3RlIHRoYXQgd2hlbiBwcmUtZGVmaW5pbmcgdGhlIHZpcnR1YWwgc2l6ZSB0byB0aGUgdG90YWwgYW1vdW50IG9mIHJvd3Mgd2lsbCBhbGxvdyB0aGUgdXNlclxuICogdG8gZmFzdCBzY3JvbGwgd2hpY2ggbWlnaHQgYnJlYWsgdGhlIHNlcXVlbmNlLCBza2lwcGluZyBhIGJsb2NrIG9yIG1vcmUsIHRodXMgcHVyZ2luZyB0aGUgZW50aXJlIGNhY2hlLlxuICovXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VkQmxvY2tDYWNoZSBpbXBsZW1lbnRzIFBibE5ncmlkQ2FjaGVBZGFwdGVyPENhY2hlQWRhcHRlck9wdGlvbnM+IHtcblxuICBwdWJsaWMgZW5kOiBudW1iZXIgPSAtMTtcbiAgcHVibGljIHN0YXJ0OiBudW1iZXIgPSAwO1xuXG4gIGdldCBtYXhTaXplKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9tYXhTaXplOyB9XG4gIGdldCBzaXplKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmVuZCAtIHRoaXMuc3RhcnQgKyAxOyB9XG4gIGdldCBlbXB0eSgpIHsgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gMDsgfVxuXG4gIHJlYWRvbmx5IG9wdGlvbnM6IENhY2hlQWRhcHRlck9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBfbWF4U2l6ZSA9IDA7XG4gIHByaXZhdGUgbGFzdEFkZDogU3RhcnRPckVuZCB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGNvbnRleHQ6IFBibEluZmluaXRlU2Nyb2xsRFNDb250ZXh0PGFueT4sIG9wdGlvbnM/OiBDYWNoZUFkYXB0ZXJPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0geyAuLi4ob3B0aW9ucyB8fCB7fSkgfTtcbiAgfVxuXG4gIHJlbW92ZShzdGFydFJvdzogbnVtYmVyLCBjb3VudDogbnVtYmVyKTogUm93U2VxdWVuY2VbXSB7XG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heChzdGFydFJvdywgdGhpcy5zdGFydCk7XG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4oc3RhcnRSb3cgKyBjb3VudCAtIDEsIHRoaXMuZW5kKTtcbiAgICByZXR1cm4gWyBbc3RhcnQsIGVuZF0gXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG5ldyBtYXggc2l6ZSBmb3IgdGhpcyBjYWNoZS5cbiAgICogQHJldHVybnMgV2hlbiBuZXcgbWF4IHNpemUgaXMgYmlnZ2VyIHRoZSBvbGQgJiBjdXJyZW50IHNpemUgdmlvbGF0ZXMgdGhlIG5ldyBtYXggc2l6ZSwgcmV0dXJuIHRoZSBudW1iZXIgb2YgaXRlbXMgdHJpbW1lZCBmcm9tIHRoZSBjYWNoZVxuICAgKiB3aXRoIHBvc2l0aXZlIHZhbHVlIGlmIHRyaW1tZWQgZnJvbSBlbmQsIG5lZ2F0aXZlIHZhbHVlIGlmIHRyaW1tZWQgZnJvbSBzdGFydC4gT3RoZXJ3aXNlIHJldHVybnMgMC5cbiAgICovXG4gIHNldENhY2hlU2l6ZShtYXhTaXplOiBudW1iZXIpOiBSb3dTZXF1ZW5jZVtdIHtcbiAgICB0aGlzLl9tYXhTaXplID0gTWF0aC5tYXgoMCwgbWF4U2l6ZSk7XG4gICAgY29uc3Qgb3ZlcnNpemUgPSB0aGlzLmFsaWduQm91bmRhcnkodGhpcy5sYXN0QWRkIHx8IDEpO1xuICAgIGlmIChvdmVyc2l6ZSA8IDApIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFt0aGlzLnN0YXJ0ICsgb3ZlcnNpemUsIHRoaXMuc3RhcnQgLSAxXSxcbiAgICAgIF07XG4gICAgfSBlbHNlIGlmIChvdmVyc2l6ZSA+IDApIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFt0aGlzLmVuZCArIDEsIHRoaXMuZW5kICsgb3ZlcnNpemVdLFxuICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShzdGFydFJvdzogbnVtYmVyLCBlbmRSb3c6IG51bWJlciwgZGlyZWN0aW9uOiBTdGFydE9yRW5kKTogUm93U2VxdWVuY2VbXSB7XG4gICAgaWYgKHRoaXMuZW1wdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChzdGFydFJvdywgZW5kUm93IC0gc3RhcnRSb3cgKyAxKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNTaWJsaW5nKHN0YXJ0Um93LCBlbmRSb3csIGRpcmVjdGlvbikpIHtcbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuc3RhcnQgLSBzdGFydFJvdztcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHN0YXJ0Um93LCBvZmZzZXQpO1xuICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZW5kUm93IC0gdGhpcy5lbmQ7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZCh0aGlzLmVuZCArIDEsIG9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBzY3JvbGwgLSBTZXF1ZW5jZWQgYmxvY2sgY2FjaGUgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMuYWRkKHN0YXJ0Um93LCBlbmRSb3cgLSBzdGFydFJvdyArIDEpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICBjbGVhcigpOiBSb3dTZXF1ZW5jZVtdIHtcbiAgICB0aGlzLmxhc3RBZGQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMuZW1wdHkpIHtcbiAgICAgIHJldHVybiBbIFswLCAwXSBdO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcztcbiAgICB0aGlzLnN0YXJ0ID0gMDtcbiAgICB0aGlzLmVuZCA9IC0xO1xuICAgIHJldHVybiBbIFtzdGFydCwgZW5kXSBdO1xuICB9XG5cbiAgY3JlYXRlQmxvY2soc3RhcnRJbmRleDogbnVtYmVyLCBlbmRJbmRleDogbnVtYmVyLCB0b3RhbExlbmd0aCA9IDApOiBDYWNoZUJsb2NrIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBbIGRpcmVjdGlvbiwgc3RhcnQsIGVuZCBdID0gdGhpcy5tYXRjaEJsb2NrKHN0YXJ0SW5kZXgsIGVuZEluZGV4KSB8fCBbXTtcblxuICAgIGlmICghZGlyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYmxvY2tTaXplIH0gPSB0aGlzLmNvbnRleHQub3B0aW9ucztcblxuICAgIGxldCBmcm9tUm93OiBudW1iZXI7XG4gICAgbGV0IHRvUm93OiBudW1iZXI7XG4gICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIGZyb21Sb3cgPSBNYXRoLm1heCgwLCBlbmQgLSAoYmxvY2tTaXplIC0gMSkpO1xuICAgICAgICB0b1JvdyA9IGVuZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGZyb21Sb3cgPSBzdGFydDtcbiAgICAgICAgdG9Sb3cgPSBzdGFydCArIGJsb2NrU2l6ZSAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh0b3RhbExlbmd0aCAmJiBmcm9tUm93ID49IHRvdGFsTGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIFN0cmljdCBCbG9jayBsb2dpYzpcbiAgICAvLyBOb3csIHdlIGFsaWduIHRoZSBibG9jayB0byBtYXRjaCBhIHNlcXVlbnRpYWwgd29ybGQgb2YgYmxvY2tzIGJhc2VkIG9uIHRoZSBibG9jayBzaXplLlxuICAgIC8vIElmIHdlIGhhdmUgYSBnYXAgd2Ugd2FudCB0byBkaXZlcnQgdG8gdGhlIG5lYXJlc3QgYmxvY2sgc3RhcnQvZW5kLCBiYXNlZCBvbiB0aGUgZGlyZWN0aW9uLlxuICAgIC8vIElmIHdlIGdvIGRvd24gKGRpcmVjdGlvbiBpcyAxKSB3ZSB3YW50IHRoZSBuZWFyZXN0IGJsb2NrIHN0YXJ0IEJFTE9XIHVzLCBnZXR0aW5nIGR1cGxpY2F0ZXMgaW4gdGhlIGNhbGwgYnV0IGVuc3VyaW5nIG5vIGdhcHMgYWhlYWRcbiAgICAvLyBJZiB3ZSBnbyB1cCAoZGlyZWN0aW9uIGlzIC0xKSB3ZSB3YW50IHRvIG5lYXJlc3QgYmxvY2sgc3RhcnQgQUJPVkUgdXMsIGdldHRpbmcgZHVwbGljYXRlcyBpbiB0aGUgY2FsbCBidXQgZW5zdXJpbmcgbm8gZ2FwcyBhaGVhZC5cbiAgICBjb25zdCBtYWluID0gZGlyZWN0aW9uID09PSAxID8gZnJvbVJvdyA6IHRvUm93O1xuICAgIGxldCByZW0gPSBtYWluICUgYmxvY2tTaXplO1xuICAgIGlmIChyZW0gIT09IDApIHtcbiAgICAgIGZyb21Sb3cgPSBtYWluIC0gcmVtO1xuICAgICAgdG9Sb3cgPSBmcm9tUm93ICsgYmxvY2tTaXplIC0gMTtcbiAgICB9XG5cbiAgICBpZiAodG90YWxMZW5ndGgpIHtcbiAgICAgIGlmICh0b1JvdyA+PSB0b3RhbExlbmd0aCkge1xuICAgICAgICB0b1JvdyA9IHRvdGFsTGVuZ3RoIC0gMTtcbiAgICAgICAgZnJvbVJvdyA9IHRvUm93IC0gKHRvUm93ICUgYmxvY2tTaXplKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBbZGlyZWN0aW9uLCBmcm9tUm93LCB0b1Jvd107XG4gIH1cblxuICBwcml2YXRlIG1hdGNoQmxvY2soc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBbLTEgfCAxLCBudW1iZXIsIG51bWJlcl0gfCB1bmRlZmluZWQge1xuICAgIGlmICh0aGlzLmVtcHR5KSB7XG4gICAgICByZXR1cm4gWzEsIHN0YXJ0LCBlbmRdO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+PSB0aGlzLnN0YXJ0ICYmIGVuZCA8PSB0aGlzLmVuZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPCB0aGlzLnN0YXJ0ICYmIGVuZCA+PSB0aGlzLnN0YXJ0IC0gMSkge1xuICAgICAgcmV0dXJuIFstMSwgc3RhcnQsIHRoaXMuc3RhcnQgLTFdO1xuICAgIH1cbiAgICBpZiAoZW5kID4gdGhpcy5lbmQgJiYgc3RhcnQgPD0gdGhpcy5lbmQgKyAxKSB7XG4gICAgICByZXR1cm4gWzEsIHRoaXMuZW5kICsgMSwgZW5kXTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2VuZCA+IHRoaXMuZW5kID8gMSA6IC0xLCBzdGFydCwgZW5kXTtcbiAgfVxuXG4gIHByaXZhdGUgb3ZlcnNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heFNpemUgPyBNYXRoLm1heCh0aGlzLnNpemUgLSB0aGlzLl9tYXhTaXplLCAwKSA6IDA7XG4gIH1cblxuICBwcml2YXRlIGlzU2libGluZyhzdGFydFJvdzogbnVtYmVyLCBlbmRSb3c6IG51bWJlciwgZGlyZWN0aW9uOiBTdGFydE9yRW5kKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5kICsgMSA9PT0gc3RhcnRSb3c7XG4gICAgfVxuICAgIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydCAtIDEgPT09IGVuZFJvdztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGQoc3RhcnRSb3c6IG51bWJlciwgY291bnQ6IG51bWJlcik6IFJvd1NlcXVlbmNlW10ge1xuICAgIGlmIChzdGFydFJvdyA8IDAgfHwgY291bnQgPD0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGxldCBvdmVyc2l6ZTogbnVtYmVyO1xuICAgIGxldCBlbmQgPSBzdGFydFJvdyArIGNvdW50IC0gMTtcbiAgICBpZiAodGhpcy5lbXB0eSkge1xuICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0Um93O1xuICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgICBvdmVyc2l6ZSA9IHRoaXMuYWxpZ25Cb3VuZGFyeSgxKTtcbiAgICB9IGVsc2UgaWYgKHN0YXJ0Um93IDwgdGhpcy5zdGFydCkge1xuICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0Um93O1xuICAgICAgb3ZlcnNpemUgPSB0aGlzLmFsaWduQm91bmRhcnkoLSh0aGlzLmxhc3RBZGQgPSAtMSkgYXMgYW55KTtcbiAgICB9IGVsc2UgaWYgKGVuZCA+IHRoaXMuZW5kKSB7XG4gICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICAgIG92ZXJzaXplID0gdGhpcy5hbGlnbkJvdW5kYXJ5KC0odGhpcy5sYXN0QWRkID0gMSkgYXMgYW55KTtcbiAgICB9XG4gICAgaWYgKG92ZXJzaXplIDwgMCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgW3RoaXMuc3RhcnQgKyBvdmVyc2l6ZSwgdGhpcy5zdGFydCAtIDFdLFxuICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKG92ZXJzaXplID4gMCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgW3RoaXMuZW5kICsgMSwgdGhpcy5lbmQgKyBvdmVyc2l6ZV0sXG4gICAgICBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWduIHRoZSBjYWNoZSB0byBmaXggbWF4IHNpemUuXG4gICAqIEByZXR1cm5zIHRoZSBudW1iZXIgb2YgaXRlbXMgdHJpbW1lZCBmcm9tIHRoZSBjYWNoZSB3aXRoIHBvc2l0aXZlIHZhbHVlIGlmIHRyaW1tZWQgZnJvbSBlbmQsIG5lZ2F0aXZlIHZhbHVlIGlmIHRyaW1tZWQgZnJvbSBzdGFydC5cbiAgKi9cbiAgcHJpdmF0ZSBhbGlnbkJvdW5kYXJ5KHRyaW1Gcm9tOiBTdGFydE9yRW5kKTogbnVtYmVyIHtcbiAgICBjb25zdCBvdmVyc2l6ZSA9IHRoaXMub3ZlcnNpemUoKTtcbiAgICBpZiAob3ZlcnNpemUpIHtcbiAgICAgIGlmICh0cmltRnJvbSA9PT0gMSkge1xuICAgICAgICB0aGlzLmVuZCAtPSBvdmVyc2l6ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3RhcnQgKz0gb3ZlcnNpemU7XG4gICAgICAgIHJldHVybiAtb3ZlcnNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdmVyc2l6ZTtcbiAgfVxufVxuIl19