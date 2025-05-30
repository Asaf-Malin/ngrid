/**
 * Code from angular/material2 repository
 * File: https://github.com/angular/material2/blob/master/src/cdk/drag-drop/drag-styling.ts
 * Commit: https://github.com/angular/material2/blob/9cd3132607b4d5ae242291df41fb02dc7a453da8/src/cdk/drag-drop/drag-styling.ts
 *
 * This code is not public but required for the drag so duplicated here.
 **/
/**
 * Shallow-extends a stylesheet object with another stylesheet object.
 * @docs-private
 */
export function extendStyles(dest, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    }
    return dest;
}
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * @param element Element on which to toggle the drag interactions.
 * @param enable Whether the drag interactions should be enabled.
 * @docs-private
 */
export function toggleNativeDragInteractions(element, enable) {
    const userSelect = enable ? '' : 'none';
    extendStyles(element.style, {
        touchAction: enable ? '' : 'none',
        webkitUserDrag: enable ? '' : 'none',
        webkitTapHighlightColor: enable ? '' : 'transparent',
        userSelect: userSelect,
        msUserSelect: userSelect,
        webkitUserSelect: userSelect,
        MozUserSelect: userSelect
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWVuY2Fwc3VsYXRlZC1jb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kcmFnL3NyYy9saWIvY29sdW1uLXJlc2l6ZS9jZGstZW5jYXBzdWxhdGVkLWNvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7OztJQU1JO0FBNkJKOzs7R0FHRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsSUFBb0MsRUFBRSxNQUF3QztJQUN6RyxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtRQUN0QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBR0Q7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsNEJBQTRCLENBQUMsT0FBb0IsRUFBRSxNQUFlO0lBQ2hGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFeEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDMUIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2pDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUNwQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYTtRQUNwRCxVQUFVLEVBQUUsVUFBVTtRQUN0QixZQUFZLEVBQUUsVUFBVTtRQUN4QixnQkFBZ0IsRUFBRSxVQUFVO1FBQzVCLGFBQWEsRUFBRSxVQUFVO0tBQzFCLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQ29kZSBmcm9tIGFuZ3VsYXIvbWF0ZXJpYWwyIHJlcG9zaXRvcnlcbiAqIEZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMi9ibG9iL21hc3Rlci9zcmMvY2RrL2RyYWctZHJvcC9kcmFnLXN0eWxpbmcudHNcbiAqIENvbW1pdDogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyL2Jsb2IvOWNkMzEzMjYwN2I0ZDVhZTI0MjI5MWRmNDFmYjAyZGM3YTQ1M2RhOC9zcmMvY2RrL2RyYWctZHJvcC9kcmFnLXN0eWxpbmcudHNcbiAqXG4gKiBUaGlzIGNvZGUgaXMgbm90IHB1YmxpYyBidXQgcmVxdWlyZWQgZm9yIHRoZSBkcmFnIHNvIGR1cGxpY2F0ZWQgaGVyZS5cbiAqKi9cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuLy8gSGVscGVyIHR5cGUgdGhhdCBpZ25vcmVzIGByZWFkb25seWAgcHJvcGVydGllcy4gVGhpcyBpcyB1c2VkIGluXG4vLyBgZXh0ZW5kU3R5bGVzYCB0byBpZ25vcmUgdGhlIHJlYWRvbmx5IHByb3BlcnRpZXMgb24gQ1NTU3R5bGVEZWNsYXJhdGlvblxuLy8gc2luY2Ugd2Ugd29uJ3QgYmUgdG91Y2hpbmcgdGhvc2UgYW55d2F5LlxudHlwZSBXcml0ZWFibGU8VD4gPSB7IC1yZWFkb25seSBbUCBpbiBrZXlvZiBUXS0/OiBUW1BdIH07XG5cbi8qKlxuICogRXh0ZW5kZWQgQ1NTU3R5bGVEZWNsYXJhdGlvbiB0aGF0IGluY2x1ZGVzIGEgY291cGxlIG9mIGRyYWctcmVsYXRlZFxuICogcHJvcGVydGllcyB0aGF0IGFyZW4ndCBpbiB0aGUgYnVpbHQtaW4gVFMgdHlwaW5ncy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbiBleHRlbmRzIENTU1N0eWxlRGVjbGFyYXRpb24ge1xuICB3ZWJraXRVc2VyRHJhZzogc3RyaW5nO1xuICBNb3pVc2VyU2VsZWN0OiBzdHJpbmc7IC8vIEZvciBzb21lIHJlYXNvbiB0aGUgRmlyZWZveCBwcm9wZXJ0eSBpcyBpbiBQYXNjYWxDYXNlLlxuICBtc1Njcm9sbFNuYXBUeXBlOiBzdHJpbmc7XG4gIHNjcm9sbFNuYXBUeXBlOiBzdHJpbmc7XG4gIG1zVXNlclNlbGVjdDogc3RyaW5nO1xuICB3ZWJraXRUYXBIaWdobGlnaHRDb2xvcjogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNoYWxsb3ctZXh0ZW5kcyBhIHN0eWxlc2hlZXQgb2JqZWN0IHdpdGggYW5vdGhlciBzdHlsZXNoZWV0IG9iamVjdC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZFN0eWxlcyhkZXN0OiBXcml0ZWFibGU8Q1NTU3R5bGVEZWNsYXJhdGlvbj4sIHNvdXJjZTogUGFydGlhbDxEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbj4pIHtcbiAgZm9yIChsZXQga2V5IGluIHNvdXJjZSkge1xuICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgZGVzdFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBkZXN0O1xufVxuXG5cbi8qKlxuICogVG9nZ2xlcyB3aGV0aGVyIHRoZSBuYXRpdmUgZHJhZyBpbnRlcmFjdGlvbnMgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIGFuIGVsZW1lbnQuXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IG9uIHdoaWNoIHRvIHRvZ2dsZSB0aGUgZHJhZyBpbnRlcmFjdGlvbnMuXG4gKiBAcGFyYW0gZW5hYmxlIFdoZXRoZXIgdGhlIGRyYWcgaW50ZXJhY3Rpb25zIHNob3VsZCBiZSBlbmFibGVkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhlbGVtZW50OiBIVE1MRWxlbWVudCwgZW5hYmxlOiBib29sZWFuKSB7XG4gIGNvbnN0IHVzZXJTZWxlY3QgPSBlbmFibGUgPyAnJyA6ICdub25lJztcblxuICBleHRlbmRTdHlsZXMoZWxlbWVudC5zdHlsZSwge1xuICAgIHRvdWNoQWN0aW9uOiBlbmFibGUgPyAnJyA6ICdub25lJyxcbiAgICB3ZWJraXRVc2VyRHJhZzogZW5hYmxlID8gJycgOiAnbm9uZScsXG4gICAgd2Via2l0VGFwSGlnaGxpZ2h0Q29sb3I6IGVuYWJsZSA/ICcnIDogJ3RyYW5zcGFyZW50JyxcbiAgICB1c2VyU2VsZWN0OiB1c2VyU2VsZWN0LFxuICAgIG1zVXNlclNlbGVjdDogdXNlclNlbGVjdCxcbiAgICB3ZWJraXRVc2VyU2VsZWN0OiB1c2VyU2VsZWN0LFxuICAgIE1velVzZXJTZWxlY3Q6IHVzZXJTZWxlY3RcbiAgfSk7XG59XG4iXX0=