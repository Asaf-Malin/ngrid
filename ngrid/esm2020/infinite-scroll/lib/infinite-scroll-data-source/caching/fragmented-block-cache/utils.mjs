import { Fragment } from './fragment';
export var IntersectionType;
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
export function intersect(f1, f2) {
    const min = f1.start < f2.start ? f1 : f2;
    const max = min === f1 ? f2 : f1;
    return min.end < max.start
        ? null
        : new Fragment(max.start, min.end < max.end ? min.end : max.end);
}
export function findIntersectionType(source, target, intersection) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2luZmluaXRlLXNjcm9sbC9zcmMvbGliL2luZmluaXRlLXNjcm9sbC1kYXRhLXNvdXJjZS9jYWNoaW5nL2ZyYWdtZW50ZWQtYmxvY2stY2FjaGUvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUV0QyxNQUFNLENBQU4sSUFBWSxnQkFXWDtBQVhELFdBQVksZ0JBQWdCO0lBQzFCLG9EQUFvRDtJQUNwRCx1REFBSSxDQUFBO0lBQ0osc0NBQXNDO0lBQ3RDLHVEQUFJLENBQUE7SUFDSiw0Q0FBNEM7SUFDNUMsaUVBQVMsQ0FBQTtJQUNULDRDQUE0QztJQUM1QywrREFBUSxDQUFBO0lBQ1IsdUVBQXVFO0lBQ3ZFLDZEQUFPLENBQUE7QUFDVCxDQUFDLEVBWFcsZ0JBQWdCLEtBQWhCLGdCQUFnQixRQVczQjtBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsRUFBWSxFQUFFLEVBQVk7SUFDbEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMxQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNqQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUs7UUFDeEIsQ0FBQyxDQUFDLElBQUk7UUFDTixDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLE1BQWdCLEVBQUUsTUFBZ0IsRUFBRSxZQUEyQztJQUNsSCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDekIsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7S0FDOUI7SUFFRCxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7UUFDOUIsWUFBWSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUM7SUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0tBQzlCO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxDQUFDO0tBQ25DO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsUUFBUSxDQUFDO0tBQ2xDO0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZyYWdtZW50IH0gZnJvbSAnLi9mcmFnbWVudCc7XG5cbmV4cG9ydCBlbnVtIEludGVyc2VjdGlvblR5cGUge1xuICAvKiogTm8gaW50ZXJzZWN0aW9uIGJldHdlZW4gXCJzb3VyY2VcIiBhbmQgXCJ0YXJnZXRcIiAqL1xuICBub25lLFxuICAvKiogXCJzb3VyY2VcIiBhbmQgXCJ0YXJnZXRcIiBhcmUgZXF1YWwgKi9cbiAgZnVsbCxcbiAgLyoqIFwidGFyZ2V0XCIgY29udGFpbnMgdGhlIGVudGlyZSBcInNvdXJjZVwiICovXG4gIGNvbnRhaW5lZCxcbiAgLyoqIFwic291cmNlXCIgY29udGFpbnMgdGhlIGVudGlyZSBcInRhcmdldFwiICovXG4gIGNvbnRhaW5zLFxuICAvKiogQSBwb3J0aW9uIGZyb20gdGhlIFwic291cmNlXCIgaXMgbm90IGludGVyc2VjdGVkIHdpdGggdGhlIFwidGFyZ2V0XCIgKi9cbiAgcGFydGlhbCxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdChmMTogRnJhZ21lbnQsIGYyOiBGcmFnbWVudCk6IEZyYWdtZW50IHwgbnVsbCB7XG4gIGNvbnN0IG1pbiA9IGYxLnN0YXJ0IDwgZjIuc3RhcnQgPyBmMSA6IGYyO1xuICBjb25zdCBtYXggPSBtaW4gPT09IGYxID8gZjIgOiBmMTtcbiAgcmV0dXJuIG1pbi5lbmQgPCBtYXguc3RhcnRcbiAgICA/IG51bGxcbiAgICA6IG5ldyBGcmFnbWVudChtYXguc3RhcnQsIG1pbi5lbmQgPCBtYXguZW5kID8gbWluLmVuZCA6IG1heC5lbmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyc2VjdGlvblR5cGUoc291cmNlOiBGcmFnbWVudCwgdGFyZ2V0OiBGcmFnbWVudCwgaW50ZXJzZWN0aW9uPzogUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJzZWN0Pik6IEludGVyc2VjdGlvblR5cGUge1xuICBpZiAoc291cmNlLmVxdWFscyh0YXJnZXQpKSB7XG4gICAgcmV0dXJuIEludGVyc2VjdGlvblR5cGUuZnVsbDtcbiAgfVxuXG4gIGlmIChpbnRlcnNlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgIGludGVyc2VjdGlvbiA9IGludGVyc2VjdChzb3VyY2UsIHRhcmdldCk7XG4gIH1cblxuICBpZiAoIWludGVyc2VjdGlvbikge1xuICAgIHJldHVybiBJbnRlcnNlY3Rpb25UeXBlLm5vbmU7XG4gIH1cblxuICBpZiAoc291cmNlLmVxdWFscyhpbnRlcnNlY3Rpb24pKSB7XG4gICAgcmV0dXJuIEludGVyc2VjdGlvblR5cGUuY29udGFpbmVkO1xuICB9XG5cbiAgaWYgKHRhcmdldC5lcXVhbHMoaW50ZXJzZWN0aW9uKSkge1xuICAgIHJldHVybiBJbnRlcnNlY3Rpb25UeXBlLmNvbnRhaW5zO1xuICB9XG5cbiAgcmV0dXJuIEludGVyc2VjdGlvblR5cGUucGFydGlhbDtcbn1cbiJdfQ==