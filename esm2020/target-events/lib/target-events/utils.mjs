export function isCellEvent(event) {
    return !!event.cellTarget;
}
export function isDataCellEvent(event) {
    return isCellEvent(event) && !!event.context;
}
/**
 * Returns true if the element is a row element (`pbl-ngrid-row`, `cdk-row`).
 *
 * This function works under the following assumptions:
 *
 *   - A row element MUST contain a "role" attribute with the value "row"
 */
export function isRowContainer(element) {
    return element.getAttribute('role') === 'row';
}
/**
 * Find the cell element that is or wraps the provided element.
 * The element can be a table cell element (any type of) OR a nested element (any level) of a table cell element.
 *
 * This function works under the following assumptions:
 *
 *   - The parent of a cell element is a row element.
 *   - Each row element MUST contain a "role" attribute with the value "row"
 */
export function findParentCell(element) {
    while (element.parentElement) {
        if (isRowContainer(element.parentElement)) {
            return element;
        }
        element = element.parentElement;
    }
}
/**
 * Returns the position (index) of the cell (element) among it's siblings.
 */
export function findCellRenderIndex(cell) {
    let colIndex = 0;
    while (cell = cell.previousElementSibling) {
        colIndex++;
    }
    return colIndex;
}
/**
 * Returns table metadata for a given ROW element.
 * This function works under the following assumptions:
 *
 *   - Each row element MUST contain a "role" attribute with the value "row"
 *   - Each row element MUST contains the type identifier attribute "data-rowtype" (except "data" rows)
 *   - Allowed values for "data-rowtype" are: 'header' | 'meta-header' | 'footer' | 'meta-footer' | 'data'
 *   - Row's representing data items (data-rowtype="data") can omit the type attribute and the function will infer it.
 *
 * NOTE that this function DOES NOT identify subType of `meta-group` (`PblNgridMatrixRow<'header' | 'footer', 'meta-group'>`), it will return it as
 * 'meta`, you need to handle this case specifically.
 *
 * Because detection is based on DOM element position finding the original row index when multiple row containers are set (fixed/style/row) will not work.
 * The rowIndex will be relative to the container, and not the entire table.
 */
export function matrixRowFromRow(row, vcRef) {
    const rowAttrType = row.getAttribute('data-rowtype') || 'data';
    // TODO: Error if rowAttrType is not one of the allowed values!
    let rowIndex = 0;
    switch (rowAttrType) {
        case 'data':
            const sourceRow = row;
            while (row.previousElementSibling) {
                rowIndex++;
                row = row.previousElementSibling;
            }
            rowIndex = Math.min(rowIndex, vcRef.length - 1);
            while (rowIndex > -1) {
                if (vcRef.get(rowIndex).rootNodes[0] === sourceRow) {
                    return {
                        type: 'data',
                        subType: 'data',
                        rowIndex,
                    };
                }
                rowIndex--;
            }
            return;
        case 'header':
        case 'footer':
            return {
                type: rowAttrType,
                subType: 'data',
                rowIndex,
            };
        default:
            while (row.previousElementSibling && row.previousElementSibling.getAttribute('data-rowtype') === rowAttrType) {
                rowIndex++;
                row = row.previousElementSibling;
            }
            return {
                type: rowAttrType === 'meta-footer' ? 'footer' : 'header',
                subType: 'meta',
                rowIndex,
            };
    }
}
/**
 * Given a list of cells stacked vertically (yAxis) and a list of cells stacked horizontally (xAxis) return all the cells inside (without the provided axis cells).
 *
 * In the following example, all [Yn] cells are provided in the yAxis param and all [Xn] cell in the xAxis params, the returned value will be an array
 * with all cells marked with Z.
 *    Y5  Z  Z  Z
 *    Y4  Z  Z  Z
 *    Y3  Z  Z  Z
 *    Y2  Z  Z  Z
 *    XY1 X2 X3 X4
 * @param contextApi
 * @param xAxis
 * @param yAxis
 */
export function getInnerCellsInRect(contextApi, xAxis, yAxis) {
    const spaceInside = [];
    for (const vCell of yAxis) {
        for (const hCell of xAxis) {
            const vhContext = contextApi.findRowInCache(vCell.rowIdent).cells[hCell.colIndex];
            if (vhContext) {
                spaceInside.push({ rowIdent: vCell.rowIdent, colIndex: hCell.colIndex });
            }
        }
    }
    return spaceInside;
}
export function rangeBetween(n1, n2) {
    const min = Math.min(n1, n2);
    const max = min === n1 ? n2 : n1;
    const result = [];
    for (let i = min + 1; i < max; i++) {
        result.push(i);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3RhcmdldC1ldmVudHMvc3JjL2xpYi90YXJnZXQtZXZlbnRzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE1BQU0sVUFBVSxXQUFXLENBQXVELEtBQXlEO0lBQ3pJLE9BQU8sQ0FBQyxDQUFFLEtBQStCLENBQUMsVUFBVSxDQUFDO0FBQ3ZELENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUF1RCxLQUF5RDtJQUM3SSxPQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUUsS0FBMkMsQ0FBQyxPQUFPLENBQUM7QUFDdEYsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQUMsT0FBb0I7SUFDakQsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUNoRCxDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLE9BQW9CO0lBQ2pELE9BQU8sT0FBTyxDQUFDLGFBQWEsRUFBRTtRQUM1QixJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDekMsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztLQUNqQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxJQUFhO0lBQy9DLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNqQixPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7UUFDekMsUUFBUSxFQUFFLENBQUM7S0FDWjtJQUNELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxHQUFZLEVBQ1osS0FBdUI7SUFDdEQsTUFBTSxXQUFXLEdBQWdCLEdBQUcsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFRLElBQUksTUFBTSxDQUFDO0lBRW5GLCtEQUErRDtJQUUvRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDakIsUUFBUSxXQUFXLEVBQUU7UUFDbkIsS0FBSyxNQUFNO1lBQ1QsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxDQUFDLHNCQUFzQixFQUFFO2dCQUNqQyxRQUFRLEVBQUUsQ0FBQztnQkFDWCxHQUFHLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDO2FBQ2xDO1lBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsT0FBTyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BCLElBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQTBCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDNUUsT0FBTzt3QkFDTCxJQUFJLEVBQUUsTUFBTTt3QkFDWixPQUFPLEVBQUUsTUFBTTt3QkFDZixRQUFRO3FCQUMyQyxDQUFDO2lCQUN2RDtnQkFDRCxRQUFRLEVBQUUsQ0FBQzthQUNaO1lBQ0QsT0FBTztRQUNULEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRO1lBQ1osT0FBTztnQkFDSixJQUFJLEVBQUUsV0FBVztnQkFDakIsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsUUFBUTthQUNpQyxDQUFDO1FBQzlDO1lBQ0UsT0FBTyxHQUFHLENBQUMsc0JBQXNCLElBQUksR0FBRyxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxXQUFXLEVBQUU7Z0JBQzVHLFFBQVEsRUFBRSxDQUFDO2dCQUNYLEdBQUcsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUM7YUFDbEM7WUFDRCxPQUFPO2dCQUNMLElBQUksRUFBRSxXQUFXLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQ3pELE9BQU8sRUFBRSxNQUFNO2dCQUNmLFFBQVE7YUFDeUMsQ0FBQztLQUN2RDtBQUNILENBQUM7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUFDLFVBQW1DLEVBQUUsS0FBc0IsRUFBRSxLQUFzQjtJQUNySCxNQUFNLFdBQVcsR0FBb0IsRUFBRyxDQUFDO0lBQ3pDLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFO1FBQ3pCLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEYsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUMxRTtTQUNGO0tBQ0Y7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxFQUFVLEVBQUUsRUFBVTtJQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3QixNQUFNLEdBQUcsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVqQyxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3Q29udGFpbmVyUmVmLCBFbWJlZGRlZFZpZXdSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBibE5ncmlkQ29udGV4dEFwaSwgR3JpZERhdGFQb2ludCwgR3JpZFJvd1R5cGUgfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibE5ncmlkTWF0cml4Um93LCBQYmxOZ3JpZFJvd0V2ZW50LCBQYmxOZ3JpZENlbGxFdmVudCwgUGJsTmdyaWREYXRhQ2VsbEV2ZW50IH0gZnJvbSAnLi9ldmVudHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDZWxsRXZlbnQ8VCwgVEV2ZW50IGV4dGVuZHMgRXZlbnQgPSBNb3VzZUV2ZW50IHwgS2V5Ym9hcmRFdmVudD4oZXZlbnQ6IFBibE5ncmlkUm93RXZlbnQ8VD4gfCBQYmxOZ3JpZENlbGxFdmVudDxULCBURXZlbnQ+KTogZXZlbnQgaXMgUGJsTmdyaWRDZWxsRXZlbnQ8VCwgVEV2ZW50PiB7XG4gIHJldHVybiAhIShldmVudCBhcyAgUGJsTmdyaWRDZWxsRXZlbnQ8VD4pLmNlbGxUYXJnZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFDZWxsRXZlbnQ8VCwgVEV2ZW50IGV4dGVuZHMgRXZlbnQgPSBNb3VzZUV2ZW50IHwgS2V5Ym9hcmRFdmVudD4oZXZlbnQ6IFBibE5ncmlkUm93RXZlbnQ8VD4gfCBQYmxOZ3JpZENlbGxFdmVudDxULCBURXZlbnQ+KTogZXZlbnQgaXMgUGJsTmdyaWREYXRhQ2VsbEV2ZW50PFQsIFRFdmVudD4ge1xuICByZXR1cm4gaXNDZWxsRXZlbnQoZXZlbnQpICYmICEhKGV2ZW50IGFzICBQYmxOZ3JpZERhdGFDZWxsRXZlbnQ8VCwgVEV2ZW50PikuY29udGV4dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgaXMgYSByb3cgZWxlbWVudCAoYHBibC1uZ3JpZC1yb3dgLCBgY2RrLXJvd2ApLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd29ya3MgdW5kZXIgdGhlIGZvbGxvd2luZyBhc3N1bXB0aW9uczpcbiAqXG4gKiAgIC0gQSByb3cgZWxlbWVudCBNVVNUIGNvbnRhaW4gYSBcInJvbGVcIiBhdHRyaWJ1dGUgd2l0aCB0aGUgdmFsdWUgXCJyb3dcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSb3dDb250YWluZXIoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdyb3cnO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlIGNlbGwgZWxlbWVudCB0aGF0IGlzIG9yIHdyYXBzIHRoZSBwcm92aWRlZCBlbGVtZW50LlxuICogVGhlIGVsZW1lbnQgY2FuIGJlIGEgdGFibGUgY2VsbCBlbGVtZW50IChhbnkgdHlwZSBvZikgT1IgYSBuZXN0ZWQgZWxlbWVudCAoYW55IGxldmVsKSBvZiBhIHRhYmxlIGNlbGwgZWxlbWVudC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdvcmtzIHVuZGVyIHRoZSBmb2xsb3dpbmcgYXNzdW1wdGlvbnM6XG4gKlxuICogICAtIFRoZSBwYXJlbnQgb2YgYSBjZWxsIGVsZW1lbnQgaXMgYSByb3cgZWxlbWVudC5cbiAqICAgLSBFYWNoIHJvdyBlbGVtZW50IE1VU1QgY29udGFpbiBhIFwicm9sZVwiIGF0dHJpYnV0ZSB3aXRoIHRoZSB2YWx1ZSBcInJvd1wiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUGFyZW50Q2VsbChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgd2hpbGUgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGlmIChpc1Jvd0NvbnRhaW5lcihlbGVtZW50LnBhcmVudEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG4gICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBvc2l0aW9uIChpbmRleCkgb2YgdGhlIGNlbGwgKGVsZW1lbnQpIGFtb25nIGl0J3Mgc2libGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQ2VsbFJlbmRlckluZGV4KGNlbGw6IEVsZW1lbnQpOiBudW1iZXIge1xuICBsZXQgY29sSW5kZXggPSAwO1xuICB3aGlsZSAoY2VsbCA9IGNlbGwucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgIGNvbEluZGV4Kys7XG4gIH1cbiAgcmV0dXJuIGNvbEluZGV4O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGFibGUgbWV0YWRhdGEgZm9yIGEgZ2l2ZW4gUk9XIGVsZW1lbnQuXG4gKiBUaGlzIGZ1bmN0aW9uIHdvcmtzIHVuZGVyIHRoZSBmb2xsb3dpbmcgYXNzdW1wdGlvbnM6XG4gKlxuICogICAtIEVhY2ggcm93IGVsZW1lbnQgTVVTVCBjb250YWluIGEgXCJyb2xlXCIgYXR0cmlidXRlIHdpdGggdGhlIHZhbHVlIFwicm93XCJcbiAqICAgLSBFYWNoIHJvdyBlbGVtZW50IE1VU1QgY29udGFpbnMgdGhlIHR5cGUgaWRlbnRpZmllciBhdHRyaWJ1dGUgXCJkYXRhLXJvd3R5cGVcIiAoZXhjZXB0IFwiZGF0YVwiIHJvd3MpXG4gKiAgIC0gQWxsb3dlZCB2YWx1ZXMgZm9yIFwiZGF0YS1yb3d0eXBlXCIgYXJlOiAnaGVhZGVyJyB8ICdtZXRhLWhlYWRlcicgfCAnZm9vdGVyJyB8ICdtZXRhLWZvb3RlcicgfCAnZGF0YSdcbiAqICAgLSBSb3cncyByZXByZXNlbnRpbmcgZGF0YSBpdGVtcyAoZGF0YS1yb3d0eXBlPVwiZGF0YVwiKSBjYW4gb21pdCB0aGUgdHlwZSBhdHRyaWJ1dGUgYW5kIHRoZSBmdW5jdGlvbiB3aWxsIGluZmVyIGl0LlxuICpcbiAqIE5PVEUgdGhhdCB0aGlzIGZ1bmN0aW9uIERPRVMgTk9UIGlkZW50aWZ5IHN1YlR5cGUgb2YgYG1ldGEtZ3JvdXBgIChgUGJsTmdyaWRNYXRyaXhSb3c8J2hlYWRlcicgfCAnZm9vdGVyJywgJ21ldGEtZ3JvdXAnPmApLCBpdCB3aWxsIHJldHVybiBpdCBhc1xuICogJ21ldGFgLCB5b3UgbmVlZCB0byBoYW5kbGUgdGhpcyBjYXNlIHNwZWNpZmljYWxseS5cbiAqXG4gKiBCZWNhdXNlIGRldGVjdGlvbiBpcyBiYXNlZCBvbiBET00gZWxlbWVudCBwb3NpdGlvbiBmaW5kaW5nIHRoZSBvcmlnaW5hbCByb3cgaW5kZXggd2hlbiBtdWx0aXBsZSByb3cgY29udGFpbmVycyBhcmUgc2V0IChmaXhlZC9zdHlsZS9yb3cpIHdpbGwgbm90IHdvcmsuXG4gKiBUaGUgcm93SW5kZXggd2lsbCBiZSByZWxhdGl2ZSB0byB0aGUgY29udGFpbmVyLCBhbmQgbm90IHRoZSBlbnRpcmUgdGFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXRyaXhSb3dGcm9tUm93KHJvdzogRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmKTogUGJsTmdyaWRNYXRyaXhSb3c8J2RhdGEnPiB8IFBibE5ncmlkTWF0cml4Um93PCdoZWFkZXInIHwgJ2Zvb3Rlcic+IHwgUGJsTmdyaWRNYXRyaXhSb3c8J2hlYWRlcicgfCAnZm9vdGVyJywgJ21ldGEnPiB8IHVuZGVmaW5lZCAge1xuICBjb25zdCByb3dBdHRyVHlwZTogR3JpZFJvd1R5cGUgPSByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLXJvd3R5cGUnKSBhcyBhbnkgfHwgJ2RhdGEnO1xuXG4gIC8vIFRPRE86IEVycm9yIGlmIHJvd0F0dHJUeXBlIGlzIG5vdCBvbmUgb2YgdGhlIGFsbG93ZWQgdmFsdWVzIVxuXG4gIGxldCByb3dJbmRleCA9IDA7XG4gIHN3aXRjaCAocm93QXR0clR5cGUpIHtcbiAgICBjYXNlICdkYXRhJzpcbiAgICAgIGNvbnN0IHNvdXJjZVJvdyA9IHJvdztcbiAgICAgIHdoaWxlIChyb3cucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgICByb3dJbmRleCsrO1xuICAgICAgICByb3cgPSByb3cucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgIH1cbiAgICAgIHJvd0luZGV4ID0gTWF0aC5taW4ocm93SW5kZXgsIHZjUmVmLmxlbmd0aCAtIDEpO1xuICAgICAgd2hpbGUgKHJvd0luZGV4ID4gLTEpIHtcbiAgICAgICAgaWYgKCh2Y1JlZi5nZXQocm93SW5kZXgpIGFzIEVtYmVkZGVkVmlld1JlZjxhbnk+KS5yb290Tm9kZXNbMF0gPT09IHNvdXJjZVJvdykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnZGF0YScsXG4gICAgICAgICAgICBzdWJUeXBlOiAnZGF0YScsXG4gICAgICAgICAgICByb3dJbmRleCxcbiAgICAgICAgICB9IGFzIHsgcm93SW5kZXg6IG51bWJlciB9ICYgUGJsTmdyaWRNYXRyaXhSb3c8J2RhdGEnPjtcbiAgICAgICAgfVxuICAgICAgICByb3dJbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgJ2hlYWRlcic6XG4gICAgY2FzZSAnZm9vdGVyJzpcbiAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogcm93QXR0clR5cGUsXG4gICAgICAgIHN1YlR5cGU6ICdkYXRhJyxcbiAgICAgICAgcm93SW5kZXgsXG4gICAgICB9IGFzIFBibE5ncmlkTWF0cml4Um93PCdoZWFkZXInIHwgJ2Zvb3Rlcic+O1xuICAgIGRlZmF1bHQ6XG4gICAgICB3aGlsZSAocm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgJiYgcm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcuZ2V0QXR0cmlidXRlKCdkYXRhLXJvd3R5cGUnKSA9PT0gcm93QXR0clR5cGUpIHtcbiAgICAgICAgcm93SW5kZXgrKztcbiAgICAgICAgcm93ID0gcm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiByb3dBdHRyVHlwZSA9PT0gJ21ldGEtZm9vdGVyJyA/ICdmb290ZXInIDogJ2hlYWRlcicsXG4gICAgICAgIHN1YlR5cGU6ICdtZXRhJyxcbiAgICAgICAgcm93SW5kZXgsXG4gICAgICB9IGFzIFBibE5ncmlkTWF0cml4Um93PCdoZWFkZXInIHwgJ2Zvb3RlcicsICdtZXRhJz47XG4gIH1cbn1cblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY2VsbHMgc3RhY2tlZCB2ZXJ0aWNhbGx5ICh5QXhpcykgYW5kIGEgbGlzdCBvZiBjZWxscyBzdGFja2VkIGhvcml6b250YWxseSAoeEF4aXMpIHJldHVybiBhbGwgdGhlIGNlbGxzIGluc2lkZSAod2l0aG91dCB0aGUgcHJvdmlkZWQgYXhpcyBjZWxscykuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCBhbGwgW1luXSBjZWxscyBhcmUgcHJvdmlkZWQgaW4gdGhlIHlBeGlzIHBhcmFtIGFuZCBhbGwgW1huXSBjZWxsIGluIHRoZSB4QXhpcyBwYXJhbXMsIHRoZSByZXR1cm5lZCB2YWx1ZSB3aWxsIGJlIGFuIGFycmF5XG4gKiB3aXRoIGFsbCBjZWxscyBtYXJrZWQgd2l0aCBaLlxuICogICAgWTUgIFogIFogIFpcbiAqICAgIFk0ICBaICBaICBaXG4gKiAgICBZMyAgWiAgWiAgWlxuICogICAgWTIgIFogIFogIFpcbiAqICAgIFhZMSBYMiBYMyBYNFxuICogQHBhcmFtIGNvbnRleHRBcGlcbiAqIEBwYXJhbSB4QXhpc1xuICogQHBhcmFtIHlBeGlzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbm5lckNlbGxzSW5SZWN0KGNvbnRleHRBcGk6IFBibE5ncmlkQ29udGV4dEFwaTxhbnk+LCB4QXhpczogR3JpZERhdGFQb2ludFtdLCB5QXhpczogR3JpZERhdGFQb2ludFtdKTogR3JpZERhdGFQb2ludFtdIHtcbiAgY29uc3Qgc3BhY2VJbnNpZGU6IEdyaWREYXRhUG9pbnRbXSA9IFsgXTtcbiAgZm9yIChjb25zdCB2Q2VsbCBvZiB5QXhpcykge1xuICAgIGZvciAoY29uc3QgaENlbGwgb2YgeEF4aXMpIHtcbiAgICAgIGNvbnN0IHZoQ29udGV4dCA9IGNvbnRleHRBcGkuZmluZFJvd0luQ2FjaGUodkNlbGwucm93SWRlbnQpLmNlbGxzW2hDZWxsLmNvbEluZGV4XTtcbiAgICAgIGlmICh2aENvbnRleHQpIHtcbiAgICAgICAgc3BhY2VJbnNpZGUucHVzaCh7IHJvd0lkZW50OiB2Q2VsbC5yb3dJZGVudCwgY29sSW5kZXg6IGhDZWxsLmNvbEluZGV4IH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3BhY2VJbnNpZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5nZUJldHdlZW4objE6IG51bWJlciwgbjI6IG51bWJlcik6IG51bWJlcltdIHtcbiAgY29uc3QgbWluID0gTWF0aC5taW4objEsIG4yKTtcbiAgY29uc3QgbWF4ID0gbWluID09PSBuMSA/IG4yIDogbjE7XG5cbiAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gbWluICsgMTsgaSA8IG1heDsgaSsrKSB7XG4gICAgcmVzdWx0LnB1c2goaSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==