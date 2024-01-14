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
export class NoOpBlockCache {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC1jYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvaW5maW5pdGUtc2Nyb2xsL3NyYy9saWIvaW5maW5pdGUtc2Nyb2xsLWRhdGEtc291cmNlL2NhY2hpbmcvbm9vcC1jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFTekIsWUFBNkIsT0FBd0MsRUFBbUIsVUFBZTtRQUExRSxZQUFPLEdBQVAsT0FBTyxDQUFpQztRQUFtQixlQUFVLEdBQVYsVUFBVSxDQUFLO1FBQ3JHLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFWRCxJQUFJLE9BQU8sS0FBYSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNoRCxJQUFJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3QyxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQVV2QyxNQUFNLENBQUMsUUFBZ0IsRUFBRSxLQUFhO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsT0FBZTtRQUMxQixPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsU0FBcUI7UUFDNUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsS0FBSztRQUNILE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxXQUFXLENBQUMsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFdBQVcsR0FBRyxDQUFDO1FBQy9ELE1BQU0sQ0FBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5RSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2QsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFFM0MsSUFBSSxPQUFlLENBQUM7UUFDcEIsSUFBSSxLQUFhLENBQUM7UUFDbEIsUUFBUSxTQUFTLEVBQUU7WUFDakIsS0FBSyxDQUFDLENBQUM7Z0JBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDaEIsS0FBSyxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QixNQUFNO1NBQ1Q7UUFFRCxJQUFJLFdBQVcsSUFBSSxPQUFPLElBQUksV0FBVyxFQUFFO1lBQ3pDLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBRUQsSUFBSSxXQUFXLEVBQUU7WUFDZixJQUFJLEtBQUssSUFBSSxXQUFXLEVBQUU7Z0JBQ3hCLEtBQUssR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCO1NBQ0Y7UUFFRCxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU8sVUFBVSxDQUFDLEtBQWEsRUFBRSxHQUFXO1FBQzNDLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUNqQixPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRTlCLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDakMsS0FBSyxHQUFHLENBQUMsQ0FBQzthQUNYO2lCQUFNO2dCQUNMLE1BQU07YUFDUDtTQUNGO1FBRUQsSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFO1lBQ2pCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO2FBQU07WUFDTCxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZSB9IGZyb20gJy4uL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRFNDb250ZXh0IH0gZnJvbSAnLi4vaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UuY29udGV4dCc7XG5pbXBvcnQgeyBDYWNoZUFkYXB0ZXJPcHRpb25zLCBDYWNoZUJsb2NrLCBQYmxOZ3JpZENhY2hlQWRhcHRlciwgUm93U2VxdWVuY2UsIFN0YXJ0T3JFbmQgfSBmcm9tICcuL2NhY2hlLWFkYXB0ZXInO1xuXG4vKipcbiAqIEEgQ2FjaGluZyBzdHJhdGVneSB0aGF0IGVuZm9yY2VzIHN0b3JpbmcgY2FjaGUgcm93cyBpbiBibG9ja3Mgd2hlcmVcbiAqXG4gKiAgLSBBbGwgYmxvY2tzIGhhdmUgdGhlIHNhbWUgcHJlZGVmaW5lZCBzaXplIChjb25maWd1cmFibGUpXG4gKiAgLSBBIGJsb2NrIGNvbnRhaW5zIGl0ZW1zIGluIGEgc2VxdWVuY2UgKEkuRSBBIGJsb2NrIGlzIGEgcGFnZSlcbiAqICAtIEVhY2ggYmxvY2sgbXVzdCBjb250aW51ZSBhIHNlcXVlbmNlIGZyb20gdGhlIGxhc3QgYmxvY2suXG4gKlxuICogSW4gQWRkaXRpb24sIHRoZSBjYWNoZSBpcyBsaW1pdGVkIGJ5IHNpemUgKGNvbmZpZ3VyYWJsZSkuXG4gKiBXaGVuIGl0ZW1zIGFyZSBhZGRlZCBvciB3aGVuIG1heGltdW0gc2l6ZSBpcyB1cGRhdGVkIHRoZSBjYWNoZSB3aWxsIGF1dG8tcHVyZ2UgaXRlbXNcbiAqIHRoYXQgY2F1c2Ugb3ZlcmZsb3cuXG4gKlxuICogSWYgaXRlbXMgYXJlIGFkZGVkIHdoaWNoIGJyZWFrcyB0aGUgY3VycmVudCBzZXF1ZW5jZSB0aGUgZW50aXJlIGNhY2hlIGlzIHB1cmdlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIFRoaXMgaXMgYmVzdCBmb3IgZ3JpZCdzIHRoYXQgdXNlIGEgZGF0YXNvdXJjZSB3aXRoIHBhZ2UgYmFzZWQgcGFnaW5hdGlvbi5cbiAqIFdoaWxlIHRoZSB1c2VyIHNjcm9sbHMsIGVhY2ggbmV4dCBpdGVtIGlzIG1vc3Qgb2Z0ZW4gdGhlIG5leHQgYmxvY2sgaW4gc2VxdWVuY2UuXG4gKlxuICogTm90ZSB0aGF0IHdoZW4gcHJlLWRlZmluaW5nIHRoZSB2aXJ0dWFsIHNpemUgdG8gdGhlIHRvdGFsIGFtb3VudCBvZiByb3dzIHdpbGwgYWxsb3cgdGhlIHVzZXJcbiAqIHRvIGZhc3Qgc2Nyb2xsIHdoaWNoIG1pZ2h0IGJyZWFrIHRoZSBzZXF1ZW5jZSwgc2tpcHBpbmcgYSBibG9jayBvciBtb3JlLCB0aHVzIHB1cmdpbmcgdGhlIGVudGlyZSBjYWNoZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vT3BCbG9ja0NhY2hlIGltcGxlbWVudHMgUGJsTmdyaWRDYWNoZUFkYXB0ZXI8Q2FjaGVBZGFwdGVyT3B0aW9ucz4ge1xuICBnZXQgbWF4U2l6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5kcy5sZW5ndGg7IH1cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZHMubGVuZ3RoOyB9XG4gIGdldCBlbXB0eSgpIHsgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gMDsgfVxuXG4gIHJlYWRvbmx5IG9wdGlvbnM6IENhY2hlQWRhcHRlck9wdGlvbnM7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkczogUGJsSW5maW5pdGVTY3JvbGxEYXRhU291cmNlPGFueT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBjb250ZXh0OiBQYmxJbmZpbml0ZVNjcm9sbERTQ29udGV4dDxhbnk+LCBwcml2YXRlIHJlYWRvbmx5IHZpcnR1YWxSb3c6IGFueSkge1xuICAgIHRoaXMuZHMgPSBjb250ZXh0LmdldERhdGFTb3VyY2UoKTtcbiAgfVxuXG4gIHJlbW92ZShzdGFydFJvdzogbnVtYmVyLCBjb3VudDogbnVtYmVyKTogUm93U2VxdWVuY2VbXSB7XG4gICAgY29uc3Qgc3RhcnQgPSAwO1xuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHN0YXJ0Um93ICsgY291bnQgLSAxLCB0aGlzLmRzLmxlbmd0aCk7XG4gICAgcmV0dXJuIFsgW3N0YXJ0LCBlbmQgXSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbmV3IG1heCBzaXplIGZvciB0aGlzIGNhY2hlLlxuICAgKiBAcmV0dXJucyBXaGVuIG5ldyBtYXggc2l6ZSBpcyBiaWdnZXIgdGhlIG9sZCAmIGN1cnJlbnQgc2l6ZSB2aW9sYXRlcyB0aGUgbmV3IG1heCBzaXplLCByZXR1cm4gdGhlIG51bWJlciBvZiBpdGVtcyB0cmltbWVkIGZyb20gdGhlIGNhY2hlXG4gICAqIHdpdGggcG9zaXRpdmUgdmFsdWUgaWYgdHJpbW1lZCBmcm9tIGVuZCwgbmVnYXRpdmUgdmFsdWUgaWYgdHJpbW1lZCBmcm9tIHN0YXJ0LiBPdGhlcndpc2UgcmV0dXJucyAwLlxuICAgKi9cbiAgc2V0Q2FjaGVTaXplKG1heFNpemU6IG51bWJlcik6IFJvd1NlcXVlbmNlW10ge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHVwZGF0ZShzdGFydFJvdzogbnVtYmVyLCBlbmRSb3c6IG51bWJlciwgZGlyZWN0aW9uOiBTdGFydE9yRW5kKTogUm93U2VxdWVuY2VbXSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY2xlYXIoKTogUm93U2VxdWVuY2VbXSB7XG4gICAgcmV0dXJuIFsgWzAsIHRoaXMuZHMubGVuZ3RoIC0gMV0gXTtcbiAgfVxuXG4gIGNyZWF0ZUJsb2NrKHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlciwgdG90YWxMZW5ndGggPSAwKTogQ2FjaGVCbG9jayB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgWyBkaXJlY3Rpb24sIHN0YXJ0LCBlbmQgXSA9IHRoaXMubWF0Y2hCbG9jayhzdGFydEluZGV4LCBlbmRJbmRleCkgfHwgW107XG5cbiAgICBpZiAoIWRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCB7IGJsb2NrU2l6ZSB9ID0gdGhpcy5jb250ZXh0Lm9wdGlvbnM7XG5cbiAgICBsZXQgZnJvbVJvdzogbnVtYmVyO1xuICAgIGxldCB0b1JvdzogbnVtYmVyO1xuICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIC0xOlxuICAgICAgICBmcm9tUm93ID0gTWF0aC5tYXgoMCwgZW5kIC0gKGJsb2NrU2l6ZSAtIDEpKTtcbiAgICAgICAgdG9Sb3cgPSBlbmQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBmcm9tUm93ID0gc3RhcnQ7XG4gICAgICAgIHRvUm93ID0gc3RhcnQgKyBibG9ja1NpemUgLSAxO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAodG90YWxMZW5ndGggJiYgZnJvbVJvdyA+PSB0b3RhbExlbmd0aCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodG90YWxMZW5ndGgpIHtcbiAgICAgIGlmICh0b1JvdyA+PSB0b3RhbExlbmd0aCkge1xuICAgICAgICB0b1JvdyA9IHRvdGFsTGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW2RpcmVjdGlvbiwgZnJvbVJvdywgdG9Sb3ddO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaEJsb2NrKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogQ2FjaGVCbG9jayB8IHVuZGVmaW5lZCB7IC8vIFRPRE86IHJlZmFjdG9yIHRvIGxhYmVsZWQgdHVwbGUgdHlwZXMgaW4gVFMgNC4wXG4gICAgaWYgKHN0YXJ0ID09PSBlbmQpIHtcbiAgICAgIHJldHVybiBbMSwgc3RhcnQsIGVuZF07XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlID0gdGhpcy5kcy5zb3VyY2U7XG5cbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgIGlmIChzb3VyY2VbaV0gIT09IHRoaXMudmlydHVhbFJvdykge1xuICAgICAgICBzdGFydCA9IGk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPT09IGVuZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFsxLCBzdGFydCwgZW5kXTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==