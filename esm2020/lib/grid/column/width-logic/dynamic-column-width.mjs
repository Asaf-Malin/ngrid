/**
 * A column width calculator that calculates column width for a specific column or a group of columns.
 * It also provide the minimum required row width for the total columns added up to that point.
 *
 * The `DynamicColumnWidthLogic` takes into account real-time DOM measurements (especially box-model metadata), hence "dynamic".
 * It performs the calculation based on `PblColumn` and actual DOM size metadata.
 *
 * The `DynamicColumnWidthLogic` has 3 responsibilities:
 *
 * - It is responsible for enforcing the `maxWidth` boundary constraint for every column it processes by calculating the actual width
 * of a column and calling `PblColumn.checkMaxWidthLock` to verify if max width lock has changed due to the new actual width.
 *
 * - It calculates the absolute width for a group of columns, so `PblCdkVirtualScrollViewportComponentGroupColumn` can have an exact size that wraps it's children.
 *
 * - It calculates the `minimumRowWidth`, which represents the minimum width required width of the row, i.e. table.
 *
 * > Note that an instance of `DynamicColumnWidthLogic` represents a one-time pass for all columns, for every run a new instance is required.
 */
export class DynamicColumnWidthLogic {
    constructor(strategy, dir) {
        this.strategy = strategy;
        this.dir = dir;
        this.cols = new Map();
        this._minimumRowWidth = 0;
    }
    get minimumRowWidth() { return this._minimumRowWidth; }
    ;
    reset() {
        this.maxWidthLockChanged = false;
        this._minimumRowWidth = 0;
        this.cols.clear();
    }
    /**
     * Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
     */
    widthBreakout(columnInfo) {
        return widthBreakout(this.strategy, columnInfo);
    }
    /**
     * Add a column to the calculation.
     *
     * The operation will update the minimum required width and trigger a `checkMaxWidthLock` on the column.
     * If the max width lock has changed the `maxWidthLockChanged` is set to true.
     *
     * A column that was previously added is ignored.
     *
     * Note that once `maxWidthLockChanged` is set to true it will never change.
     */
    addColumn(columnInfo) {
        if (!this.cols.has(columnInfo)) {
            const { column } = columnInfo;
            let minWidth = column.minWidth || 0;
            if (column.isFixedWidth) {
                minWidth = Math.max(column.parsedWidth.value, minWidth);
            }
            const nonContent = this.strategy.cell(columnInfo);
            const width = minWidth + nonContent;
            this.cols.set(columnInfo, width);
            this._minimumRowWidth += width;
            if (column.maxWidth) {
                const actualWidth = columnInfo.width - nonContent;
                if (column.checkMaxWidthLock(actualWidth)) {
                    this.maxWidthLockChanged = true;
                }
            }
        }
    }
    /**
     * Run each of the columns through `addColumn` and returns the sum of the width all columns using
     * the box model space strategy.
     *
     * The result represents the absolute width to be used in a `PblColumnGroup`.
     *
     * > Note that when a table has multiple column-group rows each column is the child of multiple group column, hence calling `addColumn` with the
     * same group more then once. However, since `addColumn()` ignores columns it already processed it is safe.
     */
    addGroup(columnInfos) {
        let sum = 0;
        for (const c of columnInfos) {
            this.addColumn(c);
            sum += c.width;
        }
        sum -= this.strategy.group(columnInfos, this.dir);
        return sum;
    }
}
/**
* Returns a breakout of the width of the column, breaking it into the width of the content and the rest of the width
*/
export function widthBreakout(strategy, columnInfo) {
    const nonContent = strategy.cell(columnInfo);
    return {
        content: columnInfo.width - nonContent,
        nonContent,
    };
}
export const DYNAMIC_PADDING_BOX_MODEL_SPACE_STRATEGY = {
    cell(col) {
        const style = col.style;
        return parseInt(style.paddingLeft, 10) + parseInt(style.paddingRight, 10);
    },
    groupCell(col) {
        return 0;
    },
    group(cols, dir) {
        const len = cols.length;
        return len > 0 ? parseInt(cols[0].style[dir === 'rtl' ? 'paddingRight' : 'paddingLeft'], 10) + parseInt(cols[len - 1].style[dir === 'rtl' ? 'paddingLeft' : 'paddingRight'], 10) : 0;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pYy1jb2x1bW4td2lkdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jb2x1bW4vd2lkdGgtbG9naWMvZHluYW1pYy1jb2x1bW4td2lkdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsTUFBTSxPQUFPLHVCQUF1QjtJQVlsQyxZQUE0QixRQUErQixFQUFTLEdBQWU7UUFBdkQsYUFBUSxHQUFSLFFBQVEsQ0FBdUI7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFZO1FBSGxFLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztRQUNyRCxxQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFFMEQsQ0FBQztJQUx4RixJQUFJLGVBQWUsS0FBYSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBT2hFLEtBQUs7UUFDSCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhLENBQUMsVUFBNkI7UUFDekMsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBUyxDQUFDLFVBQTZCO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDekQ7WUFDRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRCxNQUFNLEtBQUssR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksS0FBSyxDQUFDO1lBRS9CLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7Z0JBQ2xELElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUN6QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2lCQUNqQzthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxRQUFRLENBQUMsV0FBZ0M7UUFDdkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osS0FBSyxNQUFNLENBQUMsSUFBSSxXQUFXLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNoQjtRQUNGLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUVGO0FBRUQ7O0VBRUU7QUFDRixNQUFNLFVBQVUsYUFBYSxDQUFDLFFBQStCLEVBQUUsVUFBNkI7SUFDM0YsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxPQUFPO1FBQ0wsT0FBTyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVTtRQUN0QyxVQUFVO0tBQ1gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSx3Q0FBd0MsR0FBMEI7SUFDN0UsSUFBSSxDQUFDLEdBQXNCO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMzRSxDQUFDO0lBQ0QsU0FBUyxDQUFDLEdBQXNCO1FBQzlCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUF5QixFQUFFLEdBQWU7UUFDOUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN4QixPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2TCxDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IFBibENvbHVtblNpemVJbmZvIH0gZnJvbSAnLi4vLi4vY29sdW1uL21vZGVsL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEJveE1vZGVsU3BhY2VTdHJhdGVneSB7XG4gIGNlbGwoY29sOiBQYmxDb2x1bW5TaXplSW5mbyk6IG51bWJlcjtcbiAgZ3JvdXBDZWxsKGNvbDogUGJsQ29sdW1uU2l6ZUluZm8pOiBudW1iZXI7XG4gIGdyb3VwKGNvbHM6IFBibENvbHVtblNpemVJbmZvW10sIGRpcj86IERpcmVjdGlvbik6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBIGNvbHVtbiB3aWR0aCBjYWxjdWxhdG9yIHRoYXQgY2FsY3VsYXRlcyBjb2x1bW4gd2lkdGggZm9yIGEgc3BlY2lmaWMgY29sdW1uIG9yIGEgZ3JvdXAgb2YgY29sdW1ucy5cbiAqIEl0IGFsc28gcHJvdmlkZSB0aGUgbWluaW11bSByZXF1aXJlZCByb3cgd2lkdGggZm9yIHRoZSB0b3RhbCBjb2x1bW5zIGFkZGVkIHVwIHRvIHRoYXQgcG9pbnQuXG4gKlxuICogVGhlIGBEeW5hbWljQ29sdW1uV2lkdGhMb2dpY2AgdGFrZXMgaW50byBhY2NvdW50IHJlYWwtdGltZSBET00gbWVhc3VyZW1lbnRzIChlc3BlY2lhbGx5IGJveC1tb2RlbCBtZXRhZGF0YSksIGhlbmNlIFwiZHluYW1pY1wiLlxuICogSXQgcGVyZm9ybXMgdGhlIGNhbGN1bGF0aW9uIGJhc2VkIG9uIGBQYmxDb2x1bW5gIGFuZCBhY3R1YWwgRE9NIHNpemUgbWV0YWRhdGEuXG4gKlxuICogVGhlIGBEeW5hbWljQ29sdW1uV2lkdGhMb2dpY2AgaGFzIDMgcmVzcG9uc2liaWxpdGllczpcbiAqXG4gKiAtIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBlbmZvcmNpbmcgdGhlIGBtYXhXaWR0aGAgYm91bmRhcnkgY29uc3RyYWludCBmb3IgZXZlcnkgY29sdW1uIGl0IHByb2Nlc3NlcyBieSBjYWxjdWxhdGluZyB0aGUgYWN0dWFsIHdpZHRoXG4gKiBvZiBhIGNvbHVtbiBhbmQgY2FsbGluZyBgUGJsQ29sdW1uLmNoZWNrTWF4V2lkdGhMb2NrYCB0byB2ZXJpZnkgaWYgbWF4IHdpZHRoIGxvY2sgaGFzIGNoYW5nZWQgZHVlIHRvIHRoZSBuZXcgYWN0dWFsIHdpZHRoLlxuICpcbiAqIC0gSXQgY2FsY3VsYXRlcyB0aGUgYWJzb2x1dGUgd2lkdGggZm9yIGEgZ3JvdXAgb2YgY29sdW1ucywgc28gYFBibENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydENvbXBvbmVudEdyb3VwQ29sdW1uYCBjYW4gaGF2ZSBhbiBleGFjdCBzaXplIHRoYXQgd3JhcHMgaXQncyBjaGlsZHJlbi5cbiAqXG4gKiAtIEl0IGNhbGN1bGF0ZXMgdGhlIGBtaW5pbXVtUm93V2lkdGhgLCB3aGljaCByZXByZXNlbnRzIHRoZSBtaW5pbXVtIHdpZHRoIHJlcXVpcmVkIHdpZHRoIG9mIHRoZSByb3csIGkuZS4gdGFibGUuXG4gKlxuICogPiBOb3RlIHRoYXQgYW4gaW5zdGFuY2Ugb2YgYER5bmFtaWNDb2x1bW5XaWR0aExvZ2ljYCByZXByZXNlbnRzIGEgb25lLXRpbWUgcGFzcyBmb3IgYWxsIGNvbHVtbnMsIGZvciBldmVyeSBydW4gYSBuZXcgaW5zdGFuY2UgaXMgcmVxdWlyZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEeW5hbWljQ29sdW1uV2lkdGhMb2dpYyB7XG4gIC8qKlxuICAgKiBXaGVuIHRydWUsIGl0IGluZGljYXRlcyB0aGF0IG9uZSAob3IgbW9yZSkgY29sdW1ucyBoYXMgY2hhbmdlZCB0aGUgbWF4IHdpZHRoIGxvY2sgc3RhdGUuXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgbWF4V2lkdGhMb2NrQ2hhbmdlZDogYm9vbGVhbjtcblxuICBnZXQgbWluaW11bVJvd1dpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9taW5pbXVtUm93V2lkdGg7IH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjb2xzID0gbmV3IE1hcDxQYmxDb2x1bW5TaXplSW5mbywgbnVtYmVyPigpO1xuICBwcml2YXRlIF9taW5pbXVtUm93V2lkdGggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBzdHJhdGVneTogQm94TW9kZWxTcGFjZVN0cmF0ZWd5LCBwdWJsaWMgZGlyPzogRGlyZWN0aW9uKSB7IH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLm1heFdpZHRoTG9ja0NoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9taW5pbXVtUm93V2lkdGggPSAwO1xuICAgIHRoaXMuY29scy5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBicmVha291dCBvZiB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbiwgYnJlYWtpbmcgaXQgaW50byB0aGUgd2lkdGggb2YgdGhlIGNvbnRlbnQgYW5kIHRoZSByZXN0IG9mIHRoZSB3aWR0aFxuICAgKi9cbiAgd2lkdGhCcmVha291dChjb2x1bW5JbmZvOiBQYmxDb2x1bW5TaXplSW5mbyk6IHsgY29udGVudDogbnVtYmVyLCBub25Db250ZW50OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHdpZHRoQnJlYWtvdXQodGhpcy5zdHJhdGVneSwgY29sdW1uSW5mbyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY29sdW1uIHRvIHRoZSBjYWxjdWxhdGlvbi5cbiAgICpcbiAgICogVGhlIG9wZXJhdGlvbiB3aWxsIHVwZGF0ZSB0aGUgbWluaW11bSByZXF1aXJlZCB3aWR0aCBhbmQgdHJpZ2dlciBhIGBjaGVja01heFdpZHRoTG9ja2Agb24gdGhlIGNvbHVtbi5cbiAgICogSWYgdGhlIG1heCB3aWR0aCBsb2NrIGhhcyBjaGFuZ2VkIHRoZSBgbWF4V2lkdGhMb2NrQ2hhbmdlZGAgaXMgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIEEgY29sdW1uIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgaXMgaWdub3JlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0IG9uY2UgYG1heFdpZHRoTG9ja0NoYW5nZWRgIGlzIHNldCB0byB0cnVlIGl0IHdpbGwgbmV2ZXIgY2hhbmdlLlxuICAgKi9cbiAgYWRkQ29sdW1uKGNvbHVtbkluZm86IFBibENvbHVtblNpemVJbmZvKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbHMuaGFzKGNvbHVtbkluZm8pKSB7XG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gY29sdW1uSW5mbztcbiAgICAgIGxldCBtaW5XaWR0aCA9IGNvbHVtbi5taW5XaWR0aCB8fCAwO1xuICAgICAgaWYgKGNvbHVtbi5pc0ZpeGVkV2lkdGgpIHtcbiAgICAgICAgbWluV2lkdGggPSBNYXRoLm1heChjb2x1bW4ucGFyc2VkV2lkdGgudmFsdWUsIG1pbldpZHRoKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vbkNvbnRlbnQgPSB0aGlzLnN0cmF0ZWd5LmNlbGwoY29sdW1uSW5mbyk7XG4gICAgICBjb25zdCB3aWR0aCA9IG1pbldpZHRoICsgbm9uQ29udGVudDtcbiAgICAgIHRoaXMuY29scy5zZXQoY29sdW1uSW5mbywgd2lkdGgpO1xuICAgICAgdGhpcy5fbWluaW11bVJvd1dpZHRoICs9IHdpZHRoO1xuXG4gICAgICBpZiAoY29sdW1uLm1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IGFjdHVhbFdpZHRoID0gY29sdW1uSW5mby53aWR0aCAtIG5vbkNvbnRlbnQ7XG4gICAgICAgIGlmIChjb2x1bW4uY2hlY2tNYXhXaWR0aExvY2soYWN0dWFsV2lkdGgpKSB7XG4gICAgICAgICAgdGhpcy5tYXhXaWR0aExvY2tDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gZWFjaCBvZiB0aGUgY29sdW1ucyB0aHJvdWdoIGBhZGRDb2x1bW5gIGFuZCByZXR1cm5zIHRoZSBzdW0gb2YgdGhlIHdpZHRoIGFsbCBjb2x1bW5zIHVzaW5nXG4gICAqIHRoZSBib3ggbW9kZWwgc3BhY2Ugc3RyYXRlZ3kuXG4gICAqXG4gICAqIFRoZSByZXN1bHQgcmVwcmVzZW50cyB0aGUgYWJzb2x1dGUgd2lkdGggdG8gYmUgdXNlZCBpbiBhIGBQYmxDb2x1bW5Hcm91cGAuXG4gICAqXG4gICAqID4gTm90ZSB0aGF0IHdoZW4gYSB0YWJsZSBoYXMgbXVsdGlwbGUgY29sdW1uLWdyb3VwIHJvd3MgZWFjaCBjb2x1bW4gaXMgdGhlIGNoaWxkIG9mIG11bHRpcGxlIGdyb3VwIGNvbHVtbiwgaGVuY2UgY2FsbGluZyBgYWRkQ29sdW1uYCB3aXRoIHRoZVxuICAgKiBzYW1lIGdyb3VwIG1vcmUgdGhlbiBvbmNlLiBIb3dldmVyLCBzaW5jZSBgYWRkQ29sdW1uKClgIGlnbm9yZXMgY29sdW1ucyBpdCBhbHJlYWR5IHByb2Nlc3NlZCBpdCBpcyBzYWZlLlxuICAgKi9cbiAgYWRkR3JvdXAoY29sdW1uSW5mb3M6IFBibENvbHVtblNpemVJbmZvW10pOiBudW1iZXIge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAoY29uc3QgYyBvZiBjb2x1bW5JbmZvcykge1xuICAgICAgdGhpcy5hZGRDb2x1bW4oYyk7XG4gICAgICBzdW0gKz0gYy53aWR0aDtcbiAgICB9XG4gICBzdW0gLT0gdGhpcy5zdHJhdGVneS5ncm91cChjb2x1bW5JbmZvcywgdGhpcy5kaXIpO1xuICAgcmV0dXJuIHN1bTtcbiAgfVxuXG59XG5cbi8qKlxuKiBSZXR1cm5zIGEgYnJlYWtvdXQgb2YgdGhlIHdpZHRoIG9mIHRoZSBjb2x1bW4sIGJyZWFraW5nIGl0IGludG8gdGhlIHdpZHRoIG9mIHRoZSBjb250ZW50IGFuZCB0aGUgcmVzdCBvZiB0aGUgd2lkdGhcbiovXG5leHBvcnQgZnVuY3Rpb24gd2lkdGhCcmVha291dChzdHJhdGVneTogQm94TW9kZWxTcGFjZVN0cmF0ZWd5LCBjb2x1bW5JbmZvOiBQYmxDb2x1bW5TaXplSW5mbyk6IHsgY29udGVudDogbnVtYmVyLCBub25Db250ZW50OiBudW1iZXIgfSB7XG4gY29uc3Qgbm9uQ29udGVudCA9IHN0cmF0ZWd5LmNlbGwoY29sdW1uSW5mbyk7XG4gcmV0dXJuIHtcbiAgIGNvbnRlbnQ6IGNvbHVtbkluZm8ud2lkdGggLSBub25Db250ZW50LFxuICAgbm9uQ29udGVudCxcbiB9O1xufVxuXG5leHBvcnQgY29uc3QgRFlOQU1JQ19QQURESU5HX0JPWF9NT0RFTF9TUEFDRV9TVFJBVEVHWTogQm94TW9kZWxTcGFjZVN0cmF0ZWd5ID0ge1xuICBjZWxsKGNvbDogUGJsQ29sdW1uU2l6ZUluZm8pOiBudW1iZXIge1xuICAgIGNvbnN0IHN0eWxlID0gY29sLnN0eWxlO1xuICAgIHJldHVybiBwYXJzZUludChzdHlsZS5wYWRkaW5nTGVmdCwgMTApICsgcGFyc2VJbnQoc3R5bGUucGFkZGluZ1JpZ2h0LCAxMClcbiAgfSxcbiAgZ3JvdXBDZWxsKGNvbDogUGJsQ29sdW1uU2l6ZUluZm8pOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9LFxuICBncm91cChjb2xzOiBQYmxDb2x1bW5TaXplSW5mb1tdLCBkaXI/OiBEaXJlY3Rpb24pOiBudW1iZXIge1xuICAgIGNvbnN0IGxlbiA9IGNvbHMubGVuZ3RoO1xuICAgIHJldHVybiBsZW4gPiAwID8gcGFyc2VJbnQoY29sc1swXS5zdHlsZVtkaXIgPT09ICdydGwnID8gJ3BhZGRpbmdSaWdodCcgOiAncGFkZGluZ0xlZnQnXSwgMTApICsgcGFyc2VJbnQoY29sc1tsZW4gLSAxXS5zdHlsZVtkaXIgPT09ICdydGwnID8gJ3BhZGRpbmdMZWZ0JyA6ICdwYWRkaW5nUmlnaHQnXSwgMTApIDogMDtcbiAgfVxufTtcbiJdfQ==