/**
 * Return's the `User Preferences` preset which focuses on saving and restoring state that the user
 * can define and would want to restore between sessions.
 *
 * For example, saving column width's which the user might have changed using the mouse or any other custom way provided to him (through API).
 * Saving the column order, so if the user re-ordered the table the order can be loaded back again...
 */
export function userSessionPref(...basedOn) {
    const resultFilter = {
        grid: [
            'showFooter',
            'showHeader',
        ],
        columnVisibility: true,
        columnOrder: true,
        columns: ['table'],
        dataColumn: [
            'width',
        ]
    };
    if (basedOn.length > 0) {
        for (const b of basedOn)
            mergeStateChunkKeyFilter(resultFilter, b);
    }
    return resultFilter;
}
/**
 * Merge a head and tail chunk filters so keys from tail will be merged into head if:
 *
 * - The key does not exist in head
 * - The key exist in head but the value of it is an Array and the value of tail is an Array as well.
 *   In such case, both array's are merged into a single unique array.
 */
function mergeStateChunkKeyFilter(mergeHead, mergeTail) {
    for (const k of Object.keys(mergeTail)) {
        const tailValue = mergeTail[k];
        if (k in mergeHead) {
            const tailHead = mergeHead[k];
            if (Array.isArray(tailHead) && Array.isArray(tailValue)) {
                const s = new Set([...tailHead, ...tailValue]);
                mergeHead[k] = Array.from(s.values());
            }
        }
        else {
            mergeHead[k] = mergeTail[k];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3RhdGUvc3JjL2xpYi9wcmVzZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsR0FBRyxPQUE4QjtJQUMvRCxNQUFNLFlBQVksR0FBd0I7UUFDeEMsSUFBSSxFQUFFO1lBQ0osWUFBWTtZQUNaLFlBQVk7U0FDYjtRQUNELGdCQUFnQixFQUFFLElBQUk7UUFDdEIsV0FBVyxFQUFFLElBQUk7UUFDakIsT0FBTyxFQUFFLENBQUUsT0FBTyxDQUFFO1FBQ3BCLFVBQVUsRUFBRTtZQUNWLE9BQU87U0FDUjtLQUNGLENBQUE7SUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3RCLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTztZQUN2Qix3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFFRCxPQUFPLFlBQVksQ0FBQztBQUN0QixDQUFDO0FBR0Q7Ozs7OztHQU1HO0FBQ0gsU0FBUyx3QkFBd0IsQ0FBQyxTQUE4QixFQUFFLFNBQThCO0lBQzlGLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN0QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFO1lBQ2xCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdkQsTUFBTSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQVMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0Y7YUFBTTtZQUNMLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdGF0ZUNodW5rS2V5RmlsdGVyIH0gZnJvbSAnLi9jb3JlL21vZGVscy9pbmRleCc7XG5cbi8qKlxuICogUmV0dXJuJ3MgdGhlIGBVc2VyIFByZWZlcmVuY2VzYCBwcmVzZXQgd2hpY2ggZm9jdXNlcyBvbiBzYXZpbmcgYW5kIHJlc3RvcmluZyBzdGF0ZSB0aGF0IHRoZSB1c2VyXG4gKiBjYW4gZGVmaW5lIGFuZCB3b3VsZCB3YW50IHRvIHJlc3RvcmUgYmV0d2VlbiBzZXNzaW9ucy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgc2F2aW5nIGNvbHVtbiB3aWR0aCdzIHdoaWNoIHRoZSB1c2VyIG1pZ2h0IGhhdmUgY2hhbmdlZCB1c2luZyB0aGUgbW91c2Ugb3IgYW55IG90aGVyIGN1c3RvbSB3YXkgcHJvdmlkZWQgdG8gaGltICh0aHJvdWdoIEFQSSkuXG4gKiBTYXZpbmcgdGhlIGNvbHVtbiBvcmRlciwgc28gaWYgdGhlIHVzZXIgcmUtb3JkZXJlZCB0aGUgdGFibGUgdGhlIG9yZGVyIGNhbiBiZSBsb2FkZWQgYmFjayBhZ2Fpbi4uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlclNlc3Npb25QcmVmKC4uLmJhc2VkT246IFN0YXRlQ2h1bmtLZXlGaWx0ZXJbXSk6IFN0YXRlQ2h1bmtLZXlGaWx0ZXIge1xuICBjb25zdCByZXN1bHRGaWx0ZXI6IFN0YXRlQ2h1bmtLZXlGaWx0ZXIgPSB7XG4gICAgZ3JpZDogW1xuICAgICAgJ3Nob3dGb290ZXInLFxuICAgICAgJ3Nob3dIZWFkZXInLFxuICAgIF0sXG4gICAgY29sdW1uVmlzaWJpbGl0eTogdHJ1ZSxcbiAgICBjb2x1bW5PcmRlcjogdHJ1ZSxcbiAgICBjb2x1bW5zOiBbICd0YWJsZScgXSxcbiAgICBkYXRhQ29sdW1uOiBbXG4gICAgICAnd2lkdGgnLFxuICAgIF1cbiAgfVxuXG4gIGlmIChiYXNlZE9uLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGNvbnN0IGIgb2YgYmFzZWRPbilcbiAgICBtZXJnZVN0YXRlQ2h1bmtLZXlGaWx0ZXIocmVzdWx0RmlsdGVyLCBiKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRGaWx0ZXI7XG59XG5cblxuLyoqXG4gKiBNZXJnZSBhIGhlYWQgYW5kIHRhaWwgY2h1bmsgZmlsdGVycyBzbyBrZXlzIGZyb20gdGFpbCB3aWxsIGJlIG1lcmdlZCBpbnRvIGhlYWQgaWY6XG4gKlxuICogLSBUaGUga2V5IGRvZXMgbm90IGV4aXN0IGluIGhlYWRcbiAqIC0gVGhlIGtleSBleGlzdCBpbiBoZWFkIGJ1dCB0aGUgdmFsdWUgb2YgaXQgaXMgYW4gQXJyYXkgYW5kIHRoZSB2YWx1ZSBvZiB0YWlsIGlzIGFuIEFycmF5IGFzIHdlbGwuXG4gKiAgIEluIHN1Y2ggY2FzZSwgYm90aCBhcnJheSdzIGFyZSBtZXJnZWQgaW50byBhIHNpbmdsZSB1bmlxdWUgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlU3RhdGVDaHVua0tleUZpbHRlcihtZXJnZUhlYWQ6IFN0YXRlQ2h1bmtLZXlGaWx0ZXIsIG1lcmdlVGFpbDogU3RhdGVDaHVua0tleUZpbHRlcikge1xuICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMobWVyZ2VUYWlsKSkge1xuICAgIGNvbnN0IHRhaWxWYWx1ZSA9IG1lcmdlVGFpbFtrXTtcbiAgICBpZiAoayBpbiBtZXJnZUhlYWQpIHtcbiAgICAgIGNvbnN0IHRhaWxIZWFkID0gbWVyZ2VIZWFkW2tdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFpbEhlYWQpICYmIEFycmF5LmlzQXJyYXkodGFpbFZhbHVlKSkge1xuICAgICAgICBjb25zdCBzID0gbmV3IFNldDxzdHJpbmc+KFsuLi50YWlsSGVhZCwgLi4udGFpbFZhbHVlXSk7XG4gICAgICAgIG1lcmdlSGVhZFtrXSA9IEFycmF5LmZyb20ocy52YWx1ZXMoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lcmdlSGVhZFtrXSA9IG1lcmdlVGFpbFtrXTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==