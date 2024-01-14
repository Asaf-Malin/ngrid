import { PblColumnDefinition } from '../models/column';
/**
 * Given an object (item) and a path, returns the value at the path
 */
export declare function deepPathGet(item: any, col: PblColumnDefinition): any;
/**
 * Given an object (item) and a path, returns the value at the path
 */
export declare function deepPathSet(item: any, col: PblColumnDefinition, value: any): void;
export declare function getValue<T = any>(col: PblColumnDefinition, row: any): T;
