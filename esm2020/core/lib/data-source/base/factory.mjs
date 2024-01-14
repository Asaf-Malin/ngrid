export class PblDataSourceBaseFactory {
    constructor() {
        this._adapter = {};
        this._dsOptions = {};
    }
    /**
     * Set the main trigger handler.
     * The trigger handler is the core of the datasource, responsible for returning the data collection.
     *
     * By default the handler is triggered only when the datasource is required.
     * This can happened when:
     *   - The table connected to the datasource.
     *   - A manual call to `PblDataSource.refresh()` was invoked.
     *
     * There are additional triggers (filter/sort/pagination) which occur when their values change, e.g. when
     * a filter has change or when a page in the paginator was changed.
     *
     * By default, these triggers are handled automatically, resulting in a client-side behavior for each of them.
     * For example, a client side paginator will move to the next page based on an already existing data collection (no need to fetch from the server).
     *
     * To handle additional trigger you need to explicitly set them using `setCustomTriggers`.
     */
    onTrigger(handler) {
        this._adapter.onTrigger = handler;
        return this;
    }
    /**
     * A list of triggers that will be handled by the trigger handler.
     * By default all triggers are handled by the adapter, resulting in a client-side filter/sort/pagination that works out of the box.
     * To implement server side filtering, sorting and/or pagination specify which should be handled by the on trigger handler.
     *
     * You can mix and match, e.g. support only paging from the server, or only paging and sorting, and leave filtering for the client side.
     */
    setCustomTriggers(...triggers) {
        if (triggers.length === 0) {
            this._adapter.customTriggers = false;
        }
        else {
            const customTriggers = this._adapter.customTriggers = {};
            for (const t of triggers) {
                customTriggers[t] = true;
            }
        }
        return this;
    }
    /**
     * Skip the first trigger emission.
     * Use this for late binding, usually with a call to refresh() on the data source.
     *
     * Note that only the internal trigger call is skipped, a custom calls to refresh will go through
     */
    skipInitialTrigger() {
        this._dsOptions.skipInitial = true;
        return this;
    }
    keepAlive() {
        this._dsOptions.keepAlive = true;
        return this;
    }
    onCreated(handler) {
        this._onCreated = handler;
        return this;
    }
    create() {
        const ds = this.createDataSource(this.createAdapter());
        if (this._onCreated) {
            this._onCreated(ds);
        }
        return ds;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvY29yZS9zcmMvbGliL2RhdGEtc291cmNlL2Jhc2UvZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxNQUFNLE9BQWdCLHdCQUF3QjtJQUE5QztRQU1ZLGFBQVEsR0FBNkIsRUFBRyxDQUFDO1FBQ3pDLGVBQVUsR0FBeUIsRUFBRyxDQUFDO0lBMkVuRCxDQUFDO0lBeEVDOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBQ0gsU0FBUyxDQUFDLE9BQXFEO1FBQzdELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxpQkFBaUIsQ0FBQyxHQUFHLFFBQXdEO1FBQzNFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1NBQ3RDO2FBQU07WUFDTCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDekQsS0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ3hCLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDMUI7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUNuQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxTQUFTO1FBQ1AsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsQ0FBQyxPQUEwQztRQUNsRCxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JCO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBSUYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYmxEYXRhU291cmNlLCBQYmxEYXRhU291cmNlT3B0aW9ucyB9IGZyb20gJy4uL2RhdGEtc291cmNlJztcbmltcG9ydCB7IFBibERhdGFTb3VyY2VBZGFwdGVyIH0gZnJvbSAnLi4vYWRhcHRlci9hZGFwdGVyJztcbmltcG9ydCB7IFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycywgUGJsRGF0YVNvdXJjZVRyaWdnZXJDaGFuZ2VkRXZlbnQsIFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlSGFuZGxlciB9IGZyb20gJy4uL2FkYXB0ZXIvdHlwZXMnO1xuXG5pbnRlcmZhY2UgQWRhcHRlclBhcmFtczxULCBURXZlbnQgZXh0ZW5kcyBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxhbnk+ID0gUGJsRGF0YVNvdXJjZVRyaWdnZXJDaGFuZ2VkRXZlbnQ8YW55Pj4ge1xuICBvblRyaWdnZXI/OiBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZUhhbmRsZXI8VCwgVEV2ZW50PjtcbiAgY3VzdG9tVHJpZ2dlcnM/OiBmYWxzZSB8IFBhcnRpYWw8UmVjb3JkPGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2VycywgYm9vbGVhbj4+O1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGJsRGF0YVNvdXJjZUJhc2VGYWN0b3J5PFQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFREYXRhID0gYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBURXZlbnQgZXh0ZW5kcyBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4gPSBQYmxEYXRhU291cmNlVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFREYXRhU291cmNlQWRhcHRlciBleHRlbmRzIFBibERhdGFTb3VyY2VBZGFwdGVyPFQsIFREYXRhLCBURXZlbnQ+ID0gUGJsRGF0YVNvdXJjZUFkYXB0ZXI8VCwgVERhdGEsIFRFdmVudD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFREYXRhU291cmNlIGV4dGVuZHMgUGJsRGF0YVNvdXJjZTxULCBURGF0YSwgVEV2ZW50PiA9IFBibERhdGFTb3VyY2U8VCwgVERhdGEsIFRFdmVudD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPiB7XG4gIHByb3RlY3RlZCBfYWRhcHRlcjogQWRhcHRlclBhcmFtczxULCBURXZlbnQ+ID0geyB9O1xuICBwcm90ZWN0ZWQgX2RzT3B0aW9uczogUGJsRGF0YVNvdXJjZU9wdGlvbnMgPSB7IH07XG4gIHByb3RlY3RlZCBfb25DcmVhdGVkOiAoZGF0YVNvdXJjZTogVERhdGFTb3VyY2UpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbWFpbiB0cmlnZ2VyIGhhbmRsZXIuXG4gICAqIFRoZSB0cmlnZ2VyIGhhbmRsZXIgaXMgdGhlIGNvcmUgb2YgdGhlIGRhdGFzb3VyY2UsIHJlc3BvbnNpYmxlIGZvciByZXR1cm5pbmcgdGhlIGRhdGEgY29sbGVjdGlvbi5cbiAgICpcbiAgICogQnkgZGVmYXVsdCB0aGUgaGFuZGxlciBpcyB0cmlnZ2VyZWQgb25seSB3aGVuIHRoZSBkYXRhc291cmNlIGlzIHJlcXVpcmVkLlxuICAgKiBUaGlzIGNhbiBoYXBwZW5lZCB3aGVuOlxuICAgKiAgIC0gVGhlIHRhYmxlIGNvbm5lY3RlZCB0byB0aGUgZGF0YXNvdXJjZS5cbiAgICogICAtIEEgbWFudWFsIGNhbGwgdG8gYFBibERhdGFTb3VyY2UucmVmcmVzaCgpYCB3YXMgaW52b2tlZC5cbiAgICpcbiAgICogVGhlcmUgYXJlIGFkZGl0aW9uYWwgdHJpZ2dlcnMgKGZpbHRlci9zb3J0L3BhZ2luYXRpb24pIHdoaWNoIG9jY3VyIHdoZW4gdGhlaXIgdmFsdWVzIGNoYW5nZSwgZS5nLiB3aGVuXG4gICAqIGEgZmlsdGVyIGhhcyBjaGFuZ2Ugb3Igd2hlbiBhIHBhZ2UgaW4gdGhlIHBhZ2luYXRvciB3YXMgY2hhbmdlZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgdGhlc2UgdHJpZ2dlcnMgYXJlIGhhbmRsZWQgYXV0b21hdGljYWxseSwgcmVzdWx0aW5nIGluIGEgY2xpZW50LXNpZGUgYmVoYXZpb3IgZm9yIGVhY2ggb2YgdGhlbS5cbiAgICogRm9yIGV4YW1wbGUsIGEgY2xpZW50IHNpZGUgcGFnaW5hdG9yIHdpbGwgbW92ZSB0byB0aGUgbmV4dCBwYWdlIGJhc2VkIG9uIGFuIGFscmVhZHkgZXhpc3RpbmcgZGF0YSBjb2xsZWN0aW9uIChubyBuZWVkIHRvIGZldGNoIGZyb20gdGhlIHNlcnZlcikuXG4gICAqXG4gICAqIFRvIGhhbmRsZSBhZGRpdGlvbmFsIHRyaWdnZXIgeW91IG5lZWQgdG8gZXhwbGljaXRseSBzZXQgdGhlbSB1c2luZyBgc2V0Q3VzdG9tVHJpZ2dlcnNgLlxuICAgKi9cbiAgb25UcmlnZ2VyKGhhbmRsZXI6IFBibERhdGFTb3VyY2VUcmlnZ2VyQ2hhbmdlSGFuZGxlcjxULCBURXZlbnQ+KTogdGhpcyB7XG4gICAgdGhpcy5fYWRhcHRlci5vblRyaWdnZXIgPSBoYW5kbGVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiB0cmlnZ2VycyB0aGF0IHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgdHJpZ2dlciBoYW5kbGVyLlxuICAgKiBCeSBkZWZhdWx0IGFsbCB0cmlnZ2VycyBhcmUgaGFuZGxlZCBieSB0aGUgYWRhcHRlciwgcmVzdWx0aW5nIGluIGEgY2xpZW50LXNpZGUgZmlsdGVyL3NvcnQvcGFnaW5hdGlvbiB0aGF0IHdvcmtzIG91dCBvZiB0aGUgYm94LlxuICAgKiBUbyBpbXBsZW1lbnQgc2VydmVyIHNpZGUgZmlsdGVyaW5nLCBzb3J0aW5nIGFuZC9vciBwYWdpbmF0aW9uIHNwZWNpZnkgd2hpY2ggc2hvdWxkIGJlIGhhbmRsZWQgYnkgdGhlIG9uIHRyaWdnZXIgaGFuZGxlci5cbiAgICpcbiAgICogWW91IGNhbiBtaXggYW5kIG1hdGNoLCBlLmcuIHN1cHBvcnQgb25seSBwYWdpbmcgZnJvbSB0aGUgc2VydmVyLCBvciBvbmx5IHBhZ2luZyBhbmQgc29ydGluZywgYW5kIGxlYXZlIGZpbHRlcmluZyBmb3IgdGhlIGNsaWVudCBzaWRlLlxuICAgKi9cbiAgc2V0Q3VzdG9tVHJpZ2dlcnMoLi4udHJpZ2dlcnM6IEFycmF5PGtleW9mIFBibERhdGFTb3VyY2VDb25maWd1cmFibGVUcmlnZ2Vycz4pOiB0aGlzIHtcbiAgICBpZiAodHJpZ2dlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9hZGFwdGVyLmN1c3RvbVRyaWdnZXJzID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGN1c3RvbVRyaWdnZXJzID0gdGhpcy5fYWRhcHRlci5jdXN0b21UcmlnZ2VycyA9IHt9O1xuICAgICAgZm9yIChjb25zdCB0IG9mIHRyaWdnZXJzKSB7XG4gICAgICAgIGN1c3RvbVRyaWdnZXJzW3RdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2tpcCB0aGUgZmlyc3QgdHJpZ2dlciBlbWlzc2lvbi5cbiAgICogVXNlIHRoaXMgZm9yIGxhdGUgYmluZGluZywgdXN1YWxseSB3aXRoIGEgY2FsbCB0byByZWZyZXNoKCkgb24gdGhlIGRhdGEgc291cmNlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgb25seSB0aGUgaW50ZXJuYWwgdHJpZ2dlciBjYWxsIGlzIHNraXBwZWQsIGEgY3VzdG9tIGNhbGxzIHRvIHJlZnJlc2ggd2lsbCBnbyB0aHJvdWdoXG4gICAqL1xuICBza2lwSW5pdGlhbFRyaWdnZXIoKTogdGhpcyB7XG4gICAgdGhpcy5fZHNPcHRpb25zLnNraXBJbml0aWFsID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGtlZXBBbGl2ZSgpOiB0aGlzIHtcbiAgICB0aGlzLl9kc09wdGlvbnMua2VlcEFsaXZlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG9uQ3JlYXRlZChoYW5kbGVyOiAoZGF0YVNvdXJjZTogVERhdGFTb3VyY2UpID0+IHZvaWQgKTogdGhpcyB7XG4gICAgdGhpcy5fb25DcmVhdGVkID0gaGFuZGxlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNyZWF0ZSgpOiBURGF0YVNvdXJjZSB7XG4gICAgY29uc3QgZHMgPSB0aGlzLmNyZWF0ZURhdGFTb3VyY2UodGhpcy5jcmVhdGVBZGFwdGVyKCkpO1xuICAgIGlmICh0aGlzLl9vbkNyZWF0ZWQpIHtcbiAgICAgIHRoaXMuX29uQ3JlYXRlZChkcyk7XG4gICAgfVxuICAgIHJldHVybiBkcztcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVBZGFwdGVyKCk6IFREYXRhU291cmNlQWRhcHRlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZURhdGFTb3VyY2UoYWRhcHRlcjogVERhdGFTb3VyY2VBZGFwdGVyKTogVERhdGFTb3VyY2U7XG59XG5cbiJdfQ==