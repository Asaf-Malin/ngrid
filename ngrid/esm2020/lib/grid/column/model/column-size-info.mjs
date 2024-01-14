/**
 * A class that represents the dimensions and style of a column cell.
 * The class is bound to an element and a column.
 *
 * Calling `updateSize()` will sync the layout from the DOM element to the class properties
 * and trigger a resize event on the column's column definition object.
 *
 * > Note that `updateSize()` only works when a column is attached
 *
 * This class shouldn't be used directly. In NGrid, it is wrapped by `PblColumnSizeObserver` which automatically triggers
 * update size events using the `ResizeObserver` API.
 */
export class ColumnSizeInfo {
    constructor(target) {
        this.target = target;
    }
    get column() { return this._column; }
    set column(value) { this.attachColumn(value); }
    attachColumn(column) {
        this.detachColumn();
        if (column) {
            column.sizeInfo = this;
        }
        this._column = column;
    }
    detachColumn() {
        if (this._column) {
            this._column.sizeInfo = undefined;
            this._column = undefined;
        }
    }
    updateSize() {
        if (this.column && !this.column.columnDef.isDragging) {
            const el = this.target;
            const rect = el.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.style = getComputedStyle(el);
            this.column.columnDef.onResize();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXNpemUtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NvbHVtbi9tb2RlbC9jb2x1bW4tc2l6ZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFxQnpCLFlBQTRCLE1BQW1CO1FBQW5CLFdBQU0sR0FBTixNQUFNLENBQWE7SUFBSSxDQUFDO0lBcEJwRCxJQUFJLE1BQU0sS0FBZ0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNoRCxJQUFJLE1BQU0sQ0FBQyxLQUFnQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBcUJoRCxZQUFZLENBQUMsTUFBaUI7UUFDdEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksTUFBTSxFQUFFO1lBQ1YsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDeEI7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBRVMsWUFBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDcEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDbEM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYmxDb2x1bW5TaXplSW5mbyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgUGJsQ29sdW1uIH0gZnJvbSAnLi9jb2x1bW4nO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBkaW1lbnNpb25zIGFuZCBzdHlsZSBvZiBhIGNvbHVtbiBjZWxsLlxuICogVGhlIGNsYXNzIGlzIGJvdW5kIHRvIGFuIGVsZW1lbnQgYW5kIGEgY29sdW1uLlxuICpcbiAqIENhbGxpbmcgYHVwZGF0ZVNpemUoKWAgd2lsbCBzeW5jIHRoZSBsYXlvdXQgZnJvbSB0aGUgRE9NIGVsZW1lbnQgdG8gdGhlIGNsYXNzIHByb3BlcnRpZXNcbiAqIGFuZCB0cmlnZ2VyIGEgcmVzaXplIGV2ZW50IG9uIHRoZSBjb2x1bW4ncyBjb2x1bW4gZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogPiBOb3RlIHRoYXQgYHVwZGF0ZVNpemUoKWAgb25seSB3b3JrcyB3aGVuIGEgY29sdW1uIGlzIGF0dGFjaGVkXG4gKlxuICogVGhpcyBjbGFzcyBzaG91bGRuJ3QgYmUgdXNlZCBkaXJlY3RseS4gSW4gTkdyaWQsIGl0IGlzIHdyYXBwZWQgYnkgYFBibENvbHVtblNpemVPYnNlcnZlcmAgd2hpY2ggYXV0b21hdGljYWxseSB0cmlnZ2Vyc1xuICogdXBkYXRlIHNpemUgZXZlbnRzIHVzaW5nIHRoZSBgUmVzaXplT2JzZXJ2ZXJgIEFQSS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbHVtblNpemVJbmZvIGltcGxlbWVudHMgUGJsQ29sdW1uU2l6ZUluZm8ge1xuICBnZXQgY29sdW1uKCk6IFBibENvbHVtbiB7IHJldHVybiB0aGlzLl9jb2x1bW47IH1cbiAgc2V0IGNvbHVtbih2YWx1ZTogUGJsQ29sdW1uKSB7IHRoaXMuYXR0YWNoQ29sdW1uKHZhbHVlKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBjb2x1bW4gKHN1YnBpeGVsIHJlc29sdXRpb24pXG4gICAqL1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSB3aWR0aCBvZiB0aGUgY29sdW1uIChzdWJwaXhlbCByZXNvbHV0aW9uKVxuICAgKiBOb3RlIHRoYXQgdGhpcyBpcyB0aGUgbm90IHRoZSBjb250ZW50IHdpZHRoLlxuICAgKi9cbiAgd2lkdGg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGNvbXB1dGVkIHN0eWxlIGZvciB0aGlzIGNlbGwuXG4gICAqL1xuICBzdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbjtcblxuICBwcm90ZWN0ZWQgX2NvbHVtbjogUGJsQ29sdW1uO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSB0YXJnZXQ6IEhUTUxFbGVtZW50KSB7IH1cblxuICBwcm90ZWN0ZWQgYXR0YWNoQ29sdW1uKGNvbHVtbjogUGJsQ29sdW1uKTogdm9pZCB7XG4gICAgdGhpcy5kZXRhY2hDb2x1bW4oKTtcblxuICAgIGlmIChjb2x1bW4pIHtcbiAgICAgIGNvbHVtbi5zaXplSW5mbyA9IHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fY29sdW1uID0gY29sdW1uO1xuICB9XG5cbiAgcHJvdGVjdGVkIGRldGFjaENvbHVtbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29sdW1uKSB7XG4gICAgICB0aGlzLl9jb2x1bW4uc2l6ZUluZm8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9jb2x1bW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU2l6ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jb2x1bW4gJiYgIXRoaXMuY29sdW1uLmNvbHVtbkRlZi5pc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBlbCA9IHRoaXMudGFyZ2V0O1xuICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdGhpcy53aWR0aCA9IHJlY3Qud2lkdGg7XG4gICAgICB0aGlzLmhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuICAgICAgdGhpcy5zdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgICAgdGhpcy5jb2x1bW4uY29sdW1uRGVmLm9uUmVzaXplKCk7XG4gICAgfVxuICB9XG59XG4iXX0=