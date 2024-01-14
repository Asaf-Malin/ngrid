import { Fragment } from './fragment';
export declare enum IntersectionType {
    /** No intersection between "source" and "target" */
    none = 0,
    /** "source" and "target" are equal */
    full = 1,
    /** "target" contains the entire "source" */
    contained = 2,
    /** "source" contains the entire "target" */
    contains = 3,
    /** A portion from the "source" is not intersected with the "target" */
    partial = 4
}
export declare function intersect(f1: Fragment, f2: Fragment): Fragment | null;
export declare function findIntersectionType(source: Fragment, target: Fragment, intersection?: ReturnType<typeof intersect>): IntersectionType;
