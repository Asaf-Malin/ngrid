import { parseStyleWidth, initDefinitions } from './utils';
const PBL_NGRID_META_COLUMN_MARK = Symbol('PblMetaColumn');
const CLONE_PROPERTIES = ['kind', 'rowIndex'];
export function isPblMetaColumn(def) {
    return def instanceof PblMetaColumn || (def && def[PBL_NGRID_META_COLUMN_MARK] === true);
}
export class PblMetaColumn {
    constructor(def) {
        /**
         * A place to store things...
         * This must be an object, values are shadow-copied so persist data between multiple plugins.
         */
        this.data = {};
        this.defaultWidth = '';
        this[PBL_NGRID_META_COLUMN_MARK] = true;
        initDefinitions(def, this);
        for (const prop of CLONE_PROPERTIES) {
            if (prop in def) {
                this[prop] = def[prop];
            }
        }
        if (!isPblMetaColumn(def)) {
            if (typeof def.type === 'string') {
                this.type = { name: def.type };
            }
        }
    }
    /**
     * The width in px or % in the following format: ##% or ##px
     * Examples: '50%', '50px'
     */
    get width() { return this._width; }
    set width(value) {
        if (value !== this._width) {
            this._parsedWidth = parseStyleWidth(this._width = value);
            // Error in dev, on prod just let it be unset
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._parsedWidth && value) {
                    throw new Error(`Invalid width "${value}" in column ${this.id}. Valid values are ##% or ##px (50% / 50px)`);
                }
            }
            const isFixedWidth = this._parsedWidth && this._parsedWidth.type === 'px';
            Object.defineProperty(this, 'isFixedWidth', { value: isFixedWidth, configurable: true });
        }
    }
    //#endregion PblMetaColumnDefinition
    get parsedWidth() { return this._parsedWidth; }
    /**
     * The column def for this column.
     */
    get columnDef() { return this._columnDef; }
    static extendProperty(name) {
        if (CLONE_PROPERTIES.indexOf(name) === -1) {
            CLONE_PROPERTIES.push(name);
        }
    }
    attach(columnDef) {
        this.detach();
        this._columnDef = columnDef;
        this.columnDef.updateWidth(this.width || this.defaultWidth, 'attach');
    }
    detach() {
        this._columnDef = undefined;
    }
    updateWidth(fallbackDefault) {
        this.defaultWidth = fallbackDefault || '';
        if (this.columnDef) {
            this.columnDef.updateWidth(this.width || fallbackDefault, 'update');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS1jb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9jb2x1bW4vbW9kZWwvbWV0YS1jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFM0QsTUFBTSwwQkFBMEIsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0QsTUFBTSxnQkFBZ0IsR0FBK0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFMUUsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFRO0lBQ3RDLE9BQU8sR0FBRyxZQUFZLGFBQWEsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsMEJBQTBCLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUMzRixDQUFDO0FBRUQsTUFBTSxPQUFPLGFBQWE7SUFzR3hCLFlBQVksR0FBNEI7UUE3Q3hDOzs7V0FHRztRQUNILFNBQUksR0FBUSxFQUFFLENBQUM7UUF1Q1AsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFHeEIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3hDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0IsS0FBSyxNQUFNLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtZQUNuQyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLElBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUM5QjtTQUNGO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QixJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBUyxDQUFDO2FBQ3ZDO1NBQ0Y7SUFDSCxDQUFDO0lBM0ZEOzs7T0FHRztJQUNILElBQUksS0FBSyxLQUFhLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDM0MsSUFBSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFFekQsNkNBQTZDO1lBQzdDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRTtnQkFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksS0FBSyxFQUFFO29CQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixLQUFLLGVBQWUsSUFBSSxDQUFDLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztpQkFDN0c7YUFDRjtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDMUY7SUFDSCxDQUFDO0lBK0JILG9DQUFvQztJQUVsQyxJQUFJLFdBQVcsS0FBc0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQWNoRzs7T0FFRztJQUNILElBQUksU0FBUyxLQUF1QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBd0I3RSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQXlCO1FBQzdDLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsU0FBMkM7UUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVELFdBQVcsQ0FBQyxlQUF1QjtRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLGVBQWUsSUFBSSxFQUFFLENBQUM7UUFDMUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3JFO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGVtcGxhdGVSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBibE1ldGFDb2x1bW5EZWZpbml0aW9uLCBQYmxDb2x1bW5UeXBlRGVmaW5pdGlvbiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5cbmltcG9ydCB7IFBibE5ncmlkQ29sdW1uRGVmIH0gZnJvbSAnLi4vZGlyZWN0aXZlcy9jb2x1bW4tZGVmJztcbmltcG9ydCB7IFBibE5ncmlkTWV0YUNlbGxDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC90eXBlcyc7XG5pbXBvcnQgeyBwYXJzZVN0eWxlV2lkdGgsIGluaXREZWZpbml0aW9ucyB9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBQQkxfTkdSSURfTUVUQV9DT0xVTU5fTUFSSyA9IFN5bWJvbCgnUGJsTWV0YUNvbHVtbicpO1xuY29uc3QgQ0xPTkVfUFJPUEVSVElFUzogQXJyYXk8a2V5b2YgUGJsTWV0YUNvbHVtbj4gPSBbJ2tpbmQnLCAncm93SW5kZXgnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGJsTWV0YUNvbHVtbihkZWY6IGFueSk6IGRlZiBpcyBQYmxNZXRhQ29sdW1uIHtcbiAgcmV0dXJuIGRlZiBpbnN0YW5jZW9mIFBibE1ldGFDb2x1bW4gfHwgKGRlZiAmJiBkZWZbUEJMX05HUklEX01FVEFfQ09MVU1OX01BUktdID09PSB0cnVlKTtcbn1cblxuZXhwb3J0IGNsYXNzIFBibE1ldGFDb2x1bW4gaW1wbGVtZW50cyBQYmxNZXRhQ29sdW1uRGVmaW5pdGlvbiB7XG4gIC8vI3JlZ2lvbiBQYmxDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRDb21wb25lbnRCYXNlQ29sdW1uRGVmaW5pdGlvblxuXG4gICAvKipcbiAgICogQSBVbmlxdWUgSUQgZm9yIHRoZSBjb2x1bW4uXG4gICAqIFRoZSBJRCBtdXN0IGJlIHVuaXF1ZSBhY3Jvc3MgYWxsIGNvbHVtbnMsIHJlZ2FyZGxlc3Mgb2YgdGhlIHR5cGUuXG4gICAqIENvbHVtbnMgd2l0aCBpZGVudGljYWwgSUQgd2lsbCBzaGFyZSByZXN1bHQgaW4gaWRlbnRpY2FsIHRlbXBsYXRlLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgaGF2aW5nIGEgaGVhZGVyIGNvbHVtbiBhbmQgYSBmb290ZXIgY29sdW1uIHdpdGggdGhlIHNhbWUgaWQgd2lsbCByZXN1bHQgaW4gdGhlIHNhbWUgY2VsbCBwcmVzZW50YXRpb24gZm9yIGJvdGguXG4gICAqL1xuICBpZDogc3RyaW5nO1xuXG4gIGxhYmVsPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiB0aGUgdmFsdWVzIGluIHRoaXMgY29sdW1uLlxuICAgKiBUaGlzIGlzIGFuIGFkZGl0aW9uYWwgbGV2ZWwgZm9yIG1hdGNoaW5nIGNvbHVtbnMgdG8gdGVtcGxhdGVzLCBncm91cGluZyB0ZW1wbGF0ZXMgZm9yIGEgdHlwZS5cbiAgICovXG4gIHR5cGU/OiBQYmxDb2x1bW5UeXBlRGVmaW5pdGlvbjtcblxuICAvKipcbiAgICogQ1NTIGNsYXNzIHRoYXQgZ2V0IGFwcGxpZWQgb24gdGhlIGhlYWRlciBhbmQgY2VsbC5cbiAgICogWW91IGNhbiBhcHBseSB1bmlxdWUgaGVhZGVyL2NlbGwgc3R5bGVzIHVzaW5nIHRoZSBlbGVtZW50IG5hbWUuXG4gICAqL1xuICBjc3M/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSB3aWR0aCBpbiBweCBvciAlIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OiAjIyUgb3IgIyNweFxuICAgKiBFeGFtcGxlczogJzUwJScsICc1MHB4J1xuICAgKi9cbiAgZ2V0IHdpZHRoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl93aWR0aDsgfVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZykge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fd2lkdGgpIHtcbiAgICAgIHRoaXMuX3BhcnNlZFdpZHRoID0gcGFyc2VTdHlsZVdpZHRoKHRoaXMuX3dpZHRoID0gdmFsdWUpO1xuXG4gICAgICAvLyBFcnJvciBpbiBkZXYsIG9uIHByb2QganVzdCBsZXQgaXQgYmUgdW5zZXRcbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wYXJzZWRXaWR0aCAmJiB2YWx1ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB3aWR0aCBcIiR7dmFsdWV9XCIgaW4gY29sdW1uICR7dGhpcy5pZH0uIFZhbGlkIHZhbHVlcyBhcmUgIyMlIG9yICMjcHggKDUwJSAvIDUwcHgpYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNGaXhlZFdpZHRoID0gdGhpcy5fcGFyc2VkV2lkdGggJiYgdGhpcy5fcGFyc2VkV2lkdGgudHlwZSA9PT0gJ3B4JztcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNGaXhlZFdpZHRoJywgeyB2YWx1ZTogaXNGaXhlZFdpZHRoLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIG1pbmltdW0gd2lkdGggaW4gcGl4ZWxzXG4gICAqIFRoaXMgaXMgYW4gYWJzb2x1dGUgdmFsdWUsIHRodXMgYSBudW1iZXIuXG4gICAqL1xuICBtaW5XaWR0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoaXMgbWF4aW11bSB3aWR0aCBpbiBwaXhlbHNcbiAgICogVGhpcyBpcyBhbiBhYnNvbHV0ZSB2YWx1ZSwgdGh1cyBhIG51bWJlci5cbiAgICovXG4gIG1heFdpZHRoPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBIHBsYWNlIHRvIHN0b3JlIHRoaW5ncy4uLlxuICAgKiBUaGlzIG11c3QgYmUgYW4gb2JqZWN0LCB2YWx1ZXMgYXJlIHNoYWRvdy1jb3BpZWQgc28gcGVyc2lzdCBkYXRhIGJldHdlZW4gbXVsdGlwbGUgcGx1Z2lucy5cbiAgICovXG4gIGRhdGE6IGFueSA9IHt9O1xuICAvLyNlbmRyZWdpb24gUGJsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0Q29tcG9uZW50QmFzZUNvbHVtbkRlZmluaXRpb25cblxuICAvLyNyZWdpb24gUGJsTWV0YUNvbHVtbkRlZmluaXRpb25cblxuICBraW5kOiAnaGVhZGVyJyB8ICdmb290ZXInO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5kZXggKHplcm8gYmFzZWQpIG9mIHRoZSBoZWFkZXIgcm93IHRoaXMgY29sdW1uIGlzIGF0dGFjaGVkIHRvLCB1c2VkIGZvciBtdWx0aS1oZWFkZXIgc2V0dXAuXG4gICAqIFdoZW4gbm90IHNldCAodW5kZWZpbmVkKSB0aGUgaW5kZXggaXMgY29uc2lkZXJlZCB0aGUgTEFTVCBpbmRleC5cbiAgICpcbiAgICogSWYgeW91IHdhbnQgdG8gc2V0dXAgYSBtdWx0aSBoZWFkZXIgZ3JpZCB3aXRoIDIgaGVhZGVyIHJvd3MsIHNldCB0aGlzIHRvIDAgZm9yIHRoZSBmaXJzdCBoZWFkZXIgcm93IGFuZCBmb3IgdGhlIDJuZCBoZWFkZXJcbiAgICogcm93IGRvIG5vdCBzZXQgYSByb3dJbmRleC5cbiAgICovXG4gIHJvd0luZGV4OiBudW1iZXI7XG4vLyNlbmRyZWdpb24gUGJsTWV0YUNvbHVtbkRlZmluaXRpb25cblxuICBnZXQgcGFyc2VkV2lkdGgoKTogeyB2YWx1ZTogbnVtYmVyOyB0eXBlOiAncHgnIHwgJyUnIH0gfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fcGFyc2VkV2lkdGg7IH1cblxuICAvKipcbiAgICogVXNlZCBieSBwYmwtbmdyaWQgdG8gYXBwbHkgYSBjdXN0b20gaGVhZGVyL2Zvb3RlciBjZWxsIHRlbXBsYXRlLCBvciB0aGUgZGVmYXVsdCB3aGVuIG5vdCBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFBibE5ncmlkTWV0YUNlbGxDb250ZXh0PGFueT4+O1xuXG4gIC8qKlxuICAgKiBXaGVuIHRydWUgaW5kaWNhdGVzIHRoYXQgdGhlIHdpZHRoIGlzIHNldCB3aXRoIHR5cGUgcGl4ZWxzLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHJlYWRvbmx5IGlzRml4ZWRXaWR0aD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRoZSBjb2x1bW4gZGVmIGZvciB0aGlzIGNvbHVtbi5cbiAgICovXG4gIGdldCBjb2x1bW5EZWYoKTogUGJsTmdyaWRDb2x1bW5EZWY8UGJsTWV0YUNvbHVtbj4geyByZXR1cm4gdGhpcy5fY29sdW1uRGVmOyB9XG5cbiAgcHJpdmF0ZSBfd2lkdGg/OiBzdHJpbmc7XG4gIHByaXZhdGUgX3BhcnNlZFdpZHRoOiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZVN0eWxlV2lkdGg+O1xuICBwcml2YXRlIF9jb2x1bW5EZWY6IFBibE5ncmlkQ29sdW1uRGVmPFBibE1ldGFDb2x1bW4+O1xuICBwcml2YXRlIGRlZmF1bHRXaWR0aCA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKGRlZjogUGJsTWV0YUNvbHVtbkRlZmluaXRpb24pIHtcbiAgICB0aGlzW1BCTF9OR1JJRF9NRVRBX0NPTFVNTl9NQVJLXSA9IHRydWU7XG4gICAgaW5pdERlZmluaXRpb25zKGRlZiwgdGhpcyk7XG5cbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgQ0xPTkVfUFJPUEVSVElFUykge1xuICAgICAgaWYgKHByb3AgaW4gZGVmKSB7XG4gICAgICAgIHRoaXNbcHJvcCBhcyBhbnldID0gZGVmW3Byb3BdXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc1BibE1ldGFDb2x1bW4oZGVmKSkge1xuICAgICAgaWYgKHR5cGVvZiBkZWYudHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy50eXBlID0geyBuYW1lOiBkZWYudHlwZSB9IGFzIGFueTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZXh0ZW5kUHJvcGVydHkobmFtZToga2V5b2YgUGJsTWV0YUNvbHVtbik6IHZvaWQge1xuICAgIGlmIChDTE9ORV9QUk9QRVJUSUVTLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICBDTE9ORV9QUk9QRVJUSUVTLnB1c2gobmFtZSk7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoKGNvbHVtbkRlZjogUGJsTmdyaWRDb2x1bW5EZWY8UGJsTWV0YUNvbHVtbj4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMuX2NvbHVtbkRlZiA9IGNvbHVtbkRlZjtcbiAgICB0aGlzLmNvbHVtbkRlZi51cGRhdGVXaWR0aCh0aGlzLndpZHRoIHx8IHRoaXMuZGVmYXVsdFdpZHRoLCAnYXR0YWNoJyk7XG4gIH1cblxuICBkZXRhY2goKTogdm9pZCB7XG4gICAgdGhpcy5fY29sdW1uRGVmID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdXBkYXRlV2lkdGgoZmFsbGJhY2tEZWZhdWx0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmRlZmF1bHRXaWR0aCA9IGZhbGxiYWNrRGVmYXVsdCB8fCAnJztcbiAgICBpZiAodGhpcy5jb2x1bW5EZWYpIHtcbiAgICAgIHRoaXMuY29sdW1uRGVmLnVwZGF0ZVdpZHRoKHRoaXMud2lkdGggfHwgZmFsbGJhY2tEZWZhdWx0LCAndXBkYXRlJyk7XG4gICAgfVxuICB9XG59XG4iXX0=